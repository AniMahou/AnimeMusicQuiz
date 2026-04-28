/**
 * NEXT.JS MIDDLEWARE
 * Runs before every request to the app
 * Perfect for authentication checks
 * 
 * This runs on the server, not in the browser
 */

import { NextResponse } from 'next/server'

// List of routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/lobby',
  '/game',
]

// List of routes that are for guests only (redirect to dashboard if logged in)
const guestRoutes = [
  '/login',
  '/register',
]

export function middleware(request) {
  // Get the path the user is trying to visit
  const { pathname } = request.nextUrl
  
  // Get the session cookie (set by NextAuth)
  const sessionCookie = request.cookies.get('next-auth.session-token')
  const isLoggedIn = !!sessionCookie
  
  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if this is a guest route
  const isGuestRoute = guestRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // CASE 1: Trying to access protected route without login
  if (isProtectedRoute && !isLoggedIn) {
    // Redirect to login page with callback URL
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // CASE 2: Trying to access login/register while already logged in
  if (isGuestRoute && isLoggedIn) {
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // CASE 3: All good, continue normally
  return NextResponse.next()
}

// Configuration: which routes trigger this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}