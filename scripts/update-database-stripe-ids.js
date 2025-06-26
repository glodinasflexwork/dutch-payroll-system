#!/usr/bin/env node

/**
 * Update Database with Stripe IDs
 * 
 * This script updates the Plan records in the database with the newly created Stripe product and price IDs.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Stripe IDs from the setup script
const STRIPE_DATA = [
  {
    name: 'Starter',
    productId: 'prod_SZR2F15DLs5wsK',
    priceId: 'price_1ReIAFKopO2jXhaHl9D9oblI',
    price: 29.00
  },
  {
    name: 'Professional', 
    productId: 'prod_SZR2WsTcm1zI18',
    priceId: 'price_1ReIAFKopO2jXhaHq19ISvSc',
    price: 79.00
  },
  {
    name: 'Enterprise',
    productId: 'prod_SZR2OHJb7VxVGp', 
    priceId: 'price_1ReIAGKopO2jXhaHJ9CjDvU7',
    price: 199.00
  }
];

async function updateDatabaseWithStripeIds() {
  console.log('\n🔄 Updating database Plan records with Stripe IDs...\n');
  
  try {
    for (const stripeData of STRIPE_DATA) {
      console.log(`📝 Updating ${stripeData.name} plan...`);
      
      // Find and update the plan
      const updatedPlan = await prisma.plan.updateMany({
        where: {
          name: stripeData.name
        },
        data: {
          stripeProductId: stripeData.productId,
          stripePriceId: stripeData.priceId,
          price: stripeData.price
        }
      });
      
      if (updatedPlan.count > 0) {
        console.log(`✅ Updated ${stripeData.name} plan with Stripe IDs`);
        console.log(`   Product ID: ${stripeData.productId}`);
        console.log(`   Price ID: ${stripeData.priceId}`);
        console.log(`   Price: €${stripeData.price}/month`);
      } else {
        console.log(`⚠️  No ${stripeData.name} plan found in database - creating new record...`);
        
        // Create the plan if it doesn't exist
        const newPlan = await prisma.plan.create({
          data: {
            name: stripeData.name,
            price: stripeData.price,
            stripeProductId: stripeData.productId,
            stripePriceId: stripeData.priceId,
            features: getFeatures(stripeData.name),
            maxEmployees: getMaxEmployees(stripeData.name),
            maxPayrolls: getMaxPayrolls(stripeData.name)
          }
        });
        
        console.log(`✅ Created new ${stripeData.name} plan with ID: ${newPlan.id}`);
      }
      
      console.log('─'.repeat(60));
    }
    
    // Verify the updates
    console.log('\n📋 Verification - Current Plan records:');
    const allPlans = await prisma.plan.findMany({
      orderBy: { price: 'asc' }
    });
    
    allPlans.forEach(plan => {
      console.log(`${plan.name.padEnd(15)} | €${plan.price}/month | Product: ${plan.stripeProductId || 'Not set'} | Price: ${plan.stripePriceId || 'Not set'}`);
    });
    
    console.log('\n✅ Database update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function getFeatures(planName) {
  const features = {
    'Starter': ['Up to 10 employees', 'Basic payroll processing', 'Standard reports', 'Email support'],
    'Professional': ['Up to 50 employees', 'Advanced payroll processing', 'Custom reports', 'Priority support', 'Multi-company management'],
    'Enterprise': ['Unlimited employees', 'Enterprise payroll processing', 'Advanced analytics', 'Dedicated support', 'Custom integrations', 'White-label options']
  };
  
  return features[planName] || [];
}

function getMaxEmployees(planName) {
  const limits = {
    'Starter': 10,
    'Professional': 50,
    'Enterprise': -1 // -1 for unlimited
  };
  
  return limits[planName] || 10;
}

function getMaxPayrolls(planName) {
  const limits = {
    'Starter': 12, // 12 per year
    'Professional': 50, // 50 per year
    'Enterprise': -1 // -1 for unlimited
  };
  
  return limits[planName] || 12;
}

// Run the script
if (require.main === module) {
  updateDatabaseWithStripeIds()
    .then(() => {
      console.log('\n🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { updateDatabaseWithStripeIds };

