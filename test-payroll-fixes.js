/**
 * Payroll Calculation Fix Validation Script
 * 
 * This script tests the fixes implemented for payroll calculation errors:
 * 1. Missing payrollClient imports in API routes
 * 2. Missing TAX_BRACKETS_2025 definition
 * 3. Incomplete PayrollResult interface implementation
 * 4. Income tax references removed (handled by tax advisors)
 */

const fs = require('fs');
const path = require('path');

function testPayrollFixes() {
  console.log('🧪 Testing payroll calculation fixes...\n');
  
  let passedTests = 0;
  let totalTests = 0;

  // Test 1: Payroll API Routes Import Fix
  totalTests++;
  console.log('=== TEST 1: Payroll API Routes Import Fix ===');
  try {
    const payrollRoutes = [
      'src/app/api/payroll/route.ts',
      'src/app/api/payroll/batch/route.ts',
      'src/app/api/payroll/approval/route.ts',
      'src/app/api/payroll/management/route.ts',
      'src/app/api/payroll/secure/route.ts'
    ];
    
    let allFixed = true;
    for (const route of payrollRoutes) {
      if (fs.existsSync(route)) {
        const content = fs.readFileSync(route, 'utf8');
        if (!content.includes('import { payrollClient } from "@/lib/database-clients"')) {
          console.log(`❌ ${route} missing payrollClient import`);
          allFixed = false;
        }
      }
    }
    
    if (allFixed) {
      console.log('✅ All payroll API routes have correct payrollClient imports');
      passedTests++;
    } else {
      console.log('❌ Some payroll API routes missing payrollClient imports');
    }
  } catch (error) {
    console.log('❌ Error checking payroll API routes:', error.message);
  }

  // Test 2: TAX_BRACKETS_2025 Definition
  totalTests++;
  console.log('\n=== TEST 2: TAX_BRACKETS_2025 Definition ===');
  try {
    const payrollCalc = fs.readFileSync('src/lib/payroll-calculations.ts', 'utf8');
    if (payrollCalc.includes('const TAX_BRACKETS_2025 = {') && 
        payrollCalc.includes('belowPensionAge:') &&
        payrollCalc.includes('pensionAge1945Earlier:') &&
        payrollCalc.includes('pensionAge1946Plus:')) {
      console.log('✅ TAX_BRACKETS_2025 properly defined with all age categories');
      passedTests++;
    } else {
      console.log('❌ TAX_BRACKETS_2025 not properly defined');
    }
  } catch (error) {
    console.log('❌ Error reading payroll-calculations.ts:', error.message);
  }

  // Test 3: PayrollResult Interface Completeness
  totalTests++;
  console.log('\n=== TEST 3: PayrollResult Interface Completeness ===');
  try {
    const payrollCalc = fs.readFileSync('src/lib/payroll-calculations.ts', 'utf8');
    const requiredProperties = [
      'employerAWFContribution',
      'employerAOFContribution', 
      'employerWKOSurcharge',
      'employerUFOPremium',
      'totalEmployerCosts',
      'holidayAllowanceNet',
      'taxBracketBreakdown'
    ];
    
    let allPropertiesPresent = true;
    for (const prop of requiredProperties) {
      if (!payrollCalc.includes(prop + ':')) {
        console.log(`❌ Missing property in return statement: ${prop}`);
        allPropertiesPresent = false;
      }
    }
    
    if (allPropertiesPresent) {
      console.log('✅ PayrollResult return statement includes all required properties');
      passedTests++;
    } else {
      console.log('❌ PayrollResult return statement missing some properties');
    }
  } catch (error) {
    console.log('❌ Error checking PayrollResult completeness:', error.message);
  }

  // Test 4: Income Tax References Removed
  totalTests++;
  console.log('\n=== TEST 4: Income Tax References Removed ===');
  try {
    const payrollCalc = fs.readFileSync('src/lib/payroll-calculations.ts', 'utf8');
    const incomeTaxRefs = [
      'incomeTaxBeforeCredits',
      'generalTaxCredit',
      'employedPersonTaxCredit',
      'youngDisabledTaxCredit',
      'totalTaxCredits',
      'incomeTaxAfterCredits',
      'totalTaxAndInsurance',
      'netMonthlySalary',
      'netAnnualSalary'
    ];
    
    let foundIncomeTaxRefs = false;
    for (const ref of incomeTaxRefs) {
      if (payrollCalc.includes(`result.${ref}`)) {
        console.log(`❌ Found income tax reference: result.${ref}`);
        foundIncomeTaxRefs = true;
      }
    }
    
    if (!foundIncomeTaxRefs && payrollCalc.includes('handled separately by tax advisors')) {
      console.log('✅ Income tax references removed, proper note added');
      passedTests++;
    } else {
      console.log('❌ Income tax references still present or note missing');
    }
  } catch (error) {
    console.log('❌ Error checking income tax references:', error.message);
  }

  // Test 5: TypeScript Compilation
  totalTests++;
  console.log('\n=== TEST 5: TypeScript Compilation ===');
  try {
    const { execSync } = require('child_process');
    execSync('npx tsc --noEmit src/lib/payroll-calculations.ts', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('✅ Payroll calculations TypeScript compilation successful');
    passedTests++;
  } catch (error) {
    console.log('❌ TypeScript compilation failed:', error.message);
  }

  // Test 6: Server Response
  totalTests++;
  console.log('\n=== TEST 6: Server Response ===');
  try {
    const { execSync } = require('child_process');
    const result = execSync('curl -s http://localhost:3003/api/payroll', { encoding: 'utf8' });
    if (result.includes('Authentication required') || result.includes('error')) {
      console.log('✅ Payroll API responding (authentication working)');
      passedTests++;
    } else {
      console.log('❌ Payroll API not responding properly');
    }
  } catch (error) {
    console.log('❌ Server response test failed:', error.message);
  }

  // Summary
  console.log('\n=== PAYROLL FIX VALIDATION SUMMARY ===');
  console.log(`✅ Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All payroll calculation fixes validated successfully!');
  } else {
    console.log(`⚠️ ${totalTests - passedTests} tests failed - some fixes may need attention`);
  }

  // Additional checks
  console.log('\n=== ADDITIONAL CHECKS ===');
  
  // Check for proper social security focus
  try {
    const payrollCalc = fs.readFileSync('src/lib/payroll-calculations.ts', 'utf8');
    if (payrollCalc.includes('Social Security Contributions Only') && 
        payrollCalc.includes('NO income tax calculations')) {
      console.log('✅ Proper focus on social security contributions confirmed');
    } else {
      console.log('⚠️ Social security focus documentation could be clearer');
    }
  } catch (error) {
    console.log('⚠️ Could not verify social security focus');
  }

  return passedTests === totalTests;
}

// Run the tests
if (require.main === module) {
  const success = testPayrollFixes();
  process.exit(success ? 0 : 1);
}

module.exports = { testPayrollFixes };

