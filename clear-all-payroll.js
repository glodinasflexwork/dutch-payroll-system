const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearAllPayrollRecords() {
  try {
    console.log('🗑️ Clearing all payroll records...');
    
    // Delete all payroll records
    const deleteResult = await prisma.payrollRecord.deleteMany({});
    
    console.log(`✅ Successfully deleted ${deleteResult.count} payroll records`);
    console.log('🎯 Database is now clean and ready for fresh payroll runs');
    
  } catch (error) {
    console.error('❌ Error clearing payroll records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllPayrollRecords();

