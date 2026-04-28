'use client';  // This component needs client-side interactivity

// Note: We haven't implemented auth yet, so this is just UI
export default function Navbar() {
  return (
    <nav className="bg-black/50 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo / Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              🎵 AniMahou
            </h1>
          </div>

          {/* Navigation Links - Temporary (will be replaced with auth later) */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-300 hover:text-white transition px-3 py-2 rounded-lg hover:bg-white/10">
              Login
            </button>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition font-medium">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}