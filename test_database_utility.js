const dbUtils = require('./src/lib/database-clients.ts')

async function testDatabaseUtility() {
  console.log('🔍 Testing Database Utility...\n')

  try {
    // Test all connections
    console.log('1. Testing all database connections:')
    const connections = await dbUtils.testAllConnections()
    
    console.log('   AUTH Database:', connections.auth.connected ? '✅ Connected' : `❌ Failed: ${connections.auth.error}`)
    console.log('   HR Database:', connections.hr.connected ? '✅ Connected' : `❌ Failed: ${connections.hr.error}`)
    console.log('   PAYROLL Database:', connections.payroll.connected ? '✅ Connected' : `❌ Failed: ${connections.payroll.error}`)

    // Get database statistics
    console.log('\n2. Getting database statistics:')
    const stats = await dbUtils.getDatabaseStatistics()
    
    console.log('   📊 AUTH Database:')
    console.log('      Users:', stats.auth.users)
    console.log('      Companies:', stats.auth.companies)
    console.log('      Subscriptions:', stats.auth.subscriptions)
    
    console.log('   📊 HR Database:')
    console.log('      Employees:', stats.hr.employees)
    console.log('      Companies:', stats.hr.companies)
    console.log('      Departments:', stats.hr.departments)
    console.log('      Leave Requests:', stats.hr.leaveRequests)
    
    console.log('   📊 PAYROLL Database:')
    console.log('      Payroll Records:', stats.payroll.payrollRecords)
    console.log('      Tax Calculations:', stats.payroll.taxCalculations)
    console.log('      Payslip Generations:', stats.payroll.payslipGenerations)

    // Perform health check
    console.log('\n3. Performing health check:')
    const health = await dbUtils.performHealthCheck()
    
    console.log('   Overall Status:', health.status === 'healthy' ? '✅ HEALTHY' : 
                                    health.status === 'degraded' ? '⚠️ DEGRADED' : '❌ UNHEALTHY')
    console.log('   AUTH Database:', health.databases.auth.status === 'up' ? 
                 `✅ UP (${health.databases.auth.responseTime}ms)` : 
                 `❌ DOWN (${health.databases.auth.error})`)
    console.log('   HR Database:', health.databases.hr.status === 'up' ? 
                 `✅ UP (${health.databases.hr.responseTime}ms)` : 
                 `❌ DOWN (${health.databases.hr.error})`)
    console.log('   PAYROLL Database:', health.databases.payroll.status === 'up' ? 
                 `✅ UP (${health.databases.payroll.responseTime}ms)` : 
                 `❌ DOWN (${health.databases.payroll.error})`)

    // Test individual clients
    console.log('\n4. Testing individual clients:')
    
    const authClient = dbUtils.getAuthClient()
    const hrClient = dbUtils.getHRClient()
    const payrollClient = dbUtils.getPayrollClient()
    
    console.log('   ✅ AUTH Client initialized')
    console.log('   ✅ HR Client initialized')
    console.log('   ✅ PAYROLL Client initialized')

    // Disconnect all clients
    await dbUtils.disconnectAllClients()
    console.log('\n✅ All database clients disconnected successfully')

    console.log('\n🎉 Database utility test completed successfully!')

  } catch (error) {
    console.log('❌ Database utility test failed:')
    console.log('   Error:', error.message)
    console.log('   Stack:', error.stack)
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' })

testDatabaseUtility()
