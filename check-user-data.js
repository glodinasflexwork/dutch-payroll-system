const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function checkUserData() {
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  try {
    console.log('🔍 Checking specific user data...');
    
    const user = await authClient.user.findUnique({
      where: { email: 'glodinas@icloud.com' },
      include: {
        UserCompany: {
          include: {
            Company: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('📊 User Data:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Current companyId:', user.companyId);
    console.log('  UserCompany records:', user.UserCompany.length);

    user.UserCompany.forEach((uc, index) => {
      console.log(`  Company ${index + 1}:`);
      console.log(`    - ID: ${uc.Company.id}`);
      console.log(`    - Name: ${uc.Company.name}`);
      console.log(`    - Role: ${uc.role}`);
      console.log(`    - Active: ${uc.isActive}`);
    });

    // Fix the user if needed
    if (!user.companyId && user.UserCompany.length > 0) {
      const activeCompany = user.UserCompany.find(uc => uc.isActive);
      if (activeCompany) {
        console.log('\n🔧 Fixing user companyId...');
        await authClient.user.update({
          where: { id: user.id },
          data: { companyId: activeCompany.Company.id }
        });
        console.log('✅ User fixed!');
      }
    } else {
      console.log('\n✅ User data is consistent');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await authClient.$disconnect();
  }
}

checkUserData();

