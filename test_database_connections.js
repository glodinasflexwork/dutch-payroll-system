const { PrismaClient } = require('@prisma/client')

async function testDatabaseConnections() {
  console.log('🔍 Testing Database Connections...\n')

  // Test AUTH Database
  console.log('1. Testing AUTH Database Connection:')
  try {
    const authClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.AUTH_DATABASE_URL
        }
      }
    })
    
    const authResult = await authClient.$queryRaw`SELECT 1 as test`
    console.log('✅ AUTH Database: Connected successfully')
    console.log('   URL:', process.env.AUTH_DATABASE_URL?.split('@')[1]?.split('?')[0])
    
    // Count some records
    const userCount = await authClient.user.count()
    const companyCount = await authClient.company.count()
    const subscriptionCount = await authClient.subscription.count()
    
    console.log('   Users:', userCount)
    console.log('   Companies:', companyCount)
    console.log('   Subscriptions:', subscriptionCount)
    
    await authClient.$disconnect()
  } catch (error) {
    console.log('❌ AUTH Database: Connection failed')
    console.log('   Error:', error.message)
  }

  console.log('\n2. Testing HR Database Connection:')
  try {
    const hrClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.HR_DATABASE_URL
        }
      }
    })
    
    const hrResult = await hrClient.$queryRaw`SELECT 1 as test`
    console.log('✅ HR Database: Connected successfully')
    console.log('   URL:', process.env.HR_DATABASE_URL?.split('@')[1]?.split('?')[0])
    
    // Count some records
    const employeeCount = await hrClient.employee.count()
    console.log('   Employees:', employeeCount)
    
    await hrClient.$disconnect()
  } catch (error) {
    console.log('❌ HR Database: Connection failed')
    console.log('   Error:', error.message)
  }

  console.log('\n3. Testing PAYROLL Database Connection:')
  try {
    const payrollClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.PAYROLL_DATABASE_URL
        }
      }
    })
    
    const payrollResult = await payrollClient.$queryRaw`SELECT 1 as test`
    console.log('✅ PAYROLL Database: Connected successfully')
    console.log('   URL:', process.env.PAYROLL_DATABASE_URL?.split('@')[1]?.split('?')[0])
    
    // Count some records
    const payrollRecordCount = await payrollClient.payrollRecord.count()
    console.log('   Payroll Records:', payrollRecordCount)
    
    await payrollClient.$disconnect()
  } catch (error) {
    console.log('❌ PAYROLL Database: Connection failed')
    console.log('   Error:', error.message)
  }

  console.log('\n🎯 Database Connection Summary:')
  console.log('AUTH Database: User authentication, companies, subscriptions')
  console.log('HR Database: Employee records, personal information')
  console.log('PAYROLL Database: Payroll calculations, tax records, payslips')
}

// Load environment variables
require('dotenv').config({ path: '.env.local' })

testDatabaseConnections()
