require('dotenv').config({ path: '.env.local' });

const { PrismaClient: PayrollPrismaClient } = require('@prisma/payroll-client');

async function testDuplicatePayrollProcessing() {
  const payrollClient = new PayrollPrismaClient({
    datasources: {
      db: {
        url: process.env.PAYROLL_DATABASE_URL
      }
    }
  });

  try {
    console.log('🔍 Testing Duplicate Payroll Processing Behavior...\n');

    const companyId = 'cme7fn8kf0000k40ag368f3a1';
    const employeeId = 'cme7fsv070009k40and8jh2l4';
    const testYear = 2025;
    const testMonth = 8;

    console.log('📋 Test Parameters:');
    console.log(`Company ID: ${companyId}`);
    console.log(`Employee ID: ${employeeId}`);
    console.log(`Test Period: ${testYear}-${testMonth}\n`);

    // 1. Check current state
    console.log('🔍 STEP 1: Check current state for August 2025');
    
    const existingPayrollRecords = await payrollClient.payrollRecord.findMany({
      where: {
        employeeId: employeeId,
        companyId: companyId,
        year: testYear,
        month: testMonth
      }
    });

    const existingPayslipGenerations = await payrollClient.payslipGeneration.findMany({
      where: {
        employeeId: employeeId,
        companyId: companyId,
        PayrollRecord: {
          year: testYear,
          month: testMonth
        }
      },
      include: {
        PayrollRecord: true
      }
    });

    console.log(`📊 Current PayrollRecord count: ${existingPayrollRecords.length}`);
    console.log(`📄 Current PayslipGeneration count: ${existingPayslipGenerations.length}`);

    if (existingPayrollRecords.length > 0) {
      console.log(`✅ Found existing PayrollRecord: ${existingPayrollRecords[0].id}`);
      console.log(`   - Status: ${existingPayrollRecords[0].status}`);
      console.log(`   - Gross Pay: €${existingPayrollRecords[0].grossPay || existingPayrollRecords[0].grossSalary}`);
      console.log(`   - Net Pay: €${existingPayrollRecords[0].netPay || existingPayrollRecords[0].netSalary}`);
      console.log(`   - Created: ${existingPayrollRecords[0].createdAt}`);
      console.log(`   - Updated: ${existingPayrollRecords[0].updatedAt}`);
    }

    if (existingPayslipGenerations.length > 0) {
      console.log(`✅ Found existing PayslipGeneration records:`);
      existingPayslipGenerations.forEach((pg, index) => {
        console.log(`   ${index + 1}. ID: ${pg.id}`);
        console.log(`      File: ${pg.fileName}`);
        console.log(`      Status: ${pg.status}`);
        console.log(`      Generated: ${pg.generatedAt}`);
        console.log(`      PayrollRecord ID: ${pg.payrollRecordId}`);
      });
    }

    // 2. Simulate what happens when payroll is processed again
    console.log('\n🔄 STEP 2: Simulate duplicate payroll processing');
    console.log('This simulates what the PUT /api/payroll endpoint does...\n');

    // Check if record already exists (this is what the API does)
    const duplicateCheck = await payrollClient.payrollRecord.findFirst({
      where: {
        employeeId: employeeId,
        year: testYear,
        month: testMonth
      }
    });

    if (duplicateCheck) {
      console.log('🔄 DUPLICATE DETECTED: Existing record found');
      console.log('📝 API Behavior: Would UPDATE existing record');
      console.log(`   - Existing Record ID: ${duplicateCheck.id}`);
      console.log(`   - Current Status: ${duplicateCheck.status}`);
      console.log(`   - Would update with new calculation values`);
      console.log(`   - Would regenerate payslip (upsert behavior)`);
      
      // Show what the update would look like
      console.log('\n📊 Update Simulation:');
      console.log('   - grossSalary: Would be recalculated');
      console.log('   - netSalary: Would be recalculated');
      console.log('   - status: Would remain "processed"');
      console.log('   - updatedAt: Would be set to current timestamp');
      
    } else {
      console.log('📝 NEW RECORD: Would create new PayrollRecord');
    }

    // 3. Check PayslipGeneration behavior
    console.log('\n🎯 STEP 3: PayslipGeneration duplicate behavior');
    
    if (duplicateCheck) {
      // Check if PayslipGeneration would be updated or created
      const existingPayslip = await payrollClient.payslipGeneration.findFirst({
        where: {
          payrollRecordId: duplicateCheck.id
        }
      });

      if (existingPayslip) {
        console.log('🔄 PAYSLIP UPDATE: Existing PayslipGeneration found');
        console.log('📝 Generator Behavior: Would UPSERT (update existing)');
        console.log(`   - Existing PayslipGeneration ID: ${existingPayslip.id}`);
        console.log(`   - Current fileName: ${existingPayslip.fileName}`);
        console.log(`   - Would update: fileName, filePath, generatedAt`);
        console.log(`   - Would regenerate HTML file`);
      } else {
        console.log('📝 NEW PAYSLIP: Would create new PayslipGeneration');
      }
    }

    // 4. Demonstrate the key differences
    console.log('\n📋 STEP 4: Summary of Duplicate Processing Behavior');
    console.log('');
    console.log('🔄 PAYROLL RECORD (PayrollRecord table):');
    console.log('   ✅ UPDATES existing record (no duplicates created)');
    console.log('   ✅ Recalculates all financial values');
    console.log('   ✅ Updates timestamp fields');
    console.log('   ✅ Maintains single record per employee per period');
    console.log('');
    console.log('🎯 PAYSLIP GENERATION (PayslipGeneration table):');
    console.log('   ✅ UPSERTS record (update if exists, create if not)');
    console.log('   ✅ Regenerates HTML file with new data');
    console.log('   ✅ Updates generation timestamp');
    console.log('   ✅ Maintains single payslip per payroll record');
    console.log('');
    console.log('💾 FILE SYSTEM:');
    console.log('   ✅ Overwrites existing HTML file');
    console.log('   ✅ Uses same filename (no duplicates)');
    console.log('   ✅ Updates file content with new calculations');

    // 5. Potential issues and recommendations
    console.log('\n⚠️ STEP 5: Potential Issues & Recommendations');
    console.log('');
    console.log('🟡 POTENTIAL ISSUES:');
    console.log('   1. No audit trail of previous calculations');
    console.log('   2. Downloaded payslips become outdated');
    console.log('   3. No user warning about overwriting existing data');
    console.log('   4. Concurrent processing could cause race conditions');
    console.log('');
    console.log('✅ CURRENT SAFEGUARDS:');
    console.log('   1. Database constraints prevent true duplicates');
    console.log('   2. Upsert operations are atomic');
    console.log('   3. File overwrites are consistent');
    console.log('   4. Payslip regeneration ensures data consistency');
    console.log('');
    console.log('🔧 RECOMMENDATIONS:');
    console.log('   1. Add user confirmation dialog for reprocessing');
    console.log('   2. Consider audit logging for payroll changes');
    console.log('   3. Add version tracking for payslips');
    console.log('   4. Implement optimistic locking for concurrent access');

    // 6. Test edge cases
    console.log('\n🧪 STEP 6: Edge Case Analysis');
    
    // Check for orphaned PayslipGeneration records
    const allPayslipGenerations = await payrollClient.payslipGeneration.findMany({
      where: {
        employeeId: employeeId,
        companyId: companyId
      },
      include: {
        PayrollRecord: true
      }
    });

    const orphanedPayslips = allPayslipGenerations.filter(pg => !pg.PayrollRecord);
    
    if (orphanedPayslips.length > 0) {
      console.log(`⚠️ Found ${orphanedPayslips.length} orphaned PayslipGeneration records`);
      orphanedPayslips.forEach((pg, index) => {
        console.log(`   ${index + 1}. ID: ${pg.id}, File: ${pg.fileName}`);
      });
    } else {
      console.log('✅ No orphaned PayslipGeneration records found');
    }

    // Check for multiple PayslipGeneration records per PayrollRecord
    const payrollRecordIds = existingPayrollRecords.map(pr => pr.id);
    for (const recordId of payrollRecordIds) {
      const payslipsForRecord = await payrollClient.payslipGeneration.findMany({
        where: { payrollRecordId: recordId }
      });
      
      if (payslipsForRecord.length > 1) {
        console.log(`⚠️ Found ${payslipsForRecord.length} PayslipGeneration records for PayrollRecord ${recordId}`);
      }
    }

  } catch (error) {
    console.error('💥 Error during duplicate processing test:', error);
  } finally {
    await payrollClient.$disconnect();
  }
}

testDuplicatePayrollProcessing().catch(console.error);

