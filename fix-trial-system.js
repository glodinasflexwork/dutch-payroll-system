const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function fixTrialSystem() {
  const authClient = new PrismaClient({
    datasources: { db: { url: process.env.AUTH_DATABASE_URL } }
  });

  try {
    console.log('🔧 Fixing trial system...');

    // Check if user has a trial subscription
    const user = await authClient.user.findUnique({
      where: { email: 'glodinas@icloud.com' },
      include: {
        UserCompany: {
          include: {
            Company: {
              include: {
                Subscription: {
                  include: { Plan: true }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`Found user: ${user.email}`);
    console.log(`Company relationships: ${user.UserCompany.length}`);

    // Get the Free Trial plan
    const freeTrialPlan = await authClient.plan.findFirst({
      where: { name: 'Free Trial' }
    });

    if (!freeTrialPlan) {
      console.log('❌ Free Trial plan not found');
      return;
    }

    // Check each company's subscription
    for (const userCompany of user.UserCompany) {
      const company = userCompany.Company;
      console.log(`\nCompany: ${company.name}`);
      console.log(`Company ID: ${company.id}`);
      console.log(`Subscription array:`, company.Subscription);
      
      if (!company.Subscription) {
        // Create trial subscription for company without subscription
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 days from now

        const subscription = await authClient.subscription.create({
          data: {
            companyId: company.id,
            planId: freeTrialPlan.id,
            status: 'trialing',
            trialStart: new Date(),
            trialEnd: trialEndDate,
            currentPeriodStart: new Date(),
            currentPeriodEnd: trialEndDate
          }
        });

        console.log(`✅ Created trial subscription ending ${trialEndDate.toDateString()}`);
      } else {
        const subscription = company.Subscription; // It's an object, not an array
        console.log(`Current subscription status: ${subscription.status}`);
        console.log(`Plan ID: ${subscription.planId}`);
        console.log(`Trial end: ${subscription.trialEnd}`);
        console.log(`Trial active: ${subscription.isTrialActive}`);
        
        if (subscription.Plan) {
          console.log(`Plan name: ${subscription.Plan.name}`);
        }
        
        // Check if trial is still active
        if (subscription.status === 'trialing' && subscription.trialEnd) {
          const trialEndDate = new Date(subscription.trialEnd);
          const now = new Date();
          const daysRemaining = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));
          
          console.log(`✅ Trial is active with ${daysRemaining} days remaining`);
        }
      }
    }

    console.log('\n🎉 Trial system fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing trial system:', error);
  } finally {
    await authClient.$disconnect();
  }
}

fixTrialSystem();

