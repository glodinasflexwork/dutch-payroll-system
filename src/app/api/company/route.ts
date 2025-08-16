import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { authClient } from "@/lib/database-clients"
import { 
  resolveCompanyFromSession, 
  handleCompanyResolutionError,
  universalCompanyResolver 
} from "@/lib/universal-company-resolver"

// GET /api/company - Get current user's company information using Universal Company Resolution
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "No valid session found",
        code: "ACCESS_DENIED" 
      }, { status: 401 })
    }

    console.log(`🔍 [CompanyAPI] Resolving company for user: ${session.user.id}`)

    // Use Universal Company Resolution Service
    const resolution = await resolveCompanyFromSession(session)

    if (!resolution.success) {
      console.log(`❌ [CompanyAPI] Company resolution failed:`, resolution.error)
      const errorResponse = handleCompanyResolutionError(resolution)
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    console.log(`✅ [CompanyAPI] Successfully resolved company: ${resolution.company?.name}`)

    return NextResponse.json({
      success: true,
      company: resolution.company,
      userRole: resolution.userRole,
      debug: resolution.debug
    })

  } catch (error) {
    console.error("💥 [CompanyAPI] Unexpected error:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error occurred",
      code: "INTERNAL_ERROR"
    }, { status: 500 })
  }
}

// POST /api/company - Switch to a different company (for users with multiple companies)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "No valid session found",
        code: "ACCESS_DENIED" 
      }, { status: 401 })
    }

    const { companyId } = await request.json()

    if (!companyId) {
      return NextResponse.json({
        error: "Company ID is required",
        code: "INVALID_REQUEST"
      }, { status: 400 })
    }

    console.log(`🔄 [CompanyAPI] Switching to company: ${companyId} for user: ${session.user.id}`)

    // Use Universal Company Resolution to validate the company switch
    const resolution = await universalCompanyResolver.resolveUserCompany(session.user.id, companyId)

    if (!resolution.success) {
      console.log(`❌ [CompanyAPI] Company switch failed:`, resolution.error)
      const errorResponse = handleCompanyResolutionError(resolution)
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // Update user's preferred company in session (this would typically update the JWT token)
    // For now, we'll just return the successful resolution
    console.log(`✅ [CompanyAPI] Successfully switched to company: ${resolution.company?.name}`)

    return NextResponse.json({
      success: true,
      company: resolution.company,
      userRole: resolution.userRole,
      message: `Successfully switched to ${resolution.company?.name}`
    })

  } catch (error) {
    console.error("💥 [CompanyAPI] Error switching company:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to switch company",
      code: "INTERNAL_ERROR"
    }, { status: 500 })
  }
}

// PUT /api/company - Update company information (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "No valid session found",
        code: "ACCESS_DENIED" 
      }, { status: 401 })
    }

    // First resolve the user's company and role
    const resolution = await resolveCompanyFromSession(session)

    if (!resolution.success) {
      const errorResponse = handleCompanyResolutionError(resolution)
      return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
    }

    // Check if user has admin permissions
    if (!['owner', 'admin'].includes(resolution.userRole || '')) {
      return NextResponse.json({
        error: "Insufficient permissions to update company information",
        code: "ACCESS_DENIED"
      }, { status: 403 })
    }

    const updateData = await request.json()
    const companyId = resolution.company!.id

    console.log(`🔧 [CompanyAPI] Updating company: ${companyId} by user: ${session.user.id}`)

    // Update company in auth database
    const updatedCompany = await authClient.company.update({
      where: { id: companyId },
      data: {
        name: updateData.name,
        address: updateData.address,
        city: updateData.city,
        postalCode: updateData.postalCode,
        country: updateData.country,
        taxNumber: updateData.taxNumber,
        chamberOfCommerceNumber: updateData.chamberOfCommerceNumber,
        updatedAt: new Date()
      }
    })

    console.log(`✅ [CompanyAPI] Successfully updated company: ${updatedCompany.name}`)

    return NextResponse.json({
      success: true,
      company: updatedCompany,
      message: "Company information updated successfully"
    })

  } catch (error) {
    console.error("💥 [CompanyAPI] Error updating company:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to update company information",
      code: "INTERNAL_ERROR"
    }, { status: 500 })
  }
}

