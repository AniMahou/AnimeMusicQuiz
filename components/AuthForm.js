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

        {/* Social login placeholder (Phase 2.3) */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-center text-gray-400 text-sm mb-4">Or continue with</p>
          <div className="flex gap-3">
            <button 
              disabled
              className="flex-1 py-2 bg-white/10 rounded-lg text-gray-400 cursor-not-allowed"
            >
              Google
            </button>
            <button 
              disabled
              className="flex-1 py-2 bg-white/10 rounded-lg text-gray-400 cursor-not-allowed"
            >
              Facebook
            </button>
            <button 
              disabled
              className="flex-1 py-2 bg-white/10 rounded-lg text-gray-400 cursor-not-allowed"
            >
              MAL
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            Social login coming soon!
          </p>
        </div>
      </div>
    </div>
  );
}