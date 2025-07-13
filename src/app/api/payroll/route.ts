import { NextRequest, NextResponse } from "next/server"
import { validateAuth } from "@/lib/auth-utils"
import { payrollClient } from "@/lib/database-clients"
import { validateSubscription } from "@/lib/subscription"
import { calculateDutchPayroll, generatePayrollBreakdown, formatCurrency } from "@/lib/payroll-calculations"
import { ensurePayrollInitialized } from "@/lib/lazy-initialization"

// POST /api/payroll/calculate - Calculate payroll for specific employee
export async function POST(request: NextRequest) {
  try {
    console.log('=== PAYROLL CALCULATE API START ===')
    
    const { context, error, status } = await validateAuth(request, ['employee'])
    
    if (!context || error) {
      console.log('Authentication failed:', error)
      return NextResponse.json({ error }, { status })
    }

    console.log('Authentication successful for payroll calculation')

    // Ensure Payroll database is initialized for this company (lazy initialization)
    console.log('Ensuring Payroll database is initialized for company:', context.companyId)
    await ensurePayrollInitialized(context.companyId)
    console.log('Payroll database initialization complete')

    // Validate subscription
    const subscriptionValidation = await validateSubscription(context.companyId)
    if (!subscriptionValidation.isValid) {
      console.log('Subscription validation failed:', subscriptionValidation.error)
      return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
    }

    const { employeeId, payPeriodStart, payPeriodEnd } = await request.json()

    if (!employeeId || !payPeriodStart || !payPeriodEnd) {
      return NextResponse.json({
        error: "Missing required fields: employeeId, payPeriodStart, payPeriodEnd"
      }, { status: 400 })
    }

    // Fetch employee data
    const employee = await payrollClient.employee.findFirst({
      where: {
        id: employeeId,
        companyId: context.companyId,
        isActive: true
      }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Fetch company data
    const company = await payrollClient.company.findFirst({
      where: { id: context.companyId }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Prepare employee data for calculation
    const employeeData = {
      grossMonthlySalary: employee.salary,
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

    // Check if payroll record already exists for this period
    const existingRecord = await payrollClient.payrollRecord.findFirst({
      where: {
        employeeId: employeeId,
        payPeriodStart: new Date(payPeriodStart),
        payPeriodEnd: new Date(payPeriodEnd)
      }
    })

    if (existingRecord) {
      return NextResponse.json({
        success: true,
        message: "Payroll calculated (record already exists for this period)",
        calculation: payrollResult,
        breakdown: breakdown,
        existingRecord: existingRecord
      })
    }

    return NextResponse.json({
      success: true,
      message: "Payroll calculated successfully",
      calculation: payrollResult,
      breakdown: breakdown,
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeNumber: employee.employeeNumber
      }
    })

  } catch (error) {
    console.error("Error calculating payroll:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to calculate payroll"
    }, { status: 500 })
  }
}

// POST /api/payroll/process - Process and save payroll for employee
export async function PUT(request: NextRequest) {
  try {
    console.log("=== PAYROLL PROCESSING START ===")
    
    const session = await getServerSession(authOptions)
    console.log("Session user ID:", session?.user?.id)
    console.log("Session company ID:", session?.user?.companyId)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate subscription
    const subscriptionValidation = await validateSubscription(context.companyId)
    console.log("Subscription validation:", subscriptionValidation)
    if (!subscriptionValidation.isValid) {
      return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
    }

    const requestBody = await request.json()
    console.log("Request body:", requestBody)
    
    const { 
      employeeId, 
      payPeriodStart, 
      payPeriodEnd, 
      hoursWorked, 
      overtimeHours,
      bonuses,
      deductions 
    } = requestBody

    console.log("Extracted data:", {
      employeeId,
      payPeriodStart,
      payPeriodEnd,
      hoursWorked,
      overtimeHours,
      bonuses
    })

    if (!employeeId || !payPeriodStart || !payPeriodEnd) {
      return NextResponse.json({
        error: "Missing required fields: employeeId, payPeriodStart, payPeriodEnd"
      }, { status: 400 })
    }

    // Fetch employee data
    const employee = await payrollClient.employee.findFirst({
      where: {
        id: employeeId,
        companyId: context.companyId,
        isActive: true
      }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Fetch company data
    const company = await payrollClient.company.findFirst({
      where: { id: context.companyId }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
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

    // Check if record already exists
    const existingRecord = await payrollClient.payrollRecord.findFirst({
      where: {
        employeeId: employeeId,
        payPeriodStart: new Date(payPeriodStart),
        payPeriodEnd: new Date(payPeriodEnd)
      }
    })

    if (existingRecord) {
      // Update existing record
      const updatedRecord = await payrollClient.payrollRecord.update({
        where: { id: existingRecord.id },
        data: {
          baseSalary: baseSalary,
          hoursWorked: hoursWorked || 0,
          overtimeHours: overtimeHours || 0,
          overtimeRate: 1.5,
          regularPay: baseSalary,
          overtimePay: overtimePay,
          holidayAllowance: payrollResult.holidayAllowanceGross / 12, // Monthly portion
          grossPay: grossPay,
          // Note: Income tax not calculated in payroll software - handled by tax advisors
          aowContribution: payrollResult.aowContribution / 12,
          wlzContribution: payrollResult.wlzContribution / 12,
          wwContribution: payrollResult.wwContribution / 12,
          wiaContribution: payrollResult.wiaContribution / 12,
          totalDeductions: payrollResult.totalEmployeeContributions / 12,
          grossPayAfterContributions: payrollResult.grossSalaryAfterEmployeeContributions / 12,
          employerCosts: payrollResult.totalEmployerContributions / 12,
          processedDate: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: "Payroll record updated successfully",
        payrollRecord: updatedRecord,
        calculation: payrollResult
      })
    } else {
      // Create new payroll record
      const payrollRecord = await payrollClient.payrollRecord.create({
        data: {
          employeeId: employeeId,
          companyId: context.companyId,
          payPeriodStart: new Date(payPeriodStart),
          payPeriodEnd: new Date(payPeriodEnd),
          baseSalary: baseSalary,
          hoursWorked: hoursWorked || 0,
          overtimeHours: overtimeHours || 0,
          overtimeRate: 1.5,
          regularPay: baseSalary,
          overtimePay: overtimePay,
          holidayAllowance: payrollResult.holidayAllowanceGross / 12, // Monthly portion
          grossPay: grossPay,
          // Note: Income tax not calculated in payroll software - handled by tax advisors
          aowContribution: payrollResult.aowContribution / 12,
          wlzContribution: payrollResult.wlzContribution / 12,
          wwContribution: payrollResult.wwContribution / 12,
          wiaContribution: payrollResult.wiaContribution / 12,
          totalDeductions: payrollResult.totalEmployeeContributions / 12,
          grossPayAfterContributions: payrollResult.grossSalaryAfterEmployeeContributions / 12,
          employerCosts: payrollResult.totalEmployerContributions / 12,
          processedDate: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: "Payroll processed and saved successfully",
        payrollRecord: payrollRecord,
        calculation: payrollResult
      }, { status: 201 })
    }

  } catch (error) {
    console.error("=== PAYROLL PROCESSING ERROR ===")
    console.error("Error details:", error)
    console.error("Error message:", error instanceof Error ? error.message : 'Unknown error')
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json({
      success: false,
      error: "Failed to process payroll",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/payroll - Get payroll records for company
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate subscription
    const subscriptionValidation = await validateSubscription(context.companyId)
    if (!subscriptionValidation.isValid) {
      return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const whereClause: any = {
      companyId: context.companyId
    }

    if (employeeId) {
      whereClause.employeeId = employeeId
    }

    if (startDate && endDate) {
      whereClause.payPeriodStart = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Fetch payroll records
    const payrollRecords = await payrollClient.payrollRecord.findMany({
      where: whereClause,
      include: {
        Employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            position: true,
            department: true
          }
        }
      },
      orderBy: {
        payPeriodStart: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Get total count
    const totalCount = await payrollClient.payrollRecord.count({
      where: whereClause
    })

    // Calculate summary statistics
    const summary = await payrollClient.payrollRecord.aggregate({
      where: whereClause,
      _sum: {
        grossPay: true,
        netPay: true,
        totalDeductions: true,
        employerCosts: true
      },
      _avg: {
        grossPay: true,
        netPay: true
      }
    })

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
        totalGrossPay: summary._sum.grossPay || 0,
        totalNetPay: summary._sum.netPay || 0,
        totalDeductions: summary._sum.totalDeductions || 0,
        totalEmployerCosts: summary._sum.employerCosts || 0,
        averageGrossPay: summary._avg.grossPay || 0,
        averageNetPay: summary._avg.netPay || 0
      }
    })

  } catch (error) {
    console.error("Error fetching payroll records:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch payroll records"
    }, { status: 500 })
  }
}


// DELETE /api/payroll - Delete payroll records
export async function DELETE(request: NextRequest) {
  try {
    console.log("=== PAYROLL DELETE START ===")
    
    const session = await getServerSession(authOptions)
    console.log("Session user ID:", session?.user?.id)
    console.log("Session company ID:", session?.user?.companyId)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate subscription
    const subscriptionValidation = await validateSubscription(context.companyId)
    console.log("Subscription validation:", subscriptionValidation)
    if (!subscriptionValidation.isValid) {
      return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const payrollRecordId = searchParams.get('id')
    const payPeriodStart = searchParams.get('payPeriodStart')
    const payPeriodEnd = searchParams.get('payPeriodEnd')
    const deleteAll = searchParams.get('deleteAll') === 'true'

    console.log("Delete params:", { payrollRecordId, payPeriodStart, payPeriodEnd, deleteAll })

    if (deleteAll && payPeriodStart && payPeriodEnd) {
      // Delete all payroll records for a specific pay period
      const deleteResult = await payrollClient.payrollRecord.deleteMany({
        where: {
          companyId: context.companyId,
          payPeriodStart: new Date(payPeriodStart),
          payPeriodEnd: new Date(payPeriodEnd)
        }
      })

      console.log("Deleted records count:", deleteResult.count)

      return NextResponse.json({
        success: true,
        message: `Deleted ${deleteResult.count} payroll records for pay period`,
        deletedCount: deleteResult.count
      })
    } else if (payrollRecordId) {
      // Delete specific payroll record
      const payrollRecord = await payrollClient.payrollRecord.findFirst({
        where: {
          id: payrollRecordId,
          companyId: context.companyId
        }
      })

      if (!payrollRecord) {
        return NextResponse.json({ error: "Payroll record not found" }, { status: 404 })
      }

      await payrollClient.payrollRecord.delete({
        where: { id: payrollRecordId }
      })

      console.log("Deleted payroll record:", payrollRecordId)

      return NextResponse.json({
        success: true,
        message: "Payroll record deleted successfully",
        deletedRecord: payrollRecord
      })
    } else {
      return NextResponse.json({
        error: "Missing required parameters: either 'id' or 'payPeriodStart' and 'payPeriodEnd' with 'deleteAll=true'"
      }, { status: 400 })
    }

  } catch (error) {
    console.error("=== PAYROLL DELETE ERROR ===")
    console.error("Error details:", error)
    console.error("Error message:", error instanceof Error ? error.message : 'Unknown error')
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json({
      success: false,
      error: "Failed to delete payroll records",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

