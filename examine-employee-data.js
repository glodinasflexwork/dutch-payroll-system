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

async function examineEmployeeData() {
  try {
    console.log('🔍 EXAMINING EMPLOYEE DATA STRUCTURE');
    console.log('='.repeat(50));

    // Get complete employee information
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

    console.log('👤 COMPLETE EMPLOYEE DATA:');
    console.log(JSON.stringify(employee, null, 2));
    console.log('');

    // Check if there's a salary field with a different name
    console.log('💰 SALARY INFORMATION:');
    console.log(`   monthlySalary: ${employee.monthlySalary}`);
    console.log(`   salary: ${employee.salary}`);
    console.log(`   baseSalary: ${employee.baseSalary}`);
    console.log(`   annualSalary: ${employee.annualSalary}`);
    console.log('');

    // Examine start date more carefully
    console.log('📅 START DATE ANALYSIS:');
    console.log(`   Raw startDate: ${employee.startDate}`);
    console.log(`   Date object: ${new Date(employee.startDate)}`);
    console.log(`   Local date string: ${new Date(employee.startDate).toLocaleDateString('nl-NL')}`);
    console.log(`   ISO string: ${new Date(employee.startDate).toISOString()}`);
    console.log('');

    // Get payroll records to see what salary is being used
    const payrollRecords = await payrollClient.payrollRecord.findMany({
      where: {
        employeeId: employee.id,
        year: 2025
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' }
      ]
    });

    console.log('📋 ALL PAYROLL RECORDS:');
    payrollRecords.forEach((record, index) => {
      console.log(`   Record ${index + 1}:`);
      console.log(`     Period: ${record.month}/${record.year}`);
      console.log(`     Gross Salary: €${record.grossSalary}`);
      console.log(`     Employee ID: ${record.employeeId}`);
      console.log(`     Created: ${record.createdAt}`);
      console.log('');
    });

    // Calculate what the pro-rata should be for August
    const startDate = new Date(employee.startDate);
    const startDay = startDate.getDate();
    const startMonth = startDate.getMonth() + 1;
    
    // Use the actual salary from payroll records since monthlySalary might be undefined
    const monthlySalary = payrollRecords.length > 0 ? payrollRecords[0].grossSalary : 3500;
    
    if (startMonth === 8) {
      const daysInAugust = 31;
      const workingDaysInAugust = daysInAugust - startDay + 1;
      const dailyRate = monthlySalary / daysInAugust;
      const expectedProRataSalary = dailyRate * workingDaysInAugust;

      console.log('💡 PRO-RATA CALCULATION FOR AUGUST:');
      console.log(`   Start day: ${startDay}`);
      console.log(`   Days in August: ${daysInAugust}`);
      console.log(`   Working days (${startDay}-31): ${workingDaysInAugust} days`);
      console.log(`   Monthly salary: €${monthlySalary}`);
      console.log(`   Daily rate: €${monthlySalary} ÷ ${daysInAugust} = €${dailyRate.toFixed(2)}`);
      console.log(`   Expected pro-rata: €${dailyRate.toFixed(2)} × ${workingDaysInAugust} = €${expectedProRataSalary.toFixed(2)}`);
      console.log(`   Actual paid: €${payrollRecords[0]?.grossSalary || 'N/A'}`);
      console.log(`   Overpayment: €${(payrollRecords[0]?.grossSalary - expectedProRataSalary).toFixed(2)}`);
    }

  } catch (error) {
    console.error('💥 Examination failed:', error);
  } finally {
    await payrollClient.$disconnect();
    await hrClient.$disconnect();
  }
}

examineEmployeeData();

