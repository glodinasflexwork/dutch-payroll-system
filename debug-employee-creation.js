require('dotenv').config();

async function debugEmployeeNumbers() {
  // Import Prisma client
  const { PrismaClient: HRClient } = require('@prisma/hr-client');
  const { PrismaClient: AuthClient } = require('@prisma/client');
  
  const hrClient = new HRClient({
    datasources: { db: { url: process.env.HR_DATABASE_URL } }
  });
  
  const authClient = new AuthClient({
    datasources: { db: { url: process.env.AUTH_DATABASE_URL } }
  });

  try {
    // Get all companies
    const companies = await authClient.company.findMany({
      select: { id: true, name: true }
    });
    
    console.log('=== COMPANIES ===');
    companies.forEach(company => {
      console.log(`- ${company.id}: ${company.name}`);
    });
    
    // For each company, check employee numbers
    for (const company of companies) {
      console.log(`\n=== EMPLOYEES FOR ${company.name} (${company.id}) ===`);
      
      const employees = await hrClient.employee.findMany({
        where: { companyId: company.id },
        select: { 
          employeeNumber: true, 
          firstName: true, 
          lastName: true,
          companyId: true 
        },
        orderBy: { employeeNumber: 'desc' },
        take: 5
      });
      
      if (employees.length === 0) {
        console.log('No employees found');
      } else {
        employees.forEach(emp => {
          console.log(`- ${emp.employeeNumber}: ${emp.firstName} ${emp.lastName} (Company: ${emp.companyId})`);
        });
        
        // Test the generation logic
        const lastEmployee = employees[0];
        if (lastEmployee) {
          const match = lastEmployee.employeeNumber.match(/EMP0*(\d+)/);
          if (match) {
            const nextNumber = parseInt(match[1]) + 1;
            const nextEmployeeNumber = `EMP${String(nextNumber).padStart(4, '0')}`;
            console.log(`Next employee number would be: ${nextEmployeeNumber}`);
            
            // Check if it exists
            const existing = await hrClient.employee.findFirst({
              where: { 
                employeeNumber: nextEmployeeNumber,
                companyId: company.id 
              }
            });
            
            console.log(`Does ${nextEmployeeNumber} exist for company ${company.id}? ${existing ? 'YES' : 'NO'}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await hrClient.$disconnect();
    await authClient.$disconnect();
  }
}

debugEmployeeNumbers();

