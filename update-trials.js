const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateExistingTrials() {
  try {
    // Find all subscriptions with status 'trialing' but missing trial fields
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'trialing',
        isTrialActive: false // These need to be updated
      }
    });

    console.log(`Found ${subscriptions.length} subscriptions to update`);

    for (const subscription of subscriptions) {
      const now = new Date();
      const trialStart = subscription.currentPeriodStart;
      const trialEnd = subscription.trialEnd || new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          isTrialActive: true,
          trialStart: trialStart,
          trialEnd: trialEnd,
          trialExtensions: 0
        }
      });

      console.log(`Updated subscription ${subscription.id} for company ${subscription.companyId}`);
    }

    console.log('All subscriptions updated successfully!');
  } catch (error) {
    console.error('Error updating subscriptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingTrials();
