/**
 * Test Fixed Payslip Generation
 * Tests the CommonJS fixes for payslip generation
 */

require('dotenv').config({ path: '.env.local' });

async function testFixedPayslipGeneration() {
  console.log('🔧 Testing Fixed Payslip Generation...\n');

  try {
    console.log('1️⃣ Testing minimum wage module...');
    const { checkMinimumWageCompliance } = require('./src/lib/dutch-minimum-wage.ts');
    
    const minimumWageTest = checkMinimumWageCompliance(
      3500, // Monthly salary
      new Date('1990-05-15'), // Date of birth
      40, // Contract hours
      new Date('2025-10-01') // Reference date
    );
    
    console.log(`   ✅ Minimum wage module working: ${minimumWageTest.complianceMessage}`);

    console.log('2️⃣ Testing payslip generator...');
    const { generatePayslip } = require('./src/lib/payslip-generator.ts');
    
    console.log('   ✅ Payslip generator module imported successfully');

    console.log('3️⃣ Testing database connections...');
    const { hrClient, payrollClient } = require('./src/lib/database-clients.ts');
    
    const employeeCount = await hrClient.employee.count();
    const payrollCount = await payrollClient.payrollRecord.count();
    
    console.log(`   ✅ HR database: ${employeeCount} employees`);
    console.log(`   ✅ Payroll database: ${payrollCount} records`);

    console.log('4️⃣ Testing full payslip generation...');
    
    const testParams = {
      employeeId: 'cme7fsv070009k40and8jh2l4', // Cihat Kaya
      year: 2025,
      month: 10,
      companyId: 'cm7fsv070009k40and8jh2l4'
    };

    console.log(`   🎯 Generating payslip for employee: ${testParams.employeeId}`);
    console.log(`   📅 Period: ${testParams.month}/${testParams.year}`);

    const result = await generatePayslip(testParams);

    if (result.success) {
      console.log('   ✅ Payslip generation SUCCESSFUL!');
      console.log(`      File: ${result.fileName}`);
      console.log(`      Path: ${result.filePath}`);
      
      if (result.payslipGeneration) {
        console.log(`      Database record: ${result.payslipGeneration.id}`);
      }
    } else {
      console.log('   ❌ Payslip generation FAILED!');
      console.log(`      Error: ${result.error}`);
      return false;
    }

    console.log('');
    console.log('🎉 ALL TESTS PASSED!');
    console.log('');
    console.log('✅ CommonJS conversion successful');
    console.log('✅ Module imports working');
    console.log('✅ Database connections working');
    console.log('✅ Payslip generation working');
    console.log('✅ Phase 1 compliance features integrated');
    
    return true;

  } catch (error) {
    console.log('   ❌ CRITICAL ERROR:');
    console.log(`      ${error.message}`);
    console.log('');
    console.log('   📋 Full error details:');
    console.log(error);
    return false;
  }
}

// Run the test
testFixedPayslipGeneration().then(success => {
  if (success) {
    console.log('\n🚀 Payslip generation is now working with Phase 1 compliance features!');
    process.exit(0);
  } else {
    console.log('\n❌ Payslip generation still has issues that need to be resolved!');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});

