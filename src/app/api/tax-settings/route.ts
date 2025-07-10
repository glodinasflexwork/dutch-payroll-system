import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const taxSettings = await prisma.taxSettings.findMany({
      where: {
        companyId: session.user.companyId
      },
      orderBy: {
        taxYear: 'desc'
      }
    })

    return NextResponse.json(taxSettings)
  } catch (error) {
    console.error("Error fetching tax settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      taxYear,
      aowRate,
      wlzRate,
      wwRate,
      wiaRate,
      zvwRate,
      aowMaxBase,
      wlzMaxBase,
      wwMaxBase,
      wiaMaxBase,
      holidayAllowanceRate,
      minimumWage,
      isActive
    } = body

    // Validate required fields
    if (!taxYear || aowRate === undefined || wlzRate === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // If setting as active, deactivate other tax settings for this company
    if (isActive) {
      await prisma.taxSettings.updateMany({
        where: {
          companyId: session.user.companyId
        },
        data: {
          isActive: false
        }
      })
    }

    const taxSettings = await prisma.taxSettings.create({
      data: {
        companyId: session.user.companyId,
        taxYear,
        aowRate,
        wlzRate,
        wwRate: wwRate || 0,
        wiaRate: wiaRate || 0,
        zvwRate,
        aowMaxBase,
        wlzMaxBase,
        wwMaxBase: wwMaxBase || 0,
        wiaMaxBase: wiaMaxBase || 0,
        holidayAllowanceRate,
        minimumWage,
        isActive
      }
    })

    return NextResponse.json(taxSettings)
  } catch (error) {
    console.error("Error creating tax settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

