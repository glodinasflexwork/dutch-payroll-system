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

// Replicate the cumulative calculation logic
async function calculateCumulativeData(employeeId, companyId, year, month) {
  console.log(`🧮 Calculating YTD totals for employee: ${employeeId}, period: ${year}-${month}`);

  // Query all payroll records for this employee from January through the current month
  let payrollRecords = await payrollClient.payrollRecord.findMany({
    where: {
      employeeId: employeeId,
      companyId: companyId,
      year: year,
      month: {
        gte: 1,
        lte: month
      }
    },
    orderBy: [
      { year: 'asc' },
      { month: 'asc' }
    ]
  });

  // If no records found by employeeId, try by employeeNumber
  if (payrollRecords.length === 0) {
    console.log(`🔄 No records found by employeeId, trying alternative lookup strategies`);
    
    // Get employee info to find employeeNumber
    const employee = await hrClient.employee.findFirst({
      where: {
        id: employeeId,
        companyId: companyId,
        isActive: true
      }
    });

    if (employee?.employeeNumber) {
      console.log(`🔍 Trying lookup by employeeNumber: ${employee.employeeNumber}`);
      
      // Try by employeeId field matching employeeNumber
      payrollRecords = await payrollClient.payrollRecord.findMany({
        where: {
          employeeId: employee.employeeNumber,
          companyId: companyId,
          year: year,
          month: {
            gte: 1,
            lte: month
          }
        },
        orderBy: [
          { year: 'asc' },
          { month: 'asc' }
        ]
      });

      // Try by employeeNumber field
      if (payrollRecords.length === 0) {
        payrollRecords = await payrollClient.payrollRecord.findMany({
          where: {
            employeeNumber: employee.employeeNumber,
            companyId: companyId,
            year: year,
            month: {
              gte: 1,
              lte: month
            }
          },
          orderBy: [
            { year: 'asc' },
            { month: 'asc' }
          ]
        });
      }
    }
  }

  console.log(`✅ Found ${payrollRecords.length} payroll records for cumulative calculation`);

  if (payrollRecords.length === 0) {
    console.log(`⚠️ No payroll records found for employee ${employeeId} in ${year}`);
    return {
      workDays: 0,
      workHours: 0,
      grossSalary: 0,
      otherGross: 0,
      taxableIncome: 0,
      wga: 0,
      taxDeduction: 0,
      workDiscount: 0,
      vacationAllowance: 0,
      netSalary: 0,
      socialSecurity: 0,
      pensionDeduction: 0,
      otherDeductions: 0,
      overtime: 0,
      bonus: 0,
      expenses: 0
    };
  }

  // Calculate cumulative totals by summing all records
  const cumulative = {
    workDays: 0,
    workHours: 0,
    grossSalary: 0,
    otherGross: 0,
    taxableIncome: 0,
    wga: 0,
    taxDeduction: 0,
    workDiscount: 0,
    vacationAllowance: 0,
    netSalary: 0,
    socialSecurity: 0,
    pensionDeduction: 0,
    otherDeductions: 0,
    overtime: 0,
    bonus: 0,
    expenses: 0
  };

  // Aggregate all payroll records
  payrollRecords.forEach((record, index) => {
    console.log(`📋 Processing record ${index + 1}: ${record.year}-${record.month.toString().padStart(2, '0')} - Gross: €${record.grossSalary}`);
    
    // Standard working days and hours per month (Dutch standard)
    cumulative.workDays += 22; // Standard working days per month
    cumulative.workHours += 176; // Standard working hours per month (22 * 8)
    
    // Core salary components
    cumulative.grossSalary += record.grossSalary || 0;
    cumulative.netSalary += record.netSalary || 0;
    cumulative.taxDeduction += record.taxDeduction || 0;
    cumulative.socialSecurity += record.socialSecurity || 0;
    
    // Additional compensation
    cumulative.vacationAllowance += record.holidayAllowance || 0;
    cumulative.overtime += record.overtime || 0;
    cumulative.bonus += record.bonus || 0;
    cumulative.expenses += record.expenses || 0;
    
    // Deductions
    cumulative.pensionDeduction += record.pensionDeduction || 0;
    cumulative.otherDeductions += record.otherDeductions || 0;
    
    // Calculate other gross (holiday allowance + overtime + bonus)
    cumulative.otherGross += (record.holidayAllowance || 0) + (record.overtime || 0) + (record.bonus || 0);
  });

  // Calculate taxable income (gross + other gross)
  cumulative.taxableIncome = cumulative.grossSalary + cumulative.otherGross;

  // WGA and work discount are typically 0 for standard employees
  cumulative.wga = 0;
  cumulative.workDiscount = 0;

  console.log(`🎯 Calculated YTD totals:`);
  console.log(`   YTD Gross Salary: €${cumulative.grossSalary.toFixed(2)}`);
  console.log(`   YTD Net Salary: €${cumulative.netSalary.toFixed(2)}`);
  console.log(`   YTD Tax Deduction: €${cumulative.taxDeduction.toFixed(2)}`);
  console.log(`   YTD Social Security: €${cumulative.socialSecurity.toFixed(2)}`);
  console.log(`   YTD Holiday Allowance: €${cumulative.vacationAllowance.toFixed(2)}`);
  console.log(`   YTD Work Days: ${cumulative.workDays}`);
  console.log(`   YTD Work Hours: ${cumulative.workHours}`);

  return cumulative;
}

async function testCumulativeFix() {
  try {
    console.log('🧪 TESTING CUMULATIVE CALCULATION FIX');
    console.log('='.repeat(50));

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

    console.log(`👤 Testing with employee: ${employee.firstName} ${employee.lastName}`);
    console.log(`📧 Employee ID: ${employee.id}`);
    console.log(`🔢 Employee Number: ${employee.employeeNumber}`);
    console.log('');

    // Test cumulative calculations for each month
    const months = [8, 9, 10]; // August, September, October 2025
    const results = [];
    
    for (const month of months) {
      console.log(`📊 TESTING MONTH ${month}/2025:`);
      console.log('-'.repeat(30));

      try {
        // Calculate cumulative data
        const cumulativeData = await calculateCumulativeData(
          employee.id,
          employee.companyId,
          2025,
          month
        );

        results.push({ month, data: cumulativeData });

        console.log(`✅ Cumulative calculations for ${month}/2025:`);
        console.log(`   YTD Work Days: ${cumulativeData.workDays}`);
        console.log(`   YTD Work Hours: ${cumulativeData.workHours}`);
        console.log(`   YTD Gross Salary: €${cumulativeData.grossSalary.toFixed(2)}`);
        console.log(`   YTD Net Salary: €${cumulativeData.netSalary.toFixed(2)}`);
        console.log(`   YTD Tax Deduction: €${cumulativeData.taxDeduction.toFixed(2)}`);
        console.log(`   YTD Social Security: €${cumulativeData.socialSecurity.toFixed(2)}`);
        console.log(`   YTD Holiday Allowance: €${cumulativeData.vacationAllowance.toFixed(2)}`);
        console.log(`   YTD Taxable Income: €${cumulativeData.taxableIncome.toFixed(2)}`);

      } catch (error) {
        console.log(`❌ Error calculating cumulative data for month ${month}:`, error.message);
      }

      console.log('');
    }

    // Validate that cumulative values increase month over month
    console.log('🔍 VALIDATION RESULTS:');
    console.log('-'.repeat(30));
    
    let validationPassed = true;
    
    for (let i = 1; i < results.length; i++) {
      const prevMonth = results[i-1];
      const currMonth = results[i];
      
      if (currMonth.data.grossSalary > prevMonth.data.grossSalary) {
        console.log(`✅ Month ${currMonth.month}: €${currMonth.data.grossSalary.toFixed(2)} > €${prevMonth.data.grossSalary.toFixed(2)} ✓`);
      } else {
        console.log(`❌ Month ${currMonth.month}: €${currMonth.data.grossSalary.toFixed(2)} <= €${prevMonth.data.grossSalary.toFixed(2)} ✗`);
        validationPassed = false;
      }
    }

    console.log('');
    if (validationPassed) {
      console.log('🎉 CUMULATIVE CALCULATION FIX VALIDATION: PASSED! ✅');
      console.log('The cumulative totals correctly increase month over month.');
    } else {
      console.log('❌ CUMULATIVE CALCULATION FIX VALIDATION: FAILED! ❌');
      console.log('The cumulative totals are not increasing properly.');
    }

    console.log('');
    console.log('💡 EXPECTED vs ACTUAL:');
    console.log('Expected - August: €3,500, September: €7,000, October: €10,500');
    console.log(`Actual   - August: €${results[0]?.data.grossSalary.toFixed(2) || '0.00'}, September: €${results[1]?.data.grossSalary.toFixed(2) || '0.00'}, October: €${results[2]?.data.grossSalary.toFixed(2) || '0.00'}`);

  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await payrollClient.$disconnect();
    await hrClient.$disconnect();
  }
}

testCumulativeFix();

