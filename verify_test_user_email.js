require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function verifyTestUserEmail() {
  const authClient = new PrismaClient();

  try {
    console.log('Verifying test user email...');
    
    // Update user to mark email as verified
    const updatedUser = await authClient.user.update({
      where: { email: 'testlogin@example.com' },
      data: { 
        emailVerified: new Date()
      }
    });
    
    console.log('✅ Test user email verified successfully!');
    console.log('User:', updatedUser.email, 'verified at:', updatedUser.emailVerified);
    
  } catch (error) {
    console.error('Error verifying test user email:', error);
  } finally {
    await authClient.$disconnect();
  }
}

verifyTestUserEmail();

