const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function fixSubscriptionData() {
  const authClient = new PrismaClient({
    datasources: { db: { url: process.env.AUTH_DATABASE_URL } }
  });

  try {
    console.log('🔧 Fixing subscription plan data...');

    // Get existing plans
    const existingPlans = await authClient.plan.findMany();
    console.log(`Found ${existingPlans.length} existing plans`);

    // Update existing plans or create new ones
    const correctPlans = [
      {
        name: 'Free Trial',
        price: 0, // €0
        maxEmployees: 10,
        maxPayrolls: 12, // 12 payrolls per year
        features: [
          'Up to 10 employees',
          'Basic payroll processing',
          'Employee self-service portal',
          'Tax compliance & reporting',
          'Email support',
          'Mobile app access'
        ],
        stripeProductId: null,
        stripePriceId: null,
        isActive: true
      },
      {
        name: 'Starter',
        price: 2900, // €29.00 in cents
        maxEmployees: 10,
        maxPayrolls: 12, // 12 payrolls per year
        features: [
          'Up to 10 employees',
          'Basic payroll processing',
          'Employee self-service portal',
          'Tax compliance & reporting',
          'Email support',
          'Mobile app access'
        ],
        stripeProductId: process.env.STRIPE_PRODUCT_ID_STARTER || null,
        stripePriceId: process.env.STRIPE_PRICE_ID_STARTER || null,
        isActive: true
      },
      {
        name: 'Professional',
        price: 3900, // €39.00 in cents
        maxEmployees: 100,
        maxPayrolls: 12, // 12 payrolls per year
        features: [
          'Up to 100 employees',
          'Everything in Starter',
          'Advanced reporting & analytics',
          'API access & integrations',
          'Priority support',
          'Custom workflows'
        ],
        stripeProductId: process.env.STRIPE_PRODUCT_ID_PROFESSIONAL || null,
        stripePriceId: process.env.STRIPE_PRICE_ID_PROFESSIONAL || null,
        isActive: true
      },
      {
        name: 'Enterprise',
        price: 0, // Custom pricing
        maxEmployees: -1, // Unlimited
        maxPayrolls: -1, // Unlimited
        features: [
          'Unlimited employees',
          'Everything in Professional',
          'Multi-company management',
          'Dedicated account manager',
          'Custom integrations',
          '24/7 phone support'
        ],
        stripeProductId: process.env.STRIPE_PRODUCT_ID_ENTERPRISE || null,
        stripePriceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || null,
        isActive: true
      }
    ];

    // Update or create plans
    for (const planData of correctPlans) {
      const existingPlan = existingPlans.find(p => p.name === planData.name);
      
      if (existingPlan) {
        // Update existing plan
        const updated = await authClient.plan.update({
          where: { id: existingPlan.id },
          data: planData
        });
        console.log(`✅ Updated plan: ${updated.name} - €${updated.price / 100}`);
      } else {
        // Create new plan
        const created = await authClient.plan.create({ data: planData });
        console.log(`✅ Created plan: ${created.name} - €${created.price / 100}`);
      }
    }

    // Deactivate any plans not in our correct list
    const correctPlanNames = correctPlans.map(p => p.name);
    for (const existingPlan of existingPlans) {
      if (!correctPlanNames.includes(existingPlan.name)) {
        await authClient.plan.update({
          where: { id: existingPlan.id },
          data: { isActive: false }
        });
        console.log(`⚠️ Deactivated plan: ${existingPlan.name}`);
      }
    }

    console.log('\n🎉 Subscription data fixed successfully!');
    
    // Verify the fix
    console.log('\n=== UPDATED PLANS ===');
    const updatedPlans = await authClient.plan.findMany();
    updatedPlans.forEach(plan => {
      console.log(`${plan.name}: €${plan.price / 100}, ${plan.maxEmployees === -1 ? 'Unlimited' : plan.maxEmployees} employees`);
    });

  } catch (error) {
    console.error('❌ Error fixing subscription data:', error);
  } finally {
    await authClient.$disconnect();
  }
}

fixSubscriptionData();

