const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seed() {
  try {
    console.log('🌱 Seeding database with multi-tenancy data...')
    
    // Create subscription plans
    console.log('Creating subscription plans...')
    const starterPlan = await prisma.plan.create({
      data: {
        name: 'Starter',
        maxEmployees: 10,
        maxPayrolls: 12, // 12 payrolls per year
        features: {
          basicReporting: true,
          emailSupport: true,
          mobileApp: false,
          advancedAnalytics: false,
          apiAccess: false,
          customBranding: false
        },
        price: 2900, // €29.00 per month in cents
        currency: 'EUR'
      }
    })
    
    const professionalPlan = await prisma.plan.create({
      data: {
        name: 'Professional',
        maxEmployees: 50,
        maxPayrolls: null, // unlimited
        features: {
          basicReporting: true,
          advancedReporting: true,
          emailSupport: true,
          phoneSupport: true,
          mobileApp: true,
          advancedAnalytics: true,
          apiAccess: true,
          customBranding: false
        },
        price: 7900, // €79.00 per month in cents
        currency: 'EUR'
      }
    })
    
    const enterprisePlan = await prisma.plan.create({
      data: {
        name: 'Enterprise',
        maxEmployees: null, // unlimited
        maxPayrolls: null, // unlimited
        features: {
          basicReporting: true,
          advancedReporting: true,
          customReporting: true,
          emailSupport: true,
          phoneSupport: true,
          dedicatedSupport: true,
          mobileApp: true,
          advancedAnalytics: true,
          apiAccess: true,
          customBranding: true,
          whiteLabel: true
        },
        price: 19900, // €199.00 per month in cents
        currency: 'EUR'
      }
    })
    
    console.log('✅ Created subscription plans')
    
    // Create test user
    console.log('Creating test user...')
    const hashedPassword = await bcrypt.hash('Geheim@12', 12)
    const testUser = await prisma.user.create({
      data: {
        name: 'Cihat Kaya',
        email: 'cihatkaya@glodinas.nl',
        password: hashedPassword,
        role: 'admin'
      }
    })
    
    console.log('✅ Created test user')
    
    // Create test company
    console.log('Creating test company...')
    const testCompany = await prisma.company.create({
      data: {
        name: 'Glodinas Finance B.V.',
        address: 'Leyweg 336',
        city: 'Den Haag',
        postalCode: '2545ED',
        country: 'Netherlands',
        phone: '0618718698',
        email: 'cihatkaya@glodinas.nl',
        website: 'https://glodinasfinance.nl',
        kvkNumber: '12345678',
        taxNumber: '123456789L01',
        vatNumber: 'NL123456789B01',
        description: 'Hello',
        industry: 'Accounting & Auditing',
        foundedYear: 2008
      }
    })
    
    console.log('✅ Created test company')
    
    // Create subscription for the company
    console.log('Creating subscription...')
    const subscription = await prisma.subscription.create({
      data: {
        companyId: testCompany.id,
        planId: professionalPlan.id,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    })
    
    console.log('✅ Created subscription')
    
    // Create user-company relationship
    console.log('Creating user-company relationship...')
    const userCompany = await prisma.userCompany.create({
      data: {
        userId: testUser.id,
        companyId: testCompany.id,
        role: 'owner'
      }
    })
    
    console.log('✅ Created user-company relationship')
    
    // Update user with legacy companyId for backward compatibility
    await prisma.user.update({
      where: { id: testUser.id },
      data: { companyId: testCompany.id }
    })
    
    // Create tenant configuration
    console.log('Creating tenant configuration...')
    const tenantConfig = await prisma.tenantConfig.create({
      data: {
        companyId: testCompany.id,
        settings: {
          timezone: 'Europe/Amsterdam',
          dateFormat: 'DD/MM/YYYY',
          currency: 'EUR',
          language: 'nl'
        },
        limits: {
          maxEmployees: 50,
          maxPayrollsPerMonth: 10
        },
        features: professionalPlan.features,
        customization: {
          primaryColor: '#3B82F6',
          logo: null,
          companyName: testCompany.name
        }
      }
    })
    
    console.log('✅ Created tenant configuration')
    
    // Create tax settings
    console.log('Creating tax settings...')
    const taxSettings = await prisma.taxSettings.create({
      data: {
        companyId: testCompany.id,
        taxYear: 2025,
        incomeTaxRate1: 36.93,
        incomeTaxRate2: 49.50,
        incomeTaxBracket1Max: 75518,
        aowRate: 17.90,
        wlzRate: 9.65,
        wwRate: 2.70,
        wiaRate: 0.60,
        aowMaxBase: 40000,
        wlzMaxBase: 40000,
        wwMaxBase: 69000,
        wiaMaxBase: 69000,
        holidayAllowanceRate: 8.0,
        minimumWage: 12.83
      }
    })
    
    console.log('✅ Created tax settings')
    
    console.log('🎉 Database seeded successfully!')
    console.log(`
📊 Summary:
- Plans: 3 (Starter, Professional, Enterprise)
- Users: 1 (${testUser.email})
- Companies: 1 (${testCompany.name})
- Subscriptions: 1 (Professional plan)
- User-Company relationships: 1
- Tenant configurations: 1
- Tax settings: 1
    `)
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

