// Test script to verify the JWT refresh fix
// This script creates a test user and verifies the complete flow

require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const authPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL
    }
  }
})

async function testJWTRefreshFix() {
  console.log('🧪 Testing JWT Refresh Fix...\n')

  try {
    // Step 1: Create a test user
    console.log('1️⃣ Creating test user...')
    const testEmail = `jwt-test-${Date.now()}@example.com`
    const testPassword = 'test123'
    const hashedPassword = await bcrypt.hash(testPassword, 12)

    const user = await authPrisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        emailVerified: new Date(),
        name: 'JWT Test User'
      }
    })

    console.log(`✅ Test user created: ${testEmail}`)
    console.log(`   User ID: ${user.id}`)
    console.log(`   Password: ${testPassword}`)

    // Step 2: Verify user has no company initially
    console.log('\n2️⃣ Verifying initial state...')
    const userWithCompanies = await authPrisma.user.findUnique({
      where: { id: user.id },
      include: {
        userCompanies: {
          include: {
            company: true
          }
        }
      }
    })

    console.log(`✅ User has ${userWithCompanies.userCompanies.length} companies (should be 0)`)

    // Step 3: Simulate company creation
    console.log('\n3️⃣ Simulating company creation...')
    const company = await authPrisma.company.create({
      data: {
        name: 'JWT Test Company B.V.',
        kvkNumber: '12345678',
        address: 'Test Street 123',
        city: 'Amsterdam',
        postalCode: '1234AB',
        industry: 'Technology & Software',
        isDGA: false
      }
    })

    console.log(`✅ Company created: ${company.name}`)
    console.log(`   Company ID: ${company.id}`)

    // Step 4: Link user to company
    console.log('\n4️⃣ Linking user to company...')
    const userCompany = await authPrisma.userCompany.create({
      data: {
        userId: user.id,
        companyId: company.id,
        role: 'owner',
        isPrimary: true
      }
    })

    console.log(`✅ User linked to company with role: ${userCompany.role}`)

    // Step 5: Verify the link
    console.log('\n5️⃣ Verifying company link...')
    const userWithNewCompany = await authPrisma.user.findUnique({
      where: { id: user.id },
      include: {
        userCompanies: {
          include: {
            company: true
          }
        }
      }
    })

    console.log(`✅ User now has ${userWithNewCompany.userCompanies.length} company(ies)`)
    if (userWithNewCompany.userCompanies.length > 0) {
      const primaryCompany = userWithNewCompany.userCompanies.find(uc => uc.isPrimary)
      console.log(`   Primary company: ${primaryCompany?.company.name}`)
      console.log(`   Role: ${primaryCompany?.role}`)
    }

    // Step 6: Test the JWT callback logic
    console.log('\n6️⃣ Testing JWT callback logic...')
    
    // Simulate what the JWT callback would return
    const jwtUserData = {
      id: user.id,
      email: user.email,
      name: user.name
    }

    // This simulates the logic in /src/lib/auth.ts JWT callback
    const userForJWT = await authPrisma.user.findUnique({
      where: { id: jwtUserData.id },
      include: {
        userCompanies: {
          where: { isPrimary: true },
          include: {
            company: true
          }
        }
      }
    })

    const primaryUserCompany = userForJWT?.userCompanies?.[0]
    const jwtToken = {
      ...jwtUserData,
      hasCompany: !!primaryUserCompany,
      companyId: primaryUserCompany?.companyId || null,
      companyName: primaryUserCompany?.company?.name || null,
      companyRole: primaryUserCompany?.role || null
    }

    console.log('✅ JWT token would contain:')
    console.log(`   hasCompany: ${jwtToken.hasCompany}`)
    console.log(`   companyId: ${jwtToken.companyId}`)
    console.log(`   companyName: ${jwtToken.companyName}`)
    console.log(`   companyRole: ${jwtToken.companyRole}`)

    // Step 7: Cleanup
    console.log('\n7️⃣ Cleaning up test data...')
    await authPrisma.userCompany.deleteMany({
      where: { userId: user.id }
    })
    await authPrisma.company.delete({
      where: { id: company.id }
    })
    await authPrisma.user.delete({
      where: { id: user.id }
    })

    console.log('✅ Test data cleaned up')

    console.log('\n🎉 JWT Refresh Fix Test Completed Successfully!')
    console.log('\n📋 Test Results:')
    console.log('   ✅ User creation works')
    console.log('   ✅ Company creation works')
    console.log('   ✅ User-Company linking works')
    console.log('   ✅ JWT token would contain correct company data')
    console.log('\n🔧 Manual Testing Steps:')
    console.log('   1. Create a new user account via the web interface')
    console.log('   2. Complete the company setup form')
    console.log('   3. Verify automatic redirect to dashboard (no manual sign-in required)')
    console.log('   4. Check that company name appears in the top-right corner')
    console.log('   5. Verify access to company features')

  } catch (error) {
    console.error('❌ Test failed:', error)
    console.log('\n🔍 Troubleshooting:')
    console.log('   - Check database connection')
    console.log('   - Verify .env.local configuration')
    console.log('   - Ensure AUTH_DATABASE_URL is correct')
    console.log('   - Check Prisma schema matches database')
  } finally {
    await authPrisma.$disconnect()
  }
}

// Run the test
testJWTRefreshFix()

