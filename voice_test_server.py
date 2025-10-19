#!/usr/bin/env python3
"""
CTAS-7 Voice Testing Server
Mock WebSocket server and voice testing framework for Natasha Volkov agent
"""

import asyncio
import websockets
import json
import time
from datetime import datetime
from typing import Dict, List
import threading
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from voice_test_reporter import VoiceTestReporter

class VoiceTestServer:
    def __init__(self):
        self.connected_clients = set()
        self.voice_reporter = VoiceTestReporter()
        self.test_scenarios = []
        self.running = False

    async def register_client(self, websocket):
        """Register new client connection"""
        self.connected_clients.add(websocket)
        print(f"[VOICE SERVER] Client connected. Total clients: {len(self.connected_clients)}")

    async def unregister_client(self, websocket):
        """Unregister client connection"""
        self.connected_clients.discard(websocket)
        print(f"[VOICE SERVER] Client disconnected. Total clients: {len(self.connected_clients)}")

    async def broadcast_voice_report(self, voice_report_data: Dict):
        """Broadcast voice report to all connected clients"""
        if self.connected_clients:
            message = json.dumps(voice_report_data)
            await asyncio.gather(
                *[client.send(message) for client in self.connected_clients],
                return_exceptions=True
            )

    async def handle_client_message(self, websocket, message: str):
        """Handle incoming message from client"""
        try:
            data = json.loads(message)
            command = data.get('command', 'unknown')

            if command == 'request_voice_report':
                # Client requesting voice report
                test_data = data.get('test_data', {})
                report_type = data.get('report_type', 'status_summary')
                priority = data.get('priority', 'medium')

                # Generate voice report
                voice_report = await self.voice_reporter.create_voice_report(test_data, report_type, priority)

                # Send back to client
                response = {
                    'type': 'voice_report_generated',
                    'report_id': voice_report.report_id,
                    'voice_text': voice_report.voice_text,
                    'priority': voice_report.priority,
                    'timestamp': voice_report.timestamp.isoformat(),
                    'blockchain_hash': voice_report.blockchain_hash
                }
                await websocket.send(json.dumps(response))

            elif command == 'conversational_query':
                # Handle natural language query
                user_query = data.get('query', '')
                test_context = data.get('context', {})

                voice_report = await self.voice_reporter.handle_conversational_query(user_query, test_context)

                response = {
                    'type': 'conversational_response',
                    'query': user_query,
                    'response': voice_report.voice_text,
                    'agent': voice_report.agent_name,
                    'timestamp': voice_report.timestamp.isoformat()
                }
                await websocket.send(json.dumps(response))

            elif command == 'start_demo':
                # Start demonstration scenario
                await self.start_voice_demo_scenario(websocket)

            else:
                await websocket.send(json.dumps({'error': f'Unknown command: {command}'}))

        except json.JSONDecodeError:
            await websocket.send(json.dumps({'error': 'Invalid JSON format'}))

    async def start_voice_demo_scenario(self, websocket):
        """Start a demonstration voice scenario"""
        print("[VOICE SERVER] Starting demo voice scenario...")

        demo_scenarios = [
            {
                'step': 1,
                'description': 'Test Start Announcement',
                'report_type': 'test_start',
                'test_data': {
                    'test_id': 'voice_demo_web_security_scan',
                    'test_type': 'security validation',
                    'estimated_duration': 20
                },
                'priority': 'medium',
                'delay': 1
            },
            {
                'step': 2,
                'description': 'Progress Update',
                'report_type': 'test_progress',
                'test_data': {
                    'test_id': 'voice_demo_web_security_scan',
                    'progress_percentage': 35,
                    'current_step': 'running_nikto_scan'
                },
                'priority': 'low',
                'delay': 5
            },
            {
                'step': 3,
                'description': 'Critical Alert',
                'report_type': 'critical_alert',
                'test_data': {
                    'test_id': 'voice_demo_web_security_scan',
                    'critical_issue': 'SQL injection vulnerability detected on login form'
                },
                'priority': 'critical',
                'delay': 3
            },
            {
                'step': 4,
                'description': 'Test Completion',
                'report_type': 'test_completion',
                'test_data': {
                    'test_id': 'voice_demo_web_security_scan',
                    'status': 'FAILED',
                    'duration': 18.7,
                    'failure_reason': 'critical security vulnerabilities found'
                },
                'priority': 'high',
                'delay': 2
            }
        ]

        for scenario in demo_scenarios:
            await asyncio.sleep(scenario['delay'])

            print(f"[VOICE DEMO] Step {scenario['step']}: {scenario['description']}")

            # Generate voice report
            voice_report = await self.voice_reporter.create_voice_report(
                scenario['test_data'],
                scenario['report_type'],
                scenario['priority']
            )

            # Send to client
            response = {
                'type': 'demo_voice_report',
                'step': scenario['step'],
                'description': scenario['description'],
                'voice_text': voice_report.voice_text,
                'priority': voice_report.priority,
                'agent': voice_report.agent_name,
                'timestamp': voice_report.timestamp.isoformat()
            }
            await websocket.send(json.dumps(response))

        # Final status summary
        await asyncio.sleep(2)
        summary_context = {
            'active_tests': [],
            'completed_tests': [
                {'test_id': 'voice_demo_web_security_scan', 'status': 'FAILED'}
            ]
        }

        summary_report = await self.voice_reporter.create_voice_report(
            summary_context,
            'status_summary',
            'medium'
        )

        await websocket.send(json.dumps({
            'type': 'demo_complete',
            'summary': summary_report.voice_text,
            'agent': summary_report.agent_name
        }))

    async def handle_connection(self, websocket, path):
        """Handle new WebSocket connection"""
        await self.register_client(websocket)

        try:
            # Send welcome message
            welcome = {
                'type': 'connection_established',
                'agent': self.voice_reporter.agent_name,
                'available_commands': [
                    'request_voice_report',
                    'conversational_query',
                    'start_demo'
                ],
                'timestamp': datetime.now().isoformat()
            }
            await websocket.send(json.dumps(welcome))

            # Listen for messages
            async for message in websocket:
                await self.handle_client_message(websocket, message)

        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            await self.unregister_client(websocket)

    async def start_server(self, host='localhost', port=8765):
        """Start the voice testing WebSocket server"""
        print(f"[VOICE SERVER] Starting voice test server on {host}:{port}")
        print(f"[VOICE SERVER] Voice Agent: {self.voice_reporter.agent_name}")
        print("[VOICE SERVER] Commands available:")
        print("  - request_voice_report: Generate voice report for test data")
        print("  - conversational_query: Ask natural language questions")
        print("  - start_demo: Run demonstration scenario")

        self.running = True

        async with websockets.serve(self.handle_connection, host, port):
            print(f"[VOICE SERVER] Server ready! Connect with WebSocket client")
            await asyncio.Future()  # Run forever

class VoiceTestClient:
    """Test client for voice system"""

    def __init__(self):
        self.websocket = None

    async def connect(self, uri='ws://localhost:8765'):
        """Connect to voice test server"""
        try:
            self.websocket = await websockets.connect(uri)
            print(f"[VOICE CLIENT] Connected to {uri}")
            return True
        except Exception as e:
            print(f"[VOICE CLIENT] Connection failed: {e}")
            return False

    async def request_voice_report(self, test_data: Dict, report_type: str = 'status_summary', priority: str = 'medium'):
        """Request voice report generation"""
        if not self.websocket:
            print("[VOICE CLIENT] Not connected to server")
            return None

        request = {
            'command': 'request_voice_report',
            'test_data': test_data,
            'report_type': report_type,
            'priority': priority
        }

        await self.websocket.send(json.dumps(request))
        response = await self.websocket.recv()
        return json.loads(response)

    async def ask_question(self, query: str, context: Dict = {}):
        """Ask conversational question"""
        if not self.websocket:
            print("[VOICE CLIENT] Not connected to server")
            return None

        request = {
            'command': 'conversational_query',
            'query': query,
            'context': context
        }

        await self.websocket.send(json.dumps(request))
        response = await self.websocket.recv()
        return json.loads(response)

    async def start_demo(self):
        """Start demo scenario"""
        if not self.websocket:
            print("[VOICE CLIENT] Not connected to server")
            return

        request = {'command': 'start_demo'}
        await self.websocket.send(json.dumps(request))

        print("\n🎙️  VOICE DEMO STARTING...")
        print("=" * 60)

        # Listen for demo messages
        while True:
            try:
                response = await self.websocket.recv()
                data = json.loads(response)

                if data.get('type') == 'demo_voice_report':
                    step = data.get('step', 0)
                    description = data.get('description', '')
                    voice_text = data.get('voice_text', '')
                    priority = data.get('priority', 'medium')
                    agent = data.get('agent', 'Unknown')

                    print(f"\n🎯 Step {step}: {description}")
                    print(f"Priority: {priority.upper()}")
                    print(f"🎙️  {agent}: {voice_text}")
                    print("-" * 60)

                elif data.get('type') == 'demo_complete':
                    summary = data.get('summary', '')
                    agent = data.get('agent', 'Unknown')
                    print(f"\n📋 DEMO COMPLETE")
                    print(f"🎙️  {agent}: {summary}")
                    print("=" * 60)
                    break

            except websockets.exceptions.ConnectionClosed:
                print("[VOICE CLIENT] Connection closed")
                break

    async def close(self):
        """Close connection"""
        if self.websocket:
            await self.websocket.close()

async def run_voice_test_interactive():
    """Interactive voice testing"""
    client = VoiceTestClient()

    if not await client.connect():
        print("Failed to connect to voice server")
        return

    print("\n🎙️  VOICE TESTING INTERFACE")
    print("=" * 60)
    print("Commands:")
    print("1. demo - Run full voice demonstration")
    print("2. ask <question> - Ask conversational question")
    print("3. report - Request status report")
    print("4. quit - Exit")
    print("=" * 60)

    while True:
        try:
            command = input("\n> ").strip().lower()

            if command == 'quit':
                break
            elif command == 'demo':
                await client.start_demo()
            elif command.startswith('ask '):
                question = command[4:]
                response = await client.ask_question(question)
                if response:
                    print(f"🎙️  {response.get('agent', 'Agent')}: {response.get('response', 'No response')}")
            elif command == 'report':
                test_context = {
                    'active_tests': [{'test_id': 'sample_active_test', 'status': 'RUNNING'}],
                    'completed_tests': [{'test_id': 'sample_completed', 'status': 'PASSED'}]
                }
                response = await client.request_voice_report(test_context)
                if response:
                    print(f"🎙️  Voice Report: {response.get('voice_text', 'No text')}")
            else:
                print("Unknown command. Type 'demo', 'ask <question>', 'report', or 'quit'")

        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Error: {e}")

    await client.close()

async def main():
    """Main function - choose server or client mode"""
    if len(sys.argv) > 1 and sys.argv[1] == 'server':
        # Run as server
        server = VoiceTestServer()
        await server.start_server()
    else:
        # Run as interactive client
        await run_voice_test_interactive()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == 'server':
        print("🚀 Starting Voice Test Server...")
    else:
        print("🚀 Starting Voice Test Client...")
        print("Note: Start server in another terminal with 'python voice_test_server.py server'")

    asyncio.run(main())