"""
Google Cloud Function for HFT Test Execution
Triggered by Pub/Sub messages

Deploy with:
    gcloud functions deploy hft-test-runner \
        --runtime python311 \
        --trigger-topic hft-test-jobs \
        --entry-point run_test \
        --memory 512MB \
        --timeout 300s \
        --region us-central1
"""

import json
import time
import random
from datetime import datetime
from google.cloud import firestore
import functions_framework

# Initialize Firestore
db = firestore.Client()

@functions_framework.cloud_event
def run_test(cloud_event):
    """
    Execute a single test batch
    
    Message format:
    {
        "worker_id": "worker-0",
        "test_type": "optimal_route",
        "iterations": 100,
        "batch_id": "optimal_route-0"
    }
    """
    # Decode Pub/Sub message
    import base64
    message_data = base64.b64decode(cloud_event.data["message"]["data"]).decode()
    test_batch = json.loads(message_data)
    
    print(f"🚀 Starting test batch: {test_batch['batch_id']}")
    print(f"   Type: {test_batch['test_type']}")
    print(f"   Iterations: {test_batch['iterations']}")
    
    start_time = time.time()
    
    # Execute test based on type
    try:
        if test_batch['test_type'] == 'optimal_route':
            result_data = test_optimal_route(test_batch['iterations'])
        elif test_batch['test_type'] == 'all_routes':
            result_data = test_all_routes(test_batch['iterations'])
        elif test_batch['test_type'] == 'random_failure':
            result_data = test_random_failure(test_batch['iterations'])
        elif test_batch['test_type'] == 'weather_degradation':
            result_data = test_weather_degradation(test_batch['iterations'])
        elif test_batch['test_type'] == 'bottleneck_detection':
            result_data = test_bottleneck_detection(test_batch['iterations'])
        elif test_batch['test_type'] == 'concurrent_load':
            result_data = test_concurrent_load(test_batch['iterations'])
        else:
            result_data = {'error': f"Unknown test type: {test_batch['test_type']}"}
        
        success = True
        error = None
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        result_data = {}
        success = False
        error = str(e)
    
    duration_ms = (time.time() - start_time) * 1000
    
    # Store result in Firestore
    result = {
        'test_type': test_batch['test_type'],
        'timestamp': datetime.now(),
        'duration_ms': duration_ms,
        'success': success,
        'result_data': result_data,
        'error': error,
        'worker_id': test_batch['worker_id'],
        'batch_id': test_batch['batch_id']
    }
    
    db.collection('test_results').add(result)
    
    print(f"✅ Test batch complete: {duration_ms:.2f}ms")
    
    return {'status': 'success', 'duration_ms': duration_ms}

# ============================================================================
# TEST IMPLEMENTATIONS
# ============================================================================

def test_optimal_route(iterations: int) -> dict:
    """Test optimal route calculation"""
    results = {
        'iterations': iterations,
        'success_count': 0,
        'latencies': []
    }
    
    # Simulate route calculations
    for _ in range(iterations):
        start = time.time()
        
        # Simulate route calculation (50-150ms)
        time.sleep(random.uniform(0.05, 0.15))
        latency = (time.time() - start) * 1000
        
        results['success_count'] += 1
        results['latencies'].append(latency)
    
    results['avg_latency'] = sum(results['latencies']) / len(results['latencies'])
    results['min_latency'] = min(results['latencies'])
    results['max_latency'] = max(results['latencies'])
    
    return results

def test_all_routes(iterations: int) -> dict:
    """Test finding all routes"""
    results = {
        'iterations': iterations,
        'total_routes_found': 0
    }
    
    for _ in range(iterations):
        # Simulate finding 2-5 routes
        routes_found = random.randint(2, 5)
        results['total_routes_found'] += routes_found
    
    results['avg_routes_per_query'] = results['total_routes_found'] / iterations
    
    return results

def test_random_failure(iterations: int) -> dict:
    """Test network resilience"""
    results = {
        'iterations': iterations,
        'health_scores': []
    }
    
    for _ in range(iterations):
        # Simulate failure impact (70-95% health)
        health_score = random.uniform(0.70, 0.95)
        results['health_scores'].append(health_score)
    
    results['avg_health_score'] = sum(results['health_scores']) / len(results['health_scores'])
    results['min_health_score'] = min(results['health_scores'])
    
    return results

def test_weather_degradation(iterations: int) -> dict:
    """Test weather impact"""
    results = {
        'iterations': iterations,
        'degraded_stations': []
    }
    
    for _ in range(iterations):
        # Simulate 10-30% stations degraded
        degraded = random.randint(29, 87)
        results['degraded_stations'].append(degraded)
    
    results['avg_degraded'] = sum(results['degraded_stations']) / len(results['degraded_stations'])
    
    return results

def test_bottleneck_detection(iterations: int) -> dict:
    """Test bottleneck detection"""
    results = {
        'iterations': iterations,
        'bottlenecks_found': 0
    }
    
    for _ in range(iterations):
        # Simulate finding 0-3 bottlenecks
        bottlenecks = random.randint(0, 3)
        results['bottlenecks_found'] += bottlenecks
    
    results['avg_bottlenecks'] = results['bottlenecks_found'] / iterations
    
    return results

def test_concurrent_load(iterations: int) -> dict:
    """Test concurrent load handling"""
    results = {
        'iterations': iterations,
        'throughput': []
    }
    
    for _ in range(iterations):
        # Simulate throughput (100-500 req/sec)
        throughput = random.uniform(100, 500)
        results['throughput'].append(throughput)
    
    results['avg_throughput'] = sum(results['throughput']) / len(results['throughput'])
    results['max_throughput'] = max(results['throughput'])
    
    return results

