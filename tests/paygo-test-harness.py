"""
HFT Slot Graph Pay-As-You-Go Test Harness
Google Cloud Platform + Anaconda

Architecture:
- Google Cloud Functions: Serverless test execution
- Cloud Run: Containerized test runners
- Firestore: Test results storage
- Pub/Sub: Test coordination
- BigQuery: Analytics on test results

Usage:
    # Run single test
    python paygo-test-harness.py --test route_optimization --iterations 10000
    
    # Run full suite
    python paygo-test-harness.py --suite full --parallel 100
    
    # Monte Carlo simulation
    python paygo-test-harness.py --monte-carlo --iterations 1000000 --parallel 1000
"""

import os
import sys
import json
import time
import asyncio
import argparse
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import numpy as np
import pandas as pd

# Google Cloud imports
try:
    from google.cloud import functions_v1
    from google.cloud import run_v2
    from google.cloud import firestore
    from google.cloud import pubsub_v1
    from google.cloud import bigquery
    from google.cloud import storage
    GOOGLE_CLOUD_AVAILABLE = True
except ImportError:
    print("⚠️  Google Cloud SDK not installed. Install with: pip install google-cloud-functions google-cloud-run google-cloud-firestore google-cloud-pubsub google-cloud-bigquery google-cloud-storage")
    GOOGLE_CLOUD_AVAILABLE = False

# Supabase for ACID operations
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    print("⚠️  Supabase not installed. Install with: pip install supabase")
    SUPABASE_AVAILABLE = False

# ============================================================================
# CONFIGURATION
# ============================================================================

@dataclass
class TestConfig:
    project_id: str = os.getenv('GCP_PROJECT_ID', 'ctas7-hft-testing')
    region: str = 'us-central1'
    function_name: str = 'hft-test-runner'
    cloud_run_service: str = 'hft-test-service'
    firestore_collection: str = 'test_results'
    pubsub_topic: str = 'hft-test-jobs'
    bigquery_dataset: str = 'hft_analytics'
    bigquery_table: str = 'test_results'
    bucket_name: str = 'ctas7-hft-test-data'
    
    # Supabase
    supabase_url: str = os.getenv('VITE_SUPABASE_URL', '')
    supabase_key: str = os.getenv('VITE_SUPABASE_ANON_KEY', '')
    
    # Test parameters
    max_parallel_workers: int = 1000
    timeout_seconds: int = 300
    retry_attempts: int = 3

@dataclass
class TestResult:
    test_id: str
    test_type: str
    timestamp: datetime
    duration_ms: float
    success: bool
    result_data: Dict[str, Any]
    error: Optional[str] = None
    worker_id: Optional[str] = None

# ============================================================================
# GOOGLE CLOUD TEST HARNESS
# ============================================================================

class PayGoTestHarness:
    def __init__(self, config: TestConfig):
        self.config = config
        
        if GOOGLE_CLOUD_AVAILABLE:
            self.firestore_client = firestore.Client(project=config.project_id)
            self.pubsub_publisher = pubsub_v1.PublisherClient()
            self.pubsub_subscriber = pubsub_v1.SubscriberClient()
            self.bigquery_client = bigquery.Client(project=config.project_id)
            self.storage_client = storage.Client(project=config.project_id)
            self.topic_path = self.pubsub_publisher.topic_path(config.project_id, config.pubsub_topic)
        
        if SUPABASE_AVAILABLE and config.supabase_url:
            self.supabase: Client = create_client(config.supabase_url, config.supabase_key)
    
    # ========================================================================
    # TEST EXECUTION
    # ========================================================================
    
    async def run_test_suite(
        self,
        suite_name: str,
        iterations: int,
        parallel_workers: int
    ) -> Dict[str, Any]:
        """
        Run a complete test suite with parallel workers
        """
        print(f"🚀 Starting test suite: {suite_name}")
        print(f"   Iterations: {iterations:,}")
        print(f"   Parallel workers: {parallel_workers}")
        print(f"   Estimated cost: ${self.estimate_cost(iterations, parallel_workers):.2f}\n")
        
        start_time = time.time()
        
        # Define test suite
        tests = self.get_test_suite(suite_name)
        
        # Distribute tests across workers
        test_batches = self.create_test_batches(tests, iterations, parallel_workers)
        
        # Execute tests in parallel on Google Cloud
        results = await self.execute_parallel_tests(test_batches)
        
        # Aggregate results
        summary = self.aggregate_results(results)
        summary['total_duration_seconds'] = time.time() - start_time
        summary['actual_cost'] = self.calculate_actual_cost(results)
        
        # Store results
        await self.store_results(suite_name, summary, results)
        
        # Print summary
        self.print_summary(summary)
        
        return summary
    
    def get_test_suite(self, suite_name: str) -> List[Dict[str, Any]]:
        """
        Define test suites
        """
        suites = {
            'route_optimization': [
                {'type': 'optimal_route', 'weight': 0.4},
                {'type': 'all_routes', 'weight': 0.3},
                {'type': 'constrained_route', 'weight': 0.3}
            ],
            'network_resilience': [
                {'type': 'random_failure', 'weight': 0.3},
                {'type': 'tier1_failure', 'weight': 0.3},
                {'type': 'cascading_failure', 'weight': 0.4}
            ],
            'weather_impact': [
                {'type': 'weather_degradation', 'weight': 0.5},
                {'type': 'weather_avoidance', 'weight': 0.5}
            ],
            'performance': [
                {'type': 'bottleneck_detection', 'weight': 0.3},
                {'type': 'query_performance', 'weight': 0.4},
                {'type': 'concurrent_load', 'weight': 0.3}
            ],
            'full': [
                {'type': 'optimal_route', 'weight': 0.2},
                {'type': 'all_routes', 'weight': 0.1},
                {'type': 'random_failure', 'weight': 0.2},
                {'type': 'weather_degradation', 'weight': 0.2},
                {'type': 'bottleneck_detection', 'weight': 0.1},
                {'type': 'concurrent_load', 'weight': 0.2}
            ]
        }
        
        return suites.get(suite_name, suites['full'])
    
    def create_test_batches(
        self,
        tests: List[Dict[str, Any]],
        iterations: int,
        workers: int
    ) -> List[Dict[str, Any]]:
        """
        Distribute tests across workers
        """
        batches = []
        iterations_per_worker = iterations // workers
        
        for worker_id in range(workers):
            for test in tests:
                test_iterations = int(iterations_per_worker * test['weight'])
                if test_iterations > 0:
                    batches.append({
                        'worker_id': f'worker-{worker_id}',
                        'test_type': test['type'],
                        'iterations': test_iterations,
                        'batch_id': f"{test['type']}-{worker_id}"
                    })
        
        return batches
    
    async def execute_parallel_tests(
        self,
        test_batches: List[Dict[str, Any]]
    ) -> List[TestResult]:
        """
        Execute tests in parallel using Google Cloud Functions/Run
        """
        print(f"📤 Dispatching {len(test_batches)} test batches...\n")
        
        # Publish test jobs to Pub/Sub
        futures = []
        for batch in test_batches:
            message_data = json.dumps(batch).encode('utf-8')
            future = self.pubsub_publisher.publish(self.topic_path, message_data)
            futures.append(future)
        
        # Wait for all messages to be published
        for future in futures:
            future.result()
        
        print(f"✅ All test batches dispatched\n")
        
        # Wait for results (poll Firestore)
        results = await self.collect_results(len(test_batches))
        
        return results
    
    async def collect_results(
        self,
        expected_count: int,
        poll_interval: int = 5
    ) -> List[TestResult]:
        """
        Collect test results from Firestore
        """
        results = []
        start_time = time.time()
        
        print(f"⏳ Waiting for {expected_count} test results...")
        
        while len(results) < expected_count:
            # Query Firestore for new results
            docs = self.firestore_client.collection(self.config.firestore_collection)\
                .where('timestamp', '>', datetime.fromtimestamp(start_time))\
                .stream()
            
            for doc in docs:
                data = doc.to_dict()
                result = TestResult(
                    test_id=doc.id,
                    test_type=data['test_type'],
                    timestamp=data['timestamp'],
                    duration_ms=data['duration_ms'],
                    success=data['success'],
                    result_data=data['result_data'],
                    error=data.get('error'),
                    worker_id=data.get('worker_id')
                )
                results.append(result)
            
            # Progress update
            progress = len(results) / expected_count * 100
            print(f"   Progress: {len(results)}/{expected_count} ({progress:.1f}%)", end='\r')
            
            if len(results) < expected_count:
                await asyncio.sleep(poll_interval)
            
            # Timeout check
            if time.time() - start_time > self.config.timeout_seconds:
                print(f"\n⚠️  Timeout reached. Collected {len(results)}/{expected_count} results")
                break
        
        print(f"\n✅ Collected {len(results)} results\n")
        return results
    
    # ========================================================================
    # SPECIFIC TEST IMPLEMENTATIONS
    # ========================================================================
    
    def test_optimal_route(self, iterations: int) -> Dict[str, Any]:
        """
        Test optimal route calculation
        """
        results = {
            'success_count': 0,
            'total_latency': 0,
            'latencies': []
        }
        
        # Get random station pairs
        stations = self.get_station_list()
        
        for _ in range(iterations):
            source = np.random.choice(stations)
            dest = np.random.choice(stations)
            
            if source == dest:
                continue
            
            start = time.time()
            # This would call the actual route calculation
            # route = slotGraphQueryEngine.findOptimalRoute(source, dest, {})
            duration = (time.time() - start) * 1000
            
            results['success_count'] += 1
            results['total_latency'] += duration
            results['latencies'].append(duration)
        
        results['avg_latency'] = results['total_latency'] / results['success_count']
        results['p50_latency'] = np.percentile(results['latencies'], 50)
        results['p95_latency'] = np.percentile(results['latencies'], 95)
        results['p99_latency'] = np.percentile(results['latencies'], 99)
        
        return results
    
    def test_random_failure(self, iterations: int) -> Dict[str, Any]:
        """
        Test network resilience with random failures
        """
        results = {
            'failure_scenarios': [],
            'avg_health_score': 0
        }
        
        for _ in range(iterations):
            # Simulate 10% random failure
            failed_count = int(289 * 0.1)
            # impact = slotGraphQueryEngine.simulateFailure(random_stations)
            
            results['failure_scenarios'].append({
                'failed_count': failed_count,
                'health_score': 0.85  # Placeholder
            })
        
        results['avg_health_score'] = np.mean([s['health_score'] for s in results['failure_scenarios']])
        
        return results
    
    # ========================================================================
    # RESULTS PROCESSING
    # ========================================================================
    
    def aggregate_results(self, results: List[TestResult]) -> Dict[str, Any]:
        """
        Aggregate test results
        """
        summary = {
            'total_tests': len(results),
            'successful_tests': sum(1 for r in results if r.success),
            'failed_tests': sum(1 for r in results if not r.success),
            'success_rate': 0,
            'avg_duration_ms': 0,
            'by_test_type': {}
        }
        
        if len(results) > 0:
            summary['success_rate'] = summary['successful_tests'] / len(results)
            summary['avg_duration_ms'] = np.mean([r.duration_ms for r in results])
        
        # Group by test type
        by_type = {}
        for result in results:
            if result.test_type not in by_type:
                by_type[result.test_type] = []
            by_type[result.test_type].append(result)
        
        for test_type, type_results in by_type.items():
            summary['by_test_type'][test_type] = {
                'count': len(type_results),
                'success_rate': sum(1 for r in type_results if r.success) / len(type_results),
                'avg_duration_ms': np.mean([r.duration_ms for r in type_results])
            }
        
        return summary
    
    async def store_results(
        self,
        suite_name: str,
        summary: Dict[str, Any],
        results: List[TestResult]
    ):
        """
        Store results in Firestore and BigQuery
        """
        print("💾 Storing results...")
        
        # Store summary in Firestore
        doc_ref = self.firestore_client.collection('test_suites').document()
        doc_ref.set({
            'suite_name': suite_name,
            'timestamp': datetime.now(),
            'summary': summary
        })
        
        # Store detailed results in BigQuery
        rows = []
        for result in results:
            rows.append({
                'test_id': result.test_id,
                'test_type': result.test_type,
                'timestamp': result.timestamp.isoformat(),
                'duration_ms': result.duration_ms,
                'success': result.success,
                'result_data': json.dumps(result.result_data),
                'error': result.error,
                'worker_id': result.worker_id
            })
        
        if rows:
            table_id = f"{self.config.project_id}.{self.config.bigquery_dataset}.{self.config.bigquery_table}"
            errors = self.bigquery_client.insert_rows_json(table_id, rows)
            
            if errors:
                print(f"⚠️  BigQuery insert errors: {errors}")
            else:
                print(f"✅ Stored {len(rows)} results in BigQuery")
    
    def print_summary(self, summary: Dict[str, Any]):
        """
        Print test summary
        """
        print("\n" + "="*80)
        print("📊 TEST SUMMARY")
        print("="*80)
        print(f"Total Tests:     {summary['total_tests']:,}")
        print(f"Successful:      {summary['successful_tests']:,} ({summary['success_rate']*100:.1f}%)")
        print(f"Failed:          {summary['failed_tests']:,}")
        print(f"Avg Duration:    {summary['avg_duration_ms']:.2f}ms")
        print(f"Total Duration:  {summary['total_duration_seconds']:.2f}s")
        print(f"Actual Cost:     ${summary['actual_cost']:.2f}")
        print("\nBy Test Type:")
        for test_type, stats in summary['by_test_type'].items():
            print(f"  {test_type:20s}: {stats['count']:6,} tests, {stats['success_rate']*100:5.1f}% success, {stats['avg_duration_ms']:7.2f}ms avg")
        print("="*80 + "\n")
    
    # ========================================================================
    # COST ESTIMATION
    # ========================================================================
    
    def estimate_cost(self, iterations: int, workers: int) -> float:
        """
        Estimate Google Cloud costs
        
        Pricing (as of 2024):
        - Cloud Functions: $0.40 per million invocations + $0.0000025 per GB-second
        - Cloud Run: $0.00002400 per vCPU-second + $0.00000250 per GiB-second
        - Firestore: $0.18 per 100K writes, $0.06 per 100K reads
        - Pub/Sub: $0.40 per million messages
        - BigQuery: $5 per TB processed
        """
        # Cloud Functions invocations
        function_cost = (iterations / 1_000_000) * 0.40
        
        # Compute time (assume 100ms per test)
        compute_seconds = (iterations * 0.1) / workers  # Parallel execution
        compute_cost = compute_seconds * 0.0000025 * 0.5  # 512MB memory
        
        # Firestore writes
        firestore_cost = (iterations / 100_000) * 0.18
        
        # Pub/Sub messages
        pubsub_cost = (workers / 1_000_000) * 0.40
        
        # BigQuery storage (negligible for test data)
        bigquery_cost = 0.01
        
        total = function_cost + compute_cost + firestore_cost + pubsub_cost + bigquery_cost
        
        return total
    
    def calculate_actual_cost(self, results: List[TestResult]) -> float:
        """
        Calculate actual cost based on usage
        """
        # This would integrate with Google Cloud Billing API
        # For now, return estimate
        return self.estimate_cost(len(results), len(set(r.worker_id for r in results)))
    
    # ========================================================================
    # UTILITY METHODS
    # ========================================================================
    
    def get_station_list(self) -> List[str]:
        """
        Get list of all ground station IDs
        """
        if hasattr(self, 'supabase'):
            response = self.supabase.table('ground_nodes').select('id').execute()
            return [row['id'] for row in response.data]
        else:
            # Return mock data
            return [f'gs-{i:03d}' for i in range(289)]
    
    async def cleanup_old_results(self, days: int = 7):
        """
        Clean up old test results to save storage costs
        """
        cutoff = datetime.now().timestamp() - (days * 24 * 60 * 60)
        
        # Delete from Firestore
        docs = self.firestore_client.collection(self.config.firestore_collection)\
            .where('timestamp', '<', datetime.fromtimestamp(cutoff))\
            .stream()
        
        deleted = 0
        for doc in docs:
            doc.reference.delete()
            deleted += 1
        
        print(f"🗑️  Deleted {deleted} old test results")

# ============================================================================
# CLI INTERFACE
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description='HFT Slot Graph Pay-As-You-Go Test Harness')
    
    parser.add_argument('--suite', type=str, default='full',
                       choices=['route_optimization', 'network_resilience', 'weather_impact', 'performance', 'full'],
                       help='Test suite to run')
    
    parser.add_argument('--iterations', type=int, default=10000,
                       help='Number of test iterations')
    
    parser.add_argument('--parallel', type=int, default=100,
                       help='Number of parallel workers')
    
    parser.add_argument('--monte-carlo', action='store_true',
                       help='Run Monte Carlo simulation')
    
    parser.add_argument('--estimate-only', action='store_true',
                       help='Only estimate cost, do not run tests')
    
    parser.add_argument('--cleanup', type=int, metavar='DAYS',
                       help='Clean up test results older than N days')
    
    args = parser.parse_args()
    
    # Initialize harness
    config = TestConfig()
    harness = PayGoTestHarness(config)
    
    # Handle cleanup
    if args.cleanup:
        asyncio.run(harness.cleanup_old_results(args.cleanup))
        return
    
    # Estimate cost
    estimated_cost = harness.estimate_cost(args.iterations, args.parallel)
    print(f"\n💰 Estimated cost: ${estimated_cost:.2f}")
    
    if args.estimate_only:
        return
    
    # Confirm before running
    response = input("\nProceed with test execution? (y/n): ")
    if response.lower() != 'y':
        print("Test execution cancelled")
        return
    
    # Run tests
    summary = asyncio.run(harness.run_test_suite(
        args.suite,
        args.iterations,
        args.parallel
    ))
    
    print(f"\n✅ Test suite complete!")
    print(f"   Results stored in Firestore and BigQuery")
    print(f"   View in Google Cloud Console: https://console.cloud.google.com/firestore")

if __name__ == '__main__':
    main()

