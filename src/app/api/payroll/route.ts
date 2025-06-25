import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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

// POST /api/payroll - Calculate and create a new payroll record
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the request body
    const validatedData = payrollSchema.parse(body)

    // Get employee information
    const employee = await prisma.employee.findFirst({
      where: {
        id: validatedData.employeeId,
        companyId: session.user.companyId,
        isActive: true
      }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Get tax settings for the company
    const taxSettings = await prisma.taxSettings.findFirst({
      where: {
        companyId: session.user.companyId,
        taxYear: new Date().getFullYear(),
        isActive: true
      }
    })

    if (!taxSettings) {
      return NextResponse.json({ error: "Tax settings not found" }, { status: 404 })
    }

    // Calculate gross pay
    let regularPay = 0
    let overtimePay = 0

    if (employee.employmentType === "monthly") {
      regularPay = employee.salary
      overtimePay = 0 // Monthly employees typically don't get overtime
    } else {
      // Hourly employee
      regularPay = validatedData.hoursWorked * employee.salary
      overtimePay = validatedData.overtimeHours * employee.salary * validatedData.overtimeRate
    }

    // Calculate holiday allowance (8% of annual salary, paid proportionally)
    const holidayAllowance = (employee.salary * (taxSettings.holidayAllowanceRate / 100)) / 12

    const grossPay = regularPay + overtimePay + holidayAllowance

    // Calculate taxes and deductions
    const taxCalculations = calculateDutchTaxes(grossPay, taxSettings, employee.taxTable)

    const netPay = grossPay - taxCalculations.totalDeductions

    // Check if payroll record already exists for this period
    const existingRecord = await prisma.payrollRecord.findFirst({
      where: {
        employeeId: validatedData.employeeId,
        payPeriodStart: validatedData.payPeriodStart,
        payPeriodEnd: validatedData.payPeriodEnd
      }
    })

    if (existingRecord) {
      return NextResponse.json(
        { error: "Payroll record already exists for this period" },
        { status: 400 }
      )
    }

    // Create the payroll record
    const payrollRecord = await prisma.payrollRecord.create({
      data: {
        employeeId: validatedData.employeeId,
        companyId: session.user.companyId,
        payPeriodStart: validatedData.payPeriodStart,
        payPeriodEnd: validatedData.payPeriodEnd,
        baseSalary: employee.salary,
        hoursWorked: validatedData.hoursWorked,
        overtimeHours: validatedData.overtimeHours,
        overtimeRate: validatedData.overtimeRate,
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
        taxTable: employee.taxTable,
        taxYear: new Date().getFullYear()
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true,
            position: true
          }
        }
      }
    })

    return NextResponse.json(payrollRecord, { status: 201 })
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

