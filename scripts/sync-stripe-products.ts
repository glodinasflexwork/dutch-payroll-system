import { stripe, STRIPE_CONFIG } from '../src/lib/stripe'
import { prisma } from '../src/lib/prisma'

async function syncStripeProducts() {
  console.log('🚀 Starting Stripe products sync...')

  try {
    // Create products and prices for each plan
    for (const [planKey, planConfig] of Object.entries(STRIPE_CONFIG.plans)) {
      console.log(`\n📦 Creating product for ${planConfig.name} plan...`)

      // Create product in Stripe
      const product = await stripe.products.create({
        name: `Dutch Payroll System - ${planConfig.name}`,
        description: `${planConfig.name} plan for Dutch Payroll System`,
        metadata: {
          plan_key: planKey,
          max_employees: planConfig.maxEmployees?.toString() || 'unlimited',
          max_payrolls: planConfig.maxPayrolls?.toString() || 'unlimited'
        }
      })

      console.log(`✅ Product created: ${product.id}`)

      // Create price for the product
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: planConfig.amount,
        currency: STRIPE_CONFIG.currency,
        recurring: {
          interval: 'month'
        },
        metadata: {
          plan_key: planKey
        }
      })

      console.log(`💰 Price created: ${price.id}`)

      // Update our database plan with Stripe IDs
      const updatedPlan = await prisma.plan.update({
        where: { name: planConfig.name },
        data: {
          stripeProductId: product.id,
          stripePriceId: price.id
        }
      })

      console.log(`📊 Database plan updated: ${updatedPlan.id}`)

      // Output environment variable for easy copy-paste
      const envVarName = `STRIPE_${planKey.toUpperCase()}_PRICE_ID`
      console.log(`🔧 Add to .env: ${envVarName}="${price.id}"`)
    }

    console.log('\n🎉 Stripe products sync completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Update your .env file with the price IDs shown above')
    console.log('2. Set up webhook endpoint in Stripe Dashboard')
    console.log('3. Add your real Stripe API keys to .env')

  } catch (error) {
    console.error('❌ Error syncing Stripe products:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the sync if this script is executed directly
if (require.main === module) {
  syncStripeProducts()
}

export { syncStripeProducts }

