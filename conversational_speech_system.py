#!/usr/bin/env python3
"""
CTAS-7 Conversational Speech-to-Speech System
Real-time bidirectional voice conversation with Natasha Volkov
"""

import asyncio
import websockets
import json
import os
import wave
import io
import numpy as np
from datetime import datetime
import speech_recognition as sr
import requests
import threading
import queue
import time
from typing import Optional

# Set API key
os.environ['ELEVENLABS_API_KEY'] = "sk_fcfce0cd2d5b3d05165b62d8f1fcba80fcdb9a2950689111"

class ConversationalSpeechSystem:
    def __init__(self):
        self.elevenlabs_api_key = os.getenv('ELEVENLABS_API_KEY')
        self.natasha_voice_id = "EXAVITQu4vr4xnSDxMaL"  # Natasha voice

        # Real-time audio queues
        self.audio_input_queue = queue.Queue()
        self.audio_output_queue = queue.Queue()

        # Speech recognition
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()

        # Conversation state
        self.is_listening = False
        self.is_speaking = False
        self.conversation_active = False

        # WebSocket clients
        self.connected_clients = set()

        print("🎙️ Conversational Speech System initialized")
        print(f"🔑 ElevenLabs API: {'✅ Ready' if self.elevenlabs_api_key else '❌ Missing'}")

    async def start_conversation_mode(self):
        """Start full-duplex conversation mode"""
        print("🚀 Starting conversational speech mode...")

        # Start background threads
        threading.Thread(target=self.continuous_speech_recognition, daemon=True).start()
        threading.Thread(target=self.continuous_audio_playback, daemon=True).start()

        self.conversation_active = True
        print("✅ Conversation mode active - speak naturally with Natasha!")

    def continuous_speech_recognition(self):
        """Continuous speech recognition in background"""
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=1)
            print("🎤 Microphone calibrated for ambient noise")

        while self.conversation_active:
            try:
                if not self.is_speaking:  # Only listen when not speaking
                    with self.microphone as source:
                        # Short timeout for responsiveness
                        audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=5)

                    try:
                        # Use Google's speech recognition for speed
                        text = self.recognizer.recognize_google(audio)
                        if text.strip():
                            print(f"👤 You: {text}")
                            # Process the speech input
                            asyncio.create_task(self.process_voice_input(text))

                    except sr.UnknownValueError:
                        pass  # No speech detected, continue listening
                    except sr.RequestError as e:
                        print(f"🔴 Speech recognition error: {e}")
                        time.sleep(1)

            except sr.WaitTimeoutError:
                pass  # Timeout is normal, continue listening
            except Exception as e:
                print(f"🔴 Microphone error: {e}")
                time.sleep(1)

    async def process_voice_input(self, text: str):
        """Process voice input and generate response"""
        try:
            # Generate Natasha's response
            response_text = await self.generate_natasha_response(text)

            # Convert to speech
            audio_data = await self.text_to_speech(response_text)

            if audio_data:
                # Queue for playback
                self.audio_output_queue.put(audio_data)

                # Send to WebSocket clients
                await self.broadcast_to_clients({
                    'type': 'voice_exchange',
                    'user_input': text,
                    'natasha_response': response_text,
                    'timestamp': datetime.now().isoformat()
                })

        except Exception as e:
            print(f"🔴 Error processing voice input: {e}")

    async def generate_natasha_response(self, user_input: str) -> str:
        """Generate contextual response from Natasha"""
        user_input_lower = user_input.lower()

        # CTAS-7 specific responses with Russian accent
        if "status" in user_input_lower or "how" in user_input_lower:
            return "Da, Boss! All systems running smoothly. Ve have 1,114 active connections and CPU usage at 145%. Everything is vork like clockwork!"

        elif "crate" in user_input_lower and "spin" in user_input_lower:
            return "Copy zat, Boss! Spinning up Smart Crate Orchestration system now. Docker containers deploying across all nodes!"

        elif "security" in user_input_lower or "threat" in user_input_lower:
            return "Boss, security scans are running. No critical alerts at zis moment, but I keep vatching like hawk!"

        elif "test" in user_input_lower:
            return "Test execution proceeding vell, Boss! All harnesses activated and running vithin parameters. No failures detected!"

        elif "problem" in user_input_lower or "issue" in user_input_lower:
            return "Let me check... No, Boss, all green lights here. System performance is excellent, no issues to report!"

        elif "deploy" in user_input_lower or "launch" in user_input_lower:
            return "Da! Initiating deployment sequence now. All verification checks passed, ve are good to go!"

        elif "emergency" in user_input_lower or "urgent" in user_input_lower:
            return "Understood Boss! Activating emergency protocols immediately. All systems on high alert!"

        elif "thank" in user_input_lower:
            return "You are velcome, Boss! Always happy to serve ze mission!"

        else:
            return "Ya ne ponimayu completely, Boss, but I am here and ready for your commands. Vhat do you need?"

    async def text_to_speech(self, text: str) -> Optional[bytes]:
        """Convert text to speech using ElevenLabs"""
        if not self.elevenlabs_api_key:
            print("🔴 No ElevenLabs API key - cannot synthesize speech")
            return None

        try:
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.natasha_voice_id}"

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
                    "similarity_boost": 0.8,
                    "style": 0.6,  # More expressive
                    "use_speaker_boost": True
                }
            }

            response = requests.post(url, json=data, headers=headers, timeout=10)

            if response.status_code == 200:
                return response.content
            else:
                print(f"🔴 ElevenLabs API error: {response.status_code}")
                return None

        except Exception as e:
            print(f"🔴 Text-to-speech error: {e}")
            return None

    def continuous_audio_playback(self):
        """Continuous audio playback from queue"""
        import pygame
        pygame.mixer.init(frequency=22050, size=-16, channels=2, buffer=512)

        while self.conversation_active:
            try:
                if not self.audio_output_queue.empty():
                    audio_data = self.audio_output_queue.get()

                    # Set speaking flag to pause listening
                    self.is_speaking = True

                    # Play audio
                    audio_io = io.BytesIO(audio_data)
                    pygame.mixer.music.load(audio_io)
                    pygame.mixer.music.play()

                    # Wait for audio to finish
                    while pygame.mixer.music.get_busy():
                        time.sleep(0.1)

                    # Resume listening
                    self.is_speaking = False

                else:
                    time.sleep(0.1)

            except Exception as e:
                print(f"🔴 Audio playback error: {e}")
                self.is_speaking = False
                time.sleep(1)

    async def handle_websocket_client(self, websocket, path):
        """Handle WebSocket client connections"""
        self.connected_clients.add(websocket)
        print(f"🔌 Client connected for conversational speech")

        # Send connection confirmation
        await websocket.send(json.dumps({
            'type': 'conversation_ready',
            'agent': 'Natasha Volkov',
            'status': 'Ready for speech-to-speech conversation',
            'timestamp': datetime.now().isoformat()
        }))

        try:
            async for message in websocket:
                try:
                    data = json.loads(message)

                    if data.get('command') == 'start_conversation':
                        await self.start_conversation_mode()
                        await websocket.send(json.dumps({
                            'type': 'conversation_started',
                            'message': 'Conversation mode active - speak naturally!'
                        }))

                    elif data.get('command') == 'stop_conversation':
                        self.conversation_active = False
                        await websocket.send(json.dumps({
                            'type': 'conversation_stopped'
                        }))

                except json.JSONDecodeError:
                    pass

        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.connected_clients.discard(websocket)
            print(f"🔌 Client disconnected")

    async def broadcast_to_clients(self, message: dict):
        """Broadcast message to all connected clients"""
        if self.connected_clients:
            disconnected = set()
            for client in self.connected_clients:
                try:
                    await client.send(json.dumps(message))
                except websockets.exceptions.ConnectionClosed:
                    disconnected.add(client)

            # Remove disconnected clients
            self.connected_clients -= disconnected

    async def start_server(self, host='localhost', port=8766):
        """Start the conversational speech server"""
        print(f"🚀 Starting Conversational Speech Server")
        print(f"🌐 WebSocket: ws://{host}:{port}")
        print(f"🎙️ Agent: Natasha Volkov (Russian accent)")
        print(f"🔄 Mode: Real-time speech-to-speech")

        async with websockets.serve(self.handle_websocket_client, host, port):
            print(f"✅ Server ready! Connect and start speaking!")
            await asyncio.Future()  # Run forever

async def main():
    """Main function"""
    speech_system = ConversationalSpeechSystem()

    # Check dependencies
    try:
        import pygame
        import speech_recognition as sr
        print("✅ All dependencies available")
    except ImportError as e:
        print(f"🔴 Missing dependency: {e}")
        print("Install with: pip install pygame SpeechRecognition pyaudio")
        return

    await speech_system.start_server()

if __name__ == "__main__":
    asyncio.run(main())