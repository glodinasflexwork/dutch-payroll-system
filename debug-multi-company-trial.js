const { PrismaClient } = require('@prisma/client');

// Initialize Prisma clients for different databases
const authClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/auth_db'
    }
  }
});

const hrClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.HR_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/hr_db'
    }
  }
});

async function investigateMultiCompanyTrial() {
  console.log('🔍 INVESTIGATING MULTI-COMPANY TRIAL ISSUE\n');

  try {
    // 1. Get all users and their companies
    console.log('1. USERS AND THEIR COMPANIES:');
    const users = await authClient.user.findMany({
      include: {
        UserCompany: {
          include: {
            Company: {
              include: {
                Subscription: true
              }
            }
          }
        }
      }
    });

    for (const user of users) {
      console.log(`\n👤 User: ${user.email} (ID: ${user.id})`);
      console.log(`   Companies (${user.UserCompany.length}):`);
      
      for (const userCompany of user.UserCompany) {
        const company = userCompany.Company;
        const subscription = company.Subscription;
        
        console.log(`   📊 ${company.name} (ID: ${company.id})`);
        console.log(`      Role: ${userCompany.role}`);
        console.log(`      Created: ${company.createdAt}`);
        
        if (subscription) {
          console.log(`      💳 Subscription:`);
          console.log(`         Status: ${subscription.status}`);
          console.log(`         Plan: ${subscription.planId}`);
          console.log(`         Trial Start: ${subscription.trialStart}`);
          console.log(`         Trial End: ${subscription.trialEnd}`);
          console.log(`         Is Trial Active: ${subscription.isTrialActive}`);
          console.log(`         Current Period: ${subscription.currentPeriodStart} to ${subscription.currentPeriodEnd}`);
        } else {
          console.log(`      ❌ No subscription found`);
        }
      }
    }

    // 2. Check which companies have active trials
    console.log('\n\n2. COMPANIES WITH ACTIVE TRIALS:');
    const companiesWithTrials = await authClient.company.findMany({
      where: {
        Subscription: {
          status: 'trialing',
          isTrialActive: true
        }
      },
      include: {
        Subscription: true,
        UserCompany: {
          include: {
            User: true
          }
        }
      }
    });

    if (companiesWithTrials.length === 0) {
      console.log('❌ No companies with active trials found');
    } else {
      for (const company of companiesWithTrials) {
        console.log(`\n✅ ${company.name} (ID: ${company.id})`);
        console.log(`   Trial: ${company.Subscription.trialStart} to ${company.Subscription.trialEnd}`);
        console.log(`   Users with access:`);
        for (const userCompany of company.UserCompany) {
          console.log(`     - ${userCompany.User.email} (${userCompany.role})`);
        }
      }
    }

    // 3. Check the specific user mentioned in the context
    console.log('\n\n3. SPECIFIC USER ANALYSIS (cihatkaya@glodinas.nl):');
    const specificUser = await authClient.user.findUnique({
      where: { email: 'cihatkaya@glodinas.nl' },
      include: {
        UserCompany: {
          include: {
            Company: {
              include: {
                Subscription: true
              }
            }
          }
        }
      }
    });

    if (specificUser) {
      console.log(`👤 User: ${specificUser.email}`);
      console.log(`   Total companies: ${specificUser.UserCompany.length}`);
      
      // Sort companies by creation date to identify the first company
      const sortedCompanies = specificUser.UserCompany.sort((a, b) => 
        new Date(a.Company.createdAt) - new Date(b.Company.createdAt)
      );

      console.log('\n   Companies (sorted by creation date):');
      sortedCompanies.forEach((userCompany, index) => {
        const company = userCompany.Company;
        const isFirst = index === 0;
        
        console.log(`   ${isFirst ? '🥇' : '📊'} ${company.name} (${isFirst ? 'FIRST COMPANY' : 'Additional'})`);
        console.log(`      Created: ${company.createdAt}`);
        console.log(`      Role: ${userCompany.role}`);
        
        if (company.Subscription) {
          console.log(`      💳 Subscription Status: ${company.Subscription.status}`);
          console.log(`      💳 Trial Active: ${company.Subscription.isTrialActive}`);
          console.log(`      💳 Trial Period: ${company.Subscription.trialStart} to ${company.Subscription.trialEnd}`);
        } else {
          console.log(`      ❌ No subscription`);
        }
      });

      // Check if only the first company has trial access
      const firstCompany = sortedCompanies[0]?.Company;
      const hasTrialOnFirstOnly = firstCompany?.Subscription?.isTrialActive && 
        sortedCompanies.slice(1).every(uc => !uc.Company.Subscription?.isTrialActive);

      if (hasTrialOnFirstOnly) {
        console.log('\n🎯 ISSUE IDENTIFIED: Trial access is only available on the FIRST company created!');
        console.log(`   First company with trial: ${firstCompany.name}`);
        console.log(`   Other companies without trial: ${sortedCompanies.slice(1).map(uc => uc.Company.name).join(', ')}`);
      }
    } else {
      console.log('❌ User cihatkaya@glodinas.nl not found');
    }

    // 4. Check current session/company context (if available)
    console.log('\n\n4. CHECKING FOR CURRENT COMPANY CONTEXT:');
    // This would typically come from session data, but we'll check the most recent activity
    
    console.log('✅ Investigation complete!');

  } catch (error) {
    console.error('❌ Error during investigation:', error);
  } finally {
    await authClient.$disconnect();
    await hrClient.$disconnect();
  }
}

// Run the investigation
investigateMultiCompanyTrial();

