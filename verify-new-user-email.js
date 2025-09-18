require('dotenv').config()

async function verifyNewUserEmail() {
  console.log('✉️ Verifying email for cihatkaya@salarysync.nl...\n')

  const { PrismaClient } = require('@prisma/client')
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  })

  try {
    const userEmail = 'cihatkaya@salarysync.nl'
    
    // Find the user
    const user = await authClient.user.findUnique({
      where: { email: userEmail },
      include: {
        Company: {
          include: {
            Subscription: true
          }
        }
      }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User found!')
    console.log(`   👤 Name: ${user.name}`)
    console.log(`   📧 Email: ${user.email}`)
    console.log(`   🆔 User ID: ${user.id}`)
    console.log(`   ✉️ Email Verified: ${!!user.emailVerified}`)

    if (user.emailVerified) {
      console.log('   ✅ Email is already verified!')
    } else {
      console.log('   🔄 Verifying email...')
      
      // Update the user to mark email as verified
      const updatedUser = await authClient.user.update({
        where: { id: user.id },
        data: { 
          emailVerified: new Date(),
          emailVerificationToken: null // Clear the token
        }
      })
      
      console.log('   ✅ Email verified successfully!')
      console.log(`   📅 Verified at: ${updatedUser.emailVerified}`)
    }

    // Check subscription status
    if (user.Company?.Subscription) {
      const subscription = user.Company.Subscription
      console.log('\n🎁 Trial Subscription Status:')
      console.log(`   📊 Status: ${subscription.status}`)
      console.log(`   ✅ Trial Active: ${subscription.isTrialActive}`)
      console.log(`   📅 Trial Start: ${subscription.trialStart}`)
      console.log(`   📅 Trial End: ${subscription.trialEnd}`)
      
      const now = new Date()
      const trialEnd = new Date(subscription.trialEnd)
      const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))
      console.log(`   ⏰ Days Remaining: ${daysRemaining}`)
      
      if (subscription.isTrialActive && daysRemaining > 0) {
        console.log('   🎉 TRIAL IS ACTIVE AND VALID!')
      } else {
        console.log('   ❌ Trial is not active or expired')
      }
    } else {
      console.log('\n❌ No subscription found for this user')
    }

    console.log('\n🎯 SUMMARY:')
    console.log(`✅ User: ${user.name} (${user.email})`)
    console.log('✅ Email: Verified')
    console.log(`✅ Trial: ${user.Company?.Subscription?.isTrialActive ? 'Active' : 'Not Active'}`)
    console.log('\n💡 You can now login with this account!')

  } catch (error) {
    console.error('❌ Error verifying email:', error.message)
  } finally {
    await authClient.$disconnect()
  }
}

// Run the email verification
verifyNewUserEmail()
  .then(() => {
    console.log('\n🎯 Email verification complete!')
  })
  .catch((error) => {
    console.error('Email verification failed:', error.message)
    process.exit(1)
  })
