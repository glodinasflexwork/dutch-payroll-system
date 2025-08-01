const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client for auth database
const authClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/auth_db'
    }
  }
});

async function checkSessionCompany() {
  console.log('🔍 CHECKING SESSION COMPANY ISSUE\n');

  try {
    // The session companyId from the browser console
    const sessionCompanyId = 'cmdc3brge0003o4f9rzjiodzm';
    
    console.log(`1. CHECKING SESSION COMPANY ID: ${sessionCompanyId}`);
    
    // Check if this company exists and has a subscription
    const sessionCompany = await authClient.company.findUnique({
      where: { id: sessionCompanyId },
      include: {
        Subscription: true,
        UserCompany: {
          include: {
            User: true
          }
        }
      }
    });

    if (sessionCompany) {
      console.log(`✅ Company found: ${sessionCompany.name}`);
      console.log(`   Created: ${sessionCompany.createdAt}`);
      console.log(`   Users:`);
      sessionCompany.UserCompany.forEach(uc => {
        console.log(`     - ${uc.User.email} (${uc.role})`);
      });
      
      if (sessionCompany.Subscription) {
        console.log(`   💳 Subscription:`);
        console.log(`      Status: ${sessionCompany.Subscription.status}`);
        console.log(`      Trial Active: ${sessionCompany.Subscription.isTrialActive}`);
        console.log(`      Trial Period: ${sessionCompany.Subscription.trialStart} to ${sessionCompany.Subscription.trialEnd}`);
      } else {
        console.log(`   ❌ NO SUBSCRIPTION FOUND - This is the problem!`);
      }
    } else {
      console.log(`❌ Company with ID ${sessionCompanyId} not found!`);
    }

    console.log('\n2. COMPARING WITH COMPANIES THAT HAVE TRIALS:');
    
    // Get all companies with active trials for the user
    const user = await authClient.user.findUnique({
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

    if (user) {
      console.log(`👤 User: ${user.email}`);
      console.log(`   Current session companyId: ${sessionCompanyId}`);
      console.log(`   User's companyId field: ${user.companyId}`);
      
      console.log('\n   All user companies:');
      user.UserCompany.forEach(uc => {
        const company = uc.Company;
        const isSessionCompany = company.id === sessionCompanyId;
        const hasActiveTrial = company.Subscription?.isTrialActive;
        
        console.log(`   ${isSessionCompany ? '🎯' : '📊'} ${company.name} (ID: ${company.id})`);
        console.log(`      ${isSessionCompany ? 'THIS IS THE SESSION COMPANY' : 'Not session company'}`);
        console.log(`      Role: ${uc.role}`);
        console.log(`      Has Active Trial: ${hasActiveTrial ? '✅' : '❌'}`);
        
        if (company.Subscription) {
          console.log(`      Trial Period: ${company.Subscription.trialStart} to ${company.Subscription.trialEnd}`);
        }
      });

      // Identify the issue
      const sessionCompanyHasTrial = user.UserCompany.find(uc => 
        uc.Company.id === sessionCompanyId && uc.Company.Subscription?.isTrialActive
      );

      if (!sessionCompanyHasTrial) {
        console.log('\n🎯 ISSUE IDENTIFIED:');
        console.log('   The session is pointing to a company that does NOT have an active trial!');
        console.log('   The user has access to other companies with active trials, but the session');
        console.log('   is locked to a company without a subscription.');
        
        const companiesWithTrials = user.UserCompany.filter(uc => 
          uc.Company.Subscription?.isTrialActive
        );
        
        console.log('\n   Companies with active trials:');
        companiesWithTrials.forEach(uc => {
          console.log(`     - ${uc.Company.name} (ID: ${uc.Company.id})`);
        });
      }
    }

    console.log('\n✅ Investigation complete!');

  } catch (error) {
    console.error('❌ Error during investigation:', error);
  } finally {
    await authClient.$disconnect();
  }
}

// Run the investigation
checkSessionCompany();

