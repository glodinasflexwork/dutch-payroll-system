import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: "If an account with that email exists and is unverified, we've sent a verification link" },
        { status: 200 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email is already verified" },
        { status: 200 }
      )
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Save verification token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken
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
          subject: "Verify Your SalarySync Email Address",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Email</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">✉️ Verify Your Email</h1>
                <p style="color: #f0f0f0; margin: 10px 0 0 0;">SalarySync - Professional Dutch Payroll Management</p>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Welcome to SalarySync!</h2>
                
                <p>Hello ${user.name || 'there'},</p>
                
                <p>Thank you for creating your SalarySync account! To complete your registration and start managing your Dutch payroll, please verify your email address.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationUrl}" 
                     style="background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Verify My Email
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${verificationUrl}" style="color: #4F46E5; word-break: break-all;">${verificationUrl}</a>
                </p>
                
                <div style="background: #e8f4fd; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #0c5460;">
                    🎯 <strong>What's Next:</strong> After verification, you'll be able to:
                  </p>
                  <ul style="margin: 10px 0 0 20px; font-size: 14px; color: #0c5460;">
                    <li>Set up your company information</li>
                    <li>Start your 14-day free trial</li>
                    <li>Add employees and manage payroll</li>
                    <li>Access all Dutch compliance features</li>
                  </ul>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #999; text-align: center;">
                  This email was sent by SalarySync. If you didn't create an account, you can safely ignore this email.
                </p>
              </div>
            </body>
            </html>
          `,
          text: `
            Welcome to SalarySync!
            
            Hello ${user.name || 'there'},
            
            Thank you for creating your SalarySync account! To complete your registration and start managing your Dutch payroll, please verify your email address.
            
            Click the following link to verify your email:
            ${verificationUrl}
            
            What's Next:
            - Set up your company information
            - Start your 14-day free trial
            - Add employees and manage payroll
            - Access all Dutch compliance features
            
            If you didn't create an account, you can safely ignore this email.
            
            Best regards,
            The SalarySync Team
          `
        })
      })

      if (!emailResponse.ok) {
        console.error("Failed to send verification email:", await emailResponse.text())
        return NextResponse.json(
          { error: "Failed to send verification email" },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { message: "If an account with that email exists and is unverified, we've sent a verification link" },
        { status: 200 }
      )

    } catch (emailError) {
      console.error("Email sending error:", emailError)
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

