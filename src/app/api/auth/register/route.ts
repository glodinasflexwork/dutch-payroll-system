import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { getAuthClient, getHRClient } from "@/lib/database-clients"

interface RegistrationData {
  // Personal Information
  name: string
  email: string
  password: string
  
  // Company Information
  companyName: string
  kvkNumber: string
  industry: string
  businessAddress: string
  city: string
  postalCode: string
  country?: string
}

export async function POST(request: NextRequest) {
  console.log("Registration API called")
  
  try {
    const data: RegistrationData = await request.json()
    console.log("Registration data received:", { 
      name: data.name, 
      email: data.email, 
      companyName: data.companyName,
      kvkNumber: data.kvkNumber 
    })
    
    // Validate required fields
    const requiredFields = [
      'name', 'email', 'password', 
      'companyName', 'kvkNumber', 'industry', 
      'businessAddress', 'city', 'postalCode'
    ]
    
    for (const field of requiredFields) {
      if (!data[field as keyof RegistrationData]) {
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

    // Validate Dutch postal code format (allow both "1234AB" and "1234 AB")
    if (!/^\d{4}\s?[A-Z]{2}$/i.test(data.postalCode)) {
      console.log("Invalid postal code format:", data.postalCode)
      return NextResponse.json(
        { error: "Invalid Dutch postal code format (e.g., 1234AB or 1234 AB)" },
        { status: 400 }
      )
    }

    console.log("All validations passed")

    // Get database clients
    console.log("Getting database clients...")
    const authClient = await getAuthClient()
    const hrClient = await getHRClient()

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

    // Note: KvK uniqueness is no longer enforced at registration level
    // Multiple users can register companies with the same KvK number
    // Validation will occur at payroll processing level using loonheffingennummer
    console.log("Proceeding with company registration (KvK uniqueness not enforced)...")

    console.log("No existing user or company found")

    // Hash password
    console.log("Hashing password...")
    const hashedPassword = await bcrypt.hash(data.password, 12)

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    console.log("Generated verification token")

    // Ensure trial plan exists
    console.log("Ensuring trial plan exists...")
    let trialPlan = await authClient.plan.findFirst({
      where: { name: "Trial" }
    })

    if (!trialPlan) {
      console.log("Creating trial plan...")
      trialPlan = await authClient.plan.create({
        data: {
          id: 'trial',
          name: 'Trial',
          price: 0,
          currency: 'EUR',
          maxEmployees: 10,
          maxPayrolls: 100,
          features: {
            payroll: true,
            employees: true,
            reports: true,
            support: false
          },
          isActive: true
        }
      })
      console.log("Trial plan created:", trialPlan.id)
    } else {
      console.log("Trial plan found:", trialPlan.id)
    }

    // Create user and company in transaction
    console.log("Starting database transaction...")
    const result = await authClient.$transaction(async (authTx) => {
      console.log("Creating user...")
      // 1. Create user (unverified)
      const user = await authTx.user.create({
        data: {
          name: data.name.trim(),
          email: data.email.toLowerCase(),
          password: hashedPassword,
          emailVerified: null, // Not verified yet
          emailVerificationToken: verificationToken
        }
      })
      console.log("User created with ID:", user.id)

      console.log("Creating company in Auth DB...")
      // 2. Create company in Auth DB
      const authCompany = await authTx.company.create({
        data: {
          name: data.companyName.trim(),
          kvkNumber: data.kvkNumber,
          industry: data.industry
        }
      })
      console.log("Company created in Auth DB with ID:", authCompany.id)

      console.log("Creating user-company relationship...")
      // 3. Link user to company
      await authTx.userCompany.create({
        data: {
          userId: user.id,
          companyId: authCompany.id,
          role: "owner",
          isActive: true
        }
      })

      console.log("Setting user's default company...")
      // 4. Set user's default company
      await authTx.user.update({
        where: { id: user.id },
        data: { companyId: authCompany.id }
      })

      console.log("Creating trial subscription...")
      // 5. Create trial subscription with correct field names
      const trialStart = new Date()
      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 14) // 14-day trial

      const subscription = await authTx.subscription.create({
        data: {
          companyId: authCompany.id,
          planId: trialPlan.id,
          status: "trialing",
          isTrialActive: true,
          trialStart: trialStart,
          trialEnd: trialEnd,
          currentPeriodStart: trialStart,
          currentPeriodEnd: trialEnd,
          cancelAtPeriodEnd: false,
          trialExtensions: 0
        }
      })
      console.log("Trial subscription created:", {
        id: subscription.id,
        status: subscription.status,
        isTrialActive: subscription.isTrialActive,
        trialStart: subscription.trialStart,
        trialEnd: subscription.trialEnd
      })

      console.log("Auth DB transaction completed successfully")
      return { user, company: authCompany, subscription }
    })

    // 6. Create company in HR DB (using separate client)
    console.log("Creating company in HR DB...")
    try {
      await hrClient.company.create({
        data: {
          id: result.company.id, // Use same ID for consistency
          name: data.companyName.trim(),
          kvkNumber: data.kvkNumber,
          industry: data.industry,
          address: data.businessAddress.trim(),
          city: data.city.trim(),
          postalCode: data.postalCode.trim().toUpperCase(),
          country: data.country || 'Netherlands'
        }
      })
      console.log("Company created in HR DB successfully")
    } catch (hrError) {
      console.error("Failed to create company in HR database:", hrError)
      // Rollback auth database changes if HR creation fails
      console.log("Rolling back Auth DB changes...")
      try {
        await authClient.$transaction(async (authTx) => {
          await authTx.subscription.deleteMany({
            where: { companyId: result.company.id }
          })
          await authTx.userCompany.deleteMany({
            where: { userId: result.user.id }
          })
          await authTx.company.delete({
            where: { id: result.company.id }
          })
          await authTx.user.delete({
            where: { id: result.user.id }
          })
        })
        console.log("Rollback completed")
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError)
      }
      
      return NextResponse.json(
        { error: "Failed to create company. Please try again." },
        { status: 500 }
      )
    }

    // Send verification email
    console.log("Sending verification email...")
    try {
      await sendVerificationEmail(result.user.email, verificationToken, {
        userName: result.user.name,
        companyName: result.company.name
      })
      console.log("Verification email sent successfully")
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError)
      // Don't fail registration if email fails
    }

    console.log("Registration completed successfully")
    return NextResponse.json({
      message: "Registration successful! Please check your email to verify your account.",
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
      subscription: {
        id: result.subscription.id,
        status: result.subscription.status,
        isTrialActive: result.subscription.isTrialActive,
        trialEnd: result.subscription.trialEnd
      },
      nextSteps: {
        message: "After email verification, you'll have immediate access to your company dashboard with a 14-day free trial!"
      }
    })

  } catch (error) {
    console.error("Registration error:", error)
    
    // Handle specific database errors
    if (error?.code === 'P2002') {
      console.log("Unique constraint violation")
      return NextResponse.json(
        { error: "Email or KvK number already exists" },
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

async function sendVerificationEmail(
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
      subject: "Welcome to SalarySync - Verify Your Account & Company",
      html: generateVerificationEmailHTML(verificationUrl, context),
      text: generateVerificationEmailText(verificationUrl, context)
    })
  })

  if (!emailResponse.ok) {
    console.error("Failed to send verification email:", await emailResponse.text())
    throw new Error("Failed to send verification email")
  }
}

function generateVerificationEmailHTML(
  verificationUrl: string, 
  context: { userName: string; companyName: string }
): string {
  return `
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
        <h2 style="color: #333; margin-top: 0;">Hello ${context.userName}!</h2>
        
        <p>Thank you for registering both your account and <strong>${context.companyName}</strong> with SalarySync! You're just one click away from accessing your complete payroll management dashboard.</p>
        
        <p>To activate your account and company, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Activate Account & Company
          </a>
        </div>
        
        <div style="background: #e8f4fd; border: 1px solid #bee5eb; padding: 20px; border-radius: 5px; margin: 25px 0;">
          <h3 style="margin: 0 0 15px 0; color: #0c5460; font-size: 16px;">✅ What's already set up for you:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #0c5460;">
            <li><strong>Your Account:</strong> ${context.userName}</li>
            <li><strong>Your Company:</strong> ${context.companyName}</li>
            <li><strong>14-Day Free Trial:</strong> Ready to start immediately</li>
            <li><strong>Dutch Compliance:</strong> Pre-configured for Netherlands</li>
            <li><strong>Employee Management:</strong> Ready for your first hire</li>
          </ul>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verificationUrl}" style="color: #4F46E5; word-break: break-all;">${verificationUrl}</a>
        </p>
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This email was sent by SalarySync. If you didn't create an account, you can safely ignore this email.<br>
          Need help? Contact our support team at hello@salarysync.online
        </p>
      </div>
    </body>
    </html>
  `
}

function generateVerificationEmailText(
  verificationUrl: string, 
  context: { userName: string; companyName: string }
): string {
  return `
    Welcome to SalarySync!
    
    Hello ${context.userName}!
    
    Thank you for registering both your account and ${context.companyName} with SalarySync! You're just one click away from accessing your complete payroll management dashboard.
    
    To activate your account and company, please verify your email address by clicking this link:
    ${verificationUrl}
    
    What's already set up for you:
    - Your Account: ${context.userName}
    - Your Company: ${context.companyName}
    - 14-Day Free Trial: Ready to start immediately
    - Dutch Compliance: Pre-configured for Netherlands
    - Employee Management: Ready for your first hire
    
    If you didn't create an account, you can safely ignore this email.
    Need help? Contact our support team at hello@salarysync.online
    
    Best regards,
    The SalarySync Team
  `
}
