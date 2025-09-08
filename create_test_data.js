require('dotenv').config({ path: '.env.local' });
const { PrismaClient: AuthClient } = require('@prisma/client');
const { PrismaClient: PayrollClient } = require('@prisma/payroll-client');
const { PrismaClient: HRClient } = require('@prisma/hr-client');

async function createTestData() {
  const authClient = new AuthClient();
  const payrollClient = new PayrollClient();
  const hrClient = new HRClient();

  try {
    console.log('=== Finding test user and company ===');
    
    // Find the test user
    const testUser = await authClient.user.findFirst({
      where: { email: 'test@example.com' }
    });
    
    if (!testUser) {
      console.log('No test user found');
      return;
    }
    
    console.log('Found test user:', testUser.id, testUser.companyId);
    
    if (!testUser.companyId) {
      console.log('Test user has no company assigned');
      return;
    }

    // Get company details from auth database
    const company = await authClient.company.findUnique({
      where: { id: testUser.companyId }
    });
    
    if (!company) {
      console.log('Company not found in auth database');
      return;
    }
    
    console.log('Found company:', company.name);
    
    // Check if company exists in HR database, create if not
    let hrCompany = await hrClient.company.findUnique({
      where: { id: testUser.companyId }
    });
    
    if (!hrCompany) {
      console.log('=== Creating company in HR database ===');
      hrCompany = await hrClient.company.create({
        data: {
          id: company.id,
          name: company.name,
          address: company.address,
          city: company.city,
          postalCode: company.postalCode,
          country: company.country || 'Netherlands',
          phone: company.phone,
          email: company.email
        }
      });
      console.log('Created company in HR database:', hrCompany.name);
    }

    // Check if employees already exist
    const existingEmployees = await hrClient.employee.findMany({
      where: { companyId: testUser.companyId }
    });
    
    console.log('Existing employees:', existingEmployees.length);
    
    if (existingEmployees.length === 0) {
      console.log('=== Creating test employees ===');
      
      const employees = [
        {
          employeeNumber: 'EMP001',
          firstName: 'Jan',
          lastName: 'de Vries',
          email: 'jan.devries@company.com',
          bsn: '123456789',
          dateOfBirth: new Date('1990-05-15'),
          startDate: new Date('2023-01-01'),
          department: 'Engineering',
          position: 'Senior Developer',
          employmentType: 'monthly',
          contractType: 'permanent',
          salary: 75000,
          salaryType: 'monthly',
          isActive: true,
          companyId: testUser.companyId
        },
        {
          employeeNumber: 'EMP002',
          firstName: 'Emma',
          lastName: 'van Berg',
          email: 'emma.vanberg@company.com',
          bsn: '987654321',
          dateOfBirth: new Date('1988-08-22'),
          startDate: new Date('2023-02-01'),
          department: 'Sales',
          position: 'Sales Manager',
          employmentType: 'monthly',
          contractType: 'permanent',
          salary: 65000,
          salaryType: 'monthly',
          isActive: true,
          companyId: testUser.companyId
        },
        {
          employeeNumber: 'EMP003',
          firstName: 'Pieter',
          lastName: 'Janssen',
          email: 'pieter.janssen@company.com',
          bsn: '456789123',
          dateOfBirth: new Date('1992-12-10'),
          startDate: new Date('2023-03-01'),
          department: 'Marketing',
          position: 'Marketing Specialist',
          employmentType: 'monthly',
          contractType: 'permanent',
          salary: 55000,
          salaryType: 'monthly',
          isActive: true,
          companyId: testUser.companyId
        }
      ];
      
      for (const empData of employees) {
        const employee = await hrClient.employee.create({
          data: empData
        });
        console.log('Created employee:', employee.firstName, employee.lastName);
      }
    }
    
    // Get all employees for this company
    const allEmployees = await hrClient.employee.findMany({
      where: { companyId: testUser.companyId }
    });
    
    console.log('Total employees for company:', allEmployees.length);
    
    // Check if payroll records exist
    const existingPayroll = await payrollClient.payrollRecord.findMany({
      where: { companyId: testUser.companyId }
    });
    
    console.log('Existing payroll records:', existingPayroll.length);
    
    if (existingPayroll.length === 0) {
      console.log('=== Creating test payroll records ===');
      
      // Create payroll records for the last 4 months
      const months = [
        { month: 8, year: 2024 }, // August
        { month: 9, year: 2024 }, // September
        { month: 10, year: 2024 }, // October
        { month: 11, year: 2024 }  // November
      ];
      
      for (const { month, year } of months) {
        for (const employee of allEmployees) {
          const grossSalary = employee.salary / 12; // Monthly salary
          const taxDeduction = grossSalary * 0.37; // Approximate Dutch tax rate
          const socialSecurity = grossSalary * 0.28; // Social security contributions
          const netSalary = grossSalary - taxDeduction - socialSecurity;
          
          const payrollRecord = await payrollClient.payrollRecord.create({
            data: {
              employeeId: employee.id,
              employeeNumber: employee.employeeNumber,
              firstName: employee.firstName,
              lastName: employee.lastName,
              companyId: testUser.companyId,
              period: `${year}-${month.toString().padStart(2, '0')}`,
              year: year,
              month: month,
              grossSalary: Math.round(grossSalary),
              taxDeduction: Math.round(taxDeduction),
              socialSecurity: Math.round(socialSecurity),
              netSalary: Math.round(netSalary),
              createdAt: new Date(year, month - 1, 15), // 15th of each month
              updatedAt: new Date(year, month - 1, 15)
            }
          });
          
          console.log(`Created payroll record for ${employee.firstName} ${employee.lastName} - ${year}-${month}`);
        }
      }
    }
    
    console.log('=== Test data creation complete ===');
    
    // Verify final counts
    const finalEmployeeCount = await hrClient.employee.count({
      where: { companyId: testUser.companyId, isActive: true }
    });
    
    const finalPayrollCount = await payrollClient.payrollRecord.count({
      where: { companyId: testUser.companyId }
    });
    
    console.log('Final employee count:', finalEmployeeCount);
    console.log('Final payroll record count:', finalPayrollCount);
    
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await authClient.$disconnect();
    await payrollClient.$disconnect();
    await hrClient.$disconnect();
  }
}

createTestData();

