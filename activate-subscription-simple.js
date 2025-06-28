const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function activateSubscription() {
  try {
    console.log('Activating subscription for nechiteiandrei2@gmail.com...')
    
    // Find the user and their company
    const user = await prisma.user.findUnique({
      where: { email: 'nechiteiandrei2@gmail.com' },
      include: {
        company: true,
        companies: {
          include: {
            company: true
          }
        }
      }
    })

    if (!user) {
      console.error('❌ User not found')
      return
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`)
    
    // Get the company ID
    let companyId = user.companyId
    if (!companyId && user.companies.length > 0) {
      companyId = user.companies[0].companyId
    }

    if (!companyId) {
      console.error('❌ No company found for user')
      return
    }

    console.log(`✅ Company ID: ${companyId}`)

    // Update or create subscription
    const subscription = await prisma.subscription.upsert({
      where: { companyId: companyId },
      update: {
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        stripeSubscriptionId: 'demo_subscription_' + Date.now(),
        isTrialActive: false,
        convertedFromTrial: true,
        trialConvertedAt: new Date(),
        updatedAt: new Date()
      },
      create: {
        companyId: companyId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        stripeCustomerId: 'demo_customer_' + Date.now(),
        stripeSubscriptionId: 'demo_subscription_' + Date.now(),
        isTrialActive: false,
        convertedFromTrial: true,
        trialConvertedAt: new Date()
      }
    })

    console.log('🎉 Subscription activation completed successfully!')
    console.log('📋 User now has:')
    console.log('   - Active subscription')
    console.log('   - 1 year validity')
    console.log('   - All features unlocked')
    console.log('   - No trial restrictions')
    
  } catch (error) {
    console.error('❌ Error activating subscription:', error)
  } finally {
    await prisma.$disconnect()
  }
}

activateSubscription()

