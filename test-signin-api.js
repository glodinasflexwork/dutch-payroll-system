require('dotenv').config()

async function testSigninAPI() {
  console.log('🔍 Testing NextAuth signin API...\n')

  try {
    // Test the NextAuth providers endpoint
    console.log('1. Testing NextAuth providers endpoint...')
    const providersResponse = await fetch('http://localhost:3001/api/auth/providers')
    
    if (providersResponse.ok) {
      const providers = await providersResponse.json()
      console.log('✅ Providers endpoint working:', Object.keys(providers))
    } else {
      console.log('❌ Providers endpoint failed:', providersResponse.status)
    }

    // Test the NextAuth session endpoint
    console.log('\n2. Testing NextAuth session endpoint...')
    const sessionResponse = await fetch('http://localhost:3001/api/auth/session')
    
    if (sessionResponse.ok) {
      const session = await sessionResponse.json()
      console.log('✅ Session endpoint working:', session ? 'Has session' : 'No session')
    } else {
      console.log('❌ Session endpoint failed:', sessionResponse.status)
    }

    // Test signin with credentials
    console.log('\n3. Testing signin with test credentials...')
    const signinResponse = await fetch('http://localhost:3001/api/auth/signin/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser.demo@example.com',
        password: 'TestPassword123!',
        redirect: false
      })
    })

    if (signinResponse.ok) {
      const signinResult = await signinResponse.json()
      console.log('✅ Signin API working:', {
        ok: signinResult.ok,
        error: signinResult.error,
        url: signinResult.url
      })
    } else {
      console.log('❌ Signin API failed:', signinResponse.status)
      const errorText = await signinResponse.text()
      console.log('Error details:', errorText.substring(0, 200))
    }

    console.log('\n✅ NextAuth API test completed!')

  } catch (error) {
    console.error('❌ Error testing NextAuth API:', error.message)
  }
}

testSigninAPI()
