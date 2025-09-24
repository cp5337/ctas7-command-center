import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  Activity,
  HardDrive,
  Clock,
  Users,
  FileText,
  BarChart3,
  Zap,
  AlertCircle,
  CheckCircle,
  Cpu,
  Network,
  RefreshCw,
  Eye,
  Download,
  Upload
} from 'lucide-react';

interface DatabaseStats {
  name: string;
  type: 'sled' | 'surrealdb' | 'influxdb';
  status: 'online' | 'offline' | 'error';
  size: string;
  records: number;
  lastBackup: string;
  connections: number;
  performance: {
    reads_per_sec: number;
    writes_per_sec: number;
    avg_latency_ms: number;
  };
  location: string;
}

interface Props {
  isConnected: boolean;
}

export function DatabaseManagement({ isConnected }: Props) {
  const [databases, setDatabases] = useState<DatabaseStats[]>([
    {
      name: 'CTAS 7.0 Primary KVS',
      type: 'sled',
      status: 'online',
      size: '2.4 GB',
      records: 847392,
      lastBackup: '2024-12-09T12:30:00Z',
      connections: 23,
      performance: {
        reads_per_sec: 15420,
        writes_per_sec: 3240,
        avg_latency_ms: 0.8
      },
      location: '/data/ctas7-primary.sled'
    },
    {
      name: 'CDN Cache Store',
      type: 'sled',
      status: 'online', 
      size: '1.7 GB',
      records: 523847,
      lastBackup: '2024-12-09T12:15:00Z',
      connections: 18,
      performance: {
        reads_per_sec: 28750,
        writes_per_sec: 2130,
        avg_latency_ms: 0.3
      },
      location: '/data/cdn-cache.sled'
    },
    {
      name: 'Knowledge Graph Store',
      type: 'sled',
      status: 'online',
      size: '3.8 GB', 
      records: 1247839,
      lastBackup: '2024-12-09T11:45:00Z',
      connections: 12,
      performance: {
        reads_per_sec: 8940,
        writes_per_sec: 1560,
        avg_latency_ms: 1.2
      },
      location: '/data/knowledge-graph.sled'
    },
    {
      name: 'Threat Intelligence DB',
      type: 'surrealdb',
      status: 'online',
      size: '890 MB',
      records: 234567,
      lastBackup: '2024-12-09T10:30:00Z',
      connections: 8,
      performance: {
        reads_per_sec: 4230,
        writes_per_sec: 890,
        avg_latency_ms: 2.1
      },
      location: 'surreal://localhost:8000/ctas7-threats'
    },
    {
      name: 'Metrics Time Series',
      type: 'influxdb',
      status: 'online',
      size: '1.2 GB',
      records: 5847392,
      lastBackup: '2024-12-09T12:45:00Z',
      connections: 15,
      performance: {
        reads_per_sec: 12340,
        writes_per_sec: 8750,
        avg_latency_ms: 1.5
      },
      location: 'influxdb://localhost:8086/ctas7-metrics'
    }
  ]);

  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [activeQuery, setActiveQuery] = useState<string>('');

  useEffect(() => {
    if (isConnected) {
      // Simulate real-time database stats updates
      const interval = setInterval(() => {
        setDatabases(prev => prev.map(db => ({
          ...db,
          connections: Math.max(0, db.connections + Math.floor((Math.random() - 0.5) * 4)),
          performance: {
            ...db.performance,
            reads_per_sec: Math.max(0, db.performance.reads_per_sec + Math.floor((Math.random() - 0.5) * 1000)),
            writes_per_sec: Math.max(0, db.performance.writes_per_sec + Math.floor((Math.random() - 0.5) * 200)),
            avg_latency_ms: Math.max(0.1, db.performance.avg_latency_ms + (Math.random() - 0.5) * 0.5)
          }
        })));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const getStatusIcon = (status: DatabaseStats['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'offline':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: DatabaseStats['status']) => {
    switch (status) {
      case 'online':
        return 'text-green-400';
      case 'offline':
        return 'text-red-400';
      case 'error':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: DatabaseStats['type']) => {
    switch (type) {
      case 'sled':
        return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'surrealdb':
        return <Server className="w-5 h-5 text-purple-400" />;
      case 'influxdb':
        return <BarChart3 className="w-5 h-5 text-orange-400" />;
      default:
        return <Database className="w-5 h-5 text-gray-400" />;
    }
  };

  const totalSize = databases.reduce((sum, db) => {
    const size = parseFloat(db.size.split(' ')[0]);
    const unit = db.size.split(' ')[1];
    return sum + (unit === 'GB' ? size * 1000 : size);
  }, 0);

  const totalRecords = databases.reduce((sum, db) => sum + db.records, 0);
  const totalConnections = databases.reduce((sum, db) => sum + db.connections, 0);
  const onlineDatabases = databases.filter(db => db.status === 'online').length;

  const handleExecuteQuery = () => {
    if (!isConnected || !activeQuery.trim()) return;
    
    console.log('Executing query:', activeQuery);
    // In real implementation, this would execute against the selected database
    setActiveQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-700/50 border border-cyan-400/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-slate-400">Total Databases</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{databases.length}</div>
          <div className="text-xs text-green-400">{onlineDatabases} online</div>
        </div>
        
        <div className="bg-slate-700/50 border border-purple-400/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-slate-400">Total Storage</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{(totalSize / 1000).toFixed(1)}GB</div>
          <div className="text-xs text-slate-400">Across all systems</div>
        </div>
        
        <div className="bg-slate-700/50 border border-green-400/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-green-400" />
            <span className="text-sm text-slate-400">Total Records</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{(totalRecords / 1000000).toFixed(1)}M</div>
          <div className="text-xs text-slate-400">Live data points</div>
        </div>
        
        <div className="bg-slate-700/50 border border-orange-400/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-slate-400">Active Connections</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{totalConnections}</div>
          <div className="text-xs text-slate-400">Real-time sessions</div>
        </div>
      </div>

      {/* Database List */}
      <div className="bg-slate-800 border border-cyan-400/20 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">Live Database Systems</h3>
            <button 
              className="flex items-center space-x-2 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-sm transition-colors"
              onClick={() => console.log('Refreshing database stats...')}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Database</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Storage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Connections</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {databases.map((db) => (
                <tr 
                  key={db.name} 
                  className={`hover:bg-slate-700/30 cursor-pointer transition-colors ${
                    selectedDatabase === db.name ? 'bg-slate-700/50' : ''
                  }`}
                  onClick={() => setSelectedDatabase(selectedDatabase === db.name ? null : db.name)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(db.type)}
                      <div>
                        <div className="text-sm font-medium text-slate-100">{db.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{db.type.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(db.status)}
                      <span className={`text-sm font-medium ${getStatusColor(db.status)}`}>
                        {db.status.charAt(0).toUpperCase() + db.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm text-slate-300">{db.size}</div>
                      <div className="text-xs text-slate-400">{db.records.toLocaleString()} records</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Download className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-slate-300">{db.performance.reads_per_sec.toLocaleString()}/s</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Upload className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-slate-300">{db.performance.writes_per_sec.toLocaleString()}/s</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-slate-300">{db.performance.avg_latency_ms.toFixed(1)}ms</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Network className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-slate-300">{db.connections}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Viewing database:', db.name);
                        }}
                        className="p-1 text-cyan-400 hover:text-cyan-300 hover:bg-slate-600 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Details */}
      {selectedDatabase && (
        <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Database Details</h3>
          {(() => {
            const db = databases.find(d => d.name === selectedDatabase);
            if (!db) return null;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-slate-400">Location:</span>
                    <p className="text-slate-200 font-mono text-sm">{db.location}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Type:</span>
                    <p className="text-slate-200 text-sm">{db.type.toUpperCase()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Last Backup:</span>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <p className="text-slate-200 text-sm">
                        {new Date(db.lastBackup).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-slate-400">Performance Metrics:</span>
                    <div className="bg-slate-700/30 rounded p-3 mt-1">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Reads/sec:</span>
                          <span className="text-green-400">{db.performance.reads_per_sec.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Writes/sec:</span>
                          <span className="text-blue-400">{db.performance.writes_per_sec.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Avg Latency:</span>
                          <span className="text-yellow-400">{db.performance.avg_latency_ms.toFixed(1)}ms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Query Interface */}
      <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Database Query Interface</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Database Query (Live Execution)
            </label>
            <textarea
              value={activeQuery}
              onChange={(e) => setActiveQuery(e.target.value)}
              placeholder="Enter your query here (SQL, KVS keys, InfluxQL, etc.)"
              className="w-full h-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              disabled={!isConnected}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              {selectedDatabase ? `Target: ${selectedDatabase}` : 'Select a database above'}
            </div>
            <button
              onClick={handleExecuteQuery}
              disabled={!isConnected || !activeQuery.trim() || !selectedDatabase}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white rounded-md transition-colors"
            >
              Execute Query
            </button>
          </div>
        </div>
      </div>

      {!isConnected && (
        <div className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-300 font-medium">Offline Mode</span>
          </div>
          <p className="text-yellow-200 text-sm mt-2">
            Database management features are limited in offline mode. Connect to enable live data operations.
          </p>
        </div>
      )}
    </div>
  );
}