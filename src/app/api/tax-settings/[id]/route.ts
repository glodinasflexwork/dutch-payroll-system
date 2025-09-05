import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { } from "@/lib/database-clients"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if the tax settings belongs to the user's company
    const existingSettings = await getPayrollClient().taxSettings.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId
      }
    })

    if (!existingSettings) {
      return NextResponse.json({ error: "Tax settings not found" }, { status: 404 })
    }

    // If setting as active, deactivate other tax settings for this company
    if (isActive) {
      await getPayrollClient().taxSettings.updateMany({
        where: {
          companyId: session.user.companyId,
          id: { not: params.id }
        },
        data: {
          isActive: false
        }
      })
    }

    const updatedSettings = await getPayrollClient().taxSettings.update({
      where: {
        id: params.id
      },
      data: {
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

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error("Error updating tax settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the tax settings belongs to the user's company
    const existingSettings = await getPayrollClient().taxSettings.findFirst({
      where: {
        id: params.id,
        companyId: session.user.companyId
      }
    })

    if (!existingSettings) {
      return NextResponse.json({ error: "Tax settings not found" }, { status: 404 })
    }

    await getPayrollClient().taxSettings.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: "Tax settings deleted successfully" })
  } catch (error) {
    console.error("Error deleting tax settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

