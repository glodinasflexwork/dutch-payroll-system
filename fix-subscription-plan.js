const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixSubscriptionPlan() {
  try {
    console.log('Fixing subscription plan for nechiteiandrei2@gmail.com...')
    
    // Find the user and their company
    const user = await prisma.user.findUnique({
      where: { email: 'nechiteiandrei2@gmail.com' },
      include: {
        company: {
          include: {
            subscription: true
          }
        }
      }
    })

    if (!user || !user.company) {
      console.error('❌ User or company not found')
      return
    }

    console.log(`✅ Found user: ${user.name}`)
    console.log(`✅ Company: ${user.company.name}`)

    // Get the Professional plan
    const professionalPlan = await prisma.plan.findFirst({
      where: { name: 'Professional' }
    })

    if (!professionalPlan) {
      console.error('❌ Professional plan not found')
      return
    }

    console.log(`✅ Found Professional plan: ${professionalPlan.id}`)

    // Update the subscription to link to the Professional plan
    const subscription = await prisma.subscription.update({
      where: { companyId: user.company.id },
      data: {
        planId: professionalPlan.id
      },
      include: {
        plan: true
      }
    })

    console.log('🎉 Subscription successfully linked to Professional plan!')
    console.log(`📋 Plan details:`)
    console.log(`   - Name: ${subscription.plan.name}`)
    console.log(`   - Max Employees: ${subscription.plan.maxEmployees}`)
    console.log(`   - Max Companies: ${subscription.plan.maxCompanies}`)
    console.log(`   - Features: ${JSON.stringify(subscription.plan.features)}`)
    
  } catch (error) {
    console.error('❌ Error fixing subscription plan:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixSubscriptionPlan()

