require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const { PrismaClient: HRPrismaClient } = require('@prisma/hr-client')

// Debug environment variables
console.log('AUTH_DATABASE_URL:', process.env.AUTH_DATABASE_URL ? 'Set' : 'Not set')
console.log('HR_DATABASE_URL:', process.env.HR_DATABASE_URL ? 'Set' : 'Not set')

if (!process.env.AUTH_DATABASE_URL) {
  console.error('❌ AUTH_DATABASE_URL is not set')
  process.exit(1)
}

// Create clients with explicit database URLs
const authPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL
    }
  }
})

const hrPrisma = new HRPrismaClient({
  datasources: {
    db: {
      url: process.env.HR_DATABASE_URL
    }
  }
})

async function checkUserData() {
  try {
    console.log('🔍 Checking user data for cihatkaya@glodinas.nl...')

    // Find the user
    const user = await authPrisma.user.findUnique({
      where: { email: 'cihatkaya@glodinas.nl' },
      include: {
        UserCompany: {
          include: {
            Company: true
          }
        }
      }
    })

    if (!user) {
      console.log('❌ User cihatkaya@glodinas.nl not found in database')
      return
    }

    console.log('✅ User found:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.firstName} ${user.lastName}`)
    console.log(`   Current Company ID: ${user.companyId}`)
    console.log(`   Created: ${user.createdAt}`)
    console.log(`   Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`)

    console.log('\n📊 Associated Companies:')
    if (user.UserCompany.length === 0) {
      console.log('   No companies associated with this user')
    } else {
      for (const userCompany of user.UserCompany) {
        console.log(`   - ${userCompany.Company.name}`)
        console.log(`     Role: ${userCompany.role}`)
        console.log(`     Active: ${userCompany.isActive}`)
        console.log(`     Company ID: ${userCompany.companyId}`)
        
        // Check employees for this company
        const employeeCount = await hrPrisma.employee.count({
          where: { companyId: userCompany.companyId }
        })
        console.log(`     Employees: ${employeeCount}`)
        console.log('')
      }
    }

    // Check if user has a password set
    const userWithPassword = await authPrisma.user.findUnique({
      where: { email: 'cihatkaya@glodinas.nl' },
      select: { password: true }
    })

    console.log(`🔐 Password set: ${userWithPassword?.password ? 'Yes' : 'No'}`)

  } catch (error) {
    console.error('❌ Error checking user data:', error)
  } finally {
    await authPrisma.$disconnect()
    await hrPrisma.$disconnect()
  }
}

// Run the check
checkUserData()

