const { PrismaClient } = require('@prisma/client');

async function verifyTestUser() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  try {
    console.log('🔍 Looking for test user...');
    
    const user = await prisma.user.findUnique({
      where: {
        email: 'companytest2024@example.com'
      }
    });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }
    
    console.log(`📧 Found user: ${user.name} (${user.email})`);
    console.log(`✅ Email verified: ${user.emailVerified ? 'Yes' : 'No'}`);
    
    if (!user.emailVerified) {
      console.log('🔧 Verifying email for testing...');
      
      await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          emailVerified: new Date()
        }
      });
      
      console.log('✅ Email verification bypassed for testing!');
    } else {
      console.log('✅ Email already verified');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTestUser();
