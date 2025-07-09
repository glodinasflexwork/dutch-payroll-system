import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { calculateDutchPayroll, type EmployeeData, type CompanyData } from "@/lib/payroll-calculations"

// Validation schema for payslip generation
const payslipSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
})

// GET /api/payslips - Generate payslip for an employee
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

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

    // Get company information
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Prepare data for payroll calculation
    const employeeData: EmployeeData = {
      annualSalary: employee.annualSalary,
      age: new Date().getFullYear() - new Date(employee.dateOfBirth).getFullYear(),
      hasAOWExemption: employee.hasAOWExemption || false,
      taxTable: employee.taxTable || 'green',
      payrollTaxCredit: employee.payrollTaxCredit || 0
    }

    const companyData: CompanyData = {
      sector: company.sector || 'general',
      hasCollectiveAgreement: company.hasCollectiveAgreement || false
    }

    // Calculate using the corrected Dutch payroll library
    const payrollResult = calculateDutchPayroll(employeeData, companyData)

    // Extract the correct values (no income tax, only social insurance)
    const grossPay = payrollResult.grossMonthlySalary
    const holidayAllowance = payrollResult.holidayAllowanceGross / 12 // Monthly portion
    
    // Loonheffing = only social insurance contributions (AOW + WLZ + ZVW)
    const loonheffing = payrollResult.totalTaxAndInsurance / 12 // Monthly portion
    const netPay = payrollResult.netMonthlySalary

    // Individual components for display (monthly amounts)
    const aowContribution = payrollResult.aowContribution / 12
    const wlzContribution = payrollResult.wlzContribution / 12
    const zvwContribution = (payrollResult.grossAnnualSalary * 0.0565) / 12 // ZVW health care

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
        incomeTax: 0,
        aowContribution: Math.round(aowContribution * 100) / 100,
        wlzContribution: Math.round(wlzContribution * 100) / 100,
        zvwContribution: Math.round(zvwContribution * 100) / 100,
        // WW and WIA are employer-paid, not employee deductions
        wwContribution: 0,
        wiaContribution: 0,
        totalDeductions: Math.round(loonheffing * 100) / 100
      },
      netPay: Math.round(netPay * 100) / 100,
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = payslipSchema.parse(body)

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

    // Get company information
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Prepare data for payroll calculation
    const employeeData: EmployeeData = {
      annualSalary: employee.annualSalary,
      age: new Date().getFullYear() - new Date(employee.dateOfBirth).getFullYear(),
      hasAOWExemption: employee.hasAOWExemption || false,
      taxTable: employee.taxTable || 'green',
      payrollTaxCredit: employee.payrollTaxCredit || 0
    }

    const companyData: CompanyData = {
      sector: company.sector || 'general',
      hasCollectiveAgreement: company.hasCollectiveAgreement || false
    }

    // Calculate using the corrected Dutch payroll library
    const payrollResult = calculateDutchPayroll(employeeData, companyData)

    // Extract the correct values (no income tax, only social insurance)
    const grossPay = payrollResult.grossMonthlySalary
    const holidayAllowance = payrollResult.holidayAllowanceGross / 12 // Monthly portion
    
    // Loonheffing = only social insurance contributions (AOW + WLZ + ZVW)
    const loonheffing = payrollResult.totalTaxAndInsurance / 12 // Monthly portion
    const netPay = payrollResult.netMonthlySalary

    // Individual components for display (monthly amounts)
    const aowContribution = payrollResult.aowContribution / 12
    const wlzContribution = payrollResult.wlzContribution / 12
    const zvwContribution = (payrollResult.grossAnnualSalary * 0.0565) / 12 // ZVW health care

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
        incomeTax: 0,
        aowContribution: Math.round(aowContribution * 100) / 100,
        wlzContribution: Math.round(wlzContribution * 100) / 100,
        zvwContribution: Math.round(zvwContribution * 100) / 100,
        // WW and WIA are employer-paid, not employee deductions
        wwContribution: 0,
        wiaContribution: 0,
        totalDeductions: Math.round(loonheffing * 100) / 100
      },
      netPay: Math.round(netPay * 100) / 100,
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
                <strong>${payslipData.company.name}</strong><br>
                ${payslipData.company.address}<br>
                ${payslipData.company.postalCode} ${payslipData.company.city}<br>
                KvK: ${payslipData.company.kvkNumber} | BTW: ${payslipData.company.taxNumber}
            </div>
        </div>

        <div class="employee-info">
            <h3>Werknemergegevens</h3>
            <p><strong>Naam:</strong> ${payslipData.employee.firstName} ${payslipData.employee.lastName}</p>
            <p><strong>Personeelsnummer:</strong> ${payslipData.employee.employeeNumber}</p>
            <p><strong>Functie:</strong> ${payslipData.employee.position}</p>
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
                    <td class="amount"><strong>${payslipData.netPay.toFixed(2)}</strong></td>
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

    return NextResponse.json({
      success: true,
      html: htmlContent,
      payslip: payslipData
    })

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

