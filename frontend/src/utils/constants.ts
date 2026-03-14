/**
 * Constants for frontend
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://live-accent-coach-backend-465539003900.us-central1.run.app';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://live-accent-coach-backend-465539003900.us-central1.run.app';

export const AUDIO_CONFIG = {
  SAMPLE_RATE: 16000,
  CHANNELS: 1,
  CHUNK_DURATION_MS: 32,
  CHUNK_SIZE: 512,
};

export const MEDIAPIPE_CONFIG = {
  MODEL_ASSET_BUFFER: 4000,
  MAX_HANDS: 2,
  MAX_FACES: 1,
  RUNNING_MODE: 'VIDEO' as const,
  DELEGATE: 'GPU' as const,
  FACE_LANDMARKER_PATH: '/models/face_landmarker.task',
  HAND_LANDMARKER_PATH: '/models/hand_landmarker.task',
};


export const GESTURE_CONFIG = {
  CONFIDENCE_THRESHOLD: 0.7,
  HOLD_DURATION_MS: 500,
};

export const AVATAR_CONFIG = {
  MODEL_PATH: '/models/avatar.glb',
  PLACEHOLDER_COLOR: 0xff6b6b,
  SCALE: 1.0,
  POSITION: { x: 0, y: 0, z: -2 },
  SMOOTHING_FACTOR: 0.3,
};


export const AVATAR_REACTIONS = {
  EXCELLENT: {
    threshold: 90,
    action: 'smile_thumbsup',
  },
  GOOD: {
    threshold: 80,
    action: 'smile',
  },
  OK: {
    threshold: 70,
    action: 'neutral',
  },
  NEEDS_WORK: {
    threshold: 0,
    action: 'encouraging_look',
  },
};
