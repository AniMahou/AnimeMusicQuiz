// components/AuthForm.js

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthForm({ mode = 'login' }) {
  const isLogin = mode === 'login';
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
        // LOGIN
        console.log('Logging in with:', email);
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
      
        console.log('Login result:', result);
      
        if (result?.error) {
          setError('Invalid email or password');
          setLoading(false);
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      } else{
        try {
            console.log('Registering user...');
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, name }),
            });
            
            const data = await response.json();
            console.log('Register response:', data);
            
            if (!response.ok) {
              throw new Error(data.error || 'Registration failed');
            }
            
            // Wait a moment for Supabase to process
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Now login
            console.log('Logging in...');
            const loginResult = await signIn('credentials', {
              email,
              password,
              redirect: false,
            });
            
            console.log('Login result:', loginResult);
            
            if (loginResult?.error) {
              setError('Account created! Please login manually.');
              router.push('/login');
            } else {
              router.push('/dashboard');
              router.refresh();
            }
          } catch (err) {
            console.error('Registration error:', err);
            setError(err.message);
            setLoading(false);
          }
        }        
    }

  const handleSocialLogin = (provider) => {
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-orange-500 text-white"
              />
            </div>
          )}

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-orange-500 text-white"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-orange-500 text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex gap-3">
            <button
              onClick={() => handleSocialLogin('google')}
              className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              Google
            </button>
            <button
              onClick={() => handleSocialLogin('facebook')}
              className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              Facebook
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push(isLogin ? '/register' : '/login')}
            className="text-orange-400 hover:text-orange-300"
          >
            {isLogin ? 'Create account' : 'Already have an account?'}
          </button>
        </div>
      </div>
    </div>
  );
}