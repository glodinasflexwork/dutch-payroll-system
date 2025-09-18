require('dotenv').config()
const bcrypt = require('bcryptjs')

async function testDirectAuth() {
  console.log('🔐 Testing direct authentication with angles.readier.7d@icloud.com...\n')

  const { PrismaClient } = require('@prisma/client')
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  })

  try {
    const credentials = {
      email: 'angles.readier.7d@icloud.com',
      password: 'Geheim@12'
    }

    console.log('1. 🔍 Testing the authorize function logic directly...')
    
    // Simulate the authorize function from NextAuth.js
    const user = await authClient.user.findUnique({
      where: { email: credentials.email },
      include: {
        Company: true,
        UserCompany: {
          include: {
            Company: true
          }
        }
      }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User found in database')

    // Check if email is verified
    if (!user.emailVerified) {
      console.log('❌ Email not verified')
      return
    }

    console.log('✅ Email is verified')

    // Check password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
    
    if (!isPasswordValid) {
      console.log('❌ Password is invalid')
      return
    }

    console.log('✅ Password is valid')

    // Get company information
    let company = user.Company
    let userRole = 'owner'

    if (!company && user.UserCompany && user.UserCompany.length > 0) {
      company = user.UserCompany[0].Company
      userRole = user.UserCompany[0].role
    }

    if (!company) {
      console.log('❌ No company found for user')
      return
    }

    console.log('✅ Company found')
    console.log(`   🏢 Company: ${company.name}`)
    console.log(`   👥 Role: ${userRole}`)

    // This is what should be returned by the authorize function
    const authResult = {
      id: user.id,
      email: user.email,
      name: user.name,
      companyId: company.id,
      companyName: company.name,
      companyRole: userRole
    }

    console.log('\n✅ AUTHENTICATION SUCCESSFUL!')
    console.log('   📋 Auth result that should be returned:')
    console.log('   ', JSON.stringify(authResult, null, 2))

    // Now test a simple login request to see what's actually happening
    console.log('\n2. 🚀 Testing actual NextAuth.js signin...')
    
    const loginResponse = await fetch('http://localhost:3001/api/auth/signin/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: credentials.email,
        password: credentials.password,
        redirect: 'false'
      })
    })

    console.log(`   📊 Response status: ${loginResponse.status}`)
    console.log(`   📋 Response headers:`)
    for (const [key, value] of loginResponse.headers.entries()) {
      console.log(`      ${key}: ${value}`)
    }

    if (loginResponse.status === 302) {
      const location = loginResponse.headers.get('location')
      console.log(`   ↪️ Redirect to: ${location}`)
      
      if (location && location.includes('error')) {
        console.log('   ❌ Login failed - redirected to error page')
      } else if (location && location.includes('signin')) {
        console.log('   ❌ Login failed - redirected back to signin')
      } else {
        console.log('   ✅ Login might have succeeded - redirected to callback')
      }
    }

    const responseText = await loginResponse.text()
    console.log(`   📄 Response body (first 200 chars): ${responseText.substring(0, 200)}...`)

  } catch (error) {
    console.error('❌ Direct auth test failed:', error.message)
  } finally {
    await authClient.$disconnect()
  }
}

// Run the direct auth test
testDirectAuth()
  .then(() => {
    console.log('\n🎯 Direct auth test complete!')
  })
  .catch((error) => {
    console.error('Direct auth test failed:', error.message)
    process.exit(1)
  })
