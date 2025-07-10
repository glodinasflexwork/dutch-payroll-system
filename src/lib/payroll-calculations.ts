/**
 * SalarySync Payroll Calculations Library - 2025
 * 
 * Comprehensive library for calculating Dutch payroll taxes, social security contributions,
 * and net salary based on official Belastingdienst rates for 2025.
 */

export interface EmployeeData {
  grossMonthlySalary: number;
  dateOfBirth: Date;
  isDGA: boolean;
  taxTable: 'wit' | 'groen';
  taxCredit: number;
  isYoungDisabled: boolean;
  hasMultipleJobs: boolean;
}

export interface CompanyData {
  size: 'small' | 'medium' | 'large';
  sector?: string;
  awfRate?: 'low' | 'high';
  aofRate?: 'low' | 'high';
}

export interface PayrollResult {
  grossAnnualSalary: number;
  grossMonthlySalary: number;
  
  // National insurance (employee portion)
  aowContribution: number;
  wlzContribution: number;
  
  // Employee insurance (employee portion)  
  wwContribution: number;
  wiaContribution: number;
  
  // Total employee contributions
  totalEmployeeContributions: number;
  
  // Employer contributions
  employerAowContribution: number;
  employerWlzContribution: number;
  employerWwContribution: number;
  employerWiaContribution: number;
  employerAwfContribution: number;
  employerAofContribution: number;
  employerZvwContribution: number;
  totalEmployerContributions: number;
  
  // Note: Net salary calculation requires income tax calculation
  // which should be handled by tax advisors, not payroll software
  grossSalaryAfterEmployeeContributions: number;
  
  // Employer costs
  employerAWFContribution: number;
  employerAOFContribution: number;
  employerWKOSurcharge: number;
  employerUFOPremium: number;
  totalEmployerCosts: number;
  
  // Holiday allowance
  holidayAllowanceGross: number;
  holidayAllowanceNet: number;
  
  // Breakdown by tax bracket
  taxBracketBreakdown: TaxBracketBreakdown[];
}

export interface TaxBracketBreakdown {
  bracket: number;
  incomeInBracket: number;
  rate: number;
  taxAmount: number;
  description: string;
}

/**
 * 2025 Social Security Contribution Rates
 * Note: Income tax calculation is NOT included as it should be handled by tax advisors
 */
const SOCIAL_SECURITY_RATES_2025 = {
  // National insurance rates (employee portion)
  employee: {
    aow: 0.1790,  // Old Age Pension (only for employees below pension age)
    wlz: 0.0965   // Long-term Care
  },
  
  // Employee insurance rates (employee portion)
  employeeInsurance: {
    ww: 0.0027,   // Unemployment Insurance (employee portion)
    wia: 0.0060   // Work and Income Insurance (employee portion)
  },
  
  // Employer insurance rates
  employer: {
    aow: 0.1790,  // Employer also pays AOW
    wlz: 0.0965,  // Employer also pays WLZ
    ww: 0.0270,   // Unemployment Insurance (employer portion)
    wia: 0.0060,  // Work and Income Insurance (employer portion)
    awf: { low: 0.0274, high: 0.0774 },      // Unemployment Fund
    aof: { low: 0.0628, high: 0.0764 },      // Disability Fund
    zvw: 0.0695   // Health Insurance Employer Contribution
  }
};

/**
 * Maximum contribution bases for 2025
 */
const CONTRIBUTION_BASES_2025 = {
  aow: 40000,    // AOW maximum base
  wlz: 40000,    // WLZ maximum base
  ww: 69000,     // WW maximum base
  wia: 69000     // WIA maximum base
};

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Determine which tax bracket set to use based on employee age and birth year
 */
function getTaxBrackets(dateOfBirth: Date): typeof TAX_BRACKETS_2025.belowPensionAge {
  const age = calculateAge(dateOfBirth);
  const birthYear = dateOfBirth.getFullYear();
  
  // State pension age in Netherlands is currently 67 (born 1960 or later)
  // For 2025, this means people born in 1958 or earlier are of pension age
  if (age >= 67) {
    if (birthYear <= 1945) {
      return TAX_BRACKETS_2025.pensionAge1945Earlier;
    } else {
      return TAX_BRACKETS_2025.pensionAge1946Plus;
    }
  }
  
  return TAX_BRACKETS_2025.belowPensionAge;
}

/**
 * Calculate employee social security contributions
 */
function calculateEmployeeContributions(annualSalary: number, employeeData: EmployeeData): {
  aowContribution: number;
  wlzContribution: number;
  wwContribution: number;
  wiaContribution: number;
  totalContributions: number;
} {
  const age = calculateAge(employeeData.dateOfBirth);
  const isPensionAge = age >= 67; // State pension age
  
  // Calculate contributions based on maximum bases
  const aowBase = Math.min(annualSalary, CONTRIBUTION_BASES_2025.aow);
  const wlzBase = Math.min(annualSalary, CONTRIBUTION_BASES_2025.wlz);
  const wwBase = Math.min(annualSalary, CONTRIBUTION_BASES_2025.ww);
  const wiaBase = Math.min(annualSalary, CONTRIBUTION_BASES_2025.wia);
  
  // AOW is only paid by employees below pension age
  const aowContribution = isPensionAge ? 0 : aowBase * SOCIAL_SECURITY_RATES_2025.employee.aow;
  const wlzContribution = wlzBase * SOCIAL_SECURITY_RATES_2025.employee.wlz;
  const wwContribution = wwBase * SOCIAL_SECURITY_RATES_2025.employeeInsurance.ww;
  const wiaContribution = wiaBase * SOCIAL_SECURITY_RATES_2025.employeeInsurance.wia;
  
  const totalContributions = aowContribution + wlzContribution + wwContribution + wiaContribution;
  
  return {
    aowContribution,
    wlzContribution,
    wwContribution,
    wiaContribution,
    totalContributions
  };
}

/**
 * Calculate employer contributions and costs
 */
function calculateEmployerContributions(annualSalary: number, companyData: CompanyData, employeeData: EmployeeData): {
  employerAowContribution: number;
  employerWlzContribution: number;
  employerWwContribution: number;
  employerWiaContribution: number;
  employerAwfContribution: number;
  employerAofContribution: number;
  employerZvwContribution: number;
  totalEmployerContributions: number;
} {
  const rates = SOCIAL_SECURITY_RATES_2025.employer;
  const age = calculateAge(employeeData.dateOfBirth);
  const isPensionAge = age >= 67;
  
  // Calculate contributions based on maximum bases
  const aowBase = Math.min(annualSalary, CONTRIBUTION_BASES_2025.aow);
  const wlzBase = Math.min(annualSalary, CONTRIBUTION_BASES_2025.wlz);
  const wwBase = Math.min(annualSalary, CONTRIBUTION_BASES_2025.ww);
  const wiaBase = Math.min(annualSalary, CONTRIBUTION_BASES_2025.wia);
  
  // Determine rates based on company size and sector
  const awfRate = companyData.awfRate === 'high' ? rates.awf.high : rates.awf.low;
  const aofRate = companyData.aofRate === 'high' ? rates.aof.high : rates.aof.low;
  
  // Employer contributions
  const employerAowContribution = isPensionAge ? 0 : aowBase * rates.aow;
  const employerWlzContribution = wlzBase * rates.wlz;
  const employerWwContribution = wwBase * rates.ww;
  const employerWiaContribution = wiaBase * rates.wia;
  const employerAwfContribution = annualSalary * awfRate;
  const employerAofContribution = annualSalary * aofRate;
  const employerZvwContribution = annualSalary * rates.zvw;
  
  const totalEmployerContributions = employerAowContribution + employerWlzContribution + 
    employerWwContribution + employerWiaContribution + employerAwfContribution + 
    employerAofContribution + employerZvwContribution;
  
  return {
    employerAowContribution,
    employerWlzContribution,
    employerWwContribution,
    employerWiaContribution,
    employerAwfContribution,
    employerAofContribution,
    employerZvwContribution,
    totalEmployerContributions
  };
}

/**
 * Calculate holiday allowance (vakantiegeld) - gross only, no tax calculation
 */
function calculateHolidayAllowance(annualSalary: number): number {
  const holidayAllowanceRate = 0.0833; // 8.33%
  return annualSalary * holidayAllowanceRate;
}

/**
 * Main payroll calculation function - Social Security Contributions Only
 * NO income tax calculations - that's handled by tax advisors annually
 */
export function calculateDutchPayroll(
  employeeData: EmployeeData,
  companyData: CompanyData
): PayrollResult {
  const annualSalary = employeeData.grossMonthlySalary * 12;
  
  // Calculate employee social security contributions
  const employeeContributions = calculateEmployeeContributions(annualSalary, employeeData);
  
  // Calculate employer contributions
  const employerContributions = calculateEmployerContributions(annualSalary, companyData, employeeData);
  
  // Calculate holiday allowance (gross only)
  const holidayAllowanceGross = calculateHolidayAllowance(annualSalary);
  
  // Gross salary after employee contributions (NOT net salary - income tax not calculated)
  const grossSalaryAfterEmployeeContributions = annualSalary - employeeContributions.totalContributions;
  
  return {
    grossAnnualSalary: annualSalary,
    grossMonthlySalary: employeeData.grossMonthlySalary,
    
    // Employee contributions
    aowContribution: employeeContributions.aowContribution,
    wlzContribution: employeeContributions.wlzContribution,
    wwContribution: employeeContributions.wwContribution,
    wiaContribution: employeeContributions.wiaContribution,
    totalEmployeeContributions: employeeContributions.totalContributions,
    
    // Employer contributions
    employerAowContribution: employerContributions.employerAowContribution,
    employerWlzContribution: employerContributions.employerWlzContribution,
    employerWwContribution: employerContributions.employerWwContribution,
    employerWiaContribution: employerContributions.employerWiaContribution,
    employerAwfContribution: employerContributions.employerAwfContribution,
    employerAofContribution: employerContributions.employerAofContribution,
    employerZvwContribution: employerContributions.employerZvwContribution,
    totalEmployerContributions: employerContributions.totalEmployerContributions,
    
    // Holiday allowance
    holidayAllowanceGross,
    
    // Gross salary after employee social security contributions
    // Note: This is NOT net salary - income tax calculation is handled by tax advisors
    grossSalaryAfterEmployeeContributions
  };
}

/**
 * Utility function to format currency amounts
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Utility function to format percentage
 */
export function formatPercentage(rate: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(rate);
}

/**
 * Generate detailed payroll breakdown for display
 */
export function generatePayrollBreakdown(result: PayrollResult): string {
  let breakdown = `DUTCH PAYROLL CALCULATION BREAKDOWN\n`;
  breakdown += `=====================================\n\n`;
  
  breakdown += `GROSS SALARY:\n`;
  breakdown += `Monthly: ${formatCurrency(result.grossMonthlySalary)}\n`;
  breakdown += `Annual: ${formatCurrency(result.grossAnnualSalary)}\n\n`;
  
  breakdown += `TAX BRACKET BREAKDOWN:\n`;
  result.taxBracketBreakdown.forEach(bracket => {
    breakdown += `Band ${bracket.bracket}: ${formatCurrency(bracket.incomeInBracket)} × ${formatPercentage(bracket.rate)} = ${formatCurrency(bracket.taxAmount)}\n`;
  });
  breakdown += `Total Tax Before Credits: ${formatCurrency(result.incomeTaxBeforeCredits)}\n\n`;
  
  breakdown += `TAX CREDITS:\n`;
  breakdown += `General Tax Credit: ${formatCurrency(result.generalTaxCredit)}\n`;
  breakdown += `Employed Person Tax Credit: ${formatCurrency(result.employedPersonTaxCredit)}\n`;
  if (result.youngDisabledTaxCredit > 0) {
    breakdown += `Young Disabled Tax Credit: ${formatCurrency(result.youngDisabledTaxCredit)}\n`;
  }
  breakdown += `Total Tax Credits: ${formatCurrency(result.totalTaxCredits)}\n\n`;
  
  breakdown += `FINAL CALCULATIONS:\n`;
  breakdown += `Income Tax After Credits: ${formatCurrency(result.incomeTaxAfterCredits)}\n`;
  breakdown += `Total Deductions: ${formatCurrency(result.totalTaxAndInsurance)}\n`;
  breakdown += `Net Monthly Salary: ${formatCurrency(result.netMonthlySalary)}\n`;
  breakdown += `Net Annual Salary: ${formatCurrency(result.netAnnualSalary)}\n\n`;
  
  breakdown += `EMPLOYER COSTS:\n`;
  breakdown += `AWF Contribution: ${formatCurrency(result.employerAWFContribution)}\n`;
  breakdown += `AOF Contribution: ${formatCurrency(result.employerAOFContribution)}\n`;
  breakdown += `WKO Surcharge: ${formatCurrency(result.employerWKOSurcharge)}\n`;
  breakdown += `UFO Premium: ${formatCurrency(result.employerUFOPremium)}\n`;
  breakdown += `Total Employer Costs: ${formatCurrency(result.totalEmployerCosts)}\n\n`;
  
  breakdown += `HOLIDAY ALLOWANCE (8.33%):\n`;
  breakdown += `Gross: ${formatCurrency(result.holidayAllowanceGross)}\n`;
  breakdown += `Net: ${formatCurrency(result.holidayAllowanceNet)}\n`;
  
  return breakdown;
}

