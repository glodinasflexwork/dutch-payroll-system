/**
 * Dutch Social Security Contribution Breakdown Utility
 * Implements detailed breakdown of social security contributions for legal compliance
 */

export interface SocialSecurityBreakdown {
  aow: {
    rate: number;
    amount: number;
    description: string;
    maxIncome: number;
  };
  ww: {
    rate: number;
    amount: number;
    description: string;
    maxIncome: number;
  };
  wia: {
    rate: number;
    amount: number;
    description: string;
    maxIncome: number;
  };
  zvw: {
    rate: number;
    amount: number;
    description: string;
    maxIncome: number;
  };
  total: {
    amount: number;
    description: string;
  };
}

/**
 * Dutch social security rates for 2025
 * Source: Belastingdienst.nl
 */
const SOCIAL_SECURITY_RATES_2025 = {
  aow: {
    rate: 0.1790, // 17.90%
    description: 'AOW (Algemene Ouderdomswet)',
    maxIncome: 38441, // Maximum income for AOW contribution
    explanation: 'Staatspensioen voor iedereen vanaf 67 jaar'
  },
  ww: {
    rate: 0.0290, // 2.90% (employee portion)
    description: 'WW (Werkloosheidswet)',
    maxIncome: 69398, // Maximum income for WW contribution
    explanation: 'Werkloosheidsuitkering bij verlies van baan'
  },
  wia: {
    rate: 0.0060, // 0.60%
    description: 'WIA (Wet werk en inkomen naar arbeidsvermogen)',
    maxIncome: 69398, // Maximum income for WIA contribution
    explanation: 'Uitkering bij arbeidsongeschiktheid'
  },
  zvw: {
    rate: 0.0565, // 5.65%
    description: 'Zvw (Zorgverzekeringswet)',
    maxIncome: 69398, // Maximum income for Zvw contribution
    explanation: 'Bijdrage aan de zorgverzekering'
  }
};

/**
 * Calculate detailed social security contribution breakdown
 */
export function calculateSocialSecurityBreakdown(
  grossSalary: number,
  isFullTime: boolean = true
): SocialSecurityBreakdown {
  const rates = SOCIAL_SECURITY_RATES_2025;
  
  // Calculate each contribution
  const aowAmount = Math.min(grossSalary, rates.aow.maxIncome / 12) * rates.aow.rate;
  const wwAmount = Math.min(grossSalary, rates.ww.maxIncome / 12) * rates.ww.rate;
  const wiaAmount = Math.min(grossSalary, rates.wia.maxIncome / 12) * rates.wia.rate;
  const zvwAmount = Math.min(grossSalary, rates.zvw.maxIncome / 12) * rates.zvw.rate;
  
  const totalAmount = aowAmount + wwAmount + wiaAmount + zvwAmount;
  
  return {
    aow: {
      rate: rates.aow.rate,
      amount: aowAmount,
      description: rates.aow.description,
      maxIncome: rates.aow.maxIncome
    },
    ww: {
      rate: rates.ww.rate,
      amount: wwAmount,
      description: rates.ww.description,
      maxIncome: rates.ww.maxIncome
    },
    wia: {
      rate: rates.wia.rate,
      amount: wiaAmount,
      description: rates.wia.description,
      maxIncome: rates.wia.maxIncome
    },
    zvw: {
      rate: rates.zvw.rate,
      amount: zvwAmount,
      description: rates.zvw.description,
      maxIncome: rates.zvw.maxIncome
    },
    total: {
      amount: totalAmount,
      description: 'Totaal sociale verzekeringen'
    }
  };
}

/**
 * Format social security breakdown for payslip display
 */
export function formatSocialSecurityForPayslip(breakdown: SocialSecurityBreakdown): string {
  return `
Sociale Verzekeringen (€${breakdown.total.amount.toFixed(2)}):
• ${breakdown.aow.description}: ${(breakdown.aow.rate * 100).toFixed(1)}% = €${breakdown.aow.amount.toFixed(2)}
• ${breakdown.ww.description}: ${(breakdown.ww.rate * 100).toFixed(1)}% = €${breakdown.ww.amount.toFixed(2)}
• ${breakdown.wia.description}: ${(breakdown.wia.rate * 100).toFixed(1)}% = €${breakdown.wia.amount.toFixed(2)}
• ${breakdown.zvw.description}: ${(breakdown.zvw.rate * 100).toFixed(1)}% = €${breakdown.zvw.amount.toFixed(2)}
  `.trim();
}

/**
 * Get social security contribution explanations
 */
export function getSocialSecurityExplanations(): Record<string, string> {
  const rates = SOCIAL_SECURITY_RATES_2025;
  
  return {
    aow: rates.aow.explanation,
    ww: rates.ww.explanation,
    wia: rates.wia.explanation,
    zvw: rates.zvw.explanation
  };
}

/**
 * Calculate employer social security contributions (for transparency)
 */
export function calculateEmployerSocialSecurityContributions(
  grossSalary: number
): {
  awf: { rate: number; amount: number; description: string };
  wga: { rate: number; amount: number; description: string };
  zvw: { rate: number; amount: number; description: string };
  total: { amount: number; description: string };
} {
  // Employer contribution rates for 2025
  const employerRates = {
    awf: 0.0070, // 0.70% - Algemeen Werkloosheidsfonds
    wga: 0.0073, // 0.73% - Werkgeverslasten WGA
    zvw: 0.0665  // 6.65% - Employer portion of health insurance
  };
  
  const awfAmount = grossSalary * employerRates.awf;
  const wgaAmount = grossSalary * employerRates.wga;
  const zvwAmount = grossSalary * employerRates.zvw;
  const totalAmount = awfAmount + wgaAmount + zvwAmount;
  
  return {
    awf: {
      rate: employerRates.awf,
      amount: awfAmount,
      description: 'AWF (Algemeen Werkloosheidsfonds)'
    },
    wga: {
      rate: employerRates.wga,
      amount: wgaAmount,
      description: 'WGA (Werkgeverslasten)'
    },
    zvw: {
      rate: employerRates.zvw,
      amount: zvwAmount,
      description: 'Zvw werkgeversbijdrage'
    },
    total: {
      amount: totalAmount,
      description: 'Totaal werkgeversbijdragen'
    }
  };
}

/**
 * Get current social security rates for reference
 */
export function getCurrentSocialSecurityRates(): typeof SOCIAL_SECURITY_RATES_2025 {
  return SOCIAL_SECURITY_RATES_2025;
}

