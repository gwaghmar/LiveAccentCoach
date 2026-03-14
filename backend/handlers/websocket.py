"""
WebSocket handler module
Manages bidirectional communication between frontend and backend
"""

import logging
import json
from fastapi import WebSocket, WebSocketDisconnect
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


class WebSocketHandler:
    """Handles WebSocket connections and message routing"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str) -> None:
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected")
    
    def disconnect(self, client_id: str) -> None:
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"Client {client_id} disconnected")
    
    async def receive_message(self, websocket: WebSocket) -> Optional[Dict[str, Any]]:
        try:
            data = await websocket.receive_text()
            return json.loads(data)
        except Exception as e:
            logger.error(f"Error receiving: {e}")
            return None
    
    async def send_response(self, websocket: WebSocket, response: Dict[str, Any]) -> None:
        try:
            await websocket.send_json(response)
        except Exception as e:
            logger.error(f"Error sending: {e}")
