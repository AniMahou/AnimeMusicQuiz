// lib/auth.js
// Authentication helper functions and utilities

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Get session on the server (for API routes and Server Components)
export async function getServerAuthSession() {
  return await getServerSession(authOptions)
}

// Check if user is authenticated (server-side)
export async function isAuthenticated() {
  const session = await getServerAuthSession()
  return !!session?.user
}

// Get current user ID (server-side)
export async function getCurrentUserId() {
  const session = await getServerAuthSession()
  return session?.user?.id || null
}

// Get current user (server-side)
export async function getCurrentUser() {
  const session = await getServerAuthSession()
  return session?.user || null
}

// Helper for protected API routes
export async function requireAuth(request) {
  const session = await getServerAuthSession()
  
  if (!session?.user) {
    return {
      authenticated: false,
      error: "Unauthorized",
      status: 401
    }
  }
  
  return {
    authenticated: true,
    user: session.user,
    status: 200
  }
}