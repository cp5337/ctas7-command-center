#!/usr/bin/env python3
"""
CTAS-7 Real-Time ASCII Visualization Agent
Continuous monitoring with strip reports and voice integration
Agent: Elena Rodriguez + Marcus Chen (Real-time Systems)
"""

import asyncio
import json
import sys
import time
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Callable
import websockets
import hashlib
from ascii_test_output_agent import AsciiTestOutputAgent

class RealTimeAsciiMonitor:
    def __init__(self):
        self.agent_name = "Elena Rodriguez & Marcus Chen"
        self.agent_role = "Real-time Visualization Team"
        self.active_tests = {}
        self.completed_tests = []
        self.voice_callbacks = []
        self.ui_callbacks = []
        self.running = False
        self.ascii_agent = AsciiTestOutputAgent()

    def register_voice_callback(self, callback: Callable):
        """Register callback for voice system integration"""
        self.voice_callbacks.append(callback)

    def register_ui_callback(self, callback: Callable):
        """Register callback for UI system updates"""
        self.ui_callbacks.append(callback)

    def generate_dashboard_header(self) -> str:
        """Generate main dashboard header"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
        active_count = len(self.active_tests)
        completed_count = len(self.completed_tests)

        return f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                         CTAS-7 REAL-TIME TEST MONITOR                       ║
║══════════════════════════════════════════════════════════════════════════════║
║ Agents: {self.agent_name:<20} │ Time: {timestamp:<25} ║
║ Active Tests: {active_count:<3} │ Completed: {completed_count:<3} │ Voice: ENABLED │ UI: SYNCED     ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

    def generate_strip_report_line(self, test_data: Dict) -> str:
        """Generate single line strip report"""
        test_id = test_data.get('test_id', 'Unknown')[:25]
        status = test_data.get('status', 'unknown').upper()
        duration = test_data.get('duration', 0)
        progress = test_data.get('progress_percentage', 0)
        health = test_data.get('health_indicator', '⚪')

        # Progress bar
        bar_width = 10
        filled = int(bar_width * progress / 100)
        progress_bar = "█" * filled + "░" * (bar_width - filled)

        # Status icon
        status_icons = {
            'RUNNING': '●',
            'PASSED': '✓',
            'FAILED': '✗',
            'TIMEOUT': '⧗',
            'ERROR': '⚠'
        }
        icon = status_icons.get(status, '?')

        return f"═══ {icon} {test_id:<25} │ {status:<8} │ {duration:>6.1f}s │ [{progress_bar}] {progress:>3.0f}% │ {health} ═══"

    def generate_metrics_grid(self, tests: List[Dict]) -> str:
        """Generate compact metrics grid"""
        if not tests:
            return "\n┌─────────────────────────────────────────────────────────────────┐\n│ No active tests - System ready for new test execution          │\n└─────────────────────────────────────────────────────────────────┘"

        grid = "\n┌─────────────────────── ACTIVE TEST METRICS ──────────────────────┐\n"

        for test in tests[:5]:  # Show top 5 active tests
            test_id = test.get('test_id', 'Unknown')[:20]
            execution_time = test.get('execution_time', {})
            voice_time = test.get('voice_response_time', {})

            exec_status = "PASS" if execution_time.get('status') == 'pass' else "FAIL"
            voice_status = "PASS" if voice_time.get('status') == 'pass' else "FAIL"

            grid += f"│ {test_id:<20} │ Exec: {exec_status:<4} │ Voice: {voice_status:<4} │ Step: {test.get('current_step', 'N/A'):<10} │\n"

        grid += "└─────────────────────────────────────────────────────────────────┘"
        return grid

    def generate_voice_summary(self, active_tests: List[Dict], completed_tests: List[Dict]) -> str:
        """Generate natural voice summary"""
        total_active = len(active_tests)
        total_completed = len(completed_tests)

        # Count status types
        failed_tests = [t for t in completed_tests if t.get('status') == 'FAILED']
        passed_tests = [t for t in completed_tests if t.get('status') == 'PASSED']

        summary = f"System status update from {self.agent_name}. "

        if total_active > 0:
            summary += f"Currently monitoring {total_active} active test{'s' if total_active != 1 else ''}. "

            # Report on critical issues
            critical_issues = [t for t in active_tests if t.get('health_indicator') == '🔴']
            if critical_issues:
                summary += f"Alert: {len(critical_issues)} test{'s' if len(critical_issues) != 1 else ''} showing critical status. "
        else:
            summary += "No active tests running. System ready for new test execution. "

        if total_completed > 0:
            summary += f"Completed {total_completed} test{'s' if total_completed != 1 else ''} - "
            summary += f"{len(passed_tests)} passed, {len(failed_tests)} failed. "

        # Add specific alerts for failures
        if failed_tests:
            recent_failure = failed_tests[-1]
            summary += f"Most recent failure: {recent_failure.get('test_id', 'unknown test')} - manual review recommended. "

        return summary

    async def monitor_test_stream(self, websocket_url: str = "ws://localhost:8765/test-stream"):
        """Monitor incoming test data stream"""
        try:
            async with websockets.connect(websocket_url) as websocket:
                print(f"[MONITOR] Connected to test stream: {websocket_url}")

                async for message in websocket:
                    try:
                        test_data = json.loads(message)
                        await self.process_test_update(test_data)
                    except json.JSONDecodeError:
                        print(f"[ERROR] Invalid JSON received: {message}")

        except Exception as e:
            print(f"[ERROR] WebSocket connection failed: {e}")
            # Fallback to simulated data for demo
            await self.simulate_test_data()

    async def process_test_update(self, test_data: Dict):
        """Process incoming test update"""
        test_id = test_data.get('test_id')
        status = test_data.get('status')

        if status in ['RUNNING', 'PENDING']:
            self.active_tests[test_id] = test_data
        elif status in ['PASSED', 'FAILED', 'TIMEOUT', 'ERROR']:
            if test_id in self.active_tests:
                del self.active_tests[test_id]
            self.completed_tests.append(test_data)

            # Trigger voice callback for completion
            await self.trigger_voice_report(test_data, "completion")

        # Update display
        await self.refresh_display()

    async def trigger_voice_report(self, test_data: Dict, trigger_type: str):
        """Trigger voice system for important events"""
        voice_summary = ""

        if trigger_type == "completion":
            status = test_data.get('status')
            test_id = test_data.get('test_id')
            duration = test_data.get('duration', 0)

            if status == "FAILED":
                voice_summary = f"Alert: Test {test_id} failed after {duration:.1f} seconds. Critical review required."
            else:
                voice_summary = f"Test {test_id} completed successfully in {duration:.1f} seconds."

        elif trigger_type == "periodic":
            voice_summary = self.generate_voice_summary(
                list(self.active_tests.values()),
                self.completed_tests[-10:]  # Last 10 completed
            )

        # Send to voice callbacks
        for callback in self.voice_callbacks:
            try:
                await callback(voice_summary, test_data)
            except Exception as e:
                print(f"[ERROR] Voice callback failed: {e}")

    async def refresh_display(self):
        """Refresh the ASCII display"""
        # Clear screen
        sys.stdout.write('\033[2J\033[H')

        # Display header
        print(self.generate_dashboard_header())

        # Display active tests as strip reports
        if self.active_tests:
            print("\n" + "─" * 80)
            print("ACTIVE TESTS:")
            for test_data in self.active_tests.values():
                print(self.generate_strip_report_line(test_data))

        # Display recent completed tests
        if self.completed_tests:
            print("\n" + "─" * 80)
            print("RECENT COMPLETIONS:")
            for test_data in self.completed_tests[-5:]:  # Last 5
                print(self.generate_strip_report_line(test_data))

        # Display metrics
        print(self.generate_metrics_grid(list(self.active_tests.values())))

        # Footer with instructions
        print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Press Ctrl+C to exit | Voice reports: ENABLED | UI sync: ACTIVE")

    async def simulate_test_data(self):
        """Simulate test data for demonstration"""
        print("[MONITOR] Running in simulation mode...")

        # Sample test scenarios
        test_scenarios = [
            {
                "test_id": "docker_web_threat_simulation",
                "total_duration": 15,
                "steps": 5,
                "will_fail": False
            },
            {
                "test_id": "docker_l_star_validation",
                "total_duration": 30,
                "steps": 4,
                "will_fail": False
            },
            {
                "test_id": "docker_voice_integration_e2e",
                "total_duration": 8,
                "steps": 5,
                "will_fail": True
            }
        ]

        # Start tests with staggered timing
        for i, scenario in enumerate(test_scenarios):
            await asyncio.sleep(i * 3)  # Stagger starts
            asyncio.create_task(self.simulate_test_execution(scenario))

        # Keep running
        while self.running:
            await asyncio.sleep(1)

    async def simulate_test_execution(self, scenario: Dict):
        """Simulate individual test execution"""
        test_id = scenario["test_id"]
        total_duration = scenario["total_duration"]
        steps = scenario["steps"]
        will_fail = scenario["will_fail"]

        start_time = time.time()

        # Initial test data
        test_data = {
            "test_id": test_id,
            "status": "RUNNING",
            "progress_percentage": 0,
            "duration": 0,
            "health_indicator": "🟢",
            "current_step": "initializing",
            "execution_time": {"status": "pass"},
            "voice_response_time": {"status": "pass"}
        }

        # Run simulation
        for step in range(steps):
            current_time = time.time()
            elapsed = current_time - start_time
            progress = (step / steps) * 100

            # Check for failure condition
            if will_fail and step == steps - 2:
                test_data.update({
                    "status": "FAILED",
                    "progress_percentage": progress,
                    "duration": elapsed,
                    "health_indicator": "🔴",
                    "current_step": f"failed_at_step_{step+1}",
                    "voice_response_time": {"status": "fail"}
                })
                await self.process_test_update(test_data)
                return

            test_data.update({
                "progress_percentage": progress,
                "duration": elapsed,
                "current_step": f"step_{step+1}",
                "health_indicator": "🟡" if elapsed > total_duration * 0.8 else "🟢"
            })

            await self.process_test_update(test_data)
            await asyncio.sleep(total_duration / steps)

        # Complete test
        test_data.update({
            "status": "PASSED",
            "progress_percentage": 100,
            "duration": time.time() - start_time,
            "current_step": "completed",
            "health_indicator": "🟢"
        })

        await self.process_test_update(test_data)

    async def periodic_voice_updates(self):
        """Send periodic voice updates"""
        while self.running:
            await asyncio.sleep(30)  # Every 30 seconds
            if self.active_tests or self.completed_tests:
                await self.trigger_voice_report({}, "periodic")

    async def start_monitoring(self):
        """Start the real-time monitoring system"""
        print(f"[MONITOR] Starting real-time ASCII monitor - {self.agent_name}")
        print("[MONITOR] Voice system: ENABLED")
        print("[MONITOR] UI callbacks: REGISTERED")
        print("=" * 80)

        self.running = True

        # Start tasks
        monitor_task = asyncio.create_task(self.monitor_test_stream())
        voice_task = asyncio.create_task(self.periodic_voice_updates())

        try:
            await asyncio.gather(monitor_task, voice_task)
        except KeyboardInterrupt:
            print(f"\n[MONITOR] Shutting down gracefully...")
            self.running = False

# Voice integration callback example
async def voice_system_callback(voice_text: str, test_data: Dict):
    """Example voice system integration"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"\n[VOICE {timestamp}] Natasha Volkov: {voice_text}")

    # Here you would integrate with ElevenLabs API
    # await elevenlabs_speak(voice_text, voice="natasha_volkov")

# UI integration callback example
async def ui_system_callback(ui_data: Dict):
    """Example UI system integration"""
    print(f"[UI UPDATE] Sending to React/iOS: {json.dumps(ui_data, indent=2)}")

    # Here you would send WebSocket updates to React dashboard
    # await websocket_send_to_dashboard(ui_data)

    # And push notifications to iOS
    # await ios_push_notification(ui_data)

async def main():
    """Main execution function"""
    monitor = RealTimeAsciiMonitor()

    # Register integration callbacks
    monitor.register_voice_callback(voice_system_callback)
    monitor.register_ui_callback(ui_system_callback)

    # Start monitoring
    await monitor.start_monitoring()

if __name__ == "__main__":
    asyncio.run(main())