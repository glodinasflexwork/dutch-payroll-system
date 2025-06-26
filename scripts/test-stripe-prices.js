#!/usr/bin/env node

/**
 * Test Stripe Price IDs
 * Verifies that the price IDs in our database actually exist in Stripe
 */

const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');

const prisma = new PrismaClient();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is not set');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

async function testStripePrices() {
  try {
    console.log('🧪 Testing Stripe price IDs...');

    // Get plans from database
    const plans = await prisma.plan.findMany({
      orderBy: { price: 'asc' }
    });

    console.log(`\nFound ${plans.length} plans in database:`);

    for (const plan of plans) {
      console.log(`\n📋 Testing ${plan.name} plan:`);
      console.log(`  Database Price ID: ${plan.stripePriceId}`);
      
      try {
        // Try to retrieve the price from Stripe
        const stripePrice = await stripe.prices.retrieve(plan.stripePriceId);
        
        console.log(`  ✅ Stripe Price exists!`);
        console.log(`     Amount: ${stripePrice.unit_amount / 100} ${stripePrice.currency.toUpperCase()}`);
        console.log(`     Product: ${stripePrice.product}`);
        console.log(`     Active: ${stripePrice.active}`);
        
        if (!stripePrice.active) {
          console.log(`  ⚠️  WARNING: Price is not active in Stripe!`);
        }
        
      } catch (error) {
        console.log(`  ❌ ERROR: Price not found in Stripe`);
        console.log(`     Error: ${error.message}`);
      }
    }

    console.log('\n🔍 Testing checkout session creation...');
    
    // Test creating a checkout session with the first plan
    const testPlan = plans[0];
    if (testPlan) {
      try {
        const testSession = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price: testPlan.stripePriceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: 'https://example.com/success',
          cancel_url: 'https://example.com/cancel',
        });
        
        console.log(`✅ Test checkout session created successfully!`);
        console.log(`   Session ID: ${testSession.id}`);
        
        // Clean up - expire the test session
        await stripe.checkout.sessions.expire(testSession.id);
        console.log(`🧹 Test session cleaned up`);
        
      } catch (error) {
        console.log(`❌ ERROR creating test checkout session:`);
        console.log(`   ${error.message}`);
      }
    }

    console.log('\n🎉 Stripe price testing complete!');
    
  } catch (error) {
    console.error('❌ Error testing Stripe prices:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testStripePrices();
}

module.exports = { testStripePrices };

