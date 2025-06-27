import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all companies the user has access to
    const userCompanies = await prisma.userCompany.findMany({
      where: {
        userId: session.user.id,
        isActive: true
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
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Format the response
    const companies = userCompanies.map(uc => ({
      id: uc.company.id,
      name: uc.company.name,
      role: uc.role,
      isActive: uc.isActive,
      industry: uc.company.industry,
      employeeCount: uc.company.employeeCount
    }))

    // Get current company from session or default to first company
    const currentCompanyId = session.user.companyId || companies[0]?.id
    const currentCompany = companies.find(c => c.id === currentCompanyId) || companies[0]

    return NextResponse.json({
      companies,
      currentCompany,
      totalCompanies: companies.length
    })

  } catch (error) {
    console.error('Error fetching user companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}

