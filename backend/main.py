"""
LiveAccentCoach Backend - FastAPI server for real-time pronunciation coaching
Main entry point for WebSocket connections and HTTP endpoints
"""

import logging
import asyncio
import uuid
import json
import base64
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from config import config
from handlers.websocket import WebSocketHandler
from handlers.audio import AudioProcessor
from coaches.accent_coach import AccentCoach
from services.firestore import FirestoreService
from services.cloud_storage import CloudStorageService
from models.schemas import RecordingUploadRequest

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Global services
firestore_service = None
cloud_storage_service = None
ws_handler = WebSocketHandler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle - startup and shutdown"""
    global firestore_service, cloud_storage_service
    
    # Startup
    logger.info("Starting LiveAccentCoach backend...")
    firestore_service = FirestoreService(config.GCP_PROJECT_ID)
    cloud_storage_service = CloudStorageService(config.GCS_BUCKET_NAME)
    logger.info("Backend started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down backend...")


# Initialize FastAPI app
app = FastAPI(
    title="LiveAccentCoach",
    description="Real-time AI pronunciation coaching with Gemini Live API",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "LiveAccentCoach"}


@app.get("/users/{user_id}/sessions")
async def get_user_sessions(user_id: str):
    """Retrieve all stored coaching sessions for a user."""
    if firestore_service is None:
        return {"user_id": user_id, "sessions": []}

    sessions = await firestore_service.get_user_sessions(user_id)
    return {
        "user_id": user_id,
        "count": len(sessions),
        "sessions": sessions,
    }


@app.get("/users/{user_id}/progress")
async def get_user_progress(user_id: str):
    """Return aggregate progress metrics for a user."""
    if firestore_service is None:
        return {
            "user_id": user_id,
            "session_count": 0,
            "average_accuracy": 0,
            "best_accuracy": 0,
            "total_utterances": 0,
        }

    sessions = await firestore_service.get_user_sessions(user_id)
    if not sessions:
        return {
            "user_id": user_id,
            "session_count": 0,
            "average_accuracy": 0,
            "best_accuracy": 0,
            "total_utterances": 0,
        }

    averages = [float(s.get("average_accuracy", 0) or 0) for s in sessions]
    best_scores = [float(s.get("best_accuracy", 0) or 0) for s in sessions]
    total_utterances = sum(int(s.get("num_utterances", 0) or 0) for s in sessions)

    return {
        "user_id": user_id,
        "session_count": len(sessions),
        "average_accuracy": round(sum(averages) / len(averages), 2),
        "best_accuracy": round(max(best_scores), 2),
        "total_utterances": total_utterances,
    }


@app.post("/users/{user_id}/sessions/{session_id}/recording")
async def upload_session_recording(
    user_id: str,
    session_id: str,
    payload: RecordingUploadRequest,
):
    """Upload a WAV recording for a coaching session."""
    if cloud_storage_service is None:
        raise HTTPException(status_code=503, detail="Storage service unavailable")

    try:
        audio_bytes = base64.b64decode(payload.audio_base64)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid base64 audio payload") from exc

    recording_url = await cloud_storage_service.upload_session_recording(
        user_id=user_id,
        session_id=session_id,
        audio_data=audio_bytes,
    )

    if not recording_url:
        raise HTTPException(status_code=500, detail="Failed to store recording")

    return {
        "user_id": user_id,
        "session_id": session_id,
        "recording_url": recording_url,
    }


@app.websocket("/ws/coach")
async def websocket_coaching_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for coaching sessions
    Handles real-time audio streaming and coaching responses
    """
    session_id = str(uuid.uuid4())
    user_id = str(uuid.uuid4())
    
    logger.info(f"New connection attempt - Session: {session_id}")
    
    try:
        await websocket.accept()
        logger.info(f"Client connected - Session: {session_id}")
        
        coach = AccentCoach(
            session_id=session_id,
            user_id=user_id,
            model=config.GEMINI_MODEL,
            api_key=config.GOOGLE_API_KEY,
            system_prompt=config.SYSTEM_PROMPT
        )
        
        session_started = await coach.start_session()
        if not session_started:
            await websocket.send_json(
                {"type": "error", "message": "Failed to start session"}
            )
            await websocket.close()
            return
        
        await websocket.send_json(
            {"type": "session_started", "session_id": session_id}
        )
        logger.info(f"Session started - ID: {session_id}")
        
        async def receive_from_client():
            try:
                while True:
                    data = await websocket.receive_text()
                    try:
                        message = json.loads(data)
                    except json.JSONDecodeError:
                        logger.error("Invalid JSON received")
                        await websocket.send_json({"type": "error", "message": "Invalid JSON"})
                        continue
                        
                    message_type = message.get("type")
                    
                    if message_type == "audio":
                        audio_b64 = message.get("audio")
                        if not audio_b64:
                            await websocket.send_json({"type": "error", "message": "Missing audio data"})
                            continue
                            
                        try:
                            audio_bytes = AudioProcessor.decode_base64(audio_b64)
                        except Exception as e:
                            logger.error(f"Audio decode error: {e}")
                            await websocket.send_json({"type": "error", "message": "Invalid audio format"})
                            continue
                            
                        is_valid, error_msg = AudioProcessor.validate_pcm_audio(audio_bytes)
                        if not is_valid:
                            logger.error(f"Invalid PCM audio format: {error_msg}")
                            await websocket.send_json({"type": "error", "message": f"Invalid PCM format: {error_msg}"})
                            continue
                            
                        await coach.send_audio_chunk(audio_bytes)
                        
                    elif message_type == "image":
                        image_b64 = message.get("image")
                        if not image_b64:
                            await websocket.send_json({"type": "error", "message": "Missing image data"})
                            continue
                            
                        try:
                            # Strip prefix if it exists (e.g. data:image/jpeg;base64,)
                            if "," in image_b64:
                                image_b64 = image_b64.split(",")[1]
                            image_bytes = base64.b64decode(image_b64)
                            await coach.send_image_frame(image_bytes)
                        except Exception as e:
                            logger.error(f"Image decode error: {e}")
                            await websocket.send_json({"type": "error", "message": "Invalid image format"})
                            continue
                        
                    elif message_type == "status":
                        status_response = coach.get_session_status()
                        await websocket.send_json({"type": "status_response", **status_response})
                        
                    elif message_type == "end_session":
                        session_summary = await coach.end_session()

                        final_audio_b64 = message.get("final_audio_base64") or message.get("audio_base64")
                        if final_audio_b64 and cloud_storage_service:
                            try:
                                final_audio_bytes = AudioProcessor.decode_base64(final_audio_b64)
                                recording_url = await cloud_storage_service.upload_session_recording(
                                    user_id=user_id,
                                    session_id=session_id,
                                    audio_data=final_audio_bytes,
                                )
                                if recording_url:
                                    session_summary["recording_url"] = recording_url
                            except Exception as e:
                                logger.warning(f"Failed to store final session recording: {e}")
                        
                        if firestore_service:
                            try:
                                await firestore_service.save_session(user_id, session_summary)
                                logger.info(f"Session saved to Firestore - ID: {session_id}")
                            except Exception as e:
                                logger.error(f"Error saving session: {e}")
                        
                        await websocket.send_json({
                            "type": "session_ended",
                            "session_id": session_id,
                            "user_id": user_id,
                            **session_summary
                        })
                        logger.info(f"Session ended - ID: {session_id}")
                        return
                    else:
                        logger.warning(f"Unknown message type: {message_type}")
                        await websocket.send_json({"type": "error", "message": f"Unknown message type: {message_type}"})
            except WebSocketDisconnect:
                logger.info(f"Client disconnected inside receive loop - Session: {session_id}")
            except Exception as e:
                logger.error(f"Error in client receive loop: {e}", exc_info=True)

        async def send_to_client():
            try:
                while coach.is_active or not coach.response_queue.empty():
                    # Check periodically if coach is still active
                    if not coach.is_active and coach.response_queue.empty():
                        break
                    try:
                        # Timeout allows checking the while condition safely
                        response = await asyncio.wait_for(coach.get_next_response(), timeout=1.0)
                        if response is None:
                            continue
                            
                        if "error" in response:
                            await websocket.send_json({
                                "type": "error",
                                "message": response["error"]
                            })
                            continue

                        # Map response back to the format the frontend expects
                        # In ADK mode, we pass the response directly as it's already well-structured
                        response_type = response.get("type", "coaching_response")
                        
                        response_message = {
                            "type": response_type,
                            "session_id": session_id,
                            **response
                        }
                        
                        await websocket.send_json(response_message)
                        if response_type == "coaching_response":
                            logger.info(f"Coaching response sent - Score: {response.get('accuracy_score')}")
                    except asyncio.TimeoutError:
                        continue
            except Exception as e:
                logger.error(f"Error in send to client loop: {e}", exc_info=True)

        receive_task = asyncio.create_task(receive_from_client())
        send_task = asyncio.create_task(send_to_client())
        
        done, pending = await asyncio.wait(
            [receive_task, send_task],
            return_when=asyncio.FIRST_COMPLETED
        )
        
        for task in pending:
            task.cancel()
            
    except WebSocketDisconnect:
        logger.info(f"Client disconnected - Session: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
    finally:
        try:
            if coach.is_active:
                await coach.end_session()
        except Exception:
            pass
        logger.info(f"Connection closed - Session: {session_id}")


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting Uvicorn server on 0.0.0.0:{port}")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
