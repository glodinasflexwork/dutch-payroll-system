import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createTrial } from "@/lib/trial"
import { EmailService } from "@/lib/email-service"
import { generateVerificationToken } from "@/app/api/auth/verify-email/route"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, companyName, companyAddress, companyCity, companyPostalCode, kvkNumber } = await request.json()

    // Validate required fields
    if (!name || !email || !password || !companyName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create company, user, and trial in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Creat      // Create company first
      const company = await tx.company.create({
        data: {
          name: companyName,
          address: companyAddress || undefined,
          city: city || undefined,
          postalCode: postalCode || undefined,
          kvkNumber: kvkNumber || undefined
        }
      })    })

      // Create user (not verified yet) - no global role, only company-specific roles
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          companyId: company.id, // Legacy field for backward compatibility
          emailVerified: null // Not verified yet
        }
      })

      // Create UserCompany relationship for multi-company support
      await tx.userCompany.create({
        data: {
          userId: user.id,
          companyId: company.id,
          role: "owner" // First user is always the owner
        }
      })

      // Create default tax settings for the company
      await tx.taxSettings.create({
        data: {
          companyId: company.id,
          taxYear: new Date().getFullYear(),
          incomeTaxRate1: 36.93,
          incomeTaxRate2: 49.50,
          incomeTaxBracket1Max: 75518,
          aowRate: 17.90,
          wlzRate: 9.65,
          wwRate: 2.70,
          wiaRate: 0.60,
          aowMaxBase: 40000,
          wlzMaxBase: 40000,
          wwMaxBase: 69000,
          wiaMaxBase: 69000,
          holidayAllowanceRate: 8.0,
          minimumWage: 12.83,
          isActive: true,
          updatedAt: new Date()
        }
      })

      return { user, company }
    })

    // Create 14-day trial for the new company (outside transaction to avoid conflicts)
    try {
      await createTrial(result.company.id)
    } catch (trialError) {
      console.error("Error creating trial:", trialError)
      // Don't fail registration if trial creation fails
    }

    // Generate verification token and send email
    try {
      const verificationToken = await generateVerificationToken(email)
      const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin
      
      await EmailService.sendVerificationEmail(email, verificationToken, baseUrl)
    } catch (emailError) {
      console.error("Error sending verification email:", emailError)
      // Don't fail registration if email sending fails
    }

    return NextResponse.json({
      message: "Registration successful! Please check your email to verify your account.",
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        companyId: result.user.companyId,
        emailVerified: false
      },
      trial: {
        active: true,
        daysRemaining: 14,
        message: "Your 14-day free trial will start after email verification!"
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

