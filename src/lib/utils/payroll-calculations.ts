/**
 * Dutch payroll calculation utilities
 */

export interface TaxSettings {
  incomeTaxRate1: number
  incomeTaxRate2: number
  incomeTaxBracket1Max: number
  aowRate: number
  wlzRate: number
  wwRate: number
  wiaRate: number
  aowMaxBase: number
  wlzMaxBase: number
  wwMaxBase: number
  wiaMaxBase: number
  holidayAllowanceRate: number
  minimumWage: number
}

export interface Employee {
  salary: number
  employmentType: 'monthly' | 'hourly'
  taxTable: 'wit' | 'groen'
}

export interface PayrollInput {
  hoursWorked?: number
  overtimeHours?: number
  overtimeRate?: number
}

export interface PayrollCalculation {
  regularPay: number
  overtimePay: number
  holidayAllowance: number
  grossPay: number
  incomeTax: number
  aowContribution: number
  wlzContribution: number
  wwContribution: number
  wiaContribution: number
  totalDeductions: number
  netPay: number
}

/**
 * Calculate Dutch income tax based on 2025 tax brackets
 */
export function calculateIncomeTax(
  grossPay: number, 
  taxSettings: TaxSettings, 
  taxTable: 'wit' | 'groen'
): number {
  const { incomeTaxRate1, incomeTaxRate2, incomeTaxBracket1Max } = taxSettings
  
  let incomeTax = 0
  
  // Calculate tax based on brackets
  if (grossPay <= incomeTaxBracket1Max) {
    incomeTax = grossPay * (incomeTaxRate1 / 100)
  } else {
    incomeTax = incomeTaxBracket1Max * (incomeTaxRate1 / 100) + 
                (grossPay - incomeTaxBracket1Max) * (incomeTaxRate2 / 100)
  }
  
  // Apply tax table adjustment
  if (taxTable === 'groen') {
    // Green tax table gets standard tax credit
    const standardTaxCredit = 3070 // 2025 standard tax credit
    incomeTax = Math.max(0, incomeTax - standardTaxCredit)
  }
  
  return Math.round(incomeTax * 100) / 100
}

/**
 * Calculate social security contributions
 */
export function calculateSocialSecurityContributions(
  grossPay: number,
  taxSettings: TaxSettings
): {
  aowContribution: number
  wlzContribution: number
  wwContribution: number
  wiaContribution: number
} {
  const {
    aowRate,
    wlzRate,
    wwRate,
    wiaRate,
    aowMaxBase,
    wlzMaxBase,
    wwMaxBase,
    wiaMaxBase
  } = taxSettings
  
  const aowContribution = Math.min(grossPay, aowMaxBase) * (aowRate / 100)
  const wlzContribution = Math.min(grossPay, wlzMaxBase) * (wlzRate / 100)
  const wwContribution = Math.min(grossPay, wwMaxBase) * (wwRate / 100)
  const wiaContribution = Math.min(grossPay, wiaMaxBase) * (wiaRate / 100)
  
  return {
    aowContribution: Math.round(aowContribution * 100) / 100,
    wlzContribution: Math.round(wlzContribution * 100) / 100,
    wwContribution: Math.round(wwContribution * 100) / 100,
    wiaContribution: Math.round(wiaContribution * 100) / 100
  }
}

/**
 * Calculate holiday allowance (vakantiegeld)
 * 8% of annual salary, paid proportionally
 */
export function calculateHolidayAllowance(
  employee: Employee,
  taxSettings: TaxSettings,
  payPeriod: 'monthly' | 'weekly' | 'daily' = 'monthly'
): number {
  const annualSalary = employee.employmentType === 'monthly' 
    ? employee.salary * 12 
    : employee.salary * 40 * 52 // Assuming 40 hours per week
  
  const holidayAllowance = annualSalary * (taxSettings.holidayAllowanceRate / 100)
  
  // Return proportional amount based on pay period
  switch (payPeriod) {
    case 'monthly':
      return Math.round((holidayAllowance / 12) * 100) / 100
    case 'weekly':
      return Math.round((holidayAllowance / 52) * 100) / 100
    case 'daily':
      return Math.round((holidayAllowance / 365) * 100) / 100
    default:
      return Math.round(holidayAllowance * 100) / 100
  }
}

/**
 * Calculate gross pay based on employment type
 */
export function calculateGrossPay(
  employee: Employee,
  input: PayrollInput
): {
  regularPay: number
  overtimePay: number
  grossPay: number
} {
  let regularPay = 0
  let overtimePay = 0
  
  if (employee.employmentType === 'monthly') {
    regularPay = employee.salary
    // Monthly employees typically don't get overtime pay
    overtimePay = 0
  } else {
    // Hourly employee
    const hoursWorked = input.hoursWorked || 0
    const overtimeHours = input.overtimeHours || 0
    const overtimeRate = input.overtimeRate || 1.5
    
    regularPay = hoursWorked * employee.salary
    overtimePay = overtimeHours * employee.salary * overtimeRate
  }
  
  const grossPay = regularPay + overtimePay
  
  return {
    regularPay: Math.round(regularPay * 100) / 100,
    overtimePay: Math.round(overtimePay * 100) / 100,
    grossPay: Math.round(grossPay * 100) / 100
  }
}

/**
 * Complete payroll calculation
 */
export function calculatePayroll(
  employee: Employee,
  taxSettings: TaxSettings,
  input: PayrollInput = {}
): PayrollCalculation {
  // Calculate gross pay
  const { regularPay, overtimePay, grossPay: baseGrossPay } = calculateGrossPay(employee, input)
  
  // Calculate holiday allowance
  const holidayAllowance = calculateHolidayAllowance(employee, taxSettings)
  
  // Total gross pay including holiday allowance
  const grossPay = baseGrossPay + holidayAllowance
  
  // Calculate income tax
  const incomeTax = calculateIncomeTax(grossPay, taxSettings, employee.taxTable)
  
  // Calculate social security contributions
  const socialSecurity = calculateSocialSecurityContributions(grossPay, taxSettings)
  
  // Calculate total deductions
  const totalDeductions = incomeTax + 
    socialSecurity.aowContribution + 
    socialSecurity.wlzContribution + 
    socialSecurity.wwContribution + 
    socialSecurity.wiaContribution
  
  // Calculate net pay
  const netPay = grossPay - totalDeductions
  
  return {
    regularPay,
    overtimePay,
    holidayAllowance,
    grossPay: Math.round(grossPay * 100) / 100,
    incomeTax,
    aowContribution: socialSecurity.aowContribution,
    wlzContribution: socialSecurity.wlzContribution,
    wwContribution: socialSecurity.wwContribution,
    wiaContribution: socialSecurity.wiaContribution,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    netPay: Math.round(netPay * 100) / 100
  }
}

/**
 * Calculate annual salary from hourly rate
 */
export function calculateAnnualSalaryFromHourly(
  hourlyRate: number,
  hoursPerWeek: number = 40
): number {
  return hourlyRate * hoursPerWeek * 52
}

/**
 * Calculate hourly rate from annual salary
 */
export function calculateHourlyRateFromAnnual(
  annualSalary: number,
  hoursPerWeek: number = 40
): number {
  return annualSalary / (hoursPerWeek * 52)
}

/**
 * Validate minimum wage compliance
 */
export function validateMinimumWage(
  employee: Employee,
  taxSettings: TaxSettings
): boolean {
  if (employee.employmentType === 'hourly') {
    return employee.salary >= taxSettings.minimumWage
  } else {
    // For monthly employees, check if annual salary meets minimum wage requirements
    const annualSalary = employee.salary * 12
    const minimumAnnualSalary = taxSettings.minimumWage * 40 * 52
    return annualSalary >= minimumAnnualSalary
  }
}

/**
 * Calculate tax burden percentage
 */
export function calculateTaxBurden(calculation: PayrollCalculation): number {
  if (calculation.grossPay === 0) return 0
  return Math.round((calculation.totalDeductions / calculation.grossPay) * 10000) / 100
}

