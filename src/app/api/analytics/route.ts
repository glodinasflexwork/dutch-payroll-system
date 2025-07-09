import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateSubscription } from "@/lib/subscription"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate subscription
    const subscriptionValidation = await validateSubscription(session.user.companyId)
    if (!subscriptionValidation.isValid) {
      return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get('months') || '6') // Default to last 6 months

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    // Fetch payroll records for the company within date range
    const payrollRecords = await prisma.payrollRecord.findMany({
      where: {
        companyId: session.user.companyId,
        payPeriodStart: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        Employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true,
            salaryType: true
          }
        }
      },
      orderBy: {
        payPeriodStart: 'asc'
      }
    })

    // Fetch active employees count
    const activeEmployees = await prisma.employee.count({
      where: {
        companyId: session.user.companyId,
        isActive: true
      }
    })

    // Calculate KPI data
    const currentMonth = new Date()
    const currentMonthRecords = payrollRecords.filter(record => {
      const recordDate = new Date(record.payPeriodStart)
      return recordDate.getMonth() === currentMonth.getMonth() && 
             recordDate.getFullYear() === currentMonth.getFullYear()
    })

    const previousMonth = new Date()
    previousMonth.setMonth(previousMonth.getMonth() - 1)
    const previousMonthRecords = payrollRecords.filter(record => {
      const recordDate = new Date(record.payPeriodStart)
      return recordDate.getMonth() === previousMonth.getMonth() && 
             recordDate.getFullYear() === previousMonth.getFullYear()
    })

    // Calculate totals for current month
    const currentMonthTotals = currentMonthRecords.reduce((acc, record) => {
      acc.totalPayroll += record.grossPay || 0
      acc.totalTaxes += record.totalDeductions || 0
      acc.totalNet += record.netPay || 0
      return acc
    }, { totalPayroll: 0, totalTaxes: 0, totalNet: 0 })

    // Calculate totals for previous month
    const previousMonthTotals = previousMonthRecords.reduce((acc, record) => {
      acc.totalPayroll += record.grossPay || 0
      acc.totalTaxes += record.totalDeductions || 0
      acc.totalNet += record.netPay || 0
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
      const date = new Date(record.payPeriodStart)
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
      monthData.totalPayroll += record.grossPay || 0
      monthData.employees += 1
      monthData.aow += record.aowContribution || 0
      monthData.wlz += record.wlzContribution || 0
      monthData.zvw += (record.grossPay || 0) * 0.0565 // Calculate ZVW
    })

    // Calculate average salary for each month
    monthlyData.forEach(data => {
      data.averageSalary = data.employees > 0 ? data.totalPayroll / data.employees : 0
    })

    // Employee distribution by department
    const departmentData = new Map<string, { employees: number, totalSalary: number }>()
    
    currentMonthRecords.forEach(record => {
      const dept = record.Employee.department || 'Other'
      if (!departmentData.has(dept)) {
        departmentData.set(dept, { employees: 0, totalSalary: 0 })
      }
      const deptData = departmentData.get(dept)!
      deptData.employees += 1
      deptData.totalSalary += record.grossPay || 0
    })

    // Employee distribution by salary type
    const salaryTypeData = new Map<string, number>()
    const allEmployees = await prisma.employee.findMany({
      where: {
        companyId: session.user.companyId,
        isActive: true
      },
      select: {
        salaryType: true
      }
    })

    allEmployees.forEach(emp => {
      const type = emp.salaryType === 'hourly' ? 'Hourly' : 'Monthly'
      salaryTypeData.set(type, (salaryTypeData.get(type) || 0) + 1)
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
      employmentTypeDistribution: Array.from(salaryTypeData.entries()).map(([name, value]) => ({
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

    return NextResponse.json({
      success: true,
      data: analyticsData
    })

  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch analytics data"
    }, { status: 500 })
  }
}

