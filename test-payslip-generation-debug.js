/**
 * Debug Payslip Generation Issues
 * Tests payslip generation to identify what's breaking
 */

require('dotenv').config({ path: '.env.local' });

async function testPayslipGeneration() {
  console.log('🔍 Debugging Payslip Generation Issues...\n');

  try {
    console.log('1️⃣ Testing basic payslip generation...');
    
    // Try to import the payslip generator
    console.log('   📦 Importing payslip generator...');
    const { generatePayslip } = require('./src/lib/payslip-generator.ts');
    console.log('   ✅ Payslip generator imported successfully');

    // Test parameters
    const testParams = {
      employeeId: 'cme7fsv070009k40and8jh2l4', // Cihat Kaya
      year: 2025,
      month: 10,
      companyId: 'cm7fsv070009k40and8jh2l4'
    };

    console.log('   🎯 Test parameters:');
    console.log(`      Employee ID: ${testParams.employeeId}`);
    console.log(`      Period: ${testParams.month}/${testParams.year}`);
    console.log(`      Company ID: ${testParams.companyId}`);
    console.log('');

    console.log('   🚀 Attempting payslip generation...');
    const result = await generatePayslip(testParams);

    if (result.success) {
      console.log('   ✅ Payslip generation SUCCESSFUL!');
      console.log(`      File: ${result.fileName}`);
      console.log(`      Path: ${result.filePath}`);
    } else {
      console.log('   ❌ Payslip generation FAILED!');
      console.log(`      Error: ${result.error}`);
      return false;
    }

  } catch (error) {
    console.log('   ❌ CRITICAL ERROR during payslip generation:');
    console.log(`      ${error.message}`);
    console.log('');
    console.log('   📋 Full error details:');
    console.log(error);
    return false;
  }

  return true;
}

async function testComplianceModules() {
  console.log('2️⃣ Testing individual compliance modules...\n');

  const modules = [
    { name: 'Dutch Minimum Wage', path: './src/lib/dutch-minimum-wage.ts' },
    { name: 'Dutch Social Security', path: './src/lib/dutch-social-security.ts' },
    { name: 'Working Hours Calculator', path: './src/lib/working-hours-calculator.ts' },
    { name: 'Holiday Allowance Calculator', path: './src/lib/holiday-allowance-calculator.ts' }
  ];

  for (const module of modules) {
    try {
      console.log(`   📦 Testing ${module.name}...`);
      const moduleExports = require(module.path);
      console.log(`   ✅ ${module.name} imported successfully`);
      console.log(`      Exports: ${Object.keys(moduleExports).join(', ')}`);
    } catch (error) {
      console.log(`   ❌ ${module.name} FAILED to import:`);
      console.log(`      Error: ${error.message}`);
      return false;
    }
  }

  console.log('   ✅ All compliance modules imported successfully');
  return true;
}

async function testDatabaseConnections() {
  console.log('3️⃣ Testing database connections...\n');

  try {
    console.log('   📦 Testing database clients...');
    const { hrClient, payrollClient } = require('./src/lib/database-clients.ts');
    console.log('   ✅ Database clients imported successfully');

    console.log('   🔍 Testing HR database connection...');
    const employeeCount = await hrClient.employee.count();
    console.log(`   ✅ HR database connected (${employeeCount} employees)`);

    console.log('   🔍 Testing Payroll database connection...');
    const payrollCount = await payrollClient.payrollRecord.count();
    console.log(`   ✅ Payroll database connected (${payrollCount} records)`);

    return true;
  } catch (error) {
    console.log('   ❌ Database connection FAILED:');
    console.log(`      Error: ${error.message}`);
    return false;
  }
}

async function runDiagnostics() {
  console.log('🚀 Starting Payslip Generation Diagnostics\n');
  console.log('=' .repeat(60));
  console.log('');

  // Test database connections first
  const dbResult = await testDatabaseConnections();
  if (!dbResult) {
    console.log('❌ Database connection issues detected - stopping diagnostics');
    return;
  }

  console.log('');
  console.log('=' .repeat(60));
  console.log('');

  // Test compliance modules
  const moduleResult = await testComplianceModules();
  if (!moduleResult) {
    console.log('❌ Compliance module issues detected - stopping diagnostics');
    return;
  }

  console.log('');
  console.log('=' .repeat(60));
  console.log('');

  // Test payslip generation
  const payslipResult = await testPayslipGeneration();
  
  console.log('');
  console.log('=' .repeat(60));
  console.log('');

  if (payslipResult) {
    console.log('🎉 DIAGNOSTICS COMPLETE - NO ISSUES FOUND!');
    console.log('');
    console.log('✅ Database connections working');
    console.log('✅ Compliance modules loading');
    console.log('✅ Payslip generation working');
    console.log('');
    console.log('🤔 If you\'re still experiencing issues, they may be:');
    console.log('   - Environment-specific (production vs development)');
    console.log('   - Build/compilation related');
    console.log('   - Specific to certain employees or periods');
  } else {
    console.log('❌ DIAGNOSTICS FOUND ISSUES!');
    console.log('');
    console.log('🔧 Issues need to be resolved before payslip generation will work');
  }
}

// Run diagnostics
runDiagnostics().catch(error => {
  console.error('💥 Diagnostic execution failed:', error);
  process.exit(1);
});

