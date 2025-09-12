// Create a new test user for JWT refresh fix testing
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

async function createJWTTestUser() {
  console.log('🧪 Creating JWT Test User...\n')

  try {
    // Create a unique test user
    const timestamp = Date.now()
    const testEmail = `jwttest${timestamp}@example.com`
    const testPassword = 'jwt123'
    const hashedPassword = await bcrypt.hash(testPassword, 12)

    console.log('📝 Creating user with credentials:')
    console.log(`   Email: ${testEmail}`)
    console.log(`   Password: ${testPassword}`)

    const user = await authPrisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        emailVerified: new Date(),
        name: 'JWT Test User'
      }
    })

    console.log('\n✅ User created successfully!')
    console.log(`   User ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Email Verified: ${user.emailVerified}`)

    // Verify user has no companies initially
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

    console.log(`\n🏢 Company Status: ${userWithCompanies.userCompanies.length} companies (should be 0)`)

    console.log('\n🎯 Test Instructions:')
    console.log('1. Navigate to http://localhost:3001/auth/signin')
    console.log(`2. Sign in with email: ${testEmail}`)
    console.log(`3. Sign in with password: ${testPassword}`)
    console.log('4. Complete the company setup form')
    console.log('5. Verify automatic redirect to dashboard (JWT refresh should work)')
    console.log('6. Check that company name appears in dashboard')

    return {
      email: testEmail,
      password: testPassword,
      userId: user.id
    }

  } catch (error) {
    console.error('❌ Failed to create test user:', error)
    throw error
  } finally {
    await authPrisma.$disconnect()
  }
}

// Run the function
createJWTTestUser().catch(console.error)

