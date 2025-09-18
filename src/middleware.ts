import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  console.log('=== MIDDLEWARE START ===')
  console.log('Path:', request.nextUrl.pathname)
  console.log('Method:', request.method)
  
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
  
  console.log('Is public page:', isPublicPage)
  
  // Allow access to public pages without authentication checks
  if (isPublicPage) {
    console.log('=== MIDDLEWARE END (public page) ===')
    return NextResponse.next()
  }

  // Only apply middleware to API routes and dashboard pages
  if (!request.nextUrl.pathname.startsWith('/api/') && 
      !request.nextUrl.pathname.startsWith('/dashboard') &&
      !request.nextUrl.pathname.startsWith('/setup/')) {
    console.log('=== MIDDLEWARE END (not protected route) ===')
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
      request.nextUrl.pathname.startsWith('/api/analytics') ||
      request.nextUrl.pathname.startsWith('/api/seed-subscription-plans') ||
      request.nextUrl.pathname.startsWith('/api/health') ||
      request.nextUrl.pathname.startsWith('/api/debug-registration') ||
      request.nextUrl.pathname.startsWith('/api/test-registration')) {
    console.log('=== MIDDLEWARE END (skipped API route) ===')
    return NextResponse.next()
  }

  try {
    console.log('Getting JWT token...')
    const token = await getToken({ req: request })
    console.log('Token exists:', !!token)
    console.log('Token user ID:', token?.sub)
    console.log('Token hasCompany:', token?.hasCompany)
    console.log('Token companyId:', token?.companyId)
    
    if (!token) {
      console.log('No token found, redirecting to signin')
      // Redirect to login for dashboard and setup pages
      if (request.nextUrl.pathname.startsWith('/dashboard') ||
          request.nextUrl.pathname.startsWith('/setup/')) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }
      
      // Return 401 for API routes
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Use JWT token data for company status
    // Note: Real-time database checks cannot be performed in middleware due to Edge Runtime limitations
    // JWT token data should be sufficient for routing decisions
    let hasCompany = token.hasCompany as boolean
    let companyId = token.companyId as string
    let companyName = token.companyName as string
    let companyRole = token.companyRole as string

    console.log('Using JWT token values:', { hasCompany, companyId, companyName, companyRole })

    // Check if user has a company for dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      console.log('Dashboard route - checking company status:', { hasCompany, companyId })
      if (!hasCompany || !companyId) {
        console.log('Redirecting to company setup - no company found (JWT token check)')
        
        // Check if this is a session refresh request
        const refreshSession = request.nextUrl.searchParams.get('refresh-session')
        if (refreshSession === 'true') {
          console.log('Session refresh requested but still no company - redirecting to setup')
          return NextResponse.redirect(new URL('/setup/company', request.url))
        }
        
        // First time - try to refresh session in case JWT is stale
        console.log('Attempting session refresh due to potential stale JWT token')
        const refreshUrl = new URL('/dashboard', request.url)
        refreshUrl.searchParams.set('refresh-session', 'true')
        
        // Add a special header to trigger session refresh
        const response = NextResponse.redirect(refreshUrl)
        response.headers.set('x-refresh-session', 'true')
        return response
      }
    }

    // Prevent redirect loops for company setup page
    if (request.nextUrl.pathname.startsWith('/setup/company')) {
      console.log('Setup route - checking company status:', { hasCompany, companyId })
      if (hasCompany && companyId) {
        console.log('User has company, redirecting from setup to dashboard (real-time check)')
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
      if (companyName) {
        requestHeaders.set('x-company-name', companyName)
      }
      if (companyRole) {
        requestHeaders.set('x-company-role', companyRole)
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

