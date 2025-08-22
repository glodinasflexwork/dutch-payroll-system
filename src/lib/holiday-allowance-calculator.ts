/**
 * Dutch Holiday Allowance Calculator
 * Implements transparent holiday allowance calculations for legal compliance
 */

export interface HolidayAllowanceData {
  statutory: {
    rate: number; // 8.33% minimum
    amount: number;
    description: string;
  };
  actual: {
    rate: number;
    amount: number;
    description: string;
  };
  reserve: {
    accumulated: number;
    thisMonth: number;
    paid: number;
    balance: number;
  };
  payment: {
    paymentMonth: number; // Usually May (5)
    paymentDate: Date;
    isPaymentMonth: boolean;
  };
  compliance: {
    isCompliant: boolean;
    message: string;
  };
}

export interface VacationDaysData {
  statutory: {
    daysPerYear: number;
    description: string;
  };
  contract: {
    daysPerYear: number;
    description: string;
  };
  balance: {
    beginning: number;
    earned: number;
    used: number;
    remaining: number;
  };
  thisMonth: {
    earned: number;
    used: number;
  };
}

/**
 * Calculate holiday allowance information for payslip transparency
 */
export function calculateHolidayAllowance(
  grossAnnualSalary: number,
  grossMonthlySalary: number,
  contractualHolidayRate: number = 8.33,
  year: number,
  month: number,
  startDate?: Date
): HolidayAllowanceData {
  const STATUTORY_RATE = 8.33; // 8.33% minimum by Dutch law
  const PAYMENT_MONTH = 5; // May
  
  // Calculate statutory minimum
  const statutoryAmount = (grossAnnualSalary * STATUTORY_RATE) / 100;
  const statutoryMonthly = statutoryAmount / 12;
  
  // Calculate actual holiday allowance
  const actualRate = Math.max(contractualHolidayRate, STATUTORY_RATE);
  const actualAmount = (grossAnnualSalary * actualRate) / 100;
  const actualMonthly = actualAmount / 12;
  
  // Calculate pro-rata for partial year employees
  let proRataFactor = 1;
  if (startDate && startDate.getFullYear() === year) {
    const startMonth = startDate.getMonth() + 1; // 1-based month
    proRataFactor = (12 - startMonth + 1) / 12;
  }
  
  const adjustedAnnualAmount = actualAmount * proRataFactor;
  const adjustedMonthlyAmount = adjustedAnnualAmount / 12;
  
  // Calculate reserve accumulation
  const monthsWorked = month;
  const accumulatedReserve = adjustedMonthlyAmount * monthsWorked;
  
  // Determine if this is payment month and calculate payment
  const isPaymentMonth = month === PAYMENT_MONTH;
  const paymentDate = new Date(year, PAYMENT_MONTH - 1, 25); // May 25th
  
  let paidAmount = 0;
  let currentBalance = accumulatedReserve;
  
  if (month > PAYMENT_MONTH) {
    // After payment month - holiday allowance has been paid
    paidAmount = adjustedAnnualAmount;
    currentBalance = accumulatedReserve - paidAmount;
  } else if (isPaymentMonth) {
    // In payment month - holiday allowance is being paid
    paidAmount = accumulatedReserve;
    currentBalance = 0;
  }
  
  // Compliance check
  const isCompliant = actualRate >= STATUTORY_RATE;
  const complianceMessage = isCompliant
    ? `✓ Vakantiegeld voldoet aan wettelijk minimum (${actualRate}% ≥ ${STATUTORY_RATE}%)`
    : `⚠ Vakantiegeld onder wettelijk minimum (${actualRate}% < ${STATUTORY_RATE}%)`;
  
  return {
    statutory: {
      rate: STATUTORY_RATE,
      amount: statutoryAmount * proRataFactor,
      description: 'Wettelijk minimum vakantiegeld'
    },
    actual: {
      rate: actualRate,
      amount: adjustedAnnualAmount,
      description: 'Contractueel vakantiegeld'
    },
    reserve: {
      accumulated: accumulatedReserve,
      thisMonth: adjustedMonthlyAmount,
      paid: paidAmount,
      balance: currentBalance
    },
    payment: {
      paymentMonth: PAYMENT_MONTH,
      paymentDate,
      isPaymentMonth
    },
    compliance: {
      isCompliant,
      message: complianceMessage
    }
  };
}

/**
 * Calculate vacation days information
 */
export function calculateVacationDays(
  contractHoursPerWeek: number,
  contractVacationDays: number = 25,
  year: number,
  month: number,
  startDate?: Date,
  vacationDaysUsed: number = 0
): VacationDaysData {
  const STATUTORY_DAYS_FULL_TIME = 20; // 4 weeks minimum
  
  // Calculate statutory minimum based on working hours
  const fullTimeHours = 40;
  const workingTimeFactor = contractHoursPerWeek / fullTimeHours;
  const statutoryDays = STATUTORY_DAYS_FULL_TIME * workingTimeFactor;
  
  // Calculate actual vacation days (contract vs statutory)
  const actualVacationDays = Math.max(contractVacationDays, statutoryDays);
  
  // Calculate pro-rata for partial year employees
  let proRataFactor = 1;
  if (startDate && startDate.getFullYear() === year) {
    const startMonth = startDate.getMonth() + 1;
    proRataFactor = (12 - startMonth + 1) / 12;
  }
  
  const adjustedVacationDays = actualVacationDays * proRataFactor;
  
  // Calculate monthly accrual
  const monthlyAccrual = adjustedVacationDays / 12;
  const earnedToDate = monthlyAccrual * month;
  
  // Calculate balance
  const remainingDays = earnedToDate - vacationDaysUsed;
  
  return {
    statutory: {
      daysPerYear: statutoryDays,
      description: `Wettelijk minimum: ${statutoryDays.toFixed(1)} dagen`
    },
    contract: {
      daysPerYear: actualVacationDays,
      description: `Contractueel: ${actualVacationDays} dagen`
    },
    balance: {
      beginning: 0, // Would need to be tracked from previous year
      earned: earnedToDate,
      used: vacationDaysUsed,
      remaining: remainingDays
    },
    thisMonth: {
      earned: monthlyAccrual,
      used: 0 // Would need to be provided from timesheet data
    }
  };
}

/**
 * Format holiday allowance information for payslip display
 */
export function formatHolidayAllowanceForPayslip(holidayData: HolidayAllowanceData): string {
  const { actual, reserve, payment, compliance } = holidayData;
  
  let paymentInfo = '';
  if (payment.isPaymentMonth) {
    paymentInfo = `\n• Uitbetaling: €${reserve.paid.toFixed(2)} (${payment.paymentDate.toLocaleDateString('nl-NL')})`;
  } else if (reserve.balance > 0) {
    paymentInfo = `\n• Saldo: €${reserve.balance.toFixed(2)} (uitbetaling in mei)`;
  }
  
  return `
Vakantiegeld (${actual.rate}%):
• Jaarlijks: €${actual.amount.toFixed(2)}
• Deze maand: €${reserve.thisMonth.toFixed(2)}${paymentInfo}
• ${compliance.message}
  `.trim();
}

/**
 * Format vacation days information for payslip display
 */
export function formatVacationDaysForPayslip(vacationData: VacationDaysData): string {
  return `
Vakantiedagen:
• ${vacationData.contract.description}
• Opgebouwd: ${vacationData.balance.earned.toFixed(1)} dagen
• Gebruikt: ${vacationData.balance.used} dagen
• Saldo: ${vacationData.balance.remaining.toFixed(1)} dagen
  `.trim();
}

/**
 * Calculate holiday allowance payment schedule
 */
export function calculateHolidayPaymentSchedule(
  grossAnnualSalary: number,
  holidayRate: number,
  year: number,
  startDate?: Date
): {
  totalAmount: number;
  monthlyReserve: number;
  paymentDate: Date;
  paymentAmount: number;
  schedule: Array<{
    month: number;
    monthName: string;
    reserve: number;
    cumulative: number;
    isPayout: boolean;
  }>;
} {
  const totalAmount = (grossAnnualSalary * holidayRate) / 100;
  const monthlyReserve = totalAmount / 12;
  const paymentDate = new Date(year, 4, 25); // May 25th
  
  const monthNames = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ];
  
  const schedule = [];
  let cumulative = 0;
  
  for (let month = 1; month <= 12; month++) {
    const isPayout = month === 5; // May
    
    if (isPayout) {
      // In May, pay out accumulated amount
      schedule.push({
        month,
        monthName: monthNames[month - 1],
        reserve: -cumulative, // Negative because it's paid out
        cumulative: 0,
        isPayout: true
      });
      cumulative = 0;
    } else {
      cumulative += monthlyReserve;
      schedule.push({
        month,
        monthName: monthNames[month - 1],
        reserve: monthlyReserve,
        cumulative,
        isPayout: false
      });
    }
  }
  
  return {
    totalAmount,
    monthlyReserve,
    paymentDate,
    paymentAmount: totalAmount,
    schedule
  };
}

