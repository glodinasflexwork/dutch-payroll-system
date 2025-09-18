require('dotenv').config()

async function testSimpleAuth() {
  console.log('🔍 Testing simple authentication flow...\n')

  try {
    // Step 1: Test NextAuth providers
    console.log('1. Testing NextAuth providers...')
    
    const providersResponse = await fetch('http://localhost:3001/api/auth/providers')
    
    if (providersResponse.ok) {
      const providers = await providersResponse.json()
      console.log('✅ Providers available:', Object.keys(providers))
    } else {
      console.log('❌ Providers failed:', providersResponse.status)
      return
    }

    // Step 2: Get CSRF token
    console.log('\n2. Getting CSRF token...')
    
    const csrfResponse = await fetch('http://localhost:3001/api/auth/csrf')
    
    if (!csrfResponse.ok) {
      console.log('❌ CSRF failed:', csrfResponse.status)
      return
    }
    
    const { csrfToken } = await csrfResponse.json()
    console.log('✅ CSRF token obtained')

    // Step 3: Create a test user manually in database
    console.log('\n3. Creating test user in database...')
    
    const { PrismaClient } = require('@prisma/client')
    const bcrypt = require('bcryptjs')
    
    const authClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.AUTH_DATABASE_URL
        }
      }
    })
    
    const testEmail = `simple.${Date.now()}@example.com`
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12)
    
    const user = await authClient.user.create({
      data: {
        name: 'Simple Test User',
        email: testEmail,
        password: hashedPassword,
        emailVerified: new Date()
      }
    })
    
    const company = await authClient.company.create({
      data: {
        name: 'Simple Test Company B.V.'
      }
    })
    
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
    
    console.log('✅ Test user created:', {
      id: user.id,
      email: testEmail,
      companyId: company.id
    })

    // Step 4: Test signin with form data
    console.log('\n4. Testing signin with form data...')
    
    const formData = new FormData()
    formData.append('email', testEmail)
    formData.append('password', 'TestPassword123!')
    formData.append('csrfToken', csrfToken)
    formData.append('callbackUrl', 'http://localhost:3001/payroll')
    
    const signinResponse = await fetch('http://localhost:3001/api/auth/signin/credentials', {
      method: 'POST',
      body: formData,
      redirect: 'manual'
    })
    
    console.log('Signin response status:', signinResponse.status)
    console.log('Signin response headers:', Object.fromEntries(signinResponse.headers.entries()))
    
    const cookies = signinResponse.headers.get('set-cookie')
    console.log('Cookies received:', cookies ? 'Yes' : 'No')
    
    if (cookies) {
      console.log('Cookie sample:', cookies.substring(0, 100) + '...')
    }

    // Step 5: Test session endpoint
    console.log('\n5. Testing session endpoint...')
    
    const sessionResponse = await fetch('http://localhost:3001/api/auth/session', {
      headers: {
        'Cookie': cookies || ''
      }
    })
    
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json()
      console.log('✅ Session data:', JSON.stringify(sessionData, null, 2))
      
      if (sessionData.user) {
        console.log('✅ User found in session!')
        console.log('User details:', {
          id: sessionData.user.id,
          email: sessionData.user.email,
          hasCompany: sessionData.user.hasCompany,
          companyId: sessionData.user.companyId,
          companyName: sessionData.user.companyName
        })
      } else {
        console.log('❌ No user in session')
      }
    } else {
      console.log('❌ Session endpoint failed:', sessionResponse.status)
      const errorText = await sessionResponse.text()
      console.log('Session error:', errorText)
    }

    // Step 6: Test a simple API endpoint
    console.log('\n6. Testing simple API endpoint...')
    
    const testApiResponse = await fetch('http://localhost:3001/api/auth/providers', {
      headers: {
        'Cookie': cookies || ''
      }
    })
    
    console.log('Test API response:', testApiResponse.status)

    // Cleanup
    console.log('\n🧹 Cleaning up...')
    
    await authClient.userCompany.deleteMany({
      where: { userId: user.id }
    })
    
    await authClient.company.delete({
      where: { id: company.id }
    })
    
    await authClient.user.delete({
      where: { id: user.id }
    })
    
    await authClient.$disconnect()
    
    console.log('✅ Cleanup completed')

  } catch (error) {
    console.error('❌ Error in simple auth test:', error.message)
    console.error(error.stack)
  }
}

testSimpleAuth()
