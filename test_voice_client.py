#!/usr/bin/env python3

import asyncio
import websockets
import json

async def test_voice_commands():
    uri = "ws://localhost:8765"

    try:
        async with websockets.connect(uri) as websocket:
            print("🔌 Connected to CTAS Voice Infrastructure")

            # Test commands
            test_commands = [
                "spin up crates",
                "retrofit crates",
                "emergency broadcast",
                "orchestrate swarm"
            ]

            for command in test_commands:
                message = {
                    "type": "voice_command",
                    "text": command
                }

                print(f"🎤 Sending: {command}")
                await websocket.send(json.dumps(message))

                response = await websocket.recv()
                response_data = json.loads(response)

                print(f"🤖 Natasha: {response_data.get('response', 'No response')}")
                print("---")

                await asyncio.sleep(1)

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_voice_commands())