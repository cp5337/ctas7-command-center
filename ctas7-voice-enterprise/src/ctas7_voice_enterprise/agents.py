"""
CTAS-7 Enterprise Voice Agents
Specialized voice agents for Natasha Volkov and Marcus Chen with personality-aware synthesis
"""

import asyncio
import time
import json
from typing import Dict, Any, Optional, List, Callable
from dataclasses import dataclass
import structlog
from elevenlabs.client import ElevenLabs

from .config import VoiceConfig, VoiceAgentConfig
from .core import VoiceAgent, VoiceResponse
from .errors import VoiceAgentError, handle_error, ErrorSeverity, ErrorCategory

@dataclass
class ConversationContext:
    """Context for conversational interactions"""
    session_id: str
    agent_name: str
    conversation_history: List[Dict[str, Any]]
    user_preferences: Dict[str, Any]
    start_time: float
    last_interaction: float

class NatashaVolkovAgent(VoiceAgent):
    """Natasha Volkov - Strategic AI persona with Russian accent and authoritative tone"""

    def __init__(self, config: VoiceAgentConfig, elevenlabs_client: ElevenLabs, error_handler, debug: bool = False):
        super().__init__(config, elevenlabs_client, error_handler, debug)
        self.logger = structlog.get_logger("natasha_agent")

        # Natasha's personality settings
        self.personality_traits = {
            "accent": "Russian",
            "tone": "authoritative_strategic",
            "speaking_pace": "measured",
            "expertise": ["military_strategy", "tactical_analysis", "mission_planning"],
            "communication_style": "direct_professional"
        }

        # Conversation context
        self.active_sessions: Dict[str, ConversationContext] = {}

        self.logger.info("Natasha Volkov agent initialized",
                        voice_id=config.voice_id,
                        personality=self.personality_traits)

    async def synthesize_with_personality(
        self,
        text: str,
        session_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        streaming: bool = False
    ) -> VoiceResponse:
        """Synthesize speech with Natasha's personality considerations"""

        try:
            # Apply personality preprocessing
            enhanced_text = self._enhance_text_for_natasha(text, context)

            # Get session context if available
            if session_id and session_id in self.active_sessions:
                session_context = self.active_sessions[session_id]
                session_context.last_interaction = time.time()
                session_context.conversation_history.append({
                    "timestamp": time.time(),
                    "type": "synthesis_request",
                    "original_text": text,
                    "enhanced_text": enhanced_text,
                    "context": context
                })

            # Use personality-tuned voice settings
            personality_settings = self._get_personality_voice_settings()

            self.logger.debug("Synthesizing with Natasha personality",
                            session_id=session_id,
                            original_length=len(text),
                            enhanced_length=len(enhanced_text))

            if streaming:
                audio_data = await self._synthesize_streaming_with_personality(enhanced_text, personality_settings)
            else:
                audio_data = await self._synthesize_standard_with_personality(enhanced_text, personality_settings)

            # Create enhanced response
            response = VoiceResponse(
                agent_name=self.config.name,
                text=enhanced_text,
                audio_data=audio_data,
                duration=0,  # Will be calculated by caller
                success=True,
                metadata={
                    "agent_type": "natasha_volkov",
                    "personality_applied": True,
                    "session_id": session_id,
                    "context": context,
                    "personality_traits": self.personality_traits,
                    "voice_settings": personality_settings
                }
            )

            return response

        except Exception as e:
            self.error_handler.handle_error(
                VoiceAgentError(
                    agent_name=self.config.name,
                    message=f"Personality synthesis failed: {e}",
                    details={
                        "session_id": session_id,
                        "text_length": len(text),
                        "context": context
                    }
                )
            )
            raise

    def _enhance_text_for_natasha(self, text: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Apply Natasha's personality enhancements to text"""

        # Strategic communication patterns
        enhanced = text

        # Add strategic emphasis for key terms
        strategic_terms = {
            "mission": "mission objective",
            "target": "designated target",
            "enemy": "hostile forces",
            "plan": "tactical plan",
            "status": "operational status"
        }

        for term, replacement in strategic_terms.items():
            if term in enhanced.lower():
                enhanced = enhanced.replace(term, replacement)

        # Add measured pauses for authority
        if len(enhanced) > 50:
            sentences = enhanced.split('. ')
            if len(sentences) > 1:
                enhanced = '. ... '.join(sentences)

        return enhanced

    def _get_personality_voice_settings(self) -> Dict[str, Any]:
        """Get voice settings tuned for Natasha's personality"""
        return {
            "stability": 0.6,  # More stable for authority
            "similarity_boost": 0.8,  # High similarity for consistency
            "style": 0.7,  # Stronger style for accent
            "use_speaker_boost": True
        }

    async def _synthesize_streaming_with_personality(self, text: str, settings: Dict[str, Any]) -> bytes:
        """Streaming synthesis with personality settings"""
        # Override default settings with personality settings
        original_config = {
            "stability": self.config.stability,
            "similarity_boost": self.config.similarity_boost,
            "style": self.config.style,
            "use_speaker_boost": self.config.use_speaker_boost
        }

        # Temporarily apply personality settings
        for key, value in settings.items():
            setattr(self.config, key, value)

        try:
            return await self.synthesize_streaming(text)
        finally:
            # Restore original settings
            for key, value in original_config.items():
                setattr(self.config, key, value)

    async def _synthesize_standard_with_personality(self, text: str, settings: Dict[str, Any]) -> bytes:
        """Standard synthesis with personality settings"""
        # Override default settings with personality settings
        original_config = {
            "stability": self.config.stability,
            "similarity_boost": self.config.similarity_boost,
            "style": self.config.style,
            "use_speaker_boost": self.config.use_speaker_boost
        }

        # Temporarily apply personality settings
        for key, value in settings.items():
            setattr(self.config, key, value)

        try:
            return await self.synthesize_standard(text)
        finally:
            # Restore original settings
            for key, value in original_config.items():
                setattr(self.config, key, value)

    def start_conversation_session(self, session_id: str, user_preferences: Optional[Dict[str, Any]] = None) -> ConversationContext:
        """Start a new conversation session with Natasha"""
        context = ConversationContext(
            session_id=session_id,
            agent_name=self.config.name,
            conversation_history=[],
            user_preferences=user_preferences or {},
            start_time=time.time(),
            last_interaction=time.time()
        )

        self.active_sessions[session_id] = context

        self.logger.info("Started conversation session with Natasha",
                        session_id=session_id,
                        user_preferences=user_preferences)

        return context

    def end_conversation_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """End conversation session and return summary"""
        if session_id not in self.active_sessions:
            return None

        session = self.active_sessions.pop(session_id)
        duration = time.time() - session.start_time

        summary = {
            "session_id": session_id,
            "agent_name": self.config.name,
            "duration_seconds": duration,
            "total_interactions": len(session.conversation_history),
            "start_time": session.start_time,
            "end_time": time.time()
        }

        self.logger.info("Ended conversation session with Natasha",
                        session_id=session_id,
                        duration=duration,
                        interactions=len(session.conversation_history))

        return summary


class MarcusChenAgent(VoiceAgent):
    """Marcus Chen - Technical AI persona with analytical approach and calm demeanor"""

    def __init__(self, config: VoiceAgentConfig, elevenlabs_client: ElevenLabs, error_handler, debug: bool = False):
        super().__init__(config, elevenlabs_client, error_handler, debug)
        self.logger = structlog.get_logger("marcus_agent")

        # Marcus's personality settings
        self.personality_traits = {
            "accent": "neutral_american",
            "tone": "analytical_calm",
            "speaking_pace": "steady",
            "expertise": ["technical_analysis", "data_processing", "system_optimization"],
            "communication_style": "methodical_detailed"
        }

        # Conversation context
        self.active_sessions: Dict[str, ConversationContext] = {}

        self.logger.info("Marcus Chen agent initialized",
                        voice_id=config.voice_id,
                        personality=self.personality_traits)

    async def synthesize_with_personality(
        self,
        text: str,
        session_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        streaming: bool = False
    ) -> VoiceResponse:
        """Synthesize speech with Marcus's personality considerations"""

        try:
            # Apply personality preprocessing
            enhanced_text = self._enhance_text_for_marcus(text, context)

            # Get session context if available
            if session_id and session_id in self.active_sessions:
                session_context = self.active_sessions[session_id]
                session_context.last_interaction = time.time()
                session_context.conversation_history.append({
                    "timestamp": time.time(),
                    "type": "synthesis_request",
                    "original_text": text,
                    "enhanced_text": enhanced_text,
                    "context": context
                })

            # Use personality-tuned voice settings
            personality_settings = self._get_personality_voice_settings()

            self.logger.debug("Synthesizing with Marcus personality",
                            session_id=session_id,
                            original_length=len(text),
                            enhanced_length=len(enhanced_text))

            if streaming:
                audio_data = await self._synthesize_streaming_with_personality(enhanced_text, personality_settings)
            else:
                audio_data = await self._synthesize_standard_with_personality(enhanced_text, personality_settings)

            # Create enhanced response
            response = VoiceResponse(
                agent_name=self.config.name,
                text=enhanced_text,
                audio_data=audio_data,
                duration=0,  # Will be calculated by caller
                success=True,
                metadata={
                    "agent_type": "marcus_chen",
                    "personality_applied": True,
                    "session_id": session_id,
                    "context": context,
                    "personality_traits": self.personality_traits,
                    "voice_settings": personality_settings
                }
            )

            return response

        except Exception as e:
            self.error_handler.handle_error(
                VoiceAgentError(
                    agent_name=self.config.name,
                    message=f"Personality synthesis failed: {e}",
                    details={
                        "session_id": session_id,
                        "text_length": len(text),
                        "context": context
                    }
                )
            )
            raise

    def _enhance_text_for_marcus(self, text: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Apply Marcus's personality enhancements to text"""

        # Technical communication patterns
        enhanced = text

        # Add technical precision to key terms
        technical_terms = {
            "error": "system error",
            "problem": "technical issue",
            "fix": "resolution",
            "data": "dataset",
            "analysis": "comprehensive analysis"
        }

        for term, replacement in technical_terms.items():
            if term in enhanced.lower():
                enhanced = enhanced.replace(term, replacement)

        # Add methodical structure
        if "," in enhanced and len(enhanced) > 40:
            # Add slight pauses for clarity
            enhanced = enhanced.replace(", ", ", ... ")

        return enhanced

    def _get_personality_voice_settings(self) -> Dict[str, Any]:
        """Get voice settings tuned for Marcus's personality"""
        return {
            "stability": 0.7,  # Very stable for technical clarity
            "similarity_boost": 0.75,  # Good similarity for consistency
            "style": 0.4,  # Lower style for neutral tone
            "use_speaker_boost": True
        }

    async def _synthesize_streaming_with_personality(self, text: str, settings: Dict[str, Any]) -> bytes:
        """Streaming synthesis with personality settings"""
        # Override default settings with personality settings
        original_config = {
            "stability": self.config.stability,
            "similarity_boost": self.config.similarity_boost,
            "style": self.config.style,
            "use_speaker_boost": self.config.use_speaker_boost
        }

        # Temporarily apply personality settings
        for key, value in settings.items():
            setattr(self.config, key, value)

        try:
            return await self.synthesize_streaming(text)
        finally:
            # Restore original settings
            for key, value in original_config.items():
                setattr(self.config, key, value)

    async def _synthesize_standard_with_personality(self, text: str, settings: Dict[str, Any]) -> bytes:
        """Standard synthesis with personality settings"""
        # Override default settings with personality settings
        original_config = {
            "stability": self.config.stability,
            "similarity_boost": self.config.similarity_boost,
            "style": self.config.style,
            "use_speaker_boost": self.config.use_speaker_boost
        }

        # Temporarily apply personality settings
        for key, value in settings.items():
            setattr(self.config, key, value)

        try:
            return await self.synthesize_standard(text)
        finally:
            # Restore original settings
            for key, value in original_config.items():
                setattr(self.config, key, value)

    def start_conversation_session(self, session_id: str, user_preferences: Optional[Dict[str, Any]] = None) -> ConversationContext:
        """Start a new conversation session with Marcus"""
        context = ConversationContext(
            session_id=session_id,
            agent_name=self.config.name,
            conversation_history=[],
            user_preferences=user_preferences or {},
            start_time=time.time(),
            last_interaction=time.time()
        )

        self.active_sessions[session_id] = context

        self.logger.info("Started conversation session with Marcus",
                        session_id=session_id,
                        user_preferences=user_preferences)

        return context

    def end_conversation_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """End conversation session and return summary"""
        if session_id not in self.active_sessions:
            return None

        session = self.active_sessions.pop(session_id)
        duration = time.time() - session.start_time

        summary = {
            "session_id": session_id,
            "agent_name": self.config.name,
            "duration_seconds": duration,
            "total_interactions": len(session.conversation_history),
            "start_time": session.start_time,
            "end_time": time.time()
        }

        self.logger.info("Ended conversation session with Marcus",
                        session_id=session_id,
                        duration=duration,
                        interactions=len(session.conversation_history))

        return summary


class VoiceAgentFactory:
    """Factory for creating specialized voice agents"""

    @staticmethod
    def create_agent(
        agent_type: str,
        config: VoiceAgentConfig,
        elevenlabs_client: ElevenLabs,
        error_handler,
        debug: bool = False
    ) -> VoiceAgent:
        """Create specialized voice agent based on type"""

        if agent_type.lower() in ["natasha", "natasha_volkov"]:
            return NatashaVolkovAgent(config, elevenlabs_client, error_handler, debug)
        elif agent_type.lower() in ["marcus", "marcus_chen"]:
            return MarcusChenAgent(config, elevenlabs_client, error_handler, debug)
        else:
            # Default to base VoiceAgent
            return VoiceAgent(config, elevenlabs_client, error_handler, debug)

    @staticmethod
    def get_available_agent_types() -> List[str]:
        """Get list of available specialized agent types"""
        return ["natasha_volkov", "marcus_chen", "generic"]

    @staticmethod
    def get_agent_personality_info(agent_type: str) -> Dict[str, Any]:
        """Get personality information for an agent type"""

        personalities = {
            "natasha_volkov": {
                "name": "Natasha Volkov",
                "description": "Strategic AI persona with Russian accent and authoritative tone",
                "traits": {
                    "accent": "Russian",
                    "tone": "authoritative_strategic",
                    "speaking_pace": "measured",
                    "expertise": ["military_strategy", "tactical_analysis", "mission_planning"],
                    "communication_style": "direct_professional"
                }
            },
            "marcus_chen": {
                "name": "Marcus Chen",
                "description": "Technical AI persona with analytical approach and calm demeanor",
                "traits": {
                    "accent": "neutral_american",
                    "tone": "analytical_calm",
                    "speaking_pace": "steady",
                    "expertise": ["technical_analysis", "data_processing", "system_optimization"],
                    "communication_style": "methodical_detailed"
                }
            }
        }

        return personalities.get(agent_type.lower(), {
            "name": "Generic Agent",
            "description": "Standard voice agent without specialized personality",
            "traits": {}
        })