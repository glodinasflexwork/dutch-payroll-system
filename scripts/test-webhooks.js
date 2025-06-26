#!/usr/bin/env node

/**
 * Webhook Testing Script for Dutch Payroll System
 * 
 * This script helps test and validate your Stripe webhook integration
 * 
 * Usage:
 * 1. Ensure your dev server is running: npm run dev
 * 2. Run: node scripts/test-webhooks.js
 */

const readline = require('readline')
const https = require('https')
const http = require('http')

require('dotenv').config()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function testWebhookEndpoint() {
  console.log('🔗 Testing webhook endpoint...')
  
  const testPayload = JSON.stringify({
    id: 'evt_test_webhook',
    object: 'event',
    type: 'customer.subscription.created',
    data: {
      object: {
        id: 'sub_test',
        customer: 'cus_test',
        status: 'active',
        metadata: {
          companyId: 'test-company-id'
        }
      }
    }
  })

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/webhooks/stripe',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testPayload),
      'stripe-signature': 'test_signature'
    }
  }

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        })
      })
    })

    req.on('error', reject)
    req.write(testPayload)
    req.end()
  })
}

async function validateStripeConfig() {
  console.log('🔍 Validating Stripe configuration...')
  
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ]

  const missing = requiredEnvVars.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:')
    missing.forEach(key => console.log(`   - ${key}`))
    return false
  }

  // Check if keys match (test vs live)
  const secretKey = process.env.STRIPE_SECRET_KEY
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  const secretIsLive = secretKey.startsWith('sk_live_')
  const publishableIsLive = publishableKey.startsWith('pk_live_')

  if (secretIsLive !== publishableIsLive) {
    console.log('⚠️  Key mismatch: Secret and publishable keys are from different modes')
    console.log(`   Secret key: ${secretIsLive ? 'LIVE' : 'TEST'}`)
    console.log(`   Publishable key: ${publishableIsLive ? 'LIVE' : 'TEST'}`)
    return false
  }

  console.log(`✅ Keys configured for ${secretIsLive ? 'LIVE' : 'TEST'} mode`)
  return true
}

async function testStripeConnection() {
  console.log('🔌 Testing Stripe API connection...')
  
  try {
    const { stripe } = require('../src/lib/stripe')
    
    // Test API connection
    const account = await stripe.accounts.retrieve()
    console.log(`✅ Connected to Stripe account: ${account.display_name || account.id}`)
    console.log(`   Country: ${account.country}`)
    console.log(`   Currency: ${account.default_currency}`)
    
    return true
  } catch (error) {
    console.log('❌ Stripe connection failed:', error.message)
    return false
  }
}

async function listStripeProducts() {
  console.log('📦 Listing Stripe products...')
  
  try {
    const { stripe } = require('../src/lib/stripe')
    
    const products = await stripe.products.list({ limit: 10 })
    
    if (products.data.length === 0) {
      console.log('⚠️  No products found. Run setup script first: npm run setup-stripe')
      return false
    }

    console.log(`✅ Found ${products.data.length} products:`)
    products.data.forEach(product => {
      console.log(`   - ${product.name} (${product.id})`)
    })

    return true
  } catch (error) {
    console.log('❌ Failed to list products:', error.message)
    return false
  }
}

async function main() {
  console.log('🧪 Dutch Payroll System - Webhook Testing')
  console.log('=' .repeat(50))

  // Step 1: Validate configuration
  const configValid = await validateStripeConfig()
  if (!configValid) {
    console.log('\n💡 Please fix configuration issues before continuing')
    process.exit(1)
  }

  // Step 2: Test Stripe connection
  const connectionValid = await testStripeConnection()
  if (!connectionValid) {
    console.log('\n💡 Please check your Stripe API keys')
    process.exit(1)
  }

  // Step 3: List products
  await listStripeProducts()

  // Step 4: Test webhook endpoint
  console.log('\n🔗 Testing webhook endpoint...')
  const serverRunning = await question('Is your development server running on localhost:3000? (y/N): ')
  
  if (serverRunning.toLowerCase() === 'y') {
    try {
      const response = await testWebhookEndpoint()
      console.log(`   Status: ${response.statusCode}`)
      
      if (response.statusCode === 400) {
        console.log('✅ Webhook endpoint responding (signature validation working)')
      } else if (response.statusCode === 200) {
        console.log('✅ Webhook endpoint working')
      } else {
        console.log('⚠️  Unexpected response from webhook endpoint')
      }
    } catch (error) {
      console.log('❌ Webhook endpoint test failed:', error.message)
      console.log('💡 Make sure your dev server is running: npm run dev')
    }
  }

  // Step 5: Instructions for live testing
  console.log('\n📋 Next Steps for Live Testing:')
  console.log('1. Install Stripe CLI: https://stripe.com/docs/stripe-cli')
  console.log('2. Login: stripe login')
  console.log('3. Forward webhooks: npm run test-webhooks')
  console.log('4. Test subscription creation in your app')
  console.log('5. Monitor webhook events in Stripe Dashboard')

  console.log('\n✅ Testing completed!')
  rl.close()
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log('\n\n👋 Testing cancelled by user')
  rl.close()
  process.exit(0)
})

main().catch(console.error)

