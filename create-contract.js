// Script to create a contract for the newly created employee
// This fixes the contract creation issue

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/hr-client');

const hrClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.HR_DATABASE_URL,
    },
  },
});

async function createContract() {
  try {
    console.log('Finding employee John Smith...');
    
    // Find the employee by email
    const employee = await hrClient.employee.findFirst({
      where: { 
        email: 'blip-freer-6i@icloud.com',
        firstName: 'John',
        lastName: 'Smith'
      }
    });
    
    if (!employee) {
      throw new Error('Employee John Smith not found');
    }
    
    console.log('Found employee:', employee.id);
    
    // Create a contract for the employee with working days information
    const contract = await hrClient.contract.create({
      data: {
        employeeId: employee.id,
        companyId: employee.companyId,
        contractType: 'employment',
        title: 'Employment Contract',
        description: 'Standard employment contract with Dutch compliance',
        fileName: 'employment_contract.pdf',
        filePath: '/contracts/employment_contract.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        status: 'pending',
        isActive: true,
        // Working schedule fields
        workingHoursPerWeek: 40,
        workingDaysPerWeek: 5,
        workSchedule: 'Monday-Friday',
      }
    });
    
    console.log('Contract created successfully:', contract);
    
    return { employee, contract };
  } catch (error) {
    console.error('Error creating contract:', error);
    throw error;
  } finally {
    await hrClient.$disconnect();
  }
}

createContract()
  .then(result => {
    console.log('Operation completed successfully');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error('Operation failed:', error);
    process.exit(1);
  });

