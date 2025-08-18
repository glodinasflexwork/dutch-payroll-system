import { PrismaClient as AuthClient } from '@prisma/client'
import { PrismaClient as HRClient } from '@prisma/hr-client'
import { PrismaClient as PayrollClient } from '@prisma/payroll-client'

// Validate environment variables
function validateDatabaseUrl(url: string | undefined, name: string): string {
  if (!url) {
    throw new Error(`${name} environment variable is not defined`)
  }
  
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    throw new Error(`${name} must start with postgresql:// or postgres://`)
  }
  
  return url
}

// Get validated database URLs
const getAuthDatabaseUrl = () => {
  try {
    return validateDatabaseUrl(process.env.AUTH_DATABASE_URL, 'AUTH_DATABASE_URL')
  } catch (error) {
    console.error('Auth database configuration error:', error)
    // Fallback to a default URL for build-time (will fail at runtime if not properly configured)
    return process.env.AUTH_DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'
  }
}

const getHRDatabaseUrl = () => {
  try {
    return validateDatabaseUrl(process.env.HR_DATABASE_URL, 'HR_DATABASE_URL')
  } catch (error) {
    console.error('HR database configuration error:', error)
    return process.env.HR_DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'
  }
}

const getPayrollDatabaseUrl = () => {
  try {
    return validateDatabaseUrl(process.env.PAYROLL_DATABASE_URL, 'PAYROLL_DATABASE_URL')
  } catch (error) {
    console.error('Payroll database configuration error:', error)
    return process.env.PAYROLL_DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'
  }
}

// Configure auth client with AUTH_DATABASE_URL and connection pooling
const createAuthClient = () => {
  try {
    const baseUrl = getAuthDatabaseUrl()
    const urlWithPooling = `${baseUrl}?connection_limit=5&pool_timeout=20&connect_timeout=10`
    
    return new AuthClient({
      datasources: {
        db: {
          url: urlWithPooling
        }
      }
    })
  } catch (error) {
    console.error('Failed to create auth client:', error)
    // Return a client that will fail gracefully
    return new AuthClient()
  }
}

// Create HR client with connection pooling
const createHRClient = () => {
  try {
    const baseUrl = getHRDatabaseUrl()
    const urlWithPooling = `${baseUrl}?connection_limit=5&pool_timeout=20&connect_timeout=10`
    
    return new HRClient({
      datasources: {
        db: {
          url: urlWithPooling
        }
      }
    })
  } catch (error) {
    console.error('Failed to create HR client:', error)
    return new HRClient()
  }
}

// Create Payroll client with connection pooling
const createPayrollClient = () => {
  try {
    const baseUrl = getPayrollDatabaseUrl()
    const urlWithPooling = `${baseUrl}?connection_limit=5&pool_timeout=20&connect_timeout=10`
    
    return new PayrollClient({
      datasources: {
        db: {
          url: urlWithPooling
        }
      }
    })
  } catch (error) {
    console.error('Failed to create Payroll client:', error)
    return new PayrollClient()
  }
}

// Global variable to store database clients
declare global {
  var __authClient: AuthClient | undefined
  var __hrClient: HRClient | undefined
  var __payrollClient: PayrollClient | undefined
}

// Auth Database Client (using default @prisma/client with AUTH_DATABASE_URL)
export const auth = globalThis.__authClient ?? createAuthClient()
if (process.env.NODE_ENV !== 'production') {
  globalThis.__authClient = auth
}

// HR Database Client
export const hrClient = globalThis.__hrClient ?? createHRClient()
if (process.env.NODE_ENV !== 'production') {
  globalThis.__hrClient = hrClient
}

// Payroll Database Client
export const payrollClient = globalThis.__payrollClient ?? createPayrollClient()
if (process.env.NODE_ENV !== 'production') {
  globalThis.__payrollClient = payrollClient
}

// Helper functions for database operations
export const DatabaseClients = {
  auth,
  hr: hrClient,
  payroll: payrollClient,
  
  // Helper to get user with company information
  async getUserWithCompany(userId: string) {
    try {
      return await auth.user.findUnique({
        where: { id: userId },
        include: {
          Company: true,
          UserCompany: {
            include: {
              Company: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Error fetching user with company:', error)
      throw error
    }
  },

  // Helper to get company subscription
  async getCompanySubscription(companyId: string) {
    try {
      return await auth.subscription.findUnique({
        where: { companyId },
        include: {
          Plan: true,
          Company: true
        }
      })
    } catch (error) {
      console.error('Error fetching company subscription:', error)
      throw error
    }
  },

  // Helper to get employee with details
  async getEmployeeWithDetails(employeeId: string, companyId: string) {
    try {
      const employee = await hrClient.employee.findFirst({
        where: { 
          id: employeeId,
          companyId: companyId
        }
      })
      
      if (!employee) return null

      return employee
    } catch (error) {
      console.error('Error fetching employee details:', error)
      throw error
    }
  },

  // Helper to create employee
  async createEmployeeWithReferences(employeeData: any, companyId: string, createdBy: string) {
    try {
      // Create employee in HR database
      const employee = await hrClient.employee.create({
        data: {
          ...employeeData,
          companyId,
          createdBy
        }
      })

      return employee
    } catch (error) {
      console.error('Error creating employee:', error)
      throw error
    }
  },

  // Helper to validate company access
  async validateCompanyAccess(userId: string, companyId: string) {
    try {
      const userCompany = await auth.userCompany.findFirst({
        where: {
          userId,
          companyId,
          isActive: true
        }
      })

      return userCompany !== null
    } catch (error) {
      console.error('Error validating company access:', error)
      throw error
    }
  },

  // Helper to get company employees count for subscription limits
  async getCompanyEmployeeCount(companyId: string) {
    try {
      return await hrClient.employee.count({
        where: {
          companyId,
          isActive: true
        }
      })
    } catch (error) {
      console.error('Error getting company employee count:', error)
      throw error
    }
  }
}

// Export individual clients for direct use
export { auth as authClient }

// Health check function to verify database connections
export async function checkDatabaseConnections() {
  const results = {
    auth: false,
    hr: false,
    payroll: false,
    errors: [] as string[]
  }

  try {
    await auth.$queryRaw`SELECT 1`
    results.auth = true
  } catch (error) {
    results.errors.push(`Auth DB: ${error}`)
  }

  try {
    await hrClient.$queryRaw`SELECT 1`
    results.hr = true
  } catch (error) {
    results.errors.push(`HR DB: ${error}`)
  }

  try {
    await payrollClient.$queryRaw`SELECT 1`
    results.payroll = true
  } catch (error) {
    results.errors.push(`Payroll DB: ${error}`)
  }

  return results
}

