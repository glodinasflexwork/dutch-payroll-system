require('dotenv').config()

async function testFixedLogin() {
  console.log('🔐 Testing fixed NextAuth.js login...\n')

  const baseUrl = 'http://localhost:3001'
  const credentials = {
    email: 'angles.readier.7d@icloud.com',
    password: 'Geheim@12'
  }

  try {
    // Step 1: Get CSRF token
    console.log('1. 🔒 Getting CSRF token...')
    
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`)
    if (!csrfResponse.ok) {
      throw new Error(`CSRF request failed: ${csrfResponse.status}`)
    }
    
    const { csrfToken } = await csrfResponse.json()
    console.log('   ✅ CSRF token obtained')

    // Step 2: Test signin with proper form data
    console.log('\n2. 🚀 Testing signin with form data...')
    
    const formData = new URLSearchParams({
      email: credentials.email,
      password: credentials.password,
      csrfToken: csrfToken,
      redirect: 'false',
      json: 'true'
    })

    const signinResponse = await fetch(`${baseUrl}/api/auth/signin/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData.toString()
    })

    console.log(`   📊 Response status: ${signinResponse.status}`)
    console.log(`   📋 Response headers:`)
    for (const [key, value] of signinResponse.headers.entries()) {
      if (key.includes('set-cookie') || key.includes('location') || key.includes('content-type')) {
        console.log(`      ${key}: ${value}`)
      }
    }

    // Step 3: Handle different response types
    const contentType = signinResponse.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      console.log('\n   ✅ Received JSON response')
      const result = await signinResponse.json()
      console.log('   📋 Result:', result)
      
      if (result.ok) {
        console.log('   🎉 Login successful!')
      } else {
        console.log(`   ❌ Login failed: ${result.error}`)
      }
    } else if (signinResponse.status === 302) {
      const location = signinResponse.headers.get('location')
      console.log(`   ↪️ Redirect to: ${location}`)
      
      if (location && location.includes('error')) {
        console.log('   ❌ Login failed - redirected to error page')
      } else if (location && location.includes('signin')) {
        console.log('   ❌ Login failed - redirected back to signin')
      } else {
        console.log('   ✅ Login might have succeeded - redirected to callback')
      }
    } else {
      console.log('   ⚠️ Unexpected response type')
      const responseText = await signinResponse.text()
      console.log(`   📄 Response (first 200 chars): ${responseText.substring(0, 200)}...`)
    }

    // Step 4: Test alternative signin method
    console.log('\n3. 🔄 Testing alternative signin method...')
    
    const altSigninResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        csrfToken: csrfToken
      })
    })

    console.log(`   📊 Alternative response status: ${altSigninResponse.status}`)
    
    if (altSigninResponse.ok) {
      const altResult = await altSigninResponse.json()
      console.log('   📋 Alternative result:', altResult)
    }

    // Step 5: Test session after login attempt
    console.log('\n4. 🔍 Testing session...')
    
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        'Cookie': signinResponse.headers.get('set-cookie') || ''
      }
    })
    
    if (sessionResponse.ok) {
      const session = await sessionResponse.json()
      console.log('   📋 Session:', session)
      
      if (session.user) {
        console.log('   ✅ Session created successfully!')
        console.log(`   👤 User: ${session.user.email}`)
        console.log(`   🏢 Company: ${session.user.companyName}`)
      } else {
        console.log('   ❌ No user in session')
      }
    } else {
      console.log('   ❌ Session request failed')
    }

  } catch (error) {
    console.error('❌ Fixed login test failed:', error.message)
  }
}

// Run the fixed login test
testFixedLogin()
  .then(() => {
    console.log('\n🎯 Fixed login test complete!')
  })
  .catch((error) => {
    console.error('Fixed login test error:', error.message)
    process.exit(1)
  })
