#!/usr/bin/env python3
import asyncio
import websockets
import json

async def test_voice():
    uri = "ws://localhost:8765"
    try:
        async with websockets.connect(uri) as websocket:
            print("🔌 Connected to voice server")

            # Test voice command
            command = {
                "type": "voice_command",
                "text": "spin up crates"
            }

            await websocket.send(json.dumps(command))
            print("🎤 Sent: spin up crates")

            response = await websocket.recv()
            data = json.loads(response)
            print(f"🎯 Response: {data}")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_voice())