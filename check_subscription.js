const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSubscription() {
  try {
    // Find the user and their company
    const user = await prisma.user.findFirst({
      where: { email: 'cihatkaya@glodinas.nl' },
      include: {
        companies: {
          include: {
            company: {
              include: {
                subscriptions: {
                  include: { plan: true }
                }
              }
            }
          }
        }
      }
    });

    console.log('=== USER AND SUBSCRIPTION DATA ===');
    console.log('User:', user?.email);
    console.log('Current Company ID:', user?.currentCompanyId);
    
    if (user?.companies) {
      for (const userCompany of user.companies) {
        console.log('\n--- Company:', userCompany.company.name, '---');
        console.log('Company ID:', userCompany.company.id);
        console.log('Subscriptions:', userCompany.company.subscriptions);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubscription();
