/**
 * Create a test payroll record for testing payslip download functionality
 */

const { PrismaClient: PayrollPrismaClient } = require('@prisma/payroll-client')

// Initialize payroll client
const payrollClient = new PayrollPrismaClient({
  datasources: {
    db: {
      url: process.env.PAYROLL_DATABASE_URL
    }
  }
})

async function createTestPayrollRecord() {
  try {
    console.log('🔧 CREATING TEST PAYROLL RECORD')
    console.log('=================================')
    
    const companyId = 'cme7fn8kf0000k40ag368f3a1' // Glodinas Finance B.V.
    const employeeId = 'cme7fsv070009k40and8jh2l4' // Cihat Kaya
    const year = 2025
    const month = 1
    
    console.log(`Creating payroll record for:`)
    console.log(`  Company ID: ${companyId}`)
    console.log(`  Employee ID: ${employeeId}`)
    console.log(`  Period: ${year}-${String(month).padStart(2, '0')}`)
    
    // Create the payroll record
    const payrollRecord = await payrollClient.payrollRecord.create({
      data: {
        employeeId: employeeId,
        employeeNumber: 'EMP0001',
        firstName: 'Cihat',
        lastName: 'Kaya',
        period: `${year}-${String(month).padStart(2, '0')}`,
        year: year,
        month: month,
        grossSalary: 3500.00,
        netSalary: 2551.22,
        taxDeduction: 0.00,
        socialSecurity: 918.33,
        pensionDeduction: 30.45,
        otherDeductions: 0.00,
        overtime: 0.00,
        bonus: 0.00,
        holidayAllowance: 291.55,
        expenses: 0.00,
        paymentDate: new Date(),
        status: 'processed',
        companyId: companyId
      }
    })
    
    console.log('✅ Successfully created payroll record:')
    console.log(`  Record ID: ${payrollRecord.id}`)
    console.log(`  Employee: ${payrollRecord.firstName} ${payrollRecord.lastName}`)
    console.log(`  Period: ${payrollRecord.period}`)
    console.log(`  Gross: €${payrollRecord.grossSalary}`)
    console.log(`  Net: €${payrollRecord.netSalary}`)
    console.log(`  Status: ${payrollRecord.status}`)
    
    console.log('\n🎯 TEST PAYSLIP DOWNLOAD:')
    console.log(`URL: /api/payslips/download?employeeId=${employeeId}&year=${year}&month=${month}`)
    
    console.log('\n✅ TEST RECORD CREATED SUCCESSFULLY!')
    
  } catch (error) {
    console.error('❌ Error creating test payroll record:', error)
  } finally {
    await payrollClient.$disconnect()
  }
}

// Run the script
createTestPayrollRecord()

