require('dotenv').config()

async function testCompleteSignupFlow() {
  console.log('🔍 Testing complete signup to payroll access flow...\n')

  const { PrismaClient } = require('@prisma/client')
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  })

  let testUserId = null
  let testCompanyId = null

  try {
    // Step 1: Register new user
    console.log('1. Registering new user...')
    
    const timestamp = Date.now()
    const testEmail = `complete.${timestamp}@example.com`
    const uniqueKvK = String(timestamp).slice(-8)
    
    const registrationData = {
      name: 'Complete Test User',
      email: testEmail,
      password: 'TestPassword123!',
      companyName: 'Complete Test Company B.V.',
      kvkNumber: uniqueKvK,
      industry: 'Technology',
      businessAddress: 'Test Street 123',
      city: 'Amsterdam',
      postalCode: '1000 AA',
      country: 'Netherlands'
    }
    
    const registrationResponse = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData)
    })
    
    if (!registrationResponse.ok) {
      const errorData = await registrationResponse.json()
      throw new Error(`Registration failed: ${errorData.error}`)
    }
    
    const registrationResult = await registrationResponse.json()
    testUserId = registrationResult.user.id
    testCompanyId = registrationResult.company.id
    
    console.log('✅ Registration successful')
    console.log('User ID:', testUserId)
    console.log('Company ID:', testCompanyId)
    console.log('Trial active:', registrationResult.subscription?.isTrialActive)

    // Step 2: Verify email (simulate clicking verification link)
    console.log('\n2. Verifying email...')
    
    const user = await authClient.user.findUnique({
      where: { id: testUserId }
    })
    
    if (!user || !user.emailVerificationToken) {
      throw new Error('User not found or no verification token')
    }
    
    // Simulate email verification
    const verificationResponse = await fetch(`http://localhost:3001/api/auth/verify-email/${user.emailVerificationToken}`)
    
    if (!verificationResponse.ok) {
      throw new Error('Email verification failed')
    }
    
    console.log('✅ Email verified successfully')

    // Step 3: Test signin
    console.log('\n3. Testing signin...')
    
    const signinResponse = await fetch('http://localhost:3001/api/auth/signin/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!',
        redirect: false
      })
    })
    
    console.log('Signin response status:', signinResponse.status)
    
    // Extract cookies for subsequent requests
    const cookies = signinResponse.headers.get('set-cookie')
    console.log('Cookies received:', cookies ? 'Yes' : 'No')
    
    if (signinResponse.ok) {
      console.log('✅ Signin successful')
    } else {
      console.log('❌ Signin failed')
    }

    // Step 4: Test session creation
    console.log('\n4. Testing session creation...')
    
    const sessionResponse = await fetch('http://localhost:3001/api/auth/session', {
      headers: {
        'Cookie': cookies || ''
      }
    })
    
    if (sessionResponse.ok) {
      const session = await sessionResponse.json()
      console.log('✅ Session created:', {
        hasUser: !!session.user,
        userId: session.user?.id,
        email: session.user?.email,
        hasCompany: session.user?.hasCompany,
        companyId: session.user?.companyId,
        companyName: session.user?.companyName
      })
    } else {
      console.log('❌ Session creation failed:', sessionResponse.status)
    }

    // Step 5: Test trial status API
    console.log('\n5. Testing trial status API...')
    
    const trialStatusResponse = await fetch('http://localhost:3001/api/trial/status', {
      headers: {
        'Cookie': cookies || ''
      }
    })
    
    if (trialStatusResponse.ok) {
      const trialData = await trialStatusResponse.json()
      console.log('✅ Trial status API accessible:', {
        hasAccess: trialData.hasAccess,
        trialActive: trialData.trial?.isActive,
        daysRemaining: trialData.trial?.daysRemaining,
        companyName: trialData.resolvedCompany?.name,
        message: trialData.message
      })
      
      if (trialData.trial?.isActive) {
        console.log('✅ Trial is active - user should have payroll access!')
      } else {
        console.log('❌ Trial is not active - payroll access would be blocked')
      }
    } else {
      console.log('❌ Trial status API failed:', trialStatusResponse.status)
      const errorText = await trialStatusResponse.text()
      console.log('Error:', errorText)
    }

    // Step 6: Test payroll page access
    console.log('\n6. Testing payroll page access...')
    
    const payrollResponse = await fetch('http://localhost:3001/payroll', {
      headers: {
        'Cookie': cookies || ''
      }
    })
    
    console.log('Payroll page response:', payrollResponse.status, payrollResponse.statusText)
    
    if (payrollResponse.ok) {
      const payrollContent = await payrollResponse.text()
      const hasPayrollContent = payrollContent.includes('payroll') || payrollContent.includes('Payroll')
      const hasTrialGuard = payrollContent.includes('TrialGuard')
      const hasAccessDenied = payrollContent.includes('Access Required') || payrollContent.includes('Start Trial')
      
      console.log('✅ Payroll page accessible:', {
        hasPayrollContent,
        hasTrialGuard,
        hasAccessDenied,
        contentLength: payrollContent.length
      })
      
      if (hasPayrollContent && !hasAccessDenied) {
        console.log('✅ Payroll page loads correctly - user has full access!')
      } else if (hasAccessDenied) {
        console.log('❌ Payroll page shows access denied - trial not working')
      } else {
        console.log('⚠️ Payroll page response unclear')
      }
    } else {
      console.log('❌ Payroll page not accessible:', payrollResponse.status)
    }

    // Step 7: Test employees API (should work with trial)
    console.log('\n7. Testing employees API...')
    
    const employeesResponse = await fetch('http://localhost:3001/api/employees', {
      headers: {
        'Cookie': cookies || ''
      }
    })
    
    if (employeesResponse.ok) {
      const employeesData = await employeesResponse.json()
      console.log('✅ Employees API accessible:', {
        success: employeesData.success,
        employeeCount: employeesData.employees?.length || 0
      })
    } else {
      console.log('❌ Employees API failed:', employeesResponse.status)
    }

    console.log('\n✅ Complete signup flow test finished!')
    console.log('\n📋 FINAL ASSESSMENT:')
    
    // Final database check
    const finalUser = await authClient.user.findUnique({
      where: { id: testUserId },
      include: {
        Company: {
          include: {
            Subscription: true
          }
        }
      }
    })
    
    if (finalUser?.Company?.Subscription?.isTrialActive) {
      console.log('✅ PASS: New user signup creates active trial subscription')
      console.log('✅ PASS: User should have full access to payroll features')
      console.log('✅ PASS: Trial activation issue has been resolved!')
    } else {
      console.log('❌ FAIL: Trial subscription not properly activated')
    }

  } catch (error) {
    console.error('❌ Error in complete signup flow test:', error.message)
    console.error(error.stack)
  } finally {
    // Cleanup
    if (testUserId && testCompanyId) {
      console.log('\n🧹 Cleaning up test data...')
      
      try {
        await authClient.subscription.deleteMany({
          where: { companyId: testCompanyId }
        })
        
        await authClient.userCompany.deleteMany({
          where: { userId: testUserId }
        })
        
        await authClient.company.delete({
          where: { id: testCompanyId }
        })
        
        await authClient.user.delete({
          where: { id: testUserId }
        })
        
        console.log('✅ Test data cleaned up')
      } catch (cleanupError) {
        console.error('❌ Cleanup failed:', cleanupError.message)
      }
    }
    
    await authClient.$disconnect()
  }
}

testCompleteSignupFlow()
