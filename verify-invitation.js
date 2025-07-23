// Script to verify that the invitation was sent to John Smith
require('dotenv').config({ path: '.env.local' });
const { PrismaClient: HRClient } = require('@prisma/hr-client');
const { PrismaClient: AuthClient } = require('@prisma/client');

// Initialize clients
const hrClient = new HRClient({
  datasources: {
    db: {
      url: process.env.HR_DATABASE_URL,
    },
  },
});

const authClient = new AuthClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL,
    },
  },
});

async function verifyInvitation() {
  try {
    console.log('Verifying invitation for John Smith...');
    
    // Check employee status
    const employee = await hrClient.employee.findFirst({
      where: { 
        email: 'blip-freer-6i@icloud.com'
      }
    });
    
    if (!employee) {
      throw new Error('Employee John Smith not found');
    }
    
    console.log('Employee details:');
    console.log(`- ID: ${employee.id}`);
    console.log(`- Name: ${employee.firstName} ${employee.lastName}`);
    console.log(`- Email: ${employee.email}`);
    console.log(`- Portal Access Status: ${employee.portalAccessStatus}`);
    console.log(`- Invited At: ${employee.invitedAt}`);
    
    // Check verification token
    const verificationToken = await authClient.verificationToken.findFirst({
      where: {
        identifier: employee.email
      }
    });
    
    if (!verificationToken) {
      console.log('No verification token found for this employee');
      return { success: false };
    }
    
    console.log('\nVerification Token details:');
    console.log(`- Token: ${verificationToken.token.substring(0, 10)}...`);
    console.log(`- Expires: ${verificationToken.expires}`);
    
    // Calculate time until expiration
    const now = new Date();
    const expiresIn = Math.floor((verificationToken.expires - now) / (1000 * 60 * 60));
    console.log(`- Expires in: ${expiresIn} hours`);
    
    // Generate the invitation link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const invitationLink = `${baseUrl}/auth/employee-signup?token=${verificationToken.token}&email=${encodeURIComponent(employee.email)}`;
    
    console.log('\nInvitation Link:');
    console.log(invitationLink);
    
    return {
      success: true,
      employee,
      verificationToken: {
        ...verificationToken,
        token: `${verificationToken.token.substring(0, 10)}...`
      },
      invitationLink
    };
  } catch (error) {
    console.error('Error verifying invitation:', error);
    throw error;
  } finally {
    await hrClient.$disconnect();
    await authClient.$disconnect();
  }
}

// Execute the verification
verifyInvitation()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Invitation was successfully sent to John Smith!');
    } else {
      console.log('\n❌ Invitation verification failed');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error during verification:', error);
    process.exit(1);
  });

