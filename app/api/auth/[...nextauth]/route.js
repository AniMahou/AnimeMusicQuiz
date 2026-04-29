// app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from '@supabase/supabase-js'

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
            name: data.user.email.split('@')[0],
          }
        } catch (error) {
          return null
        }
      }
    }),
    
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    
    // MyAnimeList Provider
    // MyAnimeList Provider - WORKING VERSION
    // MyAnimeList Provider - PKCE FIXED VERSION
{
    id: "mal",
    name: "MyAnimeList",
    type: "oauth",
    version: "2.0",
    checks: ["pkce", "state"], // ✅ Explicitly enable PKCE and State
    authorization: {
      url: "https://myanimelist.net/v1/oauth2/authorize",
      params: {
        scope: "read",
        response_type: "code",
      },
    },
    token: {
      url: "https://myanimelist.net/v1/oauth2/token",
      async request({ provider, params, client }) {
        // PKCE code_verifier is automatically generated and passed in params
        const response = await fetch(provider.token.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: provider.clientId,
            client_secret: provider.clientSecret,
            code: params.code,
            code_verifier: params.code_verifier, // ✅ Required for PKCE
            grant_type: "authorization_code",
            redirect_uri: provider.callbackUrl,
          }),
        });
        const tokens = await response.json();
        if (!response.ok) throw tokens;
        return { tokens };
      },
    },
    userinfo: {
      url: "https://api.myanimelist.net/v2/users/@me?fields=id,name,picture",
      async request({ tokens }) {
        const response = await fetch("https://api.myanimelist.net/v2/users/@me?fields=id,name,picture", {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) throw data;
        return data;
      },
    },
    clientId: process.env.MAL_CLIENT_ID,
    clientSecret: process.env.MAL_CLIENT_SECRET,
    callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/mal`,
    async profile(profile) {
      return {
        id: profile.id.toString(),
        name: profile.name,
        email: `${profile.id}@mal.user`,
        image: profile.picture,
      };
    },
  },
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
      if (account) {
        token.provider = account.provider
        if (account.provider === "mal") {
          token.malAccessToken = account.access_token
          token.malRefreshToken = account.refresh_token
        }
      }
      return token
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        if (token.malAccessToken) {
          session.user.malAccessToken = token.malAccessToken
        }
      }
      return session
    },
    
    async signIn({ user, account }) {
      if (!user?.email) return true
      
      try {
        const { data: existing } = await supabaseAdmin
          .from("user_profiles")
          .select("id")
          .eq("email", user.email)
          .maybeSingle()
        
        if (!existing) {
          await supabaseAdmin
            .from("user_profiles")
            .insert({
              id: user.id,
              email: user.email,
              username: user.email.split('@')[0],
              provider: account?.provider || "credentials",
              created_at: new Date().toISOString(),
            })
        }
        
        // Update MAL tokens if this is MAL login
        if (account?.provider === "mal" && account.access_token) {
          await supabaseAdmin
            .from("user_profiles")
            .update({
              mal_token: account.access_token,
              mal_refresh_token: account.refresh_token,
              updated_at: new Date().toISOString(),
            })
            .eq("email", user.email)
        }
        
        return true
      } catch (error) {
        console.error("SignIn error:", error)
        return true
      }
    }
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }