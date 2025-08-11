const { PrismaClient } = require('@prisma/client');

// Create clients with specific database URLs
const createAuthClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });
};

const createHRClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.HR_DATABASE_URL
      }
    }
  });
};

const createPayrollClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.PAYROLL_DATABASE_URL
      }
    }
  });
};

async function cleanupDatabases() {
  const authClient = createAuthClient();
  const hrClient = createHRClient();
  const payrollClient = createPayrollClient();

  try {
    console.log('🧹 STARTING COMPLETE DATABASE CLEANUP...\n');

    // Step 1: Clean Payroll Database
    console.log('1️⃣ CLEANING PAYROLL DATABASE...');
    try {
      await payrollClient.payrollRecord.deleteMany({});
      console.log('   ✅ Deleted all payroll records');
      
      await payrollClient.payrollBatch.deleteMany({});
      console.log('   ✅ Deleted all payroll batches');
      
      console.log('   ✅ Payroll database cleaned');
    } catch (error) {
      console.log('   ⚠️ Payroll cleanup error (may be empty):', error.message);
    }

    // Step 2: Clean HR Database
    console.log('\n2️⃣ CLEANING HR DATABASE...');
    try {
      // Delete in correct order to respect foreign key constraints
      await hrClient.contract.deleteMany({});
      console.log('   ✅ Deleted all contracts');
      
      await hrClient.employee.deleteMany({});
      console.log('   ✅ Deleted all employees');
      
      await hrClient.company.deleteMany({});
      console.log('   ✅ Deleted all companies');
      
      console.log('   ✅ HR database cleaned');
    } catch (error) {
      console.log('   ⚠️ HR cleanup error (may be empty):', error.message);
    }

    // Step 3: Clean Auth Database (keep users but clean sessions)
    console.log('\n3️⃣ CLEANING AUTH DATABASE...');
    try {
      await authClient.session.deleteMany({});
      console.log('   ✅ Deleted all sessions');
      
      await authClient.account.deleteMany({});
      console.log('   ✅ Deleted all accounts');
      
      // Clean subscription and company data
      await authClient.subscription.deleteMany({});
      console.log('   ✅ Deleted all subscriptions');
      
      await authClient.userCompany.deleteMany({});
      console.log('   ✅ Deleted all user-company associations');
      
      await authClient.company.deleteMany({});
      console.log('   ✅ Deleted all companies from auth');
      
      // Keep users but clean their company associations
      await authClient.user.updateMany({
        data: {
          currentCompanyId: null
        }
      });
      console.log('   ✅ Reset user company associations');
      
      console.log('   ✅ Auth database cleaned (users preserved)');
    } catch (error) {
      console.log('   ⚠️ Auth cleanup error (may be empty):', error.message);
    }

    // Step 4: Verify cleanup
    console.log('\n4️⃣ VERIFYING CLEANUP...');
    
    const hrCounts = {
      companies: await hrClient.company.count(),
      employees: await hrClient.employee.count(),
      contracts: await hrClient.contract.count()
    };
    
    const payrollCounts = {
      batches: await payrollClient.payrollBatch.count(),
      records: await payrollClient.payrollRecord.count()
    };
    
    const authCounts = {
      users: await authClient.user.count(),
      sessions: await authClient.session.count(),
      accounts: await authClient.account.count(),
      companies: await authClient.company.count(),
      subscriptions: await authClient.subscription.count(),
      userCompanies: await authClient.userCompany.count()
    };

    console.log('\n📊 CLEANUP VERIFICATION:');
    console.log('   HR Database:');
    console.log(`     - Companies: ${hrCounts.companies}`);
    console.log(`     - Employees: ${hrCounts.employees}`);
    console.log(`     - Contracts: ${hrCounts.contracts}`);
    
    console.log('   Payroll Database:');
    console.log(`     - Batches: ${payrollCounts.batches}`);
    console.log(`     - Records: ${payrollCounts.records}`);
    
    console.log('   Auth Database:');
    console.log(`     - Users: ${authCounts.users} (preserved)`);
    console.log(`     - Sessions: ${authCounts.sessions}`);
    console.log(`     - Accounts: ${authCounts.accounts}`);
    console.log(`     - Companies: ${authCounts.companies}`);
    console.log(`     - Subscriptions: ${authCounts.subscriptions}`);
    console.log(`     - User-Company Links: ${authCounts.userCompanies}`);

    if (hrCounts.companies === 0 && hrCounts.employees === 0 && 
        payrollCounts.batches === 0 && payrollCounts.records === 0 &&
        authCounts.sessions === 0 && authCounts.companies === 0) {
      console.log('\n🎉 DATABASE CLEANUP SUCCESSFUL!');
      console.log('   All business data has been cleared');
      console.log('   User accounts have been preserved');
      console.log('   Ready for fresh data setup');
    } else {
      console.log('\n⚠️ CLEANUP INCOMPLETE - Some data remains');
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await authClient.$disconnect();
    await hrClient.$disconnect();
    await payrollClient.$disconnect();
  }
}

cleanupDatabases();

