// components/MALConnect.js
// Button to connect MyAnimeList account

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';

export default function MALConnect() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  
  const isMALConnected = !!session?.user?.malAccessToken;
  
  const handleConnect = async () => {
    setLoading(true);
    setSyncStatus('');
    
    try {
      await signIn('mal', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('MAL connection error:', error);
      setSyncStatus('Failed to connect MAL');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSync = async () => {
    setLoading(true);
    setSyncStatus('Syncing your anime list...');
    
    try {
      const response = await fetch('/api/mal/sync', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSyncStatus(`✅ Synced ${data.count} anime from MAL!`);
      } else {
        setSyncStatus(`❌ Sync failed: ${data.message}`);
      }
    } catch (error) {
      setSyncStatus('❌ Failed to sync with MAL');
    } finally {
      setLoading(false);
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };
  
  return (
    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-semibold mb-1 flex items-center gap-2">
            <span>🎌</span> MyAnimeList
          </h3>
          <p className="text-sm text-gray-400">
            {isMALConnected 
              ? 'Connected! Quiz will use anime from your MAL list.' 
              : 'Connect to get personalized quizzes based on anime you\'ve watched.'}
          </p>
        </div>
        
        {!isMALConnected ? (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect MAL'}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Syncing...' : 'Sync List'}
            </button>
          </div>
        )}
      </div>
      
      {syncStatus && (
        <div className="mt-3 text-sm text-purple-300">
          {syncStatus}
        </div>
      )}
    </div>
  );
}