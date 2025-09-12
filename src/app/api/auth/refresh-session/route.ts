import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getAuthClient } from "@/lib/database-clients"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    console.log('🔄 Force refreshing session for user:', session.user.id)

    // Get fresh user data from database
    const authClient = await getAuthClient()
    const userWithCompany = await authClient.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true,
        email: true,
        name: true,
        companyId: true,
        Company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!userWithCompany) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    let companyInfo = null
    if (userWithCompany.companyId) {
      // Get user's role in the company
      const userCompany = await authClient.userCompany.findUnique({
        where: {
          userId_companyId: {
            userId: session.user.id,
            companyId: userWithCompany.companyId
          }
        },
        include: {
          Company: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      if (userCompany && userCompany.isActive) {
        companyInfo = {
          id: userCompany.Company.id,
          name: userCompany.Company.name,
          role: userCompany.role,
          hasCompany: true
        }
      }
    }

    // If no direct company, check for any companies
    if (!companyInfo) {
      const firstUserCompany = await authClient.userCompany.findFirst({
        where: {
          userId: session.user.id,
          isActive: true
        },
        include: {
          Company: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      if (firstUserCompany) {
        // Update user's companyId
        await authClient.user.update({
          where: { id: session.user.id },
          data: { companyId: firstUserCompany.Company.id }
        })

        companyInfo = {
          id: firstUserCompany.Company.id,
          name: firstUserCompany.Company.name,
          role: firstUserCompany.role,
          hasCompany: true
        }
      }
    }

    console.log('✅ Fresh company info:', companyInfo)

    return NextResponse.json({
      success: true,
      user: {
        id: userWithCompany.id,
        email: userWithCompany.email,
        name: userWithCompany.name
      },
      company: companyInfo,
      message: "Session refreshed successfully"
    })

  } catch (error) {
    console.error("Session refresh error:", error)
    return NextResponse.json(
      { error: "Failed to refresh session" },
      { status: 500 }
    )
  }
}

