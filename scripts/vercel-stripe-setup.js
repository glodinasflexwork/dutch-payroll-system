#!/usr/bin/env node

/**
 * Post-Deployment Stripe Setup Script
 * 
 * This script should be run AFTER deploying to Vercel with environment variables set.
 * It will create Stripe products and update the database with the correct IDs.
 * 
 * Usage:
 * 1. Deploy to Vercel with all environment variables set
 * 2. Run this script in Vercel's serverless function or locally pointing to production DB
 */

const { PrismaClient } = require('@prisma/client')

// This will use the environment variables from Vercel
const prisma = new PrismaClient()

async function createStripeProducts() {
  console.log('🚀 Setting up Stripe products for production...')
  
  // Check if we have the required environment variables
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ]
  
  const missing = requiredEnvVars.filter(key => !process.env[key] || process.env[key].includes('placeholder'))
  
  if (missing.length > 0) {
    console.error('❌ Missing or placeholder environment variables:')
    missing.forEach(key => console.log(`   - ${key}`))
    console.log('\n💡 Make sure all Stripe environment variables are set in Vercel')
    process.exit(1)
  }

  const isLiveMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')
  console.log(`🔑 Stripe Mode: ${isLiveMode ? 'LIVE' : 'TEST'}`)

  try {
    const Stripe = require('stripe')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia'
    })

    console.log('📦 Creating Stripe products and prices...')

    const plans = [
      {
        key: 'starter',
        name: 'Starter',
        price: 2900, // €29.00 in cents
        maxEmployees: 5,
        maxPayrolls: 12,
        description: 'Perfect for small businesses with up to 5 employees',
        features: [
          'Employee management',
          'Basic payroll processing', 
          'Basic reports',
          'Email support'
        ]
      },
      {
        key: 'professional',
        name: 'Professional',
        price: 7900, // €79.00 in cents
        maxEmployees: 50,
        maxPayrolls: 50,
        description: 'Ideal for growing businesses with advanced payroll needs',
        features: [
          'Everything in Starter',
          'Advanced payroll management',
          'Advanced reports',
          'API access',
          'Priority support'
        ]
      },
      {
        key: 'enterprise',
        name: 'Enterprise',
        price: 19900, // €199.00 in cents
        maxEmployees: null, // unlimited
        maxPayrolls: null, // unlimited
        description: 'Unlimited employees with premium support and custom integrations',
        features: [
          'Everything in Professional',
          'Unlimited employees',
          'Custom integrations',
          'Dedicated support',
          'SLA guarantee'
        ]
      }
    ]

    const results = []

    for (const plan of plans) {
      console.log(`\n📦 Creating ${plan.name} plan...`)

      // Create product
      const product = await stripe.products.create({
        name: `Dutch Payroll System - ${plan.name}`,
        description: plan.description,
        metadata: {
          plan_key: plan.key,
          max_employees: plan.maxEmployees?.toString() || 'unlimited',
          max_payrolls: plan.maxPayrolls?.toString() || 'unlimited',
          created_by: 'vercel_deployment',
          version: '1.0'
        }
      })

      console.log(`   ✅ Product created: ${product.id}`)

      // Create price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: 'eur',
        recurring: {
          interval: 'month',
          trial_period_days: 14 // 14-day free trial
        },
        metadata: {
          plan_key: plan.key,
          plan_name: plan.name
        }
      })

      console.log(`   💰 Price created: ${price.id}`)

      // Update database
      try {
        const updatedPlan = await prisma.plan.update({
          where: { name: plan.name },
          data: {
            stripePriceId: price.id,
            price: plan.price,
            maxEmployees: plan.maxEmployees,
            maxPayrolls: plan.maxPayrolls,
            features: {
              employee_management: true,
              basic_payroll: true,
              basic_reports: true,
              email_support: true,
              payroll_management: plan.key !== 'starter',
              advanced_reports: plan.key !== 'starter',
              api_access: plan.key !== 'starter',
              priority_support: plan.key === 'enterprise',
              custom_integrations: plan.key === 'enterprise'
            }
          }
        })
        console.log(`   📊 Database updated: ${updatedPlan.id}`)
      } catch (dbError) {
        console.log(`   ⚠️  Database update failed: ${dbError.message}`)
        console.log(`   💡 You may need to run the seed script first`)
      }

      results.push({
        plan: plan.key,
        productId: product.id,
        priceId: price.id
      })
    }

    // Output environment variables for Vercel
    console.log('\n🔧 Add these environment variables to Vercel:')
    console.log('=' .repeat(50))
    
    results.forEach(result => {
      const envVar = `STRIPE_${result.plan.toUpperCase()}_PRICE_ID`
      console.log(`${envVar}="${result.priceId}"`)
    })

    console.log('\n✅ Stripe setup completed successfully!')
    console.log(`📄 Mode: ${isLiveMode ? 'LIVE' : 'TEST'}`)
    
    console.log('\n📋 Next Steps:')
    console.log('1. Add the price ID environment variables to Vercel')
    console.log('2. Set up webhook endpoint in Stripe Dashboard')
    console.log('3. Test the subscription flow')
    console.log('4. Monitor Stripe Dashboard for events')

    return results

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n💡 Check your STRIPE_SECRET_KEY environment variable')
    } else if (error.code === 'resource_missing') {
      console.log('\n💡 Make sure your Stripe account is properly set up')
    }
    
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Export for use as Vercel serverless function
module.exports = { createStripeProducts }

// Run directly if called from command line
if (require.main === module) {
  createStripeProducts().catch(console.error)
}

