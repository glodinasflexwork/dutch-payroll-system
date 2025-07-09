const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTrialForExistingCompany() {
  try {
    // Find the company
    const company = await prisma.company.findFirst({
      where: { name: 'Glodinas Finance B.V.' }
    });

    if (!company) {
      console.log('Company not found');
      return;
    }

    console.log(`Found company: ${company.name} (${company.id})`);

    // Check if trial plan exists
    let trialPlan = await prisma.plan.findFirst({
      where: { name: 'Trial Plan' }
    });

    if (!trialPlan) {
      console.log('Creating trial plan...');
      trialPlan = await prisma.plan.create({
        data: {
          name: 'Trial Plan',
          price: 0,
          currency: 'EUR',
          features: ['All features included'],
          maxEmployees: 999,
          maxPayrolls: 999,
          isActive: true
        }
      });
    }

    console.log(`Using trial plan: ${trialPlan.name} (${trialPlan.id})`);

    // Create trial subscription
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

    const subscription = await prisma.subscription.create({
      data: {
        companyId: company.id,
        planId: trialPlan.id,
        status: 'trialing',
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
        trialEnd: trialEnd,
        isTrialActive: true,
        trialStart: now,
        trialExtensions: 0,
        cancelAtPeriodEnd: false
      }
    });

    console.log(`Created trial subscription: ${subscription.id}`);
    console.log(`Trial active until: ${trialEnd}`);
    console.log('Trial creation successful!');

  } catch (error) {
    console.error('Error creating trial:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTrialForExistingCompany();
