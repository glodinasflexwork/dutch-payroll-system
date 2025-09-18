require('dotenv').config()

async function testNextAuthSignin() {
  console.log('🔍 Testing NextAuth.js signin and session creation...\n')

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
    // Step 1: Create a verified test user
    console.log('1. Creating verified test user...')
    
    const bcrypt = require('bcryptjs')
    const timestamp = Date.now()
    const testEmail = `signin.${timestamp}@example.com`
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12)
    
    const user = await authClient.user.create({
      data: {
        name: 'Signin Test User',
        email: testEmail,
        password: hashedPassword,
        emailVerified: new Date() // Already verified
      }
    })
    
    testUserId = user.id
    console.log('✅ User created:', user.id)
    
    // Create company and subscription
    const company = await authClient.company.create({
      data: {
        name: 'Signin Test Company B.V.'
      }
    })
    
    testCompanyId = company.id
    
    await authClient.userCompany.create({
      data: {
        userId: user.id,
        companyId: company.id,
        role: 'owner'
      }
    })
    
    await authClient.user.update({
      where: { id: user.id },
      data: { companyId: company.id }
    })
    
    // Create trial plan if it doesn't exist
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
    
    // Create trial subscription
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
    
    console.log('✅ Company and trial subscription created')

    // Step 2: Test NextAuth providers endpoint
    console.log('\n2. Testing NextAuth providers...')
    
    const providersResponse = await fetch('http://localhost:3001/api/auth/providers')
    
    if (providersResponse.ok) {
      const providers = await providersResponse.json()
      console.log('✅ Providers available:', Object.keys(providers))
      
      if (providers.credentials) {
        console.log('✅ Credentials provider configured')
      } else {
        console.log('❌ Credentials provider not found')
      }
    } else {
      console.log('❌ Providers endpoint failed:', providersResponse.status)
    }

    // Step 3: Test signin with NextAuth callback URL
    console.log('\n3. Testing NextAuth signin...')
    
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
      redirect: 'manual' // Don't follow redirects
    })
    
    console.log('Signin response status:', signinResponse.status)
    console.log('Signin response headers:', Object.fromEntries(signinResponse.headers.entries()))
    
    const cookies = signinResponse.headers.get('set-cookie')
    console.log('Cookies set:', cookies ? 'Yes' : 'No')
    
    if (cookies) {
      console.log('Cookie details:', cookies.substring(0, 200) + '...')
    }

    // Step 4: Test session with cookies
    console.log('\n4. Testing session with cookies...')
    
    const sessionResponse = await fetch('http://localhost:3001/api/auth/session', {
      headers: {
        'Cookie': cookies || ''
      }
    })
    
    if (sessionResponse.ok) {
      const session = await sessionResponse.json()
      console.log('✅ Session response:', {
        hasUser: !!session.user,
        userId: session.user?.id,
        email: session.user?.email,
        companyId: session.user?.companyId,
        companyName: session.user?.companyName
      })
      
      if (session.user) {
        console.log('✅ Session created successfully!')
      } else {
        console.log('❌ Session exists but no user data')
      }
    } else {
      console.log('❌ Session endpoint failed:', sessionResponse.status)
      const errorText = await sessionResponse.text()
      console.log('Session error:', errorText)
    }

    // Step 5: Test CSRF token
    console.log('\n5. Testing CSRF token...')
    
    const csrfResponse = await fetch('http://localhost:3001/api/auth/csrf')
    
    if (csrfResponse.ok) {
      const csrf = await csrfResponse.json()
      console.log('✅ CSRF token available:', !!csrf.csrfToken)
    } else {
      console.log('❌ CSRF endpoint failed:', csrfResponse.status)
    }

    // Step 6: Test direct credentials authentication
    console.log('\n6. Testing direct credentials authentication...')
    
    const directAuthResponse = await fetch('http://localhost:3001/api/auth/signin/credentials', {
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
    
    console.log('Direct auth response status:', directAuthResponse.status)
    
    if (directAuthResponse.ok) {
      const authResult = await directAuthResponse.json()
      console.log('✅ Direct auth result:', {
        ok: authResult.ok,
        status: authResult.status,
        url: authResult.url,
        error: authResult.error
      })
    } else {
      const errorText = await directAuthResponse.text()
      console.log('❌ Direct auth failed:', errorText)
    }

    console.log('\n📋 DIAGNOSIS:')
    console.log('- User exists and is verified')
    console.log('- Company and trial subscription are active')
    console.log('- NextAuth.js providers are configured')
    console.log('- Need to check why session creation is failing')

  } catch (error) {
    console.error('❌ Error in NextAuth signin test:', error.message)
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

testNextAuthSignin()
