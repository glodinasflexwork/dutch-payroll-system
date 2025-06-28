const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateExistingUsers() {
  try {
    console.log('Starting migration of existing users...')
    
    // Find all users who have a companyId but no UserCompany relationship
    const usersWithoutUserCompany = await prisma.user.findMany({
      where: {
        companyId: {
          not: null
        },
        companies: {
          none: {}
        }
      },
      include: {
        company: true
      }
    })

    console.log(`Found ${usersWithoutUserCompany.length} users to migrate`)

    for (const user of usersWithoutUserCompany) {
      if (user.companyId && user.company) {
        try {
          // Create UserCompany relationship
          await prisma.userCompany.create({
            data: {
              userId: user.id,
              companyId: user.companyId,
              role: 'owner', // Assume existing users are owners of their companies
              isActive: true
            }
          })
          
          console.log(`✅ Migrated user ${user.email} to company ${user.company.name}`)
        } catch (error) {
          console.error(`❌ Error migrating user ${user.email}:`, error.message)
        }
      }
    }

    console.log('Migration completed!')
    
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateExistingUsers()

