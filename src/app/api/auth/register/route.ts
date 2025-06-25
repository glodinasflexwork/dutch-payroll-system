import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

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

    // Create company and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: companyName,
          address: companyAddress || "",
          city: companyCity || "",
          postalCode: companyPostalCode || "",
          kvkNumber: kvkNumber || "",
          country: "Netherlands"
        }
      })

      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "admin",
          companyId: company.id
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
          isActive: true
        }
      })

      return { user, company }
    })

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        companyId: result.user.companyId
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

