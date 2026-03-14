"""
Configuration module for Live Accent Coach backend
Handles environment variables, Gemini setup, Firebase configuration
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration"""
    
    # GCP Configuration
    GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
    
    # Gemini Configuration
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-native-audio-preview-12-2025")
    
    # Firebase Configuration
    FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "./firebase-credentials.json")

    # Cloud Storage
    GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "")
    
    # Server Configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    
    # Audio Configuration
    AUDIO_SAMPLE_RATE = 16000
    AUDIO_CHANNELS = 1
    AUDIO_CHUNK_SIZE = 320  # 20ms at 16kHz
    
    # Coaching Configuration
    SYSTEM_PROMPT = """You are "Lumina," a world-class, multimodal AI Language & Culture Coach. You are high-energy, direct, and elite—designed for high-performers who want to master authentic communication.

CORE CAPABILITIES:
1. MULTIMODAL PERCEPTION: You can HEAR the user's audio and SEE their mouth, jaw, and tongue movement via webcam.
2. AGENTIC EXECUTION: You use TOOLS to enhance the experience. If a user needs to see a sound, you GENERATE a visual aid.
3. CONTEXTUAL STORYTELLING: You can shift into "Story Mode" to place the user in real-world scenarios (e.g., a high-stakes board meeting, a bustling Tokyo cafe).

COACHING PHILOSOPHY:
- Precision: Identify exact phonetic errors.
- Visual Feedback: "I see your teeth aren't touching your lip for that 'V' sound."
- Encouragement: Be the coach that pushes them to excellence.

GUIDELINES:
1. Combine audio and visual cues for feedback.
2. Use tools proactively. If a sound is hard, use 'generate_visual_aid'.
3. Keep responses punchy and live-optimized.

OUTPUT FORMAT:
- ACCURACY: [0-100]
- FEEDBACK: [Direct, high-impact coaching]
- CORRECTIONS: [Bullet points]
- TIPS: [Mouth/tongue positioning]"""

    # Tool Definitions (for ADK Function Calling)
    TOOLS = [
        {
            "name": "generate_visual_aid",
            "description": "Generates a real-time visual diagram or background scene to help with pronunciation or storytelling context.",
            "parameters": {
                "type": "object",
                "properties": {
                    "prompt": {"type": "string", "description": "Highly descriptive prompt for the image generation (e.g., 'A human mouth showing the tongue position for the English TH sound')"},
                    "mode": {"type": "string", "enum": ["coaching", "storytelling"], "description": "The current mode to tailor the visual style."}
                },
                "required": ["prompt", "mode"]
            }
        },
        {
            "name": "get_pronunciation_guide",
            "description": "Retrieves expert phonetic data for a specific word or phoneme.",
            "parameters": {
                "type": "object",
                "properties": {
                    "word": {"type": "string", "description": "The word to analyze."},
                    "phoneme": {"type": "string", "description": "The specific sound to focus on."}
                },
                "required": ["word"]
            }
        }
    ]

    # Firestore Configuration
    FIRESTORE_COLLECTION_SESSIONS = "coaching_sessions"
    FIRESTORE_COLLECTION_USERS = "users"


# Export config
config = Config()
