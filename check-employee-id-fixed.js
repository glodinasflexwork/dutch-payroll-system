// Script to check for valid employee IDs in the database
const { PrismaClient: HRPrismaClient } = require('@prisma/client/hr');
const { PrismaClient: AuthPrismaClient } = require('@prisma/client/auth');
const { PrismaClient: PayrollPrismaClient } = require('@prisma/client/payroll');

// Create Prisma clients for each database
const hrClient = new HRPrismaClient({
  datasourceUrl: process.env.HR_DATABASE_URL,
});

const authClient = new AuthPrismaClient({
  datasourceUrl: process.env.AUTH_DATABASE_URL,
});

const payrollClient = new PayrollPrismaClient({
  datasourceUrl: process.env.PAYROLL_DATABASE_URL,
});

async function findValidEmployeeId() {
  try {
    console.log('Checking for valid employee IDs in the database...');
    
    // Get all employees
    const employees = await hrClient.employee.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        companyId: true,
      },
    });
    
    console.log(`Found ${employees.length} employees in the database.`);
    
    if (employees.length > 0) {
      console.log('Valid employee IDs:');
      employees.forEach(emp => {
        console.log(`- ID: ${emp.id}, Name: ${emp.firstName} ${emp.lastName}, Email: ${emp.email}, CompanyId: ${emp.companyId}`);
      });
      
      return employees[0].id; // Return the first employee ID
    } else {
      console.log('No employees found in the database.');
      return null;
    }
  } catch (error) {
    console.error('Error finding valid employee ID:', error);
    return null;
  } finally {
    await hrClient.$disconnect();
    await authClient.$disconnect();
    await payrollClient.$disconnect();
  }
}

// Execute the function
findValidEmployeeId()
  .then(validId => {
    if (validId) {
      console.log(`\nUse this valid employee ID for testing: ${validId}`);
      console.log(`Edit URL: http://localhost:3000/dashboard/employees/${validId}/edit`);
    } else {
      console.log('\nNo valid employee ID found. You may need to create an employee first.');
    }
  })
  .catch(console.error);

