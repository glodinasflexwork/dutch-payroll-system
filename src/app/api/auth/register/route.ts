import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validate required fields (only personal information)
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, and password are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain uppercase, lowercase, and number" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Create user account only (no company information)
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        emailVerified: null, // Not verified yet
        emailVerificationToken: verificationToken
        // No companyId - user will set up company after login
      }
    })

    // Send verification email
    try {
      const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email/${verificationToken}`
      
      const emailResponse = await fetch(process.env.MAILTRAP_API_URL!, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.MAILTRAP_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: {
            email: process.env.EMAIL_FROM!,
            name: process.env.EMAIL_FROM_NAME!
          },
          to: [{ email: user.email }],
          subject: "Welcome to SalarySync - Verify Your Email",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to SalarySync</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to SalarySync!</h1>
                <p style="color: #f0f0f0; margin: 10px 0 0 0;">Professional Dutch Payroll Management</p>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Hello ${user.name}!</h2>
                
                <p>Thank you for joining SalarySync! You're just one step away from accessing the most comprehensive Dutch payroll management platform.</p>
                
                <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationUrl}" 
                     style="background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Verify My Email & Activate Account
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${verificationUrl}" style="color: #4F46E5; word-break: break-all;">${verificationUrl}</a>
                </p>
                
                <div style="background: #e8f4fd; border: 1px solid #bee5eb; padding: 20px; border-radius: 5px; margin: 25px 0;">
                  <h3 style="margin: 0 0 15px 0; color: #0c5460; font-size: 16px;">🚀 What's waiting for you:</h3>
                  <ul style="margin: 0; padding-left: 20px; color: #0c5460;">
                    <li><strong>Company Setup:</strong> Quick KvK integration and company configuration</li>
                    <li><strong>14-Day Free Trial:</strong> Full access to all premium features</li>
                    <li><strong>Employee Management:</strong> Add unlimited employees during trial</li>
                    <li><strong>Dutch Compliance:</strong> Automatic tax calculations and social security</li>
                    <li><strong>Payroll Processing:</strong> Generate compliant payslips and reports</li>
                    <li><strong>Expert Support:</strong> Dutch payroll specialists ready to help</li>
                  </ul>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #856404;">
                    💡 <strong>Pro Tip:</strong> Have your KvK number ready for quick company setup after verification!
                  </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #999; text-align: center;">
                  This email was sent by SalarySync. If you didn't create an account, you can safely ignore this email.<br>
                  Need help? Contact our support team at hello@salarysync.online
                </p>
              </div>
            </body>
            </html>
          `,
          text: `
            Welcome to SalarySync!
            
            Hello ${user.name}!
            
            Thank you for joining SalarySync! You're just one step away from accessing the most comprehensive Dutch payroll management platform.
            
            To complete your registration and activate your account, please verify your email address by clicking this link:
            ${verificationUrl}
            
            What's waiting for you:
            - Company Setup: Quick KvK integration and company configuration
            - 14-Day Free Trial: Full access to all premium features
            - Employee Management: Add unlimited employees during trial
            - Dutch Compliance: Automatic tax calculations and social security
            - Payroll Processing: Generate compliant payslips and reports
            - Expert Support: Dutch payroll specialists ready to help
            
            Pro Tip: Have your KvK number ready for quick company setup after verification!
            
            If you didn't create an account, you can safely ignore this email.
            Need help? Contact our support team at hello@salarysync.online
            
            Best regards,
            The SalarySync Team
          `
        })
      })

      if (!emailResponse.ok) {
        console.error("Failed to send verification email:", await emailResponse.text())
        // Don't fail registration if email fails, but log the error
        console.error("User created but verification email failed to send")
      }

    } catch (emailError) {
      console.error("Email sending error:", emailError)
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      message: "Registration successful! Please check your email to verify your account.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: false
      },
      nextSteps: {
        message: "After email verification, you'll set up your company information and start your free trial!"
      }
    })

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

