#!/usr/bin/env python3
"""
Quick Natasha Voice System - Fixed Structure
"""
import asyncio
import websockets
import json
import pyttsx3
import threading
from pathlib import Path

class NatashaVoice:
    def __init__(self, port=8765):
        self.port = port
        self.clients = set()

        # Initialize TTS with Russian accent
        self.tts_engine = pyttsx3.init()
        voices = self.tts_engine.getProperty('voices')

        # Find female voice
        for voice in voices:
            if 'female' in voice.name.lower() or 'zira' in voice.name.lower():
                self.tts_engine.setProperty('voice', voice.id)
                break

        self.tts_engine.setProperty('rate', 150)  # Slower for accent
        self.tts_engine.setProperty('volume', 0.9)

        print("🎙️ Natasha Voice System ready!")
        print(f"🌐 WebSocket server will run on ws://localhost:{port}")

    def apply_russian_accent(self, text):
        """Apply Russian accent to text"""
        accented = text.replace("th", "z").replace("w", "v").replace("W", "V")
        return accented

    def speak_russian(self, text):
        """Speak with Russian accent"""
        russian_text = self.apply_russian_accent(text)
        def speak():
            self.tts_engine.say(russian_text)
            self.tts_engine.runAndWait()
        thread = threading.Thread(target=speak)
        thread.start()

    async def handle_voice_command(self, command):
        """Handle voice commands for Smart Crate Control"""
        command = command.lower()

        if "spin up crates" in command:
            response = "Da, Boss! Spinning up Smart Crate Orchestration system now..."
            self.speak_russian(response)
            return {"action": "spin_up_crates", "status": "initiated"}

        elif "retrofit crates" in command:
            response = "Copy zat, Boss! Retrofitting legacy crates through WASM pipeline..."
            self.speak_russian(response)
            return {"action": "retrofit_crates", "status": "initiated"}

        elif "build crate" in command:
            response = "Understood, Boss! Building new crate vith SLSA L3 certification..."
            self.speak_russian(response)
            return {"action": "build_new_crate", "status": "initiated"}

        elif "orchestrate" in command or "swarm" in command:
            response = "Da! Initiating Docker Swarm orchestration across all nodes..."
            self.speak_russian(response)
            return {"action": "orchestrate_swarm", "status": "initiated"}

        elif "drop ui" in command or "emergency" in command:
            response = "Boss, ve have some sheet happening, ve are dropping ze UIs, stand by!"
            self.speak_russian(response)
            return {"action": "emergency_mode", "status": "initiated"}

        else:
            response = "Ya ne ponimayu, Boss. Please repeat command."
            self.speak_russian(response)
            return {"action": "unknown", "status": "need_repeat"}

    async def handle_client(self, websocket):
        """Handle WebSocket client connections"""
        self.clients.add(websocket)
        print(f"🔌 Client connected")

        try:
            async for message in websocket:
                data = json.loads(message)

                if data.get('type') == 'voice_command':
                    command = data.get('text', '')
                    print(f"🎤 Voice command: {command}")

                    # Process voice command
                    result = await self.handle_voice_command(command)

                    # Send result back to client
                    await websocket.send(json.dumps({
                        'type': 'command_result',
                        'result': result
                    }))

        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.clients.remove(websocket)
            print(f"🔌 Client disconnected")

    async def start_server(self):
        """Start WebSocket server"""
        print(f"🚀 Starting Natasha voice server on port {self.port}")
        server = await websockets.serve(self.handle_client, "localhost", self.port)
        print(f"✅ Server running at ws://localhost:{self.port}")
        await server.wait_closed()

# Simple HTML client
def create_client_html():
    html = '''<!DOCTYPE html>
<html>
<head>
    <title>🇷🇺 Natasha Voice Control</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #1a1a1a; color: white; }
        .container { max-width: 600px; margin: 0 auto; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .connected { background: #2d5a2d; }
        .disconnected { background: #5a2d2d; }
        button { padding: 15px 30px; margin: 10px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }
        .mic-btn { background: #4CAF50; color: white; }
        .mic-btn.listening { background: #f44336; animation: pulse 1s infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        .conversation { background: #2a2a2a; padding: 20px; border-radius: 10px; margin: 20px 0; height: 300px; overflow-y: auto; }
        .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .user { background: #3a4a8a; text-align: right; }
        .natasha { background: #8a3a3a; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🇷🇺 Natasha Voice Control - Smart Crate Orchestration</h1>
        <div id="status" class="status disconnected">Disconnected</div>

        <div style="text-align: center;">
            <button id="micBtn" class="mic-btn" onclick="toggleListening()">🎤 Start Listening</button>
            <button onclick="testCommands()">🧪 Test Commands</button>
        </div>

        <div id="conversation" class="conversation">
            <div class="message natasha">Privet, Boss! Ready for Smart Crate commands...</div>
        </div>

        <div style="text-align: center; margin-top: 20px;">
            <small>Voice Commands: "spin up crates", "retrofit crates", "build crate", "orchestrate swarm"</small>
        </div>
    </div>

    <script>
        let ws = null;
        let recognition = null;
        let isListening = false;

        // Connect to WebSocket
        function connect() {
            ws = new WebSocket('ws://localhost:8765');

            ws.onopen = function() {
                document.getElementById('status').className = 'status connected';
                document.getElementById('status').textContent = 'Connected to Natasha';
            };

            ws.onclose = function() {
                document.getElementById('status').className = 'status disconnected';
                document.getElementById('status').textContent = 'Disconnected';
            };

            ws.onmessage = function(event) {
                const data = JSON.parse(event.data);
                if (data.type === 'command_result') {
                    addMessage('natasha', `Command executed: ${data.result.action}`);
                }
            };
        }

        // Speech recognition setup
        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = function(event) {
                const command = event.results[0][0].transcript;
                addMessage('user', command);

                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'voice_command',
                        text: command
                    }));
                }
            };
        }

        function toggleListening() {
            if (!isListening && recognition) {
                recognition.start();
                isListening = true;
                document.getElementById('micBtn').textContent = '🛑 Stop Listening';
                document.getElementById('micBtn').className = 'mic-btn listening';
            } else {
                recognition.stop();
                isListening = false;
                document.getElementById('micBtn').textContent = '🎤 Start Listening';
                document.getElementById('micBtn').className = 'mic-btn';
            }
        }

        function addMessage(sender, text) {
            const conversation = document.getElementById('conversation');
            const message = document.createElement('div');
            message.className = `message ${sender}`;
            message.textContent = text;
            conversation.appendChild(message);
            conversation.scrollTop = conversation.scrollHeight;
        }

        function testCommands() {
            addMessage('natasha', 'Test commands: spin up crates, retrofit crates, build crate, orchestrate swarm');
        }

        // Auto-connect on load
        window.onload = function() {
            connect();
        };
    </script>
</body>
</html>'''

    with open('natasha_voice_client.html', 'w') as f:
        f.write(html)
    print("📄 Client HTML created: natasha_voice_client.html")

if __name__ == "__main__":
    print("🚀 Starting Natasha Voice System for Smart Crate Control...")

    # Create client HTML
    create_client_html()

    # Start voice server
    natasha = NatashaVoice(port=8765)
    asyncio.run(natasha.start_server())