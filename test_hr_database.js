const { PrismaClient: HRClient } = require('@prisma/hr-client')

async function testHRDatabase() {
  console.log('🔍 Testing HR Database with correct client...\n')

  try {
    const hrClient = new HRClient({
      datasources: {
        db: {
          url: process.env.HR_DATABASE_URL
        }
      }
    })
    
    console.log('✅ HR Client initialized successfully')
    
    // Test basic connection
    const result = await hrClient.$queryRaw`SELECT 1 as test`
    console.log('✅ HR Database: Connected successfully')
    
    // Count records with correct model names
    const employeeCount = await hrClient.employee.count()
    const companyCount = await hrClient.company.count()
    const departmentCount = await hrClient.department.count()
    const leaveRequestCount = await hrClient.leaveRequest.count()
    
    console.log('📊 HR Database Statistics:')
    console.log('   Employees:', employeeCount)
    console.log('   Companies:', companyCount)
    console.log('   Departments:', departmentCount)
    console.log('   Leave Requests:', leaveRequestCount)
    
    // Get sample employee data
    if (employeeCount > 0) {
      const sampleEmployee = await hrClient.employee.findFirst({
        select: {
          id: true,
          employeeNumber: true,
          firstName: true,
          lastName: true,
          position: true,
          isActive: true
        }
      })
      
      console.log('\n👤 Sample Employee:')
      console.log('   ID:', sampleEmployee.id)
      console.log('   Number:', sampleEmployee.employeeNumber)
      console.log('   Name:', `${sampleEmployee.firstName} ${sampleEmployee.lastName}`)
      console.log('   Position:', sampleEmployee.position)
      console.log('   Active:', sampleEmployee.isActive)
    }
    
    await hrClient.$disconnect()
    console.log('\n✅ HR Database test completed successfully!')
    
  } catch (error) {
    console.log('❌ HR Database test failed:')
    console.log('   Error:', error.message)
    console.log('   Stack:', error.stack)
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' })

testHRDatabase()
