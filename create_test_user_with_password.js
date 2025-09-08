require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createTestUserWithPassword() {
  const authClient = new PrismaClient();

  try {
    console.log('Creating test user with password...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('testpass123', 12);
    
    // Check if user already exists
    const existingUser = await authClient.user.findUnique({
      where: { email: 'testlogin@example.com' }
    });
    
    if (existingUser) {
      console.log('User already exists, updating password...');
      await authClient.user.update({
        where: { email: 'testlogin@example.com' },
        data: { password: hashedPassword }
      });
    } else {
      console.log('Creating new user...');
      await authClient.user.create({
        data: {
          email: 'testlogin@example.com',
          name: 'Test Login User',
          password: hashedPassword,
          companyId: 'cmf83a28g0001qw0u6stn5skm' // Use the existing company ID
        }
      });
      
      // Create UserCompany relationship
      await authClient.userCompany.create({
        data: {
          userId: (await authClient.user.findUnique({ where: { email: 'testlogin@example.com' } })).id,
          companyId: 'cmf83a28g0001qw0u6stn5skm',
          role: 'admin',
          isActive: true
        }
      });
    }
    
    console.log('✅ Test user created/updated successfully!');
    console.log('Email: testlogin@example.com');
    console.log('Password: testpass123');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await authClient.$disconnect();
  }
}

createTestUserWithPassword();

