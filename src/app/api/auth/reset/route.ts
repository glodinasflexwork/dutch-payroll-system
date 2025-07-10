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
        { message: "If an account with that email exists, we've sent a reset link" },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetExpires = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      }
    })

    // Send reset email
    try {
      const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset/${resetToken}`
      
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
          subject: "Reset Your SalarySync Password",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset Your Password</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
                <p style="color: #f0f0f0; margin: 10px 0 0 0;">SalarySync - Professional Dutch Payroll Management</p>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
                
                <p>Hello ${user.name || 'there'},</p>
                
                <p>We received a request to reset your password for your SalarySync account. If you didn't make this request, you can safely ignore this email.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" 
                     style="background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Reset My Password
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #666;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${resetUrl}" style="color: #4F46E5; word-break: break-all;">${resetUrl}</a>
                </p>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 14px; color: #856404;">
                    ⚠️ <strong>Security Notice:</strong> This link will expire in 1 hour for your security. 
                    If you need a new link, please request another password reset.
                  </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #999; text-align: center;">
                  This email was sent by SalarySync. If you have any questions, please contact our support team.
                </p>
              </div>
            </body>
            </html>
          `,
          text: `
            Reset Your SalarySync Password
            
            Hello ${user.name || 'there'},
            
            We received a request to reset your password for your SalarySync account. If you didn't make this request, you can safely ignore this email.
            
            To reset your password, click the following link:
            ${resetUrl}
            
            This link will expire in 1 hour for your security.
            
            If you have any questions, please contact our support team.
            
            Best regards,
            The SalarySync Team
          `
        })
      })

      if (!emailResponse.ok) {
        console.error("Failed to send reset email:", await emailResponse.text())
        return NextResponse.json(
          { error: "Failed to send reset email" },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { message: "If an account with that email exists, we've sent a reset link" },
        { status: 200 }
      )

    } catch (emailError) {
      console.error("Email sending error:", emailError)
      return NextResponse.json(
        { error: "Failed to send reset email" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

