import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { authClient } from "@/lib/database-clients"
import { initializeHRDatabase } from "@/lib/lazy-initialization"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user already has a company
    const existingUserCompany = await authClient.userCompany.findFirst({
      where: { userId: session.user.id }
    })

    if (existingUserCompany) {
      return NextResponse.json(
        { error: "User already has a company" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { name, address, city, postalCode, kvkNumber, industry, isDGA } = body

    // Validate required fields
    if (!name || !industry) {
      return NextResponse.json(
        { error: "Company name and industry are required" },
        { status: 400 }
      )
    }

    // Validate KvK number format if provided
    if (kvkNumber && !/^\d{8}$/.test(kvkNumber)) {
      return NextResponse.json(
        { error: "KvK number must be 8 digits" },
        { status: 400 }
      )
    }

    // Validate postal code format if provided
    if (postalCode && !/^\d{4}[A-Z]{2}$/.test(postalCode)) {
      return NextResponse.json(
        { error: "Invalid Dutch postal code format" },
        { status: 400 }
      )
    }

    // Create company and user-company relationship in a transaction
    const result = await authClient.$transaction(async (tx) => {
      // Create the company
      const company = await tx.company.create({
        data: {
          name: name.trim(),
          address: address?.trim() || null,
          city: city?.trim() || null,
          postalCode: postalCode || null,
          kvkNumber: kvkNumber || null,
          industry: industry
          // Note: isDGA field doesn't exist in schema - removed
        }
      })

      // Create user-company relationship
      const userCompany = await tx.userCompany.create({
        data: {
          userId: session.user.id,
          companyId: company.id,
          role: "owner",
          isActive: true
        }
      })

      // CRITICAL FIX: Update user's companyId to link them to the new company
      await tx.user.update({
        where: { id: session.user.id },
        data: { companyId: company.id }
      })

      // Get the trial plan
      const trialPlan = await tx.plan.findFirst({
        where: { 
          name: "Free Trial",
          isActive: true 
        }
      })

      if (!trialPlan) {
        throw new Error("Trial plan not found")
      }

      // Start trial subscription
      const subscription = await tx.subscription.create({
        data: {
          companyId: company.id,
          planId: trialPlan.id,
          status: "trialing",
          stripeSubscriptionId: null,
          stripeCustomerId: null,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          cancelAtPeriodEnd: false,
          trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          isTrialActive: true,
          trialStart: new Date(),
          trialExtensions: 0
        }
      })

      return { company, userCompany, subscription, trialPlan }
    })

    // Initialize HR database with lazy initialization
    try {
      await initializeHRDatabase(result.company.id)
      console.log(`HR database initialized successfully for company ${result.company.id}`)
    } catch (error) {
      console.error("Failed to initialize HR database:", error)
      // Don't fail the company creation if HR initialization fails
      // It will be retried when first employee is added
    }

    return NextResponse.json({
      success: true,
      company: {
        id: result.company.id,
        name: result.company.name,
        industry: result.company.industry
        // Note: isDGA field doesn't exist in schema - removed
      },
      subscription: {
        planName: result.trialPlan.name,
        status: result.subscription.status,
        trialStart: result.subscription.trialStart,
        trialEnd: result.subscription.trialEnd,
        daysRemaining: Math.ceil((result.subscription.trialEnd!.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      }
    })

  } catch (error) {
    console.error("Company creation error:", error)
    
    if (error instanceof Error) {
      // Handle specific database errors
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "A company with this information already exists" },
          { status: 409 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to create company. Please try again." },
      { status: 500 }
    )
  }
}

