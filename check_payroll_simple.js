const { getPayrollClient } = require('./src/lib/database-clients');

async function checkPayrollRecords() {
  try {
    const payrollClient = getPayrollClient();
    console.log('✅ Connected to payroll database');

    // Get all payroll records
    const records = await payrollClient.payrollRecord.findMany({
      orderBy: { payPeriodStart: 'desc' }
    });

    console.log(`\n📊 Found ${records.length} payroll records:`);
    
    records.forEach((record, index) => {
      const start = new Date(record.payPeriodStart);
      const end = new Date(record.payPeriodEnd);
      const month = start.getMonth() + 1;
      const year = start.getFullYear();
      
      console.log(`${index + 1}. ${year}-${month.toString().padStart(2, '0')} (${getMonthName(month)})`);
      console.log(`   Employee: ${record.employeeId}`);
      console.log(`   Period: ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`);
      console.log(`   Gross: €${record.grossPay}, Net: €${record.netPay}`);
      console.log(`   Processed: ${record.processedAt ? record.processedAt.toISOString().split('T')[0] : 'Not processed'}`);
      console.log('');
    });

    // Check specifically for November 2025
    const novemberRecords = records.filter(record => {
      const start = new Date(record.payPeriodStart);
      return start.getMonth() === 10 && start.getFullYear() === 2025; // November = month 10 (0-based)
    });

    console.log(`🔍 November 2025 check: ${novemberRecords.length > 0 ? '✅ FOUND' : '❌ NOT FOUND'}`);
    if (novemberRecords.length === 0) {
      console.log('   This confirms November payroll was not saved to database');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function getMonthName(month) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1];
}

checkPayrollRecords();
