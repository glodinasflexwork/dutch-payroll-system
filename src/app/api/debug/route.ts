import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    
    // Test specific user
    const user = await prisma.user.findUnique({
      where: {
        email: 'cihatkaya@glodinas.nl'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
        password: true
      }
    })
    
    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        userCount
      },
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
        hasPassword: !!user.password
      } : null,
      environment: {
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        DATABASE_URL: !!process.env.DATABASE_URL
      }
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      environment: {
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        DATABASE_URL: !!process.env.DATABASE_URL
      }
    }, { status: 500 })
  }
}

