/**
 * Dutch Minimum Wage Calculation Utility
 * Implements statutory minimum wage requirements for Dutch payslip compliance
 */

export interface MinimumWageData {
  amount: number;
  ageCategory: string;
  isCompliant: boolean;
  complianceMessage: string;
  effectiveDate: Date;
  weeklyHours: number;
  monthlyAmount: number;
}

/**
 * Dutch minimum wage rates for 2025 (updated July 1, 2025)
 * Source: Rijksoverheid.nl
 */
const MINIMUM_WAGE_RATES_2025 = {
  // Adult minimum wage (21+ years)
  adult: {
    hourly: 12.83,
    daily: 102.64,
    weekly: 513.20,
    monthly: 2223.20,
    effectiveDate: new Date('2025-07-01')
  },
  // Youth minimum wage rates
  youth: {
    20: { percentage: 85, hourly: 10.91, monthly: 1889.72 },
    19: { percentage: 72.5, hourly: 9.30, monthly: 1611.82 },
    18: { percentage: 61.5, hourly: 7.89, monthly: 1367.27 },
    17: { percentage: 52.5, hourly: 6.74, monthly: 1167.18 },
    16: { percentage: 45.5, hourly: 5.84, monthly: 1011.56 },
    15: { percentage: 39.5, hourly: 5.07, monthly: 878.16 }
  }
};

/**
 * Calculate the applicable minimum wage for an employee
 */
export function calculateMinimumWage(
  dateOfBirth: Date | string,
  contractHours: number = 40,
  referenceDate: Date = new Date()
): MinimumWageData {
  const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const age = calculateAge(birthDate, referenceDate);
  
  // Determine age category and applicable rate
  let rateInfo;
  let ageCategory: string;
  
  if (age >= 21) {
    rateInfo = MINIMUM_WAGE_RATES_2025.adult;
    ageCategory = 'Volwassen (21+ jaar)';
  } else if (age >= 15) {
    const youthRate = MINIMUM_WAGE_RATES_2025.youth[age as keyof typeof MINIMUM_WAGE_RATES_2025.youth];
    rateInfo = {
      hourly: youthRate.hourly,
      monthly: youthRate.monthly,
      effectiveDate: MINIMUM_WAGE_RATES_2025.adult.effectiveDate
    };
    ageCategory = `Jeugdloon ${age} jaar (${youthRate.percentage}%)`;
  } else {
    // Under 15 - no minimum wage applies
    return {
      amount: 0,
      ageCategory: 'Onder 15 jaar (geen minimumloon)',
      isCompliant: true,
      complianceMessage: 'Geen minimumloon van toepassing',
      effectiveDate: MINIMUM_WAGE_RATES_2025.adult.effectiveDate,
      weeklyHours: contractHours,
      monthlyAmount: 0
    };
  }
  
  // Calculate monthly minimum wage based on contract hours
  const weeklyHours = contractHours;
  const monthlyMinimumWage = calculateMonthlyMinimumWage(rateInfo.hourly, weeklyHours);
  
  return {
    amount: rateInfo.hourly,
    ageCategory,
    isCompliant: true, // Will be determined by comparison with actual salary
    complianceMessage: `Minimumloon: €${rateInfo.hourly.toFixed(2)}/uur`,
    effectiveDate: rateInfo.effectiveDate,
    weeklyHours,
    monthlyAmount: monthlyMinimumWage
  };
}

/**
 * Check if a salary complies with minimum wage requirements
 */
export function checkMinimumWageCompliance(
  actualSalary: number,
  dateOfBirth: Date | string,
  contractHours: number = 40,
  referenceDate: Date = new Date()
): MinimumWageData {
  const minimumWageData = calculateMinimumWage(dateOfBirth, contractHours, referenceDate);
  
  const isCompliant = actualSalary >= minimumWageData.monthlyAmount;
  const difference = actualSalary - minimumWageData.monthlyAmount;
  
  let complianceMessage: string;
  if (isCompliant) {
    if (difference > 0) {
      complianceMessage = `✓ Voldoet aan minimumloon (€${difference.toFixed(2)} boven minimum)`;
    } else {
      complianceMessage = `✓ Voldoet exact aan minimumloon`;
    }
  } else {
    complianceMessage = `⚠ Onder minimumloon (€${Math.abs(difference).toFixed(2)} te laag)`;
  }
  
  return {
    ...minimumWageData,
    isCompliant,
    complianceMessage
  };
}

/**
 * Calculate monthly minimum wage based on hourly rate and weekly hours
 */
function calculateMonthlyMinimumWage(hourlyRate: number, weeklyHours: number): number {
  // Dutch calculation: weekly hours × hourly rate × 52 weeks ÷ 12 months
  return (weeklyHours * hourlyRate * 52) / 12;
}

/**
 * Calculate age in years
 */
function calculateAge(birthDate: Date, referenceDate: Date): number {
  const age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
    return age - 1;
  }
  
  return age;
}

/**
 * Get current minimum wage rates for display
 */
export function getCurrentMinimumWageRates(): typeof MINIMUM_WAGE_RATES_2025 {
  return MINIMUM_WAGE_RATES_2025;
}

/**
 * Format minimum wage information for payslip display
 */
export function formatMinimumWageForPayslip(minimumWageData: MinimumWageData): string {
  return `Minimumloon: €${minimumWageData.monthlyAmount.toFixed(2)} (${minimumWageData.ageCategory})`;
}

