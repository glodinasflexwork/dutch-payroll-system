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
  
  // Tax calculations
  taxableIncome: number;
  incomeTaxBeforeCredits: number;
  generalTaxCredit: number;
  employedPersonTaxCredit: number;
  youngDisabledTaxCredit: number;
  totalTaxCredits: number;
  incomeTaxAfterCredits: number;
  
  // National insurance (employee portion)
  aowContribution: number;
  anwContribution: number;
  wlzContribution: number;
  
  // Employee insurance (employee portion)
  wwContribution: number;
  wiaContribution: number;
  
  // Total deductions
  totalTaxAndInsurance: number;
  netMonthlySalary: number;
  netAnnualSalary: number;
  
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
 * 2025 Tax Brackets and Rates
 */
const TAX_BRACKETS_2025 = {
  // Employees below state pension age
  belowPensionAge: [
    { min: 0, max: 38441, rate: 0.3582, description: 'Band 1: Income tax + AOW + Anw + WLZ' },
    { min: 38441, max: 76817, rate: 0.3748, description: 'Band 2a: Income tax' },
    { min: 76817, max: Infinity, rate: 0.4950, description: 'Band 3: Income tax' }
  ],
  
  // Employees of state pension age (born 1946+)
  pensionAge1946Plus: [
    { min: 0, max: 40502, rate: 0.1792, description: 'Band 1: Income tax + Anw + WLZ (no AOW)' },
    { min: 40502, max: 76817, rate: 0.3748, description: 'Band 2b: Income tax' },
    { min: 76817, max: Infinity, rate: 0.4950, description: 'Band 3: Income tax' }
  ],
  
  // Employees of state pension age (born 1945 or earlier)
  pensionAge1945Earlier: [
    { min: 0, max: 38441, rate: 0.3582, description: 'Band 1: Income tax + AOW + Anw + WLZ' },
    { min: 38441, max: 76817, rate: 0.3748, description: 'Band 2a: Income tax' },
    { min: 76817, max: Infinity, rate: 0.4950, description: 'Band 3: Income tax' }
  ]
};

/**
 * 2025 Tax Credits
 */
const TAX_CREDITS_2025 = {
  general: {
    baseAmount: 3068,
    phaseOutStart: 28406,
    phaseOutEnd: 76817,
    phaseOutRate: 0.06337
  },
  
  employedPerson: {
    firstRate: { max: 12169, rate: 0.08053, maxCredit: 980 },
    secondRate: { min: 12169, max: 26288, rate: 0.30030, maxCredit: 4240 },
    thirdRate: { min: 26288, max: 43071, rate: 0.02258, maxCredit: 379 },
    maxTotal: 5599,
    phaseOutStart: 43071,
    phaseOutEnd: 129078,
    phaseOutRate: 0.06510
  },
  
  youngDisabled: 909
};

/**
 * 2025 Insurance Contribution Rates
 */
const INSURANCE_RATES_2025 = {
  // National insurance rates (included in tax brackets above)
  national: {
    aow: 0.1790,  // Old Age Pension (only for employees below pension age)
    anw: 0.0010,  // Surviving Dependants
    wlz: 0.0965   // Long-term Care
  },
  
  // Employee insurance rates (employer pays)
  employer: {
    awf: { low: 0.0274, high: 0.0774 },      // Unemployment Fund
    aof: { low: 0.0628, high: 0.0764 },      // Disability Fund
    wko: 0.0050,                             // Work and Income Surcharge
    ufo: 0.0068                              // Public Sector Implementation Fund
  }
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
 * Calculate progressive income tax based on annual salary
 */
function calculateProgressiveTax(annualSalary: number, taxBrackets: typeof TAX_BRACKETS_2025.belowPensionAge): {
  totalTax: number;
  breakdown: TaxBracketBreakdown[];
} {
  let totalTax = 0;
  let remainingIncome = annualSalary;
  const breakdown: TaxBracketBreakdown[] = [];
  
  for (let i = 0; i < taxBrackets.length; i++) {
    const bracket = taxBrackets[i];
    const bracketSize = bracket.max - bracket.min;
    const incomeInBracket = Math.min(remainingIncome, bracketSize);
    
    if (incomeInBracket > 0) {
      const taxInBracket = incomeInBracket * bracket.rate;
      totalTax += taxInBracket;
      
      breakdown.push({
        bracket: i + 1,
        incomeInBracket,
        rate: bracket.rate,
        taxAmount: taxInBracket,
        description: bracket.description
      });
      
      remainingIncome -= incomeInBracket;
    }
    
    if (remainingIncome <= 0) break;
  }
  
  return { totalTax, breakdown };
}

/**
 * Calculate general tax credit
 */
function calculateGeneralTaxCredit(annualSalary: number): number {
  const { baseAmount, phaseOutStart, phaseOutEnd, phaseOutRate } = TAX_CREDITS_2025.general;
  
  if (annualSalary <= phaseOutStart) {
    return baseAmount;
  }
  
  if (annualSalary >= phaseOutEnd) {
    return 0;
  }
  
  const phaseOutAmount = (annualSalary - phaseOutStart) * phaseOutRate;
  return Math.max(0, baseAmount - phaseOutAmount);
}

/**
 * Calculate employed person's tax credit (arbeidskorting)
 */
function calculateEmployedPersonTaxCredit(annualSalary: number): number {
  const credit = TAX_CREDITS_2025.employedPerson;
  let totalCredit = 0;
  
  // First rate
  if (annualSalary > 0) {
    const firstRateIncome = Math.min(annualSalary, credit.firstRate.max);
    totalCredit += firstRateIncome * credit.firstRate.rate;
  }
  
  // Second rate
  if (annualSalary > credit.secondRate.min) {
    const secondRateIncome = Math.min(annualSalary - credit.secondRate.min, credit.secondRate.max - credit.secondRate.min);
    totalCredit += secondRateIncome * credit.secondRate.rate;
  }
  
  // Third rate
  if (annualSalary > credit.thirdRate.min) {
    const thirdRateIncome = Math.min(annualSalary - credit.thirdRate.min, credit.thirdRate.max - credit.thirdRate.min);
    totalCredit += thirdRateIncome * credit.thirdRate.rate;
  }
  
  // Cap at maximum
  totalCredit = Math.min(totalCredit, credit.maxTotal);
  
  // Apply phase-out if applicable
  if (annualSalary > credit.phaseOutStart) {
    const phaseOutAmount = Math.min(
      (annualSalary - credit.phaseOutStart) * credit.phaseOutRate,
      totalCredit
    );
    totalCredit -= phaseOutAmount;
  }
  
  return Math.max(0, totalCredit);
}

/**
 * Calculate employer insurance contributions
 */
function calculateEmployerContributions(annualSalary: number, companyData: CompanyData): {
  awfContribution: number;
  aofContribution: number;
  wkoSurcharge: number;
  ufoPremium: number;
  totalEmployerCosts: number;
} {
  const rates = INSURANCE_RATES_2025.employer;
  
  // Determine rates based on company size and sector
  const awfRate = companyData.awfRate === 'high' ? rates.awf.high : rates.awf.low;
  const aofRate = companyData.aofRate === 'high' ? rates.aof.high : rates.aof.low;
  
  const awfContribution = annualSalary * awfRate;
  const aofContribution = annualSalary * aofRate;
  const wkoSurcharge = annualSalary * rates.wko;
  const ufoPremium = annualSalary * rates.ufo;
  
  const totalEmployerCosts = awfContribution + aofContribution + wkoSurcharge + ufoPremium;
  
  return {
    awfContribution,
    aofContribution,
    wkoSurcharge,
    ufoPremium,
    totalEmployerCosts
  };
}

/**
 * Calculate holiday allowance (vakantiegeld)
 */
function calculateHolidayAllowance(annualSalary: number, taxBrackets: typeof TAX_BRACKETS_2025.belowPensionAge): {
  gross: number;
  net: number;
} {
  const holidayAllowanceRate = 0.0833; // 8.33%
  const gross = annualSalary * holidayAllowanceRate;
  
  // Holiday allowance is taxed at the same rate as regular salary
  const { totalTax } = calculateProgressiveTax(gross, taxBrackets);
  const net = gross - totalTax;
  
  return { gross, net };
}

/**
 * Main payroll calculation function - Updated for Dutch Standards
 * Only calculates social insurance contributions, NOT income tax
 */
export function calculateDutchPayroll(
  employeeData: EmployeeData,
  companyData: CompanyData
): PayrollResult {
  const annualSalary = employeeData.grossMonthlySalary * 12;
  const taxBrackets = getTaxBrackets(employeeData.dateOfBirth);
  
  // NOTE: Income tax is NOT calculated in monthly payroll - handled annually by bookkeeping
  const incomeTaxBeforeCredits = 0;
  const incomeTaxAfterCredits = 0;
  
  // Calculate tax credits (for reference/annual use only)
  const generalTaxCredit = calculateGeneralTaxCredit(annualSalary);
  const employedPersonTaxCredit = calculateEmployedPersonTaxCredit(annualSalary);
  const youngDisabledTaxCredit = employeeData.isYoungDisabled ? TAX_CREDITS_2025.youngDisabled : 0;
  const totalTaxCredits = generalTaxCredit + employedPersonTaxCredit + youngDisabledTaxCredit + employeeData.taxCredit;
  
  // ONLY Social Insurance Contributions (what should be in "Loonheffing")
  const age = calculateAge(employeeData.dateOfBirth);
  const aowContribution = age < 67 ? annualSalary * INSURANCE_RATES_2025.national.aow : 0;
  const anwContribution = annualSalary * INSURANCE_RATES_2025.national.anw;
  const wlzContribution = annualSalary * INSURANCE_RATES_2025.national.wlz;
  
  // ZVW Health Care Contribution (income-dependent)
  const zvwContribution = annualSalary * 0.0565; // 5.65% for 2025
  
  // Employee insurance contributions (typically paid by employer)
  const wwContribution = 0; // Employer-paid
  const wiaContribution = 0; // Employer-paid
  
  // Total "Loonheffing" = ONLY social insurance contributions (NO income tax)
  const totalLoonheffing = aowContribution + anwContribution + wlzContribution + zvwContribution;
  
  // Net salary calculations (much higher without income tax)
  const netAnnualSalary = annualSalary - totalLoonheffing;
  const netMonthlySalary = netAnnualSalary / 12;
  
  // Employer contributions
  const employerContributions = calculateEmployerContributions(annualSalary, companyData);
  
  // Holiday allowance (simplified - no tax deduction)
  const holidayAllowanceGross = annualSalary * 0.0833; // 8.33%
  const holidayAllowanceNet = holidayAllowanceGross; // No tax deduction in monthly payroll
  
  // Create tax bracket breakdown for reference (not used in monthly calculation)
  const { breakdown: taxBracketBreakdown } = calculateProgressiveTax(annualSalary, taxBrackets);
  
  return {
    grossAnnualSalary: annualSalary,
    grossMonthlySalary: employeeData.grossMonthlySalary,
    
    taxableIncome: annualSalary,
    incomeTaxBeforeCredits: 0, // Not calculated in monthly payroll
    generalTaxCredit,
    employedPersonTaxCredit,
    youngDisabledTaxCredit,
    totalTaxCredits,
    incomeTaxAfterCredits: 0, // Not calculated in monthly payroll
    
    aowContribution,
    anwContribution,
    wlzContribution,
    
    wwContribution,
    wiaContribution,
    
    totalTaxAndInsurance: totalLoonheffing, // Only social insurance, no income tax
    netMonthlySalary,
    netAnnualSalary,
    
    employerAWFContribution: employerContributions.awfContribution,
    employerAOFContribution: employerContributions.aofContribution,
    employerWKOSurcharge: employerContributions.wkoSurcharge,
    employerUFOPremium: employerContributions.ufoPremium,
    totalEmployerCosts: employerContributions.totalEmployerCosts,
    
    holidayAllowanceGross,
    holidayAllowanceNet,
    
    taxBracketBreakdown
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

