// app/lobby/[code]/page.js
// Change to Server Component at the top

import { createClient } from '@supabase/supabase-js';
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import LobbyClient from './LobbyClient';

// Create server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Use service role key for server
);

export default async function LobbyPage({ params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  const { code } = await params;
  
  // Fetch lobby data on the server
  const { data: lobby, error: lobbyError } = await supabase
    .from('lobbies')
    .select('*')
    .eq('code', code.toUpperCase())
    .maybeSingle();
  
  if (lobbyError || !lobby) {
    // Lobby not found
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Lobby Not Found</h2>
          <p className="text-gray-300 mb-4">
            The lobby "{code}" doesn't exist or has expired.
          </p>
          <a href="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition inline-block">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }
  
  // Fetch players
  const { data: playersData } = await supabase
    .from('lobby_players')
    .select('user_id, score, joined_at')
    .eq('lobby_code', code.toUpperCase());
  
  // Fetch user profiles for players
  let players = [];
  if (playersData && playersData.length > 0) {
    const playerIds = playersData.map(p => p.user_id);
    const { data: profilesData } = await supabase
      .from('user_profiles')
      .select('id, username, email')
      .in('id', playerIds);
    
    players = playersData.map(player => ({
      ...player,
      profile: profilesData?.find(p => p.id === player.user_id)
    }));
  }
  
  const isOwner = lobby.owner_id === session.user.id;
  
  // Pass data to client component for real-time updates
  return (
    <LobbyClient 
      initialLobby={lobby}
      initialPlayers={players}
      initialIsOwner={isOwner}
      sessionUser={session.user}
    />
  );
}