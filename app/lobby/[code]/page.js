// app/lobby/[code]/page.js
// Lobby waiting room - players gather here before game starts

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase/client';

export default function LobbyPage() {
  const { code } = useParams(); // Get lobby code from URL
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [lobby, setLobby] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  
  // Redirect if not logged in
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }
  
  // Join lobby on load
  useEffect(() => {
    if (status === 'authenticated' && code) {
      joinLobby();
    }
  }, [status, code]);
  
  const joinLobby = async () => {
    try {
      const response = await fetch('/api/lobby/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      // Fetch lobby details
      await fetchLobbyDetails();
      
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  const fetchLobbyDetails = async () => {
    try {
      // Fetch lobby info
      const { data: lobbyData, error: lobbyError } = await supabase
        .from('lobbies')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();
      
      if (lobbyError) throw lobbyError;
      
      setLobby(lobbyData);
      setIsOwner(lobbyData.owner_id === session?.user?.id);
      
      // Fetch players in lobby
      const { data: playersData, error: playersError } = await supabase
        .from('lobby_players')
        .select('user_id, score, joined_at')
        .eq('lobby_code', code.toUpperCase());
      
      if (playersError) throw playersError;
      
      // Fetch user profiles for each player
      const playerIds = playersData.map(p => p.user_id);
      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('id, username, email')
        .in('id', playerIds);
      
      const playersWithInfo = playersData.map(player => ({
        ...player,
        profile: profilesData?.find(p => p.id === player.user_id)
      }));
      
      setPlayers(playersWithInfo);
      setIsLoading(false);
      
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  // Subscribe to realtime updates for players
  useEffect(() => {
    if (!code) return;
    
    const channel = supabase
      .channel(`lobby:${code}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lobby_players',
          filter: `lobby_code=eq.${code}`,
        },
        () => {
          // Refresh player list when changes occur
          fetchLobbyDetails();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [code]);
  
  const handleStartGame = async () => {
    // Will implement in next prompt
    alert('Game starting soon! (Next prompt)');
  };
  
  const copyInviteLink = () => {
    const link = `${window.location.origin}/lobby/join?code=${code}`;
    navigator.clipboard.writeText(link);
    alert('Invite link copied!');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Joining lobby...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        
        {/* Lobby Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Lobby: {code}
          </h1>
          <p className="text-gray-400">
            Share this code with friends to join!
          </p>
        </div>
        
        {/* Invite Section */}
        <div className="bg-white/5 rounded-lg p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">Lobby Code</p>
              <p className="text-2xl font-mono font-bold text-orange-400">{code}</p>
            </div>
            <button
              onClick={copyInviteLink}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              📋 Copy Invite Link
            </button>
          </div>
        </div>
        
        {/* Players List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Players ({players.length})
          </h2>
          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={player.user_id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">#{index + 1}</span>
                  <span className="font-medium">
                    {player.profile?.username || player.profile?.email?.split('@')[0] || 'Anonymous'}
                  </span>
                  {player.user_id === lobby?.owner_id && (
                    <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">
                      Host
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  Ready!
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Start Game Button (only host sees) */}
        {isOwner && players.length >= 1 && (
          <button
            onClick={handleStartGame}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            🎮 Start Game ({players.length} players)
          </button>
        )}
        
        {isOwner && players.length === 0 && (
          <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400">
              Waiting for players to join... Share the code above!
            </p>
          </div>
        )}
        
        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white transition"
          >
            ← Leave Lobby
          </button>
        </div>
        
      </div>
    </main>
  );
}