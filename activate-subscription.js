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
    
    // Get the company ID (either from legacy companyId or from UserCompany relationship)
    let companyId = user.companyId
    if (!companyId && user.companies.length > 0) {
      companyId = user.companies[0].companyId
    }

    if (!companyId) {
      console.error('❌ No company found for user')
      return
    }

    console.log(`✅ Company ID: ${companyId}`)

    // Check if there's already a subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: { companyId: companyId }
    })

    if (existingSubscription) {
      console.log('📋 Existing subscription found, updating...')
      
      // Update existing subscription to be active
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          stripeSubscriptionId: 'demo_subscription_' + Date.now(),
          isTrialActive: false,
          convertedFromTrial: true,
          trialConvertedAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      console.log('✅ Subscription updated to active status')
    } else {
      console.log('📋 No existing subscription, creating new one...')
      
      // Create new active subscription
      await prisma.subscription.create({
        data: {
          companyId: companyId,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          stripeCustomerId: 'demo_customer_' + Date.now(),
          stripeSubscriptionId: 'demo_subscription_' + Date.now(),
          isTrialActive: false,
          convertedFromTrial: true,
          trialConvertedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      console.log('✅ New subscription created')
    }

    // Also ensure trial is marked as used/expired
    const trial = await prisma.trial.findFirst({
      where: { companyId: companyId }
    })

    if (trial) {
      await prisma.trial.update({
        where: { id: trial.id },
        data: {
          isActive: false,
          endDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
          updatedAt: new Date()
        }
      })
      console.log('✅ Trial marked as expired')
    }

    console.log('🎉 Subscription activation completed successfully!')
    console.log('📋 User now has:')
    console.log('   - Active Professional subscription')
    console.log('   - 1 year validity')
    console.log('   - All features unlocked')
    
  } catch (error) {
    console.error('❌ Error activating subscription:', error)
  } finally {
    await prisma.$disconnect()
  }
}

activateSubscription()

