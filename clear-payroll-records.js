/**
 * Clear Payroll Records Script
 * Safely removes all payroll records and associated payslip generation records
 * This allows for fresh payroll processing testing
 */

const { PrismaClient } = require('@prisma/payroll-client')

async function clearPayrollRecords() {
  const payrollClient = new PrismaClient()

  try {
    console.log('🧹 Starting payroll records cleanup...')

    // First, get a count of existing records
    const payrollCount = await payrollClient.payrollRecord.count()
    const payslipCount = await payrollClient.payslipGeneration.count()

    console.log(`📊 Current records:`)
    console.log(`   - PayrollRecord entries: ${payrollCount}`)
    console.log(`   - PayslipGeneration entries: ${payslipCount}`)

    if (payrollCount === 0 && payslipCount === 0) {
      console.log('✅ No payroll records to delete. Database is already clean.')
      return
    }

    // Delete PayslipGeneration records first (due to foreign key constraint)
    console.log('🗑️  Deleting PayslipGeneration records...')
    const deletedPayslips = await payrollClient.payslipGeneration.deleteMany({})
    console.log(`✅ Deleted ${deletedPayslips.count} PayslipGeneration records`)

    // Delete PayrollRecord entries
    console.log('🗑️  Deleting PayrollRecord entries...')
    const deletedPayrolls = await payrollClient.payrollRecord.deleteMany({})
    console.log(`✅ Deleted ${deletedPayrolls.count} PayrollRecord entries`)

    // Verify cleanup
    const remainingPayrolls = await payrollClient.payrollRecord.count()
    const remainingPayslips = await payrollClient.payslipGeneration.count()

    console.log(`📊 After cleanup:`)
    console.log(`   - PayrollRecord entries: ${remainingPayrolls}`)
    console.log(`   - PayslipGeneration entries: ${remainingPayslips}`)

    if (remainingPayrolls === 0 && remainingPayslips === 0) {
      console.log('🎉 Payroll records cleanup completed successfully!')
      console.log('💡 You can now run fresh payroll processing tests.')
    } else {
      console.log('⚠️  Some records may still remain. Please check manually.')
    }

  } catch (error) {
    console.error('❌ Error during payroll records cleanup:', error)
    
    if (error.code === 'P2003') {
      console.log('💡 Foreign key constraint error. Trying alternative cleanup order...')
      
      try {
        // Alternative cleanup approach
        await payrollClient.$executeRaw`DELETE FROM "PayslipGeneration"`
        await payrollClient.$executeRaw`DELETE FROM "PayrollRecord"`
        console.log('✅ Alternative cleanup successful!')
      } catch (altError) {
        console.error('❌ Alternative cleanup also failed:', altError)
      }
    }
  } finally {
    await payrollClient.$disconnect()
  }
}

// Run the cleanup
clearPayrollRecords()
  .then(() => {
    console.log('🏁 Cleanup script completed.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Cleanup script failed:', error)
    process.exit(1)
  })

