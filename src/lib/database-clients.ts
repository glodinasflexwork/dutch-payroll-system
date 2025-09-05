// Database Clients Utility
// Provides centralized access to all three databases with proper client initialization

import { PrismaClient as AuthClient } from '@prisma/client'
import { PrismaClient as HRClient } from '@prisma/hr-client'
import { PrismaClient as PayrollClient } from '@prisma/payroll-client'

// Singleton pattern for database clients
let authClient: AuthClient | null = null
let hrClient: HRClient | null = null
let payrollClient: PayrollClient | null = null

/**
 * Get AUTH Database Client
 * Handles user authentication, companies, subscriptions
 */
export function getAuthClient(): AuthClient {
  if (!authClient) {
    authClient = new AuthClient({
      datasources: {
        db: {
          url: process.env.AUTH_DATABASE_URL
        }
      }
    })
  }
  return authClient
}

/**
 * Get HR Database Client
 * Handles employee records, departments, leave management
 */
export function getHRClient(): HRClient {
  if (!hrClient) {
    hrClient = new HRClient({
      datasources: {
        db: {
          url: process.env.HR_DATABASE_URL
        }
      }
    })
  }
  return hrClient
}

/**
 * Get PAYROLL Database Client
 * Handles payroll calculations, tax records, payslips
 */
export function getPayrollClient(): PayrollClient {
  if (!payrollClient) {
    payrollClient = new PayrollClient({
      datasources: {
        db: {
          url: process.env.PAYROLL_DATABASE_URL
        }
      }
    })
  }
  return payrollClient
}

/**
 * Disconnect all database clients
 * Should be called when shutting down the application
 */
export async function disconnectAllClients(): Promise<void> {
  const promises: Promise<void>[] = []
  
  if (authClient) {
    promises.push(getAuthClient().$disconnect())
    authClient = null
  }
  
  if (hrClient) {
    promises.push(getHRClient().$disconnect())
    hrClient = null
  }
  
  if (payrollClient) {
    promises.push(getPayrollClient().$disconnect())
    payrollClient = null
  }
  
  await Promise.all(promises)
}

/**
 * Test all database connections
 * Returns connection status for each database
 */
export async function testAllConnections(): Promise<{
  auth: { connected: boolean; error?: string }
  hr: { connected: boolean; error?: string }
  payroll: { connected: boolean; error?: string }
}> {
  const results = {
    auth: { connected: false, error: undefined as string | undefined },
    hr: { connected: false, error: undefined as string | undefined },
    payroll: { connected: false, error: undefined as string | undefined }
  }

  // Test AUTH connection
  try {
    const auth = getAuthClient()
    await auth.$queryRaw`SELECT 1`
    results.auth.connected = true
  } catch (error) {
    results.auth.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // Test HR connection
  try {
    const hr = getHRClient()
    await hr.$queryRaw`SELECT 1`
    results.hr.connected = true
  } catch (error) {
    results.hr.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // Test PAYROLL connection
  try {
    const payroll = getPayrollClient()
    await payroll.$queryRaw`SELECT 1`
    results.payroll.connected = true
  } catch (error) {
    results.payroll.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return results
}

/**
 * Get database statistics
 * Returns record counts for key tables in each database
 */
export async function getDatabaseStatistics(): Promise<{
  auth: {
    users: number
    companies: number
    subscriptions: number
  }
  hr: {
    employees: number
    companies: number
    departments: number
    leaveRequests: number
  }
  payroll: {
    payrollRecords: number
    taxCalculations: number
    payslipGenerations: number
  }
}> {
  const auth = getAuthClient()
  const hr = getHRClient()
  const payroll = getPayrollClient()

  const [authStats, hrStats, payrollStats] = await Promise.all([
    // AUTH statistics
    Promise.all([
      auth.user.count(),
      auth.company.count(),
      auth.subscription.count()
    ]).then(([users, companies, subscriptions]) => ({
      users,
      companies,
      subscriptions
    })),

    // HR statistics
    Promise.all([
      hr.employee.count(),
      hr.company.count(),
      hr.department.count(),
      hr.leaveRequest.count()
    ]).then(([employees, companies, departments, leaveRequests]) => ({
      employees,
      companies,
      departments,
      leaveRequests
    })),

    // PAYROLL statistics
    Promise.all([
      payroll.payrollRecord.count(),
      payroll.taxCalculation.count(),
      payroll.payslipGeneration.count()
    ]).then(([payrollRecords, taxCalculations, payslipGenerations]) => ({
      payrollRecords,
      taxCalculations,
      payslipGenerations
    }))
  ])

  return {
    auth: authStats,
    hr: hrStats,
    payroll: payrollStats
  }
}

/**
 * Database health check
 * Comprehensive health check for all databases
 */
export async function performHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  databases: {
    auth: { status: 'up' | 'down'; responseTime: number; error?: string }
    hr: { status: 'up' | 'down'; responseTime: number; error?: string }
    payroll: { status: 'up' | 'down'; responseTime: number; error?: string }
  }
  timestamp: string
}> {
  const startTime = Date.now()
  
  const checkDatabase = async (
    name: string,
    client: AuthClient | HRClient | PayrollClient
  ): Promise<{ status: 'up' | 'down'; responseTime: number; error?: string }> => {
    const dbStartTime = Date.now()
    try {
      await client.$queryRaw`SELECT 1`
      return {
        status: 'up',
        responseTime: Date.now() - dbStartTime
      }
    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - dbStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  const [authResult, hrResult, payrollResult] = await Promise.all([
    checkDatabase('auth', getAuthClient()),
    checkDatabase('hr', getHRClient()),
    checkDatabase('payroll', getPayrollClient())
  ])

  const databases = {
    auth: authResult,
    hr: hrResult,
    payroll: payrollResult
  }

  // Determine overall status
  const upCount = Object.values(databases).filter(db => db.status === 'up').length
  let status: 'healthy' | 'degraded' | 'unhealthy'
  
  if (upCount === 3) {
    status = 'healthy'
  } else if (upCount >= 2) {
    status = 'degraded'
  } else {
    status = 'unhealthy'
  }

  return {
    status,
    databases,
    timestamp: new Date().toISOString()
  }
}

// Export individual clients for backward compatibility
export { AuthClient, HRClient, PayrollClient }

// Default export for convenience
export default {
  getAuthClient,
  getHRClient,
  getPayrollClient,
  disconnectAllClients,
  testAllConnections,
  getDatabaseStatistics,
  performHealthCheck
}
