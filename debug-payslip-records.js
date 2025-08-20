require('dotenv').config({ path: '.env.local' });

const { PrismaClient: PayrollPrismaClient } = require('@prisma/payroll-client');
const { PrismaClient: HRPrismaClient } = require('@prisma/hr-client');

async function debugPayslipRecords() {
  const payrollClient = new PayrollPrismaClient({
    datasources: {
      db: {
        url: process.env.PAYROLL_DATABASE_URL
      }
    }
  });
  const hrClient = new HRPrismaClient({
    datasources: {
      db: {
        url: process.env.HR_DATABASE_URL
      }
    }
  });

  try {
    console.log('🔍 Starting PayslipGeneration records investigation...\n');

    // Get company information
    const companies = await hrClient.company.findMany({
      select: { id: true, name: true }
    });
    console.log('🏢 Companies found:', companies);

    if (companies.length === 0) {
      console.log('❌ No companies found in HR database');
      return;
    }

    // Find the Glodinas Finance B.V. company we're working with
    const targetCompany = companies.find(c => c.name === 'Glodinas Finance B.V.' && c.id === 'cme7fn8kf0000k40ag368f3a1') 
                         || companies.find(c => c.name === 'Glodinas Finance B.V.')
                         || companies[0];
    
    const companyId = targetCompany.id;
    console.log(`\n🎯 Using company: ${targetCompany.name} (${companyId})\n`);

    // Check PayrollRecord entries
    console.log('📊 PAYROLL RECORDS:');
    const payrollRecords = await payrollClient.payrollRecord.findMany({
      where: { companyId },
      select: {
        id: true,
        employeeId: true,
        employeeNumber: true,
        firstName: true,
        lastName: true,
        year: true,
        month: true,
        period: true,
        status: true
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    });

    console.log(`Found ${payrollRecords.length} payroll records:`);
    payrollRecords.forEach((record, index) => {
      console.log(`${index + 1}. ${record.firstName} ${record.lastName} (${record.employeeNumber}) - ${record.year}-${record.month.toString().padStart(2, '0')} - Status: ${record.status}`);
    });

    // Check PayslipGeneration entries
    console.log('\n📄 PAYSLIP GENERATION RECORDS:');
    const payslipGenerations = await payrollClient.payslipGeneration.findMany({
      where: { companyId },
      include: {
        PayrollRecord: {
          select: {
            year: true,
            month: true,
            employeeNumber: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log(`Found ${payslipGenerations.length} payslip generation records:`);
    if (payslipGenerations.length === 0) {
      console.log('❌ NO PAYSLIP GENERATION RECORDS FOUND!');
    } else {
      payslipGenerations.forEach((record, index) => {
        const pr = record.PayrollRecord;
        console.log(`${index + 1}. ${pr?.firstName} ${pr?.lastName} - ${pr?.year}-${pr?.month?.toString().padStart(2, '0')} - File: ${record.fileName} - Status: ${record.status}`);
      });
    }

    // Compare records
    console.log('\n🔍 COMPARISON ANALYSIS:');
    console.log(`Payroll Records: ${payrollRecords.length}`);
    console.log(`Payslip Generation Records: ${payslipGenerations.length}`);
    console.log(`Missing Payslips: ${payrollRecords.length - payslipGenerations.length}`);

    if (payrollRecords.length > payslipGenerations.length) {
      console.log('\n❌ MISSING PAYSLIP GENERATION RECORDS FOR:');
      const existingPayslipRecordIds = new Set(payslipGenerations.map(pg => pg.payrollRecordId));
      
      const missingPayslips = payrollRecords.filter(pr => !existingPayslipRecordIds.has(pr.id));
      missingPayslips.forEach((record, index) => {
        console.log(`${index + 1}. ${record.firstName} ${record.lastName} (${record.employeeNumber}) - ${record.year}-${record.month.toString().padStart(2, '0')} - Record ID: ${record.id}`);
      });
    }

    // Check employee information
    console.log('\n👥 EMPLOYEE INFORMATION:');
    const employees = await hrClient.employee.findMany({
      where: { companyId, isActive: true },
      select: {
        id: true,
        employeeNumber: true,
        firstName: true,
        lastName: true
      }
    });

    console.log(`Found ${employees.length} active employees:`);
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.firstName} ${emp.lastName} - ID: ${emp.id} - Number: ${emp.employeeNumber}`);
    });

    // Check for employee ID mismatches
    console.log('\n🔍 EMPLOYEE ID ANALYSIS:');
    const payrollEmployeeIds = [...new Set(payrollRecords.map(pr => pr.employeeId))];
    const hrEmployeeIds = employees.map(emp => emp.id);
    const hrEmployeeNumbers = employees.map(emp => emp.employeeNumber);

    console.log('Payroll Record Employee IDs:', payrollEmployeeIds);
    console.log('HR Employee IDs:', hrEmployeeIds);
    console.log('HR Employee Numbers:', hrEmployeeNumbers);

    // Check for mismatches
    const idMismatches = payrollEmployeeIds.filter(id => !hrEmployeeIds.includes(id) && !hrEmployeeNumbers.includes(id));
    if (idMismatches.length > 0) {
      console.log('⚠️ EMPLOYEE ID MISMATCHES FOUND:', idMismatches);
    } else {
      console.log('✅ No employee ID mismatches found');
    }

  } catch (error) {
    console.error('💥 Error during database investigation:', error);
  } finally {
    await payrollClient.$disconnect();
    await hrClient.$disconnect();
  }
}

debugPayslipRecords().catch(console.error);

