import { NextResponse } from 'next/server';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static apiToken = process.env.MAILTRAP_API_TOKEN;
  private static apiUrl = process.env.MAILTRAP_API_URL;
  private static fromEmail = process.env.EMAIL_FROM;
  private static fromName = process.env.EMAIL_FROM_NAME;

  static async sendEmail(data: EmailData): Promise<boolean> {
    try {
      if (!this.apiToken || !this.apiUrl || !this.fromEmail) {
        console.error('Email configuration missing');
        return false;
      }

      const response = await fetch(this.apiUrl!, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: {
            email: this.fromEmail,
            name: this.fromName || 'SalarySync'
          },
          to: [
            {
              email: data.to
            }
          ],
          subject: data.subject,
          html: data.html,
          text: data.text || data.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
          category: 'verification'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Email sending failed:', response.status, errorText);
        return false;
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  static async sendVerificationEmail(email: string, verificationToken: string, baseUrl: string): Promise<boolean> {
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - SalarySync</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">SalarySync</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Professional Dutch Payroll Management</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Verify Your Email Address</h2>
              
              <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                Welcome to SalarySync! To complete your registration and start using our professional payroll management platform, please verify your email address by clicking the button below.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="color: #6b7280; margin: 20px 0 0 0; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, you can copy and paste this link into your browser:
                <br>
                <a href="${verificationUrl}" style="color: #3b82f6; word-break: break-all;">${verificationUrl}</a>
              </p>
              
              <div style="border-top: 1px solid #e5e7eb; margin: 30px 0; padding-top: 20px;">
                <p style="color: #6b7280; margin: 0; font-size: 14px;">
                  This verification link will expire in 24 hours. If you didn't create an account with SalarySync, you can safely ignore this email.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                © 2025 SalarySync. Professional Dutch Payroll Management.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email Address - SalarySync',
      html,
    });
  }

  static async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to SalarySync</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Welcome to SalarySync!</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Your payroll management journey starts here</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hello ${name}!</h2>
              
              <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                Thank you for joining SalarySync! Your email has been successfully verified and your account is now active.
              </p>
              
              <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                You can now access all features of our professional Dutch payroll management platform, including:
              </p>
              
              <ul style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; padding-left: 20px;">
                <li>Employee management and onboarding</li>
                <li>Automated Dutch payroll calculations</li>
                <li>Leave management and time tracking</li>
                <li>Comprehensive reporting and analytics</li>
                <li>Dutch compliance and tax handling</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL || 'https://salarysync.nl'}" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Start Using SalarySync
                </a>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; margin: 30px 0; padding-top: 20px;">
                <p style="color: #6b7280; margin: 0; font-size: 14px;">
                  Need help getting started? Contact our support team or check out our documentation.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                © 2025 SalarySync. Professional Dutch Payroll Management.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to SalarySync - Your Account is Ready!',
      html,
    });
  }
}

