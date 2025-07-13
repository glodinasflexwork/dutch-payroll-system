import { PrismaClient as AuthClient } from '@prisma/client'
import { PrismaClient as HRClient } from '@prisma/hr-client'
import { PrismaClient as PayrollClient } from '@prisma/payroll-client'

// Configure auth client with AUTH_DATABASE_URL
const authClient = new AuthClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL
    }
  }
})

// Global variable to store database clients
declare global {
  var __authClient: AuthClient | undefined
  var __hrClient: HRClient | undefined
  var __payrollClient: PayrollClient | undefined
}

// Auth Database Client (using default @prisma/client with AUTH_DATABASE_URL)
export const auth = globalThis.__authClient ?? authClient
if (process.env.NODE_ENV !== 'production') {
  globalThis.__authClient = auth
}

// HR Database Client
export const hrClient = globalThis.__hrClient ?? new HRClient()
if (process.env.NODE_ENV !== 'production') {
  globalThis.__hrClient = hrClient
}

// Payroll Database Client
export const payrollClient = globalThis.__payrollClient ?? new PayrollClient()
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
  },

  // Helper to get company subscription
  async getCompanySubscription(companyId: string) {
    return await auth.subscription.findUnique({
      where: { companyId },
      include: {
        Plan: true,
        Company: true
      }
    })
  },

  // Helper to get employee with cross-database reference
  async getEmployeeWithDetails(employeeId: string, companyId: string) {
    const employee = await hrClient.employee.findFirst({
      where: { 
        id: employeeId,
        companyId: companyId
      }
    })
    
    if (!employee) return null

    // Get payroll records for this employee
    const payrollRecords = await payrollClient.payrollRecord.findMany({
      where: { 
        employeeId: employeeId,
        companyId: companyId
      },
      orderBy: { createdAt: 'desc' },
      take: 12 // Last 12 months
    })

    return {
      ...employee,
      payrollRecords
    }
  },

  // Helper to create employee across databases
  async createEmployeeWithReferences(employeeData: any, companyId: string, createdBy: string) {
    // Create employee in HR database
    const employee = await hrClient.employee.create({
      data: {
        ...employeeData,
        companyId,
        createdBy
      }
    })

    // Create initial payroll setup if needed
    // This could include setting up tax settings, etc.

    return employee
  },

  // Helper to validate company access
  async validateCompanyAccess(userId: string, companyId: string) {
    const userCompany = await auth.userCompany.findFirst({
      where: {
        userId,
        companyId,
        isActive: true
      }
    })

    return userCompany !== null
  },

  // Helper to get company employees count for subscription limits
  async getCompanyEmployeeCount(companyId: string) {
    return await hrClient.employee.count({
      where: {
        companyId,
        isActive: true
      }
    })
  },

  // Helper to get company payroll count for subscription limits
  async getCompanyPayrollCount(companyId: string) {
    return await payrollClient.payrollBatch.count({
      where: {
        companyId
      }
    })
  }
}

