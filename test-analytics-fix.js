#!/usr/bin/env node

/**
 * Test script to validate analytics route bug fix
 * Tests the fix for database client mismatch and schema field corrections
 */

const { hrClient, payrollClient } = require('./src/lib/database-clients');

async function testAnalyticsFix() {
  console.log('🧪 Testing Analytics Route Bug Fix...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Verify payrollClient can access PayrollRecord
  try {
    console.log('1. Testing payrollClient PayrollRecord access...');
    
    // Test basic payroll record query structure
    const testQuery = await payrollClient.payrollRecord.findMany({
      take: 1,
      select: {
        id: true,
        employeeId: true,
        grossSalary: true,
        netSalary: true,
        taxDeduction: true,
        socialSecurity: true,
        companyId: true,
        createdAt: true
      }
    });
    
    console.log('   ✅ payrollClient can access PayrollRecord with correct fields');
    results.passed++;
    results.tests.push({ name: 'payrollClient PayrollRecord access', status: 'PASSED' });
  } catch (error) {
    console.log(`   ❌ payrollClient test failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'payrollClient PayrollRecord access', status: 'FAILED', error: error.message });
  }

  // Test 2: Verify hrClient can access Employee for department info
  try {
    console.log('2. Testing hrClient Employee department access...');
    
    // Test employee query for department information
    const testEmployeeQuery = await hrClient.employee.findMany({
      take: 1,
      select: {
        id: true,
        department: true,
        companyId: true
      }
    });
    
    console.log('   ✅ hrClient can access Employee department information');
    results.passed++;
    results.tests.push({ name: 'hrClient Employee department access', status: 'PASSED' });
  } catch (error) {
    console.log(`   ❌ hrClient Employee test failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'hrClient Employee department access', status: 'FAILED', error: error.message });
  }

  // Test 3: Verify field names match schema
  try {
    console.log('3. Testing PayrollRecord field names...');
    
    // Test that the correct field names exist in the schema
    const sampleRecord = await payrollClient.payrollRecord.findFirst({
      select: {
        grossSalary: true,
        netSalary: true,
        taxDeduction: true,
        socialSecurity: true,
        createdAt: true
      }
    });
    
    console.log('   ✅ PayrollRecord field names match schema (grossSalary, netSalary, taxDeduction)');
    results.passed++;
    results.tests.push({ name: 'PayrollRecord field names', status: 'PASSED' });
  } catch (error) {
    console.log(`   ❌ PayrollRecord field test failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'PayrollRecord field names', status: 'FAILED', error: error.message });
  }

  // Test 4: Test database separation (HR vs Payroll)
  try {
    console.log('4. Testing database separation...');
    
    // Verify hrClient doesn't have payrollRecord
    let hrHasPayrollRecord = false;
    try {
      await hrClient.payrollRecord.findMany({ take: 1 });
      hrHasPayrollRecord = true;
    } catch (error) {
      // Expected - hrClient should not have payrollRecord
    }
    
    if (hrHasPayrollRecord) {
      throw new Error('hrClient should not have access to payrollRecord');
    }
    
    console.log('   ✅ Database separation maintained (HR vs Payroll)');
    results.passed++;
    results.tests.push({ name: 'Database separation', status: 'PASSED' });
  } catch (error) {
    console.log(`   ❌ Database separation test failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Database separation', status: 'FAILED', error: error.message });
  }

  // Test 5: Test date filtering capability
  try {
    console.log('5. Testing date filtering for analytics...');
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    
    // Test date range query
    const dateFilteredRecords = await payrollClient.payrollRecord.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        grossSalary: true
      }
    });
    
    console.log('   ✅ Date filtering works for analytics queries');
    results.passed++;
    results.tests.push({ name: 'Date filtering', status: 'PASSED' });
  } catch (error) {
    console.log(`   ❌ Date filtering test failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Date filtering', status: 'FAILED', error: error.message });
  }

  // Summary
  console.log('\n📊 Analytics Fix Test Results:');
  console.log(`✅ Tests Passed: ${results.passed}`);
  console.log(`❌ Tests Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All analytics route bug fixes validated successfully!');
    console.log('The analytics API should now work correctly with proper database client usage.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
  }

  return results;
}

// Run the tests
testAnalyticsFix()
  .then(results => {
    process.exit(results.failed === 0 ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });

