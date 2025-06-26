#!/usr/bin/env node

/**
 * Stripe Setup Script for Dutch Payroll System
 * 
 * This script creates the necessary Stripe products and prices for the SaaS platform:
 * - Starter Plan: €29/month
 * - Professional Plan: €79/month  
 * - Enterprise Plan: €199/month
 * 
 * Usage: node scripts/setup-stripe.js
 */

const stripe = require('stripe');

// Configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY environment variable is required');
  console.log('Please set your Stripe secret key:');
  console.log('export STRIPE_SECRET_KEY="sk_test_..." or export STRIPE_SECRET_KEY="sk_live_..."');
  process.exit(1);
}

const stripeClient = stripe(STRIPE_SECRET_KEY);

// Product definitions
const PRODUCTS = [
  {
    name: 'Starter',
    description: 'Perfect for small businesses getting started with payroll management',
    price: 2900, // €29.00 in cents
    currency: 'eur',
    interval: 'month',
    features: [
      'Up to 10 employees',
      'Basic payroll processing',
      'Standard reports',
      'Email support'
    ]
  },
  {
    name: 'Professional', 
    description: 'Advanced features for growing businesses with comprehensive payroll needs',
    price: 7900, // €79.00 in cents
    currency: 'eur',
    interval: 'month',
    features: [
      'Up to 50 employees',
      'Advanced payroll processing',
      'Custom reports',
      'Priority support',
      'Multi-company management'
    ]
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for large organizations with complex payroll requirements',
    price: 19900, // €199.00 in cents
    currency: 'eur', 
    interval: 'month',
    features: [
      'Unlimited employees',
      'Enterprise payroll processing',
      'Advanced analytics',
      'Dedicated support',
      'Custom integrations',
      'White-label options'
    ]
  }
];

async function createStripeProducts() {
  console.log('\n🚀 Starting Stripe Product and Price Creation...\n');
  
  const results = [];
  
  for (const productData of PRODUCTS) {
    try {
      console.log(`📦 Creating product: ${productData.name}...`);
      
      // Create Product
      const product = await stripeClient.products.create({
        name: productData.name,
        description: productData.description,
        metadata: {
          features: productData.features.join(', '),
          plan_type: productData.name.toLowerCase()
        }
      });
      
      console.log(`✅ Product created: ${product.name} (ID: ${product.id})`);
      
      // Create Price for the Product
      const price = await stripeClient.prices.create({
        product: product.id,
        unit_amount: productData.price,
        currency: productData.currency,
        recurring: {
          interval: productData.interval
        },
        metadata: {
          plan_name: productData.name
        }
      });
      
      const priceAmount = (price.unit_amount / 100).toFixed(2);
      console.log(`💰 Price created: €${priceAmount}/${price.recurring.interval} (ID: ${price.id})`);
      
      results.push({
        plan: productData.name,
        productId: product.id,
        priceId: price.id,
        amount: priceAmount,
        currency: price.currency.toUpperCase()
      });
      
      console.log('─'.repeat(60));
      
    } catch (error) {
      console.error(`❌ Error creating ${productData.name}:`, error.message);
      if (error.type === 'StripeCardError') {
        console.error('Card error details:', error.decline_code);
      }
    }
  }
  
  console.log('\n🎉 Stripe Product and Price Creation Complete!\n');
  
  // Display summary
  console.log('📋 SUMMARY:');
  console.log('═'.repeat(80));
  results.forEach(result => {
    console.log(`${result.plan.padEnd(15)} | Product: ${result.productId} | Price: ${result.priceId}`);
  });
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Add these Price IDs to your Vercel environment variables:');
  console.log('');
  results.forEach(result => {
    const envVarName = `STRIPE_PRICE_ID_${result.plan.toUpperCase()}`;
    console.log(`   ${envVarName}="${result.priceId}"`);
  });
  console.log('');
  console.log('2. Update your database Plan records with these Stripe IDs');
  console.log('3. Test the subscription flow in your application');
  console.log('');
  console.log('💡 You can also view these products in your Stripe Dashboard:');
  console.log('   https://dashboard.stripe.com/products');
  
  return results;
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  createStripeProducts()
    .then(() => {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { createStripeProducts };

