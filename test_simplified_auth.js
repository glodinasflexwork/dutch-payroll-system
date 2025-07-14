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

async function testSimplifiedAuth() {
  try {
    console.log('🔍 Testing SIMPLIFIED authentication logic for: glodinas@icloud.com');
    
    const credentials = { email: 'glodinas@icloud.com', password: 'Geheim@12' };
    
    // Simplified query - no company relationships
    const user = await prisma.user.findUnique({
      where: {
        email: credentials.email
      }
    });

    if (!user || !user.password) {
      console.log('❌ User not found or no password');
      return;
    }

    console.log('✅ User found successfully!');
    console.log('- Email verified:', user.emailVerified);

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      console.log('❌ Password invalid');
      return;
    }

    console.log('✅ Password verification successful!');

    // Check if email is verified
    if (!user.emailVerified) {
      console.log('❌ Email not verified');
      return;
    }

    console.log('✅ Email verification check passed!');

    // Simplified return object
    const authResult = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user'
    };

    console.log('🎉 SIMPLIFIED AUTHENTICATION SUCCESSFUL!');
    console.log('- User ID:', authResult.id);
    console.log('- Email:', authResult.email);
    console.log('- Name:', authResult.name);
    console.log('- Role:', authResult.role);
    console.log('- No company data (handled separately)');
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSimplifiedAuth();
