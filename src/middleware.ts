import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow all NextAuth API routes to work without authentication
        if (req.nextUrl.pathname.startsWith("/api/auth")) {
          return true
        }
        
        // Allow debug and reset routes
        if (req.nextUrl.pathname.startsWith("/api/debug") || 
            req.nextUrl.pathname.startsWith("/api/reset")) {
          return true
        }
        
        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token
        }
        
        // Protect other API routes (require authentication)
        if (req.nextUrl.pathname.startsWith("/api")) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"]
}

