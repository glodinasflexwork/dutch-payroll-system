import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { companyId } = await request.json()

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Verify user has access to this company
    const userCompany = await prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: session.user.id,
          companyId: companyId
        }
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            employeeCount: true
          }
        }
      }
    })

    if (!userCompany || !userCompany.isActive) {
      return NextResponse.json({ error: 'Access denied to this company' }, { status: 403 })
    }

    // Update user's current company in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { companyId: companyId }
    })
    
    const company = {
      id: userCompany.company.id,
      name: userCompany.company.name,
      role: userCompany.role,
      isActive: userCompany.isActive,
      industry: userCompany.company.industry,
      employeeCount: userCompany.company.employeeCount
    }

    return NextResponse.json({
      success: true,
      company,
      message: `Switched to ${company.name}`,
      // Signal to client to update session
      updateSession: true,
      sessionData: {
        companyId: companyId,
        role: userCompany.role,
        company: {
          id: userCompany.company.id,
          name: userCompany.company.name
        }
      }
    })

  } catch (error) {
    console.error('Error switching company:', error)
    return NextResponse.json(
      { error: 'Failed to switch company' },
      { status: 500 }
    )
  }
}

