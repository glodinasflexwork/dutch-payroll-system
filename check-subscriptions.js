const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSubscriptions() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        Company: { select: { name: true } },
        Plan: { select: { name: true } }
      }
    });

    console.log(`Found ${subscriptions.length} total subscriptions:`);
    
    for (const sub of subscriptions) {
      console.log(`\nSubscription ID: ${sub.id}`);
      console.log(`Company: ${sub.Company.name} (${sub.companyId})`);
      console.log(`Plan: ${sub.Plan.name}`);
      console.log(`Status: ${sub.status}`);
      console.log(`Trial Active: ${sub.isTrialActive}`);
      console.log(`Trial Start: ${sub.trialStart}`);
      console.log(`Trial End: ${sub.trialEnd}`);
      console.log(`Current Period: ${sub.currentPeriodStart} to ${sub.currentPeriodEnd}`);
    }
  } catch (error) {
    console.error('Error checking subscriptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubscriptions();
