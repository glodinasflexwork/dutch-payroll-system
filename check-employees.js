const { PrismaClient } = require('@prisma/hr-client');

const hrClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.HR_DATABASE_URL
    }
  }
});

async function checkEmployees() {
  try {
    const employees = await hrClient.employee.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        companyId: true
      }
    });
    
    console.log('=== CURRENT EMPLOYEES IN DATABASE ===');
    console.log('Total employees:', employees.length);
    employees.forEach(emp => {
      console.log(`ID: ${emp.id}`);
      console.log(`Name: ${emp.firstName} ${emp.lastName}`);
      console.log(`Email: ${emp.email}`);
      console.log(`Company ID: ${emp.companyId}`);
      console.log('---');
    });
    
    await hrClient.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkEmployees();

