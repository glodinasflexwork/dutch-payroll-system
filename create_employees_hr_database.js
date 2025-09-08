require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function createEmployeesInHR() {
  const hrClient = new PrismaClient({
    datasources: { 
      db: { 
        url: process.env.HR_DATABASE_URL 
      } 
    }
  });
  
  try {
    const companyId = 'cmf83a28g0001qw0u6stn5skm'; // User's company ID
    
    console.log('Creating employees in HR database...');
    
    // First, check if company exists in HR database
    const existingCompany = await hrClient.$queryRaw`
      SELECT * FROM "Company" WHERE id = ${companyId}
    `;
    
    if (existingCompany.length === 0) {
      console.log('Creating company in HR database...');
      await hrClient.$executeRaw`
        INSERT INTO "Company" (id, name, "createdAt", "updatedAt")
        VALUES (${companyId}, 'Demo Tech Solutions B.V.', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `;
    }
    
    // Create departments first
    console.log('Creating departments...');
    await hrClient.$executeRaw`
      INSERT INTO "Department" (id, name, "companyId", "createdAt", "updatedAt")
      VALUES 
        ('dept_eng_' || ${companyId}, 'Engineering', ${companyId}, NOW(), NOW()),
        ('dept_sales_' || ${companyId}, 'Sales', ${companyId}, NOW(), NOW()),
        ('dept_mkt_' || ${companyId}, 'Marketing', ${companyId}, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `;
    
    // Clear existing employees for this company
    await hrClient.$executeRaw`
      DELETE FROM "Employee" WHERE "companyId" = ${companyId}
    `;
    
    // Create employees
    console.log('Creating employees...');
    
    const employees = [
      {
        firstName: 'Jan',
        lastName: 'de Vries',
        email: 'jan.devries@demo.com',
        employmentType: 'monthly',
        department: 'Engineering'
      },
      {
        firstName: 'Emma',
        lastName: 'van Berg',
        email: 'emma.vanberg@demo.com',
        employmentType: 'monthly',
        department: 'Sales'
      },
      {
        firstName: 'Pieter',
        lastName: 'Janssen',
        email: 'pieter.janssen@demo.com',
        employmentType: 'hourly',
        department: 'Marketing'
      }
    ];
    
    for (const emp of employees) {
      const employeeId = 'emp_' + Math.random().toString(36).substr(2, 9);
      const departmentId = 'dept_' + emp.department.toLowerCase().substr(0, 3) + '_' + companyId;
      
      await hrClient.$executeRaw`
        INSERT INTO "Employee" (
          id, "firstName", "lastName", email, "employmentType", 
          "companyId", "departmentId", "isActive", "createdAt", "updatedAt"
        )
        VALUES (
          ${employeeId}, ${emp.firstName}, ${emp.lastName}, ${emp.email}, 
          ${emp.employmentType}, ${companyId}, ${departmentId}, true, NOW(), NOW()
        )
      `;
      
      console.log(`✅ Created employee: ${emp.firstName} ${emp.lastName} (${emp.employmentType})`);
    }
    
    // Verify creation
    const employeeCount = await hrClient.$queryRaw`
      SELECT COUNT(*) as count FROM "Employee" WHERE "companyId" = ${companyId}
    `;
    
    console.log(`\n✅ Successfully created ${employeeCount[0].count} employees in HR database`);
    console.log('Company ID:', companyId);
    
  } catch (error) {
    console.error('Error creating employees:', error);
  } finally {
    await hrClient.$disconnect();
  }
}

createEmployeesInHR();

