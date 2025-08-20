require('dotenv').config({ path: '.env.local' });

const { PrismaClient: PayrollPrismaClient } = require('@prisma/payroll-client');
const fs = require('fs').promises;
const path = require('path');

async function cleanupDuplicatePayslipGenerations() {
  const payrollClient = new PayrollPrismaClient({
    datasources: {
      db: {
        url: process.env.PAYROLL_DATABASE_URL
      }
    }
  });

  try {
    console.log('🧹 Cleaning up duplicate PayslipGeneration records...\n');

    // 1. Find all PayslipGeneration records grouped by payrollRecordId
    console.log('🔍 Step 1: Finding duplicate PayslipGeneration records');
    
    const allPayslipGenerations = await payrollClient.payslipGeneration.findMany({
      orderBy: [
        { payrollRecordId: 'asc' },
        { createdAt: 'asc' }
      ],
      include: {
        PayrollRecord: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            year: true,
            month: true
          }
        }
      }
    });

    console.log(`📊 Total PayslipGeneration records found: ${allPayslipGenerations.length}`);

    // Group by payrollRecordId to find duplicates
    const groupedByPayrollRecord = {};
    allPayslipGenerations.forEach(pg => {
      if (!groupedByPayrollRecord[pg.payrollRecordId]) {
        groupedByPayrollRecord[pg.payrollRecordId] = [];
      }
      groupedByPayrollRecord[pg.payrollRecordId].push(pg);
    });

    // Find payrollRecordIds with multiple PayslipGeneration records
    const duplicateGroups = Object.entries(groupedByPayrollRecord)
      .filter(([payrollRecordId, records]) => records.length > 1);

    console.log(`🔍 Found ${duplicateGroups.length} PayrollRecords with duplicate PayslipGeneration records`);

    if (duplicateGroups.length === 0) {
      console.log('✅ No duplicate PayslipGeneration records found. Database is clean!');
      return;
    }

    // 2. Analyze duplicates and prepare cleanup plan
    console.log('\n📋 Step 2: Analyzing duplicates and preparing cleanup plan');
    
    let totalDuplicates = 0;
    const cleanupPlan = [];

    duplicateGroups.forEach(([payrollRecordId, records]) => {
      const payrollRecord = records[0].PayrollRecord;
      console.log(`\n🔍 PayrollRecord: ${payrollRecordId}`);
      console.log(`   Employee: ${payrollRecord?.firstName} ${payrollRecord?.lastName} (${payrollRecord?.employeeNumber})`);
      console.log(`   Period: ${payrollRecord?.year}-${payrollRecord?.month}`);
      console.log(`   Duplicate PayslipGeneration records: ${records.length}`);

      // Sort by createdAt to keep the oldest (most likely the original)
      const sortedRecords = records.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const keepRecord = sortedRecords[0]; // Keep the first (oldest) record
      const deleteRecords = sortedRecords.slice(1); // Delete the rest

      console.log(`   ✅ Keeping: ${keepRecord.id} (Created: ${keepRecord.createdAt})`);
      deleteRecords.forEach(record => {
        console.log(`   ❌ Deleting: ${record.id} (Created: ${record.createdAt})`);
        totalDuplicates++;
      });

      cleanupPlan.push({
        payrollRecordId,
        payrollRecord,
        keepRecord,
        deleteRecords
      });
    });

    console.log(`\n📊 Cleanup Summary:`);
    console.log(`   - PayrollRecords with duplicates: ${duplicateGroups.length}`);
    console.log(`   - Total duplicate records to delete: ${totalDuplicates}`);
    console.log(`   - Records to keep: ${duplicateGroups.length}`);

    // 3. Execute cleanup
    console.log('\n🧹 Step 3: Executing cleanup...');
    
    let deletedCount = 0;
    let filesDeletedCount = 0;

    for (const plan of cleanupPlan) {
      console.log(`\n🔄 Processing PayrollRecord: ${plan.payrollRecordId}`);
      
      for (const deleteRecord of plan.deleteRecords) {
        try {
          // Delete the database record
          await payrollClient.payslipGeneration.delete({
            where: { id: deleteRecord.id }
          });
          
          console.log(`   ✅ Deleted PayslipGeneration record: ${deleteRecord.id}`);
          deletedCount++;

          // Try to delete the associated file if it exists
          if (deleteRecord.filePath) {
            try {
              const fullPath = path.join('/tmp', deleteRecord.filePath);
              await fs.unlink(fullPath);
              console.log(`   🗑️ Deleted file: ${deleteRecord.filePath}`);
              filesDeletedCount++;
            } catch (fileError) {
              console.log(`   ⚠️ File not found or already deleted: ${deleteRecord.filePath}`);
            }
          }

        } catch (error) {
          console.error(`   ❌ Error deleting record ${deleteRecord.id}:`, error.message);
        }
      }
    }

    // 4. Verify cleanup
    console.log('\n🔍 Step 4: Verifying cleanup...');
    
    const remainingDuplicates = await payrollClient.$queryRaw`
      SELECT "payrollRecordId", COUNT(*) as count
      FROM "PayslipGeneration"
      GROUP BY "payrollRecordId"
      HAVING COUNT(*) > 1
    `;

    console.log(`\n📊 Final Results:`);
    console.log(`   ✅ PayslipGeneration records deleted: ${deletedCount}`);
    console.log(`   🗑️ Files deleted: ${filesDeletedCount}`);
    console.log(`   🔍 Remaining duplicates: ${remainingDuplicates.length}`);

    if (remainingDuplicates.length === 0) {
      console.log(`\n🎉 SUCCESS: All duplicate PayslipGeneration records have been cleaned up!`);
      console.log(`✅ Database is now ready for the unique constraint migration.`);
    } else {
      console.log(`\n⚠️ WARNING: ${remainingDuplicates.length} PayrollRecords still have duplicate PayslipGeneration records.`);
      console.log(`Please investigate these manually before proceeding with the migration.`);
    }

    // 5. Generate cleanup report
    const reportPath = '/tmp/payslip-cleanup-report.json';
    const report = {
      timestamp: new Date().toISOString(),
      totalRecordsAnalyzed: allPayslipGenerations.length,
      duplicateGroupsFound: duplicateGroups.length,
      recordsDeleted: deletedCount,
      filesDeleted: filesDeletedCount,
      remainingDuplicates: remainingDuplicates.length,
      cleanupPlan: cleanupPlan.map(plan => ({
        payrollRecordId: plan.payrollRecordId,
        employee: `${plan.payrollRecord?.firstName} ${plan.payrollRecord?.lastName}`,
        period: `${plan.payrollRecord?.year}-${plan.payrollRecord?.month}`,
        kept: plan.keepRecord.id,
        deleted: plan.deleteRecords.map(r => r.id)
      }))
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Cleanup report saved to: ${reportPath}`);

  } catch (error) {
    console.error('💥 Error during cleanup:', error);
    throw error;
  } finally {
    await payrollClient.$disconnect();
  }
}

// Run the cleanup
cleanupDuplicatePayslipGenerations()
  .then(() => {
    console.log('\n✅ Cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Cleanup failed:', error);
    process.exit(1);
  });

