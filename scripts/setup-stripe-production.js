#!/usr/bin/env node

/**
 * Stripe Production Setup Script for Dutch Payroll System
 * 
 * This script will:
 * 1. Create products and prices in your Stripe account
 * 2. Update your database with Stripe IDs
 * 3. Generate environment variables for easy copy-paste
 * 
 * Usage:
 * 1. Set STRIPE_SECRET_KEY in your .env file
 * 2. Run: node scripts/setup-stripe-production.js
 */

const readline = require('readline')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function main() {
  console.log('🚀 Dutch Payroll System - Stripe Production Setup')
  console.log('=' .repeat(50))

  // Check if Stripe key is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables')
    console.log('\n📝 Please add your Stripe secret key to .env file:')
    console.log('STRIPE_SECRET_KEY="sk_test_or_sk_live_your_key_here"')
    process.exit(1)
  }

  const isLiveMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')
  const mode = isLiveMode ? 'LIVE' : 'TEST'
  
  console.log(`\n🔑 Stripe Mode: ${mode}`)
  console.log(`📧 Make sure you're using the correct Stripe account!`)

  const confirm = await question(`\n❓ Continue with ${mode} mode setup? (y/N): `)
  if (confirm.toLowerCase() !== 'y') {
    console.log('Setup cancelled.')
    process.exit(0)
  }

  try {
    // Import Stripe after confirming setup
    const { stripe } = require('../src/lib/stripe')
    const { prisma } = require('../src/lib/prisma')

    console.log('\n📦 Creating Stripe products and prices...')

    const plans = [
      {
        key: 'starter',
        name: 'Starter',
        price: 2900, // €29.00 in cents
        maxEmployees: 5,
        maxPayrolls: 12,
        features: {
          employee_management: true,
          basic_payroll: true,
          basic_reports: true,
          email_support: true,
          payroll_management: false,
          advanced_reports: false,
          api_access: false,
          priority_support: false,
          custom_integrations: false
        }
      },
      {
        key: 'professional',
        name: 'Professional',
        price: 7900, // €79.00 in cents
        maxEmployees: 50,
        maxPayrolls: 50,
        features: {
          employee_management: true,
          basic_payroll: true,
          basic_reports: true,
          email_support: true,
          payroll_management: true,
          advanced_reports: true,
          api_access: true,
          priority_support: false,
          custom_integrations: false
        }
      },
      {
        key: 'enterprise',
        name: 'Enterprise',
        price: 19900, // €199.00 in cents
        maxEmployees: null, // unlimited
        maxPayrolls: null, // unlimited
        features: {
          employee_management: true,
          basic_payroll: true,
          basic_reports: true,
          email_support: true,
          payroll_management: true,
          advanced_reports: true,
          api_access: true,
          priority_support: true,
          custom_integrations: true
        }
      }
    ]

    const results = []

    for (const plan of plans) {
      console.log(`\n📦 Creating ${plan.name} plan...`)

      // Create product
      const product = await stripe.products.create({
        name: `Dutch Payroll System - ${plan.name}`,
        description: `${plan.name} plan for Dutch Payroll System - Professional payroll management for Dutch businesses`,
        metadata: {
          plan_key: plan.key,
          max_employees: plan.maxEmployees?.toString() || 'unlimited',
          max_payrolls: plan.maxPayrolls?.toString() || 'unlimited',
          created_by: 'setup_script',
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
          interval: 'month'
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
            stripeProductId: product.id,
            stripePriceId: price.id,
            features: plan.features,
            price: plan.price
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

    // Generate environment variables
    console.log('\n🔧 Environment Variables for .env file:')
    console.log('=' .repeat(50))
    
    results.forEach(result => {
      const envVar = `STRIPE_${result.plan.toUpperCase()}_PRICE_ID`
      console.log(`${envVar}="${result.priceId}"`)
    })

    // Generate webhook configuration
    console.log('\n🔗 Webhook Configuration:')
    console.log('=' .repeat(50))
    console.log('Endpoint URL: https://your-domain.com/api/webhooks/stripe')
    console.log('Events to listen for:')
    console.log('  - customer.subscription.created')
    console.log('  - customer.subscription.updated')
    console.log('  - customer.subscription.deleted')
    console.log('  - invoice.payment_succeeded')
    console.log('  - invoice.payment_failed')
    console.log('  - customer.subscription.trial_will_end')

    // Save configuration to file
    const configFile = {
      mode: mode,
      created: new Date().toISOString(),
      products: results,
      webhookEvents: [
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'customer.subscription.trial_will_end'
      ]
    }

    fs.writeFileSync(
      path.join(__dirname, '..', `stripe-config-${mode.toLowerCase()}.json`),
      JSON.stringify(configFile, null, 2)
    )

    console.log('\n✅ Setup completed successfully!')
    console.log(`📄 Configuration saved to: stripe-config-${mode.toLowerCase()}.json`)
    
    console.log('\n📋 Next Steps:')
    console.log('1. Copy the environment variables above to your .env file')
    console.log('2. Set up webhook endpoint in Stripe Dashboard')
    console.log('3. Test the integration with test payments')
    console.log('4. Deploy to production with live keys')

    await prisma.$disconnect()

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message)
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n💡 Check your STRIPE_SECRET_KEY in .env file')
    } else if (error.code === 'resource_missing') {
      console.log('\n💡 Make sure your Stripe account is properly set up')
    }
    
    process.exit(1)
  } finally {
    rl.close()
  }
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log('\n\n👋 Setup cancelled by user')
  rl.close()
  process.exit(0)
})

main().catch(console.error)

