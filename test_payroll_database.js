const { PrismaClient: PayrollClient } = require('@prisma/payroll-client')

async function testPayrollDatabase() {
  console.log('🔍 Testing PAYROLL Database with correct client...\n')

  try {
    const payrollClient = new PayrollClient({
      datasources: {
        db: {
          url: process.env.PAYROLL_DATABASE_URL
        }
      }
    })
    
    console.log('✅ PAYROLL Client initialized successfully')
    
    // Test basic connection
    const result = await payrollClient.$queryRaw`SELECT 1 as test`
    console.log('✅ PAYROLL Database: Connected successfully')
    
    // Count records with correct model names
    const payrollRecordCount = await payrollClient.payrollRecord.count()
    const taxCalculationCount = await payrollClient.taxCalculation.count()
    const payslipGenerationCount = await payrollClient.payslipGeneration.count()
    
    console.log('📊 PAYROLL Database Statistics:')
    console.log('   Payroll Records:', payrollRecordCount)
    console.log('   Tax Calculations:', taxCalculationCount)
    console.log('   Payslip Generations:', payslipGenerationCount)
    
    // Get sample payroll data
    if (payrollRecordCount > 0) {
      const samplePayroll = await payrollClient.payrollRecord.findFirst({
        select: {
          id: true,
          employeeNumber: true,
          firstName: true,
          lastName: true,
          period: true,
          grossSalary: true,
          netSalary: true,
          status: true
        }
      })
      
      console.log('\n💰 Sample Payroll Record:')
      console.log('   ID:', samplePayroll.id)
      console.log('   Employee:', `${samplePayroll.firstName} ${samplePayroll.lastName} (${samplePayroll.employeeNumber})`)
      console.log('   Period:', samplePayroll.period)
      console.log('   Gross Salary:', `€${samplePayroll.grossSalary}`)
      console.log('   Net Salary:', `€${samplePayroll.netSalary}`)
      console.log('   Status:', samplePayroll.status)
    }
    
    await payrollClient.$disconnect()
    console.log('\n✅ PAYROLL Database test completed successfully!')
    
  } catch (error) {
    console.log('❌ PAYROLL Database test failed:')
    console.log('   Error:', error.message)
    console.log('   Stack:', error.stack)
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' })

testPayrollDatabase()
