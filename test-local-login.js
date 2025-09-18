require('dotenv').config()

async function testLocalLogin() {
  console.log('🔐 Testing local login with angles.readier.7d@icloud.com...\n')

  const baseUrl = 'http://localhost:3001'
  const credentials = {
    email: 'angles.readier.7d@icloud.com',
    password: 'Geheim@12'
  }

  try {
    // Step 1: Check if the user exists in the local database
    console.log('1. 🔍 Checking if user exists in local database...')
    
    const { PrismaClient } = require('@prisma/client')
    const authClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.AUTH_DATABASE_URL
        }
      }
    })

    const user = await authClient.user.findUnique({
      where: { email: credentials.email },
      include: {
        Company: {
          include: {
            Subscription: true
          }
        },
        UserCompany: {
          include: {
            Company: {
              include: {
                Subscription: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      console.log('❌ User not found in local database')
      console.log('   This account was created on production, not locally')
      console.log('   Local and production use different databases')
      await authClient.$disconnect()
      return
    }

    console.log('✅ User found in local database!')
    console.log(`   👤 Name: ${user.name}`)
    console.log(`   📧 Email: ${user.email}`)
    console.log(`   ✉️ Email Verified: ${!!user.emailVerified}`)
    console.log(`   🆔 User ID: ${user.id}`)

    // Check subscription status
    let subscription = user.Company?.Subscription || user.UserCompany?.[0]?.Company?.Subscription
    if (subscription) {
      console.log('\n🎁 Subscription Status:')
      console.log(`   📊 Status: ${subscription.status}`)
      console.log(`   ✅ Trial Active: ${subscription.isTrialActive}`)
      console.log(`   📅 Trial End: ${subscription.trialEnd}`)
    } else {
      console.log('\n❌ No subscription found')
    }

    await authClient.$disconnect()

    // Step 2: Test signin page accessibility
    console.log('\n2. 📄 Testing signin page...')
    
    const signinPageResponse = await fetch(`${baseUrl}/auth/signin`)
    console.log(`   📊 Signin page status: ${signinPageResponse.status}`)
    
    if (!signinPageResponse.ok) {
      throw new Error(`Signin page not accessible: ${signinPageResponse.status}`)
    }

    // Step 3: Get CSRF token
    console.log('\n3. 🔒 Getting CSRF token...')
    
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`)
    if (!csrfResponse.ok) {
      throw new Error(`CSRF token request failed: ${csrfResponse.status}`)
    }
    
    const { csrfToken } = await csrfResponse.json()
    console.log('   ✅ CSRF token obtained')

    // Step 4: Attempt login
    console.log('\n4. 🚀 Attempting login...')
    
    const loginResponse = await fetch(`${baseUrl}/api/auth/signin/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        csrfToken: csrfToken,
        redirect: false
      })
    })

    console.log(`   📊 Login response status: ${loginResponse.status}`)
    
    if (loginResponse.ok) {
      const loginResult = await loginResponse.json()
      console.log(`   📋 Login result:`, loginResult)
      
      if (loginResult.ok) {
        console.log('   ✅ Login successful!')
        
        // Step 5: Test session
        console.log('\n5. 🔍 Testing session...')
        
        const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
          headers: {
            'Cookie': loginResponse.headers.get('set-cookie') || ''
          }
        })
        
        if (sessionResponse.ok) {
          const session = await sessionResponse.json()
          console.log('   ✅ Session created successfully')
          console.log(`   👤 Session user: ${session.user?.email}`)
          console.log(`   🏢 Company: ${session.user?.companyName}`)
        } else {
          console.log('   ❌ Session creation failed')
        }
        
        // Step 6: Test payroll access
        console.log('\n6. 🧾 Testing payroll page access...')
        
        const payrollResponse = await fetch(`${baseUrl}/payroll`, {
          headers: {
            'Cookie': loginResponse.headers.get('set-cookie') || ''
          }
        })
        
        console.log(`   📊 Payroll page status: ${payrollResponse.status}`)
        
        if (payrollResponse.ok) {
          console.log('   ✅ Payroll page accessible after login!')
        } else {
          console.log('   ❌ Payroll page still not accessible')
        }
        
      } else {
        console.log(`   ❌ Login failed: ${loginResult.error}`)
      }
    } else {
      const errorText = await loginResponse.text()
      console.log(`   ❌ Login request failed: ${errorText}`)
    }

    console.log('\n🎯 LOCAL LOGIN TEST SUMMARY:')
    console.log(`✅ User exists: ${!!user}`)
    console.log(`✅ Signin page: Accessible`)
    console.log(`✅ CSRF token: Working`)
    console.log(`${loginResponse.ok ? '✅' : '❌'} Login attempt: ${loginResponse.ok ? 'Success' : 'Failed'}`)

  } catch (error) {
    console.error('❌ Local login test failed:', error.message)
    
    if (error.message.includes('connect')) {
      console.log('\n💡 Database connection issue.')
      console.log('   Make sure the local database is running and accessible.')
    }
  }
}

// Run the local login test
testLocalLogin()
  .then(() => {
    console.log('\n🎯 Local login test complete!')
  })
  .catch((error) => {
    console.error('Local login test error:', error.message)
    process.exit(1)
  })
