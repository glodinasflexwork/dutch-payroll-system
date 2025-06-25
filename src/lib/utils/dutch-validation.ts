/**
 * Dutch-specific validation utilities
 */

/**
 * Validate Dutch BSN (Burgerservicenummer)
 * BSN uses the 11-proof algorithm
 */
export function validateBSN(bsn: string): boolean {
  // Remove any spaces or dashes
  const cleanBSN = bsn.replace(/[\s-]/g, '')
  
  // Check if it's 8 or 9 digits
  if (!/^\d{8,9}$/.test(cleanBSN)) {
    return false
  }
  
  // Pad with leading zero if 8 digits
  const paddedBSN = cleanBSN.padStart(9, '0')
  
  // Apply 11-proof algorithm
  let sum = 0
  for (let i = 0; i < 8; i++) {
    sum += parseInt(paddedBSN[i]) * (9 - i)
  }
  
  // Subtract the last digit
  sum -= parseInt(paddedBSN[8])
  
  // Check if divisible by 11
  return sum % 11 === 0
}

/**
 * Validate Dutch postal code
 * Format: 1234 AB or 1234AB
 */
export function validatePostalCode(postalCode: string): boolean {
  const cleanPostalCode = postalCode.replace(/\s/g, '').toUpperCase()
  return /^\d{4}[A-Z]{2}$/.test(cleanPostalCode)
}

/**
 * Format Dutch postal code
 * Ensures proper spacing: 1234 AB
 */
export function formatPostalCode(postalCode: string): string {
  const cleanPostalCode = postalCode.replace(/\s/g, '').toUpperCase()
  if (validatePostalCode(cleanPostalCode)) {
    return `${cleanPostalCode.slice(0, 4)} ${cleanPostalCode.slice(4)}`
  }
  return postalCode
}

/**
 * Validate Dutch KvK number (Chamber of Commerce)
 * 8 digits, starting from 2008
 */
export function validateKvKNumber(kvkNumber: string): boolean {
  const cleanKvK = kvkNumber.replace(/[\s-]/g, '')
  return /^\d{8}$/.test(cleanKvK)
}

/**
 * Validate Dutch bank account number (IBAN)
 * Format: NL## #### #### #### ##
 */
export function validateDutchIBAN(iban: string): boolean {
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase()
  
  // Check if it starts with NL and has correct length
  if (!/^NL\d{2}[A-Z0-9]{16}$/.test(cleanIBAN)) {
    return false
  }
  
  // Basic IBAN checksum validation (simplified)
  return true // For now, just format validation
}

/**
 * Format Dutch IBAN
 * Ensures proper spacing: NL## #### #### #### ##
 */
export function formatDutchIBAN(iban: string): string {
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase()
  if (cleanIBAN.length === 18 && cleanIBAN.startsWith('NL')) {
    return `${cleanIBAN.slice(0, 4)} ${cleanIBAN.slice(4, 8)} ${cleanIBAN.slice(8, 12)} ${cleanIBAN.slice(12, 16)} ${cleanIBAN.slice(16)}`
  }
  return iban
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--
  }
  
  return age
}

/**
 * Check if employee is eligible for certain benefits based on age
 */
export function isEligibleForAOW(dateOfBirth: Date): boolean {
  const age = calculateAge(dateOfBirth)
  return age >= 67 // AOW retirement age in Netherlands
}

/**
 * Generate employee number
 * Format: EMP-YYYY-#### (e.g., EMP-2025-0001)
 */
export function generateEmployeeNumber(existingNumbers: string[]): string {
  const year = new Date().getFullYear()
  const prefix = `EMP-${year}-`
  
  // Find the highest number for this year
  let maxNumber = 0
  existingNumbers.forEach(num => {
    if (num.startsWith(prefix)) {
      const numberPart = parseInt(num.slice(prefix.length))
      if (numberPart > maxNumber) {
        maxNumber = numberPart
      }
    }
  })
  
  const nextNumber = maxNumber + 1
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Dutch format)
 */
export function validateDutchPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s-()]/g, '')
  // Dutch phone numbers: +31, 06, or 0## formats
  return /^(\+31|0)[1-9]\d{8}$/.test(cleanPhone)
}

/**
 * Format currency for display (Euro)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100)
}

