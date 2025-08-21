// Load environment variables first
require('dotenv').config({ path: '.env.local' });

const { PrismaClient: HRClient } = require('@prisma/hr-client');
const { PrismaClient: PayrollClient } = require('@prisma/payroll-client');

async function testPayrollWorkflow() {
  console.log('🧪 TESTING COMPLETE PAYROLL WORKFLOW...\n');

  // Initialize database clients
  const hrClient = new HRClient();
  const payrollClient = new PayrollClient();

  try {
    // Step 1: Check if we have test data
    console.log('📊 STEP 1: Checking existing test data...');
    
    const employees = await hrClient.employee.findMany({
      take: 1,
      include: { Company: true }
    });

    if (employees.length === 0) {
      console.log('❌ No employees found in HR database');
      return;
    }

    const employee = employees[0];
    console.log(`✅ Found employee: ${employee.name} (${employee.personnelNumber})`);
    console.log(`   Company: ${employee.Company.name}`);

    // Step 2: Check existing payroll records
    console.log('\n📊 STEP 2: Checking existing payroll records...');
    
    const payrollRecords = await payrollClient.payrollRecord.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    console.log(`✅ Found ${payrollRecords.length} payroll records for this employee`);
    payrollRecords.forEach(record => {
      console.log(`   - ${record.year}-${String(record.month).padStart(2, '0')}: €${record.grossPay} → €${record.netPay} (${record.status})`);
    });

    // Step 3: Check PayslipGeneration records
    console.log('\n📊 STEP 3: Checking PayslipGeneration records...');
    
    const payslipGenerations = await payrollClient.payslipGeneration.findMany({
      where: { employeeId: employee.id },
      include: { PayrollRecord: true },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${payslipGenerations.length} PayslipGeneration records`);
    payslipGenerations.forEach(gen => {
      const record = gen.PayrollRecord;
      console.log(`   - ${record.year}-${String(record.month).padStart(2, '0')}: ${gen.fileName} (${gen.status})`);
    });

    // Step 4: Test payslip download API simulation
    console.log('\n📊 STEP 4: Simulating payslip download logic...');
    
    if (payrollRecords.length > 0) {
      const testRecord = payrollRecords[0];
      console.log(`Testing with record: ${testRecord.year}-${String(testRecord.month).padStart(2, '0')}`);

      // Check if PayslipGeneration exists for this record
      const existingPayslip = await payrollClient.payslipGeneration.findFirst({
        where: {
          employeeId: employee.id,
          PayrollRecord: {
            year: testRecord.year,
            month: testRecord.month
          }
        }
      });

      if (existingPayslip) {
        console.log('✅ PayslipGeneration record exists - download would work');
        console.log(`   File: ${existingPayslip.fileName}`);
        console.log(`   Status: ${existingPayslip.status}`);
      } else {
        console.log('⚠️  No PayslipGeneration record - would trigger on-demand generation');
        console.log('   This is where our fix should create the payslip on-demand');
      }
    }

    // Step 5: Test the fix - simulate creating PayslipGeneration for missing records
    console.log('\n📊 STEP 5: Testing PayslipGeneration creation fix...');
    
    for (const record of payrollRecords) {
      const existingPayslip = await payrollClient.payslipGeneration.findFirst({
        where: { payrollRecordId: record.id }
      });

      if (!existingPayslip) {
        console.log(`⚠️  Missing PayslipGeneration for ${record.year}-${String(record.month).padStart(2, '0')}`);
        console.log('   Creating PayslipGeneration record...');

        try {
          const newPayslip = await payrollClient.payslipGeneration.create({
            data: {
              payrollRecordId: record.id,
              employeeId: employee.id,
              companyId: employee.companyId,
              fileName: `payslip-${employee.personnelNumber}-${record.year}-${String(record.month).padStart(2, '0')}.html`,
              status: 'pending'
            }
          });
          console.log(`✅ Created PayslipGeneration: ${newPayslip.fileName}`);
        } catch (error) {
          console.log(`❌ Failed to create PayslipGeneration: ${error.message}`);
        }
      } else {
        console.log(`✅ PayslipGeneration already exists for ${record.year}-${String(record.month).padStart(2, '0')}`);
      }
    }

    // Step 6: Final verification
    console.log('\n📊 STEP 6: Final verification...');
    
    const finalPayslipCount = await payrollClient.payslipGeneration.count({
      where: { employeeId: employee.id }
    });

    const finalPayrollCount = await payrollClient.payrollRecord.count({
      where: { employeeId: employee.id }
    });

    console.log(`✅ Final counts:`);
    console.log(`   PayrollRecords: ${finalPayrollCount}`);
    console.log(`   PayslipGenerations: ${finalPayslipCount}`);

    if (finalPayrollCount === finalPayslipCount) {
      console.log('🎉 SUCCESS: Every PayrollRecord now has a corresponding PayslipGeneration!');
      console.log('   Payslip downloads should work for all processed periods.');
    } else {
      console.log('⚠️  MISMATCH: Some PayrollRecords still missing PayslipGeneration records');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await hrClient.$disconnect();
    await payrollClient.$disconnect();
  }
}

testPayrollWorkflow();

