// app/lobby/join/page.js
// Page to join an existing lobby by entering code

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function JoinLobbyPage() {
  const { status } = useSession();
  const router = useRouter();
  const [code, setCode] = useState('');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      </div>
    );
  }
  
  const handleJoinLobby = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Format code: uppercase, no spaces
    const formattedCode = code.toUpperCase().trim();
    
    if (formattedCode.length !== 6) {
      setError('Lobby code must be 6 characters');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/lobby/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: formattedCode }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join lobby');
      }
      
      // Success! Redirect to lobby waiting room
      router.push(`/lobby/${formattedCode}`);
      
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent mb-2">
            Join Lobby
          </h1>
          <p className="text-gray-400">
            Enter the 6-digit code from your friend
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        {/* Join Form */}
        <form onSubmit={handleJoinLobby} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lobby Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g., A3F9K2"
              maxLength={6}
              className="w-full text-center text-2xl font-mono tracking-wider px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-orange-500 text-white"
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-2">
              Enter the 6-character code shared by the lobby host
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? 'Joining...' : '🔑 Join Lobby'}
          </button>
        </form>
        
        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white transition"
          >
            ← Back to Dashboard
          </button>
        </div>
        
        {/* Info Box */}
        <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-400">
            💡 Don't have a code? Ask a friend to create a lobby and share the code with you!
          </p>
        </div>
        
      </div>
    </main>
  );
}