// Script to directly create an employee with portal invitation
// This bypasses the form validation issues in the UI

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/hr-client');

const hrClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.HR_DATABASE_URL,
    },
  },
});

async function createEmployee() {
  try {
    console.log('Creating employee...');
    
    // Get company ID for Tech Solutions B.V.
    const company = await hrClient.company.findFirst({
      where: { name: 'Tech Solutions B.V.' }
    });
    
    if (!company) {
      throw new Error('Company "Tech Solutions B.V." not found');
    }
    
    console.log('Found company:', company.id);
    
    // Generate unique employee number
    const lastEmployee = await hrClient.employee.findFirst({
      where: { companyId: company.id },
      orderBy: { employeeNumber: 'desc' }
    });
    
    let nextNumber = 1;
    if (lastEmployee && lastEmployee.employeeNumber) {
      const match = lastEmployee.employeeNumber.match(/EMP(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }
    
    const employeeNumber = `EMP${String(nextNumber).padStart(4, '0')}`;
    console.log('Generated employee number:', employeeNumber);
    
    // Create the employee
    const employee = await hrClient.employee.create({
      data: {
        // Basic identification
        employeeNumber,
        firstName: 'John',
        lastName: 'Smith',
        email: 'blip-freer-6i@icloud.com',
        
        // Personal information
        phone: '+31 6 12345678',
        city: 'Amsterdam',
        postalCode: '1234 AB',
        country: 'Netherlands',
        bsn: '123456782',
        nationality: 'Dutch',
        dateOfBirth: new Date('1990-01-01'),
        
        // Employment information
        startDate: new Date(),
        position: 'Software Developer',
        department: 'Engineering',
        
        // Contract information
        employmentType: 'monthly',
        contractType: 'permanent',
        workingHours: 40,
        
        // Salary information
        salary: 4500,
        salaryType: 'monthly',
        
        // Dutch payroll compliance fields
        taxTable: 'wit',
        taxCredit: 0,
        isDGA: false,
        
        // Employment status
        isActive: true,
        
        // System fields
        companyId: company.id,
        createdBy: 'user_admin',
        portalAccessStatus: "INVITED", // Set to INVITED to indicate portal invitation
        invitedAt: new Date(),
      }
    });
    
    console.log('Employee created successfully:', employee);
    
    // Create a contract for the employee with working days information
    const contract = await hrClient.contract.create({
      data: {
        employeeId: employee.id,
        companyId: company.id,
        startDate: new Date(),
        contractType: 'permanent',
        title: 'Employment Contract',
        fileName: 'employment_contract.pdf',
        filePath: '/contracts/employment_contract.pdf',
        workingHoursPerWeek: 40,
        workingDaysPerWeek: 5,
        workSchedule: 'Monday-Friday',
        isActive: true,
        createdBy: 'user_admin',
      }
    });
    
    console.log('Contract created successfully:', contract);
    
    return { employee, contract };
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  } finally {
    await hrClient.$disconnect();
  }
}

createEmployee()
  .then(result => {
    console.log('Operation completed successfully');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error('Operation failed:', error);
    process.exit(1);
  });

