// components/Navbar.js
// Shared Navbar component for all pages

'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <nav className="bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Click to go home */}
          <button 
            onClick={() => router.push('/')}
            className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent"
          >
            🎵 AnimeMusicQuiz
          </button>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {!session ? (
              <>
                <button
                  onClick={() => router.push('/login')}
                  className="text-gray-300 hover:text-white transition px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition font-medium"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-300 hover:text-white transition px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/lobby/create')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition font-medium"
                >
                  Create Lobby
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}