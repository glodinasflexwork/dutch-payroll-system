require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL
    }
  }
});

async function createTrialPlan() {
  try {
    console.log('🔧 Creating default trial plan...');
    
    const trialPlan = await prisma.plan.create({
      data: {
        name: "Free Trial",
        stripePriceId: null, // No Stripe for trial
        stripeProductId: null,
        maxEmployees: 10,
        maxPayrolls: null, // Unlimited during trial
        features: {
          "employee_management": true,
          "payroll_processing": true,
          "tax_calculations": true,
          "reports": true,
          "email_support": true,
          "api_access": false,
          "advanced_reports": false,
          "priority_support": false
        },
        price: 0.00,
        currency: "EUR",
        isActive: true
      }
    });
    
    console.log('✅ Trial plan created successfully:');
    console.log(`- ID: ${trialPlan.id}`);
    console.log(`- Name: ${trialPlan.name}`);
    console.log(`- Max Employees: ${trialPlan.maxEmployees}`);
    console.log(`- Price: €${trialPlan.price}`);
    
    // Also create a basic paid plan for future use
    const basicPlan = await prisma.plan.create({
      data: {
        name: "Basic Plan",
        stripePriceId: null, // Will be set when Stripe is configured
        stripeProductId: null,
        maxEmployees: 25,
        maxPayrolls: null,
        features: {
          "employee_management": true,
          "payroll_processing": true,
          "tax_calculations": true,
          "reports": true,
          "email_support": true,
          "api_access": true,
          "advanced_reports": true,
          "priority_support": false
        },
        price: 29.99,
        currency: "EUR",
        isActive: true
      }
    });
    
    console.log('✅ Basic plan created successfully:');
    console.log(`- ID: ${basicPlan.id}`);
    console.log(`- Name: ${basicPlan.name}`);
    console.log(`- Max Employees: ${basicPlan.maxEmployees}`);
    console.log(`- Price: €${basicPlan.price}`);
    
  } catch (error) {
    console.error('❌ Error creating plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTrialPlan();
