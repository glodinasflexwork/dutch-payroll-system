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
    
    for (const month of months) {
      console.log(`📊 TESTING MONTH ${month}/2025:`);
      console.log('-'.repeat(30));

      try {
        // Import the cumulative calculation function
        const { calculateCumulativeData } = require('./src/lib/cumulative-calculations.ts');
        
        // Calculate cumulative data
        const cumulativeData = await calculateCumulativeData(
          employee.id,
          employee.companyId,
          2025,
          month
        );

        console.log(`✅ Cumulative calculations for ${month}/2025:`);
        console.log(`   YTD Work Days: ${cumulativeData.workDays}`);
        console.log(`   YTD Work Hours: ${cumulativeData.workHours}`);
        console.log(`   YTD Gross Salary: €${cumulativeData.grossSalary.toFixed(2)}`);
        console.log(`   YTD Net Salary: €${cumulativeData.netSalary.toFixed(2)}`);
        console.log(`   YTD Tax Deduction: €${cumulativeData.taxDeduction.toFixed(2)}`);
        console.log(`   YTD Social Security: €${cumulativeData.socialSecurity.toFixed(2)}`);
        console.log(`   YTD Holiday Allowance: €${cumulativeData.vacationAllowance.toFixed(2)}`);
        console.log(`   YTD Taxable Income: €${cumulativeData.taxableIncome.toFixed(2)}`);
        console.log('');

        // Validate that cumulative values increase month over month
        if (month > 8) {
          const expectedMinimum = (month - 7) * 3500; // Should be at least month count * monthly salary
          if (cumulativeData.grossSalary >= expectedMinimum) {
            console.log(`✅ Cumulative validation PASSED: €${cumulativeData.grossSalary.toFixed(2)} >= €${expectedMinimum.toFixed(2)}`);
          } else {
            console.log(`❌ Cumulative validation FAILED: €${cumulativeData.grossSalary.toFixed(2)} < €${expectedMinimum.toFixed(2)}`);
          }
        }

      } catch (error) {
        console.log(`❌ Error calculating cumulative data for month ${month}:`, error.message);
      }

      console.log('');
    }

    // Test payslip generation with new cumulative calculations
    console.log('🎯 TESTING PAYSLIP GENERATION WITH CUMULATIVE FIX:');
    console.log('-'.repeat(50));

    try {
      // Import the payslip generator
      const { generatePayslip } = require('./src/lib/payslip-generator.ts');
      
      // Generate payslip for October to test the latest cumulative data
      console.log('📄 Generating payslip for October 2025...');
      
      const payslipResult = await generatePayslip({
        employeeId: employee.id,
        year: 2025,
        month: 10,
        companyId: employee.companyId
      });

      if (payslipResult.success) {
        console.log('✅ Payslip generated successfully with cumulative calculations!');
        console.log(`📁 File: ${payslipResult.fileName}`);
        console.log(`📂 Path: ${payslipResult.filePath}`);
      } else {
        console.log('❌ Payslip generation failed:', payslipResult.error);
      }

    } catch (error) {
      console.log('❌ Error testing payslip generation:', error.message);
    }

    console.log('');
    console.log('🎉 CUMULATIVE CALCULATION TEST COMPLETED!');
    console.log('');
    console.log('💡 EXPECTED BEHAVIOR:');
    console.log('- August 2025: YTD = €3,500 (1 month)');
    console.log('- September 2025: YTD = €7,000 (2 months)');
    console.log('- October 2025: YTD = €10,500 (3 months)');
    console.log('');
    console.log('If the cumulative values increase month over month,');
    console.log('the fix is working correctly! 🎯');

  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await payrollClient.$disconnect();
    await hrClient.$disconnect();
  }
}

testCumulativeFix();

