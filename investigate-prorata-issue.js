require('dotenv').config({ path: '.env.local' });
const { PrismaClient: PayrollClient } = require('@prisma/payroll-client');
const { PrismaClient: HRClient } = require('@prisma/hr-client');

const payrollClient = new PayrollClient({
  datasources: {
    db: {
      url: process.env.PAYROLL_DATABASE_URL
    }
  }
});

const hrClient = new HRClient({
  datasources: {
    db: {
      url: process.env.HR_DATABASE_URL
    }
  }
});

async function investigateProRataIssue() {
  try {
    console.log('🔍 INVESTIGATING PRO-RATA SALARY CALCULATION ISSUE');
    console.log('='.repeat(60));

    // Get employee information
    const employee = await hrClient.employee.findFirst({
      where: {
        id: 'cme7fsv070009k40and8jh2l4',
        isActive: true
      }
    });

    if (!employee) {
      console.log('❌ Employee not found');
      return;
    }

    console.log(`👤 Employee: ${employee.firstName} ${employee.lastName}`);
    console.log(`📧 Employee ID: ${employee.id}`);
    console.log(`🔢 Employee Number: ${employee.employeeNumber}`);
    console.log(`💰 Monthly Salary: €${employee.monthlySalary}`);
    console.log(`📅 Start Date: ${employee.startDate}`);
    console.log('');

    // Analyze the start date
    const startDate = new Date(employee.startDate);
    const startDay = startDate.getDate();
    const startMonth = startDate.getMonth() + 1; // JavaScript months are 0-indexed
    const startYear = startDate.getFullYear();

    console.log('📊 START DATE ANALYSIS:');
    console.log(`   Start Date: ${startDate.toLocaleDateString('nl-NL')}`);
    console.log(`   Start Day: ${startDay}`);
    console.log(`   Start Month: ${startMonth} (${startDate.toLocaleDateString('nl-NL', { month: 'long' })})`);
    console.log(`   Start Year: ${startYear}`);
    console.log('');

    // Calculate expected pro-rata for August 2025
    if (startMonth === 8 && startYear === 2025) {
      const daysInAugust = 31;
      const workingDaysInAugust = daysInAugust - startDay + 1; // From start day to end of month
      const dailyRate = employee.monthlySalary / daysInAugust;
      const expectedProRataSalary = dailyRate * workingDaysInAugust;

      console.log('💡 EXPECTED PRO-RATA CALCULATION FOR AUGUST 2025:');
      console.log(`   Days in August: ${daysInAugust}`);
      console.log(`   Working days (${startDay}-31): ${workingDaysInAugust} days`);
      console.log(`   Daily rate: €${employee.monthlySalary} ÷ ${daysInAugust} = €${dailyRate.toFixed(2)}`);
      console.log(`   Expected pro-rata salary: €${dailyRate.toFixed(2)} × ${workingDaysInAugust} = €${expectedProRataSalary.toFixed(2)}`);
      console.log('');
    }

    // Get actual payroll records
    const payrollRecords = await payrollClient.payrollRecord.findMany({
      where: {
        employeeId: employee.id,
        year: 2025,
        month: 8
      }
    });

    if (payrollRecords.length === 0) {
      console.log('⚠️ No payroll records found for August 2025');
      
      // Try alternative lookup strategies
      const altRecords = await payrollClient.payrollRecord.findMany({
        where: {
          employeeId: employee.employeeNumber,
          year: 2025,
          month: 8
        }
      });

      if (altRecords.length > 0) {
        payrollRecords.push(...altRecords);
        console.log(`✅ Found ${altRecords.length} records using employeeNumber lookup`);
      }
    }

    if (payrollRecords.length > 0) {
      console.log('📋 ACTUAL PAYROLL RECORDS FOR AUGUST 2025:');
      payrollRecords.forEach((record, index) => {
        console.log(`   Record ${index + 1}:`);
        console.log(`     Employee ID: ${record.employeeId}`);
        console.log(`     Gross Salary: €${record.grossSalary}`);
        console.log(`     Net Salary: €${record.netSalary}`);
        console.log(`     Period: ${record.month}/${record.year}`);
        console.log(`     Created: ${record.createdAt}`);
        console.log('');
      });

      // Compare actual vs expected
      const actualSalary = payrollRecords[0].grossSalary;
      const startDate = new Date(employee.startDate);
      const startDay = startDate.getDate();
      const daysInAugust = 31;
      const workingDaysInAugust = daysInAugust - startDay + 1;
      const dailyRate = employee.monthlySalary / daysInAugust;
      const expectedProRataSalary = dailyRate * workingDaysInAugust;

      console.log('⚖️ COMPARISON - ACTUAL vs EXPECTED:');
      console.log(`   Actual Salary: €${actualSalary}`);
      console.log(`   Expected Pro-rata: €${expectedProRataSalary.toFixed(2)}`);
      console.log(`   Difference: €${(actualSalary - expectedProRataSalary).toFixed(2)}`);
      console.log(`   Overpayment: €${(actualSalary - expectedProRataSalary).toFixed(2)}`);
      console.log('');

      if (actualSalary > expectedProRataSalary) {
        console.log('❌ ISSUE CONFIRMED: Employee is being overpaid!');
        console.log(`   The system is paying full monthly salary instead of pro-rata`);
        console.log(`   This violates payroll accuracy and legal compliance`);
      } else {
        console.log('✅ Pro-rata calculation appears correct');
      }
    }

    console.log('');
    console.log('🔧 INVESTIGATION SUMMARY:');
    console.log('1. Employee started mid-month (August 11, 2025)');
    console.log('2. Should receive pro-rata salary for partial month');
    console.log('3. Current system appears to pay full monthly salary');
    console.log('4. Need to implement pro-rata calculation logic');
    console.log('');
    console.log('📝 NEXT STEPS:');
    console.log('- Examine payroll processing API code');
    console.log('- Identify where salary calculations are performed');
    console.log('- Implement pro-rata calculation based on start/end dates');
    console.log('- Update cumulative calculations to reflect correct amounts');

  } catch (error) {
    console.error('💥 Investigation failed:', error);
  } finally {
    await payrollClient.$disconnect();
    await hrClient.$disconnect();
  }
}

investigateProRataIssue();

