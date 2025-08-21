// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const { PrismaClient: PayrollClient } = require('@prisma/payroll-client');

async function clearPayrollHistory() {
  console.log('🧹 CLEARING PAYROLL HISTORY FOR CLEAN SLATE...\n');

  const payrollClient = new PayrollClient();

  try {
    // Step 1: Check current data before clearing
    console.log('📊 STEP 1: Checking current payroll data...');
    
    const payrollCount = await payrollClient.payrollRecord.count();
    const payslipCount = await payrollClient.payslipGeneration.count();
    const batchCount = await payrollClient.payrollBatch.count();
    const taxCalcCount = await payrollClient.taxCalculation.count();

    console.log(`Current data counts:`);
    console.log(`   PayrollRecords: ${payrollCount}`);
    console.log(`   PayslipGenerations: ${payslipCount}`);
    console.log(`   PayrollBatches: ${batchCount}`);
    console.log(`   TaxCalculations: ${taxCalcCount}`);

    if (payrollCount === 0 && payslipCount === 0 && batchCount === 0 && taxCalcCount === 0) {
      console.log('\n✅ Database is already clean - no payroll history to clear!');
      return;
    }

    // Step 2: Clear PayslipGeneration records first (due to foreign key constraints)
    console.log('\n📊 STEP 2: Clearing PayslipGeneration records...');
    
    const deletedPayslips = await payrollClient.payslipGeneration.deleteMany({});
    console.log(`✅ Deleted ${deletedPayslips.count} PayslipGeneration records`);

    // Step 3: Clear TaxCalculation records
    console.log('\n📊 STEP 3: Clearing TaxCalculation records...');
    
    const deletedTaxCalcs = await payrollClient.taxCalculation.deleteMany({});
    console.log(`✅ Deleted ${deletedTaxCalcs.count} TaxCalculation records`);

    // Step 4: Clear PayrollRecord records
    console.log('\n📊 STEP 4: Clearing PayrollRecord records...');
    
    const deletedPayrolls = await payrollClient.payrollRecord.deleteMany({});
    console.log(`✅ Deleted ${deletedPayrolls.count} PayrollRecord records`);

    // Step 5: Clear PayrollBatch records
    console.log('\n📊 STEP 5: Clearing PayrollBatch records...');
    
    const deletedBatches = await payrollClient.payrollBatch.deleteMany({});
    console.log(`✅ Deleted ${deletedBatches.count} PayrollBatch records`);

    // Step 6: Clear any other payroll-related data
    console.log('\n📊 STEP 6: Clearing additional payroll data...');
    
    // Check if there are other tables to clear
    try {
      const deletedReports = await payrollClient.payrollReport?.deleteMany({}) || { count: 0 };
      console.log(`✅ Deleted ${deletedReports.count} PayrollReport records`);
    } catch (error) {
      // PayrollReport table might not exist
      console.log('ℹ️  No PayrollReport table found (this is normal)');
    }

    // Step 7: Verify cleanup
    console.log('\n📊 STEP 7: Verifying cleanup...');
    
    const finalPayrollCount = await payrollClient.payrollRecord.count();
    const finalPayslipCount = await payrollClient.payslipGeneration.count();
    const finalBatchCount = await payrollClient.payrollBatch.count();
    const finalTaxCalcCount = await payrollClient.taxCalculation.count();

    console.log(`Final data counts:`);
    console.log(`   PayrollRecords: ${finalPayrollCount}`);
    console.log(`   PayslipGenerations: ${finalPayslipCount}`);
    console.log(`   PayrollBatches: ${finalBatchCount}`);
    console.log(`   TaxCalculations: ${finalTaxCalcCount}`);

    if (finalPayrollCount === 0 && finalPayslipCount === 0 && finalBatchCount === 0 && finalTaxCalcCount === 0) {
      console.log('\n🎉 SUCCESS: Payroll history completely cleared!');
      console.log('\n📋 CLEAN SLATE READY:');
      console.log('✅ All payroll processing history removed');
      console.log('✅ All payslip generation records removed');
      console.log('✅ All batch processing records removed');
      console.log('✅ All tax calculation records removed');
      console.log('✅ Employee and company data preserved in HR database');
      console.log('\n🚀 You can now start fresh with payroll processing!');
    } else {
      console.log('\n⚠️  WARNING: Some records may not have been cleared');
      console.log('   Please check the database manually');
    }

    // Step 8: Clean up any generated payslip files
    console.log('\n📊 STEP 8: Cleaning up generated payslip files...');
    
    const fs = require('fs');
    const path = require('path');
    
    const payslipDirs = ['/tmp/payslips', './payslips', './generated-payslips'];
    
    for (const dir of payslipDirs) {
      try {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            if (file.endsWith('.html') && file.startsWith('payslip-')) {
              fs.unlinkSync(path.join(dir, file));
              console.log(`✅ Deleted payslip file: ${file}`);
            }
          }
        }
      } catch (error) {
        console.log(`ℹ️  Could not clean directory ${dir}: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Failed to clear payroll history:', error.message);
    console.error('Full error:', error);
  } finally {
    await payrollClient.$disconnect();
  }
}

clearPayrollHistory();

