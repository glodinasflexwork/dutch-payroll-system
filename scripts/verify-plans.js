#!/usr/bin/env node

// Script to verify subscription plans in the database
// Run with: node scripts/verify-plans.js

const { PrismaClient } = require('@prisma/client')

async function verifySubscriptionPlans() {
  console.log('=== VERIFYING SUBSCRIPTION PLANS ===')
  
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

    // Get all plans
    const allPlans = await authClient.plan.findMany({
      orderBy: { price: 'asc' }
    })

    console.log(`\n📊 Found ${allPlans.length} subscription plans:`)
    console.log('=' .repeat(80))

    allPlans.forEach((plan, index) => {
      console.log(`\n${index + 1}. ${plan.name}`)
      console.log(`   ID: ${plan.id}`)
      console.log(`   Price: €${plan.price}`)
      console.log(`   Max Employees: ${plan.maxEmployees === -1 ? 'Unlimited' : plan.maxEmployees}`)
      console.log(`   Max Payrolls: ${plan.maxPayrolls || 'Unlimited'}`)
      console.log(`   Features: ${JSON.stringify(plan.features)}`)
      console.log(`   Stripe Price ID: ${plan.stripePriceId || 'None'}`)
      console.log(`   Active: ${plan.isActive ? 'Yes' : 'No'}`)
      console.log(`   Created: ${plan.createdAt.toISOString()}`)
    })

    // Specifically check for Trial plan
    const trialPlan = await authClient.plan.findFirst({
      where: { name: 'Trial' }
    })

    console.log('\n' + '=' .repeat(80))
    console.log('🎯 TRIAL PLAN VERIFICATION:')
    
    if (trialPlan) {
      console.log('✅ Trial plan EXISTS')
      console.log(`   ID: ${trialPlan.id}`)
      console.log(`   Price: €${trialPlan.price}`)
      console.log(`   Max Employees: ${trialPlan.maxEmployees}`)
      console.log(`   Active: ${trialPlan.isActive}`)
      console.log(`   Features: ${JSON.stringify(trialPlan.features)}`)
    } else {
      console.log('❌ Trial plan NOT FOUND')
    }

    // Check if any subscriptions exist
    const subscriptionCount = await authClient.subscription.count()
    console.log(`\n📈 SUBSCRIPTION USAGE:`)
    console.log(`   Total active subscriptions: ${subscriptionCount}`)

    if (subscriptionCount > 0) {
      const subscriptions = await authClient.subscription.findMany({
        include: {
          Plan: true,
          Company: true
        },
        take: 5 // Show first 5
      })

      console.log('\n   Recent subscriptions:')
      subscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. Company: ${sub.Company.name}`)
        console.log(`      Plan: ${sub.Plan.name} (€${sub.Plan.price})`)
        console.log(`      Status: ${sub.status}`)
        console.log(`      Trial Active: ${sub.isTrialActive}`)
      })
    }

    console.log('\n' + '=' .repeat(80))
    console.log('🎯 REGISTRATION READINESS CHECK:')
    
    const requiredPlans = ['Trial', 'Starter', 'Professional', 'Enterprise']
    const missingPlans = []
    
    for (const planName of requiredPlans) {
      const plan = allPlans.find(p => p.name === planName)
      if (plan) {
        console.log(`✅ ${planName} plan: Available (€${plan.price})`)
      } else {
        console.log(`❌ ${planName} plan: MISSING`)
        missingPlans.push(planName)
      }
    }

    if (missingPlans.length === 0) {
      console.log('\n🎉 SUCCESS: All required plans are available!')
      console.log('   Registration process should work without errors.')
    } else {
      console.log(`\n⚠️ WARNING: Missing plans: ${missingPlans.join(', ')}`)
      console.log('   Registration may fail for missing plan types.')
    }

  } catch (error) {
    console.error('❌ Failed to verify subscription plans:', error)
    process.exit(1)
  } finally {
    await authClient.$disconnect()
    console.log('\n✅ Disconnected from database')
  }
}

// Run the verification
verifySubscriptionPlans()
  .then(() => {
    console.log('\n✅ Verification completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error)
    process.exit(1)
  })
