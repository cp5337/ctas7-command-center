#!/usr/bin/env python3
"""
CTAS-7 Voice Test Reporter
Natural language integration with ElevenLabs and multi-agent voice system
Agent: Natasha Volkov (Voice Processing) + Elena Rodriguez (QA Visualization)
"""

import asyncio
import json
import requests
import hashlib
from datetime import datetime
from typing import Dict, List, Optional
import websockets
from dataclasses import dataclass

@dataclass
class VoiceReport:
    """Structured voice report data"""
    report_id: str
    agent_name: str
    test_context: Dict
    voice_text: str
    priority: str  # 'critical', 'high', 'medium', 'low'
    timestamp: datetime
    blockchain_hash: str

class VoiceTestReporter:
    def __init__(self):
        self.agent_name = "Natasha Volkov"
        self.secondary_agent = "Elena Rodriguez"
        self.voice_enabled = True
        self.elevenlabs_api_key = "demo_key"  # In production, use environment variable
        self.conversation_history = []
        self.user_preferences = {
            "detail_level": "medium",  # 'brief', 'medium', 'detailed'
            "voice_speed": "normal",
            "priority_filter": "medium",  # Only report medium+ priority
            "conversation_style": "professional"  # 'professional', 'casual', 'technical'
        }

    def generate_natural_voice_text(self, test_data: Dict, report_type: str) -> str:
        """Generate natural language voice text based on test data and context"""

        if report_type == "test_start":
            return self._generate_test_start_report(test_data)
        elif report_type == "test_progress":
            return self._generate_progress_report(test_data)
        elif report_type == "test_completion":
            return self._generate_completion_report(test_data)
        elif report_type == "critical_alert":
            return self._generate_critical_alert(test_data)
        elif report_type == "status_summary":
            return self._generate_status_summary(test_data)
        elif report_type == "conversational_response":
            return self._generate_conversational_response(test_data)
        else:
            return f"Unknown report type: {report_type}"

    def _generate_test_start_report(self, test_data: Dict) -> str:
        """Generate natural voice report for test start"""
        test_id = test_data.get('test_id', 'unknown test')
        test_type = test_data.get('test_type', 'general')

        # Clean up test ID for natural speech
        readable_test = test_id.replace('_', ' ').replace('docker', 'Docker').title()

        return f"Hi, this is {self.agent_name}. I'm starting the {readable_test} now. This is a {test_type} test that should take about {test_data.get('estimated_duration', 'a few')} seconds. I'll keep you updated on the progress."

    def _generate_progress_report(self, test_data: Dict) -> str:
        """Generate natural voice report for test progress"""
        test_id = test_data.get('test_id', 'unknown test')
        progress = test_data.get('progress_percentage', 0)
        current_step = test_data.get('current_step', 'unknown step')

        readable_test = test_id.replace('_', ' ').replace('docker', 'Docker').title()
        readable_step = current_step.replace('_', ' ').title()

        if progress < 25:
            status_phrase = "just getting started"
        elif progress < 50:
            status_phrase = "making good progress"
        elif progress < 75:
            status_phrase = "moving along well"
        else:
            status_phrase = "almost finished"

        return f"Update on {readable_test} - we're {status_phrase} at {progress:.0f} percent. Currently working on {readable_step}. Everything looks good so far."

    def _generate_completion_report(self, test_data: Dict) -> str:
        """Generate natural voice report for test completion"""
        test_id = test_data.get('test_id', 'unknown test')
        status = test_data.get('status', 'unknown')
        duration = test_data.get('duration', 0)

        readable_test = test_id.replace('_', ' ').replace('docker', 'Docker').title()

        if status == "PASSED":
            return f"Great news! The {readable_test} completed successfully in {duration:.1f} seconds. All objectives were met and the system is ready for the next phase."
        elif status == "FAILED":
            failure_reason = test_data.get('failure_reason', 'unspecified error')
            return f"I need to report an issue. The {readable_test} failed after {duration:.1f} seconds due to {failure_reason}. I recommend a manual review before proceeding."
        else:
            return f"The {readable_test} finished with status {status} after {duration:.1f} seconds. Please check the detailed logs for more information."

    def _generate_critical_alert(self, test_data: Dict) -> str:
        """Generate urgent voice alert for critical issues"""
        test_id = test_data.get('test_id', 'unknown test')
        issue = test_data.get('critical_issue', 'unspecified critical error')

        readable_test = test_id.replace('_', ' ').replace('docker', 'Docker').title()

        return f"Critical alert from {self.agent_name}. The {readable_test} has encountered a serious issue: {issue}. Immediate attention required. I'm halting automated processes until this is resolved."

    def _generate_status_summary(self, test_data: Dict) -> str:
        """Generate comprehensive status summary"""
        active_tests = test_data.get('active_tests', [])
        completed_tests = test_data.get('completed_tests', [])
        failed_tests = [t for t in completed_tests if t.get('status') == 'FAILED']

        if not active_tests and not completed_tests:
            return f"System status from {self.agent_name}: All quiet here. No active tests running and we're ready for new test execution whenever you are."

        summary = f"Status update from {self.agent_name}. "

        if active_tests:
            summary += f"I'm currently monitoring {len(active_tests)} active test{'s' if len(active_tests) != 1 else ''}. "

            # Check for any issues
            issues = [t for t in active_tests if t.get('health_indicator') == '🔴']
            if issues:
                summary += f"I'm seeing {len(issues)} test{'s' if len(issues) != 1 else ''} with issues that may need attention. "

        if completed_tests:
            passed_count = len(completed_tests) - len(failed_tests)
            summary += f"Today we've completed {len(completed_tests)} tests - {passed_count} passed and {len(failed_tests)} failed. "

            if failed_tests:
                recent_failure = failed_tests[-1].get('test_id', 'unknown test')
                summary += f"The most recent failure was {recent_failure.replace('_', ' ')}. "

        return summary

    def _generate_conversational_response(self, query_data: Dict) -> str:
        """Generate conversational response to user queries"""
        query = query_data.get('user_query', '').lower()
        context = query_data.get('context', {})

        if 'status' in query or 'how' in query:
            return self._generate_status_summary(context)
        elif 'problem' in query or 'issue' in query or 'wrong' in query:
            failed_tests = [t for t in context.get('completed_tests', []) if t.get('status') == 'FAILED']
            if failed_tests:
                latest_failure = failed_tests[-1]
                test_name = latest_failure.get('test_id', 'unknown test').replace('_', ' ')
                reason = latest_failure.get('failure_reason', 'unspecified error')
                return f"The main issue I'm seeing is with the {test_name} test. It failed due to {reason}. Would you like me to provide more details or should we retry?"
            else:
                return "I'm not seeing any current problems. All recent tests have been passing normally. Is there something specific you're concerned about?"
        elif 'next' in query or 'what should' in query:
            return "Based on the current test results, I'd recommend reviewing any failed tests first, then we can proceed with the next phase of testing. Would you like me to prioritize any specific test types?"
        else:
            return f"I'm here to help with test monitoring and reporting. You can ask me about test status, current issues, or what we should do next. What would you like to know?"

    async def create_voice_report(self, test_data: Dict, report_type: str, priority: str = "medium") -> VoiceReport:
        """Create a structured voice report"""

        # Generate natural voice text
        voice_text = self.generate_natural_voice_text(test_data, report_type)

        # Create report ID
        report_id = f"voice_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{len(self.conversation_history)}"

        # Generate blockchain hash for verification
        report_content = {
            "agent": self.agent_name,
            "text": voice_text,
            "test_data": test_data,
            "timestamp": datetime.now().isoformat()
        }
        blockchain_hash = hashlib.blake2b(json.dumps(report_content, sort_keys=True).encode()).hexdigest()

        # Create voice report
        voice_report = VoiceReport(
            report_id=report_id,
            agent_name=self.agent_name,
            test_context=test_data,
            voice_text=voice_text,
            priority=priority,
            timestamp=datetime.now(),
            blockchain_hash=blockchain_hash
        )

        # Add to conversation history
        self.conversation_history.append(voice_report)

        return voice_report

    async def speak_report(self, voice_report: VoiceReport):
        """Send voice report to ElevenLabs API for speech synthesis"""

        # Check priority filter
        priority_levels = {'low': 0, 'medium': 1, 'high': 2, 'critical': 3}
        user_threshold = priority_levels.get(self.user_preferences['priority_filter'], 1)
        report_level = priority_levels.get(voice_report.priority, 1)

        if report_level < user_threshold:
            print(f"[VOICE] Skipping low-priority report: {voice_report.priority}")
            return

        print(f"[VOICE] {voice_report.agent_name}: {voice_report.voice_text}")

        # In production, this would make actual ElevenLabs API call
        if self.voice_enabled:
            await self._elevenlabs_synthesize(voice_report.voice_text)

        # Log to Supabase for UI consumption
        await self._log_voice_report_to_supabase(voice_report)

    async def _elevenlabs_synthesize(self, text: str):
        """Synthesize speech using ElevenLabs API (mock implementation)"""

        # Mock API call - in production this would be:
        # response = requests.post(
        #     f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
        #     headers={"xi-api-key": self.elevenlabs_api_key},
        #     json={"text": text, "voice_settings": {"stability": 0.5, "similarity_boost": 0.8}}
        # )

        print(f"[ELEVENLABS] Synthesizing: '{text[:50]}...' for voice agent {self.agent_name}")
        await asyncio.sleep(0.5)  # Simulate API call delay

    async def _log_voice_report_to_supabase(self, voice_report: VoiceReport):
        """Log voice report to Supabase for React/iOS consumption"""

        supabase_payload = {
            "voice_report_id": voice_report.report_id,
            "agent_name": voice_report.agent_name,
            "voice_text": voice_report.voice_text,
            "test_context": voice_report.test_context,
            "priority": voice_report.priority,
            "timestamp": voice_report.timestamp.isoformat(),
            "blockchain_hash": voice_report.blockchain_hash,
            "audio_url": f"https://ctas7-audio.internal/{voice_report.report_id}.mp3"  # Mock URL
        }

        print(f"[SUPABASE] Logging voice report: {voice_report.report_id}")
        # In production: await supabase.table('voice_reports').insert(supabase_payload)

    async def handle_conversational_query(self, user_query: str, test_context: Dict) -> VoiceReport:
        """Handle natural language queries from user"""

        query_data = {
            "user_query": user_query,
            "context": test_context,
            "conversation_history": [r.voice_text for r in self.conversation_history[-5:]]  # Last 5 exchanges
        }

        # Create conversational response
        voice_report = await self.create_voice_report(query_data, "conversational_response", "medium")

        # Speak the response
        await self.speak_report(voice_report)

        return voice_report

    async def start_voice_monitoring(self, websocket_url: str = "ws://localhost:8765/voice-reports"):
        """Start monitoring for voice report requests"""
        print(f"[VOICE] Starting voice monitoring - {self.agent_name}")
        print(f"[VOICE] Connected agents: {self.agent_name} + {self.secondary_agent}")
        print(f"[VOICE] Voice synthesis: {'ENABLED' if self.voice_enabled else 'DISABLED'}")

        try:
            async with websockets.connect(websocket_url) as websocket:
                async for message in websocket:
                    try:
                        request_data = json.loads(message)

                        # Extract request details
                        report_type = request_data.get('report_type', 'status_summary')
                        test_data = request_data.get('test_data', {})
                        priority = request_data.get('priority', 'medium')
                        user_query = request_data.get('user_query')

                        # Handle different types of requests
                        if user_query:
                            await self.handle_conversational_query(user_query, test_data)
                        else:
                            voice_report = await self.create_voice_report(test_data, report_type, priority)
                            await self.speak_report(voice_report)

                    except json.JSONDecodeError:
                        print(f"[ERROR] Invalid JSON in voice request: {message}")

        except Exception as e:
            print(f"[ERROR] Voice monitoring connection failed: {e}")
            await self._demo_voice_reports()

    async def _demo_voice_reports(self):
        """Demo voice reports with sample data"""
        print("[VOICE] Running in demo mode...")

        # Sample scenarios
        scenarios = [
            {
                "report_type": "test_start",
                "test_data": {
                    "test_id": "docker_web_threat_simulation",
                    "test_type": "security validation",
                    "estimated_duration": 15
                },
                "priority": "medium"
            },
            {
                "report_type": "test_progress",
                "test_data": {
                    "test_id": "docker_web_threat_simulation",
                    "progress_percentage": 60,
                    "current_step": "voice_trigger_sqlmap"
                },
                "priority": "low"
            },
            {
                "report_type": "critical_alert",
                "test_data": {
                    "test_id": "docker_voice_integration_e2e",
                    "critical_issue": "voice recognition accuracy below 94% threshold"
                },
                "priority": "critical"
            },
            {
                "report_type": "test_completion",
                "test_data": {
                    "test_id": "docker_l_star_validation",
                    "status": "PASSED",
                    "duration": 28.7
                },
                "priority": "medium"
            }
        ]

        for i, scenario in enumerate(scenarios):
            await asyncio.sleep(5)  # Wait between reports

            voice_report = await self.create_voice_report(
                scenario["test_data"],
                scenario["report_type"],
                scenario["priority"]
            )

            await self.speak_report(voice_report)

        # Demo conversational queries
        await asyncio.sleep(3)
        await self.handle_conversational_query(
            "What's the current status of our tests?",
            {"active_tests": [], "completed_tests": [{"test_id": "demo_test", "status": "PASSED"}]}
        )

async def main():
    """Main execution function"""
    reporter = VoiceTestReporter()
    await reporter.start_voice_monitoring()

if __name__ == "__main__":
    asyncio.run(main())