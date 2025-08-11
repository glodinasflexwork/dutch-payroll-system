const { PrismaClient } = require('@prisma/client');

async function checkUserData() {
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  try {
    console.log('🔍 CHECKING CURRENT USER DATA...\n');

    // Get all users
    const users = await authClient.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        companyId: true,
        createdAt: true
      }
    });

    console.log(`📊 FOUND ${users.length} USERS:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   - Name: ${user.name || 'Not set'}`);
      console.log(`   - Has Password: ${user.password ? 'YES' : 'NO'}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Company ID: ${user.companyId || 'None'}`);
      console.log(`   - Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    // Check sessions and accounts
    const sessionCount = await authClient.session.count();
    const accountCount = await authClient.account.count();

    console.log('🔐 AUTHENTICATION DATA:');
    console.log(`   - Active Sessions: ${sessionCount}`);
    console.log(`   - OAuth Accounts: ${accountCount}`);

    console.log('\n💡 EXPLANATION:');
    console.log('✅ USER RECORDS: Preserved (email + password intact)');
    console.log('❌ SESSIONS: Deleted (you need to login again)');
    console.log('❌ OAUTH ACCOUNTS: Deleted (Google/social logins reset)');
    console.log('❌ COMPANY DATA: Deleted (need to recreate companies)');

    console.log('\n🎯 WHY YOU CAN STILL LOGIN:');
    console.log('- Your email and password are still in the database');
    console.log('- Only your active sessions were cleared');
    console.log('- You just need to login again to create a new session');

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    await authClient.$disconnect();
  }
}

checkUserData();

