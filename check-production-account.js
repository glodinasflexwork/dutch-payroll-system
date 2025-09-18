require('dotenv').config()

async function checkProductionAccount() {
  console.log('🔍 Checking production account status for angles.readier.7d@icloud.com...\n')

  const { PrismaClient } = require('@prisma/client')
  
  // Use production database URLs if available, otherwise fall back to development
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  })

  try {
    const userEmail = 'angles.readier.7d@icloud.com'
    
    console.log(`📧 Looking up user: ${userEmail}`)
    
    // Find the user with all related data
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
      console.log('❌ User not found in database')
      console.log('   This could mean:')
      console.log('   1. Account was created on a different environment')
      console.log('   2. Database connection is pointing to wrong environment')
      console.log('   3. Account creation failed')
      return
    }

    console.log('✅ User found!')
    console.log(`   👤 Name: ${user.name}`)
    console.log(`   📧 Email: ${user.email}`)
    console.log(`   ✉️ Email Verified: ${!!user.emailVerified}`)
    console.log(`   📅 Created: ${user.createdAt}`)
    console.log(`   🆔 User ID: ${user.id}`)

    // Check company information
    if (user.Company) {
      console.log('\n🏢 Company Information:')
      console.log(`   📊 Company: ${user.Company.name}`)
      console.log(`   🆔 Company ID: ${user.Company.id}`)
      console.log(`   📅 Created: ${user.Company.createdAt}`)
      
      // Check subscription
      if (user.Company.Subscription) {
        const subscription = user.Company.Subscription
        console.log('\n🎁 Subscription Status:')
        console.log(`   📊 Status: ${subscription.status}`)
        console.log(`   ✅ Trial Active: ${subscription.isTrialActive}`)
        console.log(`   📅 Trial Start: ${subscription.trialStart}`)
        console.log(`   📅 Trial End: ${subscription.trialEnd}`)
        console.log(`   🆔 Subscription ID: ${subscription.id}`)
        
        if (subscription.isTrialActive) {
          const trialEnd = new Date(subscription.trialEnd)
          const now = new Date()
          const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))
          
          if (daysRemaining > 0) {
            console.log(`   ⏰ Days Remaining: ${daysRemaining}`)
            console.log('\n✅ TRIAL IS ACTIVE - User should have access!')
          } else {
            console.log(`   ⏰ Trial Expired: ${Math.abs(daysRemaining)} days ago`)
            console.log('\n❌ TRIAL EXPIRED - This explains the access issue')
          }
        } else {
          console.log('\n❌ TRIAL NOT ACTIVE - This explains the access issue')
        }
      } else {
        console.log('\n❌ NO SUBSCRIPTION FOUND - This explains the access issue')
        console.log('   The registration process failed to create a trial subscription')
      }
    } else if (user.UserCompany && user.UserCompany.length > 0) {
      console.log('\n🏢 Company Information (via UserCompany):')
      const userCompany = user.UserCompany[0]
      console.log(`   📊 Company: ${userCompany.Company.name}`)
      console.log(`   👥 Role: ${userCompany.role}`)
      console.log(`   🆔 Company ID: ${userCompany.Company.id}`)
      
      if (userCompany.Company.Subscription) {
        const subscription = userCompany.Company.Subscription
        console.log('\n🎁 Subscription Status:')
        console.log(`   📊 Status: ${subscription.status}`)
        console.log(`   ✅ Trial Active: ${subscription.isTrialActive}`)
        console.log(`   📅 Trial Start: ${subscription.trialStart}`)
        console.log(`   📅 Trial End: ${subscription.trialEnd}`)
        
        if (subscription.isTrialActive) {
          const trialEnd = new Date(subscription.trialEnd)
          const now = new Date()
          const daysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24))
          
          if (daysRemaining > 0) {
            console.log(`   ⏰ Days Remaining: ${daysRemaining}`)
            console.log('\n✅ TRIAL IS ACTIVE - User should have access!')
          } else {
            console.log(`   ⏰ Trial Expired: ${Math.abs(daysRemaining)} days ago`)
            console.log('\n❌ TRIAL EXPIRED - This explains the access issue')
          }
        } else {
          console.log('\n❌ TRIAL NOT ACTIVE - This explains the access issue')
        }
      } else {
        console.log('\n❌ NO SUBSCRIPTION FOUND - This explains the access issue')
      }
    } else {
      console.log('\n❌ NO COMPANY FOUND - This explains the access issue')
      console.log('   The registration process failed to create a company')
    }

    // Check if there are any trial plans available
    console.log('\n🔍 Checking available subscription plans...')
    const plans = await authClient.subscriptionPlan.findMany()
    console.log(`   📊 Available plans: ${plans.length}`)
    
    const trialPlan = plans.find(plan => plan.name.toLowerCase().includes('trial'))
    if (trialPlan) {
      console.log(`   🎁 Trial plan found: ${trialPlan.name} (${trialPlan.id})`)
    } else {
      console.log('   ❌ No trial plan found - this could be the issue')
    }

    console.log('\n📋 DIAGNOSIS:')
    if (user.Company?.Subscription?.isTrialActive) {
      console.log('✅ Account setup is correct - the issue might be:')
      console.log('   1. Production deployment hasn\'t updated yet')
      console.log('   2. Session/authentication issue on frontend')
      console.log('   3. Middleware not recognizing the trial status')
    } else {
      console.log('❌ Account setup is incomplete - the issue is:')
      console.log('   1. Trial subscription was not created during registration')
      console.log('   2. Registration API is using old code without trial creation')
      console.log('   3. Production environment needs the updated code deployed')
    }

  } catch (error) {
    console.error('❌ Error checking production account:', error.message)
    
    if (error.message.includes('connect')) {
      console.log('\n💡 This might be a database connection issue.')
      console.log('   Make sure you\'re using the correct production database URLs.')
    }
  } finally {
    await authClient.$disconnect()
  }
}

// Run the production account check
checkProductionAccount()
  .then(() => {
    console.log('\n🎯 Production account check complete!')
  })
  .catch((error) => {
    console.error('Production account check failed:', error.message)
    process.exit(1)
  })
