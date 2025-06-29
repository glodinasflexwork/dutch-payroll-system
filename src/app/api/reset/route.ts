import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// This is a temporary reset endpoint for development
export async function POST(request: NextRequest) {
  try {
    console.log("Reset API called")
    
    // For security, only allow this in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not allowed in production" }, { status: 403 })
    }

    const { email, password, name, companyName } = await request.json()
    
    if (!email || !password || !name || !companyName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Resetting user:", email)

    // Delete existing user and related data
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    })

    if (existingUser) {
      console.log("Found existing user, deleting...")
      
      // Delete related data in the correct order to avoid foreign key constraints
      if (existingUser.companyId) {
        // Delete payroll records first
        await prisma.payrollRecord.deleteMany({
          where: { companyId: existingUser.companyId }
        })
        
        // Delete employees
        await prisma.employee.deleteMany({
          where: { companyId: existingUser.companyId }
        })
        
        // Delete tax settings
        await prisma.taxSettings.deleteMany({
          where: { companyId: existingUser.companyId }
        })
        
        // Now delete the company
        await prisma.company.delete({
          where: { id: existingUser.companyId }
        })
      }
      
      // Delete user
      await prisma.user.delete({
        where: { id: existingUser.id }
      })
    }

    // Create new company
    console.log("Creating new company...")
    const company = await prisma.company.create({
      data: {
        name: companyName,
        country: "Netherlands",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    console.log("Creating new user...")
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        companyId: company.id,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Create default tax settings
    console.log("Creating default tax settings...")
    await prisma.taxSettings.create({
      data: {
        taxYear: 2025,
        incomeTaxRate1: 36.93,
        incomeTaxRate2: 49.50,
        incomeTaxBracket1Max: 75518,
        aowRate: 17.90,
        wlzRate: 9.65,
        wwRate: 2.70,
        wiaRate: 0.60,
        holidayAllowanceRate: 8.0,
        minimumWage: 12.83,
        isActive: true,
        companyId: company.id
      }
    })

    console.log("Reset completed successfully")
    return NextResponse.json({
      success: true,
      message: "Account reset successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        companyId: user.companyId
      }
    })

  } catch (error) {
    console.error("Reset error:", error)
    return NextResponse.json(
      { error: "Reset failed", details: error.message },
      { status: 500 }
    )
  }
}

