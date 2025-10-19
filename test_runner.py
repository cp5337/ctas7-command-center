#!/usr/bin/env python3
"""
CTAS-7 Test Runner
Comprehensive testing framework for ASCII output and voice reporting system
"""

import asyncio
import sys
import os
import json
import subprocess
import time
from datetime import datetime
from typing import Dict, List, Optional
import threading

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ascii_test_output_agent import AsciiTestOutputAgent
from voice_test_reporter import VoiceTestReporter
from real_time_ascii_monitor import RealTimeAsciiMonitor

class TestRunner:
    def __init__(self):
        self.test_results = []
        self.failed_tests = []
        self.passed_tests = []

    def log_test_result(self, test_name: str, status: str, details: str = ""):
        """Log test result"""
        result = {
            "test_name": test_name,
            "status": status,
            "timestamp": datetime.now().isoformat(),
            "details": details
        }
        self.test_results.append(result)

        if status == "PASS":
            self.passed_tests.append(result)
        else:
            self.failed_tests.append(result)

    def print_test_header(self, test_name: str):
        """Print formatted test header"""
        print(f"\n{'='*80}")
        print(f"🧪 TESTING: {test_name}")
        print(f"{'='*80}")

    def print_test_result(self, test_name: str, status: str, details: str = ""):
        """Print formatted test result"""
        icon = "✅" if status == "PASS" else "❌"
        print(f"{icon} {test_name}: {status}")
        if details:
            print(f"   Details: {details}")

    # Test 1: ASCII Agent Basic Functionality
    def test_ascii_agent_basic(self):
        """Test basic ASCII agent functionality"""
        self.print_test_header("ASCII Agent Basic Functionality")

        try:
            agent = AsciiTestOutputAgent()

            # Test header generation
            header = agent.generate_ascii_header("test_example")
            assert "CTAS-7 TEST EXECUTION" in header
            assert agent.agent_name in header

            # Test progress bar
            progress = agent.generate_progress_bar(50, 100, 20)
            assert "[" in progress and "]" in progress
            assert "50.00%" in progress

            # Test metrics display
            test_metrics = {
                "execution_time": {"current": "5.2s", "target": "10s", "passing": True},
                "voice_response": {"current": "2.1s", "target": "3s", "passing": True}
            }
            metrics = agent.generate_metrics_display(test_metrics)
            assert "REAL-TIME METRICS" in metrics

            # Test strip report
            test_results = {
                "test_id": "demo_test",
                "status": "PASSED",
                "duration": 5.5,
                "passed_steps": 3,
                "total_steps": 3
            }
            strip = agent.generate_strip_report(test_results)
            assert "demo_test" in strip
            assert "✓" in strip

            # Test voice summary
            voice_summary = agent.generate_voice_summary(test_results)
            assert "Elena Rodriguez" in voice_summary
            assert "PASSED" in voice_summary

            self.log_test_result("ASCII Agent Basic", "PASS", "All basic functions working")
            self.print_test_result("ASCII Agent Basic", "PASS", "All basic functions working")

        except Exception as e:
            self.log_test_result("ASCII Agent Basic", "FAIL", str(e))
            self.print_test_result("ASCII Agent Basic", "FAIL", str(e))

    # Test 2: Voice Reporter Basic Functionality
    def test_voice_reporter_basic(self):
        """Test basic voice reporter functionality"""
        self.print_test_header("Voice Reporter Basic Functionality")

        try:
            reporter = VoiceTestReporter()

            # Test different report types
            test_data = {
                "test_id": "docker_web_threat_simulation",
                "status": "RUNNING",
                "progress_percentage": 75,
                "current_step": "voice_trigger_sqlmap"
            }

            # Test start report
            start_text = reporter.generate_natural_voice_text(test_data, "test_start")
            assert "Natasha Volkov" in start_text
            assert "starting" in start_text.lower()

            # Test progress report
            progress_text = reporter.generate_natural_voice_text(test_data, "test_progress")
            assert "75" in progress_text or "seventy" in progress_text.lower()

            # Test completion report
            test_data["status"] = "PASSED"
            test_data["duration"] = 15.3
            completion_text = reporter.generate_natural_voice_text(test_data, "test_completion")
            assert "completed successfully" in completion_text.lower()

            # Test critical alert
            test_data["critical_issue"] = "voice recognition failure"
            alert_text = reporter.generate_natural_voice_text(test_data, "critical_alert")
            assert "critical alert" in alert_text.lower()

            self.log_test_result("Voice Reporter Basic", "PASS", "All voice generation functions working")
            self.print_test_result("Voice Reporter Basic", "PASS", "All voice generation functions working")

        except Exception as e:
            self.log_test_result("Voice Reporter Basic", "FAIL", str(e))
            self.print_test_result("Voice Reporter Basic", "FAIL", str(e))

    # Test 3: Real-time Monitor Basic Setup
    def test_realtime_monitor_basic(self):
        """Test real-time monitor basic setup"""
        self.print_test_header("Real-time Monitor Basic Setup")

        try:
            monitor = RealTimeAsciiMonitor()

            # Test dashboard header
            header = monitor.generate_dashboard_header()
            assert "CTAS-7 REAL-TIME TEST MONITOR" in header
            assert monitor.agent_name in header

            # Test strip report line generation
            test_data = {
                "test_id": "test_example",
                "status": "RUNNING",
                "duration": 12.5,
                "progress_percentage": 60,
                "health_indicator": "🟢"
            }
            strip_line = monitor.generate_strip_report_line(test_data)
            assert "●" in strip_line  # Running status
            assert "60%" in strip_line
            assert "🟢" in strip_line

            # Test metrics grid with empty tests
            metrics = monitor.generate_metrics_grid([])
            assert "No active tests" in metrics

            # Test voice summary generation
            voice_summary = monitor.generate_voice_summary([], [])
            assert "Natasha Volkov" in voice_summary or "Elena Rodriguez" in voice_summary

            self.log_test_result("Real-time Monitor Basic", "PASS", "Basic setup functions working")
            self.print_test_result("Real-time Monitor Basic", "PASS", "Basic setup functions working")

        except Exception as e:
            self.log_test_result("Real-time Monitor Basic", "FAIL", str(e))
            self.print_test_result("Real-time Monitor Basic", "FAIL", str(e))

    # Test 4: JSON Format Validation
    def test_json_format_validation(self):
        """Test JSON format specifications"""
        self.print_test_header("JSON Format Validation")

        try:
            # Test strip report format
            with open('strip_report_format.json', 'r') as f:
                strip_format = json.load(f)

            assert strip_format["strip_report_specification"] == "v1.0"
            assert "output_formats" in strip_format
            assert "ascii_terminal" in strip_format["output_formats"]
            assert "ios_ui_json" in strip_format["output_formats"]
            assert "react_dashboard" in strip_format["output_formats"]
            assert "voice_report" in strip_format["output_formats"]

            # Validate sample reports
            samples = strip_format["sample_strip_reports"]
            assert len(samples) >= 3

            for sample in samples:
                assert "ascii_format" in sample
                assert "ios_json" in sample
                assert "voice_report" in sample

            self.log_test_result("JSON Format Validation", "PASS", "All format specifications valid")
            self.print_test_result("JSON Format Validation", "PASS", "All format specifications valid")

        except Exception as e:
            self.log_test_result("JSON Format Validation", "FAIL", str(e))
            self.print_test_result("JSON Format Validation", "FAIL", str(e))

    # Test 5: Integration Test with Mock Data
    async def test_integration_mock_data(self):
        """Test integration with mock test data"""
        self.print_test_header("Integration Test with Mock Data")

        try:
            # Create agents
            ascii_agent = AsciiTestOutputAgent()
            voice_reporter = VoiceTestReporter()

            # Mock test scenario
            test_scenario = {
                "test_id": "integration_test_scenario",
                "test_sequence": [
                    {"step": 1, "action": "initialize_test", "timeout": "2s"},
                    {"step": 2, "action": "run_validation", "timeout": "3s"},
                    {"step": 3, "action": "generate_report", "timeout": "1s"}
                ]
            }

            # Test ASCII agent processing
            results = ascii_agent.real_time_monitor(test_scenario)
            assert results["test_id"] == "integration_test_scenario"
            assert results["status"] == "PASSED"

            # Test voice report creation
            voice_report = await voice_reporter.create_voice_report(results, "test_completion", "medium")
            assert voice_report.agent_name == "Natasha Volkov"
            assert "integration test scenario" in voice_report.voice_text.lower()

            # Test Supabase payload generation
            supabase_payload = ascii_agent.log_to_supabase(results)
            assert "test_execution_id" in supabase_payload
            assert "blockchain_hash" in supabase_payload

            self.log_test_result("Integration Mock Data", "PASS", "All components integrated successfully")
            self.print_test_result("Integration Mock Data", "PASS", "All components integrated successfully")

        except Exception as e:
            self.log_test_result("Integration Mock Data", "FAIL", str(e))
            self.print_test_result("Integration Mock Data", "FAIL", str(e))

    # Test 6: Error Handling
    def test_error_handling(self):
        """Test error handling in various scenarios"""
        self.print_test_header("Error Handling")

        try:
            ascii_agent = AsciiTestOutputAgent()
            voice_reporter = VoiceTestReporter()

            # Test with invalid data
            invalid_test_data = {}

            # ASCII agent should handle missing data gracefully
            header = ascii_agent.generate_ascii_header("")
            assert "CTAS-7 TEST EXECUTION" in header

            strip = ascii_agent.generate_strip_report(invalid_test_data)
            assert "Unknown" in strip or "unknown" in strip

            # Voice reporter should handle missing data gracefully
            voice_text = voice_reporter.generate_natural_voice_text(invalid_test_data, "test_start")
            assert "unknown test" in voice_text.lower()

            # Test with malformed progress data
            progress = ascii_agent.generate_progress_bar(-1, 0, 10)
            assert "[" in progress and "]" in progress

            self.log_test_result("Error Handling", "PASS", "All error scenarios handled gracefully")
            self.print_test_result("Error Handling", "PASS", "All error scenarios handled gracefully")

        except Exception as e:
            self.log_test_result("Error Handling", "FAIL", str(e))
            self.print_test_result("Error Handling", "FAIL", str(e))

    def print_summary(self):
        """Print comprehensive test summary"""
        print(f"\n{'='*80}")
        print("🎯 TEST EXECUTION SUMMARY")
        print(f"{'='*80}")

        total_tests = len(self.test_results)
        passed_count = len(self.passed_tests)
        failed_count = len(self.failed_tests)

        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_count}")
        print(f"❌ Failed: {failed_count}")
        print(f"Success Rate: {(passed_count/total_tests)*100:.1f}%")

        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"   • {test['test_name']}: {test['details']}")

        if passed_count == total_tests:
            print(f"\n🎉 ALL TESTS PASSED! System ready for deployment.")
        else:
            print(f"\n⚠️  Some tests failed. Review before deployment.")

    async def run_all_tests(self):
        """Run all test scenarios"""
        print("🚀 Starting CTAS-7 Test Output System Validation")
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        # Run synchronous tests
        self.test_ascii_agent_basic()
        self.test_voice_reporter_basic()
        self.test_realtime_monitor_basic()
        self.test_json_format_validation()
        self.test_error_handling()

        # Run async tests
        await self.test_integration_mock_data()

        # Print summary
        self.print_summary()

def main():
    """Main test execution"""
    runner = TestRunner()
    asyncio.run(runner.run_all_tests())

if __name__ == "__main__":
    main()