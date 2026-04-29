// components/LobbySettings.js
// Form to configure lobby settings before creation

'use client';

import { useState } from 'react';

export default function LobbySettings({ onCreate, isLoading }) {
  const [rounds, setRounds] = useState(25);
  const [timePerRound, setTimePerRound] = useState(30);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({ rounds, timePerRound });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rounds Setting */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Number of Rounds: {rounds}
        </label>
        <input
          type="range"
          min="5"
          max="50"
          value={rounds}
          onChange={(e) => setRounds(parseInt(e.target.value))}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>5 (Quick game)</span>
          <span>25 (Standard)</span>
          <span>50 (Marathon)</span>
        </div>
      </div>
      
      {/* Time Per Round Setting */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Time Per Round: {timePerRound} seconds
        </label>
        <input
          type="range"
          min="15"
          max="60"
          step="5"
          value={timePerRound}
          onChange={(e) => setTimePerRound(parseInt(e.target.value))}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>15s (Fast)</span>
          <span>30s (Normal)</span>
          <span>60s (Easy)</span>
        </div>
      </div>
      
      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-sm text-blue-400">
          💡 After creating the lobby, share the 6-digit code with your friends so they can join!
        </p>
      </div>
      
      {/* Create Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
      >
        {isLoading ? 'Creating Lobby...' : '🚀 Create Lobby'}
      </button>
    </form>
  );
}