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
    const company = await prisma.company.findFirst({
      where: {
        id: session.user.companyId
      }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Use the correct Dutch payroll calculation library
    const employeeData: EmployeeData = {
      grossMonthlySalary: employee.salary,
      dateOfBirth: new Date(employee.dateOfBirth),
      isDGA: employee.isDGA || false,
      taxTable: employee.taxTable as 'wit' | 'groen',
      taxCredit: 0, // Standard credit handled in calculation
      isYoungDisabled: false,
      hasMultipleJobs: false
    }

    const companyData: CompanyData = {
      size: 'medium', // Default
      sector: 'general',
      awfRate: 'low',
      aofRate: 'low'
    }

    // Calculate using the corrected Dutch payroll library
    const payrollResult = calculateDutchPayroll(employeeData, companyData)

    // Extract the correct values (no income tax, only social insurance)
    const grossPay = payrollResult.grossMonthlySalary
    const holidayAllowance = payrollResult.holidayAllowanceGross / 12 // Monthly portion
    
    // Loonheffing = only social insurance contributions (AOW + ANW + WLZ + ZVW)
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
        anwContribution: Math.round(anwContribution * 100) / 100,
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
        anwRate: 0.10,
        wlzRate: 9.65,
        zvwRate: 5.65,
        // Income tax not calculated monthly
        incomeTaxRate1: 0,
        incomeTaxRate2: 0,
        wwRate: 0, // Employer-paid
        wiaRate: 0 // Employer-paid
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
    const company = await prisma.company.findFirst({
      where: {
        id: session.user.companyId
      }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Use the correct Dutch payroll calculation library
    const employeeData: EmployeeData = {
      grossMonthlySalary: employee.salary,
      dateOfBirth: new Date(employee.dateOfBirth),
      isDGA: employee.isDGA || false,
      taxTable: employee.taxTable as 'wit' | 'groen',
      taxCredit: 0, // Standard credit handled in calculation
      isYoungDisabled: false,
      hasMultipleJobs: false
    }

    const companyData: CompanyData = {
      size: 'medium', // Default
      sector: 'general',
      awfRate: 'low',
      aofRate: 'low'
    }

    // Calculate using the corrected Dutch payroll library
    const payrollResult = calculateDutchPayroll(employeeData, companyData)

    // Extract the correct values (no income tax, only social insurance)
    const grossPay = payrollResult.grossMonthlySalary
    const holidayAllowance = payrollResult.holidayAllowanceGross / 12 // Monthly portion
    
    // Loonheffing = only social insurance contributions (AOW + ANW + WLZ + ZVW)
    const loonheffing = payrollResult.totalTaxAndInsurance / 12 // Monthly portion
    const netPay = payrollResult.netMonthlySalary

    // Individual components for display (monthly amounts)
    const aowContribution = payrollResult.aowContribution / 12
    const anwContribution = payrollResult.anwContribution / 12
    const wlzContribution = payrollResult.wlzContribution / 12
    const zvwContribution = (payrollResult.grossAnnualSalary * 0.0565) / 12 // ZVW health care

    // Create payslip data with corrected amounts
    const payslip = {
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
        anwContribution: Math.round(anwContribution * 100) / 100,
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
        anwRate: 0.10,
        wlzRate: 9.65,
        zvwRate: 5.65,
        // Income tax not calculated monthly
        incomeTaxRate1: 0,
        incomeTaxRate2: 0,
        wwRate: 0, // Employer-paid
        wiaRate: 0, // Employer-paid
        holidayAllowanceRate: 8.33
      },
      generatedAt: new Date().toISOString()
    }

    // Generate HTML content for the payslip
    const htmlContent = generatePayslipHTML(payslip)

    return NextResponse.json({
      success: true,
      html: htmlContent,
      filename: `payslip-${payslip.employee.firstName}-${payslip.employee.lastName}-${payslip.payPeriod.monthName}-${payslip.payPeriod.year}.html`
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error generating PDF payslip:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function generatePayslipHTML(payslip: any): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL')
  }

  return `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loonstrook - ${payslip.employee.firstName} ${payslip.employee.lastName}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .payslip-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 5px 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1d4ed8;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        .info-label {
            font-weight: 500;
            color: #6b7280;
        }
        .info-value {
            font-weight: 600;
            color: #111827;
        }
        .earnings-table, .deductions-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .earnings-table th, .deductions-table th {
            background-color: #f9fafb;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }
        .earnings-table td, .deductions-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #f3f4f6;
        }
        .amount {
            text-align: right;
            font-weight: 600;
        }
        .positive {
            color: #059669;
        }
        .negative {
            color: #dc2626;
        }
        .total-row {
            background-color: #f9fafb;
            font-weight: bold;
        }
        .net-pay {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .net-pay h3 {
            margin: 0 0 10px 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .net-pay .amount {
            font-size: 32px;
            font-weight: bold;
            margin: 0;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        @media print {
            body { background-color: white; }
            .payslip-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="payslip-container">
        <div class="header">
            <h1>LOONSTROOK</h1>
            <p>${payslip.payPeriod.monthName} ${payslip.payPeriod.year}</p>
            <p>${payslip.company.name}</p>
        </div>
        
        <div class="content">
            <!-- Company & Employee Info -->
            <div class="section">
                <div class="info-grid">
                    <div>
                        <h3 class="section-title">Werkgever</h3>
                        <div class="info-item">
                            <span class="info-label">Bedrijfsnaam:</span>
                            <span class="info-value">${payslip.company.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">KvK nummer:</span>
                            <span class="info-value">${payslip.company.kvkNumber}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Loonheffingsnummer:</span>
                            <span class="info-value">${payslip.company.taxNumber}</span>
                        </div>
                    </div>
                    <div>
                        <h3 class="section-title">Werknemer</h3>
                        <div class="info-item">
                            <span class="info-label">Naam:</span>
                            <span class="info-value">${payslip.employee.firstName} ${payslip.employee.lastName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Personeelsnummer:</span>
                            <span class="info-value">${payslip.employee.employeeNumber}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">BSN:</span>
                            <span class="info-value">${payslip.employee.bsn}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Functie:</span>
                            <span class="info-value">${payslip.employee.position}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Afdeling:</span>
                            <span class="info-value">${payslip.employee.department}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Loonheffingstabel:</span>
                            <span class="info-value">${payslip.employee.taxTable.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Earnings -->
            <div class="section">
                <h3 class="section-title">Inkomsten</h3>
                <table class="earnings-table">
                    <thead>
                        <tr>
                            <th>Omschrijving</th>
                            <th>Uren</th>
                            <th>Bedrag</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Basissalaris</td>
                            <td>${payslip.earnings.hoursWorked}</td>
                            <td class="amount positive">${formatCurrency(payslip.earnings.baseSalary)}</td>
                        </tr>
                        <tr>
                            <td>Vakantiegeld (8%)</td>
                            <td>-</td>
                            <td class="amount positive">${formatCurrency(payslip.earnings.holidayAllowance)}</td>
                        </tr>
                        <tr class="total-row">
                            <td><strong>Brutoloon</strong></td>
                            <td><strong>${payslip.earnings.hoursWorked}</strong></td>
                            <td class="amount positive"><strong>${formatCurrency(payslip.earnings.grossPay)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Deductions -->
            <div class="section">
                <h3 class="section-title">Inhoudingen</h3>
                <table class="deductions-table">
                    <thead>
                        <tr>
                            <th>Omschrijving</th>
                            <th>Bedrag</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Loonheffing</td>
                            <td class="amount negative">${formatCurrency(payslip.deductions.totalDeductions)}</td>
                        </tr>
                    </tbody>
                </table>
                <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
                    <em>Loonheffing bevat: AOW (${payslip.taxRates.aowRate}%), ANW (${payslip.taxRates.anwRate}%), WLZ (${payslip.taxRates.wlzRate}%), ZVW (${payslip.taxRates.zvwRate}%)</em><br>
                    <em>Inkomstenbelasting wordt jaarlijks afgerekend door de boekhouding</em>
                </p>
            </div>

            <!-- Net Pay -->
            <div class="net-pay">
                <h3>NETTO UITBETALING</h3>
                <p class="amount">${formatCurrency(payslip.netPay)}</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Dit document is automatisch gegenereerd door SalarySync op ${formatDate(payslip.generatedAt)}</p>
            <p>Voor vragen over deze loonstrook kunt u contact opnemen met de HR-afdeling</p>
        </div>
    </div>
</body>
</html>
`
}

