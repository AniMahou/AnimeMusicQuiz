// app/api/lobby/join/route.js

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
    
    // Check if lobby exists
    const { data: lobby, error: lobbyError } = await supabase
      .from('lobbies')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();
    
    if (lobbyError || !lobby) {
      return NextResponse.json({ error: 'Lobby not found' }, { status: 404 });
    }
    
    if (lobby.status !== 'waiting') {
      return NextResponse.json({ error: 'Game already in progress' }, { status: 400 });
    }
    
    // Add player to lobby
    const { error: joinError } = await supabase
      .from('lobby_players')
      .upsert({
        lobby_code: code.toUpperCase(),
        user_id: session.user.id,
        score: 0,
      });
    
    if (joinError) {
      return NextResponse.json({ error: joinError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, lobby });
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}