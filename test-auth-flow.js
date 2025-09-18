require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

// Initialize auth client directly
const authClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL
    }
  }
})

async function testAuthFlow() {
  console.log('🔍 Testing authentication flow and session creation...\n')

  try {
    // 1. Check if test user exists
    console.log('1. Checking test user...')
    const testUser = await authClient.user.findUnique({
      where: { email: 'testuser.demo@example.com' },
      include: {
        Company: true
      }
    })

    if (!testUser) {
      console.log('❌ Test user not found')
      return
    }

    console.log('✅ Test user found:', {
      id: testUser.id,
      email: testUser.email,
      emailVerified: testUser.emailVerified,
      hasCompany: !!testUser.Company,
      companyName: testUser.Company?.name
    })

    // 2. Check NextAuth sessions
    console.log('\n2. Checking NextAuth sessions...')
    const sessions = await authClient.session.findMany({
      where: { userId: testUser.id },
      include: {
        User: {
          include: {
            Company: true
          }
        }
      }
    })

    console.log(`Found ${sessions.length} sessions for user`)
    sessions.forEach((session, index) => {
      console.log(`Session ${index + 1}:`, {
        id: session.id,
        expires: session.expires,
        userId: session.userId,
        userEmail: session.User.email,
        companyName: session.User.Company?.name
      })
    })

    // 3. Test subscription status
    console.log('\n3. Testing subscription status...')
    if (testUser.Company) {
      const subscription = await authClient.subscription.findFirst({
        where: { companyId: testUser.Company.id },
        include: {
          Plan: true
        }
      })

      if (subscription) {
        console.log('✅ Subscription found:', {
          planName: subscription.Plan.name,
          status: subscription.status,
          isTrialActive: subscription.isTrialActive,
          trialEnd: subscription.trialEnd
        })
      } else {
        console.log('❌ No subscription found for company')
      }
    }

    console.log('\n✅ Authentication flow test completed successfully!')

  } catch (error) {
    console.error('❌ Error testing authentication flow:', error)
  } finally {
    await authClient.$disconnect()
  }
}

testAuthFlow()
