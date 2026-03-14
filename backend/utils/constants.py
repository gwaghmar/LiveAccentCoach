"""
Constants module
Defines application-wide constants
"""

# Audio Constants
AUDIO_SAMPLE_RATE = 16000
AUDIO_CHANNELS = 1
AUDIO_CHUNK_DURATION_MS = 20
AUDIO_CHUNK_SIZE = 320  # 20ms at 16kHz

# WebSocket Constants
WS_MESSAGE_TYPE_AUDIO = "audio"
WS_MESSAGE_TYPE_RESPONSE = "response"
WS_MESSAGE_TYPE_STATUS = "status"

# Coaching Constants
MIN_ACCURACY_SCORE = 0
MAX_ACCURACY_SCORE = 100
DEFAULT_SCORE = 50

# Session Constants
MAX_SESSION_DURATION_SECONDS = 900  # 15 minutes
SESSION_INACTIVITY_TIMEOUT_SECONDS = 300  # 5 minutes

# Firestore Constants
FIRESTORE_COLLECTION_SESSIONS = "coaching_sessions"
FIRESTORE_COLLECTION_USERS = "users"
FIRESTORE_COLLECTION_STATS = "user_stats"
