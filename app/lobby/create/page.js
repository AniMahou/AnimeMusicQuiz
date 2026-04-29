// app/lobby/create/page.js
// Page to create a new lobby

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LobbySettings from '@/components/LobbySettings';

export default function CreateLobbyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Redirect if not logged in
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  const handleCreateLobby = async (settings) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/lobby/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create lobby');
      }
      
      // Redirect to lobby waiting room
      router.push(`/lobby/${data.code}`);
      
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent mb-2">
            Create New Lobby
          </h1>
          <p className="text-gray-400">
            Configure your game settings and invite friends
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        {/* Settings Form */}
        <LobbySettings onCreate={handleCreateLobby} isLoading={isLoading} />
        
        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition"
          >
            ← Back to Dashboard
          </button>
        </div>
        
      </div>
    </main>
  );
}