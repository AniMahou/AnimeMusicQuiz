// This file creates a Supabase client for use on the SERVER
// Can use SERVICE_ROLE_KEY (bypasses Row Level Security)

import { createClient } from '@supabase/supabase-js'

// Server-only variables (no NEXT_PUBLIC_ prefix)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validation
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase service role key. Check .env.local')
}

// Create a server client with ADMIN privileges
// WARNING: This can bypass all security rules!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,  // Server doesn't need token refresh
    persistSession: false     // Don't store sessions on server
  }
})

// Server client for authenticated requests (uses user's JWT)
// For use in API routes where we need to respect user permissions
export function createServerClient(supabaseAccessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseAccessToken}`
      }
    }
  })
}