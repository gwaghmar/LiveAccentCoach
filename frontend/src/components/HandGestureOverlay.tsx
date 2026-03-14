/**
 * HandGestureOverlay component
 * Shows visual feedback for hand gestures
 */

'use client';

import React from 'react';
import { GestureDetection } from '../types';

interface HandGestureOverlayProps {
  gesture: GestureDetection;
  isThumbsUp: boolean;
  isThumbsDown: boolean;
}

export default function HandGestureOverlay({
  gesture,
  isThumbsUp,
  isThumbsDown,
}: HandGestureOverlayProps) {
  const getGestureLabel = () => {
    if (gesture.gesture === 'none') return 'No gesture detected';
    if (gesture.gesture === 'thumbs_up') return '👍 Thumbs Up';
    if (gesture.gesture === 'thumbs_down') return '👎 Thumbs Down';
    return '';
  };

  const getConfidenceColor = () => {
    if (gesture.confidence < 0.5) return 'text-red-500';
    if (gesture.confidence < 0.7) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg">
      <div className="text-lg font-bold">{getGestureLabel()}</div>
      <div className={`text-sm ${getConfidenceColor()}`}>
        Confidence: {Math.round(gesture.confidence * 100)}%
      </div>
      <div className="text-xs text-gray-300 mt-2">
        Hold duration: {Math.round(gesture.holdDuration)}ms
      </div>

      {/* Action hints */}
      {isThumbsUp && gesture.confidence >= 0.7 && (
        <div className="mt-3 text-green-400 animate-pulse">
          ✓ Ready to start coaching!
        </div>
      )}
      {isThumbsDown && gesture.confidence >= 0.7 && (
        <div className="mt-3 text-red-400 animate-pulse">
          ✗ Ready to stop coaching!
        </div>
      )}
    </div>
  );
}
