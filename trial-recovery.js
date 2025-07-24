/**
 * Trial Recovery Script
 * 
 * This script creates missing trial subscriptions for companies that don't have any subscription.
 * This fixes the issue where companies were created but trial activation failed.
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

async function recoverMissingTrials() {
  const authClient = new PrismaClient({
    datasources: { db: { url: process.env.AUTH_DATABASE_URL } }
  });

  try {
    console.log('🔧 Starting trial recovery for companies without subscriptions...');

    // Step 1: Find companies without subscriptions
    const companiesWithoutSubscriptions = await authClient.company.findMany({
      where: {
        Subscription: null
      },
      include: {
        UserCompany: {
          include: {
            User: {
              select: { id: true, email: true, name: true }
            }
          }
        }
      }
    });

    if (companiesWithoutSubscriptions.length === 0) {
      console.log('✅ No companies found without subscriptions. All good!');
      return;
    }

    console.log(`📊 Found ${companiesWithoutSubscriptions.length} companies without subscriptions:`);
    companiesWithoutSubscriptions.forEach(company => {
      const owner = company.UserCompany.find(uc => uc.role === 'owner')?.User;
      console.log(`  - ${company.name} (${company.id}) - Owner: ${owner?.email || 'Unknown'}`);
    });

    // Step 2: Get the canonical trial plan
    const trialPlan = await authClient.plan.findFirst({
      where: { 
        name: "Free Trial",
        isActive: true 
      }
    });

    if (!trialPlan) {
      console.error('❌ No "Free Trial" plan found. Please run the trial plan naming fix first.');
      return;
    }

    console.log(`✅ Using trial plan: "${trialPlan.name}" (${trialPlan.id})`);

    // Step 3: Create trial subscriptions for each company
    let successCount = 0;
    let errorCount = 0;

    for (const company of companiesWithoutSubscriptions) {
      try {
        console.log(`\n🎯 Creating trial subscription for: ${company.name}`);
        
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

        const subscription = await authClient.subscription.create({
          data: {
            companyId: company.id,
            planId: trialPlan.id,
            status: "trialing",
            stripeSubscriptionId: null,
            stripeCustomerId: null,
            currentPeriodStart: now,
            currentPeriodEnd: trialEnd,
            cancelAtPeriodEnd: false,
            trialEnd: trialEnd,
            isTrialActive: true,
            trialStart: now,
            trialExtensions: 0
          }
        });

        console.log(`✅ Trial subscription created: ${subscription.id}`);
        console.log(`📅 Trial period: ${subscription.trialStart} to ${subscription.trialEnd}`);
        
        successCount++;

      } catch (error) {
        console.error(`❌ Failed to create trial for ${company.name}:`, error.message);
        errorCount++;
      }
    }

    // Step 4: Summary
    console.log('\n📊 Trial Recovery Summary:');
    console.log(`✅ Successful recoveries: ${successCount}`);
    console.log(`❌ Failed recoveries: ${errorCount}`);
    console.log(`📈 Total companies processed: ${companiesWithoutSubscriptions.length}`);

    if (successCount > 0) {
      console.log('\n🎉 Trial recovery completed! Companies now have active trial subscriptions.');
    }

    if (errorCount > 0) {
      console.log('\n⚠️ Some recoveries failed. Please check the errors above and retry if needed.');
    }

    // Step 5: Verify the results
    const remainingCompaniesWithoutSubscriptions = await authClient.company.count({
      where: {
        Subscription: null
      }
    });

    console.log(`\n🔍 Verification: ${remainingCompaniesWithoutSubscriptions} companies still without subscriptions`);

    if (remainingCompaniesWithoutSubscriptions === 0) {
      console.log('🎯 Perfect! All companies now have subscriptions.');
    }

  } catch (error) {
    console.error('❌ Error during trial recovery:', error);
    throw error;
  } finally {
    await authClient.$disconnect();
  }
}

// Run the recovery
if (require.main === module) {
  recoverMissingTrials()
    .then(() => {
      console.log('✅ Trial recovery script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Trial recovery script failed:', error);
      process.exit(1);
    });
}

module.exports = { recoverMissingTrials };

