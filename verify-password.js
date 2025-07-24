// Verify the correct password
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

async function verifyPassword() {
  try {
    console.log('🔍 Verifying password for: cihatkaya@glodinas.nl');
    
    const user = await prisma.user.findUnique({
      where: { email: 'cihatkaya@glodinas.nl' }
    });
    
    if (!user || !user.password) {
      console.log('❌ User not found or no password');
      return;
    }
    
    const providedPassword = 'Geheim@12';
    const isValid = await bcrypt.compare(providedPassword, user.password);
    
    console.log(`Password verification result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    if (isValid) {
      console.log('🎉 Password is correct! The issue is likely with NextAuth configuration.');
    } else {
      console.log('❌ Password does not match. There may be an issue with password storage.');
      console.log('🔧 Will update password to the correct one...');
      
      // Update the password to the correct one
      const hashedPassword = await bcrypt.hash(providedPassword, 12);
      await prisma.user.update({
        where: { email: 'cihatkaya@glodinas.nl' },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Password updated successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error verifying password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPassword();
