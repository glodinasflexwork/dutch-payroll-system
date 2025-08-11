const { PrismaClient } = require('@prisma/client');

async function createTestUser() {
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  try {
    console.log('🧪 CREATING FRESH TEST USER FOR REDIRECT LOOP FIX TESTING...\n');

    // Create a completely fresh test user
    const testEmail = `test-redirect-fix-${Date.now()}@example.com`;
    const testUser = await authClient.user.create({
      data: {
        email: testEmail,
        name: 'Test Redirect Fix User',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
        role: 'admin'
      }
    });
    
    console.log('✅ FRESH TEST USER CREATED:');
    console.log(`   - Email: ${testUser.email}`);
    console.log(`   - ID: ${testUser.id}`);
    console.log(`   - Password: "password"`);
    console.log(`   - Company ID: ${testUser.companyId || 'None (as expected for new user)'}`);

    // Verify the user has no company associations
    const userCompanies = await authClient.userCompany.findMany({
      where: { userId: testUser.id }
    });

    console.log(`   - Company Associations: ${userCompanies.length} (should be 0)`);

    console.log('\n🎯 TESTING INSTRUCTIONS:');
    console.log('1. Go to https://www.salarysync.nl/auth/signin');
    console.log(`2. Login with: ${testUser.email} / password`);
    console.log('3. You should be redirected to company setup');
    console.log('4. Create a company and verify no redirect loop occurs');
    console.log('5. After company creation, you should land on dashboard without issues');

    console.log('\n📋 WHAT TO VERIFY:');
    console.log('✅ No redirect loop after company creation');
    console.log('✅ Successful redirect to dashboard');
    console.log('✅ Ability to access employees page');
    console.log('✅ All navigation working properly');

    console.log('\n🧹 CLEANUP:');
    console.log('After testing, run the cleanup script to remove test data');

  } catch (error) {
    console.error('❌ Test user creation failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await authClient.$disconnect();
  }
}

createTestUser();

