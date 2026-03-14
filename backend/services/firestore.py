"""
Firestore service module
Handles database operations for sessions and user data
"""

import logging
import json
import asyncio
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except Exception:  # pragma: no cover
    firebase_admin = None
    credentials = None
    firestore = None

logger = logging.getLogger(__name__)


class FirestoreService:
    """Manages Firestore database operations"""
    
    def __init__(self, project_id: Optional[str] = None):
        """
        Initialize Firestore service
        
        Args:
            project_id: GCP project ID (optional, uses env var if not provided)
        """
        self.project_id = project_id
        self.collection_sessions = "coaching_sessions"
        self._db = None

        backend_root = Path(__file__).resolve().parents[1]
        self._local_store_path = backend_root / "data" / "sessions_local.json"
        self._local_store_path.parent.mkdir(parents=True, exist_ok=True)

        self._initialize_firestore_client()
        mode = "firestore" if self._db is not None else "local-json-fallback"
        logger.info(
            "FirestoreService initialized for project: %s (mode=%s)",
            self.project_id,
            mode,
        )

    def _initialize_firestore_client(self) -> None:
        """Initialize Firebase Admin SDK + Firestore client if available."""
        if firebase_admin is None or firestore is None:
            logger.warning("firebase-admin not available; using local JSON fallback")
            return

        try:
            if not firebase_admin._apps:
                credentials_path = Path("./firebase-credentials.json")
                if credentials_path.exists() and credentials is not None:
                    firebase_admin.initialize_app(
                        credentials.Certificate(str(credentials_path)),
                        {"projectId": self.project_id} if self.project_id else None,
                    )
                else:
                    firebase_admin.initialize_app(
                        options={"projectId": self.project_id} if self.project_id else None
                    )

            self._db = firestore.client()
        except Exception as e:
            logger.warning("Failed to initialize Firestore client: %s", e)
            self._db = None

    def _read_local_sessions(self) -> List[Dict[str, Any]]:
        if not self._local_store_path.exists():
            return []

        try:
            text = self._local_store_path.read_text(encoding="utf-8").strip()
            if not text:
                return []
            data = json.loads(text)
            return data if isinstance(data, list) else []
        except Exception as e:
            logger.warning("Failed reading local sessions: %s", e)
            return []

    def _write_local_sessions(self, sessions: List[Dict[str, Any]]) -> None:
        self._local_store_path.write_text(
            json.dumps(sessions, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    def _save_session_sync(self, user_id: str, session_data: Dict[str, Any]) -> bool:
        payload = {
            **session_data,
            "user_id": user_id,
            "saved_at": datetime.now(timezone.utc).isoformat(),
        }

        if self._db is not None:
            self._db.collection(self.collection_sessions).add(payload)
            return True

        sessions = self._read_local_sessions()
        sessions.append(payload)
        self._write_local_sessions(sessions)
        return True

    def _get_user_sessions_sync(self, user_id: str) -> List[Dict[str, Any]]:
        if self._db is not None:
            docs = (
                self._db.collection(self.collection_sessions)
                .where("user_id", "==", user_id)
                .stream()
            )
            sessions = [doc.to_dict() for doc in docs]
            sessions.sort(key=lambda s: s.get("saved_at", ""), reverse=True)
            return sessions

        sessions = [s for s in self._read_local_sessions() if s.get("user_id") == user_id]
        sessions.sort(key=lambda s: s.get("saved_at", ""), reverse=True)
        return sessions
    
    async def save_session(self, user_id: str, session_data: Dict[str, Any]) -> bool:
        """
        Save a coaching session to Firestore
        
        Args:
            user_id: User ID
            session_data: Session data to save
            
        Returns:
            bool: True if saved successfully
        """
        try:
            await asyncio.to_thread(self._save_session_sync, user_id, session_data)
            logger.info(f"Session saved for user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Error saving session: {e}")
            return False
    
    async def get_user_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all sessions for a user
        
        Args:
            user_id: User ID
            
        Returns:
            List[Dict]: List of session records
        """
        try:
            sessions = await asyncio.to_thread(self._get_user_sessions_sync, user_id)
            logger.info(f"Retrieved sessions for user {user_id}")
            return sessions
        except Exception as e:
            logger.error(f"Error retrieving sessions: {e}")
            return []
