require('dotenv').config()

async function checkUserCompanyRelationship() {
  console.log('🔍 Checking user-company relationship for cihatkaya@salarysync.nl...\n')

  const { PrismaClient } = require('@prisma/client')
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  })

  try {
    const userEmail = 'cihatkaya@salarysync.nl'
    
    // Find the user with all relationships
    const user = await authClient.user.findUnique({
      where: { email: userEmail },
      include: {
        Company: true,
        UserCompany: {
          include: {
            Company: true
          }
        }
      }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User found!')
    console.log(`   👤 Name: ${user.name}`)
    console.log(`   📧 Email: ${user.email}`)
    console.log(`   🆔 User ID: ${user.id}`)
    console.log(`   🏢 Company ID (direct): ${user.companyId}`)

    // Check direct company relationship
    if (user.Company) {
      console.log('\n🏢 Direct Company Relationship:')
      console.log(`   ✅ Company ID: ${user.Company.id}`)
      console.log(`   ✅ Company Name: ${user.Company.name}`)
      console.log(`   ✅ KvK Number: ${user.Company.chamberOfCommerceNumber}`)
    } else {
      console.log('\n❌ No direct company relationship found')
    }

    // Check UserCompany relationships
    if (user.UserCompany && user.UserCompany.length > 0) {
      console.log('\n👥 UserCompany Relationships:')
      user.UserCompany.forEach((uc, index) => {
        console.log(`   ${index + 1}. Role: ${uc.role}`)
        console.log(`      Company: ${uc.Company.name} (${uc.Company.id})`)
      })
    } else {
      console.log('\n❌ No UserCompany relationships found')
    }

    // Check if company exists in HR database
    const { PrismaClient: HRClient } = require('@prisma/hr-client')
    const hrClient = new HRClient({
      datasources: {
        db: {
          url: process.env.HR_DATABASE_URL
        }
      }
    })

    if (user.Company) {
      const hrCompany = await hrClient.company.findUnique({
        where: { id: user.Company.id }
      })

      if (hrCompany) {
        console.log('\n✅ Company exists in HR database')
        console.log(`   🏢 HR Company: ${hrCompany.name}`)
      } else {
        console.log('\n❌ Company NOT found in HR database')
      }
    }

    console.log('\n🎯 DIAGNOSIS:')
    if (user.Company) {
      console.log('✅ User has proper company relationship')
      console.log('✅ Should be able to access payroll features')
    } else {
      console.log('❌ User missing company relationship')
      console.log('❌ This will cause payroll access issues')
    }

  } catch (error) {
    console.error('❌ Error checking relationship:', error.message)
  } finally {
    await authClient.$disconnect()
  }
}

// Run the check
checkUserCompanyRelationship()
  .then(() => {
    console.log('\n🎯 User-company relationship check complete!')
  })
  .catch((error) => {
    console.error('Check failed:', error.message)
    process.exit(1)
  })
