import { hrClient, payrollClient } from '@/lib/database-clients'
import { calculateDutchPayroll, EmployeeData, CompanyData } from '@/lib/payroll-calculations'
import { withRetry } from '@/lib/database-retry'
import { generateProfessionalDutchPayslip, PayslipData } from '@/lib/payslip-template-professional'
import { formatDutchCurrency, formatDutchDate, generateLoonheffingennummer } from '@/lib/dutch-formatting'
import { calculateCumulativeData } from '@/lib/cumulative-calculations'
import { checkMinimumWageCompliance } from '@/lib/dutch-minimum-wage'
import { calculateSocialSecurityBreakdown } from '@/lib/dutch-social-security'
import { calculateWorkingHours } from '@/lib/working-hours-calculator'
import { calculateHolidayAllowance, calculateVacationDays } from '@/lib/holiday-allowance-calculator'
import path from 'path'
import fs from 'fs/promises'

interface PayslipGenerationParams {
  employeeId: string
  year: number
  month: number
  companyId?: string
}

interface PayslipGenerationResult {
  success: boolean
  fileName?: string
  filePath?: string
  payslipGeneration?: any
  error?: string
}

/**
 * Generate a payslip for an employee for a specific period
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

    // Find the matching payroll record with enhanced lookup strategy
    console.log(`🔍 Looking up payroll record for employee: ${params.employeeId}, period: ${params.year}-${params.month}`)
    
    let payrollRecord = await payrollClient.payrollRecord.findFirst({
      where: {
        employeeId: params.employeeId,
        companyId: params.companyId,
        year: params.year,
        month: params.month
      }
    })

    // If not found by employeeId, try by employeeNumber (fallback strategy)
    if (!payrollRecord && employee.employeeNumber) {
      console.log(`🔄 Payroll record not found by employeeId, trying employeeNumber: ${employee.employeeNumber}`)
      payrollRecord = await payrollClient.payrollRecord.findFirst({
        where: {
          employeeId: employee.employeeNumber,
          companyId: params.companyId,
          year: params.year,
          month: params.month
        }
      })
    }

    // Additional fallback: try by employeeNumber field directly
    if (!payrollRecord && employee.employeeNumber) {
      console.log(`🔄 Trying payroll lookup by employeeNumber field`)
      payrollRecord = await payrollClient.payrollRecord.findFirst({
        where: {
          employeeNumber: employee.employeeNumber,
          companyId: params.companyId,
          year: params.year,
          month: params.month
        }
      })
    }

    if (payrollRecord) {
      console.log(`✅ Found payroll record: ${payrollRecord.id} for ${payrollRecord.firstName} ${payrollRecord.lastName}`)
    } else {
      console.log(`⚠️ No payroll record found for employee: ${params.employeeId} (${employee.employeeNumber}), period: ${params.year}-${params.month}`)
      
      // Debug: Let's see what payroll records exist for this company and employee
      console.log(`🔍 Debug: Checking all payroll records for company ${params.companyId}`)
      const allRecords = await payrollClient.payrollRecord.findMany({
        where: { companyId: params.companyId },
        select: { 
          id: true, 
          employeeId: true, 
          employeeNumber: true, 
          firstName: true, 
          lastName: true, 
          year: true, 
          month: true 
        },
        take: 10
      })
      console.log(`📋 Found ${allRecords.length} payroll records:`, allRecords)
      
      // Check for records with this specific employee
      const employeeRecords = allRecords.filter(r => 
        r.employeeId === params.employeeId || 
        r.employeeId === employee.employeeNumber ||
        r.employeeNumber === employee.employeeNumber
      )
      console.log(`👤 Records for this employee:`, employeeRecords)
    }

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

    // Calculate proper cumulative (year-to-date) totals
    console.log(`🧮 Calculating cumulative totals for ${employee.firstName} ${employee.lastName}`)
    const cumulativeData = await calculateCumulativeData(
      params.employeeId,
      params.companyId,
      params.year,
      params.month
    )

    // ✅ PHASE 1 COMPLIANCE ENHANCEMENTS
    console.log(`📋 Calculating compliance data for ${employee.firstName} ${employee.lastName}`)
    
    // 1. Minimum wage compliance check
    const minimumWageData = checkMinimumWageCompliance(
      grossPay,
      employee.dateOfBirth || new Date('1990-01-01'),
      employee.contractHours || 40,
      new Date(params.year, params.month - 1, 1)
    )
    
    // 2. Detailed social security breakdown
    const socialSecurityBreakdown = calculateSocialSecurityBreakdown(grossPay)
    
    // 3. Working hours information
    const workingHoursData = calculateWorkingHours(
      employee.contractHours || 40,
      employee.actualHours || employee.contractHours || 176, // Default monthly hours
      grossPay,
      params.year,
      params.month,
      employee.startDate,
      undefined // No end date for active employees
    )
    
    // 4. Holiday allowance transparency
    const holidayAllowanceData = calculateHolidayAllowance(
      (employee.salary || 42000), // Annual salary
      grossPay,
      8.33, // Standard 8.33% rate
      params.year,
      params.month,
      employee.startDate
    )
    
    const vacationDaysData = calculateVacationDays(
      employee.contractHours || 40,
      25, // Standard 25 vacation days
      params.year,
      params.month,
      employee.startDate,
      0 // Vacation days used - would need to be tracked
    )

    console.log(`✅ Compliance data calculated:`)
    console.log(`   - Minimum wage: ${minimumWageData.complianceMessage}`)
    console.log(`   - Social security: €${socialSecurityBreakdown.total.amount.toFixed(2)}`)
    console.log(`   - Working hours: ${workingHoursData.compliance.message}`)
    console.log(`   - Holiday allowance: ${holidayAllowanceData.compliance.message}`)

    // Create payslip data
    // Prepare data for professional Dutch payslip template
    const payslipData: PayslipData = {
      company: {
        name: company.name,
        streetName: company.address?.split(' ')[0] || '',
        houseNumber: company.address?.split(' ')[1] || '',
        postalCode: company.postalCode || '',
        city: company.city || '',
        payrollTaxNumber: company.loonheffingennummer || generateLoonheffingennummer(company.id),
        kvkNumber: company.kvkNumber || ''
      },
      employee: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        streetName: employee.streetName || '',
        houseNumber: employee.houseNumber || '',
        houseNumberAddition: employee.houseNumberAddition || '',
        postalCode: employee.postalCode || '',
        city: employee.city || '',
        employeeNumber: employee.employeeNumber || '',
        bsn: employee.bsn,
        dateOfBirth: employee.dateOfBirth,
        startDate: employee.startDate,
        position: employee.position || '',
        department: employee.department || '',
        employmentType: employee.employmentType,
        taxTable: employee.taxTable || 'wit',
        hourlyRate: employee.hourlyRate,
        gender: employee.gender || 'male'
      },
      period: {
        year: params.year,
        month: params.month,
        periodNumber: params.month,
        startDate: new Date(params.year, params.month - 1, 1),
        endDate: new Date(params.year, params.month, 0)
      },
      salary: {
        grossSalary: grossPay,
        netSalary: grossPayAfterContributions,
        taxDeduction: loonheffing,
        socialSecurity: aowContribution + wlzContribution + zvwContribution,
        pensionDeduction: 0,
        otherDeductions: 0,
        overtime: 0,
        bonus: 0,
        holidayAllowance: holidayAllowance,
        expenses: 0,
        vacationReserve: holidayAllowance
      },
      cumulative: cumulativeData, // ✅ Use proper cumulative calculations
      additional: {
        bankAccount: employee.bankAccount || '',
        paymentDate: new Date(params.year, params.month, 25), // 25th of the month
        vacationHours: {
          begin: 0,
          used: 0,
          added: 14.62, // Standard vacation hours per month
          balance: 14.62,
          thisPeriod: 14.62
        }
      },
      // ✅ PHASE 1 COMPLIANCE ENHANCEMENTS
      compliance: {
        minimumWage: {
          amount: minimumWageData.amount,
          ageCategory: minimumWageData.ageCategory,
          isCompliant: minimumWageData.isCompliant,
          complianceMessage: minimumWageData.complianceMessage,
          monthlyAmount: minimumWageData.monthlyAmount
        },
        socialSecurityBreakdown,
        workingHours: workingHoursData,
        holidayAllowance: holidayAllowanceData,
        vacationDays: vacationDaysData
      }
    }

    // Generate professional Dutch HTML content
    const htmlContent = generateProfessionalDutchPayslip(payslipData)
    
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
