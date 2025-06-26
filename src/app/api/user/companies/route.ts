import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/user/companies - Get all companies the user has access to
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userCompanies = await prisma.userCompany.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        company: {
          include: {
            subscription: {
              include: {
                plan: true
              }
            }
          }
        }
      },
      orderBy: {
        role: 'asc' // Owners first, then admins, etc.
      }
    })

    const companies = userCompanies.map(uc => ({
      id: uc.company.id,
      name: uc.company.name,
      role: uc.role,
      subscription: uc.company.subscription ? {
        status: uc.company.subscription.status,
        plan: {
          name: uc.company.subscription.plan.name,
          features: uc.company.subscription.plan.features
        }
      } : null,
      isCurrentCompany: uc.companyId === session.user.companyId
    }))

    return NextResponse.json({
      success: true,
      companies
    })
  } catch (error) {
    console.error("Error fetching user companies:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/user/companies/switch - Switch to a different company
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { companyId } = await request.json()

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 })
    }

    // Verify user has access to this company
    const userCompany = await prisma.userCompany.findFirst({
      where: {
        userId: session.user.id,
        companyId: companyId,
        isActive: true
      },
      include: {
        company: {
          include: {
            subscription: {
              include: {
                plan: true
              }
            }
          }
        }
      }
    })

    if (!userCompany) {
      return NextResponse.json({ error: "Access denied to this company" }, { status: 403 })
    }

    // Update user's current company (legacy field for backward compatibility)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { companyId: companyId }
    })

    return NextResponse.json({
      success: true,
      company: {
        id: userCompany.company.id,
        name: userCompany.company.name,
        role: userCompany.role,
        subscription: userCompany.company.subscription
      },
      message: `Switched to ${userCompany.company.name}`
    })
  } catch (error) {
    console.error("Error switching company:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

