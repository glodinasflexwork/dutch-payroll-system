#!/usr/bin/env node

/**
 * Test script to validate employee portal bug fixes
 * Tests the fixes for missing payrollClient imports and schema mismatches
 */

const { hrClient, payrollClient } = require('./src/lib/database-clients');

async function testEmployeePortalFixes() {
  console.log('🧪 Testing Employee Portal Bug Fixes...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Verify payrollClient is properly exported and accessible
  try {
    console.log('1. Testing payrollClient import and connection...');
    
    if (!payrollClient) {
      throw new Error('payrollClient is not exported from database-clients');
    }
    
    // Test basic connection
    await payrollClient.$queryRaw`SELECT 1 as test`;
    
    console.log('   ✅ payrollClient is properly exported and connected');
    results.passed++;
    results.tests.push({ name: 'payrollClient import', status: 'PASSED' });
  } catch (error) {
    console.log(`   ❌ payrollClient test failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'payrollClient import', status: 'FAILED', error: error.message });
  }

  // Test 2: Verify hrClient is working for employee queries
  try {
    console.log('2. Testing hrClient employee queries...');
    
    if (!hrClient) {
      throw new Error('hrClient is not exported from database-clients');
    }
    
    // Test basic employee query structure (should not fail even if no data)
    const testQuery = await hrClient.employee.findMany({
      take: 1,
      select: {
        id: true,
        portalAccessStatus: true // This should exist in schema
      }
    });
    
    console.log('   ✅ hrClient employee queries work with portalAccessStatus field');
    results.passed++;
    results.tests.push({ name: 'hrClient employee queries', status: 'PASSED' });
  } catch (error) {
    console.log(`   ❌ hrClient test failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'hrClient employee queries', status: 'FAILED', error: error.message });
  }

  // Test 3: Verify payrollClient can query payroll records
  try {
    console.log('3. Testing payrollClient payroll record queries...');
    
    // Test basic payroll record query structure
    const testPayrollQuery = await payrollClient.payrollRecord.findMany({
      take: 1,
      select: {
        id: true,
        employeeId: true,
        netAmount: true,
        grossAmount: true
      }
    });
    
    console.log('   ✅ payrollClient can query payroll records');
    results.passed++;
    results.tests.push({ name: 'payrollClient payroll queries', status: 'PASSED' });
  } catch (error) {
    console.log(`   ❌ payrollClient payroll query failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'payrollClient payroll queries', status: 'FAILED', error: error.message });
  }

  // Test 4: Verify payslip generation queries work
  try {
    console.log('4. Testing payrollClient payslip generation queries...');
    
    // Test payslip generation query structure
    const testPayslipQuery = await payrollClient.payslipGeneration.findMany({
      take: 1,
      select: {
        id: true,
        employeeId: true,
        fileName: true,
        status: true
      }
    });
    
    console.log('   ✅ payrollClient can query payslip generation records');
    results.passed++;
    results.tests.push({ name: 'payrollClient payslip queries', status: 'PASSED' });
  } catch (error) {
    console.log(`   ❌ payrollClient payslip query failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'payrollClient payslip queries', status: 'FAILED', error: error.message });
  }

  // Test 5: Test schema field consistency
  try {
    console.log('5. Testing schema field consistency...');
    
    // Verify that portalAccessStatus field exists and has expected values
    const employees = await hrClient.employee.findMany({
      take: 5,
      select: {
        id: true,
        portalAccessStatus: true
      }
    });
    
    // Check that portalAccessStatus is a string field (not an object)
    const hasValidStatus = employees.every(emp => 
      typeof emp.portalAccessStatus === 'string' || emp.portalAccessStatus === null
    );
    
    if (!hasValidStatus) {
      throw new Error('portalAccessStatus should be a string field, not an object');
    }
    
    console.log('   ✅ portalAccessStatus field is correctly typed as string');
    results.passed++;
    results.tests.push({ name: 'schema field consistency', status: 'PASSED' });
  } catch (error) {
    console.log(`   ❌ Schema field test failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'schema field consistency', status: 'FAILED', error: error.message });
  }

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Tests Passed: ${results.passed}`);
  console.log(`❌ Tests Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All employee portal bug fixes validated successfully!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
  }

  return results;
}

// Run the tests
testEmployeePortalFixes()
  .then(results => {
    process.exit(results.failed === 0 ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });

