const { getAuthClient } = require('./src/lib/database-clients');

async function checkExistingUsers() {
  try {
    console.log('🔍 Checking existing users and their company status...\n');
    
    // Get the auth client
    const authClient = await getAuthClient();
    
    // Get all users with their companies
    const users = await authClient.user.findMany({
      include: {
        UserCompany: {
          include: {
            Company: true
          }
        }
      }
    });
    
    console.log(`Found ${users.length} users in the system:\n`);
    
    for (const user of users) {
      console.log(`👤 User: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
      console.log(`   Company ID: ${user.companyId || 'None'}`);
      console.log(`   Companies: ${user.UserCompany.length}`);
      
      if (user.UserCompany.length > 0) {
        user.UserCompany.forEach((uc, index) => {
          console.log(`     ${index + 1}. ${uc.Company.name} (${uc.role}) - Active: ${uc.isActive}`);
        });
      }
      console.log('');
    }
    
    // Find a user with a company for testing
    const userWithCompany = users.find(u => u.UserCompany.length > 0 && u.UserCompany.some(uc => uc.isActive));
    
    if (userWithCompany) {
      console.log(`✅ Found user with company for testing: ${userWithCompany.email}`);
      const activeCompany = userWithCompany.UserCompany.find(uc => uc.isActive);
      console.log(`   Company: ${activeCompany.Company.name}`);
      console.log(`   Role: ${activeCompany.role}`);
      
      return {
        email: userWithCompany.email,
        userId: userWithCompany.id,
        companyId: activeCompany.Company.id,
        companyName: activeCompany.Company.name,
        role: activeCompany.role
      };
    } else {
      console.log('❌ No users with companies found. Need to create a test user.');
      return null;
    }
    
  } catch (error) {
    console.error('Error checking users:', error);
    return null;
  }
}

checkExistingUsers().then(result => {
  if (result) {
    console.log('\n📋 Test user details:');
    console.log(JSON.stringify(result, null, 2));
  }
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});

