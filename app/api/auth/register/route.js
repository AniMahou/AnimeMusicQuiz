// app/api/auth/register/route.js

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name || email.split('@')[0] },
    });
    
    if (error) {
      console.error('Auth creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    if (!data?.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
    
    // Create user profile in user_profiles table
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        username: name || data.user.email.split('@')[0],
        provider: 'credentials',
        created_at: new Date().toISOString(),
      });
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail the whole request, but log it
    }
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
      }
    });
    
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}