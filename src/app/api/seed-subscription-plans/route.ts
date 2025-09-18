import { NextRequest, NextResponse } from "next/server"
import { getAuthClient } from "@/lib/database-clients"

export async function POST(request: NextRequest) {
  try {
    console.log("=== SEEDING SUBSCRIPTION PLANS (UNPROTECTED) ===")
    
    const authClient = await getAuthClient()
    
    const plans = [
      {
        name: 'Trial',
        price: 0,
        maxEmployees: 5,
        features: ['Basic payroll', 'Employee management', '14-day trial'],
        stripePriceId: null,
        isActive: true
      },
      {
        name: 'Starter',
        price: 29,
        maxEmployees: 10,
        features: ['Full payroll', 'Employee portal', 'Basic reports'],
        stripePriceId: process.env.STRIPE_PRICE_ID_STARTER,
        isActive: true
      },
      {
        name: 'Professional',
        price: 79,
        maxEmployees: 50,
        features: ['Advanced reports', 'Leave management', 'API access'],
        stripePriceId: process.env.STRIPE_PRICE_ID_PROFESSIONAL,
        isActive: true
      },
      {
        name: 'Enterprise',
        price: 199,
        maxEmployees: -1, // Unlimited
        features: ['Custom integrations', 'Priority support', 'Advanced analytics'],
        stripePriceId: process.env.STRIPE_PRICE_ID_ENTERPRISE,
        isActive: true
      }
    ]

    const results = []
    
    for (const plan of plans) {
      try {
        console.log(`Checking if ${plan.name} plan exists...`)
        
        const existing = await authClient.subscriptionPlan.findUnique({
          where: { name: plan.name }
        })
        
        if (!existing) {
          console.log(`Creating ${plan.name} plan...`)
          const created = await authClient.subscriptionPlan.create({ 
            data: plan 
          })
          console.log(`✅ Created ${plan.name} plan with ID: ${created.id}`)
          results.push({ 
            action: 'created', 
            plan: { 
              id: created.id, 
              name: created.name, 
              price: created.price,
              maxEmployees: created.maxEmployees
            } 
          })
        } else {
          console.log(`⚠️ ${plan.name} plan already exists with ID: ${existing.id}`)
          results.push({ 
            action: 'exists', 
            plan: { 
              id: existing.id, 
              name: existing.name, 
              price: existing.price,
              maxEmployees: existing.maxEmployees
            } 
          })
        }
      } catch (planError) {
        console.error(`❌ Failed to process ${plan.name} plan:`, planError)
        results.push({ 
          action: 'error', 
          plan: { name: plan.name }, 
          error: planError instanceof Error ? planError.message : 'Unknown error'
        })
      }
    }

    // Verify Trial plan specifically
    const trialPlan = await authClient.subscriptionPlan.findUnique({
      where: { name: 'Trial' }
    })

    console.log("=== SEEDING COMPLETED ===")
    console.log("Trial plan exists:", !!trialPlan)
    console.log("Trial plan ID:", trialPlan?.id)
    
    return NextResponse.json({
      success: true,
      message: "Subscription plans seeding completed successfully!",
      results,
      summary: {
        trialPlanExists: !!trialPlan,
        trialPlanId: trialPlan?.id || null,
        totalPlans: results.length,
        created: results.filter(r => r.action === 'created').length,
        existing: results.filter(r => r.action === 'exists').length,
        errors: results.filter(r => r.action === 'error').length
      },
      timestamp: new Date().toISOString(),
      nextSteps: [
        "Trial subscription plan is now available",
        "Registration process should work without errors",
        "New users will automatically get 14-day trial subscriptions"
      ]
    })

  } catch (error) {
    console.error("❌ Failed to seed subscription plans:", error)
    return NextResponse.json({
      error: "Failed to seed subscription plans",
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authClient = await getAuthClient()
    
    const plans = await authClient.subscriptionPlan.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        maxEmployees: true,
        features: true,
        isActive: true,
        stripePriceId: true,
        createdAt: true
      },
      orderBy: { price: 'asc' }
    })

    const trialPlan = plans.find(p => p.name === 'Trial')

    return NextResponse.json({
      success: true,
      plans,
      summary: {
        totalPlans: plans.length,
        trialPlanExists: !!trialPlan,
        trialPlanId: trialPlan?.id || null,
        activePlans: plans.filter(p => p.isActive).length
      },
      message: trialPlan ? 
        "Trial plan exists - registration should work" : 
        "Trial plan missing - run POST to create plans"
    })

  } catch (error) {
    return NextResponse.json({
      error: "Failed to fetch subscription plans",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
