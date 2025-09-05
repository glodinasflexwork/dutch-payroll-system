const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  try {
    console.log('=== CHECKING AUTH DATABASE USERS ===');
    
    const users = await authClient.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        UserCompany: {
          select: {
            role: true,
            Company: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - Created: ${user.createdAt}`);
      if (user.UserCompany.length > 0) {
        user.UserCompany.forEach(uc => {
          console.log(`  Company: ${uc.Company.name} (Role: ${uc.role})`);
        });
      }
    });

    // Check specifically for cihatkaya@glodinas.nl
    const cihatUser = await authClient.user.findUnique({
      where: { email: 'cihatkaya@glodinas.nl' },
      include: {
        UserCompany: {
          include: {
            Company: {
              include: {
                Subscription: true
              }
            }
          }
        }
      }
    });

    if (cihatUser) {
      console.log('\n=== CIHAT USER DETAILS ===');
      console.log('User:', cihatUser);
    } else {
      console.log('\n❌ User cihatkaya@glodinas.nl NOT FOUND');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await authClient.$disconnect();
  }
}

checkUsers();
