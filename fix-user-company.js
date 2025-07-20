const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function fixUserCompanyData() {
  console.log('🔗 Using AUTH_DATABASE_URL:', process.env.AUTH_DATABASE_URL ? 'Found' : 'Missing');
  
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  try {
    console.log('🔍 Checking user and company data...');
    
    // Find the user
    const user = await authClient.user.findUnique({
      where: { email: 'glodinas@icloud.com' },
      include: {
        userCompanies: {
          include: {
            Company: true
          }
        }
      }
    });

    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      currentCompanyId: user.companyId,
      userCompanies: user.userCompanies.length
    });

    // Check if user has companies
    if (user.userCompanies.length === 0) {
      console.error('❌ User has no companies');
      return;
    }

    // Get the first active company
    const activeCompany = user.userCompanies.find(uc => uc.isActive);
    if (!activeCompany) {
      console.error('❌ User has no active companies');
      return;
    }

    console.log('✅ Active company found:', {
      companyId: activeCompany.Company.id,
      companyName: activeCompany.Company.name,
      role: activeCompany.role,
      isActive: activeCompany.isActive
    });

    // Fix: Update user's companyId to point to the active company
    if (user.companyId !== activeCompany.Company.id) {
      console.log('🔧 Fixing user companyId...');
      
      await authClient.user.update({
        where: { id: user.id },
        data: { companyId: activeCompany.Company.id }
      });

      console.log('✅ User companyId updated successfully');
    } else {
      console.log('✅ User companyId is already correct');
    }

    // Verify the fix
    const updatedUser = await authClient.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        companyId: true
      }
    });

    console.log('🎉 Final user state:', updatedUser);
    console.log('✅ Data inconsistency fixed! User should now have proper company access.');

  } catch (error) {
    console.error('❌ Error fixing user company data:', error);
  } finally {
    await authClient.$disconnect();
  }
}

fixUserCompanyData();

