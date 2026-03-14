/**
 * Gesture detection utility
 * Identifies hand gestures from MediaPipe hand landmarks
 */

import { MediaPipeLandmark, GestureDetection } from '../types';

export class GestureDetector {
  /**
   * Detect if hand is showing thumbs up gesture
   */
  static isThumbsUp(landmarks: MediaPipeLandmark[]): boolean {
    if (landmarks.length < 21) return false;
    
    // Thumb landmarks: 1, 2, 3, 4
    // Palm landmarks: 0, 5, 9, 13, 17
    const thumb = landmarks[4];
    const indexBase = landmarks[5];
    const palmBase = landmarks[0];
    
    // Thumbs up: thumb is above palm center and pointing upward
    const thumbAbovePalm = thumb.y < palmBase.y - 0.1;
    const thumbToTheRight = Math.abs(thumb.x - palmBase.x) < 0.05;
    
    return thumbAbovePalm && thumbToTheRight;
  }
  
  /**
   * Detect if hand is showing thumbs down gesture
   */
  static isThumbsDown(landmarks: MediaPipeLandmark[]): boolean {
    if (landmarks.length < 21) return false;
    
    const thumb = landmarks[4];
    const palmBase = landmarks[0];
    
    // Thumbs down: thumb is below palm center and pointing downward
    const thumbBelowPalm = thumb.y > palmBase.y + 0.1;
    const thumbToTheRight = Math.abs(thumb.x - palmBase.x) < 0.05;
    
    return thumbBelowPalm && thumbToTheRight;
  }
  
  /**
   * Calculate hand confidence based on landmark visibility
   */
  static calculateConfidence(landmarks: MediaPipeLandmark[]): number {
    if (landmarks.length === 0) return 0;
    
    const visibleCount = landmarks.filter(l => (l.visibility ?? 1) > 0.5).length;
    return (visibleCount / landmarks.length) * 100;
  }
  
  /**
   * Detect gesture with extended recognition
   */
  static detectGesture(
    landmarks: MediaPipeLandmark[],
    previousGesture: GestureDetection | null,
    holdThresholdMs: number = 500
  ): GestureDetection {
    const confidence = this.calculateConfidence(landmarks);
    
    let gesture: 'thumbs_up' | 'thumbs_down' | 'none' = 'none';
    
    if (this.isThumbsUp(landmarks)) {
      gesture = 'thumbs_up';
    } else if (this.isThumbsDown(landmarks)) {
      gesture = 'thumbs_down';
    }
    
    const holdDuration =
      previousGesture && previousGesture.gesture === gesture
        ? previousGesture.holdDuration + 33 // ~33ms per frame at 30fps
        : 0;
    
    return {
      gesture,
      confidence,
      holdDuration,
    };
  }
}
