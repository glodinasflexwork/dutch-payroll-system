const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function updateEnterprisePlan() {
  const authClient = new PrismaClient({
    datasources: { db: { url: process.env.AUTH_DATABASE_URL } }
  });

  try {
    console.log('🔧 Updating Enterprise plan to points-based pricing...');

    // Find the Enterprise plan first
    const enterprisePlan = await authClient.plan.findFirst({
      where: { name: 'Enterprise' }
    });

    if (!enterprisePlan) {
      console.log('❌ Enterprise plan not found');
      return;
    }

    // Update the Enterprise plan
    const updatedPlan = await authClient.plan.update({
      where: { id: enterprisePlan.id },
      data: {
        price: 300, // €3.00 per payroll run (in cents)
        features: [
          'Unlimited employees',
          'Pay-per-payroll pricing (€3 per run)',
          'Everything in Professional',
          'Multi-company management',
          'Dedicated account manager',
          'Custom integrations',
          '24/7 phone support',
          'Points-based billing system'
        ]
      }
    });

    console.log('✅ Enterprise plan updated successfully!');
    console.log(`Plan: ${updatedPlan.name}`);
    console.log(`Price per payroll: €${updatedPlan.price / 100}`);
    console.log(`Features:`, updatedPlan.features);

  } catch (error) {
    console.error('❌ Error updating Enterprise plan:', error);
  } finally {
    await authClient.$disconnect();
  }
}

updateEnterprisePlan();

