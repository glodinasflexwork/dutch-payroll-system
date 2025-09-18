require('dotenv').config()

async function testNextAuthDebug() {
  console.log('🔍 Testing NextAuth.js authentication debug...\n')

  const { PrismaClient } = require('@prisma/client')
  const bcrypt = require('bcryptjs')
  
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
    // Step 1: Create test user
    console.log('1. Creating test user...')
    
    const testEmail = `nextauth.${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'
    const hashedPassword = await bcrypt.hash(testPassword, 12)
    
    const user = await authClient.user.create({
      data: {
        name: 'NextAuth Debug User',
        email: testEmail,
        password: hashedPassword,
        emailVerified: new Date()
      }
    })
    
    testUserId = user.id
    
    const company = await authClient.company.create({
      data: {
        name: 'NextAuth Debug Company B.V.'
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
    
    console.log('✅ Test user created:', {
      email: testEmail,
      password: testPassword,
      userId: user.id,
      companyId: company.id
    })

    // Step 2: Test direct database query (what authorize function should do)
    console.log('\n2. Testing direct database query...')
    
    const dbUser = await authClient.user.findUnique({
      where: { email: testEmail.toLowerCase() },
      include: {
        Company: true,
        UserCompany: {
          include: {
            Company: true
          }
        }
      }
    })
    
    if (dbUser) {
      console.log('✅ User found in database:', {
        id: dbUser.id,
        email: dbUser.email,
        emailVerified: !!dbUser.emailVerified,
        hasPassword: !!dbUser.password,
        directCompany: dbUser.Company?.name,
        userCompanies: dbUser.UserCompany.length
      })
      
      // Test password verification
      const isPasswordValid = await bcrypt.compare(testPassword, dbUser.password)
      console.log('✅ Password verification:', isPasswordValid)
      
      if (dbUser.UserCompany.length > 0) {
        console.log('✅ UserCompany relationships:', dbUser.UserCompany.map(uc => ({
          companyName: uc.Company.name,
          role: uc.role,
          isActive: uc.isActive
        })))
      }
    } else {
      console.log('❌ User not found in database')
    }

    // Step 3: Test NextAuth signin with JSON
    console.log('\n3. Testing NextAuth signin with JSON...')
    
    const signinResponse = await fetch('http://localhost:3001/api/auth/signin/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        redirect: false
      })
    })
    
    console.log('Signin response status:', signinResponse.status)
    
    if (signinResponse.ok) {
      const signinResult = await signinResponse.json()
      console.log('✅ Signin result:', signinResult)
      
      if (signinResult.ok) {
        console.log('✅ Authentication successful!')
      } else {
        console.log('❌ Authentication failed:', signinResult.error)
      }
    } else {
      const errorText = await signinResponse.text()
      console.log('❌ Signin request failed:', errorText)
    }

    // Step 4: Test NextAuth callback URL method
    console.log('\n4. Testing NextAuth callback URL method...')
    
    const callbackResponse = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: testEmail,
        password: testPassword,
        callbackUrl: 'http://localhost:3001/payroll'
      }).toString(),
      redirect: 'manual'
    })
    
    console.log('Callback response status:', callbackResponse.status)
    console.log('Callback response location:', callbackResponse.headers.get('location'))
    
    const cookies = callbackResponse.headers.get('set-cookie')
    console.log('Cookies set:', cookies ? 'Yes' : 'No')
    
    if (cookies) {
      // Step 5: Test session with cookies
      console.log('\n5. Testing session with cookies...')
      
      const sessionResponse = await fetch('http://localhost:3001/api/auth/session', {
        headers: {
          'Cookie': cookies
        }
      })
      
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        console.log('✅ Session data:', JSON.stringify(sessionData, null, 2))
      } else {
        console.log('❌ Session failed:', sessionResponse.status)
      }
    }

    console.log('\n📋 DEBUG SUMMARY:')
    console.log('- User exists in database with correct password')
    console.log('- Company relationships are properly set up')
    console.log('- Need to check why NextAuth authorize function is not being called')

  } catch (error) {
    console.error('❌ Error in NextAuth debug test:', error.message)
    console.error(error.stack)
  } finally {
    // Cleanup
    if (testUserId && testCompanyId) {
      console.log('\n🧹 Cleaning up...')
      
      try {
        await authClient.userCompany.deleteMany({
          where: { userId: testUserId }
        })
        
        await authClient.company.delete({
          where: { id: testCompanyId }
        })
        
        await authClient.user.delete({
          where: { id: testUserId }
        })
        
        console.log('✅ Cleanup completed')
      } catch (cleanupError) {
        console.error('❌ Cleanup failed:', cleanupError.message)
      }
    }
    
    await authClient.$disconnect()
  }
}

testNextAuthDebug()
