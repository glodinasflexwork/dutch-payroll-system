import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getPayrollClient, getHRClient } from "@/lib/database-clients"
import { validateSubscription } from "@/lib/subscription"
import { calculateDutchPayroll, generatePayrollBreakdown, formatCurrency } from "@/lib/payroll-calculations"
import { ensurePayrollInitialized } from "@/lib/lazy-initialization"
import { 
  resolveCompanyFromSession, 
  handleCompanyResolutionError 
} from "@/lib/universal-company-resolver"

// POST /api/payroll - Calculate payroll for specific employee using Universal Company Resolution
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [PayrollAPI] Starting payroll calculation with Universal Company Resolution')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "No valid session found",
        code: "ACCESS_DENIED" 
      }, { status: 401 })
    }

    console.log(`🔍 [PayrollAPI] Resolving company for user: ${session.user.id}`)

    // Use Universal Company Resolution Service
    const resolution = await resolveCompanyFromSession(session)

    if (!resolution.success) {
      console.log(`❌ [PayrollAPI] Company resolution failed:`, resolution.error)
      const errorResponse = handleCompanyResolutionError(resolution)
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    const company = resolution.company!
    const companyId = company.id

    console.log(`✅ [PayrollAPI] Successfully resolved company: ${company.name}`)

    // Ensure Payroll database is initialized for this company (lazy initialization)
    console.log(`🔧 [PayrollAPI] Ensuring Payroll database is initialized for company: ${companyId}`)
    await ensurePayrollInitialized(companyId)
    console.log('✅ [PayrollAPI] Payroll database initialization complete')

    // Validate subscription
    const subscriptionValidation = await validateSubscription(companyId)
    if (!subscriptionValidation.isValid) {
      console.log(`❌ [PayrollAPI] Subscription validation failed:`, subscriptionValidation.error)
      return NextResponse.json({ 
        error: subscriptionValidation.error,
        code: "SUBSCRIPTION_REQUIRED" 
      }, { status: 403 })
    }

    const { employeeId, payPeriodStart, payPeriodEnd, hoursWorked, overtimeHours, bonuses } = await request.json()

    if (!employeeId || !payPeriodStart || !payPeriodEnd) {
      return NextResponse.json({
        error: "Missing required fields: employeeId, payPeriodStart, payPeriodEnd",
        code: "INVALID_REQUEST"
      }, { status: 400 })
    }

    console.log(`📊 [PayrollAPI] Calculating payroll for employee: ${employeeId}`)

    // Fetch employee data from HR database
    const employee = await getHRClient().employee.findFirst({
      where: {
        id: employeeId,
        companyId: companyId,
        isActive: true
      },
      include: {
        contracts: true
      }
    })

    if (!employee) {
      console.log(`❌ [PayrollAPI] Employee not found: ${employeeId}`)
      return NextResponse.json({ 
        error: "Employee not found or not active",
        code: "EMPLOYEE_NOT_FOUND" 
      }, { status: 404 })
    }

    // Calculate base salary (could be adjusted for hours worked)
    let baseSalary = employee.salary
    if (hoursWorked && employee.salaryType === 'hourly' && employee.hourlyRate) {
      baseSalary = employee.hourlyRate * hoursWorked
    }

    // Calculate overtime pay
    const overtimePay = overtimeHours && employee.hourlyRate ? 
      employee.hourlyRate * overtimeHours * 1.5 : 0

    // Calculate gross pay including bonuses
    const grossPay = baseSalary + overtimePay + (bonuses || 0)

    // Prepare employee data for calculation
    const employeeData = {
      grossMonthlySalary: grossPay,
      dateOfBirth: employee.dateOfBirth,
      isDGA: employee.isDGA,
      taxTable: employee.taxTable as 'wit' | 'groen',
      taxCredit: employee.taxCredit,
      isYoungDisabled: false, // Could be added as employee field
      hasMultipleJobs: false  // Could be determined from other data
    }

    // Prepare company data for calculation
    const companyData = {
      size: 'medium' as const, // Could be determined from employee count or revenue
      sector: company.industry || undefined,
      awfRate: 'low' as const, // Could be determined from company size/sector
      aofRate: 'low' as const  // Could be determined from company size/sector
    }

    // Calculate payroll
    const payrollResult = calculateDutchPayroll(employeeData, companyData)

    // Generate detailed breakdown
    const breakdown = generatePayrollBreakdown(payrollResult)

    console.log(`✅ [PayrollAPI] Payroll calculation completed for employee: ${employee.firstName} ${employee.lastName}`)

    return NextResponse.json({
      success: true,
      message: "Payroll calculated successfully",
      calculation: payrollResult,
      breakdown: breakdown,
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeNumber: employee.employeeNumber
      },
      company: {
        id: company.id,
        name: company.name
      },
      userRole: resolution.userRole
    })

  } catch (error) {
    console.error("💥 [PayrollAPI] Error calculating payroll:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to calculate payroll",
      code: "CALCULATION_ERROR",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT /api/payroll - Process and save payroll for employee using Universal Company Resolution
export async function PUT(request: NextRequest) {
  try {
    console.log("🚀 [PayrollAPI] Starting payroll processing with Universal Company Resolution")
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "No valid session found",
        code: "ACCESS_DENIED" 
      }, { status: 401 })
    }

    console.log(`🔍 [PayrollAPI] Resolving company for user: ${session.user.id}`)

    // Use Universal Company Resolution Service
    const resolution = await resolveCompanyFromSession(session)

    if (!resolution.success) {
      console.log(`❌ [PayrollAPI] Company resolution failed:`, resolution.error)
      const errorResponse = handleCompanyResolutionError(resolution)
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    const company = resolution.company!
    const companyId = company.id

    console.log(`✅ [PayrollAPI] Successfully resolved company: ${company.name}`)

    // Validate subscription
    const subscriptionValidation = await validateSubscription(companyId)
    if (!subscriptionValidation.isValid) {
      console.log(`❌ [PayrollAPI] Subscription validation failed:`, subscriptionValidation.error)
      return NextResponse.json({ 
        error: subscriptionValidation.error,
        code: "SUBSCRIPTION_REQUIRED" 
      }, { status: 403 })
    }

    const requestBody = await request.json()
    console.log("📝 [PayrollAPI] Processing request:", requestBody)
    
    const { 
      employeeId, 
      payPeriodStart, 
      payPeriodEnd, 
      hoursWorked, 
      overtimeHours,
      bonuses,
      deductions 
    } = requestBody

    if (!employeeId || !payPeriodStart || !payPeriodEnd) {
      return NextResponse.json({
        error: "Missing required fields: employeeId, payPeriodStart, payPeriodEnd",
        code: "INVALID_REQUEST"
      }, { status: 400 })
    }

    console.log(`💾 [PayrollAPI] Processing payroll for employee: ${employeeId}`)

    // Fetch employee data from HR database
    const employee = await getHRClient().employee.findFirst({
      where: {
        id: employeeId,
        companyId: companyId,
        isActive: true
      },
      include: {
        contracts: true
      }
    })

    if (!employee) {
      console.log(`❌ [PayrollAPI] Employee not found: ${employeeId}`)
      return NextResponse.json({ 
        error: "Employee not found or not active",
        code: "EMPLOYEE_NOT_FOUND" 
      }, { status: 404 })
    }

    // Calculate base salary (could be adjusted for hours worked)
    let baseSalary = employee.salary
    if (hoursWorked && employee.salaryType === 'hourly' && employee.hourlyRate) {
      baseSalary = employee.hourlyRate * hoursWorked
    }

    // Calculate overtime pay
    const overtimePay = overtimeHours && employee.hourlyRate ? 
      employee.hourlyRate * overtimeHours * 1.5 : 0

    // Calculate gross pay including bonuses
    const grossPay = baseSalary + overtimePay + (bonuses || 0)

    // Prepare data for Dutch payroll calculation
    const employeeData = {
      grossMonthlySalary: grossPay,
      dateOfBirth: employee.dateOfBirth,
      isDGA: employee.isDGA,
      taxTable: employee.taxTable as 'wit' | 'groen',
      taxCredit: employee.taxCredit,
      isYoungDisabled: false,
      hasMultipleJobs: false
    }

    const companyData = {
      size: 'medium' as const,
      sector: company.industry || undefined,
      awfRate: 'low' as const,
      aofRate: 'low' as const
    }

    // Calculate Dutch payroll
    const payrollResult = calculateDutchPayroll(employeeData, companyData)

    // Parse pay period dates
    const payPeriodStartDate = new Date(payPeriodStart)
    const payPeriodEndDate = new Date(payPeriodEnd)
    const year = payPeriodStartDate.getFullYear()
    const month = payPeriodStartDate.getMonth() + 1

    // Check if record already exists for this period
    const existingRecord = await getPayrollClient().payrollRecord.findFirst({
      where: {
        employeeId: employeeId,
        year: year,
        month: month
      }
    })

    if (existingRecord) {
      console.log(`🔄 [PayrollAPI] Updating existing payroll record for period: ${year}-${month}`)
      
      // Update existing record with schema-compliant fields
      const updatedRecord = await getPayrollClient().payrollRecord.update({
        where: { id: existingRecord.id },
        data: {
          period: `${year}-${month.toString().padStart(2, '0')}`,
          grossSalary: grossPay,
          netSalary: payrollResult.netMonthlySalary,
          taxDeduction: payrollResult.incomeTax / 12, // Monthly portion
          socialSecurity: (payrollResult.aowContribution + payrollResult.wlzContribution) / 12,
          pensionDeduction: (payrollResult.wwContribution + payrollResult.wiaContribution) / 12,
          otherDeductions: deductions || 0,
          bonus: bonuses || 0,
          overtime: overtimePay,
          expenses: 0, // Could be added from request
          paymentDate: new Date(),
          status: 'processed',
          notes: `Updated: Hours: ${hoursWorked || 0}, Overtime: ${overtimeHours || 0}`,
          updatedAt: new Date()
        }
      })

      console.log(`✅ [PayrollAPI] Payroll record updated successfully`)

      return NextResponse.json({
        success: true,
        message: "Payroll record updated successfully",
        payrollRecord: updatedRecord,
        calculation: payrollResult,
        company: {
          id: company.id,
          name: company.name
        }
      })
    } else {
      console.log(`📝 [PayrollAPI] Creating new payroll record for period: ${year}-${month}`)
      
      // Create new payroll record with schema-compliant fields
      const payrollRecord = await getPayrollClient().payrollRecord.create({
        data: {
          employeeId: employeeId,
          companyId: companyId,
          period: `${year}-${month.toString().padStart(2, '0')}`,
          year: year,
          month: month,
          grossSalary: grossPay,
          netSalary: payrollResult.netMonthlySalary,
          taxDeduction: payrollResult.incomeTax / 12, // Monthly portion
          socialSecurity: (payrollResult.aowContribution + payrollResult.wlzContribution) / 12,
          pensionDeduction: (payrollResult.wwContribution + payrollResult.wiaContribution) / 12,
          otherDeductions: deductions || 0,
          bonus: bonuses || 0,
          overtime: overtimePay,
          expenses: 0, // Could be added from request
          paymentDate: new Date(),
          status: 'processed',
          notes: `Hours: ${hoursWorked || 0}, Overtime: ${overtimeHours || 0}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      console.log(`✅ [PayrollAPI] Payroll record created successfully`)

      return NextResponse.json({
        success: true,
        message: "Payroll processed and saved successfully",
        payrollRecord: payrollRecord,
        calculation: payrollResult,
        company: {
          id: company.id,
          name: company.name
        }
      }, { status: 201 })
    }

  } catch (error) {
    console.error("💥 [PayrollAPI] Error processing payroll:", error)
    console.error("Error details:", error instanceof Error ? error.message : 'Unknown error')
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json({
      success: false,
      error: "Failed to process payroll",
      code: "PROCESSING_ERROR",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/payroll - Get payroll records for company using Universal Company Resolution
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 [PayrollAPI] Fetching payroll records with Universal Company Resolution")
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "No valid session found",
        code: "ACCESS_DENIED" 
      }, { status: 401 })
    }

    // Use Universal Company Resolution Service
    const resolution = await resolveCompanyFromSession(session)

    if (!resolution.success) {
      const errorResponse = handleCompanyResolutionError(resolution)
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    const company = resolution.company!
    const companyId = company.id

    console.log(`✅ [PayrollAPI] Successfully resolved company: ${company.name}`)

    // Validate subscription
    const subscriptionValidation = await validateSubscription(companyId)
    if (!subscriptionValidation.isValid) {
      return NextResponse.json({ 
        error: subscriptionValidation.error,
        code: "SUBSCRIPTION_REQUIRED" 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const whereClause: any = {
      companyId: companyId
    }

    if (employeeId) {
      whereClause.employeeId = employeeId
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Fetch payroll records
    const payrollRecords = await getPayrollClient().payrollRecord.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Get total count
    const totalCount = await getPayrollClient().payrollRecord.count({
      where: whereClause
    })

    // Calculate summary statistics
    const summary = await getPayrollClient().payrollRecord.aggregate({
      where: whereClause,
      _sum: {
        grossSalary: true,
        netSalary: true,
        taxDeduction: true,
        socialSecurity: true,
        pensionDeduction: true,
        otherDeductions: true
      },
      _avg: {
        grossSalary: true,
        netSalary: true
      }
    })

    console.log(`✅ [PayrollAPI] Retrieved ${payrollRecords.length} payroll records`)

    return NextResponse.json({
      success: true,
      payrollRecords: payrollRecords,
      pagination: {
        total: totalCount,
        limit: limit,
        offset: offset,
        hasMore: offset + limit < totalCount
      },
      summary: {
        totalGrossPay: summary._sum.grossSalary || 0,
        totalNetPay: summary._sum.netSalary || 0,
        totalTaxDeduction: summary._sum.taxDeduction || 0,
        totalSocialSecurity: summary._sum.socialSecurity || 0,
        totalPensionDeduction: summary._sum.pensionDeduction || 0,
        totalOtherDeductions: summary._sum.otherDeductions || 0,
        averageGrossPay: summary._avg.grossSalary || 0,
        averageNetPay: summary._avg.netSalary || 0
      },
      company: {
        id: company.id,
        name: company.name
      }
    })

  } catch (error) {
    console.error("💥 [PayrollAPI] Error fetching payroll records:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch payroll records",
      code: "FETCH_ERROR"
    }, { status: 500 })
  }
}

