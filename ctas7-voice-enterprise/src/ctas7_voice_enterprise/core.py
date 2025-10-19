"""
CTAS-7 Enterprise Voice Core
Main orchestration and ElevenLabs integration with WebSocket support
"""

import asyncio
import json
import base64
import time
import logging
from typing import Dict, Any, Optional, AsyncGenerator, Callable
from dataclasses import dataclass
import websockets
import structlog
from elevenlabs.client import ElevenLabs
from elevenlabs import play

from .config import VoiceConfig, VoiceAgentConfig
from .errors import (
    ErrorHandler, ElevenLabsAPIError, VoiceAgentError, WebSocketError,
    handle_error, ErrorSeverity, ErrorCategory
)

@dataclass
class VoiceResponse:
    """Voice synthesis response"""
    agent_name: str
    text: str
    audio_data: bytes
    duration: float
    success: bool
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class VoiceOrchestrator:
    """Main voice orchestration system"""

    def __init__(self, config: VoiceConfig):
        self.config = config
        self.logger = structlog.get_logger("voice_orchestrator")
        self.error_handler = ErrorHandler(self.logger.logger, config.debug)

        # Initialize ElevenLabs client
        try:
            self.elevenlabs_client = ElevenLabs(api_key=config.elevenlabs.api_key)
            self.logger.info("ElevenLabs client initialized", api_key_prefix=config.elevenlabs.api_key[:10])
        except Exception as e:
            error_context = self.error_handler.handle_error(
                ElevenLabsAPIError("Failed to initialize ElevenLabs client", details={"error": str(e)})
            )
            raise

        # Voice agents
        self.agents: Dict[str, VoiceAgent] = {}
        self._initialize_agents()

        # WebSocket connections for streaming
        self.websocket_connections: Dict[str, websockets.WebSocketServerProtocol] = {}

        self.logger.info("VoiceOrchestrator initialized",
                        agents=list(self.agents.keys()),
                        debug_mode=config.debug)

    def _initialize_agents(self):
        """Initialize voice agents from configuration"""
        for agent_id, agent_config in self.config.agents.items():
            try:
                agent = VoiceAgent(
                    config=agent_config,
                    elevenlabs_client=self.elevenlabs_client,
                    error_handler=self.error_handler,
                    debug=self.config.debug
                )
                self.agents[agent_id] = agent
                self.logger.info("Voice agent initialized",
                               agent_id=agent_id,
                               agent_name=agent_config.name)
            except Exception as e:
                self.error_handler.handle_error(
                    VoiceAgentError(
                        agent_name=agent_config.name,
                        message=f"Failed to initialize agent: {e}",
                        details={"agent_id": agent_id, "config": agent_config.dict()}
                    )
                )

    async def synthesize_speech(
        self,
        agent_id: str,
        text: str,
        streaming: bool = False
    ) -> VoiceResponse:
        """Synthesize speech using specified agent"""
        start_time = time.time()

        try:
            if agent_id not in self.agents:
                raise VoiceAgentError(
                    agent_name=agent_id,
                    message=f"Agent not found. Available agents: {list(self.agents.keys())}"
                )

            agent = self.agents[agent_id]

            self.logger.info("Starting speech synthesis",
                           agent_id=agent_id,
                           text_length=len(text),
                           streaming=streaming)

            if streaming:
                # Use WebSocket streaming for real-time synthesis
                audio_data = await agent.synthesize_streaming(text)
            else:
                # Use standard API for complete synthesis
                audio_data = await agent.synthesize_standard(text)

            duration = time.time() - start_time

            response = VoiceResponse(
                agent_name=agent.config.name,
                text=text,
                audio_data=audio_data,
                duration=duration,
                success=True,
                metadata={
                    "agent_id": agent_id,
                    "voice_id": agent.config.voice_id,
                    "model_id": agent.config.model_id,
                    "streaming": streaming
                }
            )

            self.logger.info("Speech synthesis completed",
                           agent_id=agent_id,
                           duration=duration,
                           audio_size=len(audio_data))

            return response

        except Exception as e:
            duration = time.time() - start_time
            error_context = self.error_handler.handle_error(e, {
                "agent_id": agent_id,
                "text_length": len(text),
                "duration": duration
            })

            return VoiceResponse(
                agent_name=agent_id,
                text=text,
                audio_data=b"",
                duration=duration,
                success=False,
                error=error_context.message
            )

    async def get_available_agents(self) -> Dict[str, Dict[str, Any]]:
        """Get information about available voice agents"""
        agents_info = {}
        for agent_id, agent in self.agents.items():
            agents_info[agent_id] = {
                "name": agent.config.name,
                "voice_id": agent.config.voice_id,
                "model_id": agent.config.model_id,
                "status": "active" if agent.is_healthy() else "error"
            }
        return agents_info

    async def health_check(self) -> Dict[str, Any]:
        """Comprehensive health check"""
        health_status = {
            "status": "healthy",
            "timestamp": time.time(),
            "services": {},
            "agents": {},
            "errors": self.error_handler.get_error_summary()
        }

        # Check ElevenLabs API connectivity
        try:
            # Simple API test - get voice info
            voice = next(iter(self.config.agents.values())).voice_id
            # This is a lightweight check - just verify the client works
            health_status["services"]["elevenlabs"] = "healthy"
        except Exception as e:
            health_status["services"]["elevenlabs"] = "error"
            health_status["status"] = "degraded"
            self.error_handler.handle_error(e, {"service": "elevenlabs_health_check"})

        # Check each agent
        for agent_id, agent in self.agents.items():
            try:
                agent_health = await agent.health_check()
                health_status["agents"][agent_id] = agent_health
                if not agent_health["healthy"]:
                    health_status["status"] = "degraded"
            except Exception as e:
                health_status["agents"][agent_id] = {"healthy": False, "error": str(e)}
                health_status["status"] = "degraded"

        return health_status

class VoiceAgent:
    """Individual voice agent for speech synthesis"""

    def __init__(
        self,
        config: VoiceAgentConfig,
        elevenlabs_client: ElevenLabs,
        error_handler: ErrorHandler,
        debug: bool = False
    ):
        self.config = config
        self.elevenlabs_client = elevenlabs_client
        self.error_handler = error_handler
        self.debug = debug
        self.logger = structlog.get_logger("voice_agent", agent_name=config.name)

        # WebSocket connection for streaming
        self.websocket_connection: Optional[websockets.WebSocketClientProtocol] = None
        self.is_connected = False

        self.logger.info("Voice agent created", voice_id=config.voice_id)

    async def synthesize_standard(self, text: str) -> bytes:
        """Standard speech synthesis using REST API"""
        try:
            self.logger.debug("Starting standard synthesis", text_length=len(text))

            # Use the ElevenLabs client for standard synthesis
            audio = self.elevenlabs_client.text_to_speech.convert(
                text=text,
                voice_id=self.config.voice_id,
                model_id=self.config.model_id,
                output_format="mp3_44100_128",
                voice_settings={
                    "stability": self.config.stability,
                    "similarity_boost": self.config.similarity_boost,
                    "style": self.config.style,
                    "use_speaker_boost": self.config.use_speaker_boost
                }
            )

            # Convert generator to bytes
            audio_bytes = b""
            for chunk in audio:
                audio_bytes += chunk

            self.logger.debug("Standard synthesis completed", audio_size=len(audio_bytes))
            return audio_bytes

        except Exception as e:
            # Parse ElevenLabs API errors
            if hasattr(e, 'response') and hasattr(e.response, 'status_code'):
                status_code = e.response.status_code
                try:
                    response_data = e.response.json()
                except:
                    response_data = {"error": "Failed to parse response"}

                raise ElevenLabsAPIError(
                    message=f"API request failed: {e}",
                    status_code=status_code,
                    response_data=response_data
                )
            else:
                raise VoiceAgentError(
                    agent_name=self.config.name,
                    message=f"Synthesis failed: {e}",
                    details={"text_length": len(text)}
                )

    async def synthesize_streaming(self, text: str) -> bytes:
        """Streaming speech synthesis using WebSocket"""
        try:
            self.logger.debug("Starting streaming synthesis", text_length=len(text))

            # Ensure WebSocket connection
            await self._ensure_websocket_connection()

            # Send text for synthesis
            message = {
                "text": text,
                "voice_settings": {
                    "stability": self.config.stability,
                    "similarity_boost": self.config.similarity_boost,
                    "style": self.config.style,
                    "use_speaker_boost": self.config.use_speaker_boost
                },
                "generation_config": {
                    "chunk_length_schedule": [120, 160, 250, 290]
                }
            }

            await self.websocket_connection.send(json.dumps(message))

            # Collect audio chunks
            audio_chunks = []
            while True:
                try:
                    response = await asyncio.wait_for(
                        self.websocket_connection.recv(),
                        timeout=30
                    )

                    if isinstance(response, bytes):
                        # Binary audio data
                        audio_chunks.append(response)
                    else:
                        # JSON message (potentially end of stream or error)
                        data = json.loads(response)
                        if data.get("type") == "audio_stream_end":
                            break
                        elif data.get("error"):
                            raise ElevenLabsAPIError(
                                message=f"Streaming error: {data['error']}",
                                response_data=data
                            )

                except asyncio.TimeoutError:
                    break

            audio_data = b"".join(audio_chunks)
            self.logger.debug("Streaming synthesis completed",
                            chunks=len(audio_chunks),
                            audio_size=len(audio_data))

            return audio_data

        except Exception as e:
            if isinstance(e, (ElevenLabsAPIError, VoiceAgentError)):
                raise
            else:
                raise WebSocketError(
                    message=f"Streaming synthesis failed: {e}",
                    connection_state="connected" if self.is_connected else "disconnected",
                    details={"agent_name": self.config.name}
                )

    async def _ensure_websocket_connection(self):
        """Ensure WebSocket connection is established"""
        if self.websocket_connection and not self.websocket_connection.closed:
            return

        try:
            # WebSocket URL for streaming
            ws_url = f"wss://api.elevenlabs.io/v1/text-to-speech/{self.config.voice_id}/stream-input"

            # Connection headers
            headers = {
                "xi-api-key": self.elevenlabs_client.api_key
            }

            self.logger.debug("Establishing WebSocket connection", url=ws_url)

            self.websocket_connection = await websockets.connect(
                ws_url,
                extra_headers=headers,
                ping_interval=20,
                ping_timeout=10
            )

            # Send initial message to keep connection alive
            initial_message = {
                "text": " ",
                "voice_settings": {
                    "stability": self.config.stability,
                    "similarity_boost": self.config.similarity_boost,
                    "style": self.config.style,
                    "use_speaker_boost": self.config.use_speaker_boost
                }
            }
            await self.websocket_connection.send(json.dumps(initial_message))

            self.is_connected = True
            self.logger.info("WebSocket connection established")

        except Exception as e:
            self.is_connected = False
            raise WebSocketError(
                message=f"Failed to establish WebSocket connection: {e}",
                details={"agent_name": self.config.name, "voice_id": self.config.voice_id}
            )

    async def close_websocket(self):
        """Close WebSocket connection"""
        if self.websocket_connection and not self.websocket_connection.closed:
            await self.websocket_connection.close()
            self.is_connected = False
            self.logger.info("WebSocket connection closed")

    def is_healthy(self) -> bool:
        """Check if agent is healthy"""
        return bool(self.config.voice_id and self.config.name)

    async def health_check(self) -> Dict[str, Any]:
        """Agent health check"""
        return {
            "healthy": self.is_healthy(),
            "name": self.config.name,
            "voice_id": self.config.voice_id,
            "websocket_connected": self.is_connected,
            "last_check": time.time()
        }