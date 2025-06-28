const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function activateSubscription() {
  try {
    console.log('Activating subscription for cihatkaya@glodinasholding.nl...')
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'cihatkaya@glodinasholding.nl' },
      include: {
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

    // Get the Professional plan
    const professionalPlan = await prisma.plan.findFirst({
      where: { name: 'Professional' }
    })

    if (!professionalPlan) {
      console.error('❌ Professional plan not found')
      return
    }

    console.log(`✅ Found Professional plan: ${professionalPlan.id}`)

    // Update or create subscription with plan
    const subscription = await prisma.subscription.upsert({
      where: { companyId: companyId },
      update: {
        planId: professionalPlan.id,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        stripeSubscriptionId: 'demo_subscription_cihatkaya_' + Date.now(),
        isTrialActive: false,
        convertedFromTrial: true,
        trialConvertedAt: new Date(),
        updatedAt: new Date()
      },
      create: {
        companyId: companyId,
        planId: professionalPlan.id,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        stripeCustomerId: 'demo_customer_cihatkaya_' + Date.now(),
        stripeSubscriptionId: 'demo_subscription_cihatkaya_' + Date.now(),
        isTrialActive: false,
        convertedFromTrial: true,
        trialConvertedAt: new Date()
      },
      include: {
        plan: true
      }
    })

    console.log('🎉 Subscription activation completed successfully!')
    console.log('📋 User now has:')
    console.log(`   - Active ${subscription.plan.name} subscription`)
    console.log(`   - Max Employees: ${subscription.plan.maxEmployees}`)
    console.log(`   - Max Companies: ${subscription.plan.maxCompanies}`)
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

