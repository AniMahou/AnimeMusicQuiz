// app/dashboard/page.js
// Protected dashboard - only visible to logged-in users

import { getServerAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import MALConnect from '@/components/MALConnect';

export const metadata = {
  title: 'Dashboard - Anime Music Quiz',
  description: 'Your anime music quiz dashboard',
};

export default async function DashboardPage() {
  const session = await getServerAuthSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        
        {/* Welcome header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {session.user?.name || session.user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-gray-400">
              You're logged in and ready to play!
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* User info card */}
        <div className="bg-white/5 rounded-lg p-4 mb-8">
          <h2 className="font-semibold mb-2">Your Account</h2>
          <div className="space-y-1 text-sm text-gray-300">
            <p><span className="text-gray-400">Email:</span> {session.user?.email}</p>
            <p><span className="text-gray-400">User ID:</span> {session.user?.id}</p>
          </div>
        </div>

        {/* MAL Connection Section */}
        <div className="mb-8">
          <MALConnect />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition">
            🎮 Create Lobby
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition border border-white/20">
            🔑 Join Lobby
          </button>
        </div>

        {/* Coming soon section */}
        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm">
            ⚡ Lobby creation and game rooms coming soon! Connect your MAL account to get personalized quizzes.
          </p>
        </div>
      </div>
    </main>
  );
}