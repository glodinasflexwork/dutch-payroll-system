import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Define public pages that should be accessible to everyone
  const publicPages = [
    '/features',
    '/pricing', 
    '/about',
    '/contact',
    '/solutions',
    '/privacy',
    '/terms',
    '/auth/signin',
    '/auth/signup',
    '/auth/signout'
  ]
  
  // Check if current path is a public page
  const isPublicPage = publicPages.some(page => 
    request.nextUrl.pathname.startsWith(page)
  )
  
  // Allow access to public pages without authentication checks
  if (isPublicPage) {
    return NextResponse.next()
  }

  // Only apply middleware to API routes and dashboard pages
  if (!request.nextUrl.pathname.startsWith('/api/') && 
      !request.nextUrl.pathname.startsWith('/dashboard') &&
      !request.nextUrl.pathname.startsWith('/setup/')) {
    return NextResponse.next()
  }

  // Skip middleware for auth-related endpoints but NOT company setup
  if (request.nextUrl.pathname.startsWith('/api/auth/') ||
      request.nextUrl.pathname.startsWith('/api/user/companies') ||
      request.nextUrl.pathname.startsWith('/api/companies/') ||
      request.nextUrl.pathname.startsWith('/api/kvk/') ||
      request.nextUrl.pathname.startsWith('/api/daily-background') ||
      request.nextUrl.pathname.startsWith('/api/employee-portal-demo') ||
      request.nextUrl.pathname.startsWith('/api/test-payroll') ||
      request.nextUrl.pathname.startsWith('/api/analytics')) {
    return NextResponse.next()
  }

  try {
    const token = await getToken({ req: request })
    
    if (!token) {
      // Redirect to login for dashboard and setup pages
      if (request.nextUrl.pathname.startsWith('/dashboard') ||
          request.nextUrl.pathname.startsWith('/setup/')) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }
      
      // Return 401 for API routes
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // OPTIMIZED: Use company info from token (cached during login) instead of database queries
    const hasCompany = token.hasCompany as boolean
    const companyId = token.companyId as string

    // Debug logging for company setup issues
    if (request.nextUrl.pathname.startsWith('/dashboard') || 
        request.nextUrl.pathname.startsWith('/setup/')) {
      console.log('Middleware company check:', {
        path: request.nextUrl.pathname,
        userId: token.sub,
        hasCompany,
        companyId,
        tokenKeys: Object.keys(token)
      })
    }

    // Check if user has a company for dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!hasCompany || !companyId) {
        console.log('Redirecting to company setup - no company found in token')
        // Redirect to company setup if user doesn't have a company
        return NextResponse.redirect(new URL('/setup/company', request.url))
      }
    }

    // Prevent redirect loops for company setup page
    if (request.nextUrl.pathname.startsWith('/setup/company')) {
      if (hasCompany && companyId) {
        console.log('User has company, redirecting from setup to dashboard')
        // User already has a company, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Get current company from session, headers, or cookies (in that order)
    const currentCompanyId = request.headers.get('x-company-id') || 
                            request.cookies.get('current-company-id')?.value ||
                            companyId

    // Clone the request headers and add company context
    const requestHeaders = new Headers(request.headers)
    
    if (currentCompanyId) {
      requestHeaders.set('x-company-id', currentCompanyId)
      requestHeaders.set('x-user-id', token.sub || '')
      
      // OPTIMIZED: Add company info from session to avoid database lookups
      if (token.companyName) {
        requestHeaders.set('x-company-name', token.companyName as string)
      }
      if (token.companyRole) {
        requestHeaders.set('x-company-role', token.companyRole as string)
      }
    }

    // Create response with updated headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    // Set company ID in cookie for persistence (only if different)
    if (currentCompanyId && currentCompanyId !== request.cookies.get('current-company-id')?.value) {
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
    
    // For dashboard and setup pages, redirect to login
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/setup/')) {
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

