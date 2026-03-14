/**
 * TypeScript type definitions for Live Accent Coach frontend
 */

export interface MediaPipeLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface FaceLandmarks {
  landmarks: MediaPipeLandmark[];
  blendShapes: BlendShape[];
}

export interface BlendShape {
  categoryName: string;
  score: number;
}

export interface HandLandmarks {
  landmarks: MediaPipeLandmark[];
  handedness: 'Left' | 'Right';
  confidence: number;
}

export interface GestureDetection {
  gesture: 'thumbs_up' | 'thumbs_down' | 'none';
  confidence: number;
  holdDuration: number;
}

export interface CoachingResponse {
  type?: 'coaching_response' | 'user_transcript' | 'coach_transcript' | 'visual_aid' | 'error' | 'session_started' | 'session_ended';
  transcript?: string;
  feedback?: string;
  accuracyScore?: number;
  corrections: string[];
  tips: string[];
  recordingUrl?: string;
  visual?: {
    url: string;
    prompt: string;
    type: string;
  };
  text?: string;
}

export type WebSocketResponse = CoachingResponse;

export interface SessionStats {
  duration: number;
  averageScore: number;
  totalUtterances: number;
  timestamp: number;
}

export interface AudioChunk {
  data: Float32Array;
  timestamp: number;
  sequenceNumber: number;
}
