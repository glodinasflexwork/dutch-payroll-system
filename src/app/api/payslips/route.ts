import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { payrollClient, hrClient, checkDatabaseConnections } from "@/lib/database-clients"
import { withRetry, handleDatabaseError } from "@/lib/database-retry"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { calculateDutchPayroll, type EmployeeData, type CompanyData } from "@/lib/payroll-calculations"
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

// Validation schema for payslip generation
const payslipSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
})

// Health check endpoint - GET /api/payslips (without parameters)
async function handleHealthCheck(): Promise<NextResponse> {
  try {
    console.log('🏥 Payslips API health check initiated')
    
    // Check database connections
    const dbHealth = await checkDatabaseConnections()
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      api: 'payslips',
      version: '2.0.0',
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
    
    // If any database is down, return degraded status
    if (!dbHealth.auth || !dbHealth.hr || !dbHealth.payroll) {
      healthStatus.status = 'degraded'
      console.warn('⚠️ Some databases are not responding:', dbHealth.errors)
    } else {
      console.log('✅ All systems healthy')
    }
    
    return NextResponse.json(healthStatus, { 
      status: healthStatus.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'true'
      }
    })
  } catch (error) {
    console.error('❌ Health check failed:', error)
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}

// GET /api/payslips - Health check or generate payslip for an employee
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    // If no parameters provided, return health check
    if (!employeeId && !month && !year) {
      return await handleHealthCheck()
    }

    console.log('🚀 Payslip generation request initiated', { employeeId, month, year })

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!employeeId || !month || !year) {
      return NextResponse.json({ 
        error: "Missing required parameters: employeeId, month, year" 
      }, { status: 400 })
    }

    const validatedData = payslipSchema.parse({
      employeeId,
      month: parseInt(month),
      year: parseInt(year)
    })

    // Get employee information from HR database with retry logic
    const employee = await withRetry(async () => {
      console.log('🔍 Looking up employee in HR database')
      console.log('🔍 Searching for employeeId:', validatedData.employeeId)
      
      // First try by ID (direct match)
      let emp = await hrClient.employee.findFirst({
        where: {
          id: validatedData.employeeId,
          companyId: session.user.companyId,
          isActive: true
        }
      })
      
      // If not found by ID, try by employeeNumber (fallback for payroll records)
      if (!emp) {
        console.log('🔍 Employee not found by ID, trying by employeeNumber')
        emp = await hrClient.employee.findFirst({
          where: {
            employeeNumber: validatedData.employeeId,
            companyId: session.user.companyId,
            isActive: true
          }
        })
      }
      
      return emp
    }, { maxRetries: 2, baseDelay: 500 })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Get company information from HR database
    const company = await hrClient.company.findUnique({
      where: { id: session.user.companyId }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Find the matching payroll record first for performance optimization
    const payrollRecord = await payrollClient.payrollRecord.findFirst({
      where: {
        employeeId: validatedData.employeeId,
        companyId: session.user.companyId,
        year: validatedData.year,
        month: validatedData.month
      }
    })

    let grossPay, holidayAllowance, loonheffing, grossPayAfterContributions;
    let aowContribution, wlzContribution, zvwContribution;

    if (payrollRecord) {
      // ✅ PERFORMANCE OPTIMIZATION: Use existing payroll data instead of recalculating
      console.log(`🚀 Using cached payroll data for ${employee.firstName} ${employee.lastName} (${validatedData.month}/${validatedData.year})`)
      
      grossPay = payrollRecord.grossSalary
      holidayAllowance = payrollRecord.holidayAllowance
      grossPayAfterContributions = payrollRecord.netSalary
      
      // Use stored social security contributions
      const totalSocialSecurity = payrollRecord.socialSecurity
      loonheffing = totalSocialSecurity
      
      // Calculate individual components from stored data
      // Standard Dutch rates for display purposes
      aowContribution = grossPay * 0.1790 // 17.90% AOW
      wlzContribution = grossPay * 0.0965 // 9.65% WLZ  
      zvwContribution = grossPay * 0.0565 // 5.65% ZVW
      
    } else {
      // ⚠️ FALLBACK: Calculate if no payroll record exists (should be rare)
      console.log(`⚠️ No payroll record found, calculating from scratch for ${employee.firstName} ${employee.lastName} (${validatedData.month}/${validatedData.year})`)
      
      const employeeData: EmployeeData = {
        grossMonthlySalary: (employee.salary || 42000) / 12,
        dateOfBirth: employee.dateOfBirth,
        isDGA: false,
        taxTable: employee.taxTable === 'green' ? 'groen' : 'wit',
        taxCredit: 0,
        isYoungDisabled: false,
        hasMultipleJobs: false
      }

      const companyData: CompanyData = {
        size: 'medium',
        sector: company.sector || 'general',
        awfRate: 'low',
        aofRate: 'low'
      }

      const payrollResult = calculateDutchPayroll(employeeData, companyData)
      
      grossPay = payrollResult.grossMonthlySalary
      holidayAllowance = payrollResult.holidayAllowanceGross / 12
      loonheffing = payrollResult.totalEmployeeContributions / 12
      grossPayAfterContributions = payrollResult.netMonthlySalary
      aowContribution = payrollResult.aowContribution / 12
      wlzContribution = payrollResult.wlzContribution / 12
      zvwContribution = (payrollResult.grossAnnualSalary * 0.0565) / 12
    }

    // Create payslip data with corrected amounts
    const payslipData = {
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
      payPeriod: {
        month: validatedData.month,
        year: validatedData.year,
        monthName: new Date(validatedData.year, validatedData.month - 1).toLocaleDateString('nl-NL', { month: 'long' })
      },
      earnings: {
        baseSalary: Math.round(grossPay * 100) / 100,
        holidayAllowance: Math.round(holidayAllowance * 100) / 100,
        grossPay: Math.round(grossPay * 100) / 100,
        hoursWorked: 160 // Standard monthly hours
      },
      deductions: {
        // NO income tax in monthly payroll - handled annually
        // incomeTax (handled by tax advisors): 0,
        aowContribution: Math.round(aowContribution * 100) / 100,
        wlzContribution: Math.round(wlzContribution * 100) / 100,
        zvwContribution: Math.round(zvwContribution * 100) / 100,
        // WW and WIA are employer-paid, not employee deductions
        wwContribution: 0,
        wiaContribution: 0,
        totalDeductions: Math.round(loonheffing * 100) / 100
      },
      grossPayAfterContributions: Math.round(grossPayAfterContributions * 100) / 100,
      taxRates: {
        // Rates for reference only
        aowRate: 17.90,
        wlzRate: 9.65,
        zvwRate: 5.65,
        // WW and WIA are employer-paid
        wwRate: 0,
        wiaRate: 0
      },
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      payslip: payslipData
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error generating payslip:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/payslips - Generate PDF payslip
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 PDF Payslip generation request initiated')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = payslipSchema.parse(body)

    console.log('📋 Validated payslip request:', validatedData)

    // Get employee information from HR database with retry logic
    const employee = await withRetry(async () => {
      console.log('🔍 Looking up employee in HR database')
      console.log('🔍 Searching for employeeId:', validatedData.employeeId)
      
      // First try by ID (direct match)
      let emp = await hrClient.employee.findFirst({
        where: {
          id: validatedData.employeeId,
          companyId: session.user.companyId,
          isActive: true
        }
      })
      
      // If not found by ID, try by employeeNumber (fallback for payroll records)
      if (!emp) {
        console.log('🔍 Employee not found by ID, trying by employeeNumber')
        emp = await hrClient.employee.findFirst({
          where: {
            employeeNumber: validatedData.employeeId,
            companyId: session.user.companyId,
            isActive: true
          }
        })
      }
      
      return emp
    }, { maxRetries: 2, baseDelay: 500 })

    if (!employee) {
      console.error('❌ Employee not found:', validatedData.employeeId)
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    console.log('✅ Employee found:', employee.firstName, employee.lastName)

    // Get company information from HR database with retry logic
    const company = await withRetry(async () => {
      console.log('🏢 Looking up company in HR database')
      return await hrClient.company.findUnique({
        where: { id: session.user.companyId }
      })
    }, { maxRetries: 2, baseDelay: 500 })

    if (!company) {
      console.error('❌ Company not found:', session.user.companyId)
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Find the matching payroll record first for performance optimization
    const payrollRecord = await payrollClient.payrollRecord.findFirst({
      where: {
        employeeId: validatedData.employeeId,
        companyId: session.user.companyId,
        year: validatedData.year,
        month: validatedData.month
      }
    })

    let grossPay, holidayAllowance, loonheffing, grossPayAfterContributions;
    let aowContribution, wlzContribution, zvwContribution;

    if (payrollRecord) {
      // ✅ PERFORMANCE OPTIMIZATION: Use existing payroll data instead of recalculating
      console.log(`🚀 Using cached payroll data for ${employee.firstName} ${employee.lastName} (${validatedData.month}/${validatedData.year})`)
      
      grossPay = payrollRecord.grossSalary
      holidayAllowance = payrollRecord.holidayAllowance
      grossPayAfterContributions = payrollRecord.netSalary
      
      // Use stored social security contributions
      const totalSocialSecurity = payrollRecord.socialSecurity
      loonheffing = totalSocialSecurity
      
      // Calculate individual components from stored data
      // Standard Dutch rates for display purposes
      aowContribution = grossPay * 0.1790 // 17.90% AOW
      wlzContribution = grossPay * 0.0965 // 9.65% WLZ  
      zvwContribution = grossPay * 0.0565 // 5.65% ZVW
      
    } else {
      // ⚠️ FALLBACK: Calculate if no payroll record exists (should be rare)
      console.log(`⚠️ No payroll record found, calculating from scratch for ${employee.firstName} ${employee.lastName} (${validatedData.month}/${validatedData.year})`)
      
      const employeeData: EmployeeData = {
        grossMonthlySalary: (employee.salary || 42000) / 12,
        dateOfBirth: employee.dateOfBirth,
        isDGA: false,
        taxTable: employee.taxTable === 'green' ? 'groen' : 'wit',
        taxCredit: 0,
        isYoungDisabled: false,
        hasMultipleJobs: false
      }

      const companyData: CompanyData = {
        size: 'medium',
        sector: company.sector || 'general',
        awfRate: 'low',
        aofRate: 'low'
      }

      const payrollResult = calculateDutchPayroll(employeeData, companyData)
      
      grossPay = payrollResult.grossMonthlySalary
      holidayAllowance = payrollResult.holidayAllowanceGross / 12
      loonheffing = payrollResult.totalEmployeeContributions / 12
      grossPayAfterContributions = payrollResult.netMonthlySalary
      aowContribution = payrollResult.aowContribution / 12
      wlzContribution = payrollResult.wlzContribution / 12
      zvwContribution = (payrollResult.grossAnnualSalary * 0.0565) / 12
    }

    // Create payslip data with corrected amounts
    const payslipData = {
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
      payPeriod: {
        month: validatedData.month,
        year: validatedData.year,
        monthName: new Date(validatedData.year, validatedData.month - 1).toLocaleDateString('nl-NL', { month: 'long' })
      },
      earnings: {
        baseSalary: Math.round(grossPay * 100) / 100,
        holidayAllowance: Math.round(holidayAllowance * 100) / 100,
        grossPay: Math.round(grossPay * 100) / 100,
        hoursWorked: 160 // Standard monthly hours
      },
      deductions: {
        // NO income tax in monthly payroll - handled annually
        // incomeTax (handled by tax advisors): 0,
        aowContribution: Math.round(aowContribution * 100) / 100,
        wlzContribution: Math.round(wlzContribution * 100) / 100,
        zvwContribution: Math.round(zvwContribution * 100) / 100,
        // WW and WIA are employer-paid, not employee deductions
        wwContribution: 0,
        wiaContribution: 0,
        totalDeductions: Math.round(loonheffing * 100) / 100
      },
      grossPayAfterContributions: Math.round(grossPayAfterContributions * 100) / 100,
      taxRates: {
        // Rates for reference only
        aowRate: 17.90,
        wlzRate: 9.65,
        zvwRate: 5.65,
        // WW and WIA are employer-paid
        wwRate: 0,
        wiaRate: 0
      },
      generatedAt: new Date().toISOString()
    }

    // Generate HTML for PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Loonstrook ${payslipData.payPeriod.monthName} ${payslipData.payPeriod.year}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
            .company-info { margin-bottom: 20px; }
            .employee-info { background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .payslip-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .payslip-table th, .payslip-table td { padding: 12px; text-align: left; border-bottom: 1px solid #E2E8F0; }
            .payslip-table th { background: #F1F5F9; font-weight: bold; }
            .amount { text-align: right; font-weight: bold; }
            .total-row { background: #EEF2FF; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Loonstrook</h1>
            <div class="company-info">
                <strong>${payslipData.Company.name}</strong><br>
                ${payslipData.Company.address}<br>
                ${payslipData.Company.postalCode} ${payslipData.Company.city}<br>
                KvK: ${payslipData.Company.kvkNumber} | BTW: ${payslipData.Company.taxNumber}
            </div>
        </div>

        <div class="employee-info">
            <h3>Werknemergegevens</h3>
            <p><strong>Naam:</strong> ${payslipData.Employee.firstName} ${payslipData.Employee.lastName}</p>
            <p><strong>Personeelsnummer:</strong> ${payslipData.Employee.employeeNumber}</p>
            <p><strong>Functie:</strong> ${payslipData.Employee.position}</p>
            <p><strong>Periode:</strong> ${payslipData.payPeriod.monthName} ${payslipData.payPeriod.year}</p>
        </div>

        <table class="payslip-table">
            <thead>
                <tr>
                    <th>Omschrijving</th>
                    <th class="amount">Bedrag (€)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Bruto loon</td>
                    <td class="amount">${payslipData.earnings.grossPay.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Vakantietoeslag</td>
                    <td class="amount">${payslipData.earnings.holidayAllowance.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Totaal bruto</strong></td>
                    <td class="amount"><strong>${payslipData.earnings.grossPay.toFixed(2)}</strong></td>
                </tr>
                <tr>
                    <td>AOW-premie (${payslipData.taxRates.aowRate}%)</td>
                    <td class="amount">-${payslipData.deductions.aowContribution.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>WLZ-premie (${payslipData.taxRates.wlzRate}%)</td>
                    <td class="amount">-${payslipData.deductions.wlzContribution.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>ZVW-premie (${payslipData.taxRates.zvwRate}%)</td>
                    <td class="amount">-${payslipData.deductions.zvwContribution.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Totaal inhoudingen</strong></td>
                    <td class="amount"><strong>-${payslipData.deductions.totalDeductions.toFixed(2)}</strong></td>
                </tr>
                <tr class="total-row">
                    <td><strong>Netto uitbetaling</strong></td>
                    <td class="amount"><strong>${payslipData.grossPayAfterContributions.toFixed(2)}</strong></td>
                </tr>
            </tbody>
        </table>

        <div class="footer">
            <p><strong>Toelichting:</strong></p>
            <p><em>Loonheffing bevat: AOW (${payslipData.taxRates.aowRate}%), WLZ (${payslipData.taxRates.wlzRate}%), ZVW (${payslipData.taxRates.zvwRate}%)</em><br>
            <em>Inkomstenbelasting wordt jaarlijks afgerekend via de boekhoudingsoftware</em></p>
            <p>Gegenereerd op: ${new Date(payslipData.generatedAt).toLocaleDateString('nl-NL')}</p>
        </div>
    </body>
    </html>
    `

    // 🚀 ENHANCED SERVERLESS SOLUTION: Direct content delivery with fallback file storage
    const isProduction = process.env.NODE_ENV === 'production'
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    
    const fileName = `payslip-${employee.employeeNumber || employee.id}-${validatedData.year}-${validatedData.month.toString().padStart(2, '0')}.html`
    
    console.log('🚀 Generating payslip with enhanced serverless compatibility')
    
    // Create PayslipGeneration record with retry logic
    const payslipRecord = await withRetry(async () => {
      return await payrollClient.payslipGeneration.create({
        data: {
          ...(payrollRecord?.id && { payrollRecordId: payrollRecord.id }),
          employeeId: validatedData.employeeId,
          fileName: fileName,
          filePath: `/payslips/${fileName}`,
          status: 'generated',
          generatedAt: new Date(),
          companyId: session.user.companyId
        }
      })
    }, { maxRetries: 2, baseDelay: 300 })

    console.log('✅ PayslipGeneration record created successfully')

    // 🎯 SERVERLESS-OPTIMIZED RESPONSE: Return HTML content directly
    if (isServerless || isProduction) {
      console.log('🌐 Serverless environment detected - returning direct HTML content')
      
      // Store content in temporary directory as backup (non-blocking)
      const saveToTemp = async () => {
        try {
          const payslipsDir = path.join('/tmp', 'payslips')
          await mkdir(payslipsDir, { recursive: true })
          const filePath = path.join(payslipsDir, fileName)
          await writeFile(filePath, htmlContent, 'utf8')
          console.log('💾 Backup saved to temporary directory:', filePath)
        } catch (error) {
          console.log('⚠️ Backup save failed (non-critical):', error)
        }
      }
      
      // Save backup asynchronously (don't wait for it)
      saveToTemp()
      
      // Return HTML content directly in response for immediate display
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="${fileName}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Payslip-Generated': 'true',
          'X-Employee-ID': validatedData.employeeId,
          'X-Period': `${validatedData.year}-${validatedData.month.toString().padStart(2, '0')}`
        }
      })
    } else {
      // Local development: save to public directory and return JSON response
      console.log('🏠 Local development environment - using file-based approach')
      
      const payslipsDir = path.join(process.cwd(), 'public', 'payslips')
      await mkdir(payslipsDir, { recursive: true })
      const filePath = path.join(payslipsDir, fileName)
      await writeFile(filePath, htmlContent, 'utf8')
      console.log('💾 Payslip saved to public directory:', filePath)
      
      return NextResponse.json({
        success: true,
        message: 'Payslip generated successfully',
        payslip: payslipData,
        file: {
          fileName: fileName,
          filePath: `/payslips/${fileName}`,
          downloadUrl: `/payslips/${fileName}`
        },
        payslipRecord: payslipRecord
      })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error generating payslip PDF:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

