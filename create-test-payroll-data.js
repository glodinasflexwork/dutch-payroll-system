// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const { PrismaClient: HRClient } = require('@prisma/hr-client');
const { PrismaClient: PayrollClient } = require('@prisma/payroll-client');

async function createTestPayrollData() {
  console.log('🧪 CREATING TEST PAYROLL DATA...\n');

  const hrClient = new HRClient();
  const payrollClient = new PayrollClient();

  try {
    // Step 1: Get an employee from HR database
    console.log('📊 STEP 1: Finding employee in HR database...');
    
    const employees = await hrClient.employee.findMany({
      take: 1,
      include: { Company: true }
    });

    if (employees.length === 0) {
      console.log('❌ No employees found in HR database');
      return;
    }

    const employee = employees[0];
    console.log(`✅ Found employee: ${employee.name || 'Unknown'} (${employee.personnelNumber || 'No ID'})`);
    console.log(`   Company: ${employee.Company.name}`);
    console.log(`   Employee ID: ${employee.id}`);
    console.log(`   Company ID: ${employee.companyId}`);

    // Step 2: Create test payroll records
    console.log('\n📊 STEP 2: Creating test payroll records...');
    
    const testPeriods = [
      { year: 2025, month: 1, grossPay: 3500, netPay: 2551.22 },
      { year: 2025, month: 2, grossPay: 3500, netPay: 2551.22 },
      { year: 2025, month: 8, grossPay: 3500, netPay: 2551.22 }
    ];

    for (const period of testPeriods) {
      try {
        // Check if record already exists
        const existingRecord = await payrollClient.payrollRecord.findFirst({
          where: {
            employeeId: employee.id,
            year: period.year,
            month: period.month
          }
        });

        if (existingRecord) {
          console.log(`✅ PayrollRecord already exists for ${period.year}-${String(period.month).padStart(2, '0')}`);
          continue;
        }

        const payrollRecord = await payrollClient.payrollRecord.create({
          data: {
            employeeId: employee.id,
            companyId: employee.companyId,
            employeeNumber: employee.personnelNumber || 'EMP001',
            firstName: employee.firstName || 'Test',
            lastName: employee.lastName || 'Employee',
            period: `${period.year}-${String(period.month).padStart(2, '0')}`,
            year: period.year,
            month: period.month,
            grossSalary: period.grossPay,
            netSalary: period.netPay,
            taxDeduction: 918.33,
            socialSecurity: 626.50,
            pensionDeduction: 197.75,
            otherDeductions: 337.75,
            holidayAllowance: 291.55,
            overtime: 0,
            bonus: 0,
            status: 'processed',
            paymentDate: new Date(`${period.year}-${String(period.month).padStart(2, '0')}-20`)
          }
        });

        console.log(`✅ Created PayrollRecord for ${period.year}-${String(period.month).padStart(2, '0')}: €${period.grossPay} → €${period.netPay}`);

        // Step 3: Create corresponding PayslipGeneration record (this is our fix!)
        const payslipGeneration = await payrollClient.payslipGeneration.create({
          data: {
            payrollRecordId: payrollRecord.id,
            employeeId: employee.id,
            companyId: employee.companyId,
            fileName: `payslip-${employee.personnelNumber || 'EMP001'}-${period.year}-${String(period.month).padStart(2, '0')}.html`,
            status: 'pending'
          }
        });

        console.log(`✅ Created PayslipGeneration: ${payslipGeneration.fileName}`);

      } catch (error) {
        console.log(`❌ Failed to create records for ${period.year}-${String(period.month).padStart(2, '0')}: ${error.message}`);
      }
    }

    // Step 4: Verify the data
    console.log('\n📊 STEP 4: Verifying created data...');
    
    const payrollCount = await payrollClient.payrollRecord.count({
      where: { employeeId: employee.id }
    });

    const payslipCount = await payrollClient.payslipGeneration.count({
      where: { employeeId: employee.id }
    });

    console.log(`✅ Final verification:`);
    console.log(`   PayrollRecords: ${payrollCount}`);
    console.log(`   PayslipGenerations: ${payslipCount}`);

    if (payrollCount === payslipCount && payrollCount > 0) {
      console.log('\n🎉 SUCCESS: Test data created successfully!');
      console.log('   Every PayrollRecord has a corresponding PayslipGeneration');
      console.log('   Ready to test payslip download functionality');
      
      console.log('\n📋 NEXT STEPS:');
      console.log('1. Navigate to the payroll system in browser');
      console.log('2. Login with valid credentials');
      console.log('3. Go to Payroll → Payroll Records');
      console.log('4. Try downloading payslips for the created periods');
      console.log('5. Verify that downloads work without errors');
    } else {
      console.log('\n⚠️  WARNING: Data creation incomplete');
      console.log('   Some records may be missing');
    }

  } catch (error) {
    console.error('❌ Test data creation failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await hrClient.$disconnect();
    await payrollClient.$disconnect();
  }
}

createTestPayrollData();

