const { PrismaClient } = require('@prisma/client');

async function fixRedirectLoop() {
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  try {
    console.log('🔧 FIXING REDIRECT LOOP ISSUE...\n');

    // Find your user
    const user = await authClient.user.findUnique({
      where: { email: 'adjay1993@gmail.com' }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    // Find the company
    const company = await authClient.company.findFirst({
      where: { name: 'Glodinas Finance B.V.' }
    });

    if (!company) {
      console.log('❌ Company not found');
      return;
    }

    console.log('👤 USER:', user.email);
    console.log('🏢 COMPANY:', company.name);
    console.log('🔗 COMPANY ID:', company.id);

    // Step 1: Create user-company association
    console.log('\n1️⃣ CREATING USER-COMPANY ASSOCIATION...');
    
    const existingAssociation = await authClient.userCompany.findFirst({
      where: {
        userId: user.id,
        companyId: company.id
      }
    });

    if (existingAssociation) {
      console.log('   ✅ Association already exists, updating to active');
      await authClient.userCompany.update({
        where: { id: existingAssociation.id },
        data: { 
          isActive: true,
          role: 'admin'
        }
      });
    } else {
      console.log('   ✅ Creating new user-company association');
      await authClient.userCompany.create({
        data: {
          userId: user.id,
          companyId: company.id,
          role: 'admin',
          isActive: true
        }
      });
    }

    // Step 2: Set user's current company
    console.log('\n2️⃣ SETTING USER CURRENT COMPANY...');
    await authClient.user.update({
      where: { id: user.id },
      data: { companyId: company.id }
    });
    console.log('   ✅ User companyId updated');

    // Step 3: Verify the fix
    console.log('\n3️⃣ VERIFYING FIX...');
    
    const updatedUser = await authClient.user.findUnique({
      where: { id: user.id }
    });

    const userCompanies = await authClient.userCompany.findMany({
      where: { userId: user.id },
      include: { Company: true }
    });

    console.log('✅ VERIFICATION RESULTS:');
    console.log(`   - User companyId: ${updatedUser.companyId}`);
    console.log(`   - User-company associations: ${userCompanies.length}`);
    
    userCompanies.forEach((uc, index) => {
      console.log(`     ${index + 1}. ${uc.Company.name} (${uc.role}, active: ${uc.isActive})`);
    });

    if (updatedUser.companyId && userCompanies.length > 0 && userCompanies.some(uc => uc.isActive)) {
      console.log('\n🎉 REDIRECT LOOP FIXED!');
      console.log('   ✅ User has current company set');
      console.log('   ✅ User-company association exists and is active');
      console.log('   ✅ Employee page should now work');
    } else {
      console.log('\n⚠️ Fix may be incomplete');
    }

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await authClient.$disconnect();
  }
}

fixRedirectLoop();

