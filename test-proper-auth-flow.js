require('dotenv').config()

async function testProperAuthFlow() {
  console.log('🔐 Testing proper NextAuth.js authentication flow...\n')

  const baseUrl = 'http://localhost:3001'
  const credentials = {
    email: 'angles.readier.7d@icloud.com',
    password: 'Geheim@12'
  }

  try {
    // Step 1: Check if NextAuth.js providers are available
    console.log('1. 🔍 Checking NextAuth.js providers...')
    
    const providersResponse = await fetch(`${baseUrl}/api/auth/providers`)
    if (!providersResponse.ok) {
      throw new Error(`Providers request failed: ${providersResponse.status}`)
    }
    
    const providers = await providersResponse.json()
    console.log('   ✅ Providers available:', Object.keys(providers))
    
    if (!providers.credentials) {
      console.log('   ❌ Credentials provider not found!')
      return
    }
    
    console.log('   ✅ Credentials provider is available')

    // Step 2: Get CSRF token
    console.log('\n2. 🔒 Getting CSRF token...')
    
    const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`)
    if (!csrfResponse.ok) {
      throw new Error(`CSRF request failed: ${csrfResponse.status}`)
    }
    
    const { csrfToken } = await csrfResponse.json()
    console.log('   ✅ CSRF token obtained')

    // Step 3: Test the signin page to get any necessary cookies
    console.log('\n3. 📄 Accessing signin page to establish session...')
    
    const signinPageResponse = await fetch(`${baseUrl}/auth/signin`)
    if (!signinPageResponse.ok) {
      throw new Error(`Signin page not accessible: ${signinPageResponse.status}`)
    }
    
    const cookies = signinPageResponse.headers.get('set-cookie') || ''
    console.log('   ✅ Signin page accessible, cookies:', cookies ? 'received' : 'none')

    // Step 4: Attempt authentication using the callback URL method
    console.log('\n4. 🚀 Testing authentication via callback URL...')
    
    const callbackUrl = `${baseUrl}/api/auth/callback/credentials`
    
    const authResponse = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies
      },
      body: new URLSearchParams({
        email: credentials.email,
        password: credentials.password,
        csrfToken: csrfToken,
        callbackUrl: baseUrl,
        redirect: 'false'
      }).toString(),
      redirect: 'manual' // Don't follow redirects automatically
    })

    console.log(`   📊 Auth response status: ${authResponse.status}`)
    console.log(`   📋 Auth response headers:`)
    for (const [key, value] of authResponse.headers.entries()) {
      if (key.includes('location') || key.includes('set-cookie') || key.includes('content-type')) {
        console.log(`      ${key}: ${value}`)
      }
    }

    // Step 5: Check what happened with the authentication
    if (authResponse.status === 302) {
      const location = authResponse.headers.get('location')
      console.log(`   ↪️ Redirected to: ${location}`)
      
      if (location && location.includes('error')) {
        console.log('   ❌ Authentication failed - redirected to error page')
        
        // Try to get the error details
        const errorUrl = new URL(location)
        const error = errorUrl.searchParams.get('error')
        console.log(`   📋 Error: ${error}`)
      } else if (location && location.includes('signin')) {
        console.log('   ❌ Authentication failed - redirected back to signin')
      } else {
        console.log('   ✅ Authentication might have succeeded!')
        
        // Step 6: Test session with the new cookies
        console.log('\n5. 🔍 Testing session with authentication cookies...')
        
        const authCookies = authResponse.headers.get('set-cookie') || cookies
        
        const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
          headers: {
            'Cookie': authCookies
          }
        })
        
        if (sessionResponse.ok) {
          const session = await sessionResponse.json()
          console.log('   📋 Session:', session)
          
          if (session.user) {
            console.log('   🎉 SUCCESS! User is authenticated!')
            console.log(`   👤 User: ${session.user.email}`)
            console.log(`   🏢 Company: ${session.user.companyName}`)
            
            // Step 7: Test protected API access
            console.log('\n6. 🧾 Testing protected API access...')
            
            const trialResponse = await fetch(`${baseUrl}/api/trial/status`, {
              headers: {
                'Cookie': authCookies
              }
            })
            
            console.log(`   📊 Trial API status: ${trialResponse.status}`)
            
            if (trialResponse.ok) {
              const trialData = await trialResponse.json()
              console.log('   ✅ Protected API accessible!')
              console.log('   📋 Trial data:', trialData)
            } else {
              console.log('   ❌ Protected API still not accessible')
            }
            
          } else {
            console.log('   ❌ Session exists but no user data')
          }
        } else {
          console.log('   ❌ Session request failed')
        }
      }
    } else {
      console.log('   ⚠️ Unexpected response status')
      const responseText = await authResponse.text()
      console.log(`   📄 Response: ${responseText.substring(0, 200)}...`)
    }

  } catch (error) {
    console.error('❌ Proper auth flow test failed:', error.message)
  }
}

// Run the proper auth flow test
testProperAuthFlow()
  .then(() => {
    console.log('\n🎯 Proper auth flow test complete!')
  })
  .catch((error) => {
    console.error('Proper auth flow test error:', error.message)
    process.exit(1)
  })
