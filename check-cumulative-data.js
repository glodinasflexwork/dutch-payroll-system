require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/payroll-client');

const payrollClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PAYROLL_DATABASE_URL
    }
  }
});

async function checkCumulativeData() {
  try {
    console.log('🔍 Checking payroll records for cumulative analysis...\n');

    // Check all payroll records for the employee
    const records = await payrollClient.payrollRecord.findMany({
      where: { employeeId: 'cme7fsv070009k40and8jh2l4' },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        year: true,
        month: true,
        grossSalary: true,
        netSalary: true,
        taxDeduction: true,
        socialSecurity: true,
        holidayAllowance: true,
        overtime: true,
        bonus: true,
        createdAt: true
      }
    });
    
    console.log(`📊 Found ${records.length} payroll records for employee Cihat Kaya:\n`);
    
    if (records.length === 0) {
      console.log('❌ No payroll records found. Need to process payroll first.');
      return;
    }
    
    // Display each record
    records.forEach((record, index) => {
      console.log(`${index + 1}. Period: ${record.year}-${record.month.toString().padStart(2, '0')}`);
      console.log(`   Gross Salary: €${record.grossSalary?.toFixed(2) || '0.00'}`);
      console.log(`   Net Salary: €${record.netSalary?.toFixed(2) || '0.00'}`);
      console.log(`   Tax Deduction: €${record.taxDeduction?.toFixed(2) || '0.00'}`);
      console.log(`   Social Security: €${record.socialSecurity?.toFixed(2) || '0.00'}`);
      console.log(`   Holiday Allowance: €${record.holidayAllowance?.toFixed(2) || '0.00'}`);
      console.log(`   Created: ${record.createdAt.toISOString().split('T')[0]}`);
      console.log('');
    });
    
    // Calculate what cumulative should be for each month
    console.log('🧮 CUMULATIVE CALCULATIONS (Year-to-Date):');
    console.log('='.repeat(50));
    
    let cumulativeGross = 0;
    let cumulativeNet = 0;
    let cumulativeTax = 0;
    let cumulativeSocial = 0;
    let cumulativeHoliday = 0;
    
    records.forEach((record, index) => {
      cumulativeGross += record.grossSalary || 0;
      cumulativeNet += record.netSalary || 0;
      cumulativeTax += record.taxDeduction || 0;
      cumulativeSocial += record.socialSecurity || 0;
      cumulativeHoliday += record.holidayAllowance || 0;
      
      console.log(`${record.year}-${record.month.toString().padStart(2, '0')} Cumulative:`);
      console.log(`   YTD Gross: €${cumulativeGross.toFixed(2)}`);
      console.log(`   YTD Net: €${cumulativeNet.toFixed(2)}`);
      console.log(`   YTD Tax: €${cumulativeTax.toFixed(2)}`);
      console.log(`   YTD Social Security: €${cumulativeSocial.toFixed(2)}`);
      console.log(`   YTD Holiday Allowance: €${cumulativeHoliday.toFixed(2)}`);
      console.log('');
    });
    
    console.log('💡 ISSUE IDENTIFIED:');
    console.log('The payslip generator is NOT calculating these cumulative totals.');
    console.log('It uses the same values for both current month and cumulative sections.');
    console.log('This violates Dutch payroll compliance requirements.');
    
  } catch (error) {
    console.error('❌ Error checking cumulative data:', error);
  } finally {
    await payrollClient.$disconnect();
  }
}

checkCumulativeData();

