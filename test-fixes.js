/**
 * Test Script for Trial Logic and Multi-Company Bug Fixes
 * 
 * This script tests the fixes implemented for:
 * 1. Trial plan naming and activation
 * 2. Subscription validation logic
 * 3. Company context management
 * 4. Employee creation workflow
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

async function testFixes() {
  const authClient = new PrismaClient({
    datasources: { db: { url: process.env.AUTH_DATABASE_URL } }
  });

  const hrClient = new PrismaClient({
    datasources: { db: { url: process.env.HR_DATABASE_URL } }
  });

  try {
    console.log('🧪 Starting comprehensive fix testing...\n');

    // Test 1: Trial Plan Naming Consistency
    console.log('=== TEST 1: Trial Plan Naming Consistency ===');
    
    const trialPlans = await authClient.plan.findMany({
      where: {
        OR: [
          { name: { contains: 'trial', mode: 'insensitive' } },
          { name: { contains: 'free', mode: 'insensitive' } }
        ]
      }
    });

    console.log(`Found ${trialPlans.length} trial-related plans:`);
    trialPlans.forEach(plan => {
      console.log(`  - "${plan.name}" (Active: ${plan.isActive}, ID: ${plan.id})`);
    });

    const canonicalTrialPlan = trialPlans.find(p => p.name === "Free Trial" && p.isActive);
    if (canonicalTrialPlan) {
      console.log(`✅ Canonical "Free Trial" plan found: ${canonicalTrialPlan.id}`);
    } else {
      console.log(`❌ No canonical "Free Trial" plan found`);
    }

    // Test 2: Subscription Coverage
    console.log('\n=== TEST 2: Subscription Coverage ===');
    
    const totalCompanies = await authClient.company.count();
    const companiesWithSubscriptions = await authClient.company.count({
      where: {
        Subscription: {
          isNot: null
        }
      }
    });

    console.log(`Total companies: ${totalCompanies}`);
    console.log(`Companies with subscriptions: ${companiesWithSubscriptions}`);
    console.log(`Coverage: ${((companiesWithSubscriptions / totalCompanies) * 100).toFixed(1)}%`);

    if (companiesWithSubscriptions === totalCompanies) {
      console.log(`✅ All companies have subscriptions`);
    } else {
      console.log(`⚠️ ${totalCompanies - companiesWithSubscriptions} companies missing subscriptions`);
    }

    // Test 3: Trial Status Validation
    console.log('\n=== TEST 3: Trial Status Validation ===');
    
    const activeTrials = await authClient.subscription.findMany({
      where: {
        status: 'trialing',
        isTrialActive: true,
        trialEnd: {
          gte: new Date()
        }
      },
      include: {
        Company: { select: { name: true } },
        Plan: { select: { name: true } }
      }
    });

    console.log(`Active trials found: ${activeTrials.length}`);
    activeTrials.forEach(trial => {
      const daysRemaining = Math.ceil((trial.trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      console.log(`  - ${trial.Company.name}: ${daysRemaining} days remaining (Plan: ${trial.Plan.name})`);
    });

    // Test 4: User-Company Relationships
    console.log('\n=== TEST 4: User-Company Relationships ===');
    
    const usersWithMultipleCompanies = await authClient.user.findMany({
      include: {
        UserCompany: {
          include: {
            Company: { select: { name: true } }
          }
        }
      }
    });

    const multiCompanyUsers = usersWithMultipleCompanies.filter(user => user.UserCompany.length > 1);
    console.log(`Users with multiple companies: ${multiCompanyUsers.length}`);
    
    multiCompanyUsers.forEach(user => {
      console.log(`  - ${user.email}: ${user.UserCompany.length} companies`);
      console.log(`    Current companyId: ${user.companyId || 'null'}`);
      user.UserCompany.forEach(uc => {
        console.log(`    - ${uc.Company.name} (${uc.role}, Active: ${uc.isActive})`);
      });
    });

    // Test 5: Feature Mapping Test
    console.log('\n=== TEST 5: Feature Mapping Test ===');
    
    const plansWithFeatures = await authClient.plan.findMany({
      where: {
        features: {
          not: null
        }
      }
    });

    console.log(`Plans with features: ${plansWithFeatures.length}`);
    plansWithFeatures.forEach(plan => {
      console.log(`  - ${plan.name}: ${JSON.stringify(plan.features)}`);
    });

    // Test 6: API Endpoint Test (simulate subscription validation)
    console.log('\n=== TEST 6: Subscription Validation Logic Test ===');
    
    // Test the subscription validation logic directly
    const testCompany = await authClient.company.findFirst({
      include: {
        Subscription: {
          include: { Plan: true }
        }
      }
    });

    if (testCompany) {
      console.log(`Testing subscription validation for: ${testCompany.name}`);
      
      if (testCompany.Subscription) {
        const subscription = testCompany.Subscription;
        const now = new Date();
        
        // Test unified trial status checking
        const statusTrialing = subscription.status === 'trialing';
        const flagActive = subscription.isTrialActive === true;
        const withinPeriod = subscription.trialEnd ? now <= subscription.trialEnd : false;
        const trialActive = statusTrialing && flagActive && withinPeriod;
        
        console.log(`  Status: ${subscription.status}`);
        console.log(`  Trial Active Flag: ${subscription.isTrialActive}`);
        console.log(`  Trial End: ${subscription.trialEnd}`);
        console.log(`  Computed Trial Active: ${trialActive}`);
        
        if (trialActive) {
          console.log(`  ✅ Trial is properly active`);
        } else {
          console.log(`  ⚠️ Trial status needs attention`);
        }
      } else {
        console.log(`  ❌ No subscription found for test company`);
      }
    }

    // Test 7: HR Database Connectivity
    console.log('\n=== TEST 7: HR Database Connectivity ===');
    
    try {
      const hrEmployeeCount = await hrClient.employee.count();
      console.log(`✅ HR database accessible - ${hrEmployeeCount} employees found`);
    } catch (hrError) {
      console.log(`❌ HR database connection failed:`, hrError.message);
    }

    console.log('\n🎉 Fix testing completed!');

    // Summary
    console.log('\n=== SUMMARY ===');
    console.log(`✅ Trial plan naming: ${canonicalTrialPlan ? 'FIXED' : 'NEEDS ATTENTION'}`);
    console.log(`✅ Subscription coverage: ${companiesWithSubscriptions === totalCompanies ? 'COMPLETE' : 'INCOMPLETE'}`);
    console.log(`✅ Active trials: ${activeTrials.length} found`);
    console.log(`✅ Multi-company users: ${multiCompanyUsers.length} identified`);
    console.log(`✅ Feature mapping: ${plansWithFeatures.length} plans configured`);

  } catch (error) {
    console.error('❌ Error during testing:', error);
    throw error;
  } finally {
    await authClient.$disconnect();
    await hrClient.$disconnect();
  }
}

// Run the tests
if (require.main === module) {
  testFixes()
    .then(() => {
      console.log('✅ All tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testFixes };

