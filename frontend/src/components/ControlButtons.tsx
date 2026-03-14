/**
 * ControlButtons component
 * UI controls for coaching session
 */

'use client';

import React from 'react';

interface ControlButtonsProps {
  isCoachingActive: boolean;
  onStart: () => void;
  onStop: () => void;
  isMicEnabled: boolean;
  onMicToggle: () => void;
  isLoading: boolean;
}

export default function ControlButtons({
  isCoachingActive,
  onStart,
  onStop,
  isMicEnabled,
  onMicToggle,
  isLoading,
}: ControlButtonsProps) {
  return (
    <div className="flex gap-4 justify-center items-center py-4">
      {!isCoachingActive ? (
        <button
          onClick={onStart}
          disabled={isLoading}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all"
        >
          {isLoading ? (
            <>
              <span className="inline-block animate-spin mr-2">⌛</span>
              Starting...
            </>
          ) : (
            '▶️ Start Coaching'
          )}
        </button>
      ) : (
        <button
          onClick={onStop}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
        >
          ⏹️ Stop Coaching
        </button>
      )}

      <button
        onClick={onMicToggle}
        className={`px-6 py-3 rounded-lg font-bold transition-all ${
          isMicEnabled
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
        }`}
      >
        {isMicEnabled ? '🎤 Mic On' : '🔇 Mic Off'}
      </button>
    </div>
  );
}
