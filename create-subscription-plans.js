const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSubscriptionPlans() {
  try {
    console.log('Creating subscription plans for Dutch payroll system...');

    // Starter Plan - Small businesses
    const starterPlan = await prisma.plan.create({
      data: {
        name: 'Starter',
        price: 2900, // €29.00 per month in cents
        currency: 'EUR',
        maxEmployees: 10,
        maxPayrolls: 12, // 12 payroll runs per year
        features: [
          'Up to 10 employees',
          'Monthly payroll processing',
          'Basic tax calculations',
          'Employee self-service portal',
          'Basic reporting',
          'Email support'
        ],
        isActive: true
      }
    });

    // Professional Plan - Medium businesses
    const professionalPlan = await prisma.plan.create({
      data: {
        name: 'Professional',
        price: 7900, // €79.00 per month in cents
        currency: 'EUR',
        maxEmployees: 50,
        maxPayrolls: 50, // More flexible payroll runs
        features: [
          'Up to 50 employees',
          'Unlimited payroll processing',
          'Advanced tax calculations',
          'Employee self-service portal',
          'Advanced reporting & analytics',
          'Leave management',
          'Expense tracking',
          'Priority email support',
          'Phone support'
        ],
        isActive: true
      }
    });

    // Enterprise Plan - Large businesses
    const enterprisePlan = await prisma.plan.create({
      data: {
        name: 'Enterprise',
        price: 19900, // €199.00 per month in cents
        currency: 'EUR',
        maxEmployees: null, // Unlimited
        maxPayrolls: null, // Unlimited
        features: [
          'Unlimited employees',
          'Unlimited payroll processing',
          'Advanced tax calculations',
          'Employee self-service portal',
          'Advanced reporting & analytics',
          'Leave management',
          'Expense tracking',
          'Multi-company support',
          'API access',
          'Custom integrations',
          'Dedicated account manager',
          '24/7 priority support'
        ],
        isActive: true
      }
    });

    console.log('\n✅ Successfully created subscription plans:');
    console.log(`📦 Starter Plan: €29/month (ID: ${starterPlan.id})`);
    console.log(`📦 Professional Plan: €79/month (ID: ${professionalPlan.id})`);
    console.log(`📦 Enterprise Plan: €199/month (ID: ${enterprisePlan.id})`);

    console.log('\n🎯 Plan Summary:');
    console.log('Starter: €29/month - Up to 10 employees, basic features');
    console.log('Professional: €79/month - Up to 50 employees, advanced features');
    console.log('Enterprise: €199/month - Unlimited employees, premium features');

  } catch (error) {
    console.error('Error creating subscription plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSubscriptionPlans();
