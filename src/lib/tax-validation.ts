/**
 * Tax Number Validation Utilities for Dutch Tax Numbers
 * Supports RSIN and Loonheffingennummer validation
 */

export interface TaxNumberValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}

/**
 * Validates Dutch RSIN (Rechtspersonen en Samenwerkingsverbanden Informatienummer)
 * RSIN is an 8-digit number used to identify legal entities and partnerships
 * 
 * @param rsin - The RSIN to validate
 * @returns Validation result with formatted number if valid
 */
export function validateRSIN(rsin: string): TaxNumberValidationResult {
  if (!rsin) {
    return { isValid: false, error: 'RSIN is required' };
  }

  // Remove any spaces, dots, or other non-digit characters
  const cleanRsin = rsin.replace(/\D/g, '');

  // RSIN must be exactly 8 digits
  if (cleanRsin.length !== 8) {
    return { 
      isValid: false, 
      error: 'RSIN must be exactly 8 digits' 
    };
  }

  // Check if all digits are the same (invalid)
  if (/^(\d)\1{7}$/.test(cleanRsin)) {
    return { 
      isValid: false, 
      error: 'RSIN cannot consist of the same digit repeated' 
    };
  }

  // Basic checksum validation (simplified BSN algorithm adapted for RSIN)
  const digits = cleanRsin.split('').map(Number);
  let sum = 0;
  
  for (let i = 0; i < 7; i++) {
    sum += digits[i] * (8 - i);
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;
  
  if (digits[7] !== checkDigit) {
    return { 
      isValid: false, 
      error: 'Invalid RSIN checksum' 
    };
  }

  // Format as XXXX XXXX for display
  const formatted = `${cleanRsin.slice(0, 4)} ${cleanRsin.slice(4)}`;

  return { 
    isValid: true, 
    formatted 
  };
}

/**
 * Validates Dutch Loonheffingennummer (Payroll Tax Number)
 * Format: 9 digits + 'L' + 2 digits (e.g., 123456789L01)
 * 
 * @param loonheffingennummer - The Loonheffingennummer to validate
 * @returns Validation result with formatted number if valid
 */
export function validateLoonheffingennummer(loonheffingennummer: string): TaxNumberValidationResult {
  if (!loonheffingennummer) {
    return { isValid: false, error: 'Loonheffingennummer is required' };
  }

  // Remove spaces and convert to uppercase
  const cleanNumber = loonheffingennummer.replace(/\s/g, '').toUpperCase();

  // Check format: 9 digits + L + 2 digits
  const loonheffingRegex = /^(\d{9})L(\d{2})$/;
  const match = cleanNumber.match(loonheffingRegex);

  if (!match) {
    return { 
      isValid: false, 
      error: 'Loonheffingennummer must be in format: 123456789L01' 
    };
  }

  const [, mainNumber, suffix] = match;

  // Validate the main 9-digit number (basic checks)
  if (/^0{9}$/.test(mainNumber) || /^(\d)\1{8}$/.test(mainNumber)) {
    return { 
      isValid: false, 
      error: 'Invalid Loonheffingennummer: main number cannot be all zeros or same digit' 
    };
  }

  // Format for display: XXX XXX XXXLXX
  const formatted = `${mainNumber.slice(0, 3)} ${mainNumber.slice(3, 6)} ${mainNumber.slice(6)}L${suffix}`;

  return { 
    isValid: true, 
    formatted 
  };
}

/**
 * Validates both RSIN and Loonheffingennummer
 * 
 * @param rsin - The RSIN to validate
 * @param loonheffingennummer - The Loonheffingennummer to validate
 * @returns Object with validation results for both numbers
 */
export function validateTaxNumbers(rsin?: string, loonheffingennummer?: string) {
  const rsinResult = rsin ? validateRSIN(rsin) : { isValid: true };
  const loonheffingResult = loonheffingennummer ? validateLoonheffingennummer(loonheffingennummer) : { isValid: true };

  return {
    rsin: rsinResult,
    loonheffingennummer: loonheffingResult,
    isValid: rsinResult.isValid && loonheffingResult.isValid
  };
}

/**
 * Formats RSIN for display
 */
export function formatRSIN(rsin: string): string {
  const cleanRsin = rsin.replace(/\D/g, '');
  if (cleanRsin.length === 8) {
    return `${cleanRsin.slice(0, 4)} ${cleanRsin.slice(4)}`;
  }
  return rsin;
}

/**
 * Formats Loonheffingennummer for display
 */
export function formatLoonheffingennummer(loonheffingennummer: string): string {
  const cleanNumber = loonheffingennummer.replace(/\s/g, '').toUpperCase();
  const match = cleanNumber.match(/^(\d{9})L(\d{2})$/);
  
  if (match) {
    const [, mainNumber, suffix] = match;
    return `${mainNumber.slice(0, 3)} ${mainNumber.slice(3, 6)} ${mainNumber.slice(6)}L${suffix}`;
  }
  
  return loonheffingennummer;
}

