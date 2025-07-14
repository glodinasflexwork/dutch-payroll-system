require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL
    }
  }
});

async function investigateAccount() {
  try {
    console.log('🔍 Investigating newly created account: glodinas@icloud.com');
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'glodinas@icloud.com' }
    });
    
    if (!user) {
      console.log('❌ User not found in database');
      return;
    }
    
    console.log('✅ User found:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Email Verified:', user.emailVerified);
    console.log('- Created:', user.createdAt);
    console.log('- Updated:', user.updatedAt);
    console.log('- Password Hash Length:', user.password ? user.password.length : 'No password');
    console.log('- Password Hash Starts With:', user.password ? user.password.substring(0, 10) + '...' : 'N/A');
    
    // Test password verification with a common test password
    if (user.password) {
      console.log('\n🔐 Testing password verification...');
      
      // Test common passwords that might have been used
      const testPasswords = ['password', 'Password123', 'test123', 'Geheim@12', 'Galati123'];
      
      for (const testPassword of testPasswords) {
        try {
          const isValid = await bcrypt.compare(testPassword, user.password);
          if (isValid) {
            console.log(`✅ Password "${testPassword}" is VALID`);
          }
        } catch (error) {
          console.log(`❌ Error testing password "${testPassword}":`, error.message);
        }
      }
    }
    
    // Compare with working account
    console.log('\n📊 Comparing with working account...');
    const workingUser = await prisma.user.findUnique({
      where: { email: 'cihatkaya@glodinas.nl' }
    });
    
    if (workingUser) {
      console.log('Working account:');
      console.log('- Email Verified:', workingUser.emailVerified);
      console.log('- Password Hash Length:', workingUser.password ? workingUser.password.length : 'No password');
      console.log('- Password Hash Starts With:', workingUser.password ? workingUser.password.substring(0, 10) + '...' : 'N/A');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateAccount();
