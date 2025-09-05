import { NextRequest, NextResponse } from "next/server"
import { validateAuth } from "@/lib/auth-utils"
import { getHRClient, getPayrollClient } from "@/lib/database-clients"
import { validateSubscription } from "@/lib/subscription"

// Cache for dashboard stats (5 minutes)
const statsCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { context, error, status } = await validateAuth(request, ['employee'])
    
    if (!context || error) {
      return NextResponse.json({ error }, { status })
    }

    // Check cache first
    const cacheKey = `stats-${context.companyId}`
    const cached = statsCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        ...cached.data,
        cached: true
      })
    }

    // Validate subscription
    const subscriptionValidation = await validateSubscription(context.companyId)
    if (!subscriptionValidation.isValid) {
      return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
    }

    // Optimized single query to get all dashboard stats
    const [employeeStats, payrollCount, companyInfo] = await Promise.all([
      // Get employee statistics in one query
      getHRClient().employee.groupBy({
        by: ['employmentType'],
        where: {
          companyId: context.companyId,
          isActive: true
        },
        _count: {
          id: true
        }
      }),
      
      // Get payroll record count from payroll database
      getPayrollClient().payrollRecord.count({
        where: { companyId: context.companyId }
      }),
      
      // Get company information
      getHRClient().company.findUnique({
        where: { id: context.companyId },
        select: { name: true, id: true }
      })
    ])

    // Process employee statistics
    let totalEmployees = 0
    let monthlyEmployees = 0
    let hourlyEmployees = 0

    employeeStats.forEach(stat => {
      const count = stat._count.id
      totalEmployees += count
      
      if (stat.employmentType === 'monthly') {
        monthlyEmployees = count
      } else if (stat.employmentType === 'hourly') {
        hourlyEmployees = count
      }
    })

    // Get payroll count (now a direct number from count query)
    const payrollRecords = payrollCount || 0

    const dashboardStats = {
      totalEmployees,
      monthlyEmployees,
      hourlyEmployees,
      totalPayrollRecords: payrollRecords,
      companyName: companyInfo?.name || "Your Company",
      companyId: context.companyId
    }

    // Cache the results
    statsCache.set(cacheKey, {
      data: dashboardStats,
      timestamp: Date.now()
    })

    return NextResponse.json({
      success: true,
      ...dashboardStats,
      cached: false
    })

  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Clear cache when data changes
export async function DELETE(request: NextRequest) {
  try {
    const { context, error, status } = await validateAuth(request, ['admin'])
    
    if (!context || error) {
      return NextResponse.json({ error }, { status })
    }

    const cacheKey = `stats-${context.companyId}`
    statsCache.delete(cacheKey)

    return NextResponse.json({ success: true, message: "Cache cleared" })
  } catch (error) {
    console.error("Error clearing cache:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

