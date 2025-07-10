import { NextRequest, NextResponse } from "next/server"
import { validateAuth } from "@/lib/auth-utils"
import { payrollClient } from "@/lib/database-clients"

export async function GET(request: NextRequest) {
  try {
    const { context, error, status } = await validateAuth(request, ['admin', 'hr', 'accountant'])
    
    if (!context || error) {
      return NextResponse.json({ error }, { status })
    }

    const taxSettings = await payrollClient.taxSettings.findMany({
      where: {
        companyId: context.companyId
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
    const { context, error, status } = await validateAuth(request, ['admin', 'hr', 'accountant'])
    
    if (!context || error) {
      return NextResponse.json({ error }, { status })
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
      await payrollClient.taxSettings.updateMany({
        where: {
          companyId: context.companyId
        },
        data: {
          isActive: false
        }
      })
    }

    const taxSettings = await payrollClient.taxSettings.create({
      data: {
        companyId: context.companyId,
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

