import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token
        }
        // Protect API routes (except auth routes and reset route)
        if (req.nextUrl.pathname.startsWith("/api") && 
            !req.nextUrl.pathname.startsWith("/api/auth") && 
            !req.nextUrl.pathname.startsWith("/api/reset")) {
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

