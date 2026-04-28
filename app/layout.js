// app/layout.js
// Root layout - wraps all pages

import "./globals.css"
import AuthProvider from "@/components/AuthProvider"
import Navbar from "@/components/Navbar"

export const metadata = {
  title: "Anime Music Quiz",
  description: "Guess anime songs with friends!",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 min-h-screen">
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}