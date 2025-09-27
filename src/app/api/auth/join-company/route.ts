import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { getAuthClient } from "@/lib/database-clients"

interface JoinCompanyData {
  // Personal Information
  name: string
  email: string
  password: string
  
  // Company Information
  kvkNumber: string
  requestMessage?: string
}

export async function POST(request: NextRequest) {
  console.log("Join Company API called")
  
  try {
    const data: JoinCompanyData = await request.json()
    console.log("Join company data received:", { 
      name: data.name, 
      email: data.email, 
      kvkNumber: data.kvkNumber 
    })
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'password', 'kvkNumber']
    
    for (const field of requiredFields) {
      if (!data[field as keyof JoinCompanyData]) {
        console.log(`Missing field: ${field}`)
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      console.log("Invalid email format:", data.email)
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (data.password.length < 8) {
      console.log("Password too short")
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      console.log("Password doesn't meet complexity requirements")
      return NextResponse.json(
        { error: "Password must contain uppercase, lowercase, and number" },
        { status: 400 }
      )
    }

    // Validate KvK number format (8 digits)
    if (!/^\d{8}$/.test(data.kvkNumber)) {
      console.log("Invalid KvK number format:", data.kvkNumber)
      return NextResponse.json(
        { error: "KvK number must be 8 digits" },
        { status: 400 }
      )
    }

    console.log("All validations passed")

    // Get database client
    console.log("Getting database client...")
    const authClient = await getAuthClient()

    // Check if user already exists
    console.log("Checking if user exists...")
    const existingUser = await authClient.user.findUnique({
      where: { email: data.email.toLowerCase() }
    })

    if (existingUser) {
      console.log("User already exists:", data.email)
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Check if company exists with this KvK number
    console.log("Checking if company exists with KvK number...")
    const existingCompany = await authClient.company.findFirst({
      where: { kvkNumber: data.kvkNumber },
      include: {
        UserCompany: {
          include: {
            User: true
          }
        }
      }
    })

    if (!existingCompany) {
      console.log("Company with KvK number does not exist:", data.kvkNumber)
      return NextResponse.json(
        { 
          error: "Company with this KvK number does not exist in our system. Please contact the company administrator or register as a new company.",
          suggestion: "If you are the company owner, please use the 'Register New Company' option instead."
        },
        { status: 404 }
      )
    }

    console.log("Company found, creating user and join request...")

    // Hash password
    console.log("Hashing password...")
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    console.log("Generated verification token")

    // Create user and join request in transaction
    console.log("Starting database transaction...")
    const result = await authClient.$transaction(async (authTx) => {
      console.log("Creating user...")
      // 1. Create user (unverified, no company association yet)
      const user = await authTx.user.create({
        data: {
          name: data.name.trim(),
          email: data.email.toLowerCase(),
          password: hashedPassword,
          emailVerified: null, // Not verified yet
          emailVerificationToken: verificationToken,
          companyId: null // No company association until approved
        }
      })
      console.log("User created with ID:", user.id)

      console.log("Creating join request...")
      // 2. Create a join request (pending approval)
      const joinRequest = await authTx.companyJoinRequest.create({
        data: {
          userId: user.id,
          companyId: existingCompany.id,
          requestMessage: data.requestMessage || `${data.name} would like to join ${existingCompany.name}`,
          status: "pending"
        }
      })
      console.log("Join request created with ID:", joinRequest.id)

      return { user, joinRequest, company: existingCompany }
    })

    // Send verification email to the new user
    console.log("Sending verification email to new user...")
    try {
      await sendJoinRequestVerificationEmail(result.user.email, verificationToken, {
        userName: result.user.name,
        companyName: result.company.name
      })
      console.log("Verification email sent successfully")
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      // Don't fail registration if email fails
    }

    // Notify company administrators about the join request
    console.log("Notifying company administrators...")
    try {
      const companyAdmins = result.company.UserCompany
        .filter(uc => uc.role === 'owner' || uc.role === 'admin')
        .map(uc => uc.User)

      for (const admin of companyAdmins) {
        await sendJoinRequestNotificationEmail(admin.email, {
          adminName: admin.name,
          requesterName: result.user.name,
          requesterEmail: result.user.email,
          companyName: result.company.name,
          requestMessage: result.joinRequest.requestMessage
        })
      }
      console.log("Admin notification emails sent successfully")
    } catch (emailError) {
      console.error("Failed to send admin notification emails:", emailError)
      // Don't fail the process if email fails
    }

    console.log("Join company request completed successfully")
    return NextResponse.json({
      message: "Join request submitted successfully! Please check your email to verify your account. Company administrators will be notified of your request.",
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        emailVerified: false
      },
      company: {
        id: result.company.id,
        name: result.company.name,
        kvkNumber: result.company.kvkNumber
      },
      joinRequest: {
        id: result.joinRequest.id,
        status: result.joinRequest.status
      },
      nextSteps: {
        message: "After email verification, wait for company administrator approval to access the company dashboard."
      }
    })

  } catch (error) {
    console.error("Join company error:", error)
    
    // Handle specific database errors
    if (error?.code === 'P2002') {
      console.log("Unique constraint violation")
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    // Log the full error for debugging
    console.error("Full error details:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    })

    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    )
  }
}

async function sendJoinRequestVerificationEmail(
  email: string, 
  token: string, 
  context: { userName: string; companyName: string }
) {
  // Generate verification URL based on environment
  const baseUrl = process.env.NEXTAUTH_URL || 
    (process.env.NODE_ENV === 'production' 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3001')
  const verificationUrl = `${baseUrl}/api/auth/verify-email/${token}`
  
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
      to: [{ email }],
      subject: "Verify Your Account - Join Request Submitted",
      html: generateJoinRequestVerificationEmailHTML(verificationUrl, context),
      text: generateJoinRequestVerificationEmailText(verificationUrl, context)
    })
  })

  if (!emailResponse.ok) {
    console.error("Failed to send verification email:", await emailResponse.text())
    throw new Error("Failed to send verification email")
  }
}

async function sendJoinRequestNotificationEmail(
  adminEmail: string,
  context: { 
    adminName: string; 
    requesterName: string; 
    requesterEmail: string; 
    companyName: string; 
    requestMessage: string;
  }
) {
  const baseUrl = process.env.NEXTAUTH_URL || 
    (process.env.NODE_ENV === 'production' 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3001')
  const dashboardUrl = `${baseUrl}/dashboard/people-management/join-requests`
  
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
      to: [{ email: adminEmail }],
      subject: `New Join Request for ${context.companyName}`,
      html: generateJoinRequestNotificationEmailHTML(dashboardUrl, context),
      text: generateJoinRequestNotificationEmailText(dashboardUrl, context)
    })
  })

  if (!emailResponse.ok) {
    console.error("Failed to send admin notification email:", await emailResponse.text())
    throw new Error("Failed to send admin notification email")
  }
}

function generateJoinRequestVerificationEmailHTML(
  verificationUrl: string, 
  context: { userName: string; companyName: string }
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Account - SalarySync</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">📧 Verify Your Account</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0;">Join Request Submitted</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hello ${context.userName}!</h2>
        
        <p>Thank you for requesting to join <strong>${context.companyName}</strong> on SalarySync! Your join request has been submitted and company administrators have been notified.</p>
        
        <p>To complete your account setup, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px 0; color: #856404; font-size: 16px;">⏳ What happens next:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #856404;">
            <li><strong>Email Verification:</strong> Click the button above to verify your email</li>
            <li><strong>Administrator Review:</strong> Company administrators will review your request</li>
            <li><strong>Approval Notification:</strong> You'll receive an email when approved</li>
            <li><strong>Access Granted:</strong> Once approved, you can access the company dashboard</li>
          </ul>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verificationUrl}" style="color: #4F46E5; word-break: break-all;">${verificationUrl}</a>
        </p>
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This email was sent by SalarySync. If you didn't request to join this company, you can safely ignore this email.<br>
          Need help? Contact our support team at hello@salarysync.online
        </p>
      </div>
    </body>
    </html>
  `
}

function generateJoinRequestVerificationEmailText(
  verificationUrl: string, 
  context: { userName: string; companyName: string }
): string {
  return `
    Verify Your Account - SalarySync
    
    Hello ${context.userName}!
    
    Thank you for requesting to join ${context.companyName} on SalarySync! Your join request has been submitted and company administrators have been notified.
    
    To complete your account setup, please verify your email address by clicking this link:
    ${verificationUrl}
    
    What happens next:
    - Email Verification: Click the link above to verify your email
    - Administrator Review: Company administrators will review your request
    - Approval Notification: You'll receive an email when approved
    - Access Granted: Once approved, you can access the company dashboard
    
    If you didn't request to join this company, you can safely ignore this email.
    Need help? Contact our support team at hello@salarysync.online
    
    Best regards,
    The SalarySync Team
  `
}

function generateJoinRequestNotificationEmailHTML(
  dashboardUrl: string,
  context: { 
    adminName: string; 
    requesterName: string; 
    requesterEmail: string; 
    companyName: string; 
    requestMessage: string;
  }
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Join Request - ${context.companyName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">👥 New Join Request</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0;">${context.companyName}</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hello ${context.adminName}!</h2>
        
        <p>A new user has requested to join <strong>${context.companyName}</strong> on SalarySync and requires your approval.</p>
        
        <div style="background: #e3f2fd; border: 1px solid #90caf9; padding: 20px; border-radius: 5px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1565c0; font-size: 16px;">📋 Request Details:</h3>
          <p style="margin: 5px 0; color: #1565c0;"><strong>Name:</strong> ${context.requesterName}</p>
          <p style="margin: 5px 0; color: #1565c0;"><strong>Email:</strong> ${context.requesterEmail}</p>
          <p style="margin: 5px 0; color: #1565c0;"><strong>Message:</strong> ${context.requestMessage}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" 
             style="background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Review Join Request
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          You can approve or reject this request from your SalarySync dashboard. The user will be notified of your decision via email.
        </p>
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This email was sent by SalarySync because you are an administrator of ${context.companyName}.<br>
          Need help? Contact our support team at hello@salarysync.online
        </p>
      </div>
    </body>
    </html>
  `
}

function generateJoinRequestNotificationEmailText(
  dashboardUrl: string,
  context: { 
    adminName: string; 
    requesterName: string; 
    requesterEmail: string; 
    companyName: string; 
    requestMessage: string;
  }
): string {
  return `
    New Join Request - ${context.companyName}
    
    Hello ${context.adminName}!
    
    A new user has requested to join ${context.companyName} on SalarySync and requires your approval.
    
    Request Details:
    - Name: ${context.requesterName}
    - Email: ${context.requesterEmail}
    - Message: ${context.requestMessage}
    
    Review the request here: ${dashboardUrl}
    
    You can approve or reject this request from your SalarySync dashboard. The user will be notified of your decision via email.
    
    This email was sent by SalarySync because you are an administrator of ${context.companyName}.
    Need help? Contact our support team at hello@salarysync.online
    
    Best regards,
    The SalarySync Team
  `
}

