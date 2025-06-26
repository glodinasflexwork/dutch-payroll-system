#!/usr/bin/env node

/**
 * Update Database Plans with Stripe Price IDs
 * 
 * This script updates your database plans with the Stripe price IDs
 * after you've created the products in Stripe Dashboard.
 * 
 * Usage:
 * 1. Update the price IDs below with your actual Stripe price IDs
 * 2. Run: node scripts/update-plans-with-stripe-ids.js
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// 🔧 UPDATE THESE WITH YOUR ACTUAL STRIPE PRICE IDs
const STRIPE_PRICE_IDS = {
  starter: 'price_your_starter_price_id_here',
  professional: 'price_your_professional_price_id_here', 
  enterprise: 'price_your_enterprise_price_id_here'
}

async function updatePlans() {
  console.log('🔄 Updating database plans with Stripe price IDs...')
  
  try {
    // Update Starter plan
    const starterPlan = await prisma.plan.update({
      where: { name: 'Starter' },
      data: { 
        stripePriceId: STRIPE_PRICE_IDS.starter,
        price: 2900, // €29.00 in cents
        maxEmployees: 5,
        maxPayrolls: 12
      }
    })
    console.log(`✅ Updated Starter plan: ${starterPlan.id}`)
    
    // Update Professional plan
    const professionalPlan = await prisma.plan.update({
      where: { name: 'Professional' },
      data: { 
        stripePriceId: STRIPE_PRICE_IDS.professional,
        price: 7900, // €79.00 in cents
        maxEmployees: 50,
        maxPayrolls: 50
      }
    })
    console.log(`✅ Updated Professional plan: ${professionalPlan.id}`)
    
    // Update Enterprise plan
    const enterprisePlan = await prisma.plan.update({
      where: { name: 'Enterprise' },
      data: { 
        stripePriceId: STRIPE_PRICE_IDS.enterprise,
        price: 19900, // €199.00 in cents
        maxEmployees: null, // unlimited
        maxPayrolls: null // unlimited
      }
    })
    console.log(`✅ Updated Enterprise plan: ${enterprisePlan.id}`)
    
    console.log('\n🎉 All plans updated successfully!')
    console.log('\n📋 Summary:')
    console.log(`   Starter: €29/month (${STRIPE_PRICE_IDS.starter})`)
    console.log(`   Professional: €79/month (${STRIPE_PRICE_IDS.professional})`)
    console.log(`   Enterprise: €199/month (${STRIPE_PRICE_IDS.enterprise})`)
    
  } catch (error) {
    console.error('❌ Error updating plans:', error.message)
    
    if (error.code === 'P2025') {
      console.log('\n💡 Plan not found. Make sure you have run the seed script first:')
      console.log('   node seed-multi-tenancy.js')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Validation
function validatePriceIds() {
  const invalidIds = Object.entries(STRIPE_PRICE_IDS).filter(([key, id]) => 
    !id || id.includes('your_') || !id.startsWith('price_')
  )
  
  if (invalidIds.length > 0) {
    console.error('❌ Please update the Stripe price IDs in this script first!')
    console.log('\nInvalid price IDs:')
    invalidIds.forEach(([key, id]) => {
      console.log(`   ${key}: ${id}`)
    })
    console.log('\n💡 Get your price IDs from Stripe Dashboard → Products')
    process.exit(1)
  }
}

// Main execution
async function main() {
  console.log('🚀 Dutch Payroll System - Database Plan Update')
  console.log('=' .repeat(50))
  
  validatePriceIds()
  await updatePlans()
}

main().catch(console.error)

