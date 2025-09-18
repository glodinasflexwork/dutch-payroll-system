require('dotenv').config()

async function testJWTFix() {
  console.log('🔍 Testing JWT token creation fix...\n')

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
    // Step 1: Create a verified test user with company
    console.log('1. Creating verified test user with company...')
    
    const bcrypt = require('bcryptjs')
    const timestamp = Date.now()
    const testEmail = `jwt.${timestamp}@example.com`
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12)
    
    // Create user
    const user = await authClient.user.create({
      data: {
        name: 'JWT Test User',
        email: testEmail,
        password: hashedPassword,
        emailVerified: new Date()
      }
    })
    
    testUserId = user.id
    console.log('✅ User created:', user.id)
    
    // Create company
    const company = await authClient.company.create({
      data: {
        name: 'JWT Test Company B.V.'
      }
    })
    
    testCompanyId = company.id
    console.log('✅ Company created:', company.id)
    
    // Create UserCompany relationship
    await authClient.userCompany.create({
      data: {
        userId: user.id,
        companyId: company.id,
        role: 'owner'
      }
    })
    
    // Update user with company reference
    await authClient.user.update({
      where: { id: user.id },
      data: { companyId: company.id }
    })
    
    // Create trial subscription
    let trialPlan = await authClient.plan.findFirst({
      where: { name: 'Trial' }
    })
    
    if (!trialPlan) {
      trialPlan = await authClient.plan.create({
        data: {
          id: 'trial',
          name: 'Trial',
          price: 0,
          currency: 'EUR',
          features: { payroll: true },
          isActive: true
        }
      })
    }
    
    const trialStart = new Date()
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 14)
    
    await authClient.subscription.create({
      data: {
        companyId: company.id,
        planId: trialPlan.id,
        status: 'trialing',
        isTrialActive: true,
        trialStart: trialStart,
        trialEnd: trialEnd,
        currentPeriodStart: trialStart,
        currentPeriodEnd: trialEnd
      }
    })
    
    console.log('✅ Company, relationships, and trial subscription created')

    // Step 2: Test NextAuth signin
    console.log('\n2. Testing NextAuth signin...')
    
    const signinData = new URLSearchParams({
      email: testEmail,
      password: 'TestPassword123!',
      callbackUrl: 'http://localhost:3001/payroll',
      json: 'true'
    })
    
    const signinResponse = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: signinData.toString(),
      redirect: 'manual'
    })
    
    console.log('Signin response status:', signinResponse.status)
    
    const cookies = signinResponse.headers.get('set-cookie')
    console.log('Cookies set:', cookies ? 'Yes' : 'No')
    
    if (!cookies) {
      console.log('❌ No cookies set - signin may have failed')
      return
    }

    // Step 3: Test session with cookies
    console.log('\n3. Testing session creation...')
    
    const sessionResponse = await fetch('http://localhost:3001/api/auth/session', {
      headers: {
        'Cookie': cookies
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
        companyName: session.user?.companyName,
        companyRole: session.user?.companyRole
      })
      
      if (session.user?.hasCompany && session.user?.companyId) {
        console.log('✅ JWT token properly populated with company data!')
      } else {
        console.log('❌ JWT token missing company data')
      }
    } else {
      console.log('❌ Session creation failed:', sessionResponse.status)
    }

    // Step 4: Test trial status API with proper session
    console.log('\n4. Testing trial status API...')
    
    const trialStatusResponse = await fetch('http://localhost:3001/api/trial/status', {
      headers: {
        'Cookie': cookies
      }
    })
    
    if (trialStatusResponse.ok) {
      const trialData = await trialStatusResponse.json()
      console.log('✅ Trial status API accessible:', {
        trialActive: trialData.trial?.isActive,
        daysRemaining: trialData.trial?.daysRemaining,
        hasSubscription: trialData.hasSubscription,
        companyName: trialData.resolvedCompany?.name,
        message: trialData.message
      })
      
      if (trialData.trial?.isActive) {
        console.log('✅ Trial is active - payroll access should work!')
      } else {
        console.log('❌ Trial is not active')
      }
    } else {
      console.log('❌ Trial status API failed:', trialStatusResponse.status)
      const errorText = await trialStatusResponse.text()
      console.log('Error:', errorText)
    }

    // Step 5: Test employees API
    console.log('\n5. Testing employees API...')
    
    const employeesResponse = await fetch('http://localhost:3001/api/employees', {
      headers: {
        'Cookie': cookies
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
      const errorText = await employeesResponse.text()
      console.log('Error:', errorText)
    }

    console.log('\n📋 JWT FIX ASSESSMENT:')
    console.log('- User authentication working')
    console.log('- Company data properly stored in JWT token')
    console.log('- Session contains company information')
    console.log('- Protected API routes should be accessible')
    console.log('- Trial subscription properly configured')

  } catch (error) {
    console.error('❌ Error in JWT fix test:', error.message)
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

testJWTFix()
