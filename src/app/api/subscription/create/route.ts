import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe, createStripeCustomer, createStripeSubscription } from "@/lib/stripe"
import { z } from "zod"

const createSubscriptionSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  paymentMethodId: z.string().optional(),
  trialDays: z.number().min(0).max(30).optional()
})

// POST /api/subscription/create - Create a new subscription
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createSubscriptionSchema.parse(body)

    // Check if company already has an active subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { companyId: session.user.companyId }
    })

    if (existingSubscription && existingSubscription.status === 'active') {
      return NextResponse.json({ 
        error: "Company already has an active subscription" 
      }, { status: 400 })
    }

    // Get the plan details
    const plan = await prisma.plan.findUnique({
      where: { id: validatedData.planId }
    })

    if (!plan || !plan.stripePriceId) {
      return NextResponse.json({ 
        error: "Invalid plan or plan not configured with Stripe" 
      }, { status: 400 })
    }

    // Get company and user details
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId }
    })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!company || !user) {
      return NextResponse.json({ error: "Company or user not found" }, { status: 404 })
    }

    // Create or get Stripe customer
    let stripeCustomerId = existingSubscription?.stripeCustomerId

    if (!stripeCustomerId) {
      const stripeCustomer = await createStripeCustomer(
        user.email,
        user.name || '',
        company.name,
        {
          companyId: company.id,
          userId: user.id
        }
      )
      stripeCustomerId = stripeCustomer.id
    }

    // Create Stripe subscription
    const stripeSubscription = await createStripeSubscription(
      stripeCustomerId,
      plan.stripePriceId,
      {
        companyId: company.id,
        planId: plan.id,
        planName: plan.name
      }
    )

    // Calculate trial end date if trial is requested
    let trialEnd: Date | null = null
    if (validatedData.trialDays && validatedData.trialDays > 0) {
      trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + validatedData.trialDays)
    }

    // Create or update subscription in database
    const subscription = await prisma.subscription.upsert({
      where: { companyId: session.user.companyId },
      create: {
        companyId: session.user.companyId,
        planId: plan.id,
        status: stripeSubscription.status,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: stripeCustomerId,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        trialEnd: trialEnd
      },
      update: {
        planId: plan.id,
        status: stripeSubscription.status,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: stripeCustomerId,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        trialEnd: trialEnd
      },
      include: {
        plan: true
      }
    })

    // Return client secret for payment confirmation if needed
    const clientSecret = stripeSubscription.latest_invoice?.payment_intent?.client_secret

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialEnd: subscription.trialEnd
      },
      clientSecret,
      message: "Subscription created successfully"
    })

  } catch (error) {
    console.error("Error creating subscription:", error)
    
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

