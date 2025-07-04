import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateSubscription } from "@/lib/subscription"
import { calculateDutchPayroll, generatePayrollBreakdown } from "@/lib/payroll-calculations"

// GET /api/payroll/management - Get payroll management data
export async function GET(request: NextRequest) {
  try {
    console.log("=== PAYROLL MANAGEMENT API START ===")
    
    const session = await getServerSession(authOptions)
    console.log("Session user ID:", session?.user?.id)
    console.log("Session company ID:", session?.user?.companyId)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate subscription
    const subscriptionValidation = await validateSubscription(session.user.companyId)
    console.log("Subscription validation:", subscriptionValidation)
    if (!subscriptionValidation.isValid) {
      return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const payPeriodStart = searchParams.get('payPeriodStart')
    const payPeriodEnd = searchParams.get('payPeriodEnd')

    console.log("Query params:", { payPeriodStart, payPeriodEnd })

    // Fetch active employees for the company
    const employees = await prisma.employee.findMany({
      where: {
        companyId: session.user.companyId,
        isActive: true
      },
      select: {
        id: true,
        employeeNumber: true,
        firstName: true,
        lastName: true,
        position: true,
        department: true,
        salary: true,
        salaryType: true,
        hourlyRate: true,
        isDGA: true,
        dateOfBirth: true,
        taxTable: true,
        taxCredit: true
      },
      orderBy: {
        employeeNumber: 'asc'
      }
    })

    console.log("Found employees:", employees.length)

    // If pay period is specified, check for existing payroll records
    let existingRecords: any[] = []
    if (payPeriodStart && payPeriodEnd) {
      existingRecords = await prisma.payrollRecord.findMany({
        where: {
          companyId: session.user.companyId,
          payPeriodStart: new Date(payPeriodStart),
          payPeriodEnd: new Date(payPeriodEnd)
        },
        include: {
          employee: {
            select: {
              id: true,
              employeeNumber: true,
              firstName: true,
              lastName: true
            }
          }
        }
      })
      console.log("Found existing records:", existingRecords.length)
    }

    // Get company data for calculations
    const company = await prisma.company.findFirst({
      where: { id: session.user.companyId }
    })

    // Prepare response data
    const employeesWithStatus = employees.map(employee => {
      const existingRecord = existingRecords.find(record => record.employeeId === employee.id)
      
      return {
        ...employee,
        hasPayrollRecord: !!existingRecord,
        payrollRecord: existingRecord || null,
        status: existingRecord ? 'processed' : 'pending'
      }
    })

    // Calculate summary statistics
    const totalEmployees = employees.length
    const processedEmployees = existingRecords.length
    const pendingEmployees = totalEmployees - processedEmployees

    const summary = {
      totalEmployees,
      processedEmployees,
      pendingEmployees,
      totalGrossPay: existingRecords.reduce((sum, record) => sum + (record.grossPay || 0), 0),
      totalNetPay: existingRecords.reduce((sum, record) => sum + (record.netPay || 0), 0),
      totalDeductions: existingRecords.reduce((sum, record) => sum + (record.totalDeductions || 0), 0),
      totalEmployerCosts: existingRecords.reduce((sum, record) => sum + (record.employerCosts || 0), 0)
    }

    console.log("Summary:", summary)

    return NextResponse.json({
      success: true,
      employees: employeesWithStatus,
      summary,
      payPeriod: payPeriodStart && payPeriodEnd ? {
        start: payPeriodStart,
        end: payPeriodEnd
      } : null,
      company: {
        id: company?.id,
        name: company?.name
      }
    })

  } catch (error) {
    console.error("=== PAYROLL MANAGEMENT ERROR ===")
    console.error("Error details:", error)
    console.error("Error message:", error instanceof Error ? error.message : 'Unknown error')
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json({
      success: false,
      error: "Failed to fetch payroll management data",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/payroll/management - Batch process payroll for multiple employees
export async function POST(request: NextRequest) {
  try {
    console.log("=== BATCH PAYROLL PROCESSING START ===")
    
    const session = await getServerSession(authOptions)
    console.log("Session user ID:", session?.user?.id)
    console.log("Session company ID:", session?.user?.companyId)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate subscription
    const subscriptionValidation = await validateSubscription(session.user.companyId)
    console.log("Subscription validation:", subscriptionValidation)
    if (!subscriptionValidation.isValid) {
      return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
    }

    const requestBody = await request.json()
    console.log("Request body:", requestBody)
    
    const { 
      employeeIds, 
      payPeriodStart, 
      payPeriodEnd,
      dryRun = false
    } = requestBody

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return NextResponse.json({
        error: "Missing or invalid employeeIds array"
      }, { status: 400 })
    }

    if (!payPeriodStart || !payPeriodEnd) {
      return NextResponse.json({
        error: "Missing required fields: payPeriodStart, payPeriodEnd"
      }, { status: 400 })
    }

    console.log("Processing payroll for employees:", employeeIds)
    console.log("Pay period:", payPeriodStart, "to", payPeriodEnd)
    console.log("Dry run:", dryRun)

    // Fetch employees
    const employees = await prisma.employee.findMany({
      where: {
        id: { in: employeeIds },
        companyId: session.user.companyId,
        isActive: true
      }
    })

    if (employees.length === 0) {
      return NextResponse.json({ error: "No valid employees found" }, { status: 404 })
    }

    // Fetch company data
    const company = await prisma.company.findFirst({
      where: { id: session.user.companyId }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const results = []
    const errors = []

    // Process each employee
    for (const employee of employees) {
      try {
        console.log(`Processing employee: ${employee.firstName} ${employee.lastName}`)

        // Prepare data for Dutch payroll calculation
        const employeeData = {
          grossMonthlySalary: employee.salary,
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

        if (!dryRun) {
          // Check if record already exists
          const existingRecord = await prisma.payrollRecord.findFirst({
            where: {
              employeeId: employee.id,
              payPeriodStart: new Date(payPeriodStart),
              payPeriodEnd: new Date(payPeriodEnd)
            }
          })

          if (existingRecord) {
            // Update existing record
            const updatedRecord = await prisma.payrollRecord.update({
              where: { id: existingRecord.id },
              data: {
                baseSalary: employee.salary,
                hoursWorked: 0,
                overtimeHours: 0,
                overtimeRate: 1.5,
                regularPay: employee.salary,
                overtimePay: 0,
                holidayAllowance: payrollResult.holidayAllowanceGross / 12, // Annual to monthly
                grossPay: payrollResult.grossMonthlySalary, // Already monthly
                incomeTax: payrollResult.incomeTaxAfterCredits / 12, // Annual to monthly
                aowContribution: payrollResult.aowContribution / 12, // Annual to monthly
                wlzContribution: payrollResult.wlzContribution / 12, // Annual to monthly
                wwContribution: payrollResult.wwContribution / 12, // Annual to monthly
                wiaContribution: payrollResult.wiaContribution / 12, // Annual to monthly
                totalDeductions: payrollResult.totalTaxAndInsurance / 12, // Annual to monthly
                netPay: payrollResult.netMonthlySalary, // Already monthly
                employerCosts: payrollResult.totalEmployerCosts / 12, // Annual to monthly
                processedDate: new Date()
              }
            })

            results.push({
              employee: {
                id: employee.id,
                name: `${employee.firstName} ${employee.lastName}`,
                employeeNumber: employee.employeeNumber
              },
              status: 'updated',
              payrollRecord: updatedRecord,
              calculation: payrollResult
            })
          } else {
            // Create new payroll record
            const payrollRecord = await prisma.payrollRecord.create({
              data: {
                employeeId: employee.id,
                companyId: session.user.companyId,
                payPeriodStart: new Date(payPeriodStart),
                payPeriodEnd: new Date(payPeriodEnd),
                baseSalary: employee.salary,
                hoursWorked: 0,
                overtimeHours: 0,
                overtimeRate: 1.5,
                regularPay: employee.salary,
                overtimePay: 0,
                holidayAllowance: payrollResult.holidayAllowanceGross / 12, // Annual to monthly
                grossPay: payrollResult.grossMonthlySalary, // Already monthly
                incomeTax: payrollResult.incomeTaxAfterCredits / 12, // Annual to monthly
                aowContribution: payrollResult.aowContribution / 12, // Annual to monthly
                wlzContribution: payrollResult.wlzContribution / 12, // Annual to monthly
                wwContribution: payrollResult.wwContribution / 12, // Annual to monthly
                wiaContribution: payrollResult.wiaContribution / 12, // Annual to monthly
                totalDeductions: payrollResult.totalTaxAndInsurance / 12, // Annual to monthly
                netPay: payrollResult.netMonthlySalary, // Already monthly
                employerCosts: payrollResult.totalEmployerCosts / 12, // Annual to monthly
                taxTable: employee.taxTable || 'wit', // Add the missing taxTable field
                taxYear: new Date(payPeriodStart).getFullYear(), // Add taxYear field
                processedDate: new Date()
              }
            })

            results.push({
              employee: {
                id: employee.id,
                name: `${employee.firstName} ${employee.lastName}`,
                employeeNumber: employee.employeeNumber
              },
              status: 'created',
              payrollRecord: payrollRecord,
              calculation: payrollResult
            })
          }
        } else {
          // Dry run - just return calculation
          results.push({
            employee: {
              id: employee.id,
              name: `${employee.firstName} ${employee.lastName}`,
              employeeNumber: employee.employeeNumber
            },
            status: 'calculated',
            calculation: payrollResult
          })
        }

      } catch (employeeError) {
        console.error(`Error processing employee ${employee.id}:`, employeeError)
        errors.push({
          employee: {
            id: employee.id,
            name: `${employee.firstName} ${employee.lastName}`,
            employeeNumber: employee.employeeNumber
          },
          error: employeeError instanceof Error ? employeeError.message : 'Unknown error'
        })
      }
    }

    const summary = {
      totalProcessed: results.length,
      totalErrors: errors.length,
      totalGrossPay: results.reduce((sum, result) => sum + (result.calculation?.grossMonthlySalary || 0), 0),
      totalNetPay: results.reduce((sum, result) => sum + (result.calculation?.netMonthlySalary || 0), 0),
      totalEmployerCosts: results.reduce((sum, result) => sum + (result.calculation?.totalEmployerCosts || 0) / 12, 0)
    }

    console.log("Batch processing complete:", summary)

    return NextResponse.json({
      success: true,
      message: dryRun ? "Payroll calculated (dry run)" : "Batch payroll processing completed",
      results,
      errors,
      summary,
      dryRun
    })

  } catch (error) {
    console.error("=== BATCH PAYROLL PROCESSING ERROR ===")
    console.error("Error details:", error)
    console.error("Error message:", error instanceof Error ? error.message : 'Unknown error')
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json({
      success: false,
      error: "Failed to process batch payroll",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

