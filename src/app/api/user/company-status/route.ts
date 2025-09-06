import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAuthClient } from '@/lib/database-clients'

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Checking company status for user:', session.user.email)

    // Check if user has any companies
    const authClient = await getAuthClient()
    const user = await authClient.user.findUnique({
      where: {
        email: session.user.email
      },
      include: {
        UserCompany: {
          include: {
            Company: true
          }
        }
      }
    })

    console.log('User found:', !!user)
    console.log('User companies count:', user?.UserCompany?.length || 0)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const hasCompany = user.UserCompany.length > 0
    const companies = user.UserCompany.map(uc => ({
      id: uc.Company.id,
      name: uc.Company.name,
      role: uc.role,
      createdAt: uc.createdAt
    }))

    console.log('Company status result:', { hasCompany, companiesCount: companies.length })

    return NextResponse.json({
      hasCompany,
      companies,
      primaryCompany: companies[0] || null
    })

  } catch (error) {
    console.error('Error checking user company status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

