"""
Audio processing module
Handles audio encoding, decoding, and chunking
"""

import logging
import base64
from typing import List, Tuple
import struct

logger = logging.getLogger(__name__)


class AudioProcessor:
    """Processes audio data for Gemini Live API"""
    
    SAMPLE_RATE = 16000
    CHUNK_SIZE = 512
    
    @staticmethod
    def validate_pcm_audio(audio_bytes: bytes) -> Tuple[bool, str]:
        """Validate PCM audio format"""
        if not audio_bytes:
            return False, "Empty audio"
        if len(audio_bytes) % 2 != 0:
            return False, "Audio size must be even"
        return True, ""
    
    @staticmethod
    def chunk_audio(audio_data: bytes, chunk_size: int = 320) -> List[bytes]:
        """Split audio into 20ms chunks"""
        chunks = []
        for i in range(0, len(audio_data), chunk_size):
            chunk = audio_data[i:i + chunk_size]
            if chunk:
                chunks.append(chunk)
        return chunks
    
    @staticmethod
    def encode_audio_to_base64(audio_bytes: bytes) -> str:
        """Encode audio to base64"""
        return base64.b64encode(audio_bytes).decode('utf-8')
    
    @staticmethod
    def decode_audio_from_base64(encoded_audio: str) -> bytes:
        """Decode base64 audio"""
        return base64.b64decode(encoded_audio.encode('utf-8'))
    
    @staticmethod
    def decode_base64(encoded_audio: str) -> bytes:
        """Decode base64 audio (alias for compatibility)"""
        return AudioProcessor.decode_audio_from_base64(encoded_audio)
    
    @staticmethod
    def get_audio_level(audio_bytes: bytes) -> float:
        """Calculate RMS audio level (0-1)"""
        if len(audio_bytes) < 2:
            return 0.0
        num_samples = len(audio_bytes) // 2
        samples = struct.unpack(f'{num_samples}h', audio_bytes)
        sum_squares = sum(s ** 2 for s in samples)
        rms = (sum_squares / num_samples) ** 0.5
        normalized_rms = rms / 32767.0
        return min(1.0, normalized_rms)
