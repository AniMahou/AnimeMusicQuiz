// app/test-db/page.js
// Test page to verify Supabase connection and database operations
// Navigate to http://localhost:3000/test-db to test

'use client';  // This needs to run in the browser

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

export default function TestDatabasePage() {
  // State for our test results
  const [connectionStatus, setConnectionStatus] = useState('testing')
  const [errorMessage, setErrorMessage] = useState('')
  const [testResults, setTestResults] = useState([])
  
  // Run tests when page loads
  useEffect(() => {
    runAllTests()
  }, [])
  
  // Helper to add a test result
  function addResult(testName, success, details = '') {
    setTestResults(prev => [
      ...prev,
      { testName, success, details, timestamp: new Date().toLocaleTimeString() }
    ])
  }
  
  // Main test runner
  async function runAllTests() {
    setConnectionStatus('running')
    setTestResults([])
    
    // TEST 1: Check if Supabase client is configured
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (url && url.startsWith('https://')) {
        addResult('Environment Variables', true, `URL configured: ${url.substring(0, 30)}...`)
      } else {
        addResult('Environment Variables', false, 'Missing or invalid NEXT_PUBLIC_SUPABASE_URL')
      }
    } catch (err) {
      addResult('Environment Variables', false, err.message)
    }
    
    // TEST 2: Test basic connection (simple query)
    try {
      const { data, error } = await supabase
        .from('lobbies')
        .select('count', { count: 'exact', head: true })
      
      if (error) throw error
      addResult('Database Connection', true, 'Successfully connected to Supabase')
    } catch (err) {
      addResult('Database Connection', false, err.message)
      setConnectionStatus('failed')
      setErrorMessage(err.message)
      return
    }
    
    // TEST 3: Test inserting data (requires auth - will fail, that's OK)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert({ id: 'test-123', email: 'test@example.com' })
      
      // We expect this to fail because of RLS (no user logged in)
      if (error) {
        addResult('RLS Policy', true, 'Correctly blocked insert without auth (RLS working)')
      } else {
        addResult('RLS Policy', false, 'Insert succeeded without auth! RLS might be disabled')
      }
    } catch (err) {
      addResult('RLS Policy', true, 'RLS blocking unauthorized access as expected')
    }
    
    // TEST 4: Check if tables exist
    const tableNames = ['user_profiles', 'user_anime', 'lobbies', 'lobby_players', 'games', 'game_rounds']
    
    for (const tableName of tableNames) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('count', { count: 'exact', head: true })
        
        if (!error) {
          addResult(`Table: ${tableName}`, true, 'Table exists and accessible')
        } else {
          addResult(`Table: ${tableName}`, false, error.message)
        }
      } catch (err) {
        addResult(`Table: ${tableName}`, false, err.message)
      }
    }
    
    setConnectionStatus('complete')
  }
  
  // Helper to get status color
  function getStatusColor() {
    if (connectionStatus === 'testing') return 'text-yellow-400'
    if (connectionStatus === 'running') return 'text-blue-400'
    if (connectionStatus === 'failed') return 'text-red-400'
    return 'text-green-400'
  }
  
  return (
    <>
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Database Connection Test</h1>
        <p className="text-gray-400 mb-8">
          This page tests your Supabase connection and verifies all tables exist.
        </p>
        
        {/* Status Card */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Connection Status</h2>
              <p className={`text-lg font-medium ${getStatusColor()}`}>
                {connectionStatus === 'testing' && '⏳ Waiting to test...'}
                {connectionStatus === 'running' && '🔄 Running tests...'}
                {connectionStatus === 'failed' && '❌ Connection Failed'}
                {connectionStatus === 'complete' && '✅ Tests Complete'}
              </p>
            </div>
            
            {/* Rerun button */}
            <button
              onClick={runAllTests}
              disabled={connectionStatus === 'running'}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition disabled:opacity-50"
            >
              {connectionStatus === 'running' ? 'Running...' : 'Run Tests Again'}
            </button>
          </div>
          
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 font-mono text-sm">{errorMessage}</p>
            </div>
          )}
        </div>
        
        {/* Test Results */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold">Test Results</h2>
          </div>
          
          <div className="divide-y divide-white/10">
            {testResults.length === 0 && connectionStatus === 'testing' && (
              <div className="px-6 py-8 text-center text-gray-400">
                Click "Run Tests" to start checking your database connection
              </div>
            )}
            
            {testResults.length === 0 && connectionStatus === 'testing' && (
              <div className="px-6 py-8 text-center text-gray-400">
                Waiting for tests to run...
              </div>
            )}
            
            {testResults.map((result, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {result.success ? (
                        <span className="text-green-400">✅</span>
                      ) : (
                        <span className="text-red-400">❌</span>
                      )}
                      <span className="font-medium">{result.testName}</span>
                    </div>
                    {result.details && (
                      <p className="text-sm text-gray-400 font-mono mt-1">
                        {result.details}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{result.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* What to do next based on results */}
        {connectionStatus === 'complete' && (
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h3 className="font-semibold text-blue-400 mb-2">📋 Next Steps</h3>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>If all tests passed → Your database is ready for Phase 2 (Authentication)</li>
              <li>If table tests failed → Run the SQL migration again in Supabase</li>
              <li>If connection failed → Check your .env.local keys</li>
            </ul>
          </div>
        )}
      </main>
    </>
  )
}