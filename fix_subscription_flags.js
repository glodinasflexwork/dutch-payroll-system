const { PrismaClient } = require('@prisma/client');

async function fixSubscription() {
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  try {
    console.log('=== FIXING SUBSCRIPTION FLAGS ===');
    
    // Find the company
    const company = await authClient.company.findFirst({
      where: { name: 'Glodinas Finance B.V.' },
      include: { Subscription: true }
    });

    if (!company) {
      console.log('❌ Company not found');
      return;
    }

    console.log('Found company:', company.name);
    console.log('Current subscription:', company.Subscription);

    // Update subscription with proper flags
    const updatedSubscription = await authClient.subscription.update({
      where: { companyId: company.id },
      data: {
        status: 'active',
        isTrialActive: false,  // Not trial, it's paid subscription
        currentPeriodStart: new Date('2025-08-31'),
        currentPeriodEnd: new Date('2026-08-31'),
        cancelAtPeriodEnd: false
      }
    });

    console.log('✅ Updated subscription:', updatedSubscription);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await authClient.$disconnect();
  }
}

fixSubscription();
