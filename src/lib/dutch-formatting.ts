/**
 * Dutch Formatting Utilities
 * Professional formatting functions for Dutch payroll system
 */

/**
 * Format currency in proper Dutch format
 * Examples: 3500 -> "€ 3.500,-", 3500.50 -> "€ 3.500,50"
 */
export function formatDutchCurrency(amount: number): string {
  if (amount === 0) return "€ 0,-";
  
  // Handle negative amounts
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  
  // Split into euros and cents
  const euros = Math.floor(absoluteAmount);
  const cents = Math.round((absoluteAmount - euros) * 100);
  
  // Format euros with thousands separator (dots)
  const formattedEuros = euros.toLocaleString('nl-NL');
  
  // Format the final amount
  let formatted: string;
  if (cents === 0) {
    formatted = `€ ${formattedEuros},-`;
  } else {
    const formattedCents = cents.toString().padStart(2, '0');
    formatted = `€ ${formattedEuros},${formattedCents}`;
  }
  
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format date in Dutch DD-MM-YYYY format
 */
export function formatDutchDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}-${month}-${year}`;
}

/**
 * Format Dutch address in proper format
 */
export function formatDutchAddress(address: {
  streetName?: string;
  houseNumber?: string;
  houseNumberAddition?: string;
  postalCode?: string;
  city?: string;
}): {
  street: string;
  postalCity: string;
} {
  const street = [
    address.streetName,
    address.houseNumber,
    address.houseNumberAddition
  ].filter(Boolean).join(' ');
  
  const postalCity = [
    address.postalCode,
    address.city
  ].filter(Boolean).join(' ');
  
  return { street, postalCity };
}

/**
 * Format employee name with proper Dutch title
 */
export function formatDutchEmployeeName(employee: {
  firstName?: string;
  lastName?: string;
  gender?: string;
}): string {
  const title = employee.gender === 'female' ? 'Mevrouw' : 'De heer';
  const lastName = employee.lastName || '';
  const firstInitial = employee.firstName ? employee.firstName.charAt(0).toUpperCase() + '.' : '';
  
  return `${title} ${lastName}, ${firstInitial}`.trim();
}

/**
 * Format period in Dutch format
 */
export function formatDutchPeriod(year: number, month: number): string {
  return `${month}/${year}`;
}

/**
 * Format week period (for weekly payrolls)
 */
export function formatDutchWeekPeriod(startWeek: number, endWeek: number, year: number): string {
  if (startWeek === endWeek) {
    return `week ${startWeek} ${year}`;
  }
  return `week ${startWeek}-${endWeek} ${year}`;
}

/**
 * Calculate vacation allowance (8.33% standard)
 */
export function calculateVacationAllowance(grossSalary: number, percentage: number = 8.33): number {
  return (grossSalary * percentage) / 100;
}

/**
 * Format tax table in Dutch
 */
export function formatTaxTable(taxTable: string): string {
  switch (taxTable.toLowerCase()) {
    case 'wit':
    case 'white':
      return 'Wit';
    case 'groen':
    case 'green':
      return 'Groen';
    default:
      return 'Wit'; // Default to standard tax table
  }
}

/**
 * Format employment type in Dutch
 */
export function formatEmploymentType(type: string): string {
  switch (type.toLowerCase()) {
    case 'permanent':
    case 'vast':
      return 'Contract voor onbepaalde tijd';
    case 'temporary':
    case 'tijdelijk':
      return 'Contract voor bepaalde tijd';
    case 'freelance':
    case 'zzp':
      return 'Zelfstandige zonder personeel';
    case 'intern':
    case 'stage':
      return 'Stagiair';
    default:
      return 'Contract voor bepaalde tijd';
  }
}

/**
 * Generate Loonheffingennummer format (for display purposes)
 * Note: In real implementation, this should come from tax authorities
 */
export function generateLoonheffingennummer(companyId: string): string {
  // This is a mock format for development - real numbers come from Belastingdienst
  const hash = companyId.slice(-8);
  const numbers = hash.replace(/[^0-9]/g, '').slice(0, 9).padEnd(9, '0');
  const letter = 'L'; // Standard letter for most companies
  const suffix = '02'; // Standard suffix
  
  return `${numbers}${letter}${suffix}`;
}

/**
 * Format BSN (Burgerservicenummer) with proper spacing
 */
export function formatBSN(bsn: string): string {
  // Remove any existing formatting
  const cleanBSN = bsn.replace(/\D/g, '');
  
  // Format as XXX.XXX.XXX
  if (cleanBSN.length === 9) {
    return `${cleanBSN.slice(0, 3)}.${cleanBSN.slice(3, 6)}.${cleanBSN.slice(6, 9)}`;
  }
  
  return cleanBSN; // Return as-is if not 9 digits
}

/**
 * Validate Dutch postal code format
 */
export function isValidDutchPostalCode(postalCode: string): boolean {
  const pattern = /^[1-9][0-9]{3}\s?[A-Z]{2}$/i;
  return pattern.test(postalCode.trim());
}

/**
 * Format Dutch postal code properly
 */
export function formatDutchPostalCode(postalCode: string): string {
  const clean = postalCode.replace(/\s/g, '').toUpperCase();
  if (clean.length === 6) {
    return `${clean.slice(0, 4)}${clean.slice(4, 6)}`;
  }
  return postalCode;
}

