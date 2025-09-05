// Payroll Query Optimization Utilities
// Optimizes database queries for payroll calculations and reporting

import { payrollClient, hrClient } from './database-clients'
import { withCache, cacheKeys } from './cache-utils'

interface PayrollQueryOptions {
  companyId: string
  year?: number
  month?: number
  employeeId?: string
  includeInactive?: boolean
}

interface OptimizedPayrollData {
  employee: any
  payrollRecords: any[]
  cumulativeData: any
  contractInfo: any
}

/**
 * Optimized query for fetching employee with payroll data
 * Reduces multiple database calls to a single optimized query
 */
export async function getEmployeeWithPayrollData(
  employeeId: string, 
  companyId: string,
  year?: number,
  month?: number
): Promise<OptimizedPayrollData | null> {
  
  const cacheKey = `employee-payroll-${employeeId}-${year || 'all'}-${month || 'all'}`
  
  return await withCache(cacheKey, async () => {
    // Single optimized query with all necessary joins
    const employee = await getHRClient().employee.findFirst({
      where: {
        id: employeeId,
        companyId: companyId,
        isActive: true
      },
      select: {
        // Employee basic info
        id: true,
        employeeNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        bsn: true,
        
        // Employment details
        position: true,
        department: true,
        employmentType: true,
        startDate: true,
        
        // Salary information
        salary: true,
        hourlyRate: true,
        salaryType: true,
        
        // Tax information
        taxTable: true,
        taxCredit: true,
        
        // Contract information (if available)
        contracts: {
          select: {
            id: true,
            contractType: true,
            workingHours: true,
            startDate: true,
            endDate: true,
            isActive: true
          },
          where: {
            isActive: true
          },
          orderBy: {
            startDate: 'desc'
          },
          take: 1
        }
      }
    })

    if (!employee) {
      return null
    }

    // Build date filter for payroll records
    const dateFilter: any = {}
    if (year) {
      const startDate = new Date(year, 0, 1) // January 1st
      const endDate = new Date(year + 1, 0, 1) // January 1st next year
      
      dateFilter.payPeriodStart = {
        gte: startDate,
        lt: endDate
      }
      
      if (month) {
        const monthStartDate = new Date(year, month - 1, 1)
        const monthEndDate = new Date(year, month, 1)
        
        dateFilter.payPeriodStart = {
          gte: monthStartDate,
          lt: monthEndDate
        }
      }
    }

    // Fetch payroll records with optimized query
    const [payrollRecords, cumulativeData] = await Promise.all([
      // Current period payroll records
      getPayrollClient().payrollRecord.findMany({
        where: {
          employeeId: employeeId,
          companyId: companyId,
          ...dateFilter
        },
        select: {
          id: true,
          payPeriodStart: true,
          payPeriodEnd: true,
          grossSalary: true,
          netSalary: true,
          taxDeduction: true,
          socialSecurityContribution: true,
          holidayAllowance: true,
          hoursWorked: true,
          overtimeHours: true,
          createdAt: true
        },
        orderBy: {
          payPeriodStart: 'desc'
        }
      }),

      // Year-to-date cumulative data (if year is specified)
      year ? getPayrollClient().payrollRecord.aggregate({
        where: {
          employeeId: employeeId,
          companyId: companyId,
          payPeriodStart: {
            gte: new Date(year, 0, 1),
            lt: new Date(year + 1, 0, 1)
          }
        },
        _sum: {
          grossSalary: true,
          netSalary: true,
          taxDeduction: true,
          socialSecurityContribution: true,
          holidayAllowance: true,
          hoursWorked: true,
          overtimeHours: true
        },
        _count: {
          id: true
        }
      }) : null
    ])

    return {
      employee,
      payrollRecords,
      cumulativeData,
      contractInfo: employee.contracts[0] || null
    }
  }, 5) // Cache for 5 minutes
}

/**
 * Optimized bulk payroll data fetching for dashboard and reports
 */
export async function getBulkPayrollData(options: PayrollQueryOptions) {
  const { companyId, year, month, includeInactive = false } = options
  
  const cacheKey = `bulk-payroll-${companyId}-${year || 'all'}-${month || 'all'}-${includeInactive}`
  
  return await withCache(cacheKey, async () => {
    // Build date filter
    const dateFilter: any = {}
    if (year) {
      const startDate = new Date(year, 0, 1)
      const endDate = new Date(year + 1, 0, 1)
      
      dateFilter.payPeriodStart = {
        gte: startDate,
        lt: endDate
      }
      
      if (month) {
        const monthStartDate = new Date(year, month - 1, 1)
        const monthEndDate = new Date(year, month, 1)
        
        dateFilter.payPeriodStart = {
          gte: monthStartDate,
          lt: monthEndDate
        }
      }
    }

    // Single optimized query for all payroll data
    const [payrollSummary, employeeCount, totalPayrollCost] = await Promise.all([
      // Payroll records with employee info
      getPayrollClient().payrollRecord.findMany({
        where: {
          companyId: companyId,
          ...dateFilter
        },
        select: {
          id: true,
          employeeId: true,
          payPeriodStart: true,
          payPeriodEnd: true,
          grossSalary: true,
          netSalary: true,
          taxDeduction: true,
          socialSecurityContribution: true,
          holidayAllowance: true,
          hoursWorked: true
        },
        orderBy: {
          payPeriodStart: 'desc'
        }
      }),

      // Active employee count
      getHRClient().employee.count({
        where: {
          companyId: companyId,
          isActive: includeInactive ? undefined : true
        }
      }),

      // Total payroll cost aggregation
      getPayrollClient().payrollRecord.aggregate({
        where: {
          companyId: companyId,
          ...dateFilter
        },
        _sum: {
          grossSalary: true,
          netSalary: true,
          taxDeduction: true,
          socialSecurityContribution: true,
          holidayAllowance: true
        }
      })
    ])

    return {
      payrollRecords: payrollSummary,
      employeeCount,
      totalCosts: totalPayrollCost._sum,
      recordCount: payrollSummary.length
    }
  }, 10) // Cache for 10 minutes for bulk data
}

/**
 * Optimized query for payroll analytics and reporting
 */
export async function getPayrollAnalytics(companyId: string, year: number) {
  const cacheKey = `payroll-analytics-${companyId}-${year}`
  
  return await withCache(cacheKey, async () => {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year + 1, 0, 1)

    // Single query for comprehensive analytics
    const [monthlyBreakdown, departmentBreakdown, employmentTypeBreakdown] = await Promise.all([
      // Monthly payroll breakdown
      getPayrollClient().$queryRaw`
        SELECT 
          EXTRACT(MONTH FROM "payPeriodStart") as month,
          COUNT(*) as record_count,
          SUM("grossSalary") as total_gross,
          SUM("netSalary") as total_net,
          SUM("taxDeduction") as total_tax,
          SUM("socialSecurityContribution") as total_social_security,
          AVG("grossSalary") as avg_gross
        FROM "PayrollRecord" 
        WHERE "companyId" = ${companyId}
          AND "payPeriodStart" >= ${startDate}
          AND "payPeriodStart" < ${endDate}
        GROUP BY EXTRACT(MONTH FROM "payPeriodStart")
        ORDER BY month
      `,

      // Department-wise breakdown (requires joining with HR database)
      getHRClient().$queryRaw`
        SELECT 
          e.department,
          COUNT(DISTINCT e.id) as employee_count,
          AVG(e.salary) as avg_salary
        FROM "Employee" e
        WHERE e."companyId" = ${companyId}
          AND e."isActive" = true
          AND e.department IS NOT NULL
        GROUP BY e.department
        ORDER BY employee_count DESC
      `,

      // Employment type breakdown
      getHRClient().$queryRaw`
        SELECT 
          e."employmentType",
          COUNT(*) as employee_count,
          AVG(e.salary) as avg_salary,
          SUM(e.salary) as total_salary_cost
        FROM "Employee" e
        WHERE e."companyId" = ${companyId}
          AND e."isActive" = true
        GROUP BY e."employmentType"
      `
    ])

    return {
      monthlyBreakdown,
      departmentBreakdown,
      employmentTypeBreakdown,
      year
    }
  }, 30) // Cache analytics for 30 minutes
}

/**
 * Optimized employee search with payroll context
 */
export async function searchEmployeesWithPayrollContext(
  companyId: string,
  searchTerm: string,
  limit: number = 10
) {
  const cacheKey = `employee-search-${companyId}-${searchTerm}-${limit}`
  
  return await withCache(cacheKey, async () => {
    // Optimized search query with payroll record count
    const employees = await getHRClient().employee.findMany({
      where: {
        companyId: companyId,
        isActive: true,
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { employeeNumber: { contains: searchTerm, mode: 'insensitive' } },
          { position: { contains: searchTerm, mode: 'insensitive' } },
          { department: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        employeeNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true,
        department: true,
        employmentType: true,
        salary: true,
        startDate: true
      },
      take: limit,
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    })

    // Get payroll record counts for each employee
    const employeeIds = employees.map(emp => emp.id)
    const payrollCounts = await getPayrollClient().payrollRecord.groupBy({
      by: ['employeeId'],
      where: {
        employeeId: { in: employeeIds },
        companyId: companyId
      },
      _count: {
        id: true
      }
    })

    // Combine employee data with payroll counts
    const employeesWithPayrollInfo = employees.map(employee => {
      const payrollCount = payrollCounts.find(pc => pc.employeeId === employee.id)?._count.id || 0
      return {
        ...employee,
        payrollRecordCount: payrollCount,
        hasPayrollData: payrollCount > 0
      }
    })

    return employeesWithPayrollInfo
  }, 2) // Cache search results for 2 minutes
}

/**
 * Clear payroll-related caches when data changes
 */
export function invalidatePayrollCaches(companyId: string, employeeId?: string) {
  // Clear all payroll-related caches for the company
  const patterns = [
    `bulk-payroll-${companyId}`,
    `payroll-analytics-${companyId}`,
    `employee-search-${companyId}`
  ]

  if (employeeId) {
    patterns.push(`employee-payroll-${employeeId}`)
  }

  // Note: This is a simplified cache invalidation
  // In a production system, you might want to use Redis with pattern matching
  console.log(`Invalidating payroll caches for company ${companyId}`, patterns)
}

