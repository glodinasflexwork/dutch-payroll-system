const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL
    }
  }
});

async function checkUser() {
  try {
    console.log('Checking user: glodinas@icloud.com');
    
    const user = await prisma.user.findUnique({
      where: { email: 'glodinas@icloud.com' },
      include: {
        UserCompany: {
          include: {
            Company: true
          }
        }
      }
    });
    
    console.log('User found:', !!user);
    if (user) {
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
      console.log('User companies count:', user.UserCompany.length);
      
      if (user.UserCompany.length > 0) {
        user.UserCompany.forEach((uc, i) => {
          console.log(`Company ${i+1}:`, uc.Company.name, 'Role:', uc.role, 'Active:', uc.isActive);
        });
      } else {
        console.log('No UserCompany relationships found for this user');
        
        // Let's check if there are any companies at all
        const allCompanies = await prisma.company.findMany({
          select: { id: true, name: true }
        });
        console.log('Total companies in database:', allCompanies.length);
        allCompanies.forEach((company, i) => {
          console.log(`Company ${i+1}:`, company.name, 'ID:', company.id);
        });
        
        // Let's also check all UserCompany relationships
        const allUserCompanies = await prisma.userCompany.findMany({
          include: {
            User: { select: { email: true } },
            Company: { select: { name: true } }
          }
        });
        console.log('Total UserCompany relationships:', allUserCompanies.length);
        allUserCompanies.forEach((uc, i) => {
          console.log(`Relationship ${i+1}:`, uc.User.email, '->', uc.Company.name, 'Role:', uc.role);
        });
      }
    } else {
      console.log('User not found in database');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();

