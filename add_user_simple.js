const { PrismaClient } = require('@prisma/client')

async function addEnterpriseUser() {
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  })

  try {
    console.log('🔍 Looking for user: cihatkaya@glodinas.nl')
    
    // First, let's see what tables exist
    const user = await authClient.user.findUnique({
      where: {
        email: 'cihatkaya@glodinas.nl'
      }
    })

    if (!user) {
      console.log('❌ User not found. Creating user...')
      
      // Create the user
      const newUser = await authClient.user.create({
        data: {
          email: 'cihatkaya@glodinas.nl',
          name: 'Cihat Kaya',
          emailVerified: new Date(),
          role: 'admin'
        }
      })
      
      console.log('✅ User created:', newUser.id)
      
      // Create a company
      const company = await authClient.company.create({
        data: {
          name: 'Glodinas B.V.',
          industry: 'Technology',
          size: 'medium',
          country: 'Netherlands',
          ownerId: newUser.id
        }
      })
      
      console.log('✅ Company created:', company.id)
      
      // Create user-company relationship
      const userCompany = await authClient.userCompany.create({
        data: {
          userId: newUser.id,
          companyId: company.id,
          role: 'owner'
        }
      })
      
      console.log('✅ User-Company relationship created:', userCompany.id)
      
      // Create enterprise subscription
      const subscription = await authClient.subscription.create({
        data: {
          companyId: company.id,
          planId: 'enterprise',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days from now
          autoRenew: true,
          paymentMethod: 'manual',
          billingCycle: 'yearly'
        }
      })
      
      console.log('✅ Enterprise subscription created:', subscription.id)
      
    } else {
      console.log('✅ User found:', user.id)
      
      // Check if user has companies
      const userCompanies = await authClient.userCompany.findMany({
        where: {
          userId: user.id
        }
      })
      
      if (userCompanies.length === 0) {
        console.log('📝 Creating company for existing user...')
        
        // Create a company
        const company = await authClient.company.create({
          data: {
            name: 'Glodinas B.V.',
            industry: 'Technology',
            size: 'medium',
            country: 'Netherlands',
            ownerId: user.id
          }
        })
        
        console.log('✅ Company created:', company.id)
        
        // Create user-company relationship
        const userCompany = await authClient.userCompany.create({
          data: {
            userId: user.id,
            companyId: company.id,
            role: 'owner'
          }
        })
        
        console.log('✅ User-Company relationship created:', userCompany.id)
        
        // Create enterprise subscription
        const subscription = await authClient.subscription.create({
          data: {
            companyId: company.id,
            planId: 'enterprise',
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days from now
            autoRenew: true,
            paymentMethod: 'manual',
            billingCycle: 'yearly'
          }
        })
        
        console.log('✅ Enterprise subscription created:', subscription.id)
        
      } else {
        const companyId = userCompanies[0].companyId
        console.log('✅ Company found:', companyId)
        
        // Check if subscription exists
        const existingSubscription = await authClient.subscription.findFirst({
          where: {
            companyId: companyId
          }
        })
        
        if (!existingSubscription) {
          console.log('📝 Creating enterprise subscription...')
          
          const subscription = await authClient.subscription.create({
            data: {
              companyId: companyId,
              planId: 'enterprise',
              status: 'active',
              startDate: new Date(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days from now
              autoRenew: true,
              paymentMethod: 'manual',
              billingCycle: 'yearly'
            }
          })
          
          console.log('✅ Enterprise subscription created:', subscription.id)
          
        } else {
          console.log('📝 Updating existing subscription to enterprise...')
          
          const subscription = await authClient.subscription.update({
            where: {
              id: existingSubscription.id
            },
            data: {
              planId: 'enterprise',
              status: 'active',
              startDate: new Date(),
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days from now
              autoRenew: true,
              paymentMethod: 'manual',
              billingCycle: 'yearly'
            }
          })
          
          console.log('✅ Subscription updated to enterprise:', subscription.id)
        }
      }
    }

    // Final verification
    const finalUser = await authClient.user.findUnique({
      where: {
        email: 'cihatkaya@glodinas.nl'
      }
    })

    const finalUserCompanies = await authClient.userCompany.findMany({
      where: {
        userId: finalUser.id
      }
    })

    const finalSubscription = await authClient.subscription.findFirst({
      where: {
        companyId: finalUserCompanies[0]?.companyId
      }
    })

    console.log('\n🎉 FINAL SETUP VERIFICATION:')
    console.log('User Email:', finalUser.email)
    console.log('User ID:', finalUser.id)
    console.log('Company ID:', finalUserCompanies[0]?.companyId)
    console.log('Subscription Plan:', finalSubscription?.planId)
    console.log('Subscription Status:', finalSubscription?.status)
    console.log('Subscription End Date:', finalSubscription?.endDate)
    
    console.log('\n✅ Enterprise subscription successfully configured for cihatkaya@glodinas.nl!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await authClient.$disconnect()
  }
}

addEnterpriseUser()
