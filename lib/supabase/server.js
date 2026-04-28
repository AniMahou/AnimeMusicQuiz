
import { createClient } from '@supabase/supabase-js'

// Server-only variables (no NEXT_PUBLIC_ prefix)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validation
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase service role key. Check .env.local')
}

// Admin client - can bypass RLS!
// Use this ONLY in server API routes, NEVER in browser components
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,  // Server doesn't need token refresh
    persistSession: false,    // Don't store sessions on server
  },
})

// Create a client with a specific user's JWT token
// This respects RLS policies because we pass the user's auth token
export function createServerClient(accessToken) {
  if (!accessToken) {
    throw new Error('Access token required for authenticated server client')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}

// Helper to get user from request (for API routes)
export async function getUserFromRequest(request) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null
  
  const token = authHeader.replace('Bearer ', '')
  
  // Create a client with the user's token
  const supabase = createServerClient(token)
  
  // Get the user
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) return null
  return user
}