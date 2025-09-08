import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getHRClient, getPayrollClient } from "@/lib/database-clients"
import { validateSubscription } from "@/lib/subscription"

// Cache for dashboard stats (5 minutes)
const statsCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    console.log("=== DASHBOARD STATS API START ===")
    
    const session = await getServerSession(authOptions)
    console.log("Session user ID:", session?.user?.id)
    console.log("Session company ID:", session?.user?.companyId)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({
        success: false,
        error: "No company selected"
      }, { status: 400 })
    }

    const companyId = session.user.companyId

    // Check cache first
    const cacheKey = `stats-${companyId}`
    const cached = statsCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("Dashboard stats - Returning cached data")
      return NextResponse.json({
        success: true,
        ...cached.data,
        cached: true
      })
    }

    // Validate subscription (with error handling)
    try {
      const subscriptionValidation = await validateSubscription(companyId)
      console.log("Subscription validation:", subscriptionValidation)
      if (!subscriptionValidation.isValid) {
        return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
      }
    } catch (subError) {
      console.log("Subscription validation error (continuing):", subError)
      // Continue without subscription validation for now
    }

    // Optimized queries to get all dashboard stats
    const hrClient = await getHRClient()
    const payrollClient = await getPayrollClient()
    
    const [employeeStats, payrollCount, companyInfo] = await Promise.all([
      // Get employee statistics using raw SQL
      hrClient.$queryRaw`
        SELECT "employmentType", COUNT(id) as count
        FROM "Employee" 
        WHERE "companyId" = ${companyId} AND "isActive" = true
        GROUP BY "employmentType"
      `,
      
      // Get payroll record count from payroll database
      payrollClient.payrollRecord.count({
        where: { companyId: companyId }
      }),
      
      // Get company information using raw SQL
      hrClient.$queryRaw`
        SELECT name, id FROM "Company" WHERE id = ${companyId}
      `
    ])

    // Process employee statistics
    let totalEmployees = 0
    let monthlyEmployees = 0
    let hourlyEmployees = 0

    employeeStats.forEach((stat: any) => {
      const count = parseInt(stat.count)
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
      companyName: companyInfo[0]?.name || "Your Company",
      companyId: companyId
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({
        success: false,
        error: "No company selected"
      }, { status: 400 })
    }

    const cacheKey = `stats-${session.user.companyId}`
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

