import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for tax settings
const taxSettingsSchema = z.object({
  taxYear: z.number().int().min(2020).max(2030),
  incomeTaxRate1: z.number().min(0).max(100, "Tax rate cannot exceed 100%"),
  incomeTaxRate2: z.number().min(0).max(100, "Tax rate cannot exceed 100%"),
  incomeTaxBracket1Max: z.number().positive("Tax bracket must be positive"),
  aowRate: z.number().min(0).max(100, "AOW rate cannot exceed 100%"),
  wlzRate: z.number().min(0).max(100, "WLZ rate cannot exceed 100%"),
  wwRate: z.number().min(0).max(100, "WW rate cannot exceed 100%"),
  wiaRate: z.number().min(0).max(100, "WIA rate cannot exceed 100%"),
  aowMaxBase: z.number().positive("AOW max base must be positive"),
  wlzMaxBase: z.number().positive("WLZ max base must be positive"),
  wwMaxBase: z.number().positive("WW max base must be positive"),
  wiaMaxBase: z.number().positive("WIA max base must be positive"),
  holidayAllowanceRate: z.number().min(0).max(100, "Holiday allowance rate cannot exceed 100%"),
  minimumWage: z.number().positive("Minimum wage must be positive"),
  isActive: z.boolean().default(true)
})

// GET /api/tax-settings - Get tax settings for the user's company
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const taxYear = searchParams.get('taxYear')

    let whereClause: any = {
      companyId: session.user.companyId
    }

    if (taxYear) {
      whereClause.taxYear = parseInt(taxYear)
    }

    const taxSettings = await prisma.taxSettings.findMany({
      where: whereClause,
      orderBy: {
        taxYear: 'desc'
      }
    })

    return NextResponse.json(taxSettings)
  } catch (error) {
    console.error("Error fetching tax settings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/tax-settings - Create new tax settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the request body
    const validatedData = taxSettingsSchema.parse(body)

    // Check if tax settings already exist for this year
    const existingSettings = await prisma.taxSettings.findFirst({
      where: {
        companyId: session.user.companyId,
        taxYear: validatedData.taxYear
      }
    })

    if (existingSettings) {
      return NextResponse.json(
        { error: "Tax settings already exist for this year" },
        { status: 400 }
      )
    }

    // If this is set as active, deactivate other settings
    if (validatedData.isActive) {
      await prisma.taxSettings.updateMany({
        where: {
          companyId: session.user.companyId,
          isActive: true
        },
        data: {
          isActive: false
        }
      })
    }

    // Create the tax settings
    const taxSettings = await prisma.taxSettings.create({
      data: {
        ...validatedData,
        companyId: session.user.companyId
      }
    })

    return NextResponse.json(taxSettings, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating tax settings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/tax-settings - Update existing tax settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: "Tax settings ID is required" }, { status: 400 })
    }

    // Validate the update data
    const validatedData = taxSettingsSchema.partial().parse(updateData)

    // Check if tax settings exist and belong to the user's company
    const existingSettings = await prisma.taxSettings.findFirst({
      where: {
        id: id,
        companyId: session.user.companyId
      }
    })

    if (!existingSettings) {
      return NextResponse.json({ error: "Tax settings not found" }, { status: 404 })
    }

    // If this is being set as active, deactivate other settings
    if (validatedData.isActive) {
      await prisma.taxSettings.updateMany({
        where: {
          companyId: session.user.companyId,
          isActive: true,
          id: { not: id }
        },
        data: {
          isActive: false
        }
      })
    }

    // Update the tax settings
    const updatedTaxSettings = await prisma.taxSettings.update({
      where: { id: id },
      data: validatedData
    })

    return NextResponse.json(updatedTaxSettings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating tax settings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

