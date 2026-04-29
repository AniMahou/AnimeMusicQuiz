// app/api/lobby/join/route.js
// API endpoint for joining a lobby

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Lobby code required' }, { status: 400 });
    }
    
    console.log('Joining lobby:', code, 'User:', session.user.id);
    
    // Check if lobby exists
    const { data: lobby, error: lobbyError } = await supabase
      .from('lobbies')
      .select('*')
      .eq('code', code.toUpperCase())
      .maybeSingle();
    
    if (lobbyError || !lobby) {
      console.log('Lobby not found:', code);
      return NextResponse.json({ error: 'Lobby not found' }, { status: 404 });
    }
    
    if (lobby.status !== 'waiting') {
      return NextResponse.json({ error: 'Game already in progress' }, { status: 400 });
    }
    
    // Check if user is already in lobby
    const { data: existing } = await supabase
      .from('lobby_players')
      .select('*')
      .eq('lobby_code', code.toUpperCase())
      .eq('user_id', session.user.id)
      .maybeSingle();
    
    if (!existing) {
      // Add player to lobby
      const { error: joinError } = await supabase
        .from('lobby_players')
        .insert({
          lobby_code: code.toUpperCase(),
          user_id: session.user.id,
          score: 0,
        });
      
      if (joinError) {
        console.error('Join error:', joinError);
        return NextResponse.json({ error: joinError.message }, { status: 500 });
      }
      console.log('Player added to lobby:', session.user.id);
    } else {
      console.log('Player already in lobby:', session.user.id);
    }
    
    return NextResponse.json({ success: true, lobby });
    
  } catch (error) {
    console.error('Join lobby error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}