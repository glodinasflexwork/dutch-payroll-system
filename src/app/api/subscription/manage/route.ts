import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { z } from "zod"

const updateSubscriptionSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  prorate: z.boolean().default(true)
})

const cancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().default(true),
  reason: z.string().optional()
})

// PUT /api/subscription/manage - Update subscription plan
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateSubscriptionSchema.parse(body)

    // Get current subscription
    const currentSubscription = await prisma.subscription.findUnique({
      where: { companyId: session.user.companyId },
      include: { plan: true }
    })

    if (!currentSubscription || !currentSubscription.stripeSubscriptionId) {
      return NextResponse.json({ 
        error: "No active subscription found" 
      }, { status: 404 })
    }

    // Get new plan details
    const newPlan = await prisma.plan.findUnique({
      where: { id: validatedData.planId }
    })

    if (!newPlan || !newPlan.stripePriceId) {
      return NextResponse.json({ 
        error: "Invalid plan or plan not configured with Stripe" 
      }, { status: 400 })
    }

    if (newPlan.id === currentSubscription.planId) {
      return NextResponse.json({ 
        error: "Already subscribed to this plan" 
      }, { status: 400 })
    }

    // Update subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      currentSubscription.stripeSubscriptionId
    )

    const updatedSubscription = await stripe.subscriptions.update(
      currentSubscription.stripeSubscriptionId,
      {
        items: [{
          id: stripeSubscription.items.data[0].id,
          price: newPlan.stripePriceId
        }],
        proration_behavior: validatedData.prorate ? 'create_prorations' : 'none',
        metadata: {
          ...stripeSubscription.metadata,
          planId: newPlan.id,
          planName: newPlan.name,
          updatedAt: new Date().toISOString()
        }
      }
    )

    // Update subscription in database
    const subscription = await prisma.subscription.update({
      where: { companyId: session.user.companyId },
      data: {
        planId: newPlan.id,
        status: updatedSubscription.status,
        currentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000)
      },
      include: {
        plan: true
      }
    })

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan,
        currentPeriodEnd: subscription.currentPeriodEnd
      },
      message: `Successfully upgraded to ${newPlan.name} plan`
    })

  } catch (error) {
    console.error("Error updating subscription:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/subscription/manage - Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = cancelSubscriptionSchema.parse(body)

    // Get current subscription
    const currentSubscription = await prisma.subscription.findUnique({
      where: { companyId: session.user.companyId },
      include: { plan: true }
    })

    if (!currentSubscription || !currentSubscription.stripeSubscriptionId) {
      return NextResponse.json({ 
        error: "No active subscription found" 
      }, { status: 404 })
    }

    // Cancel subscription in Stripe
    let stripeSubscription
    if (validatedData.cancelAtPeriodEnd) {
      // Cancel at period end
      stripeSubscription = await stripe.subscriptions.update(
        currentSubscription.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
          metadata: {
            cancelReason: validatedData.reason || 'User requested cancellation',
            canceledAt: new Date().toISOString()
          }
        }
      )
    } else {
      // Cancel immediately
      stripeSubscription = await stripe.subscriptions.cancel(
        currentSubscription.stripeSubscriptionId,
        {
          metadata: {
            cancelReason: validatedData.reason || 'User requested immediate cancellation',
            canceledAt: new Date().toISOString()
          }
        }
      )
    }

    // Update subscription in database
    const subscription = await prisma.subscription.update({
      where: { companyId: session.user.companyId },
      data: {
        status: stripeSubscription.status,
        cancelAtPeriodEnd: validatedData.cancelAtPeriodEnd,
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
      },
      include: {
        plan: true
      }
    })

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      },
      message: validatedData.cancelAtPeriodEnd 
        ? "Subscription will be canceled at the end of the current period"
        : "Subscription canceled immediately"
    })

  } catch (error) {
    console.error("Error canceling subscription:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

