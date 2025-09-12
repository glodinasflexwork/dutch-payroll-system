const { getAuthClient, getHRClient, getPayrollClient } = require('./src/lib/database-clients');

async function cleanDatabases() {
  console.log('🧹 Cleaning all databases...');
  
  try {
    // Auth DB
    const authClient = await getAuthClient();
    await authClient.session.deleteMany({});
    await authClient.account.deleteMany({});
    await authClient.userCompany.deleteMany({});
    await authClient.user.deleteMany({});
    await authClient.subscription.deleteMany({});
    await authClient.company.deleteMany({});
    console.log('✅ Auth database cleaned');
    
    // HR DB
    const hrClient = await getHRClient();
    await hrClient.employee.deleteMany({});
    await hrClient.leaveType.deleteMany({});
    await hrClient.company.deleteMany({});
    console.log('✅ HR database cleaned');
    
    // Payroll DB
    const payrollClient = await getPayrollClient();
    await payrollClient.payrollRecord.deleteMany({});
    await payrollClient.payslip.deleteMany({});
    await payrollClient.company.deleteMany({});
    console.log('✅ Payroll database cleaned');
    
    console.log('🎉 All databases cleaned successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

cleanDatabases().then(() => process.exit(0));
