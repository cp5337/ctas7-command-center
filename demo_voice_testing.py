#!/usr/bin/env python3
"""
CTAS-7 Voice Testing Demonstration
Complete demonstration of voice testing capabilities for Natasha Volkov agent
"""

import asyncio
import sys
import os
import json
import subprocess
import time
from datetime import datetime

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from voice_test_reporter import VoiceTestReporter

class VoiceTestingDemo:
    def __init__(self):
        self.voice_reporter = VoiceTestReporter()

    def print_demo_header(self, title: str):
        """Print formatted demo section header"""
        print(f"\n{'='*80}")
        print(f"🎙️  {title}")
        print(f"{'='*80}")

    def print_voice_output(self, agent_name: str, text: str, priority: str = "medium"):
        """Print formatted voice output"""
        priority_icons = {
            'low': '🔵',
            'medium': '🟡',
            'high': '🟠',
            'critical': '🔴'
        }
        icon = priority_icons.get(priority, '⚪')

        print(f"\n{icon} {agent_name}:")
        print(f"   \"{text}\"")
        print(f"   [Priority: {priority.upper()}]")

    async def demo_voice_report_types(self):
        """Demonstrate different voice report types"""
        self.print_demo_header("VOICE REPORT TYPES DEMONSTRATION")

        test_scenarios = [
            {
                'name': 'Test Start Report',
                'type': 'test_start',
                'data': {
                    'test_id': 'docker_web_threat_simulation',
                    'test_type': 'security validation',
                    'estimated_duration': 15
                },
                'priority': 'medium'
            },
            {
                'name': 'Progress Update',
                'type': 'test_progress',
                'data': {
                    'test_id': 'docker_web_threat_simulation',
                    'progress_percentage': 60,
                    'current_step': 'voice_trigger_sqlmap'
                },
                'priority': 'low'
            },
            {
                'name': 'Critical Alert',
                'type': 'critical_alert',
                'data': {
                    'test_id': 'docker_voice_integration_e2e',
                    'critical_issue': 'voice recognition accuracy below 94% threshold'
                },
                'priority': 'critical'
            },
            {
                'name': 'Test Completion - Success',
                'type': 'test_completion',
                'data': {
                    'test_id': 'docker_l_star_validation',
                    'status': 'PASSED',
                    'duration': 28.7
                },
                'priority': 'medium'
            },
            {
                'name': 'Test Completion - Failure',
                'type': 'test_completion',
                'data': {
                    'test_id': 'docker_voice_integration_e2e',
                    'status': 'FAILED',
                    'duration': 8.2,
                    'failure_reason': 'voice transcription validation error'
                },
                'priority': 'high'
            }
        ]

        for i, scenario in enumerate(test_scenarios, 1):
            print(f"\n[{i}/{len(test_scenarios)}] {scenario['name']}")
            print("-" * 60)

            voice_report = await self.voice_reporter.create_voice_report(
                scenario['data'],
                scenario['type'],
                scenario['priority']
            )

            self.print_voice_output(
                voice_report.agent_name,
                voice_report.voice_text,
                voice_report.priority
            )

            await asyncio.sleep(1)  # Pause between reports

    async def demo_conversational_queries(self):
        """Demonstrate conversational voice capabilities"""
        self.print_demo_header("CONVERSATIONAL VOICE QUERIES")

        # Sample test context for conversations
        test_context = {
            'active_tests': [
                {
                    'test_id': 'docker_web_threat_simulation',
                    'status': 'RUNNING',
                    'progress_percentage': 75,
                    'health_indicator': '🟢'
                }
            ],
            'completed_tests': [
                {
                    'test_id': 'docker_l_star_validation',
                    'status': 'PASSED',
                    'duration': 28.7
                },
                {
                    'test_id': 'docker_voice_integration_e2e',
                    'status': 'FAILED',
                    'duration': 8.2,
                    'failure_reason': 'voice recognition accuracy below threshold'
                }
            ]
        }

        conversation_queries = [
            "What's the current status of our tests?",
            "Are there any problems I should know about?",
            "How is the web threat simulation going?",
            "What should we do next?",
            "Any issues with the voice integration test?"
        ]

        for i, query in enumerate(conversation_queries, 1):
            print(f"\n[{i}/{len(conversation_queries)}] User Query:")
            print(f"   \"🗣️  {query}\"")
            print()

            voice_report = await self.voice_reporter.handle_conversational_query(query, test_context)

            self.print_voice_output(
                voice_report.agent_name,
                voice_report.voice_text,
                voice_report.priority
            )

            await asyncio.sleep(1.5)  # Pause between conversations

    async def demo_priority_filtering(self):
        """Demonstrate priority-based filtering"""
        self.print_demo_header("PRIORITY FILTERING DEMONSTRATION")

        # Test with different priority thresholds
        priorities = ['low', 'medium', 'high', 'critical']

        test_data = {
            'test_id': 'priority_filter_test',
            'status': 'RUNNING'
        }

        for threshold in ['low', 'medium', 'high']:
            print(f"\n🎛️  Setting priority filter to: {threshold.upper()}")
            print("-" * 40)

            # Update reporter's priority filter
            self.voice_reporter.user_preferences['priority_filter'] = threshold

            for priority in priorities:
                voice_report = await self.voice_reporter.create_voice_report(
                    test_data,
                    'test_progress',
                    priority
                )

                print(f"   Report priority: {priority.upper()}", end="")

                # Check if it would be spoken based on filter
                priority_levels = {'low': 0, 'medium': 1, 'high': 2, 'critical': 3}
                user_threshold = priority_levels.get(threshold, 1)
                report_level = priority_levels.get(priority, 1)

                if report_level >= user_threshold:
                    print(" ✅ SPOKEN")
                else:
                    print(" ❌ FILTERED OUT")

            await asyncio.sleep(1)

    async def demo_voice_preferences(self):
        """Demonstrate different voice preferences and styles"""
        self.print_demo_header("VOICE PREFERENCES & STYLES")

        test_data = {
            'test_id': 'preference_demo_test',
            'status': 'PASSED',
            'duration': 15.3
        }

        # Test different conversation styles
        styles = [
            ('professional', 'Professional Style'),
            ('technical', 'Technical Style'),
            ('casual', 'Casual Style')
        ]

        for style_key, style_name in styles:
            print(f"\n🎭 {style_name}:")
            print("-" * 30)

            # Update conversation style
            self.voice_reporter.user_preferences['conversation_style'] = style_key

            voice_report = await self.voice_reporter.create_voice_report(
                test_data,
                'test_completion',
                'medium'
            )

            self.print_voice_output(
                voice_report.agent_name,
                voice_report.voice_text,
                voice_report.priority
            )

            await asyncio.sleep(1)

    async def demo_blockchain_verification(self):
        """Demonstrate blockchain verification of voice reports"""
        self.print_demo_header("BLOCKCHAIN VERIFICATION")

        test_data = {
            'test_id': 'blockchain_verification_test',
            'status': 'PASSED',
            'duration': 12.5
        }

        print("Generating voice report with blockchain verification...")

        voice_report = await self.voice_reporter.create_voice_report(
            test_data,
            'test_completion',
            'medium'
        )

        print(f"\n📝 Voice Report Details:")
        print(f"   Report ID: {voice_report.report_id}")
        print(f"   Agent: {voice_report.agent_name}")
        print(f"   Timestamp: {voice_report.timestamp}")
        print(f"   Priority: {voice_report.priority}")
        print(f"   🔒 Blockchain Hash: {voice_report.blockchain_hash}")

        print(f"\n🎙️  Voice Content:")
        print(f"   \"{voice_report.voice_text}\"")

        # Demonstrate verification
        print(f"\n✅ Blockchain verification ensures:")
        print(f"   • Report authenticity")
        print(f"   • Content integrity")
        print(f"   • Agent attribution")
        print(f"   • Timestamp accuracy")

    def demo_supabase_integration(self):
        """Demonstrate Supabase logging integration"""
        self.print_demo_header("SUPABASE INTEGRATION")

        print("🗄️  Voice reports are automatically logged to Supabase with:")
        print()
        print("📊 Database Schema:")
        print("   • voice_reports table")
        print("   • agent_name (Natasha Volkov)")
        print("   • voice_text (transcribed content)")
        print("   • test_context (related test data)")
        print("   • priority (low/medium/high/critical)")
        print("   • blockchain_hash (verification)")
        print("   • audio_url (generated speech file)")
        print()
        print("🔄 Real-time Updates:")
        print("   • WebSocket subscriptions for React dashboard")
        print("   • Push notifications for iOS app")
        print("   • Voice history for conversation context")
        print()
        print("🎯 UI Integration:")
        print("   • Voice transcripts in chat interface")
        print("   • Audio playback controls")
        print("   • Priority-based filtering")
        print("   • Agent attribution and timestamps")

    async def run_full_demonstration(self):
        """Run complete voice testing demonstration"""
        print("🎙️  CTAS-7 VOICE TESTING COMPREHENSIVE DEMONSTRATION")
        print(f"Agent: {self.voice_reporter.agent_name}")
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        # Run all demo sections
        await self.demo_voice_report_types()
        await self.demo_conversational_queries()
        await self.demo_priority_filtering()
        await self.demo_voice_preferences()
        await self.demo_blockchain_verification()
        self.demo_supabase_integration()

        # Final summary
        self.print_demo_header("DEMONSTRATION COMPLETE")
        print("✅ All voice testing capabilities demonstrated")
        print("🎯 Voice system ready for integration")
        print()
        print("🚀 Next Steps:")
        print("   1. Run voice_test_server.py server (in terminal)")
        print("   2. Run voice_test_server.py (in another terminal)")
        print("   3. Test interactive voice commands")
        print("   4. Integrate with ElevenLabs API for speech synthesis")
        print("   5. Connect to React/iOS UI for complete system")

async def main():
    """Main demonstration function"""
    demo = VoiceTestingDemo()
    await demo.run_full_demonstration()

if __name__ == "__main__":
    asyncio.run(main())