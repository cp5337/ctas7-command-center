import React, { useState, useEffect } from "react";
import {
  Lock,
  Zap,
  Database,
  Target,
  Activity,
  CheckCircle,
  AlertCircle,
  Hash,
  Shield,
  Globe,
} from "lucide-react";
import HashingEngineConsole from "../components/HashingEngineConsole";

interface IntegrationTest {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "success" | "error";
  result?: string;
  duration?: number;
}

const HashingEngineDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "console" | "integration" | "performance"
  >("console");
  const [integrationTests, setIntegrationTests] = useState<IntegrationTest[]>([
    {
      id: "threat-intel",
      name: "Threat Intelligence Hashing",
      description:
        "Hash IOCs and threat indicators for secure storage and comparison",
      status: "pending",
    },
    {
      id: "document-manager",
      name: "Document Manager (USIM) Integration",
      description:
        "Hash documents for integrity verification and blockchain coordination",
      status: "pending",
    },
    {
      id: "legion-tasks",
      name: "Legion Task Script Hashing",
      description:
        "Hash adversary/counter-adversary scripts across 4 operational worlds",
      status: "pending",
    },
    {
      id: "database-integrity",
      name: "Database Integrity Verification",
      description: "Hash database records for tamper detection",
      status: "pending",
    },
  ]);

  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalRequests: 0,
    avgProcessingTime: 0,
    compressionRatio: 0,
    throughput: 0,
  });

  const runIntegrationTest = async (testId: string) => {
    setIntegrationTests((prev) =>
      prev.map((test) =>
        test.id === testId ? { ...test, status: "running" } : test
      )
    );

    try {
      const startTime = Date.now();
      let result = "";

      switch (testId) {
        case "threat-intel":
          result = await testThreatIntelHashing();
          break;
        case "document-manager":
          result = await testDocumentManagerHashing();
          break;
        case "legion-tasks":
          result = await testLegionTaskHashing();
          break;
        case "database-integrity":
          result = await testDatabaseIntegrityHashing();
          break;
      }

      const duration = Date.now() - startTime;

      setIntegrationTests((prev) =>
        prev.map((test) =>
          test.id === testId
            ? { ...test, status: "success", result, duration }
            : test
        )
      );
    } catch (error) {
      setIntegrationTests((prev) =>
        prev.map((test) =>
          test.id === testId
            ? {
                ...test,
                status: "error",
                result: error instanceof Error ? error.message : String(error),
              }
            : test
        )
      );
    }
  };

  const testThreatIntelHashing = async (): Promise<string> => {
    const indicators = [
      "192.168.1.100",
      "malware.exe",
      "evil.domain.com",
      "fb2c4e2d6e8b4a3c5f7e9d8c7b6a5e4d3c2b1a9f8e7d6c5b4a3f2e1d0c9b8a7f6",
    ];

    const response = await fetch("http://localhost:18005/batch_hash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: `threat_intel_${Date.now()}`,
        requests: indicators.map((indicator) => ({
          data: indicator,
          algorithm: "murmur3",
          format: "base96",
          compress: true,
          metadata: { type: "threat_indicator" },
        })),
        priority: "high",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return `Hashed ${result.completedCount}/${
      indicators.length
    } threat indicators. Avg processing: ${(
      result.totalProcessingTime / indicators.length
    ).toFixed(2)}ms per indicator.`;
  };

  const testDocumentManagerHashing = async (): Promise<string> => {
    const documents = [
      {
        id: "doc_001",
        content: `CTAS Document 001
Classification: UNCLASSIFIED
Subject: System Integration Test
Content: This is a test document for USIM integration testing.
Timestamp: ${new Date().toISOString()}`,
      },
      {
        id: "doc_002",
        content: `CTAS Document 002
Classification: UNCLASSIFIED
Subject: Hashing Engine Performance
Content: Performance metrics and validation data for the containerized hashing engine.
Timestamp: ${new Date().toISOString()}`,
      },
    ];

    const response = await fetch("http://localhost:18005/batch_hash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: `usim_docs_${Date.now()}`,
        requests: documents.map((doc) => ({
          data: doc.content,
          algorithm: "murmur3",
          format: "base96",
          compress: true,
          metadata: { type: "document", documentId: doc.id },
        })),
        priority: "normal",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    const compressionRatios = result.results
      .filter((r: any) => r.compressed && r.compressionRatio)
      .map((r: any) => r.compressionRatio * 100);

    const avgCompression =
      compressionRatios.length > 0
        ? compressionRatios.reduce((a: number, b: number) => a + b, 0) /
          compressionRatios.length
        : 0;

    return `Hashed ${
      result.completedCount
    } documents. Average compression: ${avgCompression.toFixed(
      1
    )}%. Ready for USIM blockchain coordination.`;
  };

  const testLegionTaskHashing = async (): Promise<string> => {
    const legionTasks = [
      {
        id: "cyber_hunt_001",
        script:
          '#!/bin/bash\n# Cyber Hunt Task\nnmap -sS -O 192.168.1.0/24\necho "Network reconnaissance complete"',
        world: "Cyber",
      },
      {
        id: "geo_detect_001",
        script:
          "#!/bin/bash\n# Geographical Detection\ngps_locate --target zone_alpha\nverify_coordinates --precision high",
        world: "Geographical",
      },
      {
        id: "space_disrupt_001",
        script:
          "#!/bin/bash\n# Space Domain Disruption\nsatellite_jam --frequency 2.4ghz\nconfirm_signal_degradation",
        world: "Space",
      },
      {
        id: "maritime_disable_001",
        script:
          "#!/bin/bash\n# Maritime Asset Disabling\nsonar_ping --range 10nm\njam_navigation_systems",
        world: "Maritime",
      },
    ];

    const requests = legionTasks.flatMap((task) => [
      {
        data: task.script,
        algorithm: "murmur3" as const,
        format: "base96" as const,
        compress: true,
        metadata: { type: "legion_script", taskId: task.id, world: task.world },
      },
      {
        data: task.world,
        algorithm: "murmur3" as const,
        format: "base96" as const,
        compress: false,
        metadata: { type: "legion_world", taskId: task.id },
      },
    ]);

    const response = await fetch("http://localhost:18005/batch_hash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: `legion_tasks_${Date.now()}`,
        requests,
        priority: "high",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return `Hashed ${legionTasks.length} Legion tasks across 4 operational worlds. Script + world context hashing complete for 1n/2n form coordination.`;
  };

  const testDatabaseIntegrityHashing = async (): Promise<string> => {
    const dbRecords = [
      JSON.stringify({
        table: "comprehensive_crate_interviews",
        record_count: 127,
        last_modified: Date.now(),
      }),
      JSON.stringify({
        table: "node_interviews",
        record_count: 165,
        last_modified: Date.now(),
      }),
      JSON.stringify({
        table: "kali_tools",
        record_count: 89,
        last_modified: Date.now(),
      }),
      JSON.stringify({
        table: "threat_intelligence",
        record_count: 234,
        last_modified: Date.now(),
      }),
    ];

    const response = await fetch("http://localhost:18005/batch_hash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: `db_integrity_${Date.now()}`,
        requests: dbRecords.map((record) => ({
          data: record,
          algorithm: "murmur3",
          format: "base96",
          compress: false,
          metadata: { type: "database_integrity" },
        })),
        priority: "normal",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return `Generated integrity hashes for ${result.completedCount} database tables. Tamper detection ready.`;
  };

  const runAllTests = async () => {
    for (const test of integrationTests) {
      await runIntegrationTest(test.id);
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  const updatePerformanceMetrics = async () => {
    try {
      const response = await fetch("http://localhost:18005/status");
      if (response.ok) {
        const status = await response.json();
        if (status.performance) {
          setPerformanceMetrics({
            totalRequests: status.performance.totalRequests || 0,
            avgProcessingTime: status.performance.averageProcessingTime || 0,
            compressionRatio:
              (status.performance.totalCompressions /
                Math.max(status.performance.totalRequests, 1)) *
              100,
            throughput: status.performance.requestsPerSecond || 0,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch performance metrics:", error);
    }
  };

  useEffect(() => {
    updatePerformanceMetrics();
    const interval = setInterval(updatePerformanceMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Lock className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Hashing Engine Integration
                </h1>
                <p className="text-gray-400">
                  Containerized Rust Implementation • CTAS-7 Ops Platform
                  Integration • Port 18005
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">
                  {performanceMetrics.throughput}
                </div>
                <div className="text-xs text-gray-400">req/sec</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-400">
                  {performanceMetrics.avgProcessingTime}ms
                </div>
                <div className="text-xs text-gray-400">avg time</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">
                  {performanceMetrics.compressionRatio.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">compression</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab("console")}
              className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === "console"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              <Hash className="w-4 h-4 mr-2" />
              Hash Console
            </button>
            <button
              onClick={() => setActiveTab("integration")}
              className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === "integration"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              <Zap className="w-4 h-4 mr-2" />
              System Integration
            </button>
            <button
              onClick={() => setActiveTab("performance")}
              className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === "performance"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              <Activity className="w-4 h-4 mr-2" />
              Performance
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-full">
        {activeTab === "console" && <HashingEngineConsole />}

        {activeTab === "integration" && (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  CTAS System Integration Tests
                </h2>
                <button
                  onClick={runAllTests}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Run All Tests
                </button>
              </div>

              <div className="grid gap-4">
                {integrationTests.map((test) => (
                  <div key={test.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            test.status === "success"
                              ? "bg-green-500"
                              : test.status === "error"
                              ? "bg-red-500"
                              : test.status === "running"
                              ? "bg-yellow-500 animate-pulse"
                              : "bg-gray-500"
                          }`}
                        />
                        <h3 className="font-semibold text-white">
                          {test.name}
                        </h3>
                        {test.status === "success" && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {test.status === "error" && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        {test.status === "running" && (
                          <Activity className="w-4 h-4 text-yellow-500 animate-spin" />
                        )}
                      </div>
                      <button
                        onClick={() => runIntegrationTest(test.id)}
                        disabled={test.status === "running"}
                        className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded"
                      >
                        {test.status === "running" ? "Running..." : "Test"}
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {test.description}
                    </p>
                    {test.result && (
                      <div
                        className={`text-sm p-2 rounded ${
                          test.status === "success"
                            ? "bg-green-900/20 text-green-300"
                            : "bg-red-900/20 text-red-300"
                        }`}
                      >
                        {test.result}
                        {test.duration && (
                          <span className="ml-2 text-gray-400">
                            ({test.duration}ms)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "performance" && (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-semibold text-white mb-6">
                Performance Monitoring
              </h2>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {performanceMetrics.totalRequests}
                  </div>
                  <div className="text-sm text-gray-400">Total Requests</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {performanceMetrics.avgProcessingTime}ms
                  </div>
                  <div className="text-sm text-gray-400">
                    Avg Processing Time
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {performanceMetrics.compressionRatio.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">
                    Compression Efficiency
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-400">
                    {performanceMetrics.throughput}
                  </div>
                  <div className="text-sm text-gray-400">Requests/Second</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Integration Capabilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-red-400" />
                    <span className="text-gray-300">
                      Threat Intelligence IOC Hashing
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300">
                      Document Manager (USIM) Integration
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">
                      Legion Task Script Verification
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">
                      4-World Operational Context
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Hash className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300">
                      95%+ Compression Ratios
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-300">
                      High-Performance Rust Engine
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HashingEngineDemo;
