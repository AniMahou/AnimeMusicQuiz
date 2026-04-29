// app/lobby/[code]/LobbyClient.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function LobbyClient({ initialLobby, initialPlayers, initialIsOwner, sessionUser }) {
  const router = useRouter();
  const [lobby, setLobby] = useState(initialLobby);
  const [players, setPlayers] = useState(initialPlayers);
  const [isOwner] = useState(initialIsOwner);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const code = lobby.code;
  
  // Subscribe to realtime updates
  useEffect(() => {
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
        async () => {
          // Refresh players
          const { data: playersData } = await supabase
            .from('lobby_players')
            .select('user_id, score, joined_at')
            .eq('lobby_code', code);
          
          if (playersData) {
            const playerIds = playersData.map(p => p.user_id);
            const { data: profilesData } = await supabase
              .from('user_profiles')
              .select('id, username, email')
              .in('id', playerIds);
            
            const updatedPlayers = playersData.map(player => ({
              ...player,
              profile: profilesData?.find(p => p.id === player.user_id)
            }));
            setPlayers(updatedPlayers);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [code]);
  
  const copyInviteLink = () => {
    const link = `${window.location.origin}/lobby/join?code=${code}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  const handleStartGame = () => {
    alert('Game starting soon!');
  };
  
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Lobby: {code}
          </h1>
          <p className="text-gray-400">
            Share this code with friends to join!
          </p>
        </div>
        
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
              {copySuccess ? '✅ Copied!' : '📋 Copy Invite Link'}
            </button>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Players ({players.length})
          </h2>
          <div className="space-y-2">
            {players.length === 0 ? (
              <div className="text-center p-4 text-gray-400">
                Waiting for players to join...
              </div>
            ) : (
              players.map((player, index) => (
                <div
                  key={player.user_id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">#{index + 1}</span>
                    <span className="font-medium">
                      {player.profile?.username || player.profile?.email?.split('@')[0] || 'Player'}
                    </span>
                    {player.user_id === lobby.owner_id && (
                      <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">
                        Host
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    Ready!
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
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
        
        {!isOwner && (
          <div className="text-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400">
              Waiting for host to start the game...
            </p>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <a
            href="/dashboard"
            className="text-gray-400 hover:text-white transition"
          >
            ← Leave Lobby
          </a>
        </div>
        
      </div>
    </main>
  );
}