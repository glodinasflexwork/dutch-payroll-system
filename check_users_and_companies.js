require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

async function checkUsersAndCompanies() {
  console.log('AUTH_DATABASE_URL:', process.env.AUTH_DATABASE_URL ? 'Set' : 'Not set')
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  })

  try {
    console.log('=== Checking Users and Companies ===')
    
    // Get all users with their company relationships
    const users = await prisma.user.findMany({
      include: {
        Company: true,
        UserCompany: {
          include: {
            Company: true
          }
        }
      }
    })

    console.log(`Found ${users.length} users:`)
    
    for (const user of users) {
      console.log(`\nUser: ${user.email} (ID: ${user.id})`)
      console.log(`  Direct company: ${user.Company ? user.Company.name + ' (' + user.Company.id + ')' : 'None'}`)
      console.log(`  UserCompany relationships: ${user.UserCompany.length}`)
      
      for (const uc of user.UserCompany) {
        console.log(`    - ${uc.Company.name} (${uc.Company.id}) - Role: ${uc.role}`)
      }
    }

    // Get all companies
    const companies = await prisma.company.findMany({
      include: {
        User: true,
        UserCompany: {
          include: {
            User: true
          }
        }
      }
    })

    console.log(`\n=== Found ${companies.length} companies: ===`)
    
    for (const company of companies) {
      console.log(`\nCompany: ${company.name} (ID: ${company.id})`)
      console.log(`  Direct users: ${company.User.length}`)
      console.log(`  UserCompany relationships: ${company.UserCompany.length}`)
      
      for (const uc of company.UserCompany) {
        console.log(`    - ${uc.User.email} - Role: ${uc.role}`)
      }
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsersAndCompanies()

