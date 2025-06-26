#!/usr/bin/env node

// Test script to check database connectivity and user authentication
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuth() {
  console.log('🔍 Testing Authentication System...\n');
  
  try {
    // Test 1: Database connectivity
    console.log('1. Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ Database connected - ${userCount} users found\n`);
    
    // Test 2: Check if the specific user exists
    console.log('2. Checking for user: cihatkaya@glodinas.nl');
    const user = await prisma.user.findUnique({
      where: {
        email: 'cihatkaya@glodinas.nl'
      },
      include: {
        company: true
      }
    });
    
    if (!user) {
      console.log('   ❌ User not found in database');
      console.log('   📋 Available users:');
      const allUsers = await prisma.user.findMany({
        select: {
          email: true,
          name: true
        }
      });
      allUsers.forEach(u => console.log(`      - ${u.email} (${u.name})`));
      return;
    }
    
    console.log(`   ✅ User found: ${user.name} (${user.email})`);
    console.log(`   📊 User details:`);
    console.log(`      - ID: ${user.id}`);
    console.log(`      - Role: ${user.role}`);
    console.log(`      - Company ID: ${user.companyId}`);
    console.log(`      - Company: ${user.company?.name || 'None'}`);
    console.log(`      - Has Password: ${user.password ? 'Yes' : 'No'}\n`);
    
    // Test 3: Password validation
    if (user.password) {
      console.log('3. Testing password validation...');
      const isValid = await bcrypt.compare('Geheim@12', user.password);
      console.log(`   ${isValid ? '✅' : '❌'} Password validation: ${isValid ? 'CORRECT' : 'INCORRECT'}\n`);
    }
    
    // Test 4: Check environment variables
    console.log('4. Checking environment variables...');
    console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing'}`);
    console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'Not set'}`);
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Missing'}`);
    
    console.log('\n✅ Authentication system test complete!');
    
  } catch (error) {
    console.error('❌ Error during authentication test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();

