const { PrismaClient } = require('@prisma/client');

// Test script to verify payroll processing fix
async function testPayrollProcessingFix() {
  console.log("🧪 TESTING PAYROLL PROCESSING FIX");
  console.log("=".repeat(50));

  try {
    // Test 1: Check if management route file exists and has correct imports
    const fs = require('fs');
    const path = require('path');
    
    const managementRoutePath = path.join(__dirname, 'src/app/api/payroll/management/route.ts');
    
    if (!fs.existsSync(managementRoutePath)) {
      console.log("❌ Management route file not found");
      return;
    }
    
    const routeContent = fs.readFileSync(managementRoutePath, 'utf8');
    
    // Test 2: Check for correct imports
    console.log("\n📋 CHECKING IMPORTS:");
    const hasHrClientImport = routeContent.includes('hrClient');
    const hasPayrollClientImport = routeContent.includes('payrollClient');
    
    console.log(`✅ hrClient import: ${hasHrClientImport ? 'FOUND' : 'MISSING'}`);
    console.log(`✅ payrollClient import: ${hasPayrollClientImport ? 'FOUND' : 'MISSING'}`);
    
    // Test 3: Check for correct database client usage
    console.log("\n🔍 CHECKING DATABASE CLIENT USAGE:");
    
    // Count occurrences of correct usage
    const hrClientEmployeeUsage = (routeContent.match(/hrClient\.employee/g) || []).length;
    const hrClientCompanyUsage = (routeContent.match(/hrClient\.company/g) || []).length;
    const payrollClientEmployeeUsage = (routeContent.match(/payrollClient\.employee/g) || []).length;
    
    console.log(`✅ hrClient.employee usage: ${hrClientEmployeeUsage} times`);
    console.log(`✅ hrClient.company usage: ${hrClientCompanyUsage} times`);
    console.log(`❌ payrollClient.employee usage: ${payrollClientEmployeeUsage} times (should be 0)`);
    
    // Test 4: Check for specific problematic patterns
    console.log("\n🚨 CHECKING FOR PROBLEMATIC PATTERNS:");
    
    const hasUndefinedClientUsage = routeContent.includes('payrollClient.employee.findMany');
    console.log(`❌ Problematic payrollClient.employee.findMany: ${hasUndefinedClientUsage ? 'FOUND (BAD)' : 'NOT FOUND (GOOD)'}`);
    
    // Test 5: Database connection test
    console.log("\n🔗 TESTING DATABASE CONNECTIONS:");
    
    try {
      // Test HR database connection
      const hrClient = new PrismaClient({
        datasources: {
          db: {
            url: process.env.HR_DATABASE_URL
          }
        }
      });
      
      await hrClient.$connect();
      console.log("✅ HR Database connection: SUCCESS");
      
      // Test basic query
      const employeeCount = await hrClient.employee.count();
      console.log(`✅ Employee count query: ${employeeCount} employees found`);
      
      await hrClient.$disconnect();
      
    } catch (error) {
      console.log(`❌ Database connection error: ${error.message}`);
    }
    
    // Test 6: Summary
    console.log("\n📊 SUMMARY:");
    const allTestsPassed = hasHrClientImport && hasPayrollClientImport && 
                          hrClientEmployeeUsage > 0 && !hasUndefinedClientUsage;
    
    if (allTestsPassed) {
      console.log("🎉 ALL TESTS PASSED - Payroll processing fix looks good!");
    } else {
      console.log("⚠️  SOME TESTS FAILED - Fix may need additional work");
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testPayrollProcessingFix().catch(console.error);

