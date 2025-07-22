const { PrismaClient: HRClient } = require('@prisma/hr-client');
const prisma = new HRClient();

async function checkCompanies() {
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            employees: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log('Companies in HR database:');
    companies.forEach(company => {
      console.log(`- ${company.name} (ID: ${company.id.slice(0,8)}...) - ${company._count.employees} employees - Created: ${company.createdAt.toISOString().slice(0,19)}`);
    });
    
    // Check for duplicates
    const nameGroups = {};
    companies.forEach(company => {
      if (!nameGroups[company.name]) {
        nameGroups[company.name] = [];
      }
      nameGroups[company.name].push(company);
    });
    
    console.log('\nDuplicate analysis:');
    Object.entries(nameGroups).forEach(([name, companies]) => {
      if (companies.length > 1) {
        console.log(`❌ DUPLICATE: ${name} appears ${companies.length} times`);
        companies.forEach(c => console.log(`   - ID: ${c.id.slice(0,8)}... (${c._count.employees} employees)`));
      } else {
        console.log(`✅ UNIQUE: ${name}`);
      }
    });
    
    console.log('\nTotal companies:', companies.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompanies();

