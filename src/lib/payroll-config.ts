/**
 * Payroll Configuration Management System
 * Centralizes business logic and makes it configurable
 */

export interface PayrollConfig {
  companySize: 'small' | 'medium' | 'large'
  sector: string
  awfRate: 'low' | 'medium' | 'high'
  aofRate: 'low' | 'medium' | 'high'
  defaultGrossSalary: number
  holidayAllowanceRate: number
  taxSettings: {
    defaultTaxTable: string
    socialSecurityEnabled: boolean
  }
}

export interface CompanyContext {
  id: string
  name: string
  address?: string
  city?: string
  postalCode?: string
  kvkNumber?: string
  taxNumber?: string
  sector?: string
}

export interface EmployeeContext {
  id: string
  firstName: string
  lastName: string
  employeeNumber?: string
  position?: string
  department?: string
  bsn: string
  startDate: Date
  employmentType: string
  taxTable: string
  grossSalary: number
}

export interface PayrollContext {
  company: CompanyContext
  employee: EmployeeContext
  config: PayrollConfig
  period: {
    year: number
    month: number
  }
}

/**
 * Get payroll configuration based on company characteristics
 */
export function getPayrollConfig(company: CompanyContext): PayrollConfig {
  // Default configuration - can be moved to database later
  const baseConfig: PayrollConfig = {
    companySize: 'medium',
    sector: company.sector || 'general',
    awfRate: 'low',
    aofRate: 'low',
    defaultGrossSalary: 3500,
    holidayAllowanceRate: 0.08, // 8% holiday allowance
    taxSettings: {
      defaultTaxTable: 'table1',
      socialSecurityEnabled: true
    }
  }

  // Sector-specific configurations
  const sectorConfigs: Record<string, Partial<PayrollConfig>> = {
    'technology': {
      companySize: 'medium',
      awfRate: 'low',
      aofRate: 'low'
    },
    'healthcare': {
      companySize: 'large',
      awfRate: 'medium',
      aofRate: 'medium'
    },
    'finance': {
      companySize: 'large',
      awfRate: 'low',
      aofRate: 'low'
    },
    'retail': {
      companySize: 'medium',
      awfRate: 'medium',
      aofRate: 'medium'
    },
    'manufacturing': {
      companySize: 'large',
      awfRate: 'high',
      aofRate: 'high'
    }
  }

  const sectorConfig = sectorConfigs[company.sector?.toLowerCase() || 'general'] || {}
  
  return {
    ...baseConfig,
    ...sectorConfig
  }
}

/**
 * Convert company data to standardized context
 */
export function createCompanyContext(company: any): CompanyContext {
  return {
    id: company.id,
    name: company.name,
    address: company.address || '',
    city: company.city || '',
    postalCode: company.postalCode || '',
    kvkNumber: company.kvkNumber || '',
    taxNumber: company.taxNumber || '',
    sector: company.sector || 'general'
  }
}

/**
 * Convert employee data to standardized context
 */
export function createEmployeeContext(employee: any): EmployeeContext {
  return {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    employeeNumber: employee.employeeNumber || '',
    position: employee.position || '',
    department: employee.department || '',
    bsn: employee.bsn,
    startDate: employee.startDate,
    employmentType: employee.employmentType,
    taxTable: employee.taxTable,
    grossSalary: employee.grossSalary || 3500
  }
}

/**
 * Create complete payroll context
 */
export function createPayrollContext(
  company: any,
  employee: any,
  period: { year: number; month: number }
): PayrollContext {
  const companyContext = createCompanyContext(company)
  const employeeContext = createEmployeeContext(employee)
  const config = getPayrollConfig(companyContext)

  return {
    company: companyContext,
    employee: employeeContext,
    config,
    period
  }
}

/**
 * Validate payroll context
 */
export function validatePayrollContext(context: PayrollContext): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!context.company.id) errors.push('Company ID is required')
  if (!context.company.name) errors.push('Company name is required')
  if (!context.employee.id) errors.push('Employee ID is required')
  if (!context.employee.bsn) errors.push('Employee BSN is required')
  if (!context.period.year || !context.period.month) errors.push('Valid period is required')

  return {
    valid: errors.length === 0,
    errors
  }
}

