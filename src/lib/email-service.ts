/**
 * Email Service
 * 
 * Handles sending emails for various system functions including
 * employee portal invitations.
 */

// Email templates
const EMAIL_TEMPLATES = {
  EMPLOYEE_INVITATION: {
    subject: 'Welcome to SalarySync Employee Portal',
    html: (firstName: string, invitationLink: string) => `
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
    `,
    text: (firstName: string, invitationLink: string) => `
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
    `
  },
  PASSWORD_RESET: {
    subject: 'Reset Your SalarySync Password',
    html: (firstName: string, resetLink: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SalarySync</h1>
          <p style="color: white; margin: 5px 0 0;">Professional Dutch Payroll Solutions</p>
        </div>
        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none;">
          <h2>Hello, ${firstName}</h2>
          <p>We received a request to reset your password for the SalarySync Employee Portal.</p>
          <p>To reset your password, please click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>Best regards,<br>The SalarySync Team</p>
        </div>
        <div style="text-align: center; padding: 10px; color: #666; font-size: 12px;">
          <p>© ${new Date().getFullYear()} SalarySync. All rights reserved.</p>
        </div>
      </div>
    `,
    text: (firstName: string, resetLink: string) => `
      Hello, ${firstName}
      
      We received a request to reset your password for the SalarySync Employee Portal.
      
      To reset your password, please visit this link:
      ${resetLink}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, you can safely ignore this email.
      
      Best regards,
      The SalarySync Team
    `
  }
};

/**
 * Sends an email using the configured email service
 */
async function sendEmail(to: string, subject: string, html: string, text: string) {
  try {
    // For development, just log the email instead of sending
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent:');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`HTML: ${html.substring(0, 200)}...`);
      console.log(`Text: ${text.substring(0, 200)}...`);
      return { success: true, messageId: 'dev-' + Date.now() };
    }

    const apiToken = process.env.MAILTRAP_API_TOKEN;
    const apiUrl = process.env.MAILTRAP_API_URL;
    const fromEmail = process.env.EMAIL_FROM;
    const fromName = process.env.EMAIL_FROM_NAME;

    if (!apiToken || !apiUrl || !fromEmail) {
      throw new Error('Email service configuration missing');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: {
          email: fromEmail,
          name: fromName || 'SalarySync'
        },
        to: [{ email: to }],
        subject,
        html,
        text
      })
    });

    if (!response.ok) {
      throw new Error(`Email API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Sends an employee invitation email
 */
export async function sendEmployeeInvitationEmail(
  email: string,
  firstName: string,
  invitationLink: string
) {
  const template = EMAIL_TEMPLATES.EMPLOYEE_INVITATION;
  
  return sendEmail(
    email,
    template.subject,
    template.html(firstName, invitationLink),
    template.text(firstName, invitationLink)
  );
}

/**
 * Sends a password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetLink: string
) {
  const template = EMAIL_TEMPLATES.PASSWORD_RESET;
  
  return sendEmail(
    email,
    template.subject,
    template.html(firstName, resetLink),
    template.text(firstName, resetLink)
  );
}

