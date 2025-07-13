// Fix the user's password
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

async function fixPassword() {
  try {
    console.log('🔧 Fixing password for: cihatkaya@glodinas.nl');
    
    const correctPassword = 'Geheim@12';
    const hashedPassword = await bcrypt.hash(correctPassword, 12);
    
    const updatedUser = await prisma.user.update({
      where: { email: 'cihatkaya@glodinas.nl' },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Password updated successfully!');
    
    // Verify the new password works
    const isValid = await bcrypt.compare(correctPassword, hashedPassword);
    console.log(`Password verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
  } catch (error) {
    console.error('❌ Error fixing password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPassword();
EOF && node fix-password.js
