require('dotenv').config({ path: '.env.local' });

const { PrismaClient: PayrollPrismaClient } = require('@prisma/payroll-client');

async function debugDownloadQuery() {
  const payrollClient = new PayrollPrismaClient({
    datasources: {
      db: {
        url: process.env.PAYROLL_DATABASE_URL
      }
    }
  });

  try {
    console.log('🔍 Testing Download API Query Logic...\n');

    const companyId = 'cme7fn8kf0000k40ag368f3a1'; // Glodinas Finance B.V.
    const employeeId = 'cme7fsv070009k40and8jh2l4'; // Cihat Kaya
    const testCases = [
      { year: 2026, month: 8, period: '2026-08' },
      { year: 2025, month: 8, period: '2025-08' },
      { year: 2025, month: 7, period: '2025-07' }
    ];

    console.log('🎯 Test Parameters:');
    console.log(`Company ID: ${companyId}`);
    console.log(`Employee ID: ${employeeId}`);
    console.log(`Test Cases: ${testCases.map(tc => tc.period).join(', ')}\n`);

    for (const testCase of testCases) {
      console.log(`\n📋 Testing Period: ${testCase.period}`);
      console.log(`Query Parameters: year=${testCase.year}, month=${testCase.month}`);

      // Test the exact query used by the download API
      console.log('\n🔍 DOWNLOAD API QUERY:');
      const downloadApiQuery = await payrollClient.payslipGeneration.findFirst({
        where: {
          employeeId: employeeId,
          companyId: companyId,
          PayrollRecord: {
            year: testCase.year,
            month: testCase.month
          }
        },
        include: {
          PayrollRecord: true
        }
      });

      if (downloadApiQuery) {
        console.log('✅ FOUND by Download API Query:');
        console.log(`   - PayslipGeneration ID: ${downloadApiQuery.id}`);
        console.log(`   - File Name: ${downloadApiQuery.fileName}`);
        console.log(`   - Status: ${downloadApiQuery.status}`);
        console.log(`   - PayrollRecord: ${downloadApiQuery.PayrollRecord?.year}-${downloadApiQuery.PayrollRecord?.month}`);
      } else {
        console.log('❌ NOT FOUND by Download API Query');
      }

      // Test alternative queries to understand the data structure
      console.log('\n🔍 ALTERNATIVE QUERIES:');

      // Query 1: Find all PayslipGeneration records for this employee
      const allPayslips = await payrollClient.payslipGeneration.findMany({
        where: {
          employeeId: employeeId,
          companyId: companyId
        },
        include: {
          PayrollRecord: true
        }
      });

      console.log(`📊 Total PayslipGeneration records for employee: ${allPayslips.length}`);
      
      // Query 2: Find PayrollRecord for this period
      const payrollRecord = await payrollClient.payrollRecord.findFirst({
        where: {
          employeeId: employeeId,
          companyId: companyId,
          year: testCase.year,
          month: testCase.month
        }
      });

      if (payrollRecord) {
        console.log('✅ FOUND PayrollRecord:');
        console.log(`   - PayrollRecord ID: ${payrollRecord.id}`);
        console.log(`   - Employee: ${payrollRecord.firstName} ${payrollRecord.lastName}`);
        console.log(`   - Period: ${payrollRecord.year}-${payrollRecord.month}`);
        console.log(`   - Status: ${payrollRecord.status}`);

        // Query 3: Find PayslipGeneration by PayrollRecord ID
        const payslipByRecordId = await payrollClient.payslipGeneration.findMany({
          where: {
            payrollRecordId: payrollRecord.id,
            companyId: companyId
          }
        });

        console.log(`📄 PayslipGeneration records linked to this PayrollRecord: ${payslipByRecordId.length}`);
        payslipByRecordId.forEach((ps, index) => {
          console.log(`   ${index + 1}. ID: ${ps.id}, File: ${ps.fileName}, Status: ${ps.status}`);
        });

      } else {
        console.log('❌ NO PayrollRecord found for this period');
      }

      // Query 4: Check for employeeNumber vs employeeId mismatch
      const payrollRecordByNumber = await payrollClient.payrollRecord.findFirst({
        where: {
          employeeNumber: 'EMP0001',
          companyId: companyId,
          year: testCase.year,
          month: testCase.month
        }
      });

      if (payrollRecordByNumber && payrollRecordByNumber.employeeId !== employeeId) {
        console.log('⚠️ EMPLOYEE ID MISMATCH DETECTED:');
        console.log(`   PayrollRecord.employeeId: ${payrollRecordByNumber.employeeId}`);
        console.log(`   Query employeeId: ${employeeId}`);
      }

      console.log('\n' + '='.repeat(80));
    }

    // Summary analysis
    console.log('\n📊 SUMMARY ANALYSIS:');
    
    const allPayslipGenerations = await payrollClient.payslipGeneration.findMany({
      where: { companyId },
      include: { PayrollRecord: true }
    });

    const allPayrollRecords = await payrollClient.payrollRecord.findMany({
      where: { companyId }
    });

    console.log(`Total PayslipGeneration records: ${allPayslipGenerations.length}`);
    console.log(`Total PayrollRecord records: ${allPayrollRecords.length}`);

    // Check for orphaned records
    const payrollRecordIds = new Set(allPayrollRecords.map(pr => pr.id));
    const orphanedPayslips = allPayslipGenerations.filter(pg => !payrollRecordIds.has(pg.payrollRecordId));
    
    if (orphanedPayslips.length > 0) {
      console.log(`⚠️ Orphaned PayslipGeneration records (no matching PayrollRecord): ${orphanedPayslips.length}`);
    }

    // Check for missing payslips
    const payslipRecordIds = new Set(allPayslipGenerations.map(pg => pg.payrollRecordId));
    const missingPayslips = allPayrollRecords.filter(pr => !payslipRecordIds.has(pr.id));
    
    if (missingPayslips.length > 0) {
      console.log(`❌ PayrollRecords without PayslipGeneration: ${missingPayslips.length}`);
      missingPayslips.forEach((pr, index) => {
        console.log(`   ${index + 1}. ${pr.firstName} ${pr.lastName} - ${pr.year}-${pr.month} (ID: ${pr.id})`);
      });
    }

  } catch (error) {
    console.error('💥 Error during query debugging:', error);
  } finally {
    await payrollClient.$disconnect();
  }
}

debugDownloadQuery().catch(console.error);

