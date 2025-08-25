/**
 * Dutch Social Security Contribution Breakdown Utility
 * Implements detailed social security calculations for Dutch payslip compliance
 */

/**
 * Dutch social security rates for 2025
 * Source: Belastingdienst.nl
 */
const SOCIAL_SECURITY_RATES_2025 = {
  // AOW (Algemene Ouderdomswet) - State Pension
  aow: {
    rate: 0.1790, // 17.90%
    maxIncome: 38441, // Maximum income subject to AOW
    description: 'AOW (Algemene Ouderdomswet) - Staatspensioenpremie'
  },
  
  // WW (Werkloosheidswet) - Unemployment Insurance
  ww: {
    rate: 0.0290, // 2.90%
    maxIncome: 58311, // Maximum income subject to WW
    description: 'WW (Werkloosheidswet) - Werkloosheidsverzekering'
  },
  
  // WIA (Wet werk en inkomen naar arbeidsvermogen) - Disability Insurance
  wia: {
    rate: 0.0060, // 0.60%
    maxIncome: 58311, // Maximum income subject to WIA
    description: 'WIA (Wet werk en inkomen naar arbeidsvermogen) - Arbeidsongeschiktheidsverzekering'
  },
  
  // Zvw (Zorgverzekeringswet) - Health Insurance
  zvw: {
    rate: 0.0565, // 5.65%
    maxIncome: 58311, // Maximum income subject to Zvw
    description: 'Zvw (Zorgverzekeringswet) - Zorgverzekeringspremie'
  }
};

/**
 * Calculate detailed social security contribution breakdown
 */
function calculateSocialSecurityBreakdown(grossMonthlySalary) {
  const annualSalary = grossMonthlySalary * 12;
  
  // Calculate each contribution
  const aowContribution = calculateContribution(annualSalary, SOCIAL_SECURITY_RATES_2025.aow);
  const wwContribution = calculateContribution(annualSalary, SOCIAL_SECURITY_RATES_2025.ww);
  const wiaContribution = calculateContribution(annualSalary, SOCIAL_SECURITY_RATES_2025.wia);
  const zvwContribution = calculateContribution(annualSalary, SOCIAL_SECURITY_RATES_2025.zvw);
  
  // Calculate monthly amounts
  const monthlyAow = aowContribution / 12;
  const monthlyWw = wwContribution / 12;
  const monthlyWia = wiaContribution / 12;
  const monthlyZvw = zvwContribution / 12;
  
  const totalMonthly = monthlyAow + monthlyWw + monthlyWia + monthlyZvw;
  
  return {
    aow: {
      rate: SOCIAL_SECURITY_RATES_2025.aow.rate,
      amount: monthlyAow,
      description: SOCIAL_SECURITY_RATES_2025.aow.description
    },
    ww: {
      rate: SOCIAL_SECURITY_RATES_2025.ww.rate,
      amount: monthlyWw,
      description: SOCIAL_SECURITY_RATES_2025.ww.description
    },
    wia: {
      rate: SOCIAL_SECURITY_RATES_2025.wia.rate,
      amount: monthlyWia,
      description: SOCIAL_SECURITY_RATES_2025.wia.description
    },
    zvw: {
      rate: SOCIAL_SECURITY_RATES_2025.zvw.rate,
      amount: monthlyZvw,
      description: SOCIAL_SECURITY_RATES_2025.zvw.description
    },
    total: {
      amount: totalMonthly,
      description: 'Totaal sociale verzekeringen'
    }
  };
}

/**
 * Calculate individual contribution with maximum income limits
 */
function calculateContribution(annualSalary, rateInfo) {
  const applicableIncome = Math.min(annualSalary, rateInfo.maxIncome);
  return applicableIncome * rateInfo.rate;
}

/**
 * Get employer contributions (for transparency)
 */
function calculateEmployerContributions(grossMonthlySalary) {
  // Employer-specific rates (these are paid by employer, not deducted from employee)
  const EMPLOYER_RATES = {
    // WGA (Werkgeverslasten WGA)
    wga: 0.0070, // 0.70% (varies by company)
    // UFO (Uitvoeringsfonds voor de overheid) - if applicable
    ufo: 0.0070, // 0.70% (for government sector)
    // Sector-specific rates would go here
  };
  
  const annualSalary = grossMonthlySalary * 12;
  
  return {
    wga: {
      rate: EMPLOYER_RATES.wga,
      amount: (annualSalary * EMPLOYER_RATES.wga) / 12,
      description: 'WGA (Werkgeverslasten) - Betaald door werkgever'
    },
    // Add other employer contributions as needed
  };
}

/**
 * Format social security breakdown for payslip display
 */
function formatSocialSecurityForPayslip(breakdown) {
  const lines = [];
  
  lines.push(`AOW: ${(breakdown.aow.rate * 100).toFixed(1)}% = €${breakdown.aow.amount.toFixed(2)}`);
  lines.push(`WW: ${(breakdown.ww.rate * 100).toFixed(1)}% = €${breakdown.ww.amount.toFixed(2)}`);
  lines.push(`WIA: ${(breakdown.wia.rate * 100).toFixed(1)}% = €${breakdown.wia.amount.toFixed(2)}`);
  lines.push(`Zvw: ${(breakdown.zvw.rate * 100).toFixed(1)}% = €${breakdown.zvw.amount.toFixed(2)}`);
  lines.push(`Totaal: €${breakdown.total.amount.toFixed(2)}`);
  
  return lines.join('\n');
}

/**
 * Get social security rates for reference
 */
function getSocialSecurityRates() {
  return SOCIAL_SECURITY_RATES_2025;
}

/**
 * Calculate total social security percentage
 */
function getTotalSocialSecurityRate() {
  const rates = SOCIAL_SECURITY_RATES_2025;
  return rates.aow.rate + rates.ww.rate + rates.wia.rate + rates.zvw.rate;
}

/**
 * Validate social security calculations
 */
function validateSocialSecurityCalculations(breakdown, grossMonthlySalary) {
  const expectedTotal = grossMonthlySalary * getTotalSocialSecurityRate();
  const actualTotal = breakdown.total.amount;
  const difference = Math.abs(expectedTotal - actualTotal);
  
  return {
    isValid: difference < 0.01, // Allow for rounding differences
    expectedTotal,
    actualTotal,
    difference
  };
}

// CommonJS exports
module.exports = {
  calculateSocialSecurityBreakdown,
  calculateEmployerContributions,
  formatSocialSecurityForPayslip,
  getSocialSecurityRates,
  getTotalSocialSecurityRate,
  validateSocialSecurityCalculations
};

