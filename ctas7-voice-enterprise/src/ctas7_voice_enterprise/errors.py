"""
CTAS-7 Enterprise Voice Error Handling
Comprehensive error definitions and handling with debugging support
"""

import time
import json
import logging
import traceback
from typing import Dict, Any, Optional, List
from enum import Enum
from dataclasses import dataclass, asdict
from datetime import datetime

class ErrorSeverity(Enum):
    """Error severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ErrorCategory(Enum):
    """Error categories for classification"""
    API = "api"
    AUTHENTICATION = "authentication"
    NETWORK = "network"
    CONFIGURATION = "configuration"
    VOICE_SYNTHESIS = "voice_synthesis"
    WEBSOCKET = "websocket"
    USER_INPUT = "user_input"
    SYSTEM = "system"

@dataclass
class ErrorContext:
    """Rich error context for debugging"""
    timestamp: str
    error_id: str
    category: ErrorCategory
    severity: ErrorSeverity
    message: str
    details: Dict[str, Any]
    stack_trace: Optional[str] = None
    suggestions: List[str] = None
    user_message: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return asdict(self)

    def to_json(self) -> str:
        """Convert to JSON string"""
        return json.dumps(self.to_dict(), indent=2, default=str)

class CTAS7VoiceException(Exception):
    """Base exception for CTAS-7 Voice system"""

    def __init__(
        self,
        message: str,
        category: ErrorCategory = ErrorCategory.SYSTEM,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        details: Optional[Dict[str, Any]] = None,
        suggestions: Optional[List[str]] = None,
        user_message: Optional[str] = None
    ):
        super().__init__(message)
        self.message = message
        self.category = category
        self.severity = severity
        self.details = details or {}
        self.suggestions = suggestions or []
        self.user_message = user_message
        self.timestamp = datetime.now().isoformat()
        self.error_id = f"CTAS7_{int(time.time())}_{id(self)}"

    def get_context(self) -> ErrorContext:
        """Get rich error context"""
        return ErrorContext(
            timestamp=self.timestamp,
            error_id=self.error_id,
            category=self.category,
            severity=self.severity,
            message=self.message,
            details=self.details,
            stack_trace=traceback.format_exc(),
            suggestions=self.suggestions,
            user_message=self.user_message
        )

class ElevenLabsAPIError(CTAS7VoiceException):
    """ElevenLabs API specific errors"""

    def __init__(self, message: str, status_code: Optional[int] = None, response_data: Optional[Dict] = None):
        # Map status codes to user-friendly messages and suggestions
        user_messages = {
            400: "Invalid request parameters. Please check your input.",
            401: "Authentication failed. Please verify your API key.",
            403: "Access denied. You may need to upgrade your subscription.",
            429: "Too many requests. The system will retry automatically.",
            500: "ElevenLabs service is experiencing issues. Please try again later."
        }

        suggestions_map = {
            400: [
                "Verify all required parameters are provided",
                "Check that text length is within limits",
                "Ensure voice_id format is correct"
            ],
            401: [
                "Check ELEVENLABS_API_KEY environment variable",
                "Verify API key starts with 'sk_'",
                "Generate new API key from ElevenLabs dashboard"
            ],
            403: [
                "Upgrade to Creator+ subscription for professional voices",
                "Check subscription limits in dashboard",
                "Contact ElevenLabs support if issue persists"
            ],
            429: [
                "System will retry with exponential backoff",
                "Consider reducing concurrent requests",
                "Check rate limits in dashboard"
            ],
            500: [
                "Wait and retry in a few minutes",
                "Check ElevenLabs status page",
                "Use fallback TTS if available"
            ]
        }

        details = {
            "status_code": status_code,
            "response_data": response_data,
            "api_endpoint": "ElevenLabs API"
        }

        super().__init__(
            message=message,
            category=ErrorCategory.API,
            severity=ErrorSeverity.HIGH if status_code in [401, 403, 500] else ErrorSeverity.MEDIUM,
            details=details,
            suggestions=suggestions_map.get(status_code, ["Contact support if issue persists"]),
            user_message=user_messages.get(status_code, "API request failed. Please try again.")
        )
        self.status_code = status_code

class VoiceAgentError(CTAS7VoiceException):
    """Voice agent specific errors"""

    def __init__(self, agent_name: str, message: str, **kwargs):
        details = kwargs.get('details', {})
        details['agent_name'] = agent_name

        super().__init__(
            message=f"Agent '{agent_name}': {message}",
            category=ErrorCategory.VOICE_SYNTHESIS,
            details=details,
            **kwargs
        )

class WebSocketError(CTAS7VoiceException):
    """WebSocket connection errors"""

    def __init__(self, message: str, connection_state: Optional[str] = None, **kwargs):
        details = kwargs.get('details', {})
        details['connection_state'] = connection_state

        suggestions = [
            "Check network connectivity",
            "Verify WebSocket endpoint URL",
            "Check firewall settings",
            "Retry connection with exponential backoff"
        ]

        super().__init__(
            message=message,
            category=ErrorCategory.WEBSOCKET,
            severity=ErrorSeverity.HIGH,
            details=details,
            suggestions=suggestions,
            user_message="Connection lost. Attempting to reconnect...",
            **kwargs
        )

class ConfigurationError(CTAS7VoiceException):
    """Configuration related errors"""

    def __init__(self, message: str, config_key: Optional[str] = None, **kwargs):
        details = kwargs.get('details', {})
        if config_key:
            details['config_key'] = config_key

        suggestions = [
            "Check environment variables",
            "Verify configuration file syntax",
            "Review documentation for required settings",
            "Use debug mode for detailed validation"
        ]

        super().__init__(
            message=message,
            category=ErrorCategory.CONFIGURATION,
            severity=ErrorSeverity.HIGH,
            details=details,
            suggestions=suggestions,
            user_message="Configuration error detected. Please check your settings.",
            **kwargs
        )

class ErrorHandler:
    """Centralized error handling and logging"""

    def __init__(self, logger: Optional[logging.Logger] = None, debug: bool = False):
        self.logger = logger or logging.getLogger(__name__)
        self.debug = debug
        self.error_history: List[ErrorContext] = []

    def handle_error(
        self,
        error: Exception,
        context: Optional[Dict[str, Any]] = None,
        notify_user: bool = True
    ) -> ErrorContext:
        """Handle any error with comprehensive logging and context"""

        # Convert to CTAS7VoiceException if needed
        if not isinstance(error, CTAS7VoiceException):
            error = CTAS7VoiceException(
                message=str(error),
                category=ErrorCategory.SYSTEM,
                severity=ErrorSeverity.MEDIUM,
                details={"original_type": type(error).__name__}
            )

        # Get error context
        error_context = error.get_context()

        # Add additional context
        if context:
            error_context.details.update(context)

        # Log the error
        self._log_error(error_context)

        # Store in history (limited to last 100 errors)
        self.error_history.append(error_context)
        if len(self.error_history) > 100:
            self.error_history.pop(0)

        # Debug mode: print detailed information
        if self.debug:
            self._debug_print(error_context)

        return error_context

    def _log_error(self, error_context: ErrorContext):
        """Log error with appropriate level"""
        level_map = {
            ErrorSeverity.LOW: logging.INFO,
            ErrorSeverity.MEDIUM: logging.WARNING,
            ErrorSeverity.HIGH: logging.ERROR,
            ErrorSeverity.CRITICAL: logging.CRITICAL
        }

        level = level_map[error_context.severity]

        self.logger.log(
            level,
            f"[{error_context.error_id}] {error_context.category.value.upper()}: {error_context.message}",
            extra={
                "error_id": error_context.error_id,
                "category": error_context.category.value,
                "severity": error_context.severity.value,
                "details": error_context.details,
                "suggestions": error_context.suggestions
            }
        )

    def _debug_print(self, error_context: ErrorContext):
        """Print detailed error information in debug mode"""
        print("=" * 80)
        print(f"🔴 CTAS-7 VOICE ERROR DEBUG")
        print("=" * 80)
        print(f"Error ID: {error_context.error_id}")
        print(f"Category: {error_context.category.value}")
        print(f"Severity: {error_context.severity.value}")
        print(f"Time: {error_context.timestamp}")
        print(f"Message: {error_context.message}")

        if error_context.details:
            print("\nDetails:")
            for key, value in error_context.details.items():
                print(f"  {key}: {value}")

        if error_context.suggestions:
            print("\nSuggestions:")
            for i, suggestion in enumerate(error_context.suggestions, 1):
                print(f"  {i}. {suggestion}")

        if error_context.user_message:
            print(f"\nUser Message: {error_context.user_message}")

        if self.debug and error_context.stack_trace:
            print(f"\nStack Trace:\n{error_context.stack_trace}")

        print("=" * 80)

    def get_error_summary(self) -> Dict[str, Any]:
        """Get summary of recent errors"""
        if not self.error_history:
            return {"total_errors": 0, "recent_errors": []}

        categories = {}
        severities = {}

        for error in self.error_history[-10:]:  # Last 10 errors
            cat = error.category.value
            sev = error.severity.value

            categories[cat] = categories.get(cat, 0) + 1
            severities[sev] = severities.get(sev, 0) + 1

        return {
            "total_errors": len(self.error_history),
            "recent_errors": [e.to_dict() for e in self.error_history[-5:]],
            "categories": categories,
            "severities": severities
        }

    def clear_history(self):
        """Clear error history"""
        self.error_history.clear()
        self.logger.info("Error history cleared")

# Global error handler instance
error_handler: Optional[ErrorHandler] = None

def initialize_error_handler(logger: logging.Logger, debug: bool = False) -> ErrorHandler:
    """Initialize global error handler"""
    global error_handler
    error_handler = ErrorHandler(logger, debug)
    return error_handler

def handle_error(error: Exception, context: Optional[Dict[str, Any]] = None) -> ErrorContext:
    """Convenience function for error handling"""
    if error_handler is None:
        raise RuntimeError("Error handler not initialized. Call initialize_error_handler() first.")
    return error_handler.handle_error(error, context)