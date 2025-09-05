import { payrollClient } from '@/lib/database-clients'
import { withRetry } from '@/lib/database-retry'

/**
 * Interface for cumulative payroll data
 */
export interface CumulativeData {
  workDays: number
  workHours: number
  grossSalary: number
  otherGross: number
  taxableIncome: number
  wga: number
  taxDeduction: number
  workDiscount: number
  vacationAllowance: number
  netSalary: number
  socialSecurity: number
  pensionDeduction: number
  otherDeductions: number
  overtime: number
  bonus: number
  expenses: number
}

/**
 * Calculate cumulative (year-to-date) totals for an employee
 * This function aggregates all payroll records from January 1st through the specified month
 */
export async function calculateCumulativeData(
  employeeId: string,
  companyId: string,
  year: number,
  month: number
): Promise<CumulativeData> {
  try {
    console.log(`🧮 [CumulativeCalculations] Calculating YTD totals for employee: ${employeeId}, period: ${year}-${month}`)

    // Query all payroll records for this employee from January through the current month
    const payrollRecords = await withRetry(async () => {
      console.log(`📊 Querying payroll records from ${year}-01 through ${year}-${month.toString().padStart(2, '0')}`)
      
      // Try multiple lookup strategies to find payroll records
      let records = await getPayrollClient().payrollRecord.findMany({
        where: {
          employeeId: employeeId,
          companyId: companyId,
          year: year,
          month: {
            gte: 1,
            lte: month
          }
        },
        orderBy: [
          { year: 'asc' },
          { month: 'asc' }
        ]
      })

      // If no records found by employeeId, try by employeeNumber
      if (records.length === 0) {
        console.log(`🔄 No records found by employeeId, trying alternative lookup strategies`)
        
        // Get employee info to find employeeNumber
        const { hrClient } = require('@/lib/database-clients')
        const employee = await getHRClient().employee.findFirst({
          where: {
            id: employeeId,
            companyId: companyId,
            isActive: true
          }
        })

        if (employee?.employeeNumber) {
          console.log(`🔍 Trying lookup by employeeNumber: ${employee.employeeNumber}`)
          
          // Try by employeeId field matching employeeNumber
          records = await getPayrollClient().payrollRecord.findMany({
            where: {
              employeeId: employee.employeeNumber,
              companyId: companyId,
              year: year,
              month: {
                gte: 1,
                lte: month
              }
            },
            orderBy: [
              { year: 'asc' },
              { month: 'asc' }
            ]
          })

          // Try by employeeNumber field
          if (records.length === 0) {
            records = await getPayrollClient().payrollRecord.findMany({
              where: {
                employeeNumber: employee.employeeNumber,
                companyId: companyId,
                year: year,
                month: {
                  gte: 1,
                  lte: month
                }
              },
              orderBy: [
                { year: 'asc' },
                { month: 'asc' }
              ]
            })
          }
        }
      }

      return records
    }, { maxRetries: 2, baseDelay: 500 })

    console.log(`✅ Found ${payrollRecords.length} payroll records for cumulative calculation`)

    if (payrollRecords.length === 0) {
      console.log(`⚠️ No payroll records found for employee ${employeeId} in ${year}`)
      // Return zero values for all cumulative fields
      return {
        workDays: 0,
        workHours: 0,
        grossSalary: 0,
        otherGross: 0,
        taxableIncome: 0,
        wga: 0,
        taxDeduction: 0,
        workDiscount: 0,
        vacationAllowance: 0,
        netSalary: 0,
        socialSecurity: 0,
        pensionDeduction: 0,
        otherDeductions: 0,
        overtime: 0,
        bonus: 0,
        expenses: 0
      }
    }

    // Calculate cumulative totals by summing all records
    const cumulative: CumulativeData = {
      workDays: 0,
      workHours: 0,
      grossSalary: 0,
      otherGross: 0,
      taxableIncome: 0,
      wga: 0,
      taxDeduction: 0,
      workDiscount: 0,
      vacationAllowance: 0,
      netSalary: 0,
      socialSecurity: 0,
      pensionDeduction: 0,
      otherDeductions: 0,
      overtime: 0,
      bonus: 0,
      expenses: 0
    }

    // Aggregate all payroll records
    payrollRecords.forEach((record, index) => {
      console.log(`📋 Processing record ${index + 1}: ${record.year}-${record.month.toString().padStart(2, '0')} - Gross: €${record.grossSalary}`)
      
      // Standard working days and hours per month (Dutch standard)
      cumulative.workDays += 22 // Standard working days per month
      cumulative.workHours += 176 // Standard working hours per month (22 * 8)
      
      // Core salary components
      cumulative.grossSalary += record.grossSalary || 0
      cumulative.netSalary += record.netSalary || 0
      cumulative.taxDeduction += record.taxDeduction || 0
      cumulative.socialSecurity += record.socialSecurity || 0
      
      // Additional compensation
      cumulative.vacationAllowance += record.holidayAllowance || 0
      cumulative.overtime += record.overtime || 0
      cumulative.bonus += record.bonus || 0
      cumulative.expenses += record.expenses || 0
      
      // Deductions
      cumulative.pensionDeduction += record.pensionDeduction || 0
      cumulative.otherDeductions += record.otherDeductions || 0
      
      // Calculate other gross (holiday allowance + overtime + bonus)
      cumulative.otherGross += (record.holidayAllowance || 0) + (record.overtime || 0) + (record.bonus || 0)
    })

    // Calculate taxable income (gross + other gross)
    cumulative.taxableIncome = cumulative.grossSalary + cumulative.otherGross

    // WGA and work discount are typically 0 for standard employees
    cumulative.wga = 0
    cumulative.workDiscount = 0

    console.log(`🎯 [CumulativeCalculations] Calculated YTD totals:`)
    console.log(`   YTD Gross Salary: €${cumulative.grossSalary.toFixed(2)}`)
    console.log(`   YTD Net Salary: €${cumulative.netSalary.toFixed(2)}`)
    console.log(`   YTD Tax Deduction: €${cumulative.taxDeduction.toFixed(2)}`)
    console.log(`   YTD Social Security: €${cumulative.socialSecurity.toFixed(2)}`)
    console.log(`   YTD Holiday Allowance: €${cumulative.vacationAllowance.toFixed(2)}`)
    console.log(`   YTD Work Days: ${cumulative.workDays}`)
    console.log(`   YTD Work Hours: ${cumulative.workHours}`)

    return cumulative

  } catch (error) {
    console.error('💥 [CumulativeCalculations] Error calculating cumulative data:', error)
    throw new Error(`Failed to calculate cumulative data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Validate cumulative calculations against individual payroll records
 * This function helps ensure data integrity and identify calculation discrepancies
 */
export async function validateCumulativeCalculations(
  employeeId: string,
  companyId: string,
  year: number,
  month: number
): Promise<{
  isValid: boolean
  discrepancies: string[]
  calculatedCumulative: CumulativeData
}> {
  try {
    console.log(`🔍 [CumulativeValidation] Validating cumulative calculations for employee: ${employeeId}`)

    const calculatedCumulative = await calculateCumulativeData(employeeId, companyId, year, month)
    const discrepancies: string[] = []

    // Get individual records for validation
    const payrollRecords = await getPayrollClient().payrollRecord.findMany({
      where: {
        employeeId: employeeId,
        companyId: companyId,
        year: year,
        month: {
          gte: 1,
          lte: month
        }
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' }
      ]
    })

    // Validate that cumulative totals match sum of individual records
    const manualSum = payrollRecords.reduce((sum, record) => ({
      grossSalary: sum.grossSalary + (record.grossSalary || 0),
      netSalary: sum.netSalary + (record.netSalary || 0),
      taxDeduction: sum.taxDeduction + (record.taxDeduction || 0),
      socialSecurity: sum.socialSecurity + (record.socialSecurity || 0)
    }), { grossSalary: 0, netSalary: 0, taxDeduction: 0, socialSecurity: 0 })

    // Check for discrepancies (allow for small rounding differences)
    const tolerance = 0.01
    
    if (Math.abs(calculatedCumulative.grossSalary - manualSum.grossSalary) > tolerance) {
      discrepancies.push(`Gross salary mismatch: calculated ${calculatedCumulative.grossSalary}, expected ${manualSum.grossSalary}`)
    }
    
    if (Math.abs(calculatedCumulative.netSalary - manualSum.netSalary) > tolerance) {
      discrepancies.push(`Net salary mismatch: calculated ${calculatedCumulative.netSalary}, expected ${manualSum.netSalary}`)
    }
    
    if (Math.abs(calculatedCumulative.taxDeduction - manualSum.taxDeduction) > tolerance) {
      discrepancies.push(`Tax deduction mismatch: calculated ${calculatedCumulative.taxDeduction}, expected ${manualSum.taxDeduction}`)
    }
    
    if (Math.abs(calculatedCumulative.socialSecurity - manualSum.socialSecurity) > tolerance) {
      discrepancies.push(`Social security mismatch: calculated ${calculatedCumulative.socialSecurity}, expected ${manualSum.socialSecurity}`)
    }

    const isValid = discrepancies.length === 0

    if (isValid) {
      console.log(`✅ [CumulativeValidation] Cumulative calculations are valid`)
    } else {
      console.log(`❌ [CumulativeValidation] Found ${discrepancies.length} discrepancies:`)
      discrepancies.forEach(d => console.log(`   - ${d}`))
    }

    return {
      isValid,
      discrepancies,
      calculatedCumulative
    }

  } catch (error) {
    console.error('💥 [CumulativeValidation] Error validating cumulative calculations:', error)
    throw new Error(`Failed to validate cumulative calculations: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

