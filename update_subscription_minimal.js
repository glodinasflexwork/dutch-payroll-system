const { PrismaClient } = require('@prisma/client')

async function updateSubscription() {
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  })

  try {
    console.log('🔍 Looking for user: cihatkaya@glodinas.nl')
    
    const user = await authClient.user.findUnique({
      where: {
        email: 'cihatkaya@glodinas.nl'
      }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User found:', user.id)
    
    // Get user companies
    const userCompanies = await authClient.userCompany.findMany({
      where: {
        userId: user.id
      }
    })

    if (userCompanies.length === 0) {
      console.log('❌ No companies found for user')
      return
    }

    const companyId = userCompanies[0].companyId
    console.log('✅ Company found:', companyId)
    
    // Get existing subscription
    const existingSubscription = await authClient.subscription.findFirst({
      where: {
        companyId: companyId
      }
    })

    if (!existingSubscription) {
      console.log('❌ No subscription found')
      return
    }

    console.log('✅ Subscription found:', existingSubscription.id)
    console.log('Current subscription details:')
    console.log('- Status:', existingSubscription.status)
    console.log('- Current Period Start:', existingSubscription.currentPeriodStart)
    console.log('- Current Period End:', existingSubscription.currentPeriodEnd)
    
    // Update subscription with 365 days from now
    const currentPeriodEnd = new Date()
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 365) // Add 365 days
    
    const updatedSubscription = await authClient.subscription.update({
      where: {
        id: existingSubscription.id
      },
      data: {
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: currentPeriodEnd,
        cancelAtPeriodEnd: false,
        isTrialActive: false
      }
    })

    console.log('\n✅ Subscription updated successfully!')
    console.log('Updated subscription details:')
    console.log('- Subscription ID:', updatedSubscription.id)
    console.log('- Status:', updatedSubscription.status)
    console.log('- Current Period Start:', updatedSubscription.currentPeriodStart)
    console.log('- Current Period End:', updatedSubscription.currentPeriodEnd)
    console.log('- Cancel At Period End:', updatedSubscription.cancelAtPeriodEnd)
    console.log('- Is Trial Active:', updatedSubscription.isTrialActive)
    
    console.log('\n🎉 Enterprise subscription (365 days) successfully configured for cihatkaya@glodinas.nl!')
    console.log('📅 Subscription valid until:', updatedSubscription.currentPeriodEnd.toDateString())

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await authClient.$disconnect()
  }
}

updateSubscription()
