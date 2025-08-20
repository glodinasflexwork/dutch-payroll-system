require('dotenv').config({ path: '.env.local' });

const { PrismaClient: PayrollPrismaClient } = require('@prisma/payroll-client');

async function testSpecificQuery() {
  const payrollClient = new PayrollPrismaClient({
    datasources: {
      db: {
        url: process.env.PAYROLL_DATABASE_URL
      }
    }
  });

  try {
    console.log('🔍 Testing Specific Download API Query for 2026-08...\n');

    const companyId = 'cme7fn8kf0000k40ag368f3a1';
    const year = 2026;
    const month = 8;

    // Test with employee ID (what should work)
    console.log('📋 Test 1: Using Employee ID');
    const employeeId = 'cme7fsv070009k40and8jh2l4';
    
    const queryWithEmployeeId = await payrollClient.payslipGeneration.findFirst({
      where: {
        employeeId: employeeId,
        companyId: companyId,
        PayrollRecord: {
          year: year,
          month: month
        }
      },
      include: {
        PayrollRecord: true
      }
    });

    if (queryWithEmployeeId) {
      console.log('✅ FOUND with Employee ID:');
      console.log(`   - PayslipGeneration ID: ${queryWithEmployeeId.id}`);
      console.log(`   - File Name: ${queryWithEmployeeId.fileName}`);
      console.log(`   - Employee ID: ${queryWithEmployeeId.employeeId}`);
      console.log(`   - PayrollRecord: ${queryWithEmployeeId.PayrollRecord?.year}-${queryWithEmployeeId.PayrollRecord?.month}`);
    } else {
      console.log('❌ NOT FOUND with Employee ID');
    }

    // Test with employee number (what might be happening)
    console.log('\n📋 Test 2: Using Employee Number as employeeId');
    const employeeNumber = 'EMP0001';
    
    const queryWithEmployeeNumber = await payrollClient.payslipGeneration.findFirst({
      where: {
        employeeId: employeeNumber, // This would be wrong but let's test
        companyId: companyId,
        PayrollRecord: {
          year: year,
          month: month
        }
      },
      include: {
        PayrollRecord: true
      }
    });

    if (queryWithEmployeeNumber) {
      console.log('✅ FOUND with Employee Number as employeeId');
    } else {
      console.log('❌ NOT FOUND with Employee Number as employeeId');
    }

    // Check what the frontend is actually sending
    console.log('\n📋 Test 3: Check all PayslipGeneration records for 2026-08');
    const allForPeriod = await payrollClient.payslipGeneration.findMany({
      where: {
        companyId: companyId,
        PayrollRecord: {
          year: year,
          month: month
        }
      },
      include: {
        PayrollRecord: true
      }
    });

    console.log(`Found ${allForPeriod.length} PayslipGeneration records for 2026-08:`);
    allForPeriod.forEach((record, index) => {
      console.log(`   ${index + 1}. ID: ${record.id}`);
      console.log(`      Employee ID: ${record.employeeId}`);
      console.log(`      File Name: ${record.fileName}`);
      console.log(`      PayrollRecord ID: ${record.payrollRecordId}`);
    });

    // Check the PayrollRecord for this period
    console.log('\n📋 Test 4: Check PayrollRecord for 2026-08');
    const payrollRecord = await payrollClient.payrollRecord.findFirst({
      where: {
        companyId: companyId,
        year: year,
        month: month
      }
    });

    if (payrollRecord) {
      console.log('✅ PayrollRecord found:');
      console.log(`   - ID: ${payrollRecord.id}`);
      console.log(`   - Employee ID: ${payrollRecord.employeeId}`);
      console.log(`   - Employee Number: ${payrollRecord.employeeNumber}`);
      console.log(`   - Name: ${payrollRecord.firstName} ${payrollRecord.lastName}`);
    }

    // Test the exact query that should be working
    console.log('\n📋 Test 5: Direct PayslipGeneration lookup by PayrollRecord ID');
    if (payrollRecord) {
      const directLookup = await payrollClient.payslipGeneration.findFirst({
        where: {
          payrollRecordId: payrollRecord.id,
          companyId: companyId
        }
      });

      if (directLookup) {
        console.log('✅ FOUND by PayrollRecord ID:');
        console.log(`   - PayslipGeneration ID: ${directLookup.id}`);
        console.log(`   - Employee ID: ${directLookup.employeeId}`);
        console.log(`   - File Name: ${directLookup.fileName}`);
      } else {
        console.log('❌ NOT FOUND by PayrollRecord ID');
      }
    }

  } catch (error) {
    console.error('💥 Error during specific query test:', error);
  } finally {
    await payrollClient.$disconnect();
  }
}

testSpecificQuery().catch(console.error);

