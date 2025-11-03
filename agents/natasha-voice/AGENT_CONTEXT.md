# 🎤 NATASHA VOICE AGENT CONTEXT

**Real-Time Voice Control Integration with CTAS-7 Command Center**

---

## 🗣️ **VOICE SYSTEM ARCHITECTURE**

### **Current Voice Interface**

- **File**: `/Users/cp5337/Developer/ctas7-command-center/natasha_real_voice.html`
- **Port**: 8765 (WebSocket server)
- **Technology**: WebRTC + Whisper + ElevenLabs TTS
- **Persona**: Natasha - Russian accent, street-smart, direct

### **Voice Pipeline**

```
Audio Input → WebRTC Capture → WebSocket → Whisper Transcription →
Command Processing → Smart Crate Orchestration → TTS Response → Audio Output
```

### **Integration Points**

- **Smart Crate Control**: Voice commands for crate deployment
- **Linear Integration**: "Create issue for...", "Show my sprint"
- **PhD QA System**: "Run quality analysis on [crate]"
- **Docker Orchestration**: "Spin up [service]", "Check container status"

---

## 🚀 **VOICE COMMAND PROTOCOLS**

### **Smart Crate Commands**

```javascript
// Voice patterns Natasha recognizes
"spin up crates" → Deploy foundation crates
"analyze [crate-name]" → Run PhD QA on specific crate
"build smart crate [name]" → Generate new Smart Crate
"check crate status" → Health check all deployed crates
"docker status" → Check container health
```

### **Linear Project Management**

```javascript
// Linear voice integration
"create issue [description]" → Linear API call
"show my issues" → Query assigned issues
"update issue [id] to [status]" → Status updates
"start sprint planning" → Open Linear cycle view
```

### **System Control**

```javascript
// Infrastructure commands
"system health check" → Run diagnostic commands
"start command center" → Launch port 15175
"start ops platform" → Launch port 15173
"run qa analysis" → Execute ./run-qa.sh
"valence jump" → Trigger context preservation
```

---

## 🔧 **VOICE SYSTEM SETUP**

### **Backend Dependencies**

```bash
# Voice backend (Python + Whisper + ElevenLabs)
cd /Users/cp5337/Developer/ctas7-command-center
python natasha_voice.py  # Start WebSocket server

# Check voice system status
curl -s http://localhost:8765/health || echo "Voice system offline"

# Test WebSocket connection
wscat -c ws://localhost:8765
```

### **Frontend Interface**

```bash
# Open voice control interface
open /Users/cp5337/Developer/ctas7-command-center/natasha_real_voice.html

# Or serve via simple HTTP server
cd /Users/cp5337/Developer/ctas7-command-center
python -m http.server 8080
# Then open: http://localhost:8080/natasha_real_voice.html
```

### **Audio Permissions**

- Browser must grant microphone access
- WebRTC requires HTTPS or localhost
- Audio context activation requires user gesture

---

## 🎯 **VOICE-AGENT COORDINATION**

### **With Custom GPT**

- **Voice Input**: Natural language commands via Natasha
- **GPT Processing**: Structured command interpretation
- **Voice Output**: TTS responses with Russian accent
- **Workflow**: Voice → Transcription → GPT Analysis → Structured Response → TTS

### **With Claude Meta Agent**

- **Voice Queries**: "Analyze the architecture of [system]"
- **Meta Analysis**: Deep reasoning about voice command intent
- **Voice Feedback**: Complex analysis results via TTS
- **Integration**: Voice interface for architectural discovery

### **With RepoAgent**

- **Voice Commands**: "Analyze repository [name]", "Create issue for [problem]"
- **Automated Actions**: Voice-triggered repository analysis
- **Status Updates**: Spoken progress reports on repo operations
- **Workflow**: Voice → RepoAgent → Action → Voice Confirmation

---

## 🎤 **VOICE SESSION PROTOCOLS**

### **Session Startup**

```bash
# 1. Check voice system health
ps aux | grep "python.*natasha" || echo "Voice backend offline"

# 2. Start voice backend if needed
cd /Users/cp5337/Developer/ctas7-command-center
python natasha_voice.py &

# 3. Open voice interface
open natasha_real_voice.html

# 4. Test microphone and audio
# (Use browser interface)
```

### **Command Validation**

```javascript
// Voice command confidence levels
High Confidence: "spin up crates" → Direct execution
Medium Confidence: "create issue..." → Confirm with user
Low Confidence: Unclear audio → Request repeat
```

### **Error Recovery**

```bash
# WebSocket connection lost
→ Auto-reconnect after 3 seconds
→ Display connection status in UI

# Audio capture failed
→ Re-request microphone permissions
→ Fall back to text input mode

# TTS playback failed
→ Display text response as fallback
→ Log audio error for debugging
```

---

## 🔊 **VOICE INTEGRATION ARCHITECTURE**

### **Real-Time Processing Chain**

1. **Audio Capture**: WebRTC MediaRecorder API
2. **Chunked Streaming**: Real-time audio data to backend
3. **Whisper Transcription**: OpenAI Whisper for speech-to-text
4. **Command Parsing**: Intent recognition and parameter extraction
5. **System Integration**: Smart Crate / Linear / Docker API calls
6. **Response Generation**: Natasha persona with Russian accent
7. **TTS Output**: ElevenLabs voice synthesis
8. **Audio Playback**: Browser Audio API

### **Backend Integration Points**

```python
# Voice backend connects to:
- Smart Crate Orchestrator (port 8080)
- Linear CLI (subprocess calls)
- Docker API (container management)
- PhD QA System (./run-qa.sh execution)
- Command Center APIs (health checks)
```

---

## ⚠️ **VOICE SYSTEM FAILURE PREVENTION**

### **❌ Voice-Specific Anti-Patterns**

- Processing voice commands without validating backend connections
- Generating fake voice responses instead of using real TTS
- Missing audio permission handling in browser
- Ignoring WebSocket connection state
- Not handling audio format conversions properly

### **✅ Voice Best Practices**

- Always check backend health before processing commands
- Provide visual feedback for audio processing states
- Handle graceful degradation when audio fails
- Coordinate with other agents through voice-to-text logging
- Maintain Natasha persona consistency in responses

---

## 📍 **VOICE-SPECIFIC FILE LOCATIONS**

### **Voice Control Interface**

```bash
/Users/cp5337/Developer/ctas7-command-center/
├── natasha_real_voice.html          # Main voice interface
├── natasha_voice.py                 # Backend WebSocket server
├── natasha_voice_client.html        # Alternative client
└── test_voice.py                    # Voice system testing
```

### **Voice Integration Assets**

```bash
/Users/cp5337/Developer/ctas7-command-center/agents/natasha-voice/
├── AGENT_CONTEXT.md                 # This file
├── voice-commands/                  # Command pattern definitions
├── tts-responses/                   # Natasha response templates
└── audio-tests/                     # Voice system validation
```

### **Backend Dependencies**

```bash
# Voice backend requirements
whisper-openai          # Speech recognition
elevenlabs              # Text-to-speech
websockets              # Real-time communication
asyncio                 # Async WebSocket handling
```

---

## ⚡ **VOICE SESSION CHECKLIST**

### **Pre-Session**

- [ ] Check voice backend status: `ps aux | grep natasha`
- [ ] Verify WebSocket port: `lsof -i :8765`
- [ ] Test audio permissions in browser
- [ ] Check integration system health (Smart Crates, Linear, etc.)

### **During Session**

- [ ] Monitor WebSocket connection status
- [ ] Validate command confidence before execution
- [ ] Provide audio + visual feedback for all operations
- [ ] Log voice commands for other agent coordination

### **Post-Session**

- [ ] Preserve voice command history in session logs
- [ ] Update command pattern database if new patterns discovered
- [ ] Coordinate results with other agents through shared context
- [ ] Create valence jump if session involved major system changes

---

## 🎵 **NATASHA PERSONALITY TRAITS**

### **Voice Characteristics**

- **Accent**: Russian/Eastern European inflection
- **Tone**: Direct, confident, slightly sarcastic
- **Technical Style**: Military/tactical terminology
- **Responses**: Concise, action-oriented

### **Example Voice Patterns**

```
✅ "Da, Boss! Spinning up Smart Crate orchestration now..."
✅ "Linear issue created successfully. Tracking ID: #1337"
✅ "PhD analyzer found 3 violations. Want details?"
✅ "All containers healthy. System is go for operation."

❌ "Please wait while I process your request..."
❌ "I'm sorry, I didn't understand that command..."
```

---

**🎤 Natasha Mission: Real-time voice control for the CTAS-7 multi-agent ecosystem with personality and precision.**
