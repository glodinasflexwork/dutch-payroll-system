const { PrismaClient } = require('@prisma/client');

async function simpleCleanup() {
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  try {
    console.log('🧹 STARTING SIMPLE DATABASE CLEANUP...\n');

    // Clean Auth Database only (since it's the main one working)
    console.log('1️⃣ CLEANING AUTH DATABASE...');
    
    try {
      // Delete in correct order to respect foreign key constraints
      await authClient.session.deleteMany({});
      console.log('   ✅ Deleted all sessions');
      
      await authClient.account.deleteMany({});
      console.log('   ✅ Deleted all accounts');
      
      // Check if these tables exist before trying to delete
      try {
        await authClient.subscription.deleteMany({});
        console.log('   ✅ Deleted all subscriptions');
      } catch (e) {
        console.log('   ⚠️ No subscriptions table or already empty');
      }
      
      try {
        await authClient.userCompany.deleteMany({});
        console.log('   ✅ Deleted all user-company associations');
      } catch (e) {
        console.log('   ⚠️ No userCompany table or already empty');
      }
      
      try {
        await authClient.company.deleteMany({});
        console.log('   ✅ Deleted all companies from auth');
      } catch (e) {
        console.log('   ⚠️ No company table or already empty');
      }
      
      // Reset user company associations (if field exists)
      try {
        await authClient.user.updateMany({
          data: {
            companyId: null
          }
        });
        console.log('   ✅ Reset user company associations');
      } catch (e) {
        console.log('   ⚠️ Could not reset companyId field (may not exist)');
      }
      
      console.log('   ✅ Auth database cleaned');
    } catch (error) {
      console.log('   ⚠️ Auth cleanup error:', error.message);
    }

    // Verify cleanup
    console.log('\n2️⃣ VERIFYING CLEANUP...');
    
    const authCounts = {
      users: await authClient.user.count(),
      sessions: await authClient.session.count(),
      accounts: await authClient.account.count()
    };

    console.log('\n📊 CLEANUP VERIFICATION:');
    console.log('   Auth Database:');
    console.log(`     - Users: ${authCounts.users} (preserved)`);
    console.log(`     - Sessions: ${authCounts.sessions}`);
    console.log(`     - Accounts: ${authCounts.accounts}`);

    if (authCounts.sessions === 0 && authCounts.accounts === 0) {
      console.log('\n🎉 DATABASE CLEANUP SUCCESSFUL!');
      console.log('   All session and account data cleared');
      console.log('   User accounts preserved');
      console.log('   Ready for fresh user experience testing');
    } else {
      console.log('\n⚠️ CLEANUP INCOMPLETE - Some data remains');
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await authClient.$disconnect();
  }
}

simpleCleanup();

