require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function verifyDebugUserEmail() {
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  try {
    console.log('Verifying debug user email...');
    
    const email = 'debugtest@example.com';
    
    // Update user to mark email as verified
    const updatedUser = await authClient.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        emailVerificationToken: null
      }
    });
    
    console.log('✅ Email verified for user:', updatedUser.email);
    console.log('Email verified at:', updatedUser.emailVerified);
    
  } catch (error) {
    console.error('Error verifying email:', error);
  } finally {
    await authClient.$disconnect();
  }
}

verifyDebugUserEmail();

