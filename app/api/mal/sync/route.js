// app/api/mal/sync/route.js
// API endpoint to sync user's MAL anime list

import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { fetchUserAnimeList } from '@/lib/mal';

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's MAL tokens from database
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('mal_token, mal_username')
      .eq('id', session.user.id)
      .single();
    
    if (profileError || !userProfile?.mal_token) {
      return NextResponse.json({ 
        success: false, 
        message: 'MAL account not connected' 
      }, { status: 400 });
    }
    
    // Fetch anime list from MAL
    const animeList = await fetchUserAnimeList(userProfile.mal_token);
    
    if (!animeList.length) {
      return NextResponse.json({ 
        success: false, 
        message: 'No anime found in your MAL list' 
      });
    }
    
    // Delete existing entries for this user
    await supabaseAdmin
      .from('user_anime')
      .delete()
      .eq('user_id', session.user.id);
    
    // Insert new anime entries
    const animeData = animeList.map(item => ({
      user_id: session.user.id,
      anime_id: item.node.id,
      title: item.node.title,
      image_url: item.node.main_picture?.medium || null,
      status: item.list_status?.status || 'completed',
      score: item.list_status?.score || 0,
      episodes_watched: item.list_status?.num_episodes_watched || 0,
      updated_at: new Date().toISOString(),
    }));
    
    // Insert in batches to avoid timeout
    const batchSize = 100;
    for (let i = 0; i < animeData.length; i += batchSize) {
      const batch = animeData.slice(i, i + batchSize);
      const { error: insertError } = await supabaseAdmin
        .from('user_anime')
        .insert(batch);
      
      if (insertError) {
        console.error('Batch insert error:', insertError);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      count: animeData.length,
      message: `Synced ${animeData.length} anime from MAL`
    });
    
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}