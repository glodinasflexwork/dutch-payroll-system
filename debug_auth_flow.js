require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Test both prisma clients
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL
    }
  }
});

const authPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL
    }
  }
});

async function debugAuthFlow() {
  try {
    console.log('🔍 Debugging authentication flow for: glodinas@icloud.com');
    
    // Test with main prisma client (used in registration)
    console.log('\n1️⃣ Testing with main prisma client (registration):');
    const userFromMain = await prisma.user.findUnique({
      where: { email: 'glodinas@icloud.com' },
      include: {
        UserCompany: {
          include: {
            company: true
          }
        }
      }
    });
    
    if (userFromMain) {
      console.log('✅ User found with main prisma client');
      console.log('- Email verified:', userFromMain.emailVerified);
      console.log('- Password exists:', !!userFromMain.password);
      console.log('- UserCompany relations:', userFromMain.UserCompany.length);
      
      if (userFromMain.password) {
        const isValidMain = await bcrypt.compare('Geheim@12', userFromMain.password);
        console.log('- Password verification:', isValidMain ? '✅ VALID' : '❌ INVALID');
      }
    } else {
      console.log('❌ User NOT found with main prisma client');
    }
    
    // Test with auth prisma client (used in login)
    console.log('\n2️⃣ Testing with auth prisma client (login):');
    const userFromAuth = await authPrisma.user.findUnique({
      where: { email: 'glodinas@icloud.com' },
      include: {
        UserCompany: {
          include: {
            company: true
          }
        }
      }
    });
    
    if (userFromAuth) {
      console.log('✅ User found with auth prisma client');
      console.log('- Email verified:', userFromAuth.emailVerified);
      console.log('- Password exists:', !!userFromAuth.password);
      console.log('- UserCompany relations:', userFromAuth.UserCompany.length);
      
      if (userFromAuth.password) {
        const isValidAuth = await bcrypt.compare('Geheim@12', userFromAuth.password);
        console.log('- Password verification:', isValidAuth ? '✅ VALID' : '❌ INVALID');
      }
    } else {
      console.log('❌ User NOT found with auth prisma client');
    }
    
    // Test the exact authentication logic from auth.ts
    console.log('\n3️⃣ Testing exact authentication logic:');
    const credentials = { email: 'glodinas@icloud.com', password: 'Geheim@12' };
    
    if (!credentials?.email || !credentials?.password) {
      console.log('❌ Missing credentials');
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: credentials.email
      },
      include: {
        UserCompany: {
          include: {
            company: true
          }
        }
      }
    });

    if (!user || !user.password) {
      console.log('❌ User not found or no password');
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      console.log('❌ Password invalid');
      return;
    }

    // Check if email is verified
    if (!user.emailVerified) {
      console.log('❌ Email not verified');
      return;
    }

    // Get the user's primary company (first active company)
    const primaryUserCompany = user.UserCompany.find(uc => uc.isActive);
    console.log('- Primary company search result:', primaryUserCompany);
    
    const companyId = primaryUserCompany?.companyId || null;
    const company = primaryUserCompany?.company || null;

    console.log('✅ Authentication would succeed!');
    console.log('- User ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Role:', user.role || 'user');
    console.log('- Company ID:', companyId);
    console.log('- Company:', company);
    
  } catch (error) {
    console.error('❌ Error in debug:', error);
  } finally {
    await prisma.$disconnect();
    await authPrisma.$disconnect();
  }
}

debugAuthFlow();
