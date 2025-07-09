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

    const {
      name,
      address,
      city,
      postalCode,
      country = 'Netherlands',
      phone,
      email,
      website,
      kvkNumber,
      taxNumber,
      vatNumber,
      industry,
      description
    } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    // Create the company
    const company = await prisma.company.create({
      data: {
        name,
        address,
        city,
        postalCode,
        country,
        phone,
        email,
        website,
        kvkNumber,
        taxNumber,
        vatNumber,
        industry,
        description,
        employeeCount: 0
      }
    })

    // Add the user as owner of the company
    await prisma.userCompany.create({
      data: {
        userId: session.user.id,
        companyId: company.id,
        role: 'owner',
        isActive: true
      }
    })

    // Create default tenant configuration
    await prisma.tenantConfig.create({
      data: {
        companyId: company.id,
        settings: {
          currency: 'EUR',
          language: 'nl',
          timezone: 'Europe/Amsterdam',
          dateFormat: 'DD/MM/YYYY'
        },
        features: [
          'payroll',
          'employees',
          'leave_management',
          'time_tracking',
          'reports'
        ],
        limits: {
          maxEmployees: 10,
          maxPayrolls: 12
        }
      }
    })

    return NextResponse.json({
      success: true,
      Company: {
        id: company.id,
        name: company.name,
        role: 'owner',
        isActive: true,
        industry: company.industry,
        employeeCount: company.employeeCount
      },
      message: `Company "${name}" created successfully`
    })

  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}

