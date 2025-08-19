import { hrClient, payrollClient } from '@/lib/database-clients'
import { calculateDutchPayroll, EmployeeData, CompanyData } from '@/lib/payroll-calculations'
import { withRetry } from '@/lib/database-retry'
import path from 'path'
import fs from 'fs/promises'

interface PayslipGenerationParams {
  employeeId: string
  year: number
  month: number
  companyId: string
}

interface PayslipGenerationResult {
  success: boolean
  fileName?: string
  filePath?: string
  error?: string
  payslipGeneration?: any
}

/**
 * Generate payslip for an employee and store it
 * This function can be called from payroll processing or on-demand generation
 */
export async function generatePayslip(params: PayslipGenerationParams): Promise<PayslipGenerationResult> {
  try {
    console.log(`🎯 [PayslipGenerator] Starting payslip generation for employee: ${params.employeeId}, period: ${params.year}-${params.month}`)

    // Get employee information from HR database with retry logic
    const employee = await withRetry(async () => {
      console.log('👤 Looking up employee in HR database')
      
      let emp = await hrClient.employee.findFirst({
        where: {
          id: params.employeeId,
          companyId: params.companyId,
          isActive: true
        }
      })
      
      // If not found by ID, try by employeeNumber (fallback for payroll records)
      if (!emp) {
        console.log('🔍 Employee not found by ID, trying by employeeNumber')
        emp = await hrClient.employee.findFirst({
          where: {
            employeeNumber: params.employeeId,
            companyId: params.companyId,
            isActive: true
          }
        })
      }
      
      return emp
    }, { maxRetries: 2, baseDelay: 500 })

    if (!employee) {
      console.error('❌ Employee not found:', params.employeeId)
      return { success: false, error: "Employee not found" }
    }

    console.log('✅ Employee found:', employee.firstName, employee.lastName)

    // Get company information from HR database with retry logic
    const company = await withRetry(async () => {
      console.log('🏢 Looking up company in HR database')
      return await hrClient.company.findUnique({
        where: { id: params.companyId }
      })
    }, { maxRetries: 2, baseDelay: 500 })

    if (!company) {
      console.error('❌ Company not found:', params.companyId)
      return { success: false, error: "Company not found" }
    }

    // Find the matching payroll record
    const payrollRecord = await payrollClient.payrollRecord.findFirst({
      where: {
        employeeId: params.employeeId,
        companyId: params.companyId,
        year: params.year,
        month: params.month
      }
    })

    let grossPay, holidayAllowance, loonheffing, grossPayAfterContributions;
    let aowContribution, wlzContribution, zvwContribution;

    if (payrollRecord) {
      // ✅ PERFORMANCE OPTIMIZATION: Use existing payroll data
      console.log(`🚀 Using cached payroll data for ${employee.firstName} ${employee.lastName} (${params.month}/${params.year})`)
      
      grossPay = payrollRecord.grossSalary
      holidayAllowance = payrollRecord.holidayAllowance || 0
      grossPayAfterContributions = payrollRecord.netSalary
      
      // Use stored social security contributions
      const totalSocialSecurity = payrollRecord.socialSecurity
      loonheffing = totalSocialSecurity
      
      // Calculate individual components from stored data
      aowContribution = grossPay * 0.1790 // 17.90% AOW
      wlzContribution = grossPay * 0.0965 // 9.65% WLZ  
      zvwContribution = grossPay * 0.0565 // 5.65% ZVW
      
    } else {
      // ⚠️ FALLBACK: Calculate if no payroll record exists
      console.log(`⚠️ No payroll record found, calculating from scratch for ${employee.firstName} ${employee.lastName} (${params.month}/${params.year})`)
      
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

    // Create payslip data
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
        month: params.month,
        year: params.year,
        startDate: new Date(params.year, params.month - 1, 1),
        endDate: new Date(params.year, params.month, 0)
      },
      earnings: {
        grossPay: grossPay,
        holidayAllowance: holidayAllowance,
        overtime: 0,
        bonus: 0,
        totalGross: grossPay + holidayAllowance
      },
      deductions: {
        loonheffing: loonheffing,
        aowContribution: aowContribution,
        wlzContribution: wlzContribution,
        zvwContribution: zvwContribution,
        totalDeductions: loonheffing + aowContribution + wlzContribution + zvwContribution
      },
      netPay: grossPayAfterContributions,
      generatedAt: new Date()
    }

    // Generate HTML content
    const htmlContent = generatePayslipHTML(payslipData)
    
    // Generate filename
    const fileName = `payslip-${employee.employeeNumber || employee.id}-${params.year}-${params.month.toString().padStart(2, '0')}.html`
    
    // Store payslip in temporary directory (serverless compatible)
    const payslipsDir = path.join('/tmp', 'payslips')
    await fs.mkdir(payslipsDir, { recursive: true })
    const filePath = path.join(payslipsDir, fileName)
    await fs.writeFile(filePath, htmlContent, 'utf8')

    console.log(`✅ Payslip HTML file created: ${filePath}`)

    // Create or update PayslipGeneration record
    const payslipGeneration = await withRetry(async () => {
      console.log('💾 Creating/updating PayslipGeneration record...')
      
      // Only create PayslipGeneration if we have a valid payrollRecord
      if (!payrollRecord) {
        console.log('⚠️ No payroll record found, skipping PayslipGeneration creation')
        return null
      }
      
      // Use upsert to handle both creation and updates
      return await payrollClient.payslipGeneration.upsert({
        where: {
          // Create a composite unique identifier
          payrollRecordId: payrollRecord.id
        },
        update: {
          fileName: fileName,
          filePath: `/payslips/${fileName}`,
          status: 'generated',
          generatedAt: new Date()
        },
        create: {
          payrollRecordId: payrollRecord.id,
          employeeId: params.employeeId,
          fileName: fileName,
          filePath: `/payslips/${fileName}`,
          status: 'generated',
          generatedAt: new Date(),
          companyId: params.companyId
        }
      })
    }, { maxRetries: 2, baseDelay: 300 })

    if (payslipGeneration) {
      console.log('✅ PayslipGeneration record created/updated successfully')
    } else {
      console.log('ℹ️ PayslipGeneration record not created (no payroll record)')
    }

    return {
      success: true,
      fileName,
      filePath: `/payslips/${fileName}`,
      payslipGeneration
    }

  } catch (error) {
    console.error('💥 [PayslipGenerator] Error generating payslip:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Generate HTML content for payslip
 */
function generatePayslipHTML(data: any): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loonstrook - ${data.Employee.firstName} ${data.Employee.lastName}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }
        .content {
            padding: 30px;
        }
        .company-info, .employee-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 6px;
        }
        .info-section h3 {
            margin: 0 0 15px 0;
            color: #495057;
            font-size: 16px;
            font-weight: 600;
        }
        .info-section p {
            margin: 5px 0;
            font-size: 14px;
            line-height: 1.4;
        }
        .pay-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 30px 0;
        }
        .earnings, .deductions {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
        }
        .earnings h3 {
            color: #28a745;
            margin: 0 0 15px 0;
            font-size: 18px;
        }
        .deductions h3 {
            color: #dc3545;
            margin: 0 0 15px 0;
            font-size: 18px;
        }
        .pay-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .pay-item:last-child {
            border-bottom: none;
            font-weight: 600;
            font-size: 16px;
            margin-top: 10px;
            padding-top: 15px;
            border-top: 2px solid #dee2e6;
        }
        .net-pay {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 25px;
            text-align: center;
            margin: 30px 0;
            border-radius: 6px;
        }
        .net-pay h2 {
            margin: 0;
            font-size: 24px;
            font-weight: 300;
        }
        .net-pay .amount {
            font-size: 36px;
            font-weight: 600;
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #6c757d;
            font-size: 12px;
        }
        @media (max-width: 768px) {
            .company-info, .employee-info {
                flex-direction: column;
                gap: 20px;
            }
            .pay-details {
                grid-template-columns: 1fr;
                gap: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="payslip-container">
        <div class="header">
            <h1>Loonstrook</h1>
            <p>${data.payPeriod.month}/${data.payPeriod.year}</p>
        </div>
        
        <div class="content">
            <div class="company-info">
                <div class="info-section">
                    <h3>Werkgever</h3>
                    <p><strong>${data.Company.name}</strong></p>
                    <p>${data.Company.address}</p>
                    <p>${data.Company.postalCode} ${data.Company.city}</p>
                    <p>KvK: ${data.Company.kvkNumber}</p>
                    <p>Fiscaal nr: ${data.Company.taxNumber}</p>
                </div>
                <div class="info-section">
                    <h3>Werknemer</h3>
                    <p><strong>${data.Employee.firstName} ${data.Employee.lastName}</strong></p>
                    <p>Personeelsnummer: ${data.Employee.employeeNumber}</p>
                    <p>Functie: ${data.Employee.position}</p>
                    <p>Afdeling: ${data.Employee.department}</p>
                    <p>BSN: ${data.Employee.bsn}</p>
                    <p>Loontabel: ${data.Employee.taxTable}</p>
                </div>
            </div>

            <div class="pay-details">
                <div class="earnings">
                    <h3>Inkomsten</h3>
                    <div class="pay-item">
                        <span>Bruto loon</span>
                        <span>€${data.earnings.grossPay.toFixed(2)}</span>
                    </div>
                    <div class="pay-item">
                        <span>Vakantietoeslag</span>
                        <span>€${data.earnings.holidayAllowance.toFixed(2)}</span>
                    </div>
                    <div class="pay-item">
                        <span>Overwerk</span>
                        <span>€${data.earnings.overtime.toFixed(2)}</span>
                    </div>
                    <div class="pay-item">
                        <span>Bonus</span>
                        <span>€${data.earnings.bonus.toFixed(2)}</span>
                    </div>
                    <div class="pay-item">
                        <span><strong>Totaal Bruto</strong></span>
                        <span><strong>€${data.earnings.totalGross.toFixed(2)}</strong></span>
                    </div>
                </div>

                <div class="deductions">
                    <h3>Inhoudingen</h3>
                    <div class="pay-item">
                        <span>Loonheffing</span>
                        <span>€${data.deductions.loonheffing.toFixed(2)}</span>
                    </div>
                    <div class="pay-item">
                        <span>AOW-premie</span>
                        <span>€${data.deductions.aowContribution.toFixed(2)}</span>
                    </div>
                    <div class="pay-item">
                        <span>WLZ-premie</span>
                        <span>€${data.deductions.wlzContribution.toFixed(2)}</span>
                    </div>
                    <div class="pay-item">
                        <span>ZVW-premie</span>
                        <span>€${data.deductions.zvwContribution.toFixed(2)}</span>
                    </div>
                    <div class="pay-item">
                        <span><strong>Totaal Inhoudingen</strong></span>
                        <span><strong>€${data.deductions.totalDeductions.toFixed(2)}</strong></span>
                    </div>
                </div>
            </div>

            <div class="net-pay">
                <h2>Netto Uitbetaling</h2>
                <div class="amount">€${data.netPay.toFixed(2)}</div>
                <p>Te betalen op ${new Date().toLocaleDateString('nl-NL')}</p>
            </div>
        </div>

        <div class="footer">
            <p>Deze loonstrook is gegenereerd op ${data.generatedAt.toLocaleDateString('nl-NL')} om ${data.generatedAt.toLocaleTimeString('nl-NL')}</p>
            <p>Voor vragen over uw loonstrook kunt u contact opnemen met de HR-afdeling</p>
        </div>
    </div>
</body>
</html>`
}

