/**
 * useHandGesture hook
 * Detects hand gestures from MediaPipe landmarks
 */

import { useEffect, useRef, useState } from 'react';
import { HandLandmarks, GestureDetection } from '../types';
import { GestureDetector } from '../utils/gestureDetector';
import { GESTURE_CONFIG } from '../utils/constants';

export function useHandGesture(handLandmarks: HandLandmarks | null) {
  const [gesture, setGesture] = useState<GestureDetection>({
    gesture: 'none',
    confidence: 0,
    holdDuration: 0,
  });

  const previousGestureRef = useRef<GestureDetection | null>(null);

  useEffect(() => {
    if (!handLandmarks) {
      setGesture({
        gesture: 'none',
        confidence: 0,
        holdDuration: 0,
      });
      previousGestureRef.current = null;
      return;
    }

    const detected = GestureDetector.detectGesture(
      handLandmarks.landmarks,
      previousGestureRef.current,
      GESTURE_CONFIG.HOLD_DURATION_MS
    );

    setGesture(detected);
    previousGestureRef.current = detected;
  }, [handLandmarks]);

  const isGestureDetected = (g: 'thumbs_up' | 'thumbs_down' | 'none') => {
    return gesture.gesture === g && gesture.confidence >= GESTURE_CONFIG.CONFIDENCE_THRESHOLD;
  };

  return {
    gesture,
    isGestureDetected,
    isThumbsUp: isGestureDetected('thumbs_up'),
    isThumbsDown: isGestureDetected('thumbs_down'),
  };
}
