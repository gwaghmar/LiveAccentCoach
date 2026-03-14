"""
Pydantic models for data validation and serialization
"""

from pydantic import BaseModel
from typing import List, Optional


class AudioChunk(BaseModel):
    """Audio chunk from frontend"""
    data: bytes
    timestamp: float
    sequence_number: int


class CoachingResponse(BaseModel):
    """Coaching response from Gemini"""
    transcript: str
    feedback: str
    accuracy_score: int
    corrections: List[str]
    tips: List[str]


class SessionData(BaseModel):
    """Coaching session data"""
    user_id: str
    timestamp: float
    duration: float
    accuracy_scores: List[int]
    total_score: int
    feedback_text: str


class RecordingUploadRequest(BaseModel):
    """Recording upload payload"""
    audio_base64: str
