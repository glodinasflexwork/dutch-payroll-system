#!/usr/bin/env node

// Local script to seed subscription plans
// Run with: node scripts/seed-plans.js

const { PrismaClient } = require('@prisma/client')

async function seedSubscriptionPlans() {
  console.log('=== SEEDING SUBSCRIPTION PLANS (LOCAL SCRIPT) ===')
  
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  })

  try {
    await authClient.$connect()
    console.log('✅ Connected to Auth database')

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
        stripePriceId: process.env.STRIPE_PRICE_ID_STARTER || null,
        isActive: true
      },
      {
        name: 'Professional',
        price: 79,
        maxEmployees: 50,
        features: ['Advanced reports', 'Leave management', 'API access'],
        stripePriceId: process.env.STRIPE_PRICE_ID_PROFESSIONAL || null,
        isActive: true
      },
      {
        name: 'Enterprise',
        price: 199,
        maxEmployees: -1, // Unlimited
        features: ['Custom integrations', 'Priority support', 'Advanced analytics'],
        stripePriceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || null,
        isActive: true
      }
    ]

    const results = []
    
    for (const plan of plans) {
      try {
        console.log(`Checking if ${plan.name} plan exists...`)
        
        const existing = await authClient.plan.findFirst({
          where: { name: plan.name }
        })
        
        if (!existing) {
          console.log(`Creating ${plan.name} plan...`)
          const created = await authClient.plan.create({ 
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
          error: planError.message
        })
      }
    }

    // Verify Trial plan specifically
    const trialPlan = await authClient.plan.findFirst({
      where: { name: 'Trial' }
    })

    console.log('\n=== SEEDING COMPLETED ===')
    console.log('Results:')
    results.forEach(result => {
      console.log(`- ${result.plan.name}: ${result.action}`)
    })
    
    console.log(`\nTrial plan exists: ${!!trialPlan}`)
    if (trialPlan) {
      console.log(`Trial plan ID: ${trialPlan.id}`)
    }
    
    const summary = {
      totalPlans: results.length,
      created: results.filter(r => r.action === 'created').length,
      existing: results.filter(r => r.action === 'exists').length,
      errors: results.filter(r => r.action === 'error').length
    }
    
    console.log('\nSummary:', summary)
    
    if (trialPlan) {
      console.log('\n🎉 SUCCESS: Trial plan is now available!')
      console.log('Registration process should work without errors.')
    } else {
      console.log('\n❌ ERROR: Trial plan was not created successfully.')
    }

  } catch (error) {
    console.error('❌ Failed to seed subscription plans:', error)
    process.exit(1)
  } finally {
    await authClient.$disconnect()
    console.log('✅ Disconnected from database')
  }
}

// Run the seeding
seedSubscriptionPlans()
  .then(() => {
    console.log('\n✅ Seeding script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Seeding script failed:', error)
    process.exit(1)
  })
