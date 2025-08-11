const { PrismaClient: HRClient } = require('@prisma/hr-client');

async function debugEmployeeProfile() {
  const hrClient = new HRClient();

  try {
    console.log('🔍 DEBUGGING EMPLOYEE PROFILE...\n');

    // Test fetching a specific employee
    const employeeId = 'cmdsv2bl80001js0bs5ztv4p8'; // adjay ramlal
    
    console.log(`📋 Fetching employee: ${employeeId}`);
    
    const employee = await hrClient.employee.findUnique({
      where: { id: employeeId },
      include: {
        Company: true,
        contracts: true
      }
    });

    if (!employee) {
      console.log('❌ Employee not found');
      return;
    }

    console.log('✅ Employee found:');
    console.log(`   Name: ${employee.firstName} ${employee.lastName}`);
    console.log(`   Email: ${employee.email}`);
    console.log(`   Position: ${employee.position}`);
    console.log(`   Company: ${employee.Company?.name || 'N/A'}`);
    console.log(`   Contracts: ${employee.contracts?.length || 0}`);

    // Check for missing fields that might cause client-side errors
    console.log('\n🔍 CHECKING FOR POTENTIAL CLIENT-SIDE ISSUES:');
    
    const potentialIssues = [];
    
    // Check for undefined/null values that might cause errors
    if (!employee.firstName) potentialIssues.push('Missing firstName');
    if (!employee.lastName) potentialIssues.push('Missing lastName');
    if (!employee.email) potentialIssues.push('Missing email');
    if (!employee.position) potentialIssues.push('Missing position');
    if (!employee.Company) potentialIssues.push('Missing company relationship');
    
    // Check for fields that the enhanced UI expects
    if (!employee.phone) potentialIssues.push('Missing phone (UI expects this)');
    if (!employee.streetName && !employee.city) potentialIssues.push('Missing address (UI expects this)');
    if (!employee.bsn) potentialIssues.push('Missing BSN (UI expects this)');
    if (!employee.bankAccount) potentialIssues.push('Missing bankAccount (UI expects this)');
    if (!employee.salary && !employee.hourlyRate) potentialIssues.push('Missing salary/hourlyRate (UI expects this)');
    
    // Check contract-related fields
    if (!employee.contracts || employee.contracts.length === 0) {
      potentialIssues.push('Missing contracts (UI expects contract data)');
    }

    // Check for fields that might be undefined and cause JavaScript errors
    if (employee.emergencyContact === null) potentialIssues.push('emergencyContact is null (should be string or undefined)');
    if (employee.emergencyPhone === null) potentialIssues.push('emergencyPhone is null (should be string or undefined)');

    if (potentialIssues.length > 0) {
      console.log('⚠️  POTENTIAL ISSUES FOUND:');
      potentialIssues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log('✅ No obvious data issues found');
    }

    // Show the actual data structure (limited to avoid too much output)
    console.log('\n📊 EMPLOYEE DATA SUMMARY:');
    console.log({
      id: employee.id,
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      salary: employee.salary,
      hourlyRate: employee.hourlyRate,
      salaryType: employee.salaryType,
      bsn: employee.bsn ? '***REDACTED***' : null,
      bankAccount: employee.bankAccount ? '***REDACTED***' : null,
      emergencyContact: employee.emergencyContact,
      emergencyPhone: employee.emergencyPhone,
      company: employee.Company?.name,
      contractsCount: employee.contracts?.length || 0
    });

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await hrClient.$disconnect();
  }
}

debugEmployeeProfile();

