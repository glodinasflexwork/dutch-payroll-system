const { PrismaClient } = require('@prisma/client');

async function testCompanyCreationBug() {
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  try {
    console.log('🧪 TESTING COMPANY CREATION BUG SIMULATION...\n');

    // Step 1: Create a test user (simulating new registration)
    console.log('1️⃣ CREATING TEST USER...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testUser = await authClient.user.create({
      data: {
        email: testEmail,
        name: 'Test User',
        password: 'hashedpassword123',
        role: 'admin'
      }
    });
    
    console.log(`   ✅ Created test user: ${testUser.email} (ID: ${testUser.id})`);

    // Step 2: Simulate the company creation process
    console.log('\n2️⃣ SIMULATING COMPANY CREATION...');
    
    // This simulates what happens in the POST /api/companies/create endpoint
    const result = await authClient.$transaction(async (tx) => {
      // Create the company
      const company = await tx.company.create({
        data: {
          name: 'Test Company Ltd.',
          address: 'Test Street 123',
          city: 'Amsterdam',
          postalCode: '1234AB',
          industry: 'Technology'
        }
      });
      
      console.log(`   ✅ Company created: ${company.name} (ID: ${company.id})`);

      // Create user-company relationship
      const userCompany = await tx.userCompany.create({
        data: {
          userId: testUser.id,
          companyId: company.id,
          role: "owner",
          isActive: true
        }
      });
      
      console.log(`   ✅ User-company association created`);

      // CRITICAL: Update user's companyId
      const updatedUser = await tx.user.update({
        where: { id: testUser.id },
        data: { companyId: company.id }
      });
      
      console.log(`   ✅ User companyId updated: ${updatedUser.companyId}`);

      return { company, userCompany, updatedUser };
    });

    // Step 3: Verify the result
    console.log('\n3️⃣ VERIFYING COMPANY CREATION RESULT...');
    
    const finalUser = await authClient.user.findUnique({
      where: { id: testUser.id }
    });
    
    const userCompanies = await authClient.userCompany.findMany({
      where: { userId: testUser.id },
      include: { Company: true }
    });

    console.log('📊 VERIFICATION RESULTS:');
    console.log(`   - User companyId: ${finalUser.companyId}`);
    console.log(`   - User-company associations: ${userCompanies.length}`);
    
    if (userCompanies.length > 0) {
      userCompanies.forEach((uc, index) => {
        console.log(`     ${index + 1}. ${uc.Company.name} (${uc.role}, active: ${uc.isActive})`);
      });
    }

    // Step 4: Test what would happen during authentication
    console.log('\n4️⃣ TESTING AUTHENTICATION SCENARIO...');
    
    const hasCompanyAccess = finalUser.companyId && userCompanies.some(uc => uc.isActive);
    
    if (hasCompanyAccess) {
      console.log('   ✅ SUCCESS: User would have proper company access');
      console.log('   ✅ No redirect loop would occur');
    } else {
      console.log('   ❌ FAILURE: User would experience redirect loop');
      console.log('   ❌ Missing company access or association');
    }

    // Step 5: Clean up test data
    console.log('\n5️⃣ CLEANING UP TEST DATA...');
    
    await authClient.userCompany.deleteMany({
      where: { userId: testUser.id }
    });
    
    await authClient.company.delete({
      where: { id: result.company.id }
    });
    
    await authClient.user.delete({
      where: { id: testUser.id }
    });
    
    console.log('   ✅ Test data cleaned up');

    console.log('\n🎯 CONCLUSION:');
    if (hasCompanyAccess) {
      console.log('   ✅ Company creation process is working correctly');
      console.log('   ✅ The bug may be in a different part of the system');
    } else {
      console.log('   ❌ Company creation process has bugs');
      console.log('   ❌ This would cause redirect loops for new users');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await authClient.$disconnect();
  }
}

testCompanyCreationBug();

