require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL
    }
  }
});

async function checkPlans() {
  try {
    console.log('🔍 Checking available plans in database...');
    
    const plans = await prisma.plan.findMany({
      where: { isActive: true }
    });
    
    if (plans.length === 0) {
      console.log('❌ No plans found in database');
      console.log('📋 Need to create a default trial plan');
    } else {
      console.log(`✅ Found ${plans.length} active plans:`);
      plans.forEach(plan => {
        console.log(`- ${plan.name}: €${plan.price}/${plan.currency} (Max employees: ${plan.maxEmployees})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlans();
