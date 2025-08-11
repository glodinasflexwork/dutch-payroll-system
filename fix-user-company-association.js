const { PrismaClient } = require('@prisma/client');

const authClient = new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL
    }
  }
});

async function fixUserCompanyAssociation() {
  try {
    const userId = 'cmdsuugi60000js0bmk1urhki'; // adjay1993@gmail.com
    const companyId = 'cme7fn8kf0000k40ag368f3a1'; // Glodinas Finance B.V.
    
    console.log('=== FIXING USER-COMPANY ASSOCIATION ===');
    
    // 1. Create user-company association
    const userCompany = await authClient.userCompany.create({
      data: {
        userId: userId,
        companyId: companyId,
        role: 'admin',
        isActive: true
      }
    });
    
    console.log('✅ Created user-company association:', userCompany);
    
    // 2. Update user's companyId
    const updatedUser = await authClient.user.update({
      where: { id: userId },
      data: { companyId: companyId }
    });
    
    console.log('✅ Updated user companyId:', updatedUser.companyId);
    
    // 3. Verify the fix
    const verifyUser = await authClient.user.findUnique({
      where: { id: userId },
      include: {
        UserCompany: true
      }
    });
    
    console.log('=== VERIFICATION ===');
    console.log('User companyId:', verifyUser.companyId);
    console.log('User-company associations:', verifyUser.UserCompany);
    
    await authClient.$disconnect();
    console.log('✅ Fix completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixUserCompanyAssociation();

