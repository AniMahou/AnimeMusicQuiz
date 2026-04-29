// app/api/auth/mal/route.js
// Initiates MAL OAuth flow with PKCE

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

function generatePKCE() {
  // Generate a random code verifier (32 bytes hex = 64 chars)
  const verifier = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // MAL uses "plain" method, so challenge = verifier
  const challenge = verifier;
  
  return { verifier, challenge };
}

export async function GET(request) {
  const { verifier, challenge } = generatePKCE();
  
  // Store verifier in cookie for later
  cookies().set('mal_code_verifier', verifier, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    maxAge: 600, // 10 minutes
    path: '/',
  });
  
  // Build MAL authorization URL
  const authUrl = new URL('https://myanimelist.net/v1/oauth2/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', process.env.MAL_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', 'http://localhost:3000/api/auth/mal/callback');
  authUrl.searchParams.set('scope', 'read');
  authUrl.searchParams.set('code_challenge', challenge);
  authUrl.searchParams.set('code_challenge_method', 'plain');
  
  console.log('🔐 Initiating MAL OAuth flow');
  console.log('Redirect URI:', 'http://localhost:3000/api/auth/mal/callback');
  
  return NextResponse.redirect(authUrl);
}