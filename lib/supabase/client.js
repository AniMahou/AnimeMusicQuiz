// lib/supabase/client.js
// Browser-side Supabase client for use in React components

import { createClient } from '@supabase/supabase-js'

// Get environment variables
// These start with NEXT_PUBLIC_ so they're safe for the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Use publishable key if available, fallback to anon key
const supabaseKey = supabasePublishableKey || supabaseAnonKey

// Validation - crash if missing (better than silent failure)
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Check .env.local')
  console.error('URL:', supabaseUrl ? '✅' : '❌')
  console.error('Key:', supabaseKey ? '✅' : '❌')
}

// Create and export the Supabase client
// This single instance will be reused across your app
export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to get current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Error getting current user:', error.message)
    return null
  }
}

// Helper function to check if user is logged in
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return !!user
}