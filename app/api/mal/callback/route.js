// app/api/auth/mal/callback/route.js
// Handles MAL OAuth callback and stores tokens

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  // Get the session to know which user is connecting MAL
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    console.error('No session found');
    return NextResponse.redirect('http://localhost:3000/login?error=no_session');
  }
  
  if (error) {
    console.error('MAL auth error:', error);
    return NextResponse.redirect('http://localhost:3000/dashboard?error=mal_auth_failed');
  }
  
  if (!code) {
    console.error('No code received from MAL');
    return NextResponse.redirect('http://localhost:3000/dashboard?error=mal_no_code');
  }
  
  // Get the stored code verifier
  const codeVerifier = cookies().get('mal_code_verifier')?.value;
  
  if (!codeVerifier) {
    console.error('No code verifier found');
    return NextResponse.redirect('http://localhost:3000/dashboard?error=mal_no_verifier');
  }
  
  console.log('🔄 Exchanging code for token...');
  
  // Exchange code for access token
  const tokenResponse = await fetch('https://myanimelist.net/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.MAL_CLIENT_ID,
      client_secret: process.env.MAL_CLIENT_SECRET,
      code: code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:3000/api/auth/mal/callback',
    }),
  });
  
  const tokenData = await tokenResponse.json();
  
  if (!tokenResponse.ok) {
    console.error('Token exchange failed:', tokenData);
    return NextResponse.redirect('http://localhost:3000/dashboard?error=mal_token_failed');
  }
  
  console.log('✅ Token obtained successfully');
  
  // Fetch user profile from MAL
  const profileResponse = await fetch('https://api.myanimelist.net/v2/users/@me?fields=id,name,picture', {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
    },
  });
  
  const profile = await profileResponse.json();
  console.log('MAL Profile:', profile.name);
  
  // Store tokens in user_profiles
  const { error: updateError } = await supabaseAdmin
    .from('user_profiles')
    .update({
      mal_token: tokenData.access_token,
      mal_refresh_token: tokenData.refresh_token,
      mal_username: profile.name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', session.user.id);
  
  if (updateError) {
    console.error('Failed to store MAL tokens:', updateError);
    return NextResponse.redirect('http://localhost:3000/dashboard?error=mal_store_failed');
  }
  
  // Clear the verifier cookie
  cookies().delete('mal_code_verifier');
  
  console.log('🎉 MAL connected successfully for user:', session.user.email);
  
  // Redirect to dashboard with success
  return NextResponse.redirect('http://localhost:3000/dashboard?mal_connected=true');
}