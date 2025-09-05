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
    
    // Update subscription to enterprise with 365 days
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 365) // Add 365 days
    
    const updatedSubscription = await authClient.subscription.update({
      where: {
        id: existingSubscription.id
      },
      data: {
        status: 'active',
        startDate: new Date(),
        endDate: endDate,
        autoRenew: true,
        paymentMethod: 'manual',
        billingCycle: 'yearly'
      }
    })

    console.log('✅ Subscription updated successfully!')
    console.log('Subscription ID:', updatedSubscription.id)
    console.log('Status:', updatedSubscription.status)
    console.log('Start Date:', updatedSubscription.startDate)
    console.log('End Date:', updatedSubscription.endDate)
    console.log('Billing Cycle:', updatedSubscription.billingCycle)
    
    console.log('\n🎉 Enterprise subscription (365 days) successfully configured for cihatkaya@glodinas.nl!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await authClient.$disconnect()
  }
}

updateSubscription()
