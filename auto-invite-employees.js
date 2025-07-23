/**
 * Automated Employee Portal Invitation System
 * 
 * This script automatically sends invitations to employees who:
 * 1. Have not yet been invited to the portal
 * 2. Have been added to the system recently
 * 3. Have a valid email address
 * 
 * It can be scheduled to run daily or weekly to ensure all employees
 * receive their portal invitations in a timely manner.
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient: HRClient } = require('@prisma/hr-client');
const { PrismaClient: AuthClient } = require('@prisma/client');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

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

// Configuration
const CONFIG = {
  // Number of days to look back for new employees
  lookbackDays: 30,
  
  // Maximum number of invitations to send per run
  batchSize: 50,
  
  // Log file path
  logFilePath: path.join(__dirname, 'logs', 'invitation-logs.json'),
  
  // Whether to actually send emails or just simulate
  dryRun: false,
  
  // Whether to include employees who have had failed invitation attempts
  includeFailedAttempts: true,
  
  // Maximum number of retry attempts for failed invitations
  maxRetryAttempts: 3,
};

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

    // If in dry run mode, don't actually send the email
    if (CONFIG.dryRun) {
      console.log(`[DRY RUN] Would send email to ${to}`);
      return { success: true, message: 'Dry run - email not sent' };
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

// Function to ensure log directory exists
function ensureLogDirectoryExists() {
  const logDir = path.dirname(CONFIG.logFilePath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

// Function to load invitation logs
function loadInvitationLogs() {
  ensureLogDirectoryExists();
  
  if (!fs.existsSync(CONFIG.logFilePath)) {
    return { invitations: [], lastRun: null };
  }
  
  try {
    const logData = fs.readFileSync(CONFIG.logFilePath, 'utf8');
    return JSON.parse(logData);
  } catch (error) {
    console.error('Error loading invitation logs:', error);
    return { invitations: [], lastRun: null };
  }
}

// Function to save invitation logs
function saveInvitationLogs(logs) {
  ensureLogDirectoryExists();
  
  try {
    fs.writeFileSync(CONFIG.logFilePath, JSON.stringify(logs, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving invitation logs:', error);
  }
}

// Function to find employees who need invitations
async function findEmployeesToInvite() {
  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - CONFIG.lookbackDays);
  
  // Get invitation logs to check for previous attempts
  const logs = loadInvitationLogs();
  const invitationAttempts = new Map();
  
  logs.invitations.forEach(invitation => {
    if (!invitationAttempts.has(invitation.employeeId)) {
      invitationAttempts.set(invitation.employeeId, 0);
    }
    
    if (!invitation.success) {
      invitationAttempts.set(
        invitation.employeeId, 
        invitationAttempts.get(invitation.employeeId) + 1
      );
    }
  });
  
  // Find employees who need invitations
  const employees = await hrClient.employee.findMany({
    where: {
      // Has email
      email: { not: null },
      
      // Is active
      isActive: true,
      
      // Either never invited or invitation failed
      OR: [
        { portalAccessStatus: "NO_ACCESS" },
        { portalAccessStatus: "NOT_INVITED" }
      ]
    },
    take: CONFIG.batchSize
  });
  
  // Filter out employees who have exceeded retry attempts
  return employees.filter(employee => {
    const attempts = invitationAttempts.get(employee.id) || 0;
    return CONFIG.includeFailedAttempts || attempts < CONFIG.maxRetryAttempts;
  });
}

// Main function to send invitations
async function sendInvitations() {
  try {
    console.log('Starting automated employee invitation process...');
    
    // Load invitation logs
    const logs = loadInvitationLogs();
    
    // Find employees who need invitations
    const employees = await findEmployeesToInvite();
    console.log(`Found ${employees.length} employees who need invitations`);
    
    // Process each employee
    const results = [];
    for (const employee of employees) {
      try {
        console.log(`Processing employee: ${employee.firstName} ${employee.lastName} (${employee.email})`);
        
        // Generate invitation token
        const invitationToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours from now
        
        // Store the invitation token in the auth database (skip in dry run mode)
        if (!CONFIG.dryRun) {
          await authClient.verificationToken.create({
            data: {
              identifier: employee.email,
              token: invitationToken,
              expires: expires,
            },
          });
        }
        
        // Create invitation link
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const invitationLink = `${baseUrl}/auth/employee-signup?token=${invitationToken}&email=${encodeURIComponent(employee.email)}`;
        
        // Send invitation email
        await sendEmail(
          employee.email,
          'Welcome to SalarySync Employee Portal',
          generateInvitationEmailHTML(employee.firstName, invitationLink),
          generateInvitationEmailText(employee.firstName, invitationLink)
        );
        
        // Update employee status in HR database (skip in dry run mode)
        if (!CONFIG.dryRun) {
          await hrClient.employee.update({
            where: { id: employee.id },
            data: {
              portalAccessStatus: "INVITED",
              invitedAt: new Date(),
            },
          });
        }
        
        // Record successful invitation
        const result = {
          employeeId: employee.id,
          email: employee.email,
          name: `${employee.firstName} ${employee.lastName}`,
          timestamp: new Date(),
          success: true,
          invitationLink: CONFIG.dryRun ? invitationLink : undefined
        };
        
        results.push(result);
        console.log(`✅ Successfully sent invitation to ${employee.email}`);
      } catch (error) {
        // Record failed invitation
        const result = {
          employeeId: employee.id,
          email: employee.email,
          name: `${employee.firstName} ${employee.lastName}`,
          timestamp: new Date(),
          success: false,
          error: error.message
        };
        
        results.push(result);
        console.error(`❌ Failed to send invitation to ${employee.email}:`, error);
      }
    }
    
    // Update invitation logs
    logs.invitations = [...logs.invitations, ...results];
    logs.lastRun = new Date();
    saveInvitationLogs(logs);
    
    // Generate summary
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log('\nInvitation process completed!');
    console.log(`- Total processed: ${results.length}`);
    console.log(`- Successful: ${successCount}`);
    console.log(`- Failed: ${failureCount}`);
    
    return {
      total: results.length,
      successful: successCount,
      failed: failureCount,
      results
    };
  } catch (error) {
    console.error('Error in invitation process:', error);
    throw error;
  } finally {
    await hrClient.$disconnect();
    await authClient.$disconnect();
  }
}

// If running as a script
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  if (args.includes('--dry-run')) {
    CONFIG.dryRun = true;
    console.log('Running in dry run mode - no emails will be sent');
  }
  
  // Execute the invitation process
  sendInvitations()
    .then(result => {
      console.log('Invitation process completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Invitation process failed:', error);
      process.exit(1);
    });
} else {
  // Export for use as a module
  module.exports = {
    sendInvitations,
    findEmployeesToInvite,
    CONFIG
  };
}

