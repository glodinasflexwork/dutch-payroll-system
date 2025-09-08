const { PrismaClient } = require('@prisma/hr-client');

async function findCihat() {
  console.log('🔍 Looking for Cihat Kaya in HR database...');
  
  const hrClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.HR_DATABASE_URL
      }
    }
  });

  try {
    await hrClient.$connect();
    
    const cihatEmployees = await hrClient.employee.findMany({
      where: {
        OR: [
          { firstName: { contains: 'Cihat', mode: 'insensitive' } },
          { lastName: { contains: 'Kaya', mode: 'insensitive' } },
          { email: { contains: 'cihat', mode: 'insensitive' } }
        ]
      },
      include: {
        Company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    console.log(`✅ Found ${cihatEmployees.length} employees matching Cihat Kaya:`);
    cihatEmployees.forEach(emp => {
      console.log(`- ${emp.firstName} ${emp.lastName} (${emp.email}) - Company: ${emp.Company?.name} (${emp.companyId})`);
    });
    
    // Check current Glodinas company ID from AUTH database
    console.log('\n🏢 Current session company ID: cmf71rbk40002qwhi5x9r53ge');
    
    // Check if there are employees for this company ID
    const companyEmployees = await hrClient.employee.findMany({
      where: {
        companyId: 'cmf71rbk40002qwhi5x9r53ge',
        isActive: true
      }
    });
    
    console.log(`\n👥 Employees for company cmf71rbk40002qwhi5x9r53ge: ${companyEmployees.length}`);
    companyEmployees.forEach(emp => {
      console.log(`- ${emp.firstName} ${emp.lastName} (${emp.email})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await hrClient.$disconnect();
  }
}

findCihat();
