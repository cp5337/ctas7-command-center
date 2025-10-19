"""
CTAS-7 Enterprise Voice System
Real-time conversational AI with specialized voice agents
"""

__version__ = "1.0.0"
__author__ = "Charlie Payne"
__email__ = "usneodcp@gmail.com"

from .config import VoiceConfig, VoiceAgentConfig, ElevenLabsConfig, LoggingConfig, ServerConfig
from .core import VoiceOrchestrator, VoiceAgent, VoiceResponse
from .agents import NatashaVolkovAgent, MarcusChenAgent, VoiceAgentFactory, ConversationContext
from .server import VoiceServer
from .errors import (
    CTAS7VoiceException, ElevenLabsAPIError, VoiceAgentError, WebSocketError,
    ConfigurationError, ErrorHandler, ErrorSeverity, ErrorCategory,
    initialize_error_handler, handle_error
)
from .cli import main

__all__ = [
    # Core classes
    "VoiceConfig",
    "VoiceAgentConfig",
    "ElevenLabsConfig",
    "LoggingConfig",
    "ServerConfig",
    "VoiceOrchestrator",
    "VoiceAgent",
    "VoiceResponse",
    "VoiceServer",

    # Specialized agents
    "NatashaVolkovAgent",
    "MarcusChenAgent",
    "VoiceAgentFactory",
    "ConversationContext",

    # Error handling
    "CTAS7VoiceException",
    "ElevenLabsAPIError",
    "VoiceAgentError",
    "WebSocketError",
    "ConfigurationError",
    "ErrorHandler",
    "ErrorSeverity",
    "ErrorCategory",
    "initialize_error_handler",
    "handle_error",

    # CLI entry point
    "main"
]
