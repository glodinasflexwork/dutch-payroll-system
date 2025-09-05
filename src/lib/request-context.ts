/**
 * Request Context Management System
 * Centralizes data fetching and provides consistent context across endpoints
 */

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { resolveCompanyFromSession, handleCompanyResolutionError } from "@/lib/universal-company-resolver"
import { hrClient, payrollClient } from "@/lib/database-clients"
import { withRetry } from "@/lib/database-retry"
import { createPayrollContext, type PayrollContext, type CompanyContext, type EmployeeContext } from "@/lib/payroll-config"
import { cache, CacheManager } from "@/lib/cache-manager"

export interface RequestContextOptions {
  includeEmployee?: boolean
  includePayrollSettings?: boolean
  employeeId?: string
}

export interface RequestContext {
  session: any
  company: CompanyContext
  companyId: string
  employee?: EmployeeContext
  employeeId?: string
}

export interface PayrollRequestContext extends RequestContext {
  payrollContext: PayrollContext
  period: { year: number; month: number }
}

/**
 * Get base request context with company resolution
 */
export async function getRequestContext(
  session: any,
  options: RequestContextOptions = {}
): Promise<RequestContext> {
  // Use Universal Company Resolution Service
  const resolution = await resolveCompanyFromSession(session)

  if (!resolution.success) {
    throw new Error(`Company resolution failed: ${resolution.error}`)
  }

  const company = resolution.company!
  const companyId = company.id

  const context: RequestContext = {
    session,
    company,
    companyId
  }

  // Optionally include employee data
  if (options.includeEmployee && options.employeeId) {
    const employee = await getEmployeeWithRetry(companyId, options.employeeId)
    if (employee) {
      context.employee = employee
      context.employeeId = employee.id
    }
  }

  return context
}

/**
 * Get payroll-specific request context
 */
export async function getPayrollRequestContext(
  session: any,
  employeeId: string,
  year: number,
  month: number
): Promise<PayrollRequestContext> {
  const baseContext = await getRequestContext(session, {
    includeEmployee: true,
    employeeId
  })

  if (!baseContext.employee) {
    throw new Error('Employee not found')
  }

  const period = { year, month }
  const payrollContext = createPayrollContext(
    baseContext.company,
    baseContext.employee,
    period
  )

  return {
    ...baseContext,
    payrollContext,
    period
  }
}

/**
 * Get employee with retry logic and multiple lookup strategies
 */
async function getEmployeeWithRetry(companyId: string, employeeId: string): Promise<EmployeeContext | null> {
  const cacheKey = CacheManager.employeeKey(companyId, employeeId)
  
  return await cache.getOrSet(cacheKey, async () => {
    return await withRetry(async () => {
      console.log('🔍 Looking up employee in HR database')
      console.log('🔍 Searching for employeeId:', employeeId)
      
      // First try by ID (direct match)
      let employee = await getHRClient().employee.findFirst({
        where: {
          id: employeeId,
          companyId: companyId,
          isActive: true
        }
      })
      
      // If not found by ID, try by employeeNumber (fallback for payroll records)
      if (!employee) {
        console.log('🔍 Employee not found by ID, trying by employeeNumber')
        employee = await getHRClient().employee.findFirst({
          where: {
            employeeNumber: employeeId,
            companyId: companyId,
            isActive: true
          }
        })
      }

      // If still not found, try partial matches
      if (!employee) {
        console.log('🔍 Employee not found by employeeNumber, trying partial matches')
        const employees = await getHRClient().employee.findMany({
          where: {
            companyId: companyId,
            isActive: true,
            OR: [
              { id: { contains: employeeId } },
              { employeeNumber: { contains: employeeId } }
            ]
          },
          take: 1
        })
        
        if (employees.length > 0) {
          employee = employees[0]
          console.log('✅ Found employee via partial match:', employee.firstName, employee.lastName)
        }
      }

      if (!employee) {
        // Log available employees for debugging
        const availableEmployees = await getHRClient().employee.findMany({
          where: {
            companyId: companyId,
            isActive: true
          },
          take: 5
        })
        console.log('📋 Available employees in HR database:', availableEmployees.map(e => ({
          id: e.id,
          employeeNumber: e.employeeNumber,
          name: `${e.firstName} ${e.lastName}`
        })))
        
        return null
      }

      console.log('✅ Employee found:', employee.firstName, employee.lastName)
      return employee
    }, { maxRetries: 2, baseDelay: 500 })
  }, { ttl: 300000 }) // Cache for 5 minutes
}

/**
 * Handle request context errors consistently
 */
export function handleRequestContextError(error: any) {
  if (error.message.includes('Company resolution failed')) {
    return {
      error: "Company access denied",
      statusCode: 403
    }
  }

  if (error.message.includes('Employee not found')) {
    return {
      error: "Employee not found",
      statusCode: 404
    }
  }

  console.error('Request context error:', error)
  return {
    error: "Internal server error",
    statusCode: 500
  }
}

/**
 * Validate session and return user context
 */
export async function validateSession() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized: No valid session')
  }

  return session
}

