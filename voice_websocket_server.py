#!/usr/bin/env python3
"""
CTAS-7 Voice WebSocket Server
Real WebSocket server for voice testing with actual ElevenLabs integration
"""

import asyncio
import websockets
import json
import os
import requests
import hashlib
from datetime import datetime
from typing import Dict, Set
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from voice_test_reporter import VoiceTestReporter

class VoiceWebSocketServer:
    def __init__(self):
        self.connected_clients: Set = set()
        self.voice_reporter = VoiceTestReporter()
        self.elevenlabs_api_key = os.getenv('ELEVENLABS_API_KEY', '')
        self.voice_id = "EXAVITQu4vr4xnSDxMaL"  # Natasha voice ID

    async def register_client(self, websocket):
        """Register new WebSocket client"""
        self.connected_clients.add(websocket)
        print(f"[SERVER] Client connected from {websocket.remote_address}")

        # Send welcome message with capabilities
        welcome = {
            'type': 'server_ready',
            'agent': self.voice_reporter.agent_name,
            'elevenlabs_enabled': bool(self.elevenlabs_api_key),
            'capabilities': [
                'voice_report_generation',
                'conversational_queries',
                'real_time_synthesis',
                'blockchain_verification'
            ],
            'timestamp': datetime.now().isoformat()
        }
        await websocket.send(json.dumps(welcome))

    async def unregister_client(self, websocket):
        """Unregister WebSocket client"""
        self.connected_clients.discard(websocket)
        print(f"[SERVER] Client disconnected")

    async def synthesize_speech(self, text: str) -> bytes:
        """Synthesize speech using ElevenLabs API"""
        if not self.elevenlabs_api_key:
            print("[VOICE] ElevenLabs API key not configured")
            return b''

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.voice_id}"

        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.elevenlabs_api_key
        }

        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.8
            }
        }

        try:
            response = requests.post(url, json=data, headers=headers)
            if response.status_code == 200:
                return response.content
            else:
                print(f"[VOICE] ElevenLabs API error: {response.status_code}")
                return b''
        except Exception as e:
            print(f"[VOICE] Speech synthesis error: {e}")
            return b''

    async def handle_voice_request(self, websocket, data: Dict):
        """Handle voice report request"""
        test_data = data.get('test_data', {})
        report_type = data.get('report_type', 'status_summary')
        priority = data.get('priority', 'medium')

        # Generate voice report
        voice_report = await self.voice_reporter.create_voice_report(
            test_data, report_type, priority
        )

        # Synthesize speech if ElevenLabs is available
        audio_data = b''
        if self.elevenlabs_api_key:
            audio_data = await self.synthesize_speech(voice_report.voice_text)

        # Prepare response
        response = {
            'type': 'voice_report',
            'report_id': voice_report.report_id,
            'agent': voice_report.agent_name,
            'voice_text': voice_report.voice_text,
            'priority': voice_report.priority,
            'timestamp': voice_report.timestamp.isoformat(),
            'blockchain_hash': voice_report.blockchain_hash,
            'has_audio': bool(audio_data),
            'audio_size': len(audio_data) if audio_data else 0
        }

        await websocket.send(json.dumps(response))

        # Send audio data if available
        if audio_data:
            await websocket.send(audio_data)

        print(f"[VOICE] Generated report: {voice_report.report_id}")

    async def handle_conversation(self, websocket, data: Dict):
        """Handle conversational query"""
        query = data.get('query', '')
        context = data.get('context', {})

        # Process conversational query
        voice_report = await self.voice_reporter.handle_conversational_query(query, context)

        # Synthesize response
        audio_data = b''
        if self.elevenlabs_api_key:
            audio_data = await self.synthesize_speech(voice_report.voice_text)

        response = {
            'type': 'conversation_response',
            'query': query,
            'response': voice_report.voice_text,
            'agent': voice_report.agent_name,
            'timestamp': voice_report.timestamp.isoformat(),
            'has_audio': bool(audio_data)
        }

        await websocket.send(json.dumps(response))

        if audio_data:
            await websocket.send(audio_data)

        print(f"[CONVERSATION] Query: '{query}' -> Response generated")

    async def handle_test_stream(self, websocket, data: Dict):
        """Handle real-time test data stream"""
        test_update = data.get('test_update', {})

        # Determine if voice alert is needed
        status = test_update.get('status', '')
        priority = 'low'

        if status == 'FAILED':
            priority = 'critical'
        elif status == 'PASSED':
            priority = 'medium'
        elif test_update.get('health_indicator') == '🔴':
            priority = 'high'

        # Generate appropriate voice report
        if status in ['FAILED', 'PASSED']:
            report_type = 'test_completion'
        elif test_update.get('progress_percentage', 0) > 0:
            report_type = 'test_progress'
        else:
            report_type = 'test_start'

        voice_report = await self.voice_reporter.create_voice_report(
            test_update, report_type, priority
        )

        # Only synthesize for medium+ priority
        audio_data = b''
        if priority != 'low' and self.elevenlabs_api_key:
            audio_data = await self.synthesize_speech(voice_report.voice_text)

        response = {
            'type': 'test_stream_voice',
            'test_id': test_update.get('test_id', 'unknown'),
            'voice_text': voice_report.voice_text,
            'priority': priority,
            'agent': voice_report.agent_name,
            'has_audio': bool(audio_data)
        }

        await websocket.send(json.dumps(response))

        if audio_data:
            await websocket.send(audio_data)

    async def handle_client_message(self, websocket, message):
        """Handle incoming WebSocket message"""
        try:
            if isinstance(message, bytes):
                # Skip binary messages (they might be audio data)
                return

            data = json.loads(message)
            command = data.get('command', '')

            if command == 'voice_request':
                await self.handle_voice_request(websocket, data)
            elif command == 'conversation':
                await self.handle_conversation(websocket, data)
            elif command == 'test_stream':
                await self.handle_test_stream(websocket, data)
            elif command == 'ping':
                await websocket.send(json.dumps({'type': 'pong', 'timestamp': datetime.now().isoformat()}))
            else:
                error = {'type': 'error', 'message': f'Unknown command: {command}'}
                await websocket.send(json.dumps(error))

        except json.JSONDecodeError as e:
            error = {'type': 'error', 'message': f'Invalid JSON: {str(e)}'}
            await websocket.send(json.dumps(error))
        except Exception as e:
            error = {'type': 'error', 'message': f'Server error: {str(e)}'}
            await websocket.send(json.dumps(error))

    async def handle_connection(self, websocket, path):
        """Handle new WebSocket connection"""
        await self.register_client(websocket)

        try:
            async for message in websocket:
                await self.handle_client_message(websocket, message)
        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            print(f"[SERVER] Connection error: {e}")
        finally:
            await self.unregister_client(websocket)

    async def start_server(self, host='localhost', port=8765):
        """Start the WebSocket server"""
        print(f"[SERVER] Starting CTAS-7 Voice WebSocket Server")
        print(f"[SERVER] Host: {host}:{port}")
        print(f"[SERVER] Voice Agent: {self.voice_reporter.agent_name}")
        print(f"[SERVER] ElevenLabs: {'ENABLED' if self.elevenlabs_api_key else 'DISABLED (set ELEVENLABS_API_KEY)'}")

        async with websockets.serve(self.handle_connection, host, port):
            print(f"[SERVER] Server running! Ready for connections...")
            await asyncio.Future()  # Run forever

async def main():
    """Main server startup"""
    server = VoiceWebSocketServer()

    # Check for ElevenLabs API key
    if not server.elevenlabs_api_key:
        print("\n⚠️  WARNING: ELEVENLABS_API_KEY not set in environment")
        print("   Voice synthesis will be disabled")
        print("   Set with: export ELEVENLABS_API_KEY=your_key_here")
        print()

    try:
        await server.start_server()
    except KeyboardInterrupt:
        print("\n[SERVER] Shutting down...")
    except Exception as e:
        print(f"[SERVER] Fatal error: {e}")

if __name__ == "__main__":
    asyncio.run(main())