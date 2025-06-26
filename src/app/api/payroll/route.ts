import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateSubscription, hasFeature } from "@/lib/subscription"
import { z } from "zod"

// Validation schema for payroll calculation
const payrollSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  payPeriodStart: z.string().transform((str) => new Date(str)),
  payPeriodEnd: z.string().transform((str) => new Date(str)),
  hoursWorked: z.number().min(0, "Hours worked cannot be negative").default(0),
  overtimeHours: z.number().min(0, "Overtime hours cannot be negative").default(0),
  overtimeRate: z.number().positive("Overtime rate must be positive").default(1.5),
})

// Dutch tax calculation function
function calculateDutchTaxes(grossPay: number, taxSettings: any, taxTable: string) {
  const {
    incomeTaxRate1,
    incomeTaxRate2,
    incomeTaxBracket1Max,
    aowRate,
    wlzRate,
    wwRate,
    wiaRate,
    aowMaxBase,
    wlzMaxBase,
    wwMaxBase,
    wiaMaxBase
  } = taxSettings

  // Calculate income tax
  let incomeTax = 0
  if (grossPay <= incomeTaxBracket1Max) {
    incomeTax = grossPay * (incomeTaxRate1 / 100)
  } else {
    incomeTax = incomeTaxBracket1Max * (incomeTaxRate1 / 100) + 
                (grossPay - incomeTaxBracket1Max) * (incomeTaxRate2 / 100)
  }

  // Apply tax table adjustment (groen table gets reduction)
  if (taxTable === "groen") {
    incomeTax = Math.max(0, incomeTax - 3070) // Standard tax credit for 2025
  }

  // Calculate social security contributions
  const aowContribution = Math.min(grossPay, aowMaxBase) * (aowRate / 100)
  const wlzContribution = Math.min(grossPay, wlzMaxBase) * (wlzRate / 100)
  const wwContribution = Math.min(grossPay, wwMaxBase) * (wwRate / 100)
  const wiaContribution = Math.min(grossPay, wiaMaxBase) * (wiaRate / 100)

  const totalDeductions = incomeTax + aowContribution + wlzContribution + wwContribution + wiaContribution

  return {
    incomeTax: Math.round(incomeTax * 100) / 100,
    aowContribution: Math.round(aowContribution * 100) / 100,
    wlzContribution: Math.round(wlzContribution * 100) / 100,
    wwContribution: Math.round(wwContribution * 100) / 100,
    wiaContribution: Math.round(wiaContribution * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100
  }
}

// GET /api/payroll - Get all payroll records for the user's company
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate subscription and check payroll feature access
    const subscriptionValidation = await validateSubscription(session.user.companyId)
    if (!subscriptionValidation.isValid) {
      return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
    }

    // Check if user has access to payroll features
    const hasPayrollAccess = await hasFeature(session.user.companyId, 'payroll_management')
    if (!hasPayrollAccess) {
      return NextResponse.json({ 
        error: "Payroll management requires a higher subscription plan" 
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    let whereClause: any = {
      companyId: session.user.companyId
    }

    if (employeeId) {
      whereClause.employeeId = employeeId
    }

    if (year) {
      const startDate = new Date(parseInt(year), 0, 1)
      const endDate = new Date(parseInt(year) + 1, 0, 1)
      whereClause.payPeriodStart = {
        gte: startDate,
        lt: endDate
      }
    }

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 1)
      whereClause.payPeriodStart = {
        gte: startDate,
        lt: endDate
      }
    }

    const payrollRecords = await prisma.payrollRecord.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true,
            position: true
          }
        }
      },
      orderBy: {
        payPeriodStart: 'desc'
      }
    })

    return NextResponse.json(payrollRecords)
  } catch (error) {
    console.error("Error fetching payroll records:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Validation schema for bulk payroll calculation
const bulkPayrollSchema = z.object({
  employeeIds: z.array(z.string().min(1, "Employee ID is required")),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
})

// POST /api/payroll - Calculate payroll for multiple employees
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate subscription and check payroll limits
    const subscriptionValidation = await validateSubscription(session.user.companyId)
    if (!subscriptionValidation.isValid) {
      return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
    }

    // Check if user has access to payroll features
    const hasPayrollAccess = await hasFeature(session.user.companyId, 'payroll_management')
    if (!hasPayrollAccess) {
      return NextResponse.json({ 
        error: "Payroll management requires a higher subscription plan" 
      }, { status: 403 })
    }

    // Check monthly payroll limit
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)
    
    const currentPayrollCount = await prisma.payrollRecord.count({
      where: {
        companyId: session.user.companyId,
        createdAt: {
          gte: currentMonth
        }
      }
    })

    const maxPayrolls = subscriptionValidation.limits?.maxPayrolls
    if (maxPayrolls && currentPayrollCount >= maxPayrolls) {
      return NextResponse.json({ 
        error: `Monthly payroll limit reached. Your plan allows up to ${maxPayrolls} payrolls per month.` 
      }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate the request body
    const validatedData = bulkPayrollSchema.parse(body)

    // Create date range for the payroll period
    const payPeriodStart = new Date(validatedData.year, validatedData.month - 1, 1)
    const payPeriodEnd = new Date(validatedData.year, validatedData.month, 0) // Last day of month

    // Get employees
    const employees = await prisma.employee.findMany({
      where: {
        id: { in: validatedData.employeeIds },
        companyId: session.user.companyId,
        isActive: true
      }
    })

    if (employees.length === 0) {
      return NextResponse.json({ error: "No valid employees found" }, { status: 404 })
    }

    // Get tax settings for the company
    const taxSettings = await prisma.taxSettings.findFirst({
      where: {
        companyId: session.user.companyId,
        taxYear: validatedData.year,
        isActive: true
      }
    })

    if (!taxSettings) {
      return NextResponse.json({ error: "Tax settings not found for this year" }, { status: 404 })
    }

    const calculations = []

    // Process each employee
    for (const employee of employees) {
      // Calculate gross pay
      let regularPay = 0
      let overtimePay = 0
      let hoursWorked = 0

      if (employee.employmentType === "monthly") {
        regularPay = employee.salary
        hoursWorked = 160 // Standard monthly hours
      } else {
        // For hourly employees, assume standard hours if not specified
        hoursWorked = 160
        regularPay = hoursWorked * employee.salary
      }

      // Calculate holiday allowance (8% of annual salary, paid proportionally)
      const holidayAllowance = (employee.salary * (taxSettings.holidayAllowanceRate / 100)) / 12

      const grossPay = regularPay + overtimePay + holidayAllowance

      // Calculate taxes and deductions
      const taxCalculations = calculateDutchTaxes(grossPay, taxSettings, employee.taxTable)

      const netPay = grossPay - taxCalculations.totalDeductions
      const employerCosts = grossPay + (grossPay * 0.20) // Approximate employer costs

      calculations.push({
        employeeId: employee.id,
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeNumber: employee.employeeNumber,
          position: employee.position,
          department: employee.department,
          employmentType: employee.employmentType,
          taxTable: employee.taxTable
        },
        payPeriod: {
          start: payPeriodStart,
          end: payPeriodEnd,
          month: validatedData.month,
          year: validatedData.year
        },
        hoursWorked,
        regularPay: Math.round(regularPay * 100) / 100,
        overtimePay: Math.round(overtimePay * 100) / 100,
        holidayAllowance: Math.round(holidayAllowance * 100) / 100,
        grossPay: Math.round(grossPay * 100) / 100,
        incomeTax: taxCalculations.incomeTax,
        aowContribution: taxCalculations.aowContribution,
        wlzContribution: taxCalculations.wlzContribution,
        wwContribution: taxCalculations.wwContribution,
        wiaContribution: taxCalculations.wiaContribution,
        totalDeductions: taxCalculations.totalDeductions,
        netPay: Math.round(netPay * 100) / 100,
        employerCosts: Math.round(employerCosts * 100) / 100
      })
    }

    // Calculate totals
    const totals = {
      totalGrossPay: calculations.reduce((sum, calc) => sum + calc.grossPay, 0),
      totalDeductions: calculations.reduce((sum, calc) => sum + calc.totalDeductions, 0),
      totalNetPay: calculations.reduce((sum, calc) => sum + calc.netPay, 0),
      totalEmployerCosts: calculations.reduce((sum, calc) => sum + calc.employerCosts, 0),
      employeeCount: calculations.length
    }

    return NextResponse.json({
      success: true,
      calculations,
      totals,
      payrollPeriod: {
        month: validatedData.month,
        year: validatedData.year,
        start: payPeriodStart,
        end: payPeriodEnd
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating payroll record:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

