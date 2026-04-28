// components/AuthProvider.js
// Client-side authentication provider
// Wraps the entire app to make auth available everywhere

"use client"

import { SessionProvider } from "next-auth/react"

export default function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}