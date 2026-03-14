/**
 * GestureHint component
 * displays instructions for hand gestures
 */

'use client';

import React from 'react';

export default function GestureHint() {
  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
      <h3 className="text-lg font-bold text-blue-900 mb-3">Hand Gesture Controls</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center">
          <div className="text-4xl mb-2">👍</div>
          <p className="text-sm font-semibold text-blue-800">Thumbs Up</p>
          <p className="text-xs text-blue-600">Start Coaching</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-4xl mb-2">👎</div>
          <p className="text-sm font-semibold text-blue-800">Thumbs Down</p>
          <p className="text-xs text-blue-600">Stop Coaching</p>
        </div>
      </div>
      <p className="text-xs text-blue-600 mt-3">
        💡 Hold gesture for 0.5 seconds for it to register
      </p>
    </div>
  );
}
