require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaClient: HRPrismaClient } = require('@prisma/hr-client');

const authPrisma = new PrismaClient();
const hrPrisma = new HRPrismaClient();

async function cleanupDuplicates() {
  try {
    console.log('🧹 Starting duplicate company cleanup...');

    // Find duplicate companies in HR database
    const companies = await hrPrisma.company.findMany({
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

    console.log('Current companies in HR database:');
    companies.forEach(company => {
      console.log(`- ${company.name} (ID: ${company.id.slice(0,8)}...) - ${company._count.employees} employees - Created: ${company.createdAt.toISOString().slice(0,19)}`);
    });

    // Group by name to find duplicates
    const nameGroups = {};
    companies.forEach(company => {
      if (!nameGroups[company.name]) {
        nameGroups[company.name] = [];
      }
      nameGroups[company.name].push(company);
    });

    // Process duplicates
    for (const [name, companyList] of Object.entries(nameGroups)) {
      if (companyList.length > 1) {
        console.log(`\n🔍 Processing duplicate: ${name} (${companyList.length} instances)`);
        
        // Sort by employee count (descending) and creation date (ascending)
        companyList.sort((a, b) => {
          if (b._count.employees !== a._count.employees) {
            return b._count.employees - a._count.employees; // More employees first
          }
          return new Date(a.createdAt) - new Date(b.createdAt); // Older first
        });

        const keepCompany = companyList[0]; // Keep the one with most employees (or oldest if same)
        const duplicatesToRemove = companyList.slice(1);

        console.log(`✅ Keeping: ${keepCompany.name} (ID: ${keepCompany.id.slice(0,8)}...) with ${keepCompany._count.employees} employees`);
        
        for (const duplicate of duplicatesToRemove) {
          console.log(`🗑️  Removing: ${duplicate.name} (ID: ${duplicate.id.slice(0,8)}...) with ${duplicate._count.employees} employees`);
          
          // First, move any employees from duplicate to the company we're keeping
          if (duplicate._count.employees > 0) {
            console.log(`📦 Moving ${duplicate._count.employees} employees to the kept company...`);
            await hrPrisma.employee.updateMany({
              where: {
                companyId: duplicate.id
              },
              data: {
                companyId: keepCompany.id
              }
            });
          }

          // Remove the duplicate company from HR database
          await hrPrisma.company.delete({
            where: {
              id: duplicate.id
            }
          });

          // Remove the duplicate company from Auth database and update UserCompany relationships
          const userCompanies = await authPrisma.userCompany.findMany({
            where: {
              companyId: duplicate.id
            }
          });

          if (userCompanies.length > 0) {
            console.log(`🔗 Updating ${userCompanies.length} user-company relationships...`);
            
            // Check if user already has relationship with the company we're keeping
            for (const uc of userCompanies) {
              const existingRelation = await authPrisma.userCompany.findFirst({
                where: {
                  userId: uc.userId,
                  companyId: keepCompany.id
                }
              });

              if (!existingRelation) {
                // Update the relationship to point to the kept company
                await authPrisma.userCompany.update({
                  where: {
                    id: uc.id
                  },
                  data: {
                    companyId: keepCompany.id
                  }
                });
              } else {
                // Delete the duplicate relationship
                await authPrisma.userCompany.delete({
                  where: {
                    id: uc.id
                  }
                });
              }
            }
          }

          // Update any users who have this as their current company
          await authPrisma.user.updateMany({
            where: {
              companyId: duplicate.id
            },
            data: {
              companyId: keepCompany.id
            }
          });

          // Remove the duplicate company from Auth database
          await authPrisma.company.delete({
            where: {
              id: duplicate.id
            }
          });

          console.log(`✅ Removed duplicate company: ${duplicate.id.slice(0,8)}...`);
        }
      }
    }

    // Verify the cleanup
    console.log('\n🔍 Verifying cleanup...');
    const finalCompanies = await hrPrisma.company.findMany({
      select: {
        id: true,
        name: true,
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

    console.log('\nFinal companies in HR database:');
    finalCompanies.forEach(company => {
      console.log(`- ${company.name} (ID: ${company.id.slice(0,8)}...) - ${company._count.employees} employees`);
    });

    console.log('\n🎉 Duplicate cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await authPrisma.$disconnect();
    await hrPrisma.$disconnect();
  }
}

cleanupDuplicates();

