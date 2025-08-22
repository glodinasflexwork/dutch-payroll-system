/**
 * Working Hours Calculator for Dutch Payslip Compliance
 * Calculates contract hours, actual hours, and working days for transparent payroll reporting
 */

export interface WorkingHoursData {
  contractHours: {
    weekly: number;
    monthly: number;
    daily: number;
  };
  actualHours: {
    regular: number;
    overtime: number;
    total: number;
  };
  workingDays: {
    contractDays: number;
    actualDays: number;
    totalDaysInMonth: number;
    workingDaysInMonth: number;
  };
  hourlyRate: {
    regular: number;
    overtime: number;
  };
  compliance: {
    isCompliant: boolean;
    message: string;
  };
}

/**
 * Calculate working hours information for payslip display
 */
export function calculateWorkingHours(
  contractHoursPerWeek: number,
  actualHoursWorked: number,
  grossMonthlySalary: number,
  year: number,
  month: number,
  startDate?: Date,
  endDate?: Date
): WorkingHoursData {
  // Calculate contract hours
  const contractHoursPerDay = contractHoursPerWeek / 5; // Assuming 5-day work week
  const contractHoursPerMonth = (contractHoursPerWeek * 52) / 12; // Annual hours / 12 months
  
  // Calculate working days in the month
  const workingDaysInMonth = calculateWorkingDaysInMonth(year, month);
  const totalDaysInMonth = new Date(year, month, 0).getDate();
  
  // Calculate actual working days (considering start/end dates)
  let actualWorkingDays = workingDaysInMonth;
  let contractDays = workingDaysInMonth;
  
  if (startDate) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    
    const effectiveStartDate = startDate > startOfMonth ? startDate : startOfMonth;
    const effectiveEndDate = endDate && endDate < endOfMonth ? endDate : endOfMonth;
    
    actualWorkingDays = calculateWorkingDaysBetween(effectiveStartDate, effectiveEndDate);
    contractDays = actualWorkingDays;
  }
  
  // Calculate hourly rates
  const regularHourlyRate = grossMonthlySalary / contractHoursPerMonth;
  const overtimeHourlyRate = regularHourlyRate * 1.5; // 150% for overtime
  
  // Determine regular vs overtime hours
  const expectedHours = (contractDays / workingDaysInMonth) * contractHoursPerMonth;
  const regularHours = Math.min(actualHoursWorked, expectedHours);
  const overtimeHours = Math.max(0, actualHoursWorked - expectedHours);
  
  // Compliance check
  const isCompliant = actualHoursWorked >= expectedHours * 0.9; // Allow 10% variance
  const complianceMessage = isCompliant 
    ? `✓ Uren conform contract (${actualHoursWorked}/${expectedHours.toFixed(1)} uur)`
    : `⚠ Minder uren dan contract (${actualHoursWorked}/${expectedHours.toFixed(1)} uur)`;
  
  return {
    contractHours: {
      weekly: contractHoursPerWeek,
      monthly: contractHoursPerMonth,
      daily: contractHoursPerDay
    },
    actualHours: {
      regular: regularHours,
      overtime: overtimeHours,
      total: actualHoursWorked
    },
    workingDays: {
      contractDays,
      actualDays: actualWorkingDays,
      totalDaysInMonth,
      workingDaysInMonth
    },
    hourlyRate: {
      regular: regularHourlyRate,
      overtime: overtimeHourlyRate
    },
    compliance: {
      isCompliant,
      message: complianceMessage
    }
  };
}

/**
 * Calculate number of working days in a month (excluding weekends)
 */
function calculateWorkingDaysInMonth(year: number, month: number): number {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  return calculateWorkingDaysBetween(startDate, endDate);
}

/**
 * Calculate working days between two dates (excluding weekends)
 */
function calculateWorkingDaysBetween(startDate: Date, endDate: Date): number {
  let workingDays = 0;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // Count Monday (1) through Friday (5) as working days
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
}

/**
 * Format working hours information for payslip display
 */
export function formatWorkingHoursForPayslip(workingHours: WorkingHoursData): string {
  return `
Werkuren informatie:
• Contract: ${workingHours.contractHours.weekly} uur/week (${workingHours.contractHours.monthly.toFixed(1)} uur/maand)
• Gewerkt: ${workingHours.actualHours.total} uur (${workingHours.actualHours.regular.toFixed(1)} regulier + ${workingHours.actualHours.overtime.toFixed(1)} overwerk)
• Werkdagen: ${workingHours.workingDays.actualDays} van ${workingHours.workingDays.workingDaysInMonth} werkdagen
• Uurloon: €${workingHours.hourlyRate.regular.toFixed(2)} (regulier), €${workingHours.hourlyRate.overtime.toFixed(2)} (overwerk)
  `.trim();
}

/**
 * Calculate pro-rata working hours for partial months
 */
export function calculateProRataWorkingHours(
  contractHoursPerWeek: number,
  startDate: Date,
  endDate: Date,
  year: number,
  month: number
): {
  totalWorkingDays: number;
  actualWorkingDays: number;
  proRataFactor: number;
  expectedHours: number;
} {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  
  const totalWorkingDays = calculateWorkingDaysBetween(monthStart, monthEnd);
  
  const effectiveStart = startDate > monthStart ? startDate : monthStart;
  const effectiveEnd = endDate < monthEnd ? endDate : monthEnd;
  
  const actualWorkingDays = calculateWorkingDaysBetween(effectiveStart, effectiveEnd);
  const proRataFactor = actualWorkingDays / totalWorkingDays;
  
  const monthlyContractHours = (contractHoursPerWeek * 52) / 12;
  const expectedHours = monthlyContractHours * proRataFactor;
  
  return {
    totalWorkingDays,
    actualWorkingDays,
    proRataFactor,
    expectedHours
  };
}

/**
 * Validate working hours against Dutch labor law limits
 */
export function validateWorkingHours(
  weeklyHours: number,
  dailyHours: number,
  overtimeHours: number
): {
  isValid: boolean;
  violations: string[];
  warnings: string[];
} {
  const violations: string[] = [];
  const warnings: string[] = [];
  
  // Dutch labor law limits
  const MAX_WEEKLY_HOURS = 48; // EU Working Time Directive
  const MAX_DAILY_HOURS = 12;
  const STANDARD_WEEKLY_HOURS = 40;
  const MAX_OVERTIME_PER_WEEK = 8;
  
  // Check violations
  if (weeklyHours > MAX_WEEKLY_HOURS) {
    violations.push(`Wekelijkse uren (${weeklyHours}) overschrijden maximum (${MAX_WEEKLY_HOURS})`);
  }
  
  if (dailyHours > MAX_DAILY_HOURS) {
    violations.push(`Dagelijkse uren (${dailyHours}) overschrijden maximum (${MAX_DAILY_HOURS})`);
  }
  
  // Check warnings
  if (weeklyHours > STANDARD_WEEKLY_HOURS) {
    warnings.push(`Wekelijkse uren (${weeklyHours}) boven standaard (${STANDARD_WEEKLY_HOURS})`);
  }
  
  if (overtimeHours > MAX_OVERTIME_PER_WEEK) {
    warnings.push(`Overwerk (${overtimeHours}) boven aanbevolen maximum (${MAX_OVERTIME_PER_WEEK})`);
  }
  
  return {
    isValid: violations.length === 0,
    violations,
    warnings
  };
}

