// app/api/auth/[...nextauth]/route.js
// This is a catch-all route that handles all authentication endpoints
// URLs like /api/auth/signin, /api/auth/callback/google, etc.

import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabaseAdmin } from "@/lib/supabase/server"

// For now, we'll use email/password only
// We'll add Google, Facebook, and MAL in later prompts

export const authOptions = {
  // Secret for encrypting JWT tokens (from .env.local)
  secret: process.env.NEXTAUTH_SECRET,
  
  // Configure authentication providers
  providers: [
    // Email/Password provider (custom)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      
      // This function runs when user submits login form
      async authorize(credentials) {
        // Validate input
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }
        
        try {
          // Sign in with Supabase using email/password
          const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })
          
          if (error) {
            throw new Error(error.message)
          }
          
          if (!data.user) {
            throw new Error("No user found")
          }
          
          // Return user object (NextAuth will create session)
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email,
          }
        } catch (error) {
          console.error("Auth error:", error.message)
          return null  // Returning null means login failed
        }
      }
    })
  ],
  
  // Custom pages (optional - we'll create these)
  pages: {
    signIn: "/login",     // Custom login page
    signUp: "/register",  // Custom register page
    error: "/login",      // Redirect to login on error
  },
  
  // Session configuration
  session: {
    strategy: "jwt",      // Use JWT tokens (simpler than database sessions)
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Callbacks - functions that run at specific points in auth flow
  callbacks: {
    // Called when JWT is created or updated
    async jwt({ token, user }) {
      // Add user ID to token when user first logs in
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    
    // Called when session is accessed (every time)
    async session({ session, token }) {
      // Add user ID to session object
      if (token && session.user) {
        session.user.id = token.id
        session.user.email = token.email
      }
      return session
    },
    
    // Called right after sign in (use this to create user profile)
    async signIn({ user, account, profile }) {
      // When user signs up via email/password, create a user_profile record
      if (account?.provider === "credentials" && user) {
        try {
          // Check if user_profile already exists
          const { data: existing } = await supabaseAdmin
            .from("user_profiles")
            .select("id")
            .eq("id", user.id)
            .single()
          
          // If not, create it
          if (!existing) {
            await supabaseAdmin
              .from("user_profiles")
              .insert({
                id: user.id,
                email: user.email,
                username: user.email?.split("@")[0],
              })
          }
        } catch (error) {
          console.error("Error creating user profile:", error.message)
          // Don't block sign in if profile creation fails
        }
      }
      
      return true // Allow sign in
    }
  },
  
  // Debug mode (helps troubleshooting)
  debug: process.env.NODE_ENV === "development",
}

// Create and export the NextAuth handler
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }