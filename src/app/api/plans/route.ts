import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatAmount } from "@/lib/stripe"

// GET /api/plans - Get all available subscription plans
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all active plans
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    })

    // Get current subscription if user has a company
    let currentSubscription = null
    if (session.user.companyId) {
      currentSubscription = await prisma.subscription.findUnique({
        where: { companyId: session.user.companyId },
        include: { plan: true }
      })
    }

    // Format plans for frontend
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      formattedPrice: formatAmount(plan.price, plan.currency),
      currency: plan.currency,
      maxEmployees: plan.maxEmployees,
      maxPayrolls: plan.maxPayrolls,
      features: plan.features,
      isCurrentPlan: currentSubscription?.planId === plan.id,
      stripePriceId: plan.stripePriceId,
      popular: plan.name === 'Professional' // Mark Professional as popular
    }))

    return NextResponse.json({
      success: true,
      plans: formattedPlans,
      currentSubscription: currentSubscription ? {
        id: currentSubscription.id,
        status: currentSubscription.status,
        currentPeriodEnd: currentSubscription.currentPeriodEnd,
        cancelAtPeriodEnd: currentSubscription.cancelAtPeriodEnd,
        plan: {
          id: currentSubscription.plan.id,
          name: currentSubscription.plan.name
        }
      } : null
    })

  } catch (error) {
    console.error("Error fetching plans:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

