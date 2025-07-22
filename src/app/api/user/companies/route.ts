import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { authClient } from '@/lib/database-clients'
import { PrismaClient as HRPrismaClient } from '@prisma/hr-client'

const hrClient = new HRPrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all companies the user has access to
    const userCompanies = await authClient.userCompany.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        Company: {
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

    // Get real-time employee counts from HR database
    const companyIds = userCompanies.map(uc => uc.Company.id)
    const employeeCounts = await hrClient.employee.groupBy({
      by: ['companyId'],
      where: {
        companyId: { in: companyIds },
        isActive: true
      },
      _count: {
        id: true
      }
    })

    // Create a map of company ID to employee count
    const employeeCountMap = employeeCounts.reduce((acc, item) => {
      acc[item.companyId] = item._count.id
      return acc
    }, {} as Record<string, number>)

    // Format the response with real-time employee counts
    const companies = userCompanies.map(uc => ({
      id: uc.Company.id,
      name: uc.Company.name,
      role: uc.role,
      isActive: uc.isActive,
      industry: uc.Company.industry,
      employeeCount: employeeCountMap[uc.Company.id] || 0, // Use real-time count
      isCurrentCompany: false // Will be set below
    }))

    // Always fetch current company from database, not from session
    // This ensures we get the latest company selection after switching
    const user = await authClient.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true }
    })

    const currentCompanyId = user?.companyId || companies[0]?.id
    const currentCompany = companies.find(c => c.id === currentCompanyId) || companies[0]

    // Mark the current company
    companies.forEach(company => {
      company.isCurrentCompany = company.id === currentCompanyId
    })

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
  } finally {
    await hrClient.$disconnect()
  }
}

