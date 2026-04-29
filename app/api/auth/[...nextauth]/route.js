// app/api/auth/[...nextauth]/route.js
// COMPLETE WORKING AUTHENTICATION

import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  
  providers: [
    // Email/Password Provider
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }
        
        try {
          // Sign in with Supabase
          const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })
          
          if (error) {
            console.error("Supabase auth error:", error.message)
            throw new Error("Invalid email or password")
          }
          
          if (!data.user) {
            throw new Error("No user found")
          }
          
          // Create or update user profile
          const { error: upsertError } = await supabaseAdmin
            .from("user_profiles")
            .upsert({
              id: data.user.id,
              email: data.user.email,
              username: data.user.email.split('@')[0],
              provider: "credentials",
              updated_at: new Date().toISOString(),
            })
          
          if (upsertError) {
            console.error("Profile upsert error:", upsertError)
          }
          
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.email.split('@')[0],
          }
        } catch (error) {
          console.error("Auth error:", error.message)
          return null
        }
      }
    }),
    
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    
    // Facebook Provider
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],
  
  pages: {
    signIn: "/login",
    error: "/login",
  },
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
      }
      return session
    },
    
    async signIn({ user, account }) {
      if (!user?.email) return false
      
      try {
        // Check if user exists in user_profiles
        const { data: existing } = await supabaseAdmin
          .from("user_profiles")
          .select("id")
          .eq("email", user.email)
          .single()
        
        if (!existing) {
          // Create new user profile
          const { error: insertError } = await supabaseAdmin
            .from("user_profiles")
            .insert({
              id: user.id,
              email: user.email,
              username: user.email.split('@')[0],
              provider: account?.provider || "credentials",
              provider_id: user.id,
              created_at: new Date().toISOString(),
            })
          
          if (insertError) {
            console.error("Profile creation error:", insertError)
          }
        }
        
        return true
      } catch (error) {
        console.error("SignIn callback error:", error)
        return true // Still allow sign in even if profile creation fails
      }
    }
  },
  
  debug: true,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }