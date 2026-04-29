// app/api/auth/[...nextauth]/route.js
// Complete authentication with Email, Google, Facebook, and MyAnimeList

import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabaseAdmin } from "@/lib/supabase/server"

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  
  providers: [
    // 1. Email/Password Provider
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
    
    // 2. Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
    
    // 3. Facebook Provider
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "email public_profile"
        }
      }
    }),
    
    // 4. MyAnimeList Custom Provider
    {
      id: "mal",
      name: "MyAnimeList",
      type: "oauth",
      version: "2.0",
      scope: "read",
      params: { grant_type: "authorization_code" },
      accessTokenUrl: "https://myanimelist.net/v1/oauth2/token",
      authorizationUrl: "https://myanimelist.net/v1/oauth2/authorize?response_type=code",
      profileUrl: "https://api.myanimelist.net/v2/users/@me?fields=id,name,picture",
      clientId: process.env.MAL_CLIENT_ID,
      clientSecret: process.env.MAL_CLIENT_SECRET,
      
      async profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name,
          email: `${profile.name}@mal-user.local`,
          image: profile.picture?.medium,
        }
      }
    }
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
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      
      if (account) {
        token.provider = account.provider
        token.providerAccountId = account.providerAccountId
        
        // Store MAL tokens if available
        if (account.provider === "mal") {
          token.malAccessToken = account.access_token
          token.malRefreshToken = account.refresh_token
          token.malExpiresAt = account.expires_at
        }
      }
      
      return token
    },
    
    // Called when session is accessed
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        
        // Add MAL tokens to session if they exist
        if (token.malAccessToken) {
          session.user.malAccessToken = token.malAccessToken
          session.user.malRefreshToken = token.malRefreshToken
        }
      }
      return session
    },
    
    // Called right after sign in - creates user profile in database
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
          
          // Store MAL tokens if this is MAL login
          const malToken = account?.provider === "mal" ? account.access_token : null
          const malRefreshToken = account?.provider === "mal" ? account.refresh_token : null
          const malUsername = profile?.name || null
          
          const { error: insertError } = await supabaseAdmin
            .from("user_profiles")
            .insert({
              id: user.id,
              email: user.email,
              username: username,
              mal_token: malToken,
              mal_refresh_token: malRefreshToken,
              mal_username: malUsername,
              created_at: new Date().toISOString(),
            })
          
          if (insertError) {
            console.error("Error creating user profile:", insertError)
          } else {
            console.log("Created user profile for:", user.email)
          }
        } else if (account?.provider === "mal") {
          // Update MAL tokens for existing user
          const { error: updateError } = await supabaseAdmin
            .from("user_profiles")
            .update({
              mal_token: account.access_token,
              mal_refresh_token: account.refresh_token,
              mal_username: profile?.name,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
          
          if (updateError) {
            console.error("Error updating MAL tokens:", updateError)
          }
        }
      } catch (error) {
        console.error("Error in signIn callback:", error)
      }
      
      return true
    }
  },
  
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }