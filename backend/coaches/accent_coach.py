"""
Accent Coach module - handles Gemini Live API session management using ADK
Orchestrates real-time coaching interactions with users
"""

import logging
import asyncio
import base64
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

from google.genai import types
from google.adk.agents.llm_agent import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions.in_memory_session_service import InMemorySessionService
from google.adk.agents.live_request_queue import LiveRequestQueue
from google.adk.agents.run_config import RunConfig

logger = logging.getLogger(__name__)


class AccentCoach:
    """
    Manages coaching sessions and state using Agent Development Kit (ADK)
    Handles real-time audio and vision streaming
    """
    
    def __init__(self, session_id: str, user_id: str, model: str, api_key: str, system_prompt: str):
        """Initialize AccentCoach"""
        self.session_id = session_id
        self.user_id = user_id
        self.model_name = model
        self.api_key = api_key
        self.system_prompt = system_prompt
        
        # Initialize ADK components with Tools
        tool_definitions = [types.Tool(function_declarations=[
            types.FunctionDeclaration(
                name=t["name"],
                description=t["description"],
                parameters=types.Schema(**t["parameters"])
            ) for t in config.TOOLS
        ])]

        self.agent = LlmAgent(
            name="lumina_coach",
            description="A premium, multimodal AI Language & Culture Coach.",
            instruction=self.system_prompt,
            model=self.model_name,
            tools=tool_definitions
        )
        
        self.session_service = InMemorySessionService()
        self.runner = Runner(
            app_name="LiveAccentCoach",
            agent=self.agent,
            session_service=self.session_service,
            auto_create_session=True
        )
        
        self.request_queue = LiveRequestQueue()
        self.run_config = RunConfig(
            response_modalities=["AUDIO"],
            input_audio_transcription={},
            output_audio_transcription={},
        )
        
        # Services
        from services.visual_aid_service import get_visual_aid_service
        self.visual_service = get_visual_aid_service(api_key, config.GCP_PROJECT_ID)
        
        self.live_task = None
        self.is_active = False
        self.start_time = None
        self.scores = []
        
        # Queue for results to be consumed by WebSocket handler
        self.response_queue = asyncio.Queue()
        
        logger.info(f"Initialized Agentic ADK AccentCoach for session {session_id}")
    
    async def start_session(self) -> bool:
        """Start the live coaching session"""
        try:
            self.is_active = True
            self.start_time = datetime.now(timezone.utc)
            self.scores = []
            
            # Start the ADK live runner in the background
            self.live_task = asyncio.create_task(self._run_live_loop())
            
            logger.info(f"ADK session {self.session_id} started")
            return True
        except Exception as e:
            logger.error(f"Error starting ADK session: {e}", exc_info=True)
            self.is_active = False
            return False
            
    async def _run_live_loop(self):
        """Processes the live event stream from ADK Runner"""
        from services.pronunciation import PronunciationScorer
        
        try:
            async for event in self.runner.run_live(
                user_id=self.user_id,
                session_id=self.session_id,
                live_request_queue=self.request_queue,
                run_config=self.run_config
            ):
                if not self.is_active:
                    break
                    
                # Handle different event types
                if event.content:
                    # Model response text (if any)
                    text = ""
                    for part in event.content.parts:
                        if part.text:
                            text += part.text
                    
                    if text:
                        logger.debug(f"Received text feedback: {text}")
                        # Parse feedback using PronunciationScorer
                        accuracy = PronunciationScorer.extract_score_from_feedback(text)
                        corrections = PronunciationScorer.extract_corrections(text)
                        tips = PronunciationScorer.extract_tips(text)
                        
                        self.scores.append(accuracy)
                        
                        result = {
                            "type": "coaching_response",
                            "feedback": text,
                            "accuracy_score": accuracy,
                            "corrections": corrections,
                            "tips": tips,
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        }
                        await self.response_queue.put(result)
                
                elif event.input_transcription:
                    # What the user said
                    text = event.input_transcription.text
                    if text:
                        await self.response_queue.put({
                            "type": "user_transcript",
                            "text": text
                        })
                
                elif event.output_transcription:
                    # What the agent said
                    text = event.output_transcription.text
                    if text:
                        await self.response_queue.put({
                            "type": "coach_transcript",
                            "text": text
                        })
                
                # Handling raw audio output (inline_data)
                elif hasattr(event, 'actions') and event.actions and event.actions.blob:
                    blob = event.actions.blob
                    if blob.mime_type.startswith("audio/"):
                        await self.response_queue.put({
                            "type": "audio",
                            "audio": base64.b64encode(blob.data).decode("utf-8")
                        })
                
                # Handle Tool Calls (Function Calling)
                elif hasattr(event, 'tool_calls') and event.tool_calls:
                    for tool_call in event.tool_calls:
                        if tool_call.function_call:
                            name = tool_call.function_call.name
                            args = tool_call.function_call.args
                            
                            logger.info(f"Tool call received: {name}({args})")
                            
                            if name == "generate_visual_aid":
                                visual_data = await self.visual_service.generate_image(
                                    prompt=args.get("prompt"),
                                    mode=args.get("mode", "coaching")
                                )
                                if visual_data:
                                    await self.response_queue.put({
                                        "type": "visual_aid",
                                        "visual": visual_data
                                    })
                                    # Send tool response back to Gemini (optional in some ADK versions, but good practice)
                                    # self.request_queue.send_tool_response(...) 
                            
                            elif name == "get_pronunciation_guide":
                                # Mock guide response
                                guide = f"Phonetic guide for {args.get('word')}: /phə-net-ik/"
                                await self.response_queue.put({
                                    "type": "text",
                                    "text": guide
                                })

        except asyncio.CancelledError:
            logger.info(f"ADK live loop cancelled for {self.session_id}")
        except Exception as e:
            logger.error(f"Error in ADK live loop: {e}", exc_info=True)
            await self.response_queue.put({"type": "error", "message": f"Coach connection error: {str(e)}"})
        finally:
            self.is_active = False

    async def send_audio_chunk(self, audio_data: bytes) -> None:
        """Send raw audio bytes to Gemini"""
        if self.is_active:
            blob = types.Blob(data=audio_data, mime_type="audio/pcm;rate=16000")
            self.request_queue.send_realtime(blob)
            
    async def send_image_frame(self, image_data: bytes) -> None:
        """Send raw image bytes (JPEG) for vision analysis"""
        if self.is_active:
            blob = types.Blob(data=image_data, mime_type="image/jpeg")
            self.request_queue.send_realtime(blob)
            
    async def get_next_response(self) -> Optional[Dict[str, Any]]:
        """Get the next event from the response queue"""
        try:
            return await self.response_queue.get()
        except asyncio.CancelledError:
            return None
    
    async def end_session(self) -> Dict[str, Any]:
        """Stop the session and return final metrics"""
        self.is_active = False
        self.request_queue.close()
        
        if self.live_task:
            self.live_task.cancel()
            try:
                await self.live_task
            except asyncio.CancelledError:
                pass
        
        duration = (datetime.now(timezone.utc) - self.start_time).total_seconds() if self.start_time else 0
        average_score = sum(self.scores) / len(self.scores) if self.scores else 0
        
        session_summary = {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "duration": duration,
            "num_utterances": len(self.scores),
            "average_accuracy": average_score,
            "best_accuracy": max(self.scores) if self.scores else 0,
            "scores": self.scores
        }
        
        logger.info(f"ADK Session ended - Avg: {average_score}%")
        return session_summary
    
    def get_session_status(self) -> Dict[str, Any]:
        """Get current session status"""
        if not self.is_active or not self.start_time:
            return {"status": "inactive"}
        
        duration = (datetime.now(timezone.utc) - self.start_time).total_seconds()
        average_score = sum(self.scores) / len(self.scores) if self.scores else 0
        
        return {
            "status": "active",
            "session_id": self.session_id,
            "duration_seconds": duration,
            "utterances_processed": len(self.scores),
            "current_average_score": average_score
        }
