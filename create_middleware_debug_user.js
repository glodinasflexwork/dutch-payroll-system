require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createMiddlewareDebugUser() {
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  try {
    console.log('Creating middleware debug user...');
    
    const email = 'debugtest@example.com';
    const password = 'debug123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Delete existing user if exists
    const existingUser = await authClient.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('Deleting existing user and company...');
      
      // Delete UserCompany relationships
      await authClient.userCompany.deleteMany({
        where: { userId: existingUser.id }
      });
      
      // Delete company if it exists
      if (existingUser.companyId) {
        await authClient.company.delete({
          where: { id: existingUser.companyId }
        }).catch(() => {}); // Ignore if already deleted
      }
      
      // Delete user
      await authClient.user.delete({
        where: { id: existingUser.id }
      });
    }
    
    // Create company first
    const company = await authClient.company.create({
      data: {
        name: 'Debug Test Company B.V.',
        address: '123 Debug Street',
        city: 'Amsterdam',
        postalCode: '1000 AA',
        country: 'Netherlands',
        kvkNumber: '12345678',
        taxNumber: 'NL123456789B01'
      }
    });
    
    console.log('Created company:', company.name, company.id);
    
    // Create user with company
    const user = await authClient.user.create({
      data: {
        email,
        name: 'Debug Test User',
        password: hashedPassword,
        companyId: company.id,
        role: 'admin'
      }
    });
    
    console.log('Created user:', user.email, user.id);
    
    // Create UserCompany relationship
    const userCompany = await authClient.userCompany.create({
      data: {
        userId: user.id,
        companyId: company.id,
        role: 'owner',
        isActive: true
      }
    });
    
    console.log('Created UserCompany relationship:', userCompany.id);
    
    console.log('✅ Debug user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Company:', company.name);
    console.log('Company ID:', company.id);
    
  } catch (error) {
    console.error('Error creating debug user:', error);
  } finally {
    await authClient.$disconnect();
  }
}

createMiddlewareDebugUser();

