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
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    console.log(`✅ Found ${cihatEmployees.length} employees matching Cihat Kaya:`);
    cihatEmployees.forEach(emp => {
      console.log(`- ${emp.firstName} ${emp.lastName} (${emp.email}) - Company: ${emp.company?.name} (${emp.companyId})`);
    });
    
    // Also check what company ID we're looking for
    console.log('\n🏢 Checking Glodinas Finance B.V. company ID...');
    const glodinasCompany = await hrClient.company.findMany({
      where: {
        name: { contains: 'Glodinas', mode: 'insensitive' }
      }
    });
    
    console.log('Glodinas companies found:', glodinasCompany);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await hrClient.$disconnect();
  }
}

findCihat();
