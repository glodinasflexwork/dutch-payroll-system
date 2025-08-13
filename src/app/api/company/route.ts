import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { authClient, hrClient } from "@/lib/database-clients"

// GET /api/company - Get current user's company information
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Looking for company with ID:", session.user.companyId)

    // First try auth database
    let company = await authClient.company.findFirst({
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

    console.log("Company from auth database:", company)

    // If not found in auth database, try HR database
    if (!company) {
      console.log("Company not found in auth database, checking HR database...")
      company = await hrClient.company.findFirst({
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
      console.log("Company from HR database:", company)
    }

    if (!company) {
      console.error("Company not found in either database for ID:", session.user.companyId)
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

