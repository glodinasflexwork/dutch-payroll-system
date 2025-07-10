import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { authClient } from "@/lib/database-clients"

// GET /api/subscription/status - Get subscription status and usage
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const company = await authClient.company.findUnique({
      where: { id: session.user.companyId },
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      }
    })

    if (!company?.subscription) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 })
    }

    // Get current usage
    const employeeCount = await authClient.employee.count({
      where: { 
        companyId: session.user.companyId,
        isActive: true 
      }
    })

    // Get current month payroll count
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)
    
    const payrollCount = await authClient.payrollRecord.count({
      where: {
        companyId: session.user.companyId,
        createdAt: {
          gte: currentMonth
        }
      }
    })

    const subscription = company.subscription

    return NextResponse.json({
      plan: {
        name: subscription.plan.name,
        maxEmployees: subscription.plan.maxEmployees,
        maxPayrolls: subscription.plan.maxPayrolls,
        features: subscription.plan.features
      },
      usage: {
        employees: employeeCount,
        payrolls: payrollCount
      },
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString()
    })
  } catch (error) {
    console.error("Error fetching subscription status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

