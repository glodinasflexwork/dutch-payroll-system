import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/company - Get current user's company information
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch company data
    const company = await prisma.company.findFirst({
      where: {
        id: session.user.companyId
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      company: company
    })

  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch company information"
    }, { status: 500 })
  }
}

