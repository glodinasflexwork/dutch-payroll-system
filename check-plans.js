const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPlans() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { price: 'asc' }
    });

    console.log(`Found ${plans.length} plans:`);
    
    for (const plan of plans) {
      console.log(`\nPlan: ${plan.name}`);
      console.log(`Price: €${plan.price}/${plan.currency}`);
      console.log(`Max Employees: ${plan.maxEmployees}`);
      console.log(`Max Payrolls: ${plan.maxPayrolls}`);
      console.log(`Features: ${JSON.stringify(plan.features)}`);
      console.log(`Active: ${plan.isActive}`);
    }
  } catch (error) {
    console.error('Error checking plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlans();
