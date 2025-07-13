import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has any companies
    const user = await prisma.user.findUnique({
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
  } finally {
    await prisma.$disconnect()
  }
}

