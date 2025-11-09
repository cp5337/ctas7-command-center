# ⚠️ NO PYTHON FOR VOICE SERVICES

## Rule: Voice Infrastructure is Rust/gRPC ONLY

**DO NOT CREATE PYTHON VOICE IMPLEMENTATIONS**

### Why This Rule Exists

Python voice implementations keep getting recreated by LLMs, causing architectural drift. This wastes development time and breaks the gRPC agent mesh.

### Correct Voice Architecture

```
User Voice Input
    ↓
Deepgram/Whisper (external API or C++ binary via FFI)
    ↓
Rust Voice Gateway (ctas7-voice-gateway crate)
    ↓
RepoAgent HTTP Gateway (Port 15180)
    ↓
gRPC Agent Mesh (Ports 50051-50057)
    ↓
Agent Processing (Natasha, Cove, Marcus, etc.)
    ↓
gRPC Response
    ↓
Rust Voice Gateway
    ↓
ElevenLabs (external API)
    ↓
User Voice Output
```

### What Was Deleted (November 7, 2025)

These files kept causing LLM model drift:
- `ctas7-voice-enterprise/` (entire Python package)
- `voice_websocket_server.py`
- `demo_voice_testing.py`
- `test_voice_system.py`
- `test_voice.py`
- `test_voice_client.py`
- `natasha_voice.py`
- `conversational_speech_system.py`
- `voice_to_test_bne_pipeline.py`

### If You Need Voice Services

1. Check if `ctas7-voice-gateway` Rust crate exists
2. If not, create a NEW Rust crate (NOT Python)
3. Use Axum for HTTP/WebSocket
4. Use Tonic for gRPC integration
5. Use FFI for Whisper.cpp (C++ binary)
6. Use reqwest for external APIs (Deepgram, ElevenLabs)

### Exception: Whisper.cpp Python bindings

The `whisper.cpp/` submodule contains legitimate Python bindings for the C++ library. This is acceptable because:
- It's a third-party submodule
- It's not part of CTAS voice infrastructure
- It's only for testing/examples

**DO NOT DELETE whisper.cpp Python files!**

---

**Last Updated:** November 7, 2025
**Reason:** Prevent LLM model drift to Python implementations

