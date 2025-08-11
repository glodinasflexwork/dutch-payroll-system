const { PrismaClient } = require('@prisma/client');

async function debugRedirectLoop() {
  const authClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.AUTH_DATABASE_URL
      }
    }
  });

  try {
    console.log('🔍 DEBUGGING REDIRECT LOOP ISSUE...\n');

    // Find your user
    const user = await authClient.user.findUnique({
      where: { email: 'adjay1993@gmail.com' }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('👤 USER FOUND:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Name: ${user.name}`);
    console.log(`   - Current Company ID: ${user.companyId || 'None'}`);

    // Check for companies (no ownerId field, just check all companies)
    const companies = await authClient.company.findMany({});

    console.log(`\n🏢 ALL COMPANIES FOUND: ${companies.length}`);
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name}`);
      console.log(`      - ID: ${company.id}`);
      console.log(`      - Created: ${company.createdAt.toLocaleDateString()}`);
    });

    // Check user-company associations
    const userCompanies = await authClient.userCompany.findMany({
      where: { userId: user.id },
      include: { Company: true }
    });

    console.log(`\n🔗 USER-COMPANY ASSOCIATIONS: ${userCompanies.length}`);
    userCompanies.forEach((uc, index) => {
      console.log(`   ${index + 1}. ${uc.Company.name}`);
      console.log(`      - Role: ${uc.role}`);
      console.log(`      - Active: ${uc.isActive}`);
      console.log(`      - Created: ${uc.createdAt.toLocaleDateString()}`);
    });

    // Check if user has currentCompanyId set
    console.log('\n🎯 POTENTIAL ISSUES:');
    const issues = [];

    if (!user.companyId && companies.length > 0) {
      issues.push('User has companies but currentCompanyId is null');
    }

    if (companies.length > 0 && userCompanies.length === 0) {
      issues.push('Companies exist but no user-company associations');
    }

    if (userCompanies.length > 0 && !userCompanies.some(uc => uc.isActive)) {
      issues.push('User-company associations exist but none are active');
    }

    if (issues.length === 0) {
      console.log('   ✅ No obvious issues found');
    } else {
      issues.forEach(issue => console.log(`   ⚠️ ${issue}`));
    }

    // Suggest fixes
    console.log('\n🔧 SUGGESTED FIXES:');
    if (!user.companyId && companies.length > 0) {
      console.log('   1. Set user.companyId to the latest company');
    }
    if (companies.length > 0 && userCompanies.length === 0) {
      console.log('   2. Create user-company association');
    }
    if (userCompanies.length > 0 && !userCompanies.some(uc => uc.isActive)) {
      console.log('   3. Activate user-company association');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await authClient.$disconnect();
  }
}

debugRedirectLoop();

