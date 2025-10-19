/**
 * HFT Slot Graph Test Suite
 * Comprehensive testing for ground station network using graph database
 */

import { test, expect, describe, beforeAll, afterAll } from '@playwright/test';
import { slotGraphQueryEngine } from '../src/services/SlotGraphQueryEngine';
import { RouteConstraints } from '../src/services/LegionSlotGraphSchema';

describe('HFT Slot Graph - Route Optimization', () => {
  
  test('should find optimal route: Dubai to Johannesburg', async () => {
    const route = await slotGraphQueryEngine.findOptimalRoute(
      'gs-dubai-001',
      'gs-johannesburg-001',
      {
        requireQKD: true,
        maxLatency: 100
      }
    );

    expect(route).not.toBeNull();
    expect(route!.totalLatency).toBeLessThan(100);
    expect(route!.qkdCapable).toBe(true);
    expect(route!.hops.length).toBeGreaterThan(0);
    
    console.log(`✅ Route found: ${route!.hops.length} hops, ${route!.totalLatency}ms latency`);
  });

  test('should find multiple routes between stations', async () => {
    const routes = await slotGraphQueryEngine.findAllRoutes(
      'gs-dubai-001',
      'gs-johannesburg-001',
      5 // max 5 hops
    );

    expect(routes.length).toBeGreaterThan(0);
    expect(routes.length).toBeLessThanOrEqual(10); // Should find multiple paths
    
    // Routes should be sorted by latency
    for (let i = 1; i < routes.length; i++) {
      expect(routes[i].totalLatency).toBeGreaterThanOrEqual(routes[i-1].totalLatency);
    }

    console.log(`✅ Found ${routes.length} alternative routes`);
  });

  test('should respect bandwidth constraints', async () => {
    const route = await slotGraphQueryEngine.findOptimalRoute(
      'gs-dubai-001',
      'gs-hawaii-001',
      {
        minBandwidth: 50, // Require at least 50 Gbps
        maxLatency: 200
      }
    );

    expect(route).not.toBeNull();
    expect(route!.bandwidth).toBeGreaterThanOrEqual(50);
    
    console.log(`✅ Route bandwidth: ${route!.bandwidth} Gbps`);
  });

  test('should respect reliability constraints', async () => {
    const route = await slotGraphQueryEngine.findOptimalRoute(
      'gs-nsa-fortmeade-001',
      'gs-centcom-tampa-001',
      {
        minReliability: 0.999, // 99.9% uptime required
        requireQKD: true
      }
    );

    expect(route).not.toBeNull();
    expect(route!.reliability).toBeGreaterThanOrEqual(0.999);
    
    console.log(`✅ Route reliability: ${(route!.reliability * 100).toFixed(3)}%`);
  });

  test('should avoid specified nodes', async () => {
    const avoidNodes = ['gs-hawaii-001', 'gs-guam-001'];
    
    const route = await slotGraphQueryEngine.findOptimalRoute(
      'gs-dubai-001',
      'gs-chinalake-001',
      {
        avoidNodes,
        maxHops: 10
      }
    );

    expect(route).not.toBeNull();
    
    // Verify avoided nodes are not in route
    const routeNodeIds = route!.hops.map(h => h.nodeId);
    for (const avoidNode of avoidNodes) {
      expect(routeNodeIds).not.toContain(avoidNode);
    }
    
    console.log(`✅ Route avoids ${avoidNodes.length} specified nodes`);
  });
});

describe('HFT Slot Graph - Network Resilience', () => {
  
  test('should handle 10% station failure', async () => {
    // Simulate random 10% failure (29 out of 289 stations)
    const failedStations = await selectRandomStations(29);
    
    const impact = await slotGraphQueryEngine.simulateFailure(failedStations);

    expect(impact.failedNodes.length).toBe(29);
    expect(impact.networkHealthScore).toBeGreaterThan(0.7); // Should maintain >70% health
    expect(impact.alternateRoutesAvailable).toBeGreaterThan(0.85); // >85% routes have alternatives
    
    console.log(`✅ Network health after 10% failure: ${(impact.networkHealthScore * 100).toFixed(1)}%`);
    console.log(`   Alternate routes: ${(impact.alternateRoutesAvailable * 100).toFixed(1)}%`);
  });

  test('should handle tier-1 hub failure', async () => {
    // Fail all tier-1 stations (critical hubs)
    const tier1Stations = await getTier1Stations();
    
    const impact = await slotGraphQueryEngine.simulateFailure(tier1Stations);

    expect(impact.networkHealthScore).toBeGreaterThan(0.5); // Should still function
    expect(impact.routesAffected).toBeLessThan(impact.totalRoutes * 0.6); // <60% affected
    
    console.log(`✅ Network survives tier-1 hub failure`);
    console.log(`   Routes affected: ${impact.routesAffected}/${impact.totalRoutes}`);
  });

  test('should identify critical paths', async () => {
    const failedStations = await selectRandomStations(50); // 17% failure
    
    const impact = await slotGraphQueryEngine.simulateFailure(failedStations);

    expect(impact.criticalPaths).toBeDefined();
    
    if (impact.criticalPaths.length > 0) {
      console.log(`⚠️  Found ${impact.criticalPaths.length} critical paths (single point of failure)`);
      console.log(`   Example: ${impact.criticalPaths[0].join(' -> ')}`);
    } else {
      console.log(`✅ No critical paths - network is fully redundant`);
    }
  });

  test('should maintain connectivity during cascading failures', async () => {
    // Simulate cascading failure: fail 5%, then 10%, then 15%
    const failures = [
      await selectRandomStations(14),  // 5%
      await selectRandomStations(29),  // 10%
      await selectRandomStations(43)   // 15%
    ];

    const impacts = [];
    for (const failedNodes of failures) {
      const impact = await slotGraphQueryEngine.simulateFailure(failedNodes);
      impacts.push(impact);
    }

    // Network should degrade gracefully
    expect(impacts[0].networkHealthScore).toBeGreaterThan(0.9);
    expect(impacts[1].networkHealthScore).toBeGreaterThan(0.8);
    expect(impacts[2].networkHealthScore).toBeGreaterThan(0.7);
    
    console.log(`✅ Graceful degradation:`);
    console.log(`   5% failure:  ${(impacts[0].networkHealthScore * 100).toFixed(1)}% health`);
    console.log(`   10% failure: ${(impacts[1].networkHealthScore * 100).toFixed(1)}% health`);
    console.log(`   15% failure: ${(impacts[2].networkHealthScore * 100).toFixed(1)}% health`);
  });
});

describe('HFT Slot Graph - Weather Impact', () => {
  
  test('should route around weather-degraded stations', async () => {
    // Simulate heavy cloud cover at Pacific stations
    const degradedStations = ['gs-hawaii-001', 'gs-guam-001'];
    
    // Update weather conditions (this would be done via API in real scenario)
    // For now, we'll just verify routing avoids them
    
    const route = await slotGraphQueryEngine.findOptimalRoute(
      'gs-dubai-001',
      'gs-chinalake-001',
      {
        avoidNodes: degradedStations, // Simulating weather avoidance
        maxLatency: 150
      }
    );

    expect(route).not.toBeNull();
    
    const routeNodeIds = route!.hops.map(h => h.nodeId);
    for (const degraded of degradedStations) {
      expect(routeNodeIds).not.toContain(degraded);
    }
    
    console.log(`✅ Route avoids ${degradedStations.length} weather-degraded stations`);
  });

  test('should calculate weather impact on network capacity', async () => {
    // Simulate 50% cloud cover affecting 30% of stations
    const affectedStations = await selectRandomStations(87); // 30% of 289
    
    const impact = await slotGraphQueryEngine.simulateFailure(affectedStations);
    
    // With 30% degraded, network should still be operational
    expect(impact.networkHealthScore).toBeGreaterThan(0.6);
    expect(impact.alternateRoutesAvailable).toBeGreaterThan(0.7);
    
    console.log(`✅ Weather impact: ${(impact.networkHealthScore * 100).toFixed(1)}% capacity`);
  });
});

describe('HFT Slot Graph - Performance & Bottlenecks', () => {
  
  test('should identify network bottlenecks', async () => {
    const bottlenecks = await slotGraphQueryEngine.findBottlenecks(0.8); // >80% utilization

    expect(bottlenecks).toBeDefined();
    expect(Array.isArray(bottlenecks)).toBe(true);
    
    if (bottlenecks.length > 0) {
      console.log(`⚠️  Found ${bottlenecks.length} bottlenecks (>80% utilization)`);
      console.log(`   Example: ${bottlenecks[0].id}`);
    } else {
      console.log(`✅ No bottlenecks detected - network is well-balanced`);
    }
  });

  test('should query network topology efficiently', async () => {
    const startTime = Date.now();
    
    const result = await slotGraphQueryEngine.queryHFTNetwork({
      nodes: ['GroundStationNode'],
      filters: {
        'properties.tier': 1
      },
      limit: 100
    });

    const queryTime = Date.now() - startTime;
    
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(queryTime).toBeLessThan(1000); // Should complete in <1 second
    
    console.log(`✅ Query completed in ${queryTime}ms`);
    console.log(`   Found ${result.nodes.length} tier-1 stations`);
  });

  test('should analyze traffic patterns', async () => {
    const patterns = await slotGraphQueryEngine.analyzeTrafficPatterns({
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      end: new Date()
    });

    expect(patterns).toBeDefined();
    expect(Array.isArray(patterns)).toBe(true);
    
    console.log(`✅ Found ${patterns.length} traffic patterns`);
    
    if (patterns.length > 0) {
      console.log(`   Top pattern: ${patterns[0].description}`);
      console.log(`   Confidence: ${(patterns[0].confidence * 100).toFixed(1)}%`);
    }
  });
});

describe('HFT Slot Graph - Trade Routing Scenarios', () => {
  
  test('should route high-priority trade with minimum latency', async () => {
    const route = await slotGraphQueryEngine.findOptimalRoute(
      'gs-nsa-fortmeade-001',
      'gs-dubai-001',
      {
        maxLatency: 50, // Ultra-low latency requirement
        requireQKD: true,
        minReliability: 0.9999
      }
    );

    expect(route).not.toBeNull();
    expect(route!.totalLatency).toBeLessThan(50);
    expect(route!.qkdCapable).toBe(true);
    
    console.log(`✅ High-priority route: ${route!.totalLatency}ms latency`);
  });

  test('should load-balance across multiple routes', async () => {
    const routes = await slotGraphQueryEngine.findAllRoutes(
      'gs-dubai-001',
      'gs-johannesburg-001',
      3 // Max 3 hops for load balancing
    );

    expect(routes.length).toBeGreaterThanOrEqual(2); // Need at least 2 routes for load balancing
    
    // Verify routes are diverse (don't share too many nodes)
    const route1Nodes = new Set(routes[0].hops.map(h => h.nodeId));
    const route2Nodes = new Set(routes[1].hops.map(h => h.nodeId));
    
    const sharedNodes = [...route1Nodes].filter(n => route2Nodes.has(n));
    const diversityScore = 1 - (sharedNodes.length / Math.max(route1Nodes.size, route2Nodes.size));
    
    expect(diversityScore).toBeGreaterThan(0.3); // At least 30% different
    
    console.log(`✅ Found ${routes.length} diverse routes for load balancing`);
    console.log(`   Route diversity: ${(diversityScore * 100).toFixed(1)}%`);
  });

  test('should calculate cost-optimized route', async () => {
    const routes = await slotGraphQueryEngine.findAllRoutes(
      'gs-fortaleza-001',
      'gs-aswan-001',
      5
    );

    expect(routes.length).toBeGreaterThan(0);
    
    // Sort by cost
    routes.sort((a, b) => a.totalCost - b.totalCost);
    
    const cheapestRoute = routes[0];
    const fastestRoute = routes.reduce((min, r) => 
      r.totalLatency < min.totalLatency ? r : min
    );
    
    console.log(`✅ Cost-optimized route: $${cheapestRoute.totalCost.toFixed(2)}`);
    console.log(`   vs Fastest route: $${fastestRoute.totalCost.toFixed(2)} (${fastestRoute.totalLatency}ms)`);
  });
});

describe('HFT Slot Graph - Monte Carlo Scenarios', () => {
  
  test('should run 1000 random route calculations', async () => {
    const iterations = 1000;
    const stations = await getAllStationIds();
    
    let successCount = 0;
    let totalLatency = 0;
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      const source = stations[Math.floor(Math.random() * stations.length)];
      const dest = stations[Math.floor(Math.random() * stations.length)];
      
      if (source === dest) continue;

      try {
        const route = await slotGraphQueryEngine.findOptimalRoute(source, dest, {
          maxLatency: 200,
          maxHops: 5
        });

        if (route) {
          successCount++;
          totalLatency += route.totalLatency;
        }
      } catch (error) {
        // Route not found
      }
    }

    const duration = Date.now() - startTime;
    const avgLatency = totalLatency / successCount;
    const successRate = successCount / iterations;

    expect(successRate).toBeGreaterThan(0.9); // >90% success rate
    expect(avgLatency).toBeLessThan(150); // Average <150ms
    
    console.log(`✅ Monte Carlo Results (${iterations} iterations):`);
    console.log(`   Success rate: ${(successRate * 100).toFixed(1)}%`);
    console.log(`   Avg latency: ${avgLatency.toFixed(1)}ms`);
    console.log(`   Total time: ${duration}ms (${(duration/iterations).toFixed(1)}ms per route)`);
  });

  test('should handle concurrent route calculations', async () => {
    const concurrentRequests = 100;
    const stations = await getAllStationIds();
    
    const promises = [];
    const startTime = Date.now();

    for (let i = 0; i < concurrentRequests; i++) {
      const source = stations[Math.floor(Math.random() * stations.length)];
      const dest = stations[Math.floor(Math.random() * stations.length)];
      
      promises.push(
        slotGraphQueryEngine.findOptimalRoute(source, dest, { maxLatency: 200 })
      );
    }

    const results = await Promise.allSettled(promises);
    const duration = Date.now() - startTime;
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
    const successRate = successful / concurrentRequests;

    expect(successRate).toBeGreaterThan(0.85); // >85% success under load
    expect(duration).toBeLessThan(10000); // Complete in <10 seconds
    
    console.log(`✅ Concurrent test (${concurrentRequests} requests):`);
    console.log(`   Success rate: ${(successRate * 100).toFixed(1)}%`);
    console.log(`   Total time: ${duration}ms`);
    console.log(`   Throughput: ${(concurrentRequests / (duration / 1000)).toFixed(1)} req/sec`);
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function selectRandomStations(count: number): Promise<string[]> {
  const stations = await getAllStationIds();
  const selected: string[] = [];
  
  while (selected.length < count && selected.length < stations.length) {
    const random = stations[Math.floor(Math.random() * stations.length)];
    if (!selected.includes(random)) {
      selected.push(random);
    }
  }
  
  return selected;
}

async function getTier1Stations(): Promise<string[]> {
  const result = await slotGraphQueryEngine.queryHFTNetwork({
    nodes: ['GroundStationNode'],
    filters: {
      'properties.tier': 1
    }
  });
  
  return result.nodes.map(n => n.id);
}

async function getAllStationIds(): Promise<string[]> {
  const result = await slotGraphQueryEngine.queryHFTNetwork({
    nodes: ['GroundStationNode'],
    limit: 1000
  });
  
  return result.nodes.map(n => n.id);
}

