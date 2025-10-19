"""
CTAS-7 Enterprise Voice Configuration
Centralized configuration management with validation and defaults
"""

import os
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, validator
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class LoggingConfig(BaseModel):
    """Logging configuration"""
    level: str = Field(default="INFO", description="Logging level")
    format: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        description="Log format string"
    )
    file_path: Optional[str] = Field(default=None, description="Log file path")
    max_file_size: int = Field(default=10_000_000, description="Max log file size in bytes")
    backup_count: int = Field(default=5, description="Number of backup log files")

    @validator('level')
    def validate_level(cls, v):
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in valid_levels:
            raise ValueError(f"Invalid log level. Must be one of: {valid_levels}")
        return v.upper()

class ElevenLabsConfig(BaseModel):
    """ElevenLabs API configuration"""
    api_key: str = Field(description="ElevenLabs API key")
    base_url: str = Field(default="https://api.elevenlabs.io/v1", description="API base URL")
    websocket_url: str = Field(default="wss://api.elevenlabs.io/v1", description="WebSocket base URL")
    timeout: int = Field(default=30, description="Request timeout in seconds")
    max_retries: int = Field(default=3, description="Maximum retry attempts")
    retry_delay: float = Field(default=1.0, description="Initial retry delay in seconds")

    @validator('api_key')
    def validate_api_key(cls, v):
        if not v or not v.startswith('sk_'):
            raise ValueError("Invalid ElevenLabs API key format. Must start with 'sk_'")
        return v

class VoiceAgentConfig(BaseModel):
    """Voice agent configuration"""
    name: str = Field(description="Agent name")
    voice_id: str = Field(description="ElevenLabs voice ID")
    model_id: str = Field(default="eleven_monolingual_v1", description="ElevenLabs model ID")
    stability: float = Field(default=0.5, ge=0.0, le=1.0, description="Voice stability")
    similarity_boost: float = Field(default=0.8, ge=0.0, le=1.0, description="Similarity boost")
    style: float = Field(default=0.5, ge=0.0, le=1.0, description="Voice style")
    use_speaker_boost: bool = Field(default=True, description="Use speaker boost")

class ServerConfig(BaseModel):
    """Server configuration"""
    host: str = Field(default="localhost", description="Server host")
    port: int = Field(default=8765, ge=1, le=65535, description="Server port")
    debug: bool = Field(default=False, description="Debug mode")
    cors_origins: list = Field(default=["*"], description="CORS allowed origins")
    max_connections: int = Field(default=100, description="Maximum WebSocket connections")

class VoiceConfig(BaseModel):
    """Main voice system configuration"""

    # Core settings
    debug: bool = Field(default=False, description="Global debug mode")
    environment: str = Field(default="production", description="Environment (dev/staging/production)")

    # Component configurations
    logging: LoggingConfig = Field(default_factory=LoggingConfig)
    elevenlabs: ElevenLabsConfig
    server: ServerConfig = Field(default_factory=ServerConfig)

    # Voice agents
    agents: Dict[str, VoiceAgentConfig] = Field(default_factory=dict)

    # Monitoring
    enable_metrics: bool = Field(default=True, description="Enable Prometheus metrics")
    metrics_port: int = Field(default=9090, description="Metrics server port")

    class Config:
        env_prefix = "CTAS7_VOICE_"
        case_sensitive = False

    @classmethod
    def from_env(cls) -> "VoiceConfig":
        """Create configuration from environment variables"""

        # Required ElevenLabs configuration
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            raise ValueError(
                "ELEVENLABS_API_KEY environment variable is required. "
                "Set it with: export ELEVENLABS_API_KEY='your_key_here'"
            )

        # Debug mode from environment
        debug = os.getenv("CTAS7_VOICE_DEBUG", "false").lower() in ("true", "1", "yes")

        # Create logging config
        log_level = "DEBUG" if debug else "INFO"
        log_file = os.getenv("CTAS7_VOICE_LOG_FILE", "ctas7_voice.log") if debug else None

        logging_config = LoggingConfig(
            level=log_level,
            file_path=log_file
        )

        # ElevenLabs config
        elevenlabs_config = ElevenLabsConfig(api_key=api_key)

        # Server config
        server_config = ServerConfig(
            debug=debug,
            port=int(os.getenv("CTAS7_VOICE_PORT", "8765"))
        )

        # Default agents
        agents = {
            "natasha": VoiceAgentConfig(
                name="Natasha Volkov",
                voice_id="EXAVITQu4vr4xnSDxMaL",  # Natasha voice
                stability=0.5,
                similarity_boost=0.8,
                style=0.6
            ),
            "marcus": VoiceAgentConfig(
                name="Marcus Chen",
                voice_id="JBFqnCBsd6RMkjVDRZzb",  # George voice
                stability=0.4,
                similarity_boost=0.7,
                style=0.3
            )
        }

        return cls(
            debug=debug,
            logging=logging_config,
            elevenlabs=elevenlabs_config,
            server=server_config,
            agents=agents
        )

    def setup_logging(self) -> logging.Logger:
        """Setup structured logging"""
        import structlog
        from logging.handlers import RotatingFileHandler

        # Configure standard logging
        logger = logging.getLogger("ctas7_voice")
        logger.setLevel(getattr(logging, self.logging.level))

        # Remove existing handlers
        for handler in logger.handlers[:]:
            logger.removeHandler(handler)

        # Create formatter
        formatter = logging.Formatter(self.logging.format)

        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

        # File handler if specified
        if self.logging.file_path:
            file_handler = RotatingFileHandler(
                self.logging.file_path,
                maxBytes=self.logging.max_file_size,
                backupCount=self.logging.backup_count
            )
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)

        # Configure structlog
        structlog.configure(
            processors=[
                structlog.stdlib.filter_by_level,
                structlog.stdlib.add_logger_name,
                structlog.stdlib.add_log_level,
                structlog.stdlib.PositionalArgumentsFormatter(),
                structlog.processors.TimeStamper(fmt="iso"),
                structlog.processors.StackInfoRenderer(),
                structlog.processors.format_exc_info,
                structlog.processors.UnicodeDecoder(),
                structlog.processors.JSONRenderer()
            ],
            context_class=dict,
            logger_factory=structlog.stdlib.LoggerFactory(),
            wrapper_class=structlog.stdlib.BoundLogger,
            cache_logger_on_first_use=True,
        )

        return logger

    def validate_configuration(self) -> Dict[str, Any]:
        """Validate configuration and return status"""
        status = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "info": []
        }

        # Check ElevenLabs API key format
        try:
            if not self.elevenlabs.api_key.startswith("sk_"):
                status["errors"].append("ElevenLabs API key must start with 'sk_'")
                status["valid"] = False
        except Exception as e:
            status["errors"].append(f"ElevenLabs configuration error: {e}")
            status["valid"] = False

        # Check voice agent configurations
        for agent_name, agent_config in self.agents.items():
            if not agent_config.voice_id:
                status["errors"].append(f"Agent '{agent_name}' missing voice_id")
                status["valid"] = False

        # Debug mode warnings
        if self.debug:
            status["warnings"].append("Debug mode enabled - performance may be impacted")
            status["info"].append(f"Logging to file: {self.logging.file_path}")

        return status