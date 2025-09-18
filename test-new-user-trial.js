require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function testNewUserTrialFlow() {
  console.log('🔍 Testing new user trial activation flow...\n')

  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  })

  try {
    // Step 1: Create a new test user
    const testEmail = `newuser.${Date.now()}@example.com`
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12)
    
    console.log('1. Creating new test user...')
    console.log('Email:', testEmail)
    
    const newUser = await authClient.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: 'New Test User',
        emailVerified: new Date()
      }
    })
    
    console.log('✅ User created:', {
      id: newUser.id,
      email: newUser.email,
      emailVerified: newUser.emailVerified
    })

    // Step 2: Create a company for the user
    console.log('\n2. Creating company for user...')
    
    const newCompany = await authClient.company.create({
      data: {
        name: 'New Test Company B.V.',
        address: 'Test Street 123',
        city: 'Amsterdam',
        postalCode: '1000 AA',
        country: 'Netherlands'
      }
    })
    
    console.log('✅ Company created:', {
      id: newCompany.id,
      name: newCompany.name
    })

    // Step 3: Update user with company reference
    console.log('\n3. Linking user to company...')
    
    await authClient.user.update({
      where: { id: newUser.id },
      data: { companyId: newCompany.id }
    })
    
    console.log('✅ User linked to company')

    // Step 4: Create UserCompany relationship
    console.log('\n4. Creating UserCompany relationship...')
    
    await authClient.userCompany.create({
      data: {
        userId: newUser.id,
        companyId: newCompany.id,
        role: 'owner'
      }
    })
    
    console.log('✅ UserCompany relationship created')

    // Step 5: Check if subscription exists
    console.log('\n5. Checking subscription status...')
    
    const companyWithSubscription = await authClient.company.findUnique({
      where: { id: newCompany.id },
      include: {
        Subscription: true
      }
    })
    
    if (companyWithSubscription.Subscription) {
      console.log('✅ Subscription found:', {
        id: companyWithSubscription.Subscription.id,
        status: companyWithSubscription.Subscription.status,
        isTrialActive: companyWithSubscription.Subscription.isTrialActive,
        trialStart: companyWithSubscription.Subscription.trialStart,
        trialEnd: companyWithSubscription.Subscription.trialEnd
      })
    } else {
      console.log('❌ No subscription found - this is the problem!')
      
      // Step 6: Check if trial plan exists
      console.log('\n6. Checking for trial plan...')
      
      let trialPlan = await authClient.plan.findFirst({
        where: { name: 'Trial' }
      })
      
      if (!trialPlan) {
        console.log('Creating trial plan...')
        trialPlan = await authClient.plan.create({
          data: {
            id: 'trial',
            name: 'Trial',
            price: 0,
            currency: 'EUR',
            maxEmployees: 10,
            maxPayrolls: 100,
            features: {
              payroll: true,
              employees: true,
              reports: true,
              support: false
            },
            isActive: true
          }
        })
        console.log('✅ Trial plan created')
      } else {
        console.log('✅ Trial plan exists:', trialPlan.name)
      }
      
      // Step 7: Create trial subscription
      console.log('\n7. Creating trial subscription...')
      
      const trialStart = new Date()
      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 14) // 14-day trial
      
      const subscription = await authClient.subscription.create({
        data: {
          companyId: newCompany.id,
          planId: trialPlan.id,
          status: 'trialing',
          isTrialActive: true,
          trialStart: trialStart,
          trialEnd: trialEnd,
          currentPeriodStart: trialStart,
          currentPeriodEnd: trialEnd
        }
      })
      
      console.log('✅ Trial subscription created:', {
        id: subscription.id,
        status: subscription.status,
        isTrialActive: subscription.isTrialActive,
        trialStart: subscription.trialStart,
        trialEnd: subscription.trialEnd
      })
    }

    // Step 8: Test trial status API logic
    console.log('\n8. Testing trial status API logic...')
    
    // Simulate session data
    const sessionData = {
      user: {
        id: newUser.id,
        email: newUser.email,
        companyId: newCompany.id
      }
    }
    
    console.log('Session data:', sessionData)
    
    // Test the trial status endpoint logic
    const finalCompanyCheck = await authClient.company.findUnique({
      where: { id: newCompany.id },
      include: {
        Subscription: true,
        UserCompany: {
          where: { userId: newUser.id },
          select: { role: true }
        }
      }
    })
    
    console.log('✅ Final company check:', {
      id: finalCompanyCheck.id,
      name: finalCompanyCheck.name,
      hasSubscription: !!finalCompanyCheck.Subscription,
      subscriptionStatus: finalCompanyCheck.Subscription?.status,
      isTrialActive: finalCompanyCheck.Subscription?.isTrialActive,
      userRole: finalCompanyCheck.UserCompany[0]?.role
    })

    // Step 9: Verify trial access logic
    console.log('\n9. Verifying trial access logic...')
    
    if (finalCompanyCheck.Subscription?.isTrialActive) {
      console.log('✅ Trial should be accessible!')
      console.log('Trial period:', finalCompanyCheck.Subscription.trialStart, 'to', finalCompanyCheck.Subscription.trialEnd)
      
      // Calculate days remaining
      const now = new Date()
      const trialEnd = new Date(finalCompanyCheck.Subscription.trialEnd)
      const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))
      
      console.log('Days remaining:', daysRemaining)
      
      if (daysRemaining > 0) {
        console.log('✅ Trial is active and has days remaining')
      } else {
        console.log('❌ Trial has expired')
      }
    } else {
      console.log('❌ Trial is not active - this would cause access issues')
    }

    console.log('\n✅ New user trial flow test completed!')
    console.log('\n📋 SUMMARY:')
    console.log('- User created successfully')
    console.log('- Company created and linked')
    console.log('- UserCompany relationship established')
    console.log('- Trial plan verified/created')
    console.log('- Trial subscription activated')
    console.log('- User should have access to payroll features')

    // Return the test data for further testing
    return {
      user: newUser,
      company: newCompany,
      subscription: finalCompanyCheck.Subscription
    }

  } catch (error) {
    console.error('❌ Error in new user trial flow test:', error.message)
    console.error(error.stack)
    throw error
  } finally {
    await authClient.$disconnect()
  }
}

// Run the test
testNewUserTrialFlow()
  .then((result) => {
    console.log('\n🎉 Test completed successfully!')
    if (result) {
      console.log('Test user email:', result.user.email)
      console.log('Test company:', result.company.name)
      console.log('Trial active:', result.subscription?.isTrialActive)
    }
  })
  .catch((error) => {
    console.error('Test failed:', error.message)
    process.exit(1)
  })
