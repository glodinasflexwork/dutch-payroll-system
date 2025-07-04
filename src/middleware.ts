import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Only apply middleware to API routes and dashboard pages
  if (!request.nextUrl.pathname.startsWith('/api/') && 
      !request.nextUrl.pathname.startsWith('/dashboard/')) {
    return NextResponse.next()
  }

  // Skip middleware for auth-related endpoints
  if (request.nextUrl.pathname.startsWith('/api/auth/') ||
      request.nextUrl.pathname.startsWith('/api/user/companies') ||
      request.nextUrl.pathname.startsWith('/api/companies/switch')) {
    return NextResponse.next()
  }

  try {
    const token = await getToken({ req: request })
    
    if (!token) {
      // Redirect to login for dashboard pages
      if (request.nextUrl.pathname.startsWith('/dashboard/')) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }
      
      // Return 401 for API routes
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get current company from session or headers
    const currentCompanyId = request.headers.get('x-company-id') || 
                            request.cookies.get('current-company-id')?.value ||
                            token.companyId

    // Clone the request headers and add company context
    const requestHeaders = new Headers(request.headers)
    
    if (currentCompanyId) {
      requestHeaders.set('x-company-id', currentCompanyId)
      requestHeaders.set('x-user-id', token.sub || '')
    }

    // Create response with updated headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    // Set company ID in cookie for persistence
    if (currentCompanyId) {
      response.cookies.set('current-company-id', currentCompanyId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })
    }

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    
    // For dashboard pages, redirect to login
    if (request.nextUrl.pathname.startsWith('/dashboard/')) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    
    // For API routes, return error
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}

