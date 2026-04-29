// app/api/lobby/create/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateLobbyCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Creating lobby for user:', session.user.id);
    
    // Ensure user profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', session.user.id)
      .maybeSingle();
    
    if (!existingProfile) {
      const { error: createProfileError } = await supabase
        .from('user_profiles')
        .insert({
          id: session.user.id,
          email: session.user.email,
          username: session.user.email?.split('@')[0] || 'user',
          provider: 'credentials',
          created_at: new Date().toISOString(),
        });
      
      if (createProfileError) {
        console.error('Failed to create profile:', createProfileError);
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 400 });
      }
    }
    
    const { rounds = 25, timePerRound = 30 } = await request.json();
    
    // Generate unique lobby code
    let code = generateLobbyCode();
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      const { data: existing } = await supabase
        .from('lobbies')
        .select('code')
        .eq('code', code)
        .maybeSingle();
      
      if (!existing) {
        isUnique = true;
      } else {
        code = generateLobbyCode();
      }
      attempts++;
    }
    
    console.log('Creating lobby with code:', code);
    
    // Create lobby
    const { error: lobbyError } = await supabase
      .from('lobbies')
      .insert({
        code: code,
        owner_id: session.user.id,
        settings: { rounds, timePerRound },
        status: 'waiting',
      });
    
    if (lobbyError) {
      console.error('Lobby creation error:', lobbyError);
      return NextResponse.json({ error: lobbyError.message }, { status: 500 });
    }
    
    // Add owner as player
    const { error: playerError } = await supabase
      .from('lobby_players')
      .insert({
        lobby_code: code,
        user_id: session.user.id,
        score: 0,
      });
    
    if (playerError) {
      console.error('Player addition error:', playerError);
    }
    
    console.log('Lobby created successfully:', code);
    
    // Return just the code
    return NextResponse.json({ 
      success: true, 
      code: code
    });
    
  } catch (error) {
    console.error('Create lobby error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}