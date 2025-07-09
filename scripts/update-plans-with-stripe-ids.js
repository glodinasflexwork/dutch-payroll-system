const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePlansWithStripeIds() {
  try {
    console.log('🔍 Checking current plans...');
    
    // Get all current plans
    const plans = await prisma.plan.findMany({
      orderBy: { price: 'asc' }
    });
    
    console.log('📋 Current plans:');
    plans.forEach(plan => {
      console.log(`- ${plan.name}: €${plan.price/100} (${plan.price} cents) - Stripe ID: ${plan.stripeProductId || 'NOT SET'}`);
    });
    
    // Update plans with correct Stripe price IDs
    const updates = [
      {
        name: 'Starter',
        stripeProductId: 'price_1ReIAFKopO2jXhaHl9D9oblI',
        price: 2900 // €29 in cents
      },
      {
        name: 'Professional', 
        stripeProductId: 'price_1ReIAFKopO2jXhaHq19ISvSc',
        price: 7900 // €79 in cents
      },
      {
        name: 'Enterprise',
        stripeProductId: 'price_1ReIAGKopO2jXhaHJ9CjDvU7', 
        price: 19900 // €199 in cents
      }
    ];
    
    console.log('\n🔧 Updating plans with Stripe IDs...');
    
    for (const update of updates) {
      const result = await prisma.plan.updateMany({
        where: { name: update.name },
        data: { 
          stripeProductId: update.stripeProductId,
          price: update.price
        }
      });
      
      if (result.count > 0) {
        console.log(`✅ Updated ${update.name} plan with Stripe ID: ${update.stripeProductId}`);
      } else {
        console.log(`❌ No ${update.name} plan found to update`);
      }
    }
    
    console.log('\n📋 Updated plans:');
    const updatedPlans = await prisma.plan.findMany({
      orderBy: { price: 'asc' }
    });
    
    updatedPlans.forEach(plan => {
      console.log(`- ${plan.name}: €${plan.price/100} - Stripe ID: ${plan.stripeProductId || 'NOT SET'}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePlansWithStripeIds();

