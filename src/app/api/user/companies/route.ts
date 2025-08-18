import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { authClient, hrClient } from '@/lib/database-clients'

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

    // Deduplicate companies by ID (in case user has multiple roles for same company)
    // Keep the one with the highest role priority (owner > admin > hr_manager > manager > accountant)
    const roleHierarchy = {
      'owner': 5,
      'admin': 4,
      'hr_manager': 3,
      'manager': 2,
      'accountant': 1
    }

    const uniqueCompanies = companies.reduce((acc, company) => {
      const existingCompany = acc.find(c => c.id === company.id)
      
      if (!existingCompany) {
        // First occurrence of this company
        acc.push(company)
      } else {
        // Company already exists, keep the one with higher role priority
        const currentRolePriority = roleHierarchy[company.role.toLowerCase() as keyof typeof roleHierarchy] || 0
        const existingRolePriority = roleHierarchy[existingCompany.role.toLowerCase() as keyof typeof roleHierarchy] || 0
        
        if (currentRolePriority > existingRolePriority) {
          // Replace with higher priority role
          const index = acc.findIndex(c => c.id === company.id)
          acc[index] = company
        }
      }
      
      return acc
    }, [] as typeof companies)

    // Handle companies with duplicate names by adding distinguishing suffixes
    const companiesWithUniqueNames = uniqueCompanies.map((company, index, array) => {
      // Find all companies with the same name
      const companiesWithSameName = array.filter(c => c.name === company.name)
      
      if (companiesWithSameName.length > 1) {
        // Multiple companies with same name - add distinguishing suffix
        const companyIndex = companiesWithSameName.findIndex(c => c.id === company.id)
        const suffix = companyIndex === 0 ? '' : ` (${companyIndex + 1})`
        
        return {
          ...company,
          displayName: `${company.name}${suffix}`,
          originalName: company.name
        }
      }
      
      return {
        ...company,
        displayName: company.name,
        originalName: company.name
      }
    })

    // Always fetch current company from database, not from session
    // This ensures we get the latest company selection after switching
    const user = await authClient.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true }
    })

    const currentCompanyId = user?.companyId || companiesWithUniqueNames[0]?.id
    const currentCompany = companiesWithUniqueNames.find(c => c.id === currentCompanyId) || companiesWithUniqueNames[0]

    // Mark the current company
    companiesWithUniqueNames.forEach(company => {
      company.isCurrentCompany = company.id === currentCompanyId
    })

    return NextResponse.json({
      companies: companiesWithUniqueNames,
      currentCompany,
      totalCompanies: companiesWithUniqueNames.length
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

