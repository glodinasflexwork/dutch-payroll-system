import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { payrollClient } from "@/lib/database-clients"
import { validateSubscription } from "@/lib/subscription"
import { calculateDutchPayroll } from "@/lib/payroll-calculations"

interface BatchPayrollRequest {
  payPeriodStart: string;
  payPeriodEnd: string;
  employeeIds?: string[]; // If not provided, process all active employees
  includeInactive?: boolean;
  dryRun?: boolean; // Calculate without saving
}

interface BatchPayrollResult {
  success: boolean;
  message: string;
  totalProcessed: number;
  totalErrors: number;
  results: Array<{
    employeeId: string;
    employeeName: string;
    status: 'success' | 'error' | 'skipped';
    error?: string;
    payrollRecord?: any;
    calculation?: any;
  }>;
  summary: {
    totalGrossPay: number;
    totalNetPay: number;
    totalDeductions: number;
    totalEmployerCosts: number;
  };
}

// POST /api/payroll/batch - Process payroll for multiple employees
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate subscription
    const subscriptionValidation = await validateSubscription(session.user.companyId)
    if (!subscriptionValidation.isValid) {
      return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
    }

    const {
      payPeriodStart,
      payPeriodEnd,
      employeeIds,
      includeInactive = false,
      dryRun = false
    }: BatchPayrollRequest = await request.json()

    if (!payPeriodStart || !payPeriodEnd) {
      return NextResponse.json({
        error: "Missing required fields: payPeriodStart, payPeriodEnd"
      }, { status: 400 })
    }

    // Fetch company data
    const company = await payrollClient.company.findFirst({
      where: { id: session.user.companyId }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Build employee query
    const employeeWhere: any = {
      companyId: session.user.companyId
    }

    if (employeeIds && employeeIds.length > 0) {
      employeeWhere.id = { in: employeeIds }
    }

    if (!includeInactive) {
      employeeWhere.isActive = true
    }

    // Fetch employees to process
    const employees = await payrollClient.employee.findMany({
      where: employeeWhere,
      orderBy: { employeeNumber: 'asc' }
    })

    if (employees.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No employees found to process"
      }, { status: 400 })
    }

    // Check for existing payroll records in this period
    const existingRecords = await payrollClient.payrollRecord.findMany({
      where: {
        companyId: session.user.companyId,
        payPeriodStart: new Date(payPeriodStart),
        payPeriodEnd: new Date(payPeriodEnd),
        employeeId: { in: employees.map(e => e.id) }
      },
      select: { employeeId: true }
    })

    const existingEmployeeIds = new Set(existingRecords.map(r => r.employeeId))

    // Process each employee
    const results: BatchPayrollResult['results'] = []
    let totalProcessed = 0
    let totalErrors = 0
    let totalGrossPay = 0
    let totalNetPay = 0
    let totalDeductions = 0
    let totalEmployerCosts = 0

    for (const employee of employees) {
      try {
        // Skip if payroll already exists for this period
        if (existingEmployeeIds.has(employee.id)) {
          results.push({
            employeeId: employee.id,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            status: 'skipped',
            error: 'Payroll already exists for this period'
          })
          continue
        }

        // Prepare employee data for calculation
        const employeeData = {
          grossMonthlySalary: employee.salary,
          dateOfBirth: employee.dateOfBirth,
          isDGA: employee.isDGA,
          taxTable: employee.taxTable as 'wit' | 'groen',
          taxCredit: employee.taxCredit,
          isYoungDisabled: false,
          hasMultipleJobs: false
        }

        // Prepare company data for calculation
        const companyData = {
          size: 'medium' as const,
          sector: company.industry || undefined,
          awfRate: 'low' as const,
          aofRate: 'low' as const
        }

        // Calculate Dutch payroll
        const payrollResult = calculateDutchPayroll(employeeData, companyData)

        // Add to totals
        totalGrossPay += payrollResult.grossMonthlySalary
        totalNetPay += payrollResult.netMonthlySalary
        totalDeductions += payrollResult.totalTaxAndInsurance / 12
        totalEmployerCosts += payrollResult.totalEmployerCosts / 12

        let payrollRecord = null

        // Save payroll record if not dry run
        if (!dryRun) {
          payrollRecord = await payrollClient.payrollRecord.create({
            data: {
              employeeId: employee.id,
              companyId: session.user.companyId,
              payPeriodStart: new Date(payPeriodStart),
              payPeriodEnd: new Date(payPeriodEnd),
              baseSalary: employee.salary,
              hoursWorked: employee.workingHours * 4.33 || 0, // Approximate monthly hours
              overtimeHours: 0,
              overtimeRate: 1.5,
              regularPay: employee.salary,
              overtimePay: 0,
              holidayAllowance: payrollResult.holidayAllowanceGross / 12,
              grossPay: payrollResult.grossMonthlySalary,
              incomeTax: payrollResult.incomeTaxAfterCredits / 12,
              aowContribution: payrollResult.aowContribution / 12,
              wlzContribution: payrollResult.wlzContribution / 12,
              wwContribution: payrollResult.wwContribution / 12,
              wiaContribution: payrollResult.wiaContribution / 12,
              totalDeductions: payrollResult.totalTaxAndInsurance / 12,
              netPay: payrollResult.netMonthlySalary,
              employerCosts: payrollResult.totalEmployerCosts / 12,
              taxTable: employee.taxTable,
              taxYear: new Date().getFullYear(),
              processedDate: new Date()
            }
          })
        }

        results.push({
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          status: 'success',
          payrollRecord: payrollRecord,
          calculation: payrollResult
        })

        totalProcessed++

      } catch (error) {
        console.error(`Error processing payroll for employee ${employee.id}:`, error)
        
        results.push({
          employeeId: employee.id,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })

        totalErrors++
      }
    }

    const batchResult: BatchPayrollResult = {
      success: totalErrors === 0,
      message: dryRun 
        ? `Dry run completed: ${totalProcessed} calculations successful, ${totalErrors} errors`
        : `Batch payroll completed: ${totalProcessed} processed, ${totalErrors} errors`,
      totalProcessed,
      totalErrors,
      results,
      summary: {
        totalGrossPay,
        totalNetPay,
        totalDeductions,
        totalEmployerCosts
      }
    }

    return NextResponse.json(batchResult, { 
      status: totalErrors > 0 ? 207 : 200 // 207 Multi-Status for partial success
    })

  } catch (error) {
    console.error("Error in batch payroll processing:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to process batch payroll"
    }, { status: 500 })
  }
}

// GET /api/payroll/batch/status - Get batch processing status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const payPeriodStart = searchParams.get('payPeriodStart')
    const payPeriodEnd = searchParams.get('payPeriodEnd')

    if (!payPeriodStart || !payPeriodEnd) {
      return NextResponse.json({
        error: "Missing required parameters: payPeriodStart, payPeriodEnd"
      }, { status: 400 })
    }

    // Get all active employees
    const totalEmployees = await payrollClient.employee.count({
      where: {
        companyId: session.user.companyId,
        isActive: true
      }
    })

    // Get processed payroll records for this period
    const processedRecords = await payrollClient.payrollRecord.findMany({
      where: {
        companyId: session.user.companyId,
        payPeriodStart: new Date(payPeriodStart),
        payPeriodEnd: new Date(payPeriodEnd)
      },
      include: {
        Employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { processedDate: 'desc' }
    })

    // Calculate summary
    const summary = processedRecords.reduce((acc, record) => {
      acc.totalGrossPay += record.grossPay
      acc.totalNetPay += record.netPay
      acc.totalDeductions += record.totalDeductions
      acc.totalEmployerCosts += record.employerCosts
      return acc
    }, {
      totalGrossPay: 0,
      totalNetPay: 0,
      totalDeductions: 0,
      totalEmployerCosts: 0
    })

    return NextResponse.json({
      success: true,
      status: {
        totalEmployees,
        processedCount: processedRecords.length,
        remainingCount: totalEmployees - processedRecords.length,
        completionPercentage: totalEmployees > 0 ? (processedRecords.length / totalEmployees) * 100 : 0,
        isComplete: processedRecords.length === totalEmployees
      },
      processedRecords,
      summary
    })

  } catch (error) {
    console.error("Error getting batch status:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to get batch status"
    }, { status: 500 })
  }
}

// DELETE /api/payroll/batch - Delete payroll records for a period (rollback)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate subscription
    const subscriptionValidation = await validateSubscription(session.user.companyId)
    if (!subscriptionValidation.isValid) {
      return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
    }

    const { payPeriodStart, payPeriodEnd, employeeIds } = await request.json()

    if (!payPeriodStart || !payPeriodEnd) {
      return NextResponse.json({
        error: "Missing required fields: payPeriodStart, payPeriodEnd"
      }, { status: 400 })
    }

    // Build where clause
    const whereClause: any = {
      companyId: session.user.companyId,
      payPeriodStart: new Date(payPeriodStart),
      payPeriodEnd: new Date(payPeriodEnd)
    }

    if (employeeIds && employeeIds.length > 0) {
      whereClause.employeeId = { in: employeeIds }
    }

    // Delete payroll records
    const deleteResult = await payrollClient.payrollRecord.deleteMany({
      where: whereClause
    })

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleteResult.count} payroll records`,
      deletedCount: deleteResult.count
    })

  } catch (error) {
    console.error("Error deleting payroll records:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to delete payroll records"
    }, { status: 500 })
  }
}

