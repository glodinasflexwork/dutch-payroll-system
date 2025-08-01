const { PrismaClient: AuthPrismaClient } = require('@prisma/client')
const { PrismaClient: HRPrismaClient } = require('@prisma/hr-client')

const authClient = new AuthPrismaClient()
const hrClient = new HRPrismaClient()

async function cleanupEmptyCompanies() {
  try {
    console.log('🔍 Starting cleanup of companies with 0 employees...')
    
    // Step 1: Get all companies from auth database
    const allCompanies = await authClient.company.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    })
    
    console.log(`📊 Found ${allCompanies.length} total companies in database`)
    
    // Step 2: Get employee counts for each company from HR database
    const employeeCounts = await hrClient.employee.groupBy({
      by: ['companyId'],
      where: {
        companyId: { in: allCompanies.map(c => c.id) },
        isActive: true
      },
      _count: {
        id: true
      }
    })
    
    // Create a map of company ID to employee count
    const employeeCountMap = employeeCounts.reduce((acc, item) => {
      acc[item.companyId] = item._count.id
      return acc
    }, {})
    
    // Step 3: Identify companies with 0 employees
    const emptyCompanies = allCompanies.filter(company => {
      const employeeCount = employeeCountMap[company.id] || 0
      return employeeCount === 0
    })
    
    console.log(`🎯 Found ${emptyCompanies.length} companies with 0 employees:`)
    emptyCompanies.forEach(company => {
      console.log(`   - ${company.name} (ID: ${company.id}) - Created: ${company.createdAt.toISOString().split('T')[0]}`)
    })
    
    if (emptyCompanies.length === 0) {
      console.log('✅ No companies with 0 employees found. Database is clean!')
      return
    }
    
    // Step 4: Safety check - confirm deletion
    console.log(`\n⚠️  About to delete ${emptyCompanies.length} companies with 0 employees`)
    console.log('This will remove:')
    console.log('- Company records from auth database')
    console.log('- Associated UserCompany relationships')
    console.log('- Any related data in other databases')
    
    const emptyCompanyIds = emptyCompanies.map(c => c.id)
    
    // Step 5: Delete related records first (to avoid foreign key constraints)
    console.log('\n🧹 Cleaning up related records...')
    
    // Delete UserCompany relationships
    const deletedUserCompanies = await authClient.userCompany.deleteMany({
      where: {
        companyId: { in: emptyCompanyIds }
      }
    })
    console.log(`   ✅ Deleted ${deletedUserCompanies.count} UserCompany relationships`)
    
    // Delete any subscriptions
    const deletedSubscriptions = await authClient.subscription.deleteMany({
      where: {
        companyId: { in: emptyCompanyIds }
      }
    })
    console.log(`   ✅ Deleted ${deletedSubscriptions.count} subscription records`)
    
    // Step 6: Delete the companies themselves
    console.log('\n🗑️  Deleting empty companies...')
    const deletedCompanies = await authClient.company.deleteMany({
      where: {
        id: { in: emptyCompanyIds }
      }
    })
    console.log(`   ✅ Deleted ${deletedCompanies.count} companies`)
    
    // Step 7: Verify cleanup
    console.log('\n🔍 Verifying cleanup...')
    const remainingCompanies = await authClient.company.findMany({
      select: {
        id: true,
        name: true
      }
    })
    
    const remainingEmployeeCounts = await hrClient.employee.groupBy({
      by: ['companyId'],
      where: {
        companyId: { in: remainingCompanies.map(c => c.id) },
        isActive: true
      },
      _count: {
        id: true
      }
    })
    
    const remainingEmployeeCountMap = remainingEmployeeCounts.reduce((acc, item) => {
      acc[item.companyId] = item._count.id
      return acc
    }, {})
    
    console.log(`📊 Remaining companies: ${remainingCompanies.length}`)
    remainingCompanies.forEach(company => {
      const employeeCount = remainingEmployeeCountMap[company.id] || 0
      console.log(`   - ${company.name}: ${employeeCount} employees`)
    })
    
    console.log('\n🎉 Cleanup completed successfully!')
    console.log(`✅ Removed ${emptyCompanies.length} companies with 0 employees`)
    console.log(`✅ ${remainingCompanies.length} companies remain in the database`)
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    throw error
  } finally {
    await authClient.$disconnect()
    await hrClient.$disconnect()
  }
}

// Run the cleanup
cleanupEmptyCompanies()
  .then(() => {
    console.log('\n✅ Database cleanup completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Database cleanup failed:', error)
    process.exit(1)
  })

