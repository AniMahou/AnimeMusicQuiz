'use client';

/**
 * CUSTOM HOOK: useAuth
 * Provides authentication state and helpers
 * 
 * What is a custom hook?
 * A React function that starts with "use" and can use other hooks
 * Allows reusing stateful logic across components
 */

import { useEffect, useState } from 'react'
import { supabase, getCurrentUser } from '@/lib/supabase/client'

export function useAuth() {
  // State variables
  const [user, setUser] = useState(null)      // User object (null if not logged in)
  const [loading, setLoading] = useState(true) // True while checking auth
  const [error, setError] = useState(null)     // Error message if any

  // Function: Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  // Function: Check if user is logged in (refresh session)
  const refreshUser = async () => {
    try {
      setLoading(true)
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      return currentUser
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Effect: Check authentication on component mount
  useEffect(() => {
    refreshUser()

    // Set up listener for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    // Cleanup subscription when component unmounts
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Return values for components to use
  return {
    user,           // Current user object (null if not logged in)
    loading,        // True while checking auth status
    error,          // Error message (null if no error)
    logout,         // Function to logout
    refreshUser,    // Function to manually refresh user data
    isAuthenticated: !!user, // Boolean: true if user exists
  }
}