const { PrismaClient } = require('@prisma/client');

async function checkNovemberPayroll() {
  // Use the payroll schema
  const payrollClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.PAYROLL_DATABASE_URL
      }
    }
  });

  try {
    await payrollClient.$connect();
    console.log('✅ Connected to payroll database');

    // Check all payroll records
    const payrollRecords = await payrollClient.payrollRecord.findMany({
      orderBy: {
        payPeriodStart: 'desc'
      }
    });

    console.log(`\n📊 Found ${payrollRecords.length} total payroll records:`);
    
    payrollRecords.forEach((record, index) => {
      const payPeriodStart = new Date(record.payPeriodStart);
      const payPeriodEnd = new Date(record.payPeriodEnd);
      const month = payPeriodStart.getMonth() + 1; // JavaScript months are 0-based
      const year = payPeriodStart.getFullYear();
      
      console.log(`${index + 1}. Record ID: ${record.id}`);
      console.log(`   Employee ID: ${record.employeeId}`);
      console.log(`   Pay Period: ${payPeriodStart.toISOString().split('T')[0]} to ${payPeriodEnd.toISOString().split('T')[0]}`);
      console.log(`   Month/Year: ${year}-${month.toString().padStart(2, '0')} (${getMonthName(month)} ${year})`);
      console.log(`   Gross Pay: €${record.grossPay}`);
      console.log(`   Net Pay: €${record.netPay}`);
      console.log(`   Processed: ${record.processedAt ? record.processedAt.toISOString().split('T')[0] : 'Not processed'}`);
      console.log('');
    });

    // Check for November 2025 specifically
    const novemberRecords = payrollRecords.filter(record => {
      const payPeriodStart = new Date(record.payPeriodStart);
      return payPeriodStart.getMonth() === 10 && payPeriodStart.getFullYear() === 2025; // November is month 10 in JS (0-based)
    });

    console.log(`\n🔍 November 2025 Analysis:`);
    if (novemberRecords.length > 0) {
      console.log(`✅ Found ${novemberRecords.length} November 2025 record(s):`);
      novemberRecords.forEach(record => {
        console.log(`   - Record ID: ${record.id}`);
        console.log(`   - Employee: ${record.employeeId}`);
        console.log(`   - Period: ${record.payPeriodStart} to ${record.payPeriodEnd}`);
        console.log(`   - Processed: ${record.processedAt ? record.processedAt.toISOString() : 'Not processed'}`);
      });
    } else {
      console.log('❌ No November 2025 records found');
      console.log('   This explains why 2025-11 is not showing in the payroll records table');
    }

  } catch (error) {
    console.error('❌ Error checking payroll records:', error.message);
    console.error('Full error:', error);
  } finally {
    await payrollClient.$disconnect();
  }
}

function getMonthName(month) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1];
}

checkNovemberPayroll();
