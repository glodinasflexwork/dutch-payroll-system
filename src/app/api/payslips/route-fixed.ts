/**
 * Refactored Payslips API Route
 * Future-proof implementation with proper separation of concerns
 */

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
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
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)
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

// Validate session and return user context
async function validateSession() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized: No valid session')
  }

  return session
}

// Get employee with retry logic and multiple lookup strategies
async function getEmployeeWithRetry(companyId: string, employeeId: string) {
  return await withRetry(async () => {
    console.log('🔍 Looking up employee in HR database')
    console.log('🔍 Searching for employeeId:', employeeId)
    
    // First try by ID (direct match)
    let employee = await hrClient.employee.findFirst({
      where: {
        id: employeeId,
        companyId: companyId,
        isActive: true
      }
    })
    
    // If not found by ID, try by employeeNumber (fallback for payroll records)
    if (!employee) {
      console.log('🔍 Employee not found by ID, trying by employeeNumber')
      employee = await hrClient.employee.findFirst({
        where: {
          employeeNumber: employeeId,
          companyId: companyId,
          isActive: true
        }
      })
    }

    // If still not found, try partial matches
    if (!employee) {
      console.log('🔍 Employee not found by employeeNumber, trying partial matches')
      const employees = await hrClient.employee.findMany({
        where: {
          companyId: companyId,
          isActive: true,
          OR: [
            { id: { contains: employeeId } },
            { employeeNumber: { contains: employeeId } }
          ]
        },
        take: 1
      })
      
      if (employees.length > 0) {
        employee = employees[0]
        console.log('✅ Found employee via partial match:', employee.firstName, employee.lastName)
      }
    }

    if (!employee) {
      // Log available employees for debugging
      const availableEmployees = await hrClient.employee.findMany({
        where: {
          companyId: companyId,
          isActive: true
        },
        take: 5
      })
      console.log('📋 Available employees in HR database:', availableEmployees.map(e => ({
        id: e.id,
        employeeNumber: e.employeeNumber,
        name: `${e.firstName} ${e.lastName}`
      })))
      
      return null
    }

    console.log('✅ Employee found:', employee.firstName, employee.lastName)
    return employee
  }, { maxRetries: 2, baseDelay: 500 })
}

// Handle request context errors consistently
function handleRequestContextError(error: any) {
  if (error.message.includes('Company resolution failed')) {
    return {
      error: "Company access denied",
      statusCode: 403
    }
  }

  if (error.message.includes('Employee not found')) {
    return {
      error: "Employee not found",
      statusCode: 404
    }
  }

  console.error('Request context error:', error)
  return {
    error: "Internal server error",
    statusCode: 500
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
    
    // Use Universal Company Resolution Service
    const resolution = await resolveCompanyFromSession(session)

    if (!resolution.success) {
      throw new Error(`Company resolution failed: ${resolution.error}`)
    }

    const company = resolution.company!
    const companyId = company.id

    console.log(`✅ Successfully resolved context for: ${company.name}`)

    // Get employee data
    const employee = await getEmployeeWithRetry(companyId, validatedParams.employeeId)
    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      )
    }

    console.log(`✅ Found employee: ${employee.firstName} ${employee.lastName}`)

    // Find payroll record
    const payrollRecord = await findPayrollRecord(companyId, validatedParams.employeeId, validatedParams.year, validatedParams.month)
    if (!payrollRecord) {
      return NextResponse.json(
        { error: "Please process payroll for this period first before downloading the payslip" },
        { status: 404 }
      )
    }

    // Calculate payroll data
    const payrollData = calculatePayrollFromRecord(company, employee, payrollRecord, validatedParams.year, validatedParams.month)

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

    // Use Universal Company Resolution Service
    const resolution = await resolveCompanyFromSession(session)

    if (!resolution.success) {
      throw new Error(`Company resolution failed: ${resolution.error}`)
    }

    const company = resolution.company!
    const companyId = company.id

    console.log(`✅ Successfully resolved context for: ${company.name}`)

    // Get employee data
    const employee = await getEmployeeWithRetry(companyId, validatedData.employeeId)
    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      )
    }

    console.log(`✅ Found employee: ${employee.firstName} ${employee.lastName}`)

    // Find payroll record
    const payrollRecord = await findPayrollRecord(companyId, validatedData.employeeId, validatedData.year, validatedData.month)
    if (!payrollRecord) {
      return NextResponse.json(
        { error: "Payroll record not found for this period" },
        { status: 404 }
      )
    }

    // Calculate payroll data
    const payrollData = calculatePayrollFromRecord(company, employee, payrollRecord, validatedData.year, validatedData.month)

    // Generate and save payslip
    const payslipPath = await generateAndSavePayslip(employee, payrollData, validatedData.year, validatedData.month)

    // Create or update payslip generation record
    await createPayslipRecord(payrollRecord.id, payslipPath)

    return NextResponse.json({
      success: true,
      message: "Payslip generated successfully",
      payslipPath,
      employee: `${employee.firstName} ${employee.lastName}`,
      period: `${validatedData.year}-${String(validatedData.month).padStart(2, '0')}`
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
async function findPayrollRecord(companyId: string, employeeId: string, year: number, month: number) {
  return await withRetry(async () => {
    console.log('🔍 Looking up payroll record')
    
    return await payrollClient.payrollRecord.findFirst({
      where: {
        companyId: companyId,
        employeeId: employeeId,
        year: year,
        month: month
      },
      orderBy: { createdAt: 'desc' }
    })
  }, { maxRetries: 2, baseDelay: 500 })
}

/**
 * Calculate payroll data from record
 */
function calculatePayrollFromRecord(company: any, employee: any, payrollRecord: any, year: number, month: number) {
  // Use existing payroll calculation logic
  const employeeData: EmployeeData = {
    grossMonthlySalary: employee.grossSalary || 3500,
    taxTable: employee.taxTable || 'table1',
    age: calculateAge(employee.startDate),
    hasAOW: false,
    holidayAllowanceRate: 0.08
  }

  const companyData: CompanyData = {
    size: 'medium',
    sector: 'technology',
    awfRate: 'low',
    aofRate: 'low'
  }

  const payrollResult = calculateDutchPayroll(employeeData, companyData)

  return {
    Company: {
      name: company.name,
      address: company.address || '',
      city: company.city || '',
      postalCode: company.postalCode || '',
      kvkNumber: company.kvkNumber || '',
      taxNumber: company.taxNumber || ''
    },
    Employee: {
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeNumber: employee.employeeNumber || '',
      position: employee.position || '',
      department: employee.department || '',
      bsn: employee.bsn,
      startDate: employee.startDate,
      employmentType: employee.employmentType,
      taxTable: employee.taxTable
    },
    Payroll: {
      period: `${year}-${String(month).padStart(2, '0')}`,
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
async function generateAndSavePayslip(employee: any, payrollData: any, year: number, month: number): Promise<string> {
  const payslipHtml = await generatePayslipHTML(payrollData)
  
  // Create payslips directory if it doesn't exist
  const payslipsDir = path.join(process.cwd(), 'payslips')
  await mkdir(payslipsDir, { recursive: true })
  
  // Generate filename
  const filename = `payslip_${employee.employeeNumber || employee.id}_${year}_${String(month).padStart(2, '0')}.html`
  const payslipPath = path.join(payslipsDir, filename)
  
  // Save file
  await writeFile(payslipPath, payslipHtml, 'utf8')
  console.log('💾 Payslip saved to:', payslipPath)
  
  return payslipPath
}

/**
 * Create payslip generation record
 */
async function createPayslipRecord(payrollRecordId: string, payslipPath: string) {
  return await withRetry(async () => {
    return await payrollClient.payslipGeneration.upsert({
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

