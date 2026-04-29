// app/layout.js
// Root layout - ONLY has the AuthProvider, no Navbar here

import "./globals.css"
import AuthProvider from "@/components/AuthProvider"

export const metadata = {
  title: "Anime Music Quiz",
  description: "Guess anime songs with friends!",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}