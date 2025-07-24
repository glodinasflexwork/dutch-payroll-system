require('dotenv').config();
const { PrismaClient } = require('@prisma/hr-client');

async function debugEmployeeNumbers() {
  const hrClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.HR_DATABASE_URL
      }
    }
  });

  try {
    console.log('=== DEBUGGING EMPLOYEE NUMBERS ===');
    console.log('HR_DATABASE_URL:', process.env.HR_DATABASE_URL ? 'SET' : 'NOT SET');
    
    // Get all companies and their employees
    const companies = await hrClient.company.findMany({
      include: {
        employees: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            isActive: true
          },
          orderBy: {
            employeeNumber: 'asc'
          }
        }
      }
    });
    
    console.log(`Found ${companies.length} companies`);
    
    for (const company of companies) {
      console.log(`\n--- Company: ${company.name} (ID: ${company.id}) ---`);
      console.log(`Total employees: ${company.employees.length}`);
      
      if (company.employees.length > 0) {
        console.log('Employee numbers:');
        company.employees.forEach(emp => {
          console.log(`  ${emp.employeeNumber} - ${emp.firstName} ${emp.lastName} (Active: ${emp.isActive})`);
        });
        
        // Check for duplicates within this company
        const employeeNumbers = company.employees.map(emp => emp.employeeNumber);
        const duplicates = employeeNumbers.filter((item, index) => employeeNumbers.indexOf(item) !== index);
        
        if (duplicates.length > 0) {
          console.log(`⚠️  DUPLICATES FOUND: ${duplicates.join(', ')}`);
        }
        
        // Find the highest number for EMP format
        const empNumbers = employeeNumbers
          .filter(num => num.startsWith('EMP'))
          .map(num => {
            const match = num.match(/EMP(\d+)/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(num => num > 0)
          .sort((a, b) => b - a);
          
        if (empNumbers.length > 0) {
          console.log(`Highest EMP number: EMP${String(empNumbers[0]).padStart(4, '0')}`);
          console.log(`Next suggested: EMP${String(empNumbers[0] + 1).padStart(4, '0')}`);
        } else {
          console.log('No EMP-format numbers found, next would be: EMP0001');
        }
      }
    }
    
    console.log('\n=== DEBUG COMPLETE ===');
    
  } catch (error) {
    console.error('Error debugging employee numbers:', error);
  } finally {
    await hrClient.$disconnect();
  }
}

debugEmployeeNumbers();

