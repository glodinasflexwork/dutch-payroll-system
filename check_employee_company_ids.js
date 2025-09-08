require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function checkEmployeeCompanyIds() {
  try {
    // Check user's company ID
    const authClient = new PrismaClient({
      datasources: { db: { url: process.env.AUTH_DATABASE_URL } }
    });
    
    const user = await authClient.user.findUnique({
      where: { email: 'testlogin@example.com' },
      select: { id: true, email: true, companyId: true }
    });
    
    console.log('=== USER INFO ===');
    console.log('User company ID:', user?.companyId);
    
    // Check employees in HR database
    const hrClient = new PrismaClient({
      datasources: { db: { url: process.env.HR_DATABASE_URL } }
    });
    
    const employees = await hrClient.employee.findMany({
      select: { id: true, firstName: true, lastName: true, companyId: true, isActive: true, employmentType: true }
    });
    
    console.log('\n=== EMPLOYEES IN HR DATABASE ===');
    employees.forEach(emp => {
      console.log(`- ${emp.firstName} ${emp.lastName}`);
      console.log(`  Company ID: ${emp.companyId}`);
      console.log(`  Active: ${emp.isActive}`);
      console.log(`  Type: ${emp.employmentType}`);
      console.log(`  Matches user company: ${emp.companyId === user?.companyId ? 'YES' : 'NO'}`);
      console.log('');
    });
    
    // Check companies in HR database
    const companies = await hrClient.company.findMany({
      select: { id: true, name: true }
    });
    
    console.log('=== COMPANIES IN HR DATABASE ===');
    companies.forEach(company => {
      console.log(`- ${company.name} (ID: ${company.id})`);
      console.log(`  Matches user company: ${company.id === user?.companyId ? 'YES' : 'NO'}`);
    });
    
    await authClient.$disconnect();
    await hrClient.$disconnect();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEmployeeCompanyIds();

