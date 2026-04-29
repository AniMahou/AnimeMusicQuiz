// components/AuthForm.js
// Reusable authentication form for login and registration
// Uses different endpoints based on mode prop

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AuthForm({ mode = 'login' }) {
  // mode: 'login' or 'register'
  const isLogin = mode === 'login';
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only used for registration
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      // LOGIN: Use NextAuth signIn
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Don't auto-redirect, we'll handle it
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else {
        // Success! Redirect to dashboard
        router.push('/dashboard');
        router.refresh(); // Refresh server components
      }
    } else {
      // REGISTER: Create account with Supabase first
      try {
        // Step 1: Create auth user in Supabase
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || email.split('@')[0],
            },
          },
        });

        if (signUpError) throw new Error(signUpError.message);

        if (authData?.user) {
          // Step 2: Auto-login after registration
          const loginResult = await signIn('credentials', {
            email,
            password,
            redirect: false,
          });

          if (loginResult?.error) {
            setError('Account created! Please login.');
            router.push('/login');
          } else {
            router.push('/dashboard');
            router.refresh();
          }
        }
      } catch (err) {
        setError(err.message || 'Registration failed');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <p className="text-gray-400 mt-2">
            {isLogin 
              ? 'Sign in to continue to Anime Music Quiz' 
              : 'Join the ultimate anime music challenge'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name field (registration only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                placeholder="Your username"
                required={!isLogin}
              />
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-orange-500 text-white"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-orange-500 text-white"
              placeholder="••••••••"
              required
              minLength={6}
            />
            {!isLogin && (
              <p className="text-xs text-gray-400 mt-1">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Switch between login/register */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => router.push(isLogin ? '/register' : '/login')}
              className="text-orange-400 hover:text-orange-300 font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Social login buttons */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-center text-gray-400 text-sm mb-4">Or continue with</p>
          <div className="flex flex-col sm:flex-row gap-3">
            
            {/* Google Button */}
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            
            {/* Facebook Button */}
            <button
              onClick={() => signIn('facebook', { callbackUrl: '/dashboard' })}
              className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/>
              </svg>
              Facebook
            </button>
            
            {/* MAL Button (disabled for now) */}
            <button
              disabled
              className="flex-1 py-2 bg-white/10 rounded-lg text-gray-400 cursor-not-allowed flex items-center justify-center gap-2"
            >
              🎌 MAL
            </button>
          </div>
          
          {/* Note about MAL */}
          <p className="text-xs text-gray-500 text-center mt-3">
            MAL integration coming in Phase 3!
          </p>
        </div>
      </div>
    </div>
  );
}