// Script to send an invitation to John Smith
require('dotenv').config({ path: '.env.local' });
const { PrismaClient: HRClient } = require('@prisma/hr-client');
const { PrismaClient: AuthClient } = require('@prisma/client');
const axios = require('axios');
const crypto = require('crypto');

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

// Function to send email
async function sendEmail(to, subject, html, text) {
  try {
    const apiToken = process.env.MAILTRAP_API_TOKEN;
    const apiUrl = process.env.MAILTRAP_API_URL;
    const fromEmail = process.env.EMAIL_FROM;
    const fromName = process.env.EMAIL_FROM_NAME;

    if (!apiToken || !apiUrl || !fromEmail) {
      throw new Error('Email service configuration missing');
    }

    const response = await axios.post(
      apiUrl,
      {
        from: {
          email: fromEmail,
          name: fromName || 'SalarySync'
        },
        to: [{ email: to }],
        subject,
        html,
        text
      },
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Email template for invitation
function generateInvitationEmailHTML(firstName, invitationLink) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">SalarySync</h1>
        <p style="color: white; margin: 5px 0 0;">Professional Dutch Payroll Solutions</p>
      </div>
      <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
        <h2>Welcome, ${firstName}!</h2>
        <p>You've been invited to access the SalarySync Employee Portal.</p>
        <p>Through the portal, you can:</p>
        <ul>
          <li>View your payslips and tax documents</li>
          <li>Request time off and check your leave balance</li>
          <li>Update your personal information</li>
          <li>Access important company documents</li>
        </ul>
        <p>To get started, please create your account by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Create Your Account
          </a>
        </div>
        <p>This invitation link will expire in 48 hours.</p>
        <p>If you have any questions, please contact your HR department.</p>
        <p>Best regards,<br>The SalarySync Team</p>
      </div>
      <div style="text-align: center; padding: 10px; color: #666; font-size: 12px;">
        <p>© ${new Date().getFullYear()} SalarySync. All rights reserved.</p>
      </div>
    </div>
  `;
}

function generateInvitationEmailText(firstName, invitationLink) {
  return `
    Welcome to SalarySync Employee Portal, ${firstName}!
    
    You've been invited to access the SalarySync Employee Portal.
    
    Through the portal, you can:
    - View your payslips and tax documents
    - Request time off and check your leave balance
    - Update your personal information
    - Access important company documents
    
    To get started, please create your account by visiting this link:
    ${invitationLink}
    
    This invitation link will expire in 48 hours.
    
    If you have any questions, please contact your HR department.
    
    Best regards,
    The SalarySync Team
  `;
}

// Main function to send invitation
async function sendInvitation() {
  try {
    console.log('Finding employee John Smith...');
    
    // Find the employee by email
    const employee = await hrClient.employee.findFirst({
      where: { 
        email: 'blip-freer-6i@icloud.com'
      }
    });
    
    if (!employee) {
      throw new Error('Employee John Smith not found');
    }
    
    console.log('Found employee:', employee.id);
    
    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now
    
    console.log('Generated invitation token');
    
    // Store the invitation token in the auth database
    await authClient.verificationToken.create({
      data: {
        identifier: employee.email,
        token: invitationToken,
        expires: expires,
      },
    });
    
    console.log('Stored invitation token in database');
    
    // Create invitation link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const invitationLink = `${baseUrl}/auth/employee-signup?token=${invitationToken}&email=${encodeURIComponent(employee.email)}`;
    
    console.log('Invitation link:', invitationLink);
    
    // Send invitation email
    await sendEmail(
      employee.email,
      'Welcome to SalarySync Employee Portal',
      generateInvitationEmailHTML(employee.firstName, invitationLink),
      generateInvitationEmailText(employee.firstName, invitationLink)
    );
    
    console.log('Sent invitation email');
    
    // Update employee status in HR database
    await hrClient.employee.update({
      where: { id: employee.id },
      data: {
        portalAccessStatus: "INVITED",
        invitedAt: new Date(),
      },
    });
    
    console.log('Updated employee portal access status');
    
    return {
      success: true,
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.email
      },
      invitationLink
    };
  } catch (error) {
    console.error('Error sending invitation:', error);
    throw error;
  } finally {
    await hrClient.$disconnect();
    await authClient.$disconnect();
  }
}

// Execute the invitation process
sendInvitation()
  .then(result => {
    console.log('Invitation sent successfully!');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to send invitation:', error);
    process.exit(1);
  });

