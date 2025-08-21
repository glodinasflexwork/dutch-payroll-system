/**
 * Pro-Rata Salary Calculation Library for Dutch Payroll System
 * 
 * Provides accurate pro-rata salary calculations for employees who start or end
 * employment mid-month, ensuring compliance with Dutch employment law.
 */

export interface ProRataCalculationParams {
  monthlySalary: number;
  employeeStartDate: Date;
  employeeEndDate?: Date;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  calculationMethod?: 'calendar' | 'working';
}

export interface ProRataResult {
  isProRataApplied: boolean;
  calculationMethod: string;
  totalDaysInMonth: number;
  workingDaysInMonth?: number;
  actualWorkingDays: number;
  proRataFactor: number;
  fullMonthlySalary: number;
  proRataSalary: number;
  adjustment: number;
  calculationDetails: string;
}

/**
 * Dutch national holidays for 2025
 * These dates affect working day calculations when using the 'working' method
 */
const DUTCH_HOLIDAYS_2025 = [
  new Date('2025-01-01'), // New Year's Day
  new Date('2025-03-31'), // Easter Sunday
  new Date('2025-04-01'), // Easter Monday
  new Date('2025-04-27'), // King's Day
  new Date('2025-05-05'), // Liberation Day
  new Date('2025-05-09'), // Ascension Day
  new Date('2025-05-19'), // Whit Sunday
  new Date('2025-05-20'), // Whit Monday
  new Date('2025-12-25'), // Christmas Day
  new Date('2025-12-26'), // Boxing Day
];

/**
 * Check if a date is a Dutch national holiday
 */
function isDutchHoliday(date: Date): boolean {
  const dateString = date.toISOString().split('T')[0];
  return DUTCH_HOLIDAYS_2025.some(holiday => 
    holiday.toISOString().split('T')[0] === dateString
  );
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
}

/**
 * Check if a date is a working day (not weekend and not holiday)
 */
function isWorkingDay(date: Date): boolean {
  return !isWeekend(date) && !isDutchHoliday(date);
}

/**
 * Get the number of days in a specific month and year
 */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Get the number of working days in a specific month and year
 */
function getWorkingDaysInMonth(year: number, month: number): number {
  const daysInMonth = getDaysInMonth(year, month);
  let workingDays = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    if (isWorkingDay(date)) {
      workingDays++;
    }
  }
  
  return workingDays;
}

/**
 * Count actual working days between two dates (inclusive)
 */
function countWorkingDaysBetween(startDate: Date, endDate: Date): number {
  let workingDays = 0;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (isWorkingDay(currentDate)) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
}

/**
 * Count calendar days between two dates (inclusive)
 */
function countCalendarDaysBetween(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
}

/**
 * Determine if pro-rata calculation should be applied
 */
function shouldApplyProRata(
  employeeStartDate: Date,
  employeeEndDate: Date | undefined,
  payPeriodStart: Date,
  payPeriodEnd: Date
): boolean {
  // Check if employee started mid-month
  const startOfMonth = new Date(payPeriodStart.getFullYear(), payPeriodStart.getMonth(), 1);
  const employeeStartedMidMonth = employeeStartDate > startOfMonth;
  
  // Check if employee ended mid-month
  const endOfMonth = new Date(payPeriodEnd.getFullYear(), payPeriodEnd.getMonth() + 1, 0);
  const employeeEndedMidMonth = employeeEndDate && employeeEndDate < endOfMonth;
  
  // Check if employee was not employed for the entire pay period
  const employeeNotActiveEntirePeriod = 
    employeeStartDate > payPeriodStart || 
    (employeeEndDate && employeeEndDate < payPeriodEnd);
  
  return employeeStartedMidMonth || employeeEndedMidMonth || employeeNotActiveEntirePeriod;
}

/**
 * Calculate the effective employment period within the pay period
 */
function getEffectiveEmploymentPeriod(
  employeeStartDate: Date,
  employeeEndDate: Date | undefined,
  payPeriodStart: Date,
  payPeriodEnd: Date
): { effectiveStart: Date; effectiveEnd: Date } {
  // Effective start is the later of employee start date or pay period start
  const effectiveStart = employeeStartDate > payPeriodStart ? employeeStartDate : payPeriodStart;
  
  // Effective end is the earlier of employee end date (if exists) or pay period end
  let effectiveEnd = payPeriodEnd;
  if (employeeEndDate && employeeEndDate < payPeriodEnd) {
    effectiveEnd = employeeEndDate;
  }
  
  return { effectiveStart, effectiveEnd };
}

/**
 * Calculate pro-rata salary based on the specified method
 */
export function calculateProRataSalary(params: ProRataCalculationParams): ProRataResult {
  const {
    monthlySalary,
    employeeStartDate,
    employeeEndDate,
    payPeriodStart,
    payPeriodEnd,
    calculationMethod = 'calendar'
  } = params;
  
  // Validate input parameters
  if (monthlySalary <= 0) {
    throw new Error('Monthly salary must be positive');
  }
  
  if (payPeriodStart > payPeriodEnd) {
    throw new Error('Pay period start date must be before or equal to end date');
  }
  
  if (employeeEndDate && employeeStartDate > employeeEndDate) {
    throw new Error('Employee start date must be before or equal to end date');
  }
  
  // Check if pro-rata calculation should be applied
  const shouldApply = shouldApplyProRata(employeeStartDate, employeeEndDate, payPeriodStart, payPeriodEnd);
  
  if (!shouldApply) {
    // No pro-rata needed, return full salary
    return {
      isProRataApplied: false,
      calculationMethod,
      totalDaysInMonth: getDaysInMonth(payPeriodStart.getFullYear(), payPeriodStart.getMonth() + 1),
      actualWorkingDays: getDaysInMonth(payPeriodStart.getFullYear(), payPeriodStart.getMonth() + 1),
      proRataFactor: 1.0,
      fullMonthlySalary: monthlySalary,
      proRataSalary: monthlySalary,
      adjustment: 0,
      calculationDetails: 'Employee worked full month - no pro-rata adjustment needed'
    };
  }
  
  // Get effective employment period
  const { effectiveStart, effectiveEnd } = getEffectiveEmploymentPeriod(
    employeeStartDate,
    employeeEndDate,
    payPeriodStart,
    payPeriodEnd
  );
  
  // Calculate based on method
  const year = payPeriodStart.getFullYear();
  const month = payPeriodStart.getMonth() + 1;
  const totalDaysInMonth = getDaysInMonth(year, month);
  
  let actualDays: number;
  let totalDaysForCalculation: number;
  let workingDaysInMonth: number | undefined;
  
  if (calculationMethod === 'working') {
    // Working day method
    workingDaysInMonth = getWorkingDaysInMonth(year, month);
    actualDays = countWorkingDaysBetween(effectiveStart, effectiveEnd);
    totalDaysForCalculation = workingDaysInMonth;
  } else {
    // Calendar day method (default)
    actualDays = countCalendarDaysBetween(effectiveStart, effectiveEnd);
    totalDaysForCalculation = totalDaysInMonth;
  }
  
  // Calculate pro-rata factor and salary
  const proRataFactor = actualDays / totalDaysForCalculation;
  const proRataSalary = monthlySalary * proRataFactor;
  const adjustment = monthlySalary - proRataSalary;
  
  // Generate calculation details
  const calculationDetails = `Pro-rata calculation applied: ${actualDays} ${calculationMethod} days out of ${totalDaysForCalculation} total ${calculationMethod} days in month. ` +
    `Effective employment period: ${effectiveStart.toLocaleDateString('nl-NL')} to ${effectiveEnd.toLocaleDateString('nl-NL')}. ` +
    `Pro-rata factor: ${proRataFactor.toFixed(6)} (${(proRataFactor * 100).toFixed(2)}%)`;
  
  return {
    isProRataApplied: true,
    calculationMethod,
    totalDaysInMonth,
    workingDaysInMonth,
    actualWorkingDays: actualDays,
    proRataFactor,
    fullMonthlySalary: monthlySalary,
    proRataSalary: Math.round(proRataSalary * 100) / 100, // Round to 2 decimal places
    adjustment: Math.round(adjustment * 100) / 100, // Round to 2 decimal places
    calculationDetails
  };
}

/**
 * Utility function to format pro-rata calculation results for display
 */
export function formatProRataResult(result: ProRataResult): string {
  if (!result.isProRataApplied) {
    return 'Full monthly salary applied - no pro-rata adjustment';
  }
  
  const currency = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  });
  
  const percentage = new Intl.NumberFormat('nl-NL', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return `Pro-rata calculation (${result.calculationMethod} method):
- Full monthly salary: ${currency.format(result.fullMonthlySalary)}
- Working days: ${result.actualWorkingDays} out of ${result.totalDaysInMonth}
- Pro-rata factor: ${percentage.format(result.proRataFactor)}
- Pro-rata salary: ${currency.format(result.proRataSalary)}
- Adjustment: ${currency.format(result.adjustment)}`;
}

/**
 * Validate pro-rata calculation parameters
 */
export function validateProRataParams(params: ProRataCalculationParams): string[] {
  const errors: string[] = [];
  
  if (params.monthlySalary <= 0) {
    errors.push('Monthly salary must be positive');
  }
  
  if (params.monthlySalary > 1000000) {
    errors.push('Monthly salary seems unreasonably high (>€1,000,000)');
  }
  
  if (params.payPeriodStart > params.payPeriodEnd) {
    errors.push('Pay period start date must be before or equal to end date');
  }
  
  if (params.employeeEndDate && params.employeeStartDate > params.employeeEndDate) {
    errors.push('Employee start date must be before or equal to end date');
  }
  
  const currentYear = new Date().getFullYear();
  if (params.payPeriodStart.getFullYear() < currentYear - 10 || 
      params.payPeriodStart.getFullYear() > currentYear + 5) {
    errors.push('Pay period year seems unreasonable');
  }
  
  if (params.calculationMethod && 
      !['calendar', 'working'].includes(params.calculationMethod)) {
    errors.push('Calculation method must be either "calendar" or "working"');
  }
  
  return errors;
}

/**
 * Calculate pro-rata salary with comprehensive error handling
 */
export function calculateProRataSalarySafe(params: ProRataCalculationParams): 
  { success: true; result: ProRataResult } | { success: false; errors: string[] } {
  
  try {
    // Validate parameters
    const validationErrors = validateProRataParams(params);
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors };
    }
    
    // Perform calculation
    const result = calculateProRataSalary(params);
    return { success: true, result };
    
  } catch (error) {
    return { 
      success: false, 
      errors: [error instanceof Error ? error.message : 'Unknown calculation error'] 
    };
  }
}

