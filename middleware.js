// middleware.js
// Runs on every request BEFORE the page loads
// Used to protect routes and redirect unauthenticated users

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Export middleware with auth
export default withAuth(
  function middleware(req) {
    // You can add custom logic here
    // For example, checking user roles
    return NextResponse.next()
  },
  {
    // Routes that require authentication
    callbacks: {
      authorized: ({ token }) => {
        // Return true if user is authenticated
        return !!token
      }
    }
  }
)

// Which routes trigger this middleware
export const config = {
  matcher: [
    // Protect these routes
    "/dashboard/:path*",
    "/lobby/:path*",
    "/game/:path*",
    "/api/lobby/:path*",
    "/api/game/:path*",
    
    // But allow these
    "/((?!api/auth|login|register|test-db|test-simple|test-env).*)",
  ]
}