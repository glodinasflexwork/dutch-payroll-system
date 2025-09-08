const { PrismaClient } = require('@prisma/hr-client');

async function createCihatEmployee() {
  console.log('🔧 Creating Cihat Kaya employee record for current company...');
  
  const hrClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.HR_DATABASE_URL
      }
    }
  });

  try {
    await hrClient.$connect();
    
    const currentCompanyId = 'cmf71rbk40002qwhi5x9r53ge';
    
    // First check if employee already exists for this company
    const existingEmployee = await hrClient.employee.findFirst({
      where: {
        email: 'cihatkaya@glodinas.nl',
        companyId: currentCompanyId
      }
    });
    
    if (existingEmployee) {
      console.log('✅ Employee already exists for this company:', existingEmployee.id);
      return;
    }
    
    // Create the employee record with all required fields
    const newEmployee = await hrClient.employee.create({
      data: {
        employeeNumber: 'EMP001',
        firstName: 'Cihat',
        lastName: 'Kaya',
        email: 'cihatkaya@glodinas.nl',
        phone: '+31612345678',
        streetName: 'Techniekstraat',
        houseNumber: '123',
        city: 'Amsterdam',
        postalCode: '1012AB',
        country: 'Netherlands',
        nationality: 'Dutch',
        bsn: '123456789',
        dateOfBirth: new Date('1985-01-15'),
        gender: 'male',
        startDate: new Date('2024-01-01'),
        position: 'CEO',
        department: 'Management',
        employmentType: 'permanent',
        contractType: 'fulltime',
        workingHours: 40,
        salary: 8000.00,
        salaryType: 'monthly',
        isActive: true,
        companyId: currentCompanyId
      }
    });
    
    console.log('✅ Created new employee record:', newEmployee.id);
    console.log(`✅ Employee: ${newEmployee.firstName} ${newEmployee.lastName}`);
    console.log(`✅ Email: ${newEmployee.email}`);
    console.log(`✅ Company ID: ${newEmployee.companyId}`);
    console.log(`✅ Position: ${newEmployee.position}`);
    console.log(`✅ Salary: €${newEmployee.salary}/month`);
    console.log(`✅ Employment Type: ${newEmployee.employmentType}`);
    
  } catch (error) {
    console.error('❌ Error creating employee:', error.message);
    console.error('🔍 Full error:', error);
  } finally {
    await hrClient.$disconnect();
  }
}

createCihatEmployee();
