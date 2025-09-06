import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getAuthClient } from "@/lib/database-clients"
import { initializeHRDatabase } from "@/lib/lazy-initialization"

/**
 * Robust trial plan lookup with fallback logic and automatic creation
 * Handles various naming conventions and ensures trial plan availability
 */
async function findOrCreateTrialPlan(tx: any) {
  console.log('🔍 Looking for trial plan...')
  
  // Step 1: Try to find canonical "Free Trial" plan
  let trialPlan = await tx.plan.findFirst({
    where: { 
      name: "Free Trial",
      isActive: true 
    }
  })

  if (trialPlan) {
    console.log(`✅ Found canonical trial plan: ${trialPlan.id}`)
    return trialPlan
  }

  // Step 2: Try alternative trial plan names
  const alternativeNames = [
    "Trial Plan",
    "trial", 
    "Trial",
    "Free trial",
    "FREE_TRIAL",
    "14-Day Trial",
    "Starter Trial"
  ]

  for (const name of alternativeNames) {
    trialPlan = await tx.plan.findFirst({
      where: { 
        name: name,
        isActive: true 
      }
    })
    
    if (trialPlan) {
      console.log(`✅ Found trial plan with alternative name: "${name}" (${trialPlan.id})`)
      
      // Update to canonical name for consistency
      await tx.plan.update({
        where: { id: trialPlan.id },
        data: { name: "Free Trial" }
      })
      
      console.log(`🔄 Updated plan name to "Free Trial"`)
      return trialPlan
    }
  }

  // Step 3: Look for any plan with trial-like characteristics
  trialPlan = await tx.plan.findFirst({
    where: {
      AND: [
        { isActive: true },
        { price: 0 },
        {
          OR: [
            { name: { contains: 'trial', mode: 'insensitive' } },
            { name: { contains: 'free', mode: 'insensitive' } },
            { description: { contains: 'trial', mode: 'insensitive' } }
          ]
        }
      ]
    }
  })

  if (trialPlan) {
    console.log(`✅ Found trial-like plan: "${trialPlan.name}" (${trialPlan.id})`)
    
    // Update to canonical name and ensure proper configuration
    await tx.plan.update({
      where: { id: trialPlan.id },
      data: { 
        name: "Free Trial",
        description: "14-day free trial with full access to all features",
        features: [
          "employees",
          "payroll", 
          "leave_management",
          "time_tracking",
          "reporting",
          "multi_company",
          "priority_support"
        ],
        maxEmployees: 999,
        maxPayrolls: 999
      }
    })
    
    console.log(`🔄 Updated plan configuration`)
    return trialPlan
  }

  // Step 4: Create new trial plan if none exists
  console.log('📝 Creating new trial plan...')
  
  trialPlan = await tx.plan.create({
    data: {
      name: "Free Trial",
      description: "14-day free trial with full access to all features",
      price: 0,
      currency: "EUR",
      interval: "month",
      features: [
        "employees",
        "payroll", 
        "leave_management",
        "time_tracking",
        "reporting",
        "multi_company",
        "priority_support"
      ],
      maxEmployees: 999,
      maxPayrolls: 999,
      isActive: true
    }
  })

  console.log(`✅ Created new trial plan: ${trialPlan.id}`)
  return trialPlan
}

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
    const authClient = await getAuthClient()
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

      // Get the trial plan with robust fallback logic
      const trialPlan = await findOrCreateTrialPlan(tx)

      if (!trialPlan) {
        throw new Error("Unable to create or find trial plan")
      }

      // Start trial subscription with enhanced logging
      console.log(`🎯 Creating trial subscription for company: ${company.id}`)
      console.log(`📋 Trial plan details: ${trialPlan.name} (${trialPlan.id})`)
      
      const trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      
      const subscription = await tx.subscription.create({
        data: {
          companyId: company.id,
          planId: trialPlan.id,
          status: "trialing",
          stripeSubscriptionId: null,
          stripeCustomerId: null,
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEndDate,
          cancelAtPeriodEnd: false,
          trialEnd: trialEndDate,
          isTrialActive: true,
          trialStart: new Date(),
          trialExtensions: 0
        }
      })

      console.log(`🎉 Trial subscription created successfully!`)
      console.log(`📅 Trial period: ${subscription.trialStart} to ${subscription.trialEnd}`)
      console.log(`🆔 Subscription ID: ${subscription.id}`)

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

