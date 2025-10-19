import React, { useState, useEffect } from 'react';
import { Lock, Zap, Database, Target, Hash, Activity, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface HashRequest {
  data: string;
  algorithm: 'blake3' | 'sha256' | 'sha3' | 'argon2';
  format: 'hex' | 'base64' | 'binary';
  compress: boolean;
}

interface HashResult {
  hash: string;
  algorithm: string;
  format: string;
  compressed: boolean;
  compressionRatio?: number;
  processingTime: number;
  status: 'success' | 'error';
  error?: string;
}

interface EngineStatus {
  online: boolean;
  version?: string;
  supportedAlgorithms?: string[];
  performance?: {
    requestsPerSecond: number;
    averageProcessingTime: number;
    totalRequests: number;
    totalCompressions: number;
  };
  memory?: {
    used: number;
    available: number;
    percentage: number;
  };
}

const HashingEngineConsole: React.FC = () => {
  const [request, setRequest] = useState<HashRequest>({
    data: '',
    algorithm: 'blake3',
    format: 'hex',
    compress: false
  });

  const [result, setResult] = useState<HashResult | null>(null);
  const [status, setStatus] = useState<EngineStatus>({ online: false });
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<HashResult[]>([]);

  useEffect(() => {
    checkEngineStatus();
    const interval = setInterval(checkEngineStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const checkEngineStatus = async () => {
    try {
      const response = await fetch('http://localhost:18005/status');
      if (response.ok) {
        const engineStatus = await response.json();
        setStatus({
          online: true,
          ...engineStatus
        });
      } else {
        setStatus({ online: false });
      }
    } catch (error) {
      setStatus({ online: false });
    }
  };

  const handleHash = async () => {
    if (!request.data.trim()) {
      alert('Please enter data to hash');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:18005/hash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: request.data,
          algorithm: request.algorithm,
          format: request.format,
          compress: request.compress,
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'ctas_ui'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const hashResult = await response.json();
      setResult(hashResult);

      // Add to history
      setHistory(prev => [hashResult, ...prev.slice(0, 9)]); // Keep last 10 results

    } catch (error) {
      const errorResult: HashResult = {
        hash: '',
        algorithm: request.algorithm,
        format: request.format,
        compressed: false,
        processingTime: 0,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };
      setResult(errorResult);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickHash = async (type: 'threat-intel' | 'document' | 'legion-task') => {
    let sampleData = '';
    let algorithm: 'blake3' | 'sha256' | 'sha3' | 'argon2' = 'blake3';

    switch (type) {
      case 'threat-intel':
        sampleData = '192.168.1.100,suspicious_binary.exe,malware.domain.com';
        algorithm = 'blake3';
        break;
      case 'document':
        sampleData = `CTAS Document ${Date.now()}\nClassification: UNCLASSIFIED\nContent: Sample document for hashing demonstration.`;
        algorithm = 'sha3';
        break;
      case 'legion-task':
        sampleData = `#!/bin/bash\n# Legion Task Script\necho "Executing adversary simulation"\nnmap -sS 192.168.1.0/24`;
        algorithm = 'blake3';
        break;
    }

    setRequest({
      data: sampleData,
      algorithm,
      format: 'hex',
      compress: true
    });
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full bg-gray-900 text-gray-300 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <Lock className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Hashing Engine Console</h1>
              <p className="text-gray-400">
                Containerized Rust Implementation • Port 18005 • Production Ready
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {status.online ? (
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span>Engine Online</span>
                {status.version && (
                  <span className="text-gray-400">v{status.version}</span>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>Engine Offline</span>
              </div>
            )}
          </div>
        </div>

        {/* Performance Stats */}
        {status.performance && (
          <div className="grid grid-cols-4 gap-4 bg-gray-800 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{status.performance.requestsPerSecond}</div>
              <div className="text-xs text-gray-400">Requests/sec</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{status.performance.averageProcessingTime}ms</div>
              <div className="text-xs text-gray-400">Avg Processing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{status.performance.totalRequests}</div>
              <div className="text-xs text-gray-400">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {status.memory ? `${status.memory.percentage}%` : 'N/A'}
              </div>
              <div className="text-xs text-gray-400">Memory Usage</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hash Request Panel */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            Hash Request
          </h2>

          {/* Quick Actions */}
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-2">Quick Actions:</div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleQuickHash('threat-intel')}
                className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
              >
                <Target className="w-3 h-3 mr-1" />
                Threat Intel
              </button>
              <button
                onClick={() => handleQuickHash('document')}
                className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
              >
                <Database className="w-3 h-3 mr-1" />
                Document
              </button>
              <button
                onClick={() => handleQuickHash('legion-task')}
                className="flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
              >
                <Zap className="w-3 h-3 mr-1" />
                Legion Task
              </button>
            </div>
          </div>

          {/* Data Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Data to Hash:</label>
            <textarea
              value={request.data}
              onChange={(e) => setRequest({ ...request, data: e.target.value })}
              className="w-full h-32 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm font-mono"
              placeholder="Enter data to hash..."
            />
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Algorithm:</label>
              <select
                value={request.algorithm}
                onChange={(e) => setRequest({ ...request, algorithm: e.target.value as any })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                <option value="blake3">BLAKE3 (Fast)</option>
                <option value="sha256">SHA-256</option>
                <option value="sha3">SHA-3</option>
                <option value="argon2">Argon2 (Password)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Format:</label>
              <select
                value={request.format}
                onChange={(e) => setRequest({ ...request, format: e.target.value as any })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                <option value="hex">Hexadecimal</option>
                <option value="base64">Base64</option>
                <option value="binary">Binary</option>
              </select>
            </div>
          </div>

          {/* Compression Option */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={request.compress}
                onChange={(e) => setRequest({ ...request, compress: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Enable Compression (95%+ ratio)</span>
            </label>
          </div>

          {/* Execute Button */}
          <button
            onClick={handleHash}
            disabled={!status.online || isProcessing || !request.data.trim()}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded"
          >
            {isProcessing ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Hash className="w-4 h-4 mr-2" />
                Generate Hash
              </>
            )}
          </button>
        </div>

        {/* Results Panel */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Results
          </h2>

          {result && (
            <div className="mb-6">
              <div className={`p-4 rounded-lg border-l-4 ${
                result.status === 'success'
                  ? 'bg-green-900/20 border-green-500'
                  : 'bg-red-900/20 border-red-500'
              }`}>
                {result.status === 'success' ? (
                  <>
                    <div className="mb-2">
                      <span className="text-sm text-gray-400">Hash ({result.algorithm}, {result.format}):</span>
                      <div className="font-mono text-sm bg-gray-700 p-2 rounded mt-1 break-all">
                        {result.hash}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {result.processingTime}ms
                      </div>
                      {result.compressed && result.compressionRatio && (
                        <div>
                          Compressed: {(result.compressionRatio * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-red-400">
                    <div className="font-semibold">Error:</div>
                    <div className="text-sm">{result.error}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History */}
          <div>
            <h3 className="text-sm font-medium mb-2">Recent Hashes:</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((item, index) => (
                <div key={index} className="bg-gray-700 p-2 rounded text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400">{item.algorithm}</span>
                    <span className={item.status === 'success' ? 'text-green-400' : 'text-red-400'}>
                      {item.status === 'success' ? '✓' : '✗'}
                    </span>
                  </div>
                  {item.status === 'success' && (
                    <div className="font-mono text-gray-300 truncate">
                      {item.hash.substring(0, 32)}...
                    </div>
                  )}
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-gray-400 text-center py-4">
                  No hash history yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HashingEngineConsole;