import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('=== SESSION DEBUG ===')
    
    const session = await getServerSession(authOptions)
    console.log('Session:', JSON.stringify(session, null, 2))
    
    if (!session) {
      console.log('No session found')
      return NextResponse.json({ 
        error: 'No session',
        session: null,
        timestamp: new Date().toISOString()
      }, { status: 401 })
    }

    if (!session.user?.id) {
      console.log('Session exists but no user ID')
      return NextResponse.json({ 
        error: 'No user ID in session',
        session: session,
        timestamp: new Date().toISOString()
      }, { status: 401 })
    }

    console.log('Session is valid, user ID:', session.user.id)
    
    return NextResponse.json({
      success: true,
      session: session,
      userId: session.user.id,
      companyId: session.user.companyId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Session debug error:', error)
    return NextResponse.json(
      { 
        error: 'Session debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

