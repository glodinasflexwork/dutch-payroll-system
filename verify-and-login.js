require('dotenv').config()

async function verifyEmailAndLogin() {
  console.log('🔧 Verifying email and testing login for new user...\n')

  const { PrismaClient } = require('@prisma/client')
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  })

  try {
    const userEmail = 'maria.vandenberg.2025@testmail.nl'
    
    // Step 1: Find the user
    console.log('1. 🔍 Finding user in database...')
    const user = await authClient.user.findUnique({
      where: { email: userEmail },
      include: {
        Company: {
          include: {
            Subscription: true
          }
        },
        UserCompany: {
          include: {
            Company: true
          }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    console.log(`   ✅ User found: ${user.name} (${user.email})`)
    console.log(`   📧 Email verified: ${!!user.emailVerified}`)
    console.log(`   🏢 Company: ${user.Company?.name}`)

    // Step 2: Verify email if not already verified
    if (!user.emailVerified) {
      console.log('\n2. ✉️ Verifying email...')
      
      await authClient.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          emailVerificationToken: null
        }
      })
      
      console.log('   ✅ Email verified successfully!')
    } else {
      console.log('\n2. ✅ Email already verified')
    }

    // Step 3: Check final user state
    console.log('\n3. 📊 Final user state:')
    const updatedUser = await authClient.user.findUnique({
      where: { id: user.id },
      include: {
        Company: {
          include: {
            Subscription: true
          }
        },
        UserCompany: {
          include: {
            Company: true
          }
        }
      }
    })

    console.log(`   👤 Name: ${updatedUser.name}`)
    console.log(`   📧 Email: ${updatedUser.email}`)
    console.log(`   ✅ Verified: ${!!updatedUser.emailVerified}`)
    console.log(`   🏢 Company: ${updatedUser.Company?.name}`)
    console.log(`   👥 Role: ${updatedUser.UserCompany[0]?.role}`)
    
    if (updatedUser.Company?.Subscription) {
      const subscription = updatedUser.Company.Subscription
      const trialEnd = new Date(subscription.trialEnd)
      const daysRemaining = Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24))
      
      console.log('\n   🎁 Trial Subscription:')
      console.log(`      Status: ${subscription.status}`)
      console.log(`      Active: ${subscription.isTrialActive}`)
      console.log(`      Days Remaining: ${daysRemaining}`)
    }

    // Step 4: Test login via API
    console.log('\n4. 🔐 Testing login via API...')
    
    const loginResponse = await fetch('http://localhost:3001/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: userEmail,
        password: 'SecurePass2025!',
        redirect: 'false',
        json: 'true'
      })
    })

    console.log(`   📊 Login Response Status: ${loginResponse.status}`)
    
    if (loginResponse.ok) {
      const loginResult = await loginResponse.text()
      console.log('   ✅ Login API call successful!')
      console.log(`   📄 Response: ${loginResult.substring(0, 200)}...`)
    } else {
      console.log('   ⚠️ Login API call returned non-200 status')
      const errorText = await loginResponse.text()
      console.log(`   📄 Error: ${errorText.substring(0, 200)}...`)
    }

    console.log('\n🎯 VERIFICATION AND LOGIN TEST COMPLETE!')
    console.log('\n📋 ACCOUNT SUMMARY:')
    console.log(`   📧 Email: ${userEmail}`)
    console.log(`   🔑 Password: SecurePass2025!`)
    console.log(`   ✅ Email Verified: Yes`)
    console.log(`   🏢 Company: ${updatedUser.Company?.name}`)
    console.log(`   🎁 Trial Active: ${updatedUser.Company?.Subscription?.isTrialActive}`)
    console.log('\n💡 You can now login at: http://localhost:3001/auth/signin')

    return {
      email: userEmail,
      password: 'SecurePass2025!',
      verified: true,
      company: updatedUser.Company?.name,
      userId: updatedUser.id,
      companyId: updatedUser.Company?.id
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await authClient.$disconnect()
  }
}

// Run the verification and login test
verifyEmailAndLogin()
  .then((result) => {
    console.log('\n🚀 Ready to use the account!')
  })
  .catch((error) => {
    console.error('Process failed:', error.message)
    process.exit(1)
  })
