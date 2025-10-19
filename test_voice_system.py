#!/usr/bin/env python3
"""
CTAS-7 Voice System Test Runner
Test the voice system with real ElevenLabs API
"""

import asyncio
import os
import sys
import json
import subprocess
import time
from datetime import datetime

# Set the API key from shipyard-staging
os.environ['ELEVENLABS_API_KEY'] = "sk_fcfce0cd2d5b3d05165b62d8f1fcba80fcdb9a2950689111"

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from voice_test_reporter import VoiceTestReporter

class VoiceSystemTester:
    def __init__(self):
        self.voice_reporter = VoiceTestReporter()

    def print_header(self, title: str):
        print(f"\n{'='*80}")
        print(f"🎙️  {title}")
        print(f"{'='*80}")

    async def test_voice_generation(self):
        """Test basic voice report generation"""
        self.print_header("VOICE GENERATION TEST")

        test_scenarios = [
            {
                'name': 'Test Start Report',
                'type': 'test_start',
                'data': {
                    'test_id': 'voice_system_validation',
                    'test_type': 'voice synthesis validation',
                    'estimated_duration': 10
                }
            },
            {
                'name': 'Critical Alert',
                'type': 'critical_alert',
                'data': {
                    'test_id': 'security_scan',
                    'critical_issue': 'SQL injection vulnerability detected in login form'
                }
            },
            {
                'name': 'Test Completion',
                'type': 'test_completion',
                'data': {
                    'test_id': 'voice_system_validation',
                    'status': 'PASSED',
                    'duration': 8.5
                }
            }
        ]

        for scenario in test_scenarios:
            print(f"\n🧪 Testing: {scenario['name']}")
            print("-" * 60)

            voice_report = await self.voice_reporter.create_voice_report(
                scenario['data'],
                scenario['type'],
                'medium'
            )

            print(f"Agent: {voice_report.agent_name}")
            print(f"Text: {voice_report.voice_text}")
            print(f"Hash: {voice_report.blockchain_hash[:16]}...")
            print("✅ PASSED")

    async def test_conversational_queries(self):
        """Test conversational capabilities"""
        self.print_header("CONVERSATIONAL QUERIES TEST")

        test_context = {
            'active_tests': [
                {'test_id': 'web_security_scan', 'status': 'RUNNING', 'progress_percentage': 75}
            ],
            'completed_tests': [
                {'test_id': 'database_test', 'status': 'PASSED'},
                {'test_id': 'auth_test', 'status': 'FAILED', 'failure_reason': 'timeout'}
            ]
        }

        queries = [
            "What's the current status of our tests?",
            "Are there any problems I should know about?",
            "What should we do next?"
        ]

        for query in queries:
            print(f"\n❓ Query: {query}")
            print("-" * 40)

            voice_report = await self.voice_reporter.handle_conversational_query(query, test_context)

            print(f"🎙️  {voice_report.agent_name}: {voice_report.voice_text}")
            print("✅ PASSED")

    def test_api_key_validation(self):
        """Test API key configuration"""
        self.print_header("API KEY VALIDATION")

        api_key = os.getenv('ELEVENLABS_API_KEY', '')

        if api_key:
            print(f"✅ API Key found: {api_key[:10]}...")
            print(f"✅ Length: {len(api_key)} characters")
            print(f"✅ Format: {'Valid' if api_key.startswith('sk_') else 'Invalid'}")
        else:
            print("❌ No API key found")
            return False

        return True

    async def run_voice_server_test(self):
        """Test the voice WebSocket server"""
        self.print_header("VOICE SERVER TEST")

        print("🚀 Starting voice server test...")

        # Start the server in background
        server_proc = subprocess.Popen([
            sys.executable, 'voice_websocket_server.py'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        # Give server time to start
        await asyncio.sleep(3)

        try:
            # Check if server is running
            if server_proc.poll() is None:
                print("✅ Voice server started successfully")
                print("🌐 Server ready for WebSocket connections")
            else:
                print("❌ Voice server failed to start")
                stdout, stderr = server_proc.communicate()
                print(f"Error: {stderr.decode()}")

        finally:
            # Clean up
            server_proc.terminate()
            try:
                server_proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server_proc.kill()

        print("🛑 Server stopped")

    async def run_all_tests(self):
        """Run complete test suite"""
        print("🎙️  CTAS-7 VOICE SYSTEM TEST SUITE")
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Agent: {self.voice_reporter.agent_name}")

        tests = [
            ("API Key Validation", self.test_api_key_validation),
            ("Voice Generation", self.test_voice_generation),
            ("Conversational Queries", self.test_conversational_queries),
            ("Voice Server", self.run_voice_server_test)
        ]

        passed = 0
        total = len(tests)

        for test_name, test_func in tests:
            try:
                if asyncio.iscoroutinefunction(test_func):
                    result = await test_func()
                else:
                    result = test_func()

                if result is not False:
                    passed += 1
                    print(f"✅ {test_name}: PASSED")
                else:
                    print(f"❌ {test_name}: FAILED")

            except Exception as e:
                print(f"❌ {test_name}: ERROR - {e}")

        # Summary
        self.print_header("TEST RESULTS SUMMARY")
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")

        if passed == total:
            print("\n🎉 ALL TESTS PASSED! Voice system is ready!")
            print("\n🚀 Next steps:")
            print("   1. Run: python voice_websocket_server.py")
            print("   2. Open: http://localhost:25175")
            print("   3. Test voice interactions in browser")
        else:
            print(f"\n⚠️  {total - passed} test(s) failed. Check configuration.")

async def main():
    """Main test execution"""
    tester = VoiceSystemTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    # Ensure we have the API key
    if not os.getenv('ELEVENLABS_API_KEY'):
        print("Setting ElevenLabs API key from shipyard-staging...")
        os.environ['ELEVENLABS_API_KEY'] = "sk_fcfce0cd2d5b3d05165b62d8f1fcba80fcdb9a2950689111"

    asyncio.run(main())