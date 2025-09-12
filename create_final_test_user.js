require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createFinalTestUser() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  try {
    console.log('🧪 Creating final test user for complete system verification...');
    
    const email = 'finaltest@example.com';
    const password = 'final123';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Delete existing user if exists
    await prisma.user.deleteMany({
      where: { email: email }
    });

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        name: 'Final Test User',
        emailVerified: new Date(),
      }
    });

    console.log('✅ Final test user created successfully:');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🆔 User ID:', user.id);
    console.log('');
    console.log('This user has NO company yet - perfect for testing the complete flow!');

  } catch (error) {
    console.error('❌ Error creating final test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFinalTestUser();

