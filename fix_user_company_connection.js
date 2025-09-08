require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function fixUserCompanyConnection() {
  // Use the actual cloud database URLs from .env.local
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  try {
    console.log('Checking user-company connections...');
    
    // Find our test user
    const user = await authClient.user.findUnique({
      where: { email: 'test@example.com' },
      include: {
        Company: true,
        UserCompany: true
      }
    });

    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      companyId: user.companyId,
      directCompany: user.Company?.name || 'None',
      userCompanies: user.UserCompany.length
    });

    // Find all companies
    const allCompanies = await authClient.company.findMany({
      include: {
        User: true,
        UserCompany: true
      }
    });

    console.log('\nAll companies:');
    allCompanies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name} (ID: ${company.id})`);
      console.log(`   Direct users: ${company.User.length}`);
      console.log(`   UserCompany records: ${company.UserCompany.length}`);
    });

    // Find Demo Tech Solutions company
    const demoCompany = allCompanies.find(c => c.name.includes('Demo Tech Solutions'));
    
    if (demoCompany) {
      console.log('\n🏢 Found Demo Tech Solutions company:', demoCompany.id);
      
      // Check current connections
      const hasDirectConnection = user.companyId === demoCompany.id;
      const hasUserCompanyRecord = user.UserCompany.some(uc => uc.companyId === demoCompany.id);
      
      console.log('Current connections:');
      console.log('- Direct companyId:', hasDirectConnection ? '✅' : '❌');
      console.log('- UserCompany record:', hasUserCompanyRecord ? '✅' : '❌');
      
      if (hasDirectConnection && hasUserCompanyRecord) {
        console.log('✅ User is already properly connected to the company!');
      } else {
        console.log('🔧 Fixing user-company connection...');
        
        // Update user's companyId if not set
        if (!hasDirectConnection) {
          await authClient.user.update({
            where: { id: user.id },
            data: { companyId: demoCompany.id }
          });
          console.log('✅ Set user companyId');
        }
        
        // Create UserCompany record if not exists
        if (!hasUserCompanyRecord) {
          await authClient.userCompany.create({
            data: {
              userId: user.id,
              companyId: demoCompany.id,
              role: 'admin',
              isActive: true
            }
          });
          console.log('✅ Created UserCompany record');
        }
        
        console.log('🎉 User successfully connected to company!');
      }
    } else {
      console.log('❌ Demo Tech Solutions company not found!');
      console.log('Available companies:', allCompanies.map(c => c.name));
    }

    await authClient.$disconnect();

  } catch (error) {
    console.error('Error fixing user-company connection:', error);
  }
}

fixUserCompanyConnection();

