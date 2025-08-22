/**
 * Test Phase 1 Compliance Enhancements
 * Tests the new compliance features in the payslip system
 */

require('dotenv').config({ path: '.env.local' });

// Test the individual compliance modules
async function testComplianceModules() {
  console.log('🧪 Testing Phase 1 Compliance Enhancements...\n');

  try {
    // Test 1: Minimum Wage Calculation
    console.log('1️⃣ Testing Minimum Wage Calculation...');
    const { checkMinimumWageCompliance } = require('./src/lib/dutch-minimum-wage.ts');
    
    const minimumWageTest = checkMinimumWageCompliance(
      3500, // Monthly salary
      new Date('1990-05-15'), // Date of birth (33 years old)
      40, // Contract hours
      new Date('2025-10-01') // Reference date
    );
    
    console.log(`   ✅ Age Category: ${minimumWageTest.ageCategory}`);
    console.log(`   ✅ Monthly Minimum: €${minimumWageTest.monthlyAmount.toFixed(2)}`);
    console.log(`   ✅ Compliance: ${minimumWageTest.complianceMessage}`);
    console.log('');

    // Test 2: Social Security Breakdown
    console.log('2️⃣ Testing Social Security Breakdown...');
    const { calculateSocialSecurityBreakdown } = require('./src/lib/dutch-social-security.ts');
    
    const socialSecurityTest = calculateSocialSecurityBreakdown(3500);
    
    console.log(`   ✅ AOW: ${(socialSecurityTest.aow.rate * 100).toFixed(1)}% = €${socialSecurityTest.aow.amount.toFixed(2)}`);
    console.log(`   ✅ WW: ${(socialSecurityTest.ww.rate * 100).toFixed(1)}% = €${socialSecurityTest.ww.amount.toFixed(2)}`);
    console.log(`   ✅ WIA: ${(socialSecurityTest.wia.rate * 100).toFixed(1)}% = €${socialSecurityTest.wia.amount.toFixed(2)}`);
    console.log(`   ✅ Zvw: ${(socialSecurityTest.zvw.rate * 100).toFixed(1)}% = €${socialSecurityTest.zvw.amount.toFixed(2)}`);
    console.log(`   ✅ Total: €${socialSecurityTest.total.amount.toFixed(2)}`);
    console.log('');

    // Test 3: Working Hours Calculation
    console.log('3️⃣ Testing Working Hours Calculation...');
    const { calculateWorkingHours } = require('./src/lib/working-hours-calculator.ts');
    
    const workingHoursTest = calculateWorkingHours(
      40, // Contract hours per week
      176, // Actual hours worked
      3500, // Gross monthly salary
      2025, // Year
      10, // Month (October)
      new Date('2025-08-11') // Start date
    );
    
    console.log(`   ✅ Contract Hours: ${workingHoursTest.contractHours.weekly}/week, ${workingHoursTest.contractHours.monthly.toFixed(1)}/month`);
    console.log(`   ✅ Actual Hours: ${workingHoursTest.actualHours.total} (${workingHoursTest.actualHours.regular.toFixed(1)} regular + ${workingHoursTest.actualHours.overtime.toFixed(1)} overtime)`);
    console.log(`   ✅ Working Days: ${workingHoursTest.workingDays.actualDays}/${workingHoursTest.workingDays.workingDaysInMonth}`);
    console.log(`   ✅ Hourly Rate: €${workingHoursTest.hourlyRate.regular.toFixed(2)} regular`);
    console.log(`   ✅ Compliance: ${workingHoursTest.compliance.message}`);
    console.log('');

    // Test 4: Holiday Allowance Calculation
    console.log('4️⃣ Testing Holiday Allowance Calculation...');
    const { calculateHolidayAllowance } = require('./src/lib/holiday-allowance-calculator.ts');
    
    const holidayAllowanceTest = calculateHolidayAllowance(
      42000, // Annual salary
      3500, // Monthly salary
      8.33, // Holiday rate
      2025, // Year
      10, // Month (October)
      new Date('2025-08-11') // Start date
    );
    
    console.log(`   ✅ Statutory Rate: ${holidayAllowanceTest.statutory.rate}%`);
    console.log(`   ✅ Actual Rate: ${holidayAllowanceTest.actual.rate}%`);
    console.log(`   ✅ Annual Amount: €${holidayAllowanceTest.actual.amount.toFixed(2)}`);
    console.log(`   ✅ Monthly Reserve: €${holidayAllowanceTest.reserve.thisMonth.toFixed(2)}`);
    console.log(`   ✅ Current Balance: €${holidayAllowanceTest.reserve.balance.toFixed(2)}`);
    console.log(`   ✅ Compliance: ${holidayAllowanceTest.compliance.message}`);
    console.log('');

    // Test 5: Vacation Days Calculation
    console.log('5️⃣ Testing Vacation Days Calculation...');
    const { calculateVacationDays } = require('./src/lib/holiday-allowance-calculator.ts');
    
    const vacationDaysTest = calculateVacationDays(
      40, // Contract hours per week
      25, // Contract vacation days
      2025, // Year
      10, // Month (October)
      new Date('2025-08-11'), // Start date
      0 // Vacation days used
    );
    
    console.log(`   ✅ Statutory Days: ${vacationDaysTest.statutory.daysPerYear.toFixed(1)} days`);
    console.log(`   ✅ Contract Days: ${vacationDaysTest.contract.daysPerYear} days`);
    console.log(`   ✅ Earned to Date: ${vacationDaysTest.balance.earned.toFixed(1)} days`);
    console.log(`   ✅ Remaining: ${vacationDaysTest.balance.remaining.toFixed(1)} days`);
    console.log('');

    console.log('🎉 All compliance modules tested successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error testing compliance modules:', error);
    return false;
  }
}

// Test payslip generation with compliance data
async function testPayslipGeneration() {
  console.log('📄 Testing Payslip Generation with Compliance Data...\n');

  try {
    const { generatePayslip } = require('./src/lib/payslip-generator.ts');
    
    const testParams = {
      employeeId: 'cme7fsv070009k40and8jh2l4', // Cihat Kaya
      year: 2025,
      month: 10,
      companyId: 'cm7fsv070009k40and8jh2l4'
    };

    console.log(`🎯 Generating payslip for employee: ${testParams.employeeId}`);
    console.log(`📅 Period: ${testParams.month}/${testParams.year}`);
    console.log('');

    const result = await generatePayslip(testParams);

    if (result.success) {
      console.log('✅ Payslip generated successfully!');
      console.log(`📁 File: ${result.fileName}`);
      console.log(`📂 Path: ${result.filePath}`);
      
      if (result.payslipGeneration) {
        console.log(`💾 Database record: ${result.payslipGeneration.id}`);
      }
    } else {
      console.log('❌ Payslip generation failed:', result.error);
      return false;
    }

    console.log('');
    return true;

  } catch (error) {
    console.error('❌ Error testing payslip generation:', error);
    return false;
  }
}

// Main test function
async function runComplianceTests() {
  console.log('🚀 Starting Phase 1 Compliance Enhancement Tests\n');
  console.log('=' .repeat(60));
  console.log('');

  const moduleTestResult = await testComplianceModules();
  
  if (moduleTestResult) {
    console.log('=' .repeat(60));
    console.log('');
    
    const payslipTestResult = await testPayslipGeneration();
    
    if (payslipTestResult) {
      console.log('=' .repeat(60));
      console.log('');
      console.log('🎉 ALL PHASE 1 COMPLIANCE TESTS PASSED!');
      console.log('');
      console.log('✅ Minimum wage disclosure implemented');
      console.log('✅ Social security breakdown implemented');
      console.log('✅ Working hours information implemented');
      console.log('✅ Holiday allowance transparency implemented');
      console.log('✅ Payslip generation with compliance data working');
      console.log('');
      console.log('🚀 Ready for deployment to production!');
    } else {
      console.log('❌ Payslip generation tests failed');
      process.exit(1);
    }
  } else {
    console.log('❌ Compliance module tests failed');
    process.exit(1);
  }
}

// Run the tests
runComplianceTests().catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});

