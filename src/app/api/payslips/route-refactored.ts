/**
 * Refactored Payslips API Route
 * Future-proof implementation with proper import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { payrollClient, hrClient, checkDatabaseConnections } from "@/lib/database-clients"
import { withRetry, handleDatabaseError } from "@/lib/database-retry"
import { 
  resolveCompanyFromSession, 
  handleCompanyResolutionError 
} from "@/lib/universal-company-resolver"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { calculateDutchPayroll, type EmployeeData, type CompanyData } from "@/lib/payroll-calculations"
import { generatePayslipHTML } from "@/lib/payslip-generator"
import * as fs from 'fs'
import * as path from 'path'
import { promisify } from 'util'e = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

// Validation schemas
const payslipSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
})

const querySchema = z.object({
  employeeId: z.string().min(1),
  month: z.string().transform(Number),
  year: z.string().transform(Number),
})

// Health check endpoint - GET /api/payslips (without parameters)
async function handleHealthCheck(): Promise<NextResponse> {
  try {
    console.log('🏥 Payslips API health check initiated')
    
    const dbHealth = await checkDatabaseConnections()
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      api: 'payslips',
      version: '3.0.0',
      databases: {
        auth: dbHealth.auth ? 'connected' : 'disconnected',
        hr: dbHealth.hr ? 'connected' : 'disconnected', 
        payroll: dbHealth.payroll ? 'connected' : 'disconnected'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL,
        isServerless: !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
      }
    }
    
    console.log('✅ Payslips API health check completed:', healthStatus)
    return NextResponse.json(healthStatus)
  } catch (error) {
    console.error('❌ Payslips API health check failed:', error)
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

// GET /api/payslips - Generate HTML payslip for viewing
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Payslip generation request initiated')
    
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const rawParams = {
      employeeId: searchParams.get('employeeId'),
      month: searchParams.get('month'),
      year: searchParams.get('year'),
    }

    // Health check if no parameters
    if (!rawParams.employeeId && !rawParams.month && !rawParams.year) {
      return handleHealthCheck()
    }

    // Validate parameters
    const validatedParams = querySchema.parse(rawParams)
    console.log('📋 Validated payslip request:', validatedParams)

    // Validate session and get context
    const session = await validateSession()
    const context = await getPayrollRequestContext(
      session,
      validatedParams.employeeId,
      validatedParams.year,
      validatedParams.month
    )

    // Validate payroll context
    const validation = validatePayrollContext(context.payrollContext)
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid payroll context", details: validation.errors },
        { status: 400 }
      )
    }

    console.log(`✅ Successfully resolved context for: ${context.company.name} - ${context.employee?.firstName} ${context.employee?.lastName}`)

    // Find payroll record
    const payrollRecord = await findPayrollRecord(context)
    if (!payrollRecord) {
      return NextResponse.json(
        { error: "Please process payroll for this period first before downloading the payslip" },
        { status: 404 }
      )
    }

    // Calculate payroll data
    const payrollData = calculatePayrollFromContext(context.payrollContext, payrollRecord)

    // Generate payslip HTML
    const payslipHtml = await generatePayslipHTML(payrollData)

    // Return HTML response
    return new NextResponse(payslipHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })

  } catch (error) {
    console.error("Error generating payslip:", error)
    
    const errorResponse = handleRequestContextError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

// POST /api/payslips - Generate PDF payslip
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 PDF Payslip generation request initiated')
    
    // Validate session
    const session = await validateSession()

    // Parse and validate request body
    const body = await request.json()
    const validatedData = payslipSchema.parse(body)
    console.log('📋 Validated payslip request:', validatedData)

    // Get request context
    const context = await getPayrollRequestContext(
      session,
      validatedData.employeeId,
      validatedData.year,
      validatedData.month
    )

    // Validate payroll context
    const validation = validatePayrollContext(context.payrollContext)
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid payroll context", details: validation.errors },
        { status: 400 }
      )
    }

    console.log(`✅ Successfully resolved context for: ${context.company.name} - ${context.employee?.firstName} ${context.employee?.lastName}`)

    // Find payroll record
    const payrollRecord = await findPayrollRecord(context)
    if (!payrollRecord) {
      return NextResponse.json(
        { error: "Payroll record not found for this period" },
        { status: 404 }
      )
    }

    // Calculate payroll data
    const payrollData = calculatePayrollFromContext(context.payrollContext, payrollRecord)

    // Generate and save payslip
    const payslipPath = await generateAndSavePayslip(context, payrollData)

    // Create or update payslip generation record
    await createPayslipRecord(context, payrollRecord.id, payslipPath)

    return NextResponse.json({
      success: true,
      message: "Payslip generated successfully",
      payslipPath,
      employee: `${context.employee?.firstName} ${context.employee?.lastName}`,
      period: `${context.period.year}-${String(context.period.month).padStart(2, '0')}`
    })

  } catch (error) {
    console.error("Error generating PDF payslip:", error)
    
    const errorResponse = handleRequestContextError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

/**
 * Find payroll record for the given context
 */
async function findPayrollRecord(context: any) {
  return await withRetry(async () => {
    console.log('🔍 Looking up payroll record')
    
    return await getPayrollClient().payrollRecord.findFirst({
      where: {
        companyId: context.companyId,
        employeeId: context.employeeId,
        year: context.period.year,
        month: context.period.month
      },
      orderBy: { createdAt: 'desc' }
    })
  }, { maxRetries: 2, baseDelay: 500 })
}

/**
 * Calculate payroll data from context and record
 */
function calculatePayrollFromContext(payrollContext: PayrollContext, payrollRecord: any) {
  const { company, employee, config } = payrollContext

  // Use configuration-driven approach
  const employeeData: EmployeeData = {
    grossMonthlySalary: employee.grossSalary || config.defaultGrossSalary,
    taxTable: employee.taxTable || config.taxSettings.defaultTaxTable,
    age: calculateAge(employee.startDate),
    hasAOW: false,
    holidayAllowanceRate: config.holidayAllowanceRate
  }

  const companyData: CompanyData = {
    size: config.companySize,
    sector: config.sector,
    awfRate: config.awfRate,
    aofRate: config.aofRate
  }

  const payrollResult = calculateDutchPayroll(employeeData, companyData)

  return {
    Company: {
      name: company.name,
      address: company.address,
      city: company.city,
      postalCode: company.postalCode,
      kvkNumber: company.kvkNumber,
      taxNumber: company.taxNumber
    },
    Employee: {
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeNumber: employee.employeeNumber,
      position: employee.position,
      department: employee.department,
      bsn: employee.bsn,
      startDate: employee.startDate,
      employmentType: employee.employmentType,
      taxTable: employee.taxTable
    },
    Payroll: {
      period: `${payrollContext.period.year}-${String(payrollContext.period.month).padStart(2, '0')}`,
      grossPay: payrollResult.grossMonthlySalary,
      holidayAllowance: payrollResult.holidayAllowanceGross / 12,
      loonheffing: payrollResult.totalEmployeeContributions / 12,
      netPay: payrollResult.netMonthlySalary,
      aowContribution: payrollResult.aowContribution / 12,
      wlzContribution: payrollResult.wlzContribution / 12,
      zvwContribution: payrollResult.zvwContribution / 12
    }
  }
}

/**
 * Generate and save payslip file
 */
async function generateAndSavePayslip(context: any, payrollData: any): Promise<string> {
  const payslipHtml = await generatePayslipHTML(payrollData)
  
  // Create payslips directory if it doesn't exist
  const payslipsDir = path.join(process.cwd(), 'payslips')
  await mkdir(payslipsDir, { recursive: true })
  
  // Generate filename
  const filename = `payslip_${context.employee?.employeeNumber || context.employeeId}_${context.period.year}_${String(context.period.month).padStart(2, '0')}.html`
  const payslipPath = path.join(payslipsDir, filename)
  
  // Save file
  await writeFile(payslipPath, payslipHtml, 'utf8')
  console.log('💾 Payslip saved to:', payslipPath)
  
  return payslipPath
}

/**
 * Create payslip generation record
 */
async function createPayslipRecord(context: any, payrollRecordId: string, payslipPath: string) {
  return await withRetry(async () => {
    return await getPayrollClient().payslipGeneration.upsert({
      where: {
        payrollRecordId: payrollRecordId
      },
      update: {
        filePath: payslipPath,
        generatedAt: new Date()
      },
      create: {
        payrollRecordId: payrollRecordId,
        filePath: payslipPath,
        generatedAt: new Date()
      }
    })
  }, { maxRetries: 2, baseDelay: 500 })
}

/**
 * Calculate age from start date (simplified)
 */
function calculateAge(startDate: Date): number {
  const today = new Date()
  const birthYear = startDate.getFullYear()
  const currentYear = today.getFullYear()
  return Math.max(25, currentYear - birthYear) // Default to 25 if calculation seems wrong
}

