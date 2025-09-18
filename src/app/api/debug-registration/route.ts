import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { getAuthClient, getHRClient } from "@/lib/database-clients"

export async function POST(request: NextRequest) {
  try {
    console.log("=== DEBUG REGISTRATION API CALLED ===")
    
    // Use the exact data from the user's screenshot
    const data = {
      name: "Cihat Kaya",
      email: "cihatkaya@glodinas.nl",
      password: "TestPassword123!",
      companyName: "Glodinas Finance",
      kvkNumber: "12345678",
      industry: "Healthcare",
      businessAddress: "De Dreef",
      city: "The Hague",
      postalCode: "2542ND",
      country: "Netherlands"
    }

    console.log("Using test data:", { 
      name: data.name, 
      email: data.email, 
      companyName: data.companyName,
      kvkNumber: data.kvkNumber 
    })

    // Get database clients
    console.log("Getting database clients...")
    const authClient = await getAuthClient()
    const hrClient = await getHRClient()
    console.log("✅ Database clients obtained")

    // Check if user already exists
    console.log("Checking if user exists...")
    const existingUser = await authClient.user.findUnique({
      where: { email: data.email.toLowerCase() }
    })

    if (existingUser) {
      console.log("User already exists:", data.email)
      return NextResponse.json({
        error: "User already exists",
        debug: "This is expected if you've tried registration before"
      }, { status: 400 })
    }
    console.log("✅ No existing user found")

    // Check if KvK number already exists
    console.log("Checking if KvK number exists...")
    const existingCompany = await authClient.company.findUnique({
      where: { kvkNumber: data.kvkNumber }
    })

    if (existingCompany) {
      console.log("KvK number already exists:", data.kvkNumber)
      return NextResponse.json({
        error: "Company with this KvK number already exists",
        debug: "This is expected if you've tried registration before"
      }, { status: 400 })
    }
    console.log("✅ No existing company found")

    // Hash password
    console.log("Hashing password...")
    const hashedPassword = await bcrypt.hash(data.password, 12)
    console.log("✅ Password hashed")

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    console.log("✅ Verification token generated")

    // Test Auth transaction
    console.log("Testing Auth database transaction...")
    const result = await authClient.$transaction(async (authTx) => {
      console.log("Creating user...")
      const user = await authTx.user.create({
        data: {
          name: data.name.trim(),
          email: data.email.toLowerCase(),
          password: hashedPassword,
          emailVerified: null,
          emailVerificationToken: verificationToken
        }
      })
      console.log("✅ User created with ID:", user.id)

      console.log("Creating company in Auth DB...")
      const authCompany = await authTx.company.create({
        data: {
          name: data.companyName.trim(),
          kvkNumber: data.kvkNumber,
          industry: data.industry
        }
      })
      console.log("✅ Company created in Auth DB with ID:", authCompany.id)

      console.log("Creating user-company relationship...")
      await authTx.userCompany.create({
        data: {
          userId: user.id,
          companyId: authCompany.id,
          role: "owner",
          isActive: true
        }
      })
      console.log("✅ User-company relationship created")

      console.log("Setting user's default company...")
      await authTx.user.update({
        where: { id: user.id },
        data: { companyId: authCompany.id }
      })
      console.log("✅ User's default company set")

      return { user, company: authCompany }
    })

    console.log("✅ Auth transaction completed successfully")

    // Test HR database creation
    console.log("Creating company in HR DB...")
    await hrClient.company.create({
      data: {
        id: result.company.id,
        name: data.companyName.trim(),
        kvkNumber: data.kvkNumber,
        industry: data.industry,
        address: data.businessAddress.trim(),
        city: data.city.trim(),
        postalCode: data.postalCode.trim().toUpperCase(),
        country: data.country || 'Netherlands'
      }
    })
    console.log("✅ Company created in HR DB successfully")

    // Check for trial subscription plan
    console.log("Checking for trial subscription plan...")
    const trialPlan = await authClient.subscriptionPlan.findFirst({
      where: { name: "Trial" }
    })

    if (trialPlan) {
      console.log("✅ Trial plan found, creating subscription...")
      await authClient.subscription.create({
        data: {
          companyId: result.company.id,
          planId: trialPlan.id,
          status: "trialing",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      })
      console.log("✅ Trial subscription created")
    } else {
      console.log("⚠️ No trial plan found, skipping subscription creation")
    }

    console.log("✅ DEBUG REGISTRATION COMPLETED SUCCESSFULLY")
    return NextResponse.json({
      success: true,
      message: "Debug registration completed successfully!",
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email
      },
      company: {
        id: result.company.id,
        name: result.company.name,
        kvkNumber: result.company.kvkNumber
      },
      debug: {
        trialPlanExists: !!trialPlan,
        verificationToken: verificationToken
      }
    })

  } catch (error) {
    console.error("❌ DEBUG REGISTRATION FAILED:", error)
    return NextResponse.json({
      error: "Debug registration failed",
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code
    }, { status: 500 })
  }
}
