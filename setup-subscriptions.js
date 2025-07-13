const { PrismaClient } = require('@prisma/client')

// Create auth client with AUTH_DATABASE_URL
const authClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL
    }
  }
})

async function setupSubscriptionPlans() {
  try {
    console.log('Checking subscription plans...')
    
    // Check if plans exist
    const existingPlans = await authClient.plan.findMany()
    console.log('Existing plans:', existingPlans.length)
    
    if (existingPlans.length === 0) {
      console.log('Creating default subscription plans...')
      
      // Create Free Trial plan
      const trialPlan = await authClient.plan.create({
        data: {
          name: "Free Trial",
          stripePriceId: null,
          maxEmployees: 999,
          maxPayrolls: 999,
          features: {
            payroll: true,
            employees: true,
            leave_management: true,
            time_tracking: true,
            advanced_reports: true,
            multi_company: true,
            api_access: true,
            custom_integrations: true
          },
          price: 0,
          currency: "EUR",
          isActive: true,
          stripeProductId: null
        }
      })
      console.log('Created Free Trial plan:', trialPlan.id)
      
      console.log('All subscription plans created successfully!')
    } else {
      console.log('Plans already exist:')
      existingPlans.forEach(plan => {
        console.log(`- ${plan.name}: €${plan.price} (${plan.maxEmployees} employees)`)
      })
    }
    
    // Check companies without subscriptions
    console.log('\nChecking companies without subscriptions...')
    const companiesWithoutSub = await authClient.company.findMany({
      where: {
        Subscription: null
      },
      include: {
        UserCompany: {
          include: {
            User: true
          }
        }
      }
    })
    
    console.log(`Found ${companiesWithoutSub.length} companies without subscriptions`)
    
    if (companiesWithoutSub.length > 0) {
      const trialPlan = await authClient.plan.findFirst({
        where: { name: "Free Trial" }
      })
      
      if (trialPlan) {
        console.log('Creating trial subscriptions for companies without subscriptions...')
        
        for (const company of companiesWithoutSub) {
          const subscription = await authClient.subscription.create({
            data: {
              companyId: company.id,
              planId: trialPlan.id,
              status: "trialing",
              stripeSubscriptionId: null,
              stripeCustomerId: null,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
              cancelAtPeriodEnd: false,
              trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              isTrialActive: true,
              trialStart: new Date(),
              trialExtensions: 0
            }
          })
          console.log(`Created trial subscription for company: ${company.name} (${subscription.id})`)
        }
        
        console.log('All companies now have trial subscriptions!')
      }
    }
    
  } catch (error) {
    console.error('Error setting up subscription plans:', error)
  } finally {
    await authClient.$disconnect()
  }
}

setupSubscriptionPlans()

