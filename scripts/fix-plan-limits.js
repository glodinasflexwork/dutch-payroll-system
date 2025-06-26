#!/usr/bin/env node

/**
 * Fix Plan Limits Script
 * Updates the maxEmployees and maxPayrolls values for all plans
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPlanLimits() {
  try {
    console.log('🔧 Fixing plan limits in database...');

    // First, get all plans
    const plans = await prisma.plan.findMany();
    console.log('Found plans:', plans.map(p => `${p.name} (${p.id})`));

    // Update Starter plan
    const starterPlan = plans.find(p => p.name === 'Starter');
    if (starterPlan) {
      await prisma.plan.update({
        where: { id: starterPlan.id },
        data: {
          maxEmployees: 10,
          maxPayrolls: 12,
          features: [
            'Employee management',
            'Basic payroll processing',
            'Monthly reports',
            'Email support',
            'Tax calculations'
          ]
        }
      });
      console.log('✅ Updated Starter plan limits');
    }

    // Update Professional plan
    const professionalPlan = plans.find(p => p.name === 'Professional');
    if (professionalPlan) {
      await prisma.plan.update({
        where: { id: professionalPlan.id },
        data: {
          maxEmployees: 50,
          maxPayrolls: 50,
          features: [
            'Employee management',
            'Advanced payroll processing',
            'Detailed reports & analytics',
            'Priority email support',
            'Tax calculations',
            'Custom pay schedules',
            'Employee self-service portal'
          ]
        }
      });
      console.log('✅ Updated Professional plan limits');
    }

    // Update Enterprise plan
    const enterprisePlan = plans.find(p => p.name === 'Enterprise');
    if (enterprisePlan) {
      await prisma.plan.update({
        where: { id: enterprisePlan.id },
        data: {
          maxEmployees: -1, // Unlimited
          maxPayrolls: -1,  // Unlimited
          features: [
            'Employee management',
            'Advanced payroll processing',
            'Detailed reports & analytics',
            'Priority phone & email support',
            'Tax calculations',
            'Custom pay schedules',
            'Employee self-service portal',
            'API access',
            'Custom integrations',
            'Dedicated account manager'
          ]
        }
      });
      console.log('✅ Updated Enterprise plan limits');
    }

    // Verify the updates
    const updatedPlans = await prisma.plan.findMany({
      orderBy: { price: 'asc' }
    });

    console.log('\n📊 Updated Plan Summary:');
    updatedPlans.forEach(plan => {
      console.log(`\n${plan.name}:`);
      console.log(`  Price: €${plan.price}/month`);
      console.log(`  Max Employees: ${plan.maxEmployees === -1 ? 'Unlimited' : plan.maxEmployees}`);
      console.log(`  Max Payrolls: ${plan.maxPayrolls === -1 ? 'Unlimited' : plan.maxPayrolls}`);
      console.log(`  Features: ${Array.isArray(plan.features) ? plan.features.length : 'N/A'} features`);
    });

    console.log('\n🎉 Plan limits fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing plan limits:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixPlanLimits();
}

module.exports = { fixPlanLimits };

