const { PrismaClient } = require('@prisma/client');

async function checkTrialPlans() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  try {
    console.log('🔍 Checking for trial plans...');
    
    const plans = await prisma.plan.findMany({
      where: {
        isActive: true
      }
    });
    
    console.log(`📊 Found ${plans.length} active plans:`);
    plans.forEach(plan => {
      console.log(`  - ${plan.name} (${plan.id}) - €${plan.price}`);
    });
    
    const trialPlans = plans.filter(plan => 
      plan.name.toLowerCase().includes('trial') || 
      plan.name.toLowerCase().includes('free')
    );
    
    console.log(`🎯 Found ${trialPlans.length} trial plans:`);
    trialPlans.forEach(plan => {
      console.log(`  - ${plan.name} (${plan.id})`);
    });
    
    if (trialPlans.length === 0) {
      console.log('❌ No trial plans found! This could be the issue.');
      console.log('💡 Creating a default trial plan...');
      
      const newTrialPlan = await prisma.plan.create({
        data: {
          name: "Free Trial",
          maxEmployees: 5,
          maxPayrolls: 10,
          features: {
            "payroll": true,
            "employees": true,
            "reports": true
          },
          price: 0,
          currency: "EUR",
          isActive: true
        }
      });
      
      console.log(`✅ Created trial plan: ${newTrialPlan.name} (${newTrialPlan.id})`);
    }
    
  } catch (error) {
    console.error('❌ Error checking trial plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTrialPlans();
