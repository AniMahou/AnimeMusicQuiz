// app/lobby/create/page.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CreateLobbyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rounds, setRounds] = useState(25);
  const [timePerRound, setTimePerRound] = useState(30);
  
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
  
  const handleCreateLobby = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Creating lobby with settings:', { rounds, timePerRound });
      
      const response = await fetch('/api/lobby/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rounds, timePerRound }),
      });
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create lobby');
      }
      
      if (!data.code) {
        throw new Error('No lobby code received');
      }
      
      // Wait a moment for database to fully commit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to lobby waiting room
      router.push(`/lobby/${data.code}`);
      
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent mb-2">
            Create New Lobby
          </h1>
          <p className="text-gray-400">
            Configure your game settings and invite friends
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleCreateLobby} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Rounds: {rounds}
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={rounds}
              onChange={(e) => setRounds(parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5 (Quick game)</span>
              <span>25 (Standard)</span>
              <span>50 (Marathon)</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time Per Round: {timePerRound} seconds
            </label>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={timePerRound}
              onChange={(e) => setTimePerRound(parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>15s (Fast)</span>
              <span>30s (Normal)</span>
              <span>60s (Easy)</span>
            </div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-sm text-blue-400">
              💡 After creating the lobby, share the 6-digit code with your friends!
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? 'Creating Lobby...' : '🚀 Create Lobby'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}