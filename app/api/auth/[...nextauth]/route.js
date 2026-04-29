// app/api/auth/[...nextauth]/route.js
// Complete authentication with Google and Facebook

import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabaseAdmin } from "@/lib/supabase/server"

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
          const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })
          
          if (error) throw new Error(error.message)
          
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email,
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
      // Request these scopes from Google
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
    
    // Facebook Provider
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      // Request email permission
      authorization: {
        params: {
          scope: "email public_profile"
        }
      }
    })
  ],
  
  pages: {
    signIn: "/login",
    signUp: "/register",
    error: "/login",
  },
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  
  callbacks: {
    // Called when JWT is created or updated
    async jwt({ token, user, account }) {
      // Add user ID to token when user first logs in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      
      // Store provider info (for OAuth users)
      if (account) {
        token.provider = account.provider
        token.providerAccountId = account.providerAccountId
      }
      
      return token
    },
    
    // Called when session is accessed
    async session({ session, token }) {
      // Add user ID to session object
      if (token && session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
      }
      return session
    },
    
    // Called right after sign in - creates user profile in our database
    async signIn({ user, account, profile }) {
      if (!user?.id) return false
      
      try {
        // Check if user_profile already exists
        const { data: existing } = await supabaseAdmin
          .from("user_profiles")
          .select("id")
          .eq("id", user.id)
          .single()
        
        // If not, create it
        if (!existing) {
          // Get the best username available
          let username = null
          
          if (profile?.email) {
            username = profile.email.split("@")[0]
          } else if (profile?.name) {
            username = profile.name.toLowerCase().replace(/\s/g, "_")
          } else if (user.email) {
            username = user.email.split("@")[0]
          } else if (user.name) {
            username = user.name.toLowerCase().replace(/\s/g, "_")
          } else {
            username = `user_${Math.random().toString(36).substring(2, 8)}`
          }
          
          // Insert the user profile
          const { error: insertError } = await supabaseAdmin
            .from("user_profiles")
            .insert({
              id: user.id,
              email: user.email,
              username: username,
              created_at: new Date().toISOString(),
            })
          
          if (insertError) {
            console.error("Error creating user profile:", insertError)
            // Don't block sign in if profile creation fails
          } else {
            console.log("Created user profile for:", user.email)
          }
        }
      } catch (error) {
        console.error("Error in signIn callback:", error)
        // Don't block sign in
      }
      
      return true // Allow sign in
    }
  },
  
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }