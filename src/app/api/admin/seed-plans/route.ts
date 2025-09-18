import { NextRequest, NextResponse } from "next/server"
import { getAuthClient } from "@/lib/database-clients"

export async function POST(request: NextRequest) {
  try {
    console.log("=== SEEDING SUBSCRIPTION PLANS ===")
    
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
              price: created.price 
            } 
          })
        } else {
          console.log(`⚠️ ${plan.name} plan already exists with ID: ${existing.id}`)
          results.push({ 
            action: 'exists', 
            plan: { 
              id: existing.id, 
              name: existing.name, 
              price: existing.price 
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
    
    return NextResponse.json({
      success: true,
      message: "Subscription plans seeding completed",
      results,
      trialPlanExists: !!trialPlan,
      trialPlanId: trialPlan?.id || null,
      timestamp: new Date().toISOString()
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
        stripePriceId: true
      },
      orderBy: { price: 'asc' }
    })

    return NextResponse.json({
      success: true,
      plans,
      count: plans.length,
      trialPlanExists: plans.some(p => p.name === 'Trial')
    })

  } catch (error) {
    return NextResponse.json({
      error: "Failed to fetch subscription plans",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
