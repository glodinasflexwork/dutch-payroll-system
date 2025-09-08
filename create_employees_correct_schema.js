require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function createEmployeesCorrectSchema() {
  const hrClient = new PrismaClient({
    datasources: { 
      db: { 
        url: process.env.HR_DATABASE_URL 
      } 
    }
  });
  
  try {
    const companyId = 'cmf83a28g0001qw0u6stn5skm'; // User's company ID
    
    console.log('Creating employees in HR database with correct schema...');
    
    // First, ensure company exists in HR database
    await hrClient.$executeRaw`
      INSERT INTO "Company" (id, name, "createdAt", "updatedAt")
      VALUES (${companyId}, 'Demo Tech Solutions B.V.', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `;
    
    // Clear existing employees for this company
    await hrClient.$executeRaw`
      DELETE FROM "Employee" WHERE "companyId" = ${companyId}
    `;
    
    // Create employees with all required fields
    console.log('Creating employees...');
    
    const employees = [
      {
        firstName: 'Jan',
        lastName: 'de Vries',
        email: 'jan.devries@demo.com',
        employmentType: 'monthly',
        department: 'Engineering',
        position: 'Software Developer',
        salary: 65000
      },
      {
        firstName: 'Emma',
        lastName: 'van Berg',
        email: 'emma.vanberg@demo.com',
        employmentType: 'monthly',
        department: 'Sales',
        position: 'Sales Manager',
        salary: 55000
      },
      {
        firstName: 'Pieter',
        lastName: 'Janssen',
        email: 'pieter.janssen@demo.com',
        employmentType: 'hourly',
        department: 'Marketing',
        position: 'Marketing Specialist',
        hourlyRate: 35
      }
    ];
    
    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      const employeeId = 'emp_' + Math.random().toString(36).substr(2, 9);
      const employeeNumber = 'EMP' + String(i + 1).padStart(3, '0');
      
      await hrClient.$executeRaw`
        INSERT INTO "Employee" (
          id, "employeeNumber", "firstName", "lastName", email, 
          country, nationality, bsn, "dateOfBirth", "startDate",
          position, department, "employmentType", "contractType", 
          "workingHours", "isActive", "companyId", "createdAt", "updatedAt",
          "portalAccessStatus", "isDGA", salary, "hourlyRate"
        )
        VALUES (
          ${employeeId}, ${employeeNumber}, ${emp.firstName}, ${emp.lastName}, ${emp.email},
          'Netherlands', 'Dutch', ${'123456789' + i}, '1990-01-01'::date, '2024-01-01'::date,
          ${emp.position}, ${emp.department}, ${emp.employmentType}, 'permanent',
          40.0, true, ${companyId}, NOW(), NOW(),
          'active', false, ${emp.salary || null}, ${emp.hourlyRate || null}
        )
      `;
      
      console.log(`✅ Created employee: ${emp.firstName} ${emp.lastName} (${emp.employmentType})`);
    }
    
    // Verify creation
    const employeeCount = await hrClient.$queryRaw`
      SELECT COUNT(*) as count FROM "Employee" WHERE "companyId" = ${companyId}
    `;
    
    const employees_created = await hrClient.$queryRaw`
      SELECT "firstName", "lastName", "employmentType", department 
      FROM "Employee" 
      WHERE "companyId" = ${companyId}
    `;
    
    console.log(`\n✅ Successfully created ${employeeCount[0].count} employees in HR database`);
    console.log('Employees created:');
    employees_created.forEach(emp => {
      console.log(`- ${emp.firstName} ${emp.lastName} (${emp.employmentType}) - ${emp.department}`);
    });
    console.log('Company ID:', companyId);
    
  } catch (error) {
    console.error('Error creating employees:', error);
  } finally {
    await hrClient.$disconnect();
  }
}

createEmployeesCorrectSchema();

