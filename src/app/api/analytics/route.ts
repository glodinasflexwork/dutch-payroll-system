import { NextRequest, NextResponse } from "next/server"
import { validateAuth } from "@/lib/auth-utils"
import { getHRClient, getPayrollClient } from "@/lib/database-clients"
import { validateSubscription } from "@/lib/subscription"

export async function GET(request: NextRequest) {
  try {
    console.log("=== ANALYTICS API DEBUG ===")
    
    // Use the correct authentication system
    const authResult = await validateAuth(request, ['employee'])
    if (!authResult.context) {
      console.log("Analytics API - Authentication failed:", authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: authResult.status || 401 })
    }

    const { userId, companyId, userRole } = authResult.context
    console.log("Analytics API - User authenticated:", userId, "Company:", companyId, "Role:", userRole)

    // Validate subscription
    try {
      const subscriptionValidation = await validateSubscription(companyId)
      if (!subscriptionValidation.isValid) {
        console.log("Analytics API - Subscription validation failed:", subscriptionValidation.error)
        return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
      }
      console.log("Analytics API - Subscription valid")
    } catch (subError) {
      console.log("Analytics API - Subscription validation error:", subError)
      // Continue without subscription validation for now
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get('months') || '6') // Default to last 6 months

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    console.log("Analytics API - Fetching data for company:", companyId, "from", startDate, "to", endDate)

    // Fetch payroll records for the company within date range
    const payrollRecords = await getPayrollClient().payrollRecord.findMany({
      where: {
        companyId: companyId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log("Analytics API - Found payroll records:", payrollRecords.length)

    // Fetch active employees count
    const activeEmployees = await getHRClient().employee.count({
      where: {
        companyId: companyId,
        isActive: true
      }
    })

    console.log("Analytics API - Active employees:", activeEmployees)

    // Calculate KPI data
    const currentMonth = new Date()
    const currentMonthRecords = payrollRecords.filter(record => {
      const recordDate = new Date(record.createdAt)
      return recordDate.getMonth() === currentMonth.getMonth() && 
             recordDate.getFullYear() === currentMonth.getFullYear()
    })

    const previousMonth = new Date()
    previousMonth.setMonth(previousMonth.getMonth() - 1)
    const previousMonthRecords = payrollRecords.filter(record => {
      const recordDate = new Date(record.createdAt)
      return recordDate.getMonth() === previousMonth.getMonth() && 
             recordDate.getFullYear() === previousMonth.getFullYear()
    })

    // Calculate totals for current month
    const currentMonthTotals = currentMonthRecords.reduce((acc, record) => {
      acc.totalPayroll += record.grossSalary || 0
      acc.totalTaxes += record.taxDeduction || 0
      acc.totalNet += record.netSalary || 0
      return acc
    }, { totalPayroll: 0, totalTaxes: 0, totalNet: 0 })

    // Calculate totals for previous month
    const previousMonthTotals = previousMonthRecords.reduce((acc, record) => {
      acc.totalPayroll += record.grossSalary || 0
      acc.totalTaxes += record.taxDeduction || 0
      acc.totalNet += record.netSalary || 0
      return acc
    }, { totalPayroll: 0, totalTaxes: 0, totalNet: 0 })

    // Calculate growth percentages
    const payrollGrowth = previousMonthTotals.totalPayroll > 0 
      ? ((currentMonthTotals.totalPayroll - previousMonthTotals.totalPayroll) / previousMonthTotals.totalPayroll) * 100
      : 0

    const averageSalary = currentMonthRecords.length > 0 
      ? currentMonthTotals.totalPayroll / currentMonthRecords.length 
      : 0

    const taxEfficiency = currentMonthTotals.totalPayroll > 0 
      ? (currentMonthTotals.totalTaxes / currentMonthTotals.totalPayroll) * 100 
      : 0

    // Group payroll data by month for trends
    const monthlyData = new Map<string, {
      month: string,
      totalPayroll: number,
      employees: number,
      averageSalary: number,
      aow: number,
      anw: number,
      wlz: number,
      zvw: number
    }>()

    payrollRecords.forEach(record => {
      const date = new Date(record.createdAt)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' })
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthKey,
          totalPayroll: 0,
          employees: 0,
          averageSalary: 0,
          aow: 0,
          anw: 0,
          wlz: 0,
          zvw: 0
        })
      }
      
      const monthData = monthlyData.get(monthKey)!
      monthData.totalPayroll += record.grossSalary || 0
      monthData.employees += 1
      monthData.aow += record.socialSecurity || 0
      monthData.wlz += record.socialSecurity || 0
      monthData.zvw += (record.grossSalary || 0) * 0.0565 // Calculate ZVW
    })

    // Calculate average salary for each month
    monthlyData.forEach(data => {
      data.averageSalary = data.employees > 0 ? data.totalPayroll / data.employees : 0
    })

    // Employee distribution by department - get department info from HR database
    const departmentData = new Map<string, { employees: number, totalSalary: number }>()
    
    // Get employee details from HR database for department information
    const employeeIds = Array.from(new Set(currentMonthRecords.map(record => record.employeeId)))
    const employees = await getHRClient().employee.findMany({
      where: {
        id: { in: employeeIds },
        companyId: companyId
      },
      select: {
        id: true,
        department: true
      }
    })
    
    const employeeDepartmentMap = new Map<string, string>(employees.map(emp => [emp.id, emp.department || 'Other']))
    
    currentMonthRecords.forEach(record => {
      const dept = employeeDepartmentMap.get(record.employeeId) || 'Other'
      if (!departmentData.has(dept)) {
        departmentData.set(dept, { employees: 0, totalSalary: 0 })
      }
      const deptData = departmentData.get(dept)!
      deptData.employees += 1
      deptData.totalSalary += record.grossSalary || 0
    })

    // Employee distribution by employment type
    const employmentTypeData = new Map<string, number>()
    const allEmployees = await getHRClient().employee.findMany({
      where: {
        companyId: companyId,
        isActive: true
      },
      select: {
        employmentType: true
      }
    })

    allEmployees.forEach(emp => {
      const type = emp.employmentType === 'hourly' ? 'Hourly' : 'Monthly'
      employmentTypeData.set(type, (employmentTypeData.get(type) || 0) + 1)
    })

    // Prepare response data
    const analyticsData = {
      kpis: {
        totalPayroll: currentMonthTotals.totalPayroll,
        totalEmployees: activeEmployees,
        averageSalary: averageSalary,
        totalTaxes: currentMonthTotals.totalTaxes,
        payrollGrowth: payrollGrowth,
        employeeGrowth: 0, // Could be calculated if we track historical employee counts
        taxEfficiency: taxEfficiency
      },
      trends: Array.from(monthlyData.values()),
      departmentDistribution: Array.from(departmentData.entries()).map(([department, data]) => ({
        department,
        employees: data.employees,
        avgSalary: data.employees > 0 ? data.totalSalary / data.employees : 0
      })),
      employmentTypeDistribution: Array.from(employmentTypeData.entries()).map(([name, value]) => ({
        name,
        value,
        color: name === 'Monthly' ? '#3b82f6' : '#10b981'
      })),
      taxBreakdown: {
        monthly: Array.from(monthlyData.values()),
        current: {
          aow: Array.from(monthlyData.values()).reduce((sum, data) => sum + data.aow, 0),
          anw: Array.from(monthlyData.values()).reduce((sum, data) => sum + data.anw, 0),
          wlz: Array.from(monthlyData.values()).reduce((sum, data) => sum + data.wlz, 0),
          zvw: Array.from(monthlyData.values()).reduce((sum, data) => sum + data.zvw, 0)
        }
      }
    }

    console.log("Analytics API - Returning data successfully")
    return NextResponse.json({
      success: true,
      data: analyticsData
    })

  } catch (error) {
    console.error("Analytics API - Error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch analytics data",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

