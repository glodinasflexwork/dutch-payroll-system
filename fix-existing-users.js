const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function fixAllUsersCompanyData() {
  console.log('🔗 Using AUTH_DATABASE_URL:', process.env.AUTH_DATABASE_URL ? 'Found' : 'Missing');
  
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  try {
    console.log('🔍 Finding all users with company data inconsistencies...');
    
    // Find all users who have companies but their companyId is null
    const usersWithInconsistentData = await authClient.user.findMany({
      where: {
        companyId: null,
        UserCompany: {
          some: {
            isActive: true
          }
        }
      },
      include: {
        UserCompany: {
          where: { isActive: true },
          include: {
            Company: true
          }
        }
      }
    });

    console.log(`📊 Found ${usersWithInconsistentData.length} users with data inconsistencies`);

    if (usersWithInconsistentData.length === 0) {
      console.log('✅ No users need fixing!');
      return;
    }

    // Fix each user
    for (const user of usersWithInconsistentData) {
      console.log(`\n🔧 Fixing user: ${user.email}`);
      
      // Get their first active company
      const activeCompany = user.UserCompany[0];
      
      if (activeCompany) {
        console.log(`   → Linking to company: ${activeCompany.Company.name} (${activeCompany.Company.id})`);
        
        await authClient.user.update({
          where: { id: user.id },
          data: { companyId: activeCompany.Company.id }
        });
        
        console.log(`   ✅ Fixed user ${user.email}`);
      } else {
        console.log(`   ❌ No active company found for ${user.email}`);
      }
    }

    console.log('\n🎉 All users fixed! Summary:');
    
    // Verify the fixes
    const verificationResults = await authClient.user.findMany({
      where: {
        id: { in: usersWithInconsistentData.map(u => u.id) }
      },
      select: {
        email: true,
        companyId: true
      }
    });

    verificationResults.forEach(user => {
      console.log(`   ${user.email}: ${user.companyId ? '✅ Fixed' : '❌ Still broken'}`);
    });

  } catch (error) {
    console.error('❌ Error fixing users:', error);
  } finally {
    await authClient.$disconnect();
  }
}

fixAllUsersCompanyData();

