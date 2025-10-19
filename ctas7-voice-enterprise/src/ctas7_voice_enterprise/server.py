"""
CTAS-7 Enterprise Voice WebSocket Server
Real-time bidirectional voice communication server with conversation management
"""

import asyncio
import json
import time
import uuid
import base64
from typing import Dict, Any, Optional, Set, Callable
from dataclasses import dataclass, asdict
import websockets
from websockets.server import WebSocketServerProtocol
import structlog
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from prometheus_client import Counter, Histogram, Gauge, start_http_server

from .config import VoiceConfig
from .core import VoiceOrchestrator, VoiceResponse
from .agents import VoiceAgentFactory, ConversationContext
from .errors import (
    ErrorHandler, WebSocketError, VoiceAgentError,
    handle_error, ErrorSeverity, ErrorCategory, initialize_error_handler
)

# Prometheus metrics
voice_requests_total = Counter('ctas7_voice_requests_total', 'Total voice synthesis requests', ['agent', 'streaming'])
voice_request_duration = Histogram('ctas7_voice_request_duration_seconds', 'Voice synthesis duration')
active_connections = Gauge('ctas7_voice_active_connections', 'Active WebSocket connections')
conversation_sessions = Gauge('ctas7_voice_conversation_sessions', 'Active conversation sessions')

@dataclass
class ConnectionInfo:
    """Information about a WebSocket connection"""
    connection_id: str
    websocket: WebSocket
    agent_id: Optional[str]
    session_id: Optional[str]
    connect_time: float
    last_activity: float
    user_info: Dict[str, Any]

@dataclass
class VoiceMessage:
    """Voice communication message"""
    message_id: str
    message_type: str  # 'synthesis_request', 'audio_response', 'conversation_start', etc.
    session_id: Optional[str]
    agent_id: Optional[str]
    content: Any
    timestamp: float
    metadata: Dict[str, Any]

class VoiceServer:
    """Main voice communication server"""

    def __init__(self, config: VoiceConfig):
        self.config = config
        self.logger = structlog.get_logger("voice_server")
        self.error_handler = initialize_error_handler(self.logger.logger, config.debug)

        # Core components
        self.orchestrator = VoiceOrchestrator(config)

        # Connection management
        self.connections: Dict[str, ConnectionInfo] = {}
        self.agent_connections: Dict[str, Set[str]] = {}  # agent_id -> connection_ids
        self.conversation_sessions: Dict[str, ConversationContext] = {}

        # FastAPI app
        self.app = self._create_fastapi_app()

        # Message handlers
        self.message_handlers: Dict[str, Callable] = {
            "synthesis_request": self._handle_synthesis_request,
            "conversation_start": self._handle_conversation_start,
            "conversation_end": self._handle_conversation_end,
            "agent_switch": self._handle_agent_switch,
            "ping": self._handle_ping,
            "audio_chunk": self._handle_audio_chunk
        }

        self.logger.info("Voice server initialized",
                        debug_mode=config.debug,
                        max_connections=config.server.max_connections)

    def _create_fastapi_app(self) -> FastAPI:
        """Create and configure FastAPI application"""
        app = FastAPI(
            title="CTAS-7 Enterprise Voice Server",
            description="Real-time voice communication server",
            version="1.0.0",
            debug=self.config.debug
        )

        # CORS middleware
        app.add_middleware(
            CORSMiddleware,
            allow_origins=self.config.server.cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        # Routes
        self._setup_routes(app)

        return app

    def _setup_routes(self, app: FastAPI):
        """Setup FastAPI routes"""

        @app.get("/health")
        async def health_check():
            """Health check endpoint"""
            try:
                health = await self.orchestrator.health_check()
                health["connections"] = {
                    "active": len(self.connections),
                    "by_agent": {agent: len(conns) for agent, conns in self.agent_connections.items()}
                }
                health["conversations"] = len(self.conversation_sessions)
                return health
            except Exception as e:
                self.error_handler.handle_error(e)
                raise HTTPException(status_code=500, detail="Health check failed")

        @app.get("/agents")
        async def get_agents():
            """Get available voice agents"""
            try:
                agents = await self.orchestrator.get_available_agents()

                # Add personality information
                for agent_id, agent_info in agents.items():
                    personality = VoiceAgentFactory.get_agent_personality_info(agent_id)
                    agent_info["personality"] = personality

                return agents
            except Exception as e:
                self.error_handler.handle_error(e)
                raise HTTPException(status_code=500, detail="Failed to get agents")

        @app.post("/synthesize")
        async def synthesize_text(request: Dict[str, Any]):
            """REST endpoint for text synthesis"""
            try:
                agent_id = request.get("agent_id", "natasha")
                text = request.get("text", "")
                streaming = request.get("streaming", False)

                if not text:
                    raise HTTPException(status_code=400, detail="Text is required")

                with voice_request_duration.time():
                    response = await self.orchestrator.synthesize_speech(agent_id, text, streaming)

                voice_requests_total.labels(agent=agent_id, streaming=streaming).inc()

                if response.success:
                    # Return base64 encoded audio
                    audio_b64 = base64.b64encode(response.audio_data).decode('utf-8')
                    return {
                        "success": True,
                        "agent_name": response.agent_name,
                        "text": response.text,
                        "audio_data": audio_b64,
                        "duration": response.duration,
                        "metadata": response.metadata
                    }
                else:
                    raise HTTPException(status_code=500, detail=response.error)

            except Exception as e:
                self.error_handler.handle_error(e)
                raise HTTPException(status_code=500, detail=str(e))

        @app.websocket("/ws")
        async def websocket_endpoint(websocket: WebSocket):
            """Main WebSocket endpoint for real-time communication"""
            await self._handle_websocket_connection(websocket)

    async def _handle_websocket_connection(self, websocket: WebSocket):
        """Handle new WebSocket connection"""
        connection_id = str(uuid.uuid4())

        try:
            # Accept connection
            await websocket.accept()

            # Create connection info
            connection_info = ConnectionInfo(
                connection_id=connection_id,
                websocket=websocket,
                agent_id=None,
                session_id=None,
                connect_time=time.time(),
                last_activity=time.time(),
                user_info={}
            )

            # Store connection
            self.connections[connection_id] = connection_info
            active_connections.inc()

            self.logger.info("WebSocket connection established",
                           connection_id=connection_id,
                           total_connections=len(self.connections))

            # Send welcome message
            await self._send_message(websocket, VoiceMessage(
                message_id=str(uuid.uuid4()),
                message_type="connection_established",
                session_id=None,
                agent_id=None,
                content={
                    "connection_id": connection_id,
                    "available_agents": list((await self.orchestrator.get_available_agents()).keys()),
                    "server_info": {
                        "name": "CTAS-7 Enterprise Voice Server",
                        "version": "1.0.0",
                        "capabilities": ["synthesis", "streaming", "conversations"]
                    }
                },
                timestamp=time.time(),
                metadata={}
            ))

            # Handle messages
            async for raw_message in websocket.iter_text():
                try:
                    await self._process_websocket_message(connection_id, raw_message)
                except Exception as e:
                    self.error_handler.handle_error(e, {"connection_id": connection_id})
                    await self._send_error_message(websocket, str(e))

        except WebSocketDisconnect:
            self.logger.info("WebSocket disconnected", connection_id=connection_id)
        except Exception as e:
            self.error_handler.handle_error(
                WebSocketError(f"WebSocket connection error: {e}", connection_state="error"),
                {"connection_id": connection_id}
            )
        finally:
            # Cleanup connection
            await self._cleanup_connection(connection_id)

    async def _process_websocket_message(self, connection_id: str, raw_message: str):
        """Process incoming WebSocket message"""
        try:
            # Parse message
            message_data = json.loads(raw_message)
            message_type = message_data.get("type")

            if not message_type:
                raise ValueError("Message must have 'type' field")

            # Update connection activity
            if connection_id in self.connections:
                self.connections[connection_id].last_activity = time.time()

            # Create message object
            message = VoiceMessage(
                message_id=message_data.get("message_id", str(uuid.uuid4())),
                message_type=message_type,
                session_id=message_data.get("session_id"),
                agent_id=message_data.get("agent_id"),
                content=message_data.get("content", {}),
                timestamp=time.time(),
                metadata=message_data.get("metadata", {})
            )

            self.logger.debug("Processing WebSocket message",
                            connection_id=connection_id,
                            message_type=message_type,
                            message_id=message.message_id)

            # Route to appropriate handler
            if message_type in self.message_handlers:
                await self.message_handlers[message_type](connection_id, message)
            else:
                raise ValueError(f"Unknown message type: {message_type}")

        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON: {e}")

    async def _handle_synthesis_request(self, connection_id: str, message: VoiceMessage):
        """Handle text synthesis request"""
        try:
            content = message.content
            text = content.get("text", "")
            agent_id = message.agent_id or "natasha"
            streaming = content.get("streaming", False)

            if not text:
                raise ValueError("Text is required for synthesis")

            # Update connection agent
            if connection_id in self.connections:
                self.connections[connection_id].agent_id = agent_id
                self._update_agent_connections(agent_id, connection_id)

            self.logger.info("Processing synthesis request",
                           connection_id=connection_id,
                           agent_id=agent_id,
                           text_length=len(text),
                           streaming=streaming)

            # Synthesize speech
            with voice_request_duration.time():
                response = await self.orchestrator.synthesize_speech(agent_id, text, streaming)

            voice_requests_total.labels(agent=agent_id, streaming=streaming).inc()

            # Send response
            websocket = self.connections[connection_id].websocket

            if response.success:
                # Send audio response
                audio_b64 = base64.b64encode(response.audio_data).decode('utf-8')

                response_message = VoiceMessage(
                    message_id=str(uuid.uuid4()),
                    message_type="synthesis_response",
                    session_id=message.session_id,
                    agent_id=agent_id,
                    content={
                        "success": True,
                        "text": response.text,
                        "audio_data": audio_b64,
                        "duration": response.duration,
                        "agent_name": response.agent_name
                    },
                    timestamp=time.time(),
                    metadata=response.metadata or {}
                )
            else:
                # Send error response
                response_message = VoiceMessage(
                    message_id=str(uuid.uuid4()),
                    message_type="synthesis_error",
                    session_id=message.session_id,
                    agent_id=agent_id,
                    content={
                        "success": False,
                        "error": response.error,
                        "text": response.text
                    },
                    timestamp=time.time(),
                    metadata={}
                )

            await self._send_message(websocket, response_message)

        except Exception as e:
            self.error_handler.handle_error(e, {"connection_id": connection_id, "message_id": message.message_id})
            websocket = self.connections[connection_id].websocket
            await self._send_error_message(websocket, str(e), message.message_id)

    async def _handle_conversation_start(self, connection_id: str, message: VoiceMessage):
        """Handle conversation session start"""
        try:
            content = message.content
            agent_id = message.agent_id or "natasha"
            session_id = message.session_id or str(uuid.uuid4())
            user_preferences = content.get("user_preferences", {})

            # Create specialized agent if needed
            if agent_id in ["natasha", "marcus"]:
                # Get the base agent from orchestrator
                base_agent = self.orchestrator.agents.get(agent_id)
                if base_agent:
                    # Create specialized agent
                    specialized_agent = VoiceAgentFactory.create_agent(
                        agent_id,
                        base_agent.config,
                        base_agent.elevenlabs_client,
                        base_agent.error_handler,
                        self.config.debug
                    )

                    # Start conversation session
                    if hasattr(specialized_agent, 'start_conversation_session'):
                        conversation_context = specialized_agent.start_conversation_session(
                            session_id, user_preferences
                        )
                        self.conversation_sessions[session_id] = conversation_context
                        conversation_sessions.inc()

            # Update connection
            if connection_id in self.connections:
                self.connections[connection_id].agent_id = agent_id
                self.connections[connection_id].session_id = session_id
                self._update_agent_connections(agent_id, connection_id)

            self.logger.info("Conversation session started",
                           connection_id=connection_id,
                           session_id=session_id,
                           agent_id=agent_id)

            # Send confirmation
            websocket = self.connections[connection_id].websocket
            response_message = VoiceMessage(
                message_id=str(uuid.uuid4()),
                message_type="conversation_started",
                session_id=session_id,
                agent_id=agent_id,
                content={
                    "session_id": session_id,
                    "agent_id": agent_id,
                    "agent_info": VoiceAgentFactory.get_agent_personality_info(agent_id)
                },
                timestamp=time.time(),
                metadata={}
            )

            await self._send_message(websocket, response_message)

        except Exception as e:
            self.error_handler.handle_error(e, {"connection_id": connection_id})
            websocket = self.connections[connection_id].websocket
            await self._send_error_message(websocket, str(e))

    async def _handle_conversation_end(self, connection_id: str, message: VoiceMessage):
        """Handle conversation session end"""
        try:
            session_id = message.session_id

            if not session_id:
                raise ValueError("Session ID required to end conversation")

            # End conversation session
            summary = None
            if session_id in self.conversation_sessions:
                # Find the specialized agent
                agent_id = self.connections[connection_id].agent_id
                if agent_id in ["natasha", "marcus"]:
                    base_agent = self.orchestrator.agents.get(agent_id)
                    if base_agent:
                        specialized_agent = VoiceAgentFactory.create_agent(
                            agent_id,
                            base_agent.config,
                            base_agent.elevenlabs_client,
                            base_agent.error_handler,
                            self.config.debug
                        )

                        if hasattr(specialized_agent, 'end_conversation_session'):
                            summary = specialized_agent.end_conversation_session(session_id)

                # Clean up session
                del self.conversation_sessions[session_id]
                conversation_sessions.dec()

            # Update connection
            if connection_id in self.connections:
                self.connections[connection_id].session_id = None

            self.logger.info("Conversation session ended",
                           connection_id=connection_id,
                           session_id=session_id)

            # Send confirmation
            websocket = self.connections[connection_id].websocket
            response_message = VoiceMessage(
                message_id=str(uuid.uuid4()),
                message_type="conversation_ended",
                session_id=session_id,
                agent_id=message.agent_id,
                content={
                    "session_id": session_id,
                    "summary": summary
                },
                timestamp=time.time(),
                metadata={}
            )

            await self._send_message(websocket, response_message)

        except Exception as e:
            self.error_handler.handle_error(e, {"connection_id": connection_id})
            websocket = self.connections[connection_id].websocket
            await self._send_error_message(websocket, str(e))

    async def _handle_agent_switch(self, connection_id: str, message: VoiceMessage):
        """Handle agent switch request"""
        try:
            new_agent_id = message.content.get("agent_id")

            if not new_agent_id:
                raise ValueError("Agent ID required for switch")

            # Verify agent exists
            available_agents = await self.orchestrator.get_available_agents()
            if new_agent_id not in available_agents:
                raise ValueError(f"Agent '{new_agent_id}' not available")

            # Update connection
            if connection_id in self.connections:
                old_agent_id = self.connections[connection_id].agent_id
                self.connections[connection_id].agent_id = new_agent_id

                # Update agent connections tracking
                if old_agent_id:
                    self._remove_agent_connection(old_agent_id, connection_id)
                self._update_agent_connections(new_agent_id, connection_id)

            self.logger.info("Agent switched",
                           connection_id=connection_id,
                           new_agent=new_agent_id)

            # Send confirmation
            websocket = self.connections[connection_id].websocket
            response_message = VoiceMessage(
                message_id=str(uuid.uuid4()),
                message_type="agent_switched",
                session_id=message.session_id,
                agent_id=new_agent_id,
                content={
                    "agent_id": new_agent_id,
                    "agent_info": available_agents[new_agent_id]
                },
                timestamp=time.time(),
                metadata={}
            )

            await self._send_message(websocket, response_message)

        except Exception as e:
            self.error_handler.handle_error(e, {"connection_id": connection_id})
            websocket = self.connections[connection_id].websocket
            await self._send_error_message(websocket, str(e))

    async def _handle_ping(self, connection_id: str, message: VoiceMessage):
        """Handle ping message"""
        websocket = self.connections[connection_id].websocket

        response_message = VoiceMessage(
            message_id=str(uuid.uuid4()),
            message_type="pong",
            session_id=message.session_id,
            agent_id=message.agent_id,
            content={"timestamp": time.time()},
            timestamp=time.time(),
            metadata={}
        )

        await self._send_message(websocket, response_message)

    async def _handle_audio_chunk(self, connection_id: str, message: VoiceMessage):
        """Handle incoming audio chunk (for future speech-to-text)"""
        # Placeholder for future STT implementation
        self.logger.debug("Received audio chunk",
                         connection_id=connection_id,
                         chunk_size=len(str(message.content)))

    async def _send_message(self, websocket: WebSocket, message: VoiceMessage):
        """Send message to WebSocket client"""
        try:
            message_dict = {
                "message_id": message.message_id,
                "type": message.message_type,
                "session_id": message.session_id,
                "agent_id": message.agent_id,
                "content": message.content,
                "timestamp": message.timestamp,
                "metadata": message.metadata
            }

            await websocket.send_text(json.dumps(message_dict))

        except Exception as e:
            self.logger.error("Failed to send WebSocket message", error=str(e))

    async def _send_error_message(self, websocket: WebSocket, error_message: str, message_id: Optional[str] = None):
        """Send error message to WebSocket client"""
        error_response = VoiceMessage(
            message_id=str(uuid.uuid4()),
            message_type="error",
            session_id=None,
            agent_id=None,
            content={
                "error": error_message,
                "original_message_id": message_id
            },
            timestamp=time.time(),
            metadata={}
        )

        await self._send_message(websocket, error_response)

    def _update_agent_connections(self, agent_id: str, connection_id: str):
        """Update agent connections tracking"""
        if agent_id not in self.agent_connections:
            self.agent_connections[agent_id] = set()
        self.agent_connections[agent_id].add(connection_id)

    def _remove_agent_connection(self, agent_id: str, connection_id: str):
        """Remove agent connection tracking"""
        if agent_id in self.agent_connections:
            self.agent_connections[agent_id].discard(connection_id)
            if not self.agent_connections[agent_id]:
                del self.agent_connections[agent_id]

    async def _cleanup_connection(self, connection_id: str):
        """Clean up connection resources"""
        if connection_id not in self.connections:
            return

        connection_info = self.connections[connection_id]

        # Clean up agent connections
        if connection_info.agent_id:
            self._remove_agent_connection(connection_info.agent_id, connection_id)

        # Clean up conversation session
        if connection_info.session_id and connection_info.session_id in self.conversation_sessions:
            # End conversation session if needed
            if connection_info.agent_id in ["natasha", "marcus"]:
                base_agent = self.orchestrator.agents.get(connection_info.agent_id)
                if base_agent:
                    specialized_agent = VoiceAgentFactory.create_agent(
                        connection_info.agent_id,
                        base_agent.config,
                        base_agent.elevenlabs_client,
                        base_agent.error_handler,
                        self.config.debug
                    )

                    if hasattr(specialized_agent, 'end_conversation_session'):
                        specialized_agent.end_conversation_session(connection_info.session_id)

            del self.conversation_sessions[connection_info.session_id]
            conversation_sessions.dec()

        # Remove connection
        del self.connections[connection_id]
        active_connections.dec()

        self.logger.info("Connection cleaned up",
                        connection_id=connection_id,
                        remaining_connections=len(self.connections))

    async def start_server(self):
        """Start the voice server"""
        # Start Prometheus metrics server
        if self.config.enable_metrics:
            start_http_server(self.config.metrics_port)
            self.logger.info("Prometheus metrics server started", port=self.config.metrics_port)

        # Start main server
        self.logger.info("Starting CTAS-7 Enterprise Voice Server",
                        host=self.config.server.host,
                        port=self.config.server.port,
                        debug=self.config.debug)

        config = uvicorn.Config(
            self.app,
            host=self.config.server.host,
            port=self.config.server.port,
            log_level="debug" if self.config.debug else "info",
            access_log=self.config.debug
        )

        server = uvicorn.Server(config)
        await server.serve()

    async def shutdown(self):
        """Gracefully shutdown the server"""
        self.logger.info("Shutting down voice server")

        # Close all WebSocket connections
        for connection_id in list(self.connections.keys()):
            await self._cleanup_connection(connection_id)

        # Close orchestrator resources
        for agent in self.orchestrator.agents.values():
            if hasattr(agent, 'close_websocket'):
                await agent.close_websocket()

        self.logger.info("Voice server shutdown complete")


async def main():
    """Main server entry point"""
    try:
        # Load configuration
        config = VoiceConfig.from_env()

        # Setup logging
        logger = config.setup_logging()

        # Create and start server
        server = VoiceServer(config)
        await server.start_server()

    except KeyboardInterrupt:
        print("\nShutting down...")
    except Exception as e:
        print(f"Server error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())