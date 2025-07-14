require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL
    }
  }
});

async function testCompanyCreation() {
  try {
    console.log('🔍 Testing company creation logic...');
    
    // Simulate the company creation transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the company
      const company = await tx.company.create({
        data: {
          name: "Test Company B.V.",
          address: "Test Street 123",
          city: "Amsterdam",
          postalCode: "1012AB",
          kvkNumber: "12345678",
          industry: "Technology & Software",
          isDGA: true,
          isActive: true
        }
      })

      console.log('✅ Company created:', company.name);

      // Get the trial plan
      const trialPlan = await tx.plan.findFirst({
        where: { 
          name: "Free Trial",
          isActive: true 
        }
      })

      if (!trialPlan) {
        throw new Error("Trial plan not found")
      }

      console.log('✅ Trial plan found:', trialPlan.name);

      // Start trial subscription
      const subscription = await tx.subscription.create({
        data: {
          companyId: company.id,
          planId: trialPlan.id,
          status: "trialing",
          stripeSubscriptionId: null,
          stripeCustomerId: null,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          cancelAtPeriodEnd: false,
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          isTrialActive: true,
          trialStart: new Date(),
          trialExtensions: 0
        }
      })

      console.log('✅ Subscription created:', subscription.status);

      return { company, subscription, trialPlan }
    });

    console.log('🎉 Company creation test SUCCESSFUL!');
    console.log('- Company ID:', result.company.id);
    console.log('- Subscription Status:', result.subscription.status);
    console.log('- Trial Days:', Math.ceil((result.subscription.trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    
    // Clean up test data
    await prisma.subscription.delete({ where: { id: result.subscription.id } });
    await prisma.company.delete({ where: { id: result.company.id } });
    console.log('🧹 Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Company creation test FAILED:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompanyCreation();
