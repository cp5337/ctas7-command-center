# CTAS-7 Enterprise Voice System

Enterprise-grade real-time conversational AI system with specialized voice agents for Natasha Volkov and Marcus Chen.

## Features

- **Real-time Voice Synthesis**: ElevenLabs API integration with WebSocket streaming
- **Specialized Voice Agents**: Personality-aware synthesis for Natasha Volkov and Marcus Chen
- **Enterprise Error Handling**: Comprehensive error tracking with debugging support
- **WebSocket Communication**: Real-time bidirectional voice communication
- **Conversation Management**: Session tracking and context management
- **Prometheus Metrics**: Production monitoring and analytics
- **Rich CLI Interface**: Testing and debugging tools

## Quick Start

### Prerequisites

- Python 3.12+ with UV package manager
- ElevenLabs API key
- Anaconda Python environment (recommended)

### Installation

1. **Set up environment**:
   ```bash
   # Using UV with Anaconda Python
   uv venv --python=$(which python)
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   ```

2. **Install the package**:
   ```bash
   uv pip install -e .
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env and set your ELEVENLABS_API_KEY
   ```

### Usage

#### CLI Interface

```bash
# Test all systems
ctas7-voice-enterprise test

# Check configuration
ctas7-voice-enterprise config-check

# Health check
ctas7-voice-enterprise health

# Synthesize speech
ctas7-voice-enterprise speak --agent natasha --text "Mission status update"

# Interactive session
ctas7-voice-enterprise interactive

# Start server
python -m ctas7_voice_enterprise.server
```

#### Python API

```python
from ctas7_voice_enterprise import VoiceConfig, VoiceOrchestrator

# Initialize system
config = VoiceConfig.from_env()
orchestrator = VoiceOrchestrator(config)

# Synthesize speech
response = await orchestrator.synthesize_speech(
    agent_id="natasha",
    text="Tactical analysis complete. Proceeding with mission.",
    streaming=True
)

if response.success:
    # Play or save audio_data
    with open("output.mp3", "wb") as f:
        f.write(response.audio_data)
```

#### WebSocket API

Connect to `ws://localhost:8765/ws` for real-time communication:

```javascript
const ws = new WebSocket('ws://localhost:8765/ws');

// Start conversation
ws.send(JSON.stringify({
    type: 'conversation_start',
    agent_id: 'natasha',
    session_id: 'unique-session-id',
    content: {
        user_preferences: {}
    }
}));

// Synthesize speech
ws.send(JSON.stringify({
    type: 'synthesis_request',
    agent_id: 'natasha',
    session_id: 'unique-session-id',
    content: {
        text: 'Mission briefing in progress.',
        streaming: true
    }
}));
```

## Voice Agents

### Natasha Volkov
- **Personality**: Strategic, authoritative, Russian accent
- **Use Cases**: Mission planning, tactical analysis, strategic communications
- **Voice Settings**: High stability, strong style for accent consistency

### Marcus Chen
- **Personality**: Analytical, calm, technical expertise
- **Use Cases**: Technical analysis, data processing, system reports
- **Voice Settings**: Very stable, neutral tone for clarity

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ELEVENLABS_API_KEY` | Required | ElevenLabs API key (starts with 'sk_') |
| `CTAS7_VOICE_DEBUG` | false | Enable debug mode with verbose logging |
| `CTAS7_VOICE_PORT` | 8765 | WebSocket server port |
| `CTAS7_VOICE_LOG_FILE` | None | Log file path (debug mode only) |
| `CTAS7_VOICE_HOST` | localhost | Server host |
| `CTAS7_VOICE_ENABLE_METRICS` | true | Enable Prometheus metrics |
| `CTAS7_VOICE_METRICS_PORT` | 9090 | Metrics server port |

### Voice Agent Configuration

Agents are configured in `config.py` with personality-specific settings:

```python
agents = {
    "natasha": VoiceAgentConfig(
        name="Natasha Volkov",
        voice_id="EXAVITQu4vr4xnSDxMaL",
        stability=0.5,
        similarity_boost=0.8,
        style=0.6  # Higher for accent
    ),
    "marcus": VoiceAgentConfig(
        name="Marcus Chen",
        voice_id="JBFqnCBsd6RMkjVDRZzb",
        stability=0.4,
        similarity_boost=0.7,
        style=0.3  # Lower for neutral tone
    )
}
```

## Error Handling & Debugging

### Debug Mode

Enable comprehensive debugging:

```bash
export CTAS7_VOICE_DEBUG=true
export CTAS7_VOICE_LOG_FILE=debug.log
ctas7-voice-enterprise test --debug
```

Debug mode provides:
- Detailed stack traces
- API request/response logging
- Performance metrics
- Error context and suggestions
- Conversation history tracking

### Error Categories

- **API**: ElevenLabs API errors with status codes and suggestions
- **Authentication**: API key validation and format checking
- **Network**: WebSocket and HTTP connection issues
- **Configuration**: Environment and settings validation
- **Voice Synthesis**: Audio generation problems
- **WebSocket**: Real-time communication errors

### Health Monitoring

```bash
# Check system health
ctas7-voice-enterprise health

# View metrics (when enabled)
curl http://localhost:9090/metrics
```

## API Reference

### REST Endpoints

- `GET /health` - System health check
- `GET /agents` - Available voice agents
- `POST /synthesize` - Text-to-speech synthesis

### WebSocket Messages

#### Client ’ Server
- `conversation_start` - Begin conversation session
- `synthesis_request` - Request speech synthesis
- `agent_switch` - Change active agent
- `conversation_end` - End session

#### Server ’ Client
- `connection_established` - Welcome message
- `synthesis_response` - Audio response
- `conversation_started` - Session confirmation
- `error` - Error notifications

## Integration with CTAS-7

This package integrates with the CTAS-7 Command Center UI:

1. **Chat Interface**: Text-based interaction with voice agents
2. **Phone Interface**: Voice-to-voice conversation mode
3. **Team Personas**: Natasha Volkov and Marcus Chen integration
4. **Real-time Communication**: WebSocket connection for live voice

## Production Deployment

### Docker Deployment

```dockerfile
FROM python:3.12-slim

# Install UV
RUN pip install uv

# Copy project
COPY . /app
WORKDIR /app

# Install dependencies
RUN uv pip install -e .

# Set environment
ENV ELEVENLABS_API_KEY=your_key_here
ENV CTAS7_VOICE_DEBUG=false

# Expose ports
EXPOSE 8765 9090

# Run server
CMD ["python", "-m", "ctas7_voice_enterprise.server"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ctas7-voice
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ctas7-voice
  template:
    metadata:
      labels:
        app: ctas7-voice
    spec:
      containers:
      - name: voice-server
        image: ctas7/voice-enterprise:latest
        ports:
        - containerPort: 8765
        - containerPort: 9090
        env:
        - name: ELEVENLABS_API_KEY
          valueFrom:
            secretKeyRef:
              name: voice-secrets
              key: api-key
```

## Development

### Testing

```bash
# Run comprehensive tests
ctas7-voice-enterprise test

# Test specific agent
ctas7-voice-enterprise speak --agent natasha --text "Test message"

# Interactive testing
ctas7-voice-enterprise interactive
```

### Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit pull request

## Troubleshooting

### Common Issues

**API Key Error**:
```
ElevenLabsAPIError: Authentication failed
```
- Verify `ELEVENLABS_API_KEY` is set and starts with 'sk_'
- Check API key in ElevenLabs dashboard

**WebSocket Connection Failed**:
```
WebSocketError: Failed to establish connection
```
- Check network connectivity
- Verify firewall settings
- Ensure server is running on correct port

**Audio Generation Issues**:
```
VoiceAgentError: Synthesis failed
```
- Enable debug mode for detailed logs
- Check ElevenLabs API status
- Verify voice IDs are valid

### Debug Commands

```bash
# Verbose configuration check
ctas7-voice-enterprise config-check --debug

# Health check with error details
ctas7-voice-enterprise health --debug

# Test with full error reporting
ctas7-voice-enterprise test --debug
```

## License

Enterprise license - Contact for commercial use.

## Support

For technical support and enterprise licensing:
- Email: usneodcp@gmail.com
- Project: CTAS-7 Command Center