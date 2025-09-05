const { PrismaClient } = require('@prisma/client')

async function addEnterpriseSubscription() {
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  })

  try {
    console.log('🔍 Looking for user: cihatkaya@glodinas.nl')
    
    // Find the user
    const user = await authClient.user.findUnique({
      where: {
        email: 'cihatkaya@glodinas.nl'
      },
      include: {
        UserCompany: {
          include: {
            company: {
              include: {
                subscriptions: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      console.log('❌ User not found. Creating user first...')
      
      // Create the user if not exists
      const newUser = await authClient.user.create({
        data: {
          email: 'cihatkaya@glodinas.nl',
          name: 'Cihat Kaya',
          emailVerified: new Date(),
          role: 'admin'
        }
      })
      
      console.log('✅ User created:', newUser.id)
      
      // Create a company for the user
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
      await authClient.userCompany.create({
        data: {
          userId: newUser.id,
          companyId: company.id,
          role: 'owner'
        }
      })
      
      console.log('✅ User-Company relationship created')
      
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
      
      if (user.UserCompany.length === 0) {
        console.log('📝 Creating company for existing user...')
        
        // Create a company for the existing user
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
        await authClient.userCompany.create({
          data: {
            userId: user.id,
            companyId: company.id,
            role: 'owner'
          }
        })
        
        console.log('✅ User-Company relationship created')
        
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
        const userCompany = user.UserCompany[0]
        const company = userCompany.company
        console.log('✅ Company found:', company.id)
        
        // Check if subscription exists
        if (company.subscriptions.length === 0) {
          console.log('📝 Creating enterprise subscription...')
          
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
          console.log('📝 Updating existing subscription to enterprise...')
          
          const subscription = await authClient.subscription.update({
            where: {
              id: company.subscriptions[0].id
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

    // Verify the final setup
    const finalUser = await authClient.user.findUnique({
      where: {
        email: 'cihatkaya@glodinas.nl'
      },
      include: {
        UserCompany: {
          include: {
            company: {
              include: {
                subscriptions: true
              }
            }
          }
        }
      }
    })

    console.log('\n🎉 FINAL SETUP VERIFICATION:')
    console.log('User:', finalUser.email)
    console.log('Company:', finalUser.UserCompany[0]?.company?.name)
    console.log('Subscription Plan:', finalUser.UserCompany[0]?.company?.subscriptions[0]?.planId)
    console.log('Subscription Status:', finalUser.UserCompany[0]?.company?.subscriptions[0]?.status)
    console.log('Subscription End Date:', finalUser.UserCompany[0]?.company?.subscriptions[0]?.endDate)
    
    console.log('\n✅ Enterprise subscription successfully configured for cihatkaya@glodinas.nl!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await authClient.$disconnect()
  }
}

addEnterpriseSubscription()
