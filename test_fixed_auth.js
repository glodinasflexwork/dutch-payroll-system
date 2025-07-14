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

async function testFixedAuth() {
  try {
    console.log('🔍 Testing FIXED authentication logic for: glodinas@icloud.com');
    
    const credentials = { email: 'glodinas@icloud.com', password: 'Geheim@12' };
    
    const user = await prisma.user.findUnique({
      where: {
        email: credentials.email
      },
      include: {
        UserCompany: {
          include: {
            Company: true  // Fixed: Capital C
          }
        }
      }
    });

    if (!user || !user.password) {
      console.log('❌ User not found or no password');
      return;
    }

    console.log('✅ User found successfully!');
    console.log('- Email verified:', user.emailVerified);
    console.log('- UserCompany relations:', user.UserCompany.length);

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

    // Get the user's primary company (first active company)
    const primaryUserCompany = user.UserCompany.find(uc => uc.isActive);
    console.log('- Primary company search result:', primaryUserCompany);
    
    const companyId = primaryUserCompany?.companyId || null;
    const company = primaryUserCompany?.Company || null;

    console.log('🎉 AUTHENTICATION WOULD SUCCEED!');
    console.log('- User ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Role:', user.role || 'user');
    console.log('- Company ID:', companyId);
    console.log('- Company:', company ? company.name : 'No company');
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFixedAuth();
