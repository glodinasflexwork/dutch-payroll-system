/**
 * Fix Trial Plan Naming Inconsistencies
 * 
 * This script standardizes all trial plan names to "Free Trial" and ensures
 * proper trial plan configuration for reliable trial activation.
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

async function fixTrialPlanNaming() {
  const authClient = new PrismaClient({
    datasources: { db: { url: process.env.AUTH_DATABASE_URL } }
  });

  try {
    console.log('🔧 Starting trial plan naming fix...');

    // Step 1: Find all existing trial plans with various names
    const existingTrialPlans = await authClient.plan.findMany({
      where: {
        OR: [
          { name: { contains: 'trial', mode: 'insensitive' } },
          { name: { contains: 'Trial', mode: 'insensitive' } },
          { name: { contains: 'TRIAL', mode: 'insensitive' } },
          { name: { contains: 'free', mode: 'insensitive' } },
          { name: { contains: 'Free', mode: 'insensitive' } },
          { name: { contains: 'FREE', mode: 'insensitive' } }
        ]
      },
      include: {
        Subscription: {
          select: { id: true, companyId: true }
        }
      }
    });

    console.log(`📊 Found ${existingTrialPlans.length} potential trial plans:`);
    existingTrialPlans.forEach(plan => {
      console.log(`  - "${plan.name}" (ID: ${plan.id}, Active: ${plan.isActive}, Subscriptions: ${plan.Subscription.length})`);
    });

    // Step 2: Identify the canonical trial plan or create one
    let canonicalTrialPlan = await authClient.plan.findFirst({
      where: { 
        name: "Free Trial",
        isActive: true 
      }
    });

    if (!canonicalTrialPlan) {
      console.log('📝 Creating canonical "Free Trial" plan...');
      
      canonicalTrialPlan = await authClient.plan.create({
        data: {
          name: "Free Trial",
          description: "14-day free trial with full access to all features",
          price: 0,
          currency: "EUR",
          interval: "month",
          features: [
            "employees",
            "payroll", 
            "leave_management",
            "time_tracking",
            "reporting",
            "multi_company",
            "priority_support"
          ],
          maxEmployees: 999,
          maxPayrolls: 999,
          isActive: true
        }
      });
      
      console.log(`✅ Created canonical trial plan: ${canonicalTrialPlan.id}`);
    } else {
      console.log(`✅ Found existing canonical trial plan: ${canonicalTrialPlan.id}`);
    }

    // Step 3: Migrate subscriptions from other trial plans to canonical plan
    let migratedSubscriptions = 0;
    
    for (const plan of existingTrialPlans) {
      if (plan.id === canonicalTrialPlan.id) {
        continue; // Skip the canonical plan
      }

      if (plan.Subscription.length > 0) {
        console.log(`🔄 Migrating ${plan.Subscription.length} subscriptions from "${plan.name}" to "Free Trial"`);
        
        // Update all subscriptions to use the canonical trial plan
        const updateResult = await authClient.subscription.updateMany({
          where: { planId: plan.id },
          data: { planId: canonicalTrialPlan.id }
        });
        
        migratedSubscriptions += updateResult.count;
        console.log(`  ✅ Migrated ${updateResult.count} subscriptions`);
      }
    }

    // Step 4: Deactivate or remove duplicate trial plans
    const duplicatePlans = existingTrialPlans.filter(plan => 
      plan.id !== canonicalTrialPlan.id && 
      plan.name !== "Free Trial"
    );

    for (const plan of duplicatePlans) {
      if (plan.Subscription.length === 0) {
        // Safe to delete plans with no subscriptions
        await authClient.plan.delete({
          where: { id: plan.id }
        });
        console.log(`🗑️ Deleted unused trial plan: "${plan.name}"`);
      } else {
        // Deactivate plans that still have subscriptions (shouldn't happen after migration)
        await authClient.plan.update({
          where: { id: plan.id },
          data: { 
            isActive: false,
            name: `${plan.name} (DEPRECATED)`
          }
        });
        console.log(`⚠️ Deactivated trial plan with remaining subscriptions: "${plan.name}"`);
      }
    }

    // Step 5: Verify the fix
    const finalTrialPlan = await authClient.plan.findFirst({
      where: { 
        name: "Free Trial",
        isActive: true 
      },
      include: {
        Subscription: {
          select: { id: true, companyId: true, status: true }
        }
      }
    });

    console.log('\n📊 Final verification:');
    console.log(`✅ Canonical trial plan: "${finalTrialPlan?.name}" (ID: ${finalTrialPlan?.id})`);
    console.log(`📈 Total subscriptions using canonical plan: ${finalTrialPlan?.Subscription.length || 0}`);
    console.log(`🔄 Total subscriptions migrated: ${migratedSubscriptions}`);

    // Step 6: Check for companies without subscriptions
    const companiesWithoutSubscriptions = await authClient.company.findMany({
      where: {
        Subscription: null
      },
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });

    if (companiesWithoutSubscriptions.length > 0) {
      console.log(`\n⚠️ Found ${companiesWithoutSubscriptions.length} companies without subscriptions:`);
      companiesWithoutSubscriptions.forEach(company => {
        console.log(`  - ${company.name} (${company.id}) - Created: ${company.createdAt}`);
      });
      
      console.log('\n💡 Consider running the trial recovery script to create missing trial subscriptions.');
    }

    console.log('\n🎉 Trial plan naming fix completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing trial plan naming:', error);
    throw error;
  } finally {
    await authClient.$disconnect();
  }
}

// Run the fix
if (require.main === module) {
  fixTrialPlanNaming()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixTrialPlanNaming };

