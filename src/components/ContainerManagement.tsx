import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Play, 
  Pause, 
  Square, 
  RefreshCw,
  Activity,
  Cpu,
  HardDrive,
  Network,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'paused' | 'exited';
  created: string;
  ports: string[];
  cpu: number;
  memory: number;
  network: string;
}

interface Props {
  isConnected: boolean;
}

export function ContainerManagement({ isConnected }: Props) {
  const [containers, setContainers] = useState<ContainerInfo[]>([
    {
      id: 'ctas7-command-center',
      name: 'CTAS 7.0 Command Center',
      image: 'ctas7-command-center:latest',
      status: 'running',
      created: '2024-12-09T10:30:00Z',
      ports: ['8080:8080', '18082:18082'],
      cpu: 15.3,
      memory: 245.7,
      network: 'ctas7-network'
    },
    {
      id: 'ctas7-cdn-system',
      name: 'CTAS 7.0 CDN System',
      image: 'ctas7-cdn-system:latest',
      status: 'running',
      created: '2024-12-09T10:28:00Z',
      ports: ['3000:3000'],
      cpu: 8.7,
      memory: 128.4,
      network: 'ctas7-network'
    },
    {
      id: 'ctas7-streaming-inference',
      name: 'Streaming Inference Engine',
      image: 'ctas7-streaming-inference-engine:latest',
      status: 'running',
      created: '2024-12-09T10:25:00Z',
      ports: ['9090:9090'],
      cpu: 34.2,
      memory: 512.1,
      network: 'ctas7-network'
    },
    {
      id: 'ctas7-validation-env',
      name: 'Validation Environment',
      image: 'ctas7-validation:latest',
      status: 'stopped',
      created: '2024-12-09T09:15:00Z',
      ports: [],
      cpu: 0,
      memory: 0,
      network: 'ctas7-network'
    },
    {
      id: 'sled-kvs-primary',
      name: 'Sled KVS Primary',
      image: 'alpine:latest',
      status: 'running',
      created: '2024-12-09T10:20:00Z',
      ports: ['6379:6379'],
      cpu: 2.1,
      memory: 64.2,
      network: 'ctas7-network'
    }
  ]);

  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);

  useEffect(() => {
    // Simulate real-time container stats updates
    const interval = setInterval(() => {
      setContainers(prev => prev.map(container => ({
        ...container,
        cpu: container.status === 'running' 
          ? Math.max(0, container.cpu + (Math.random() - 0.5) * 5)
          : 0,
        memory: container.status === 'running'
          ? Math.max(0, container.memory + (Math.random() - 0.5) * 20)
          : 0
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: ContainerInfo['status']) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-400" />;
      case 'stopped':
      case 'exited':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ContainerInfo['status']) => {
    switch (status) {
      case 'running':
        return 'text-green-400';
      case 'paused':
        return 'text-yellow-400';
      case 'stopped':
      case 'exited':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const handleContainerAction = (containerId: string, action: 'start' | 'stop' | 'pause' | 'restart') => {
    if (!isConnected) {
      console.log(`Would ${action} container ${containerId} when connected`);
      return;
    }

    setContainers(prev => prev.map(container => {
      if (container.id === containerId) {
        switch (action) {
          case 'start':
            return { ...container, status: 'running' as const };
          case 'stop':
            return { ...container, status: 'stopped' as const, cpu: 0, memory: 0 };
          case 'pause':
            return { ...container, status: 'paused' as const };
          case 'restart':
            return { ...container, status: 'running' as const };
          default:
            return container;
        }
      }
      return container;
    }));
  };

  const totalCpu = containers.reduce((sum, c) => sum + c.cpu, 0);
  const totalMemory = containers.reduce((sum, c) => sum + c.memory, 0);
  const runningContainers = containers.filter(c => c.status === 'running').length;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-700/50 border border-cyan-400/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Container className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-slate-400">Total Containers</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{containers.length}</div>
        </div>
        
        <div className="bg-slate-700/50 border border-green-400/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-400" />
            <span className="text-sm text-slate-400">Running</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{runningContainers}</div>
        </div>
        
        <div className="bg-slate-700/50 border border-yellow-400/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-slate-400">Total CPU</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{totalCpu.toFixed(1)}%</div>
        </div>
        
        <div className="bg-slate-700/50 border border-purple-400/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-slate-400">Total Memory</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{totalMemory.toFixed(1)}MB</div>
        </div>
      </div>

      {/* Container List */}
      <div className="bg-slate-800 border border-cyan-400/20 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">CTAS 7.0 Containers</h3>
            <button 
              className="flex items-center space-x-2 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-sm transition-colors"
              onClick={() => console.log('Refreshing containers...')}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Container</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Ports</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Resources</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {containers.map((container) => (
                <tr 
                  key={container.id} 
                  className={`hover:bg-slate-700/30 cursor-pointer transition-colors ${
                    selectedContainer === container.id ? 'bg-slate-700/50' : ''
                  }`}
                  onClick={() => setSelectedContainer(selectedContainer === container.id ? null : container.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Container className="w-5 h-5 text-cyan-400" />
                      <div>
                        <div className="text-sm font-medium text-slate-100">{container.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{container.id}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(container.status)}
                      <span className={`text-sm font-medium ${getStatusColor(container.status)}`}>
                        {container.status.charAt(0).toUpperCase() + container.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-300 font-mono">{container.image}</span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {container.ports.length > 0 ? (
                        container.ports.map((port, idx) => (
                          <div key={idx} className="flex items-center space-x-1">
                            <Network className="w-3 h-3 text-blue-400" />
                            <span className="text-xs text-slate-300 font-mono">{port}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">No ports</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Cpu className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-slate-300">{container.cpu.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <HardDrive className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-slate-300">{container.memory.toFixed(1)}MB</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {container.status === 'stopped' || container.status === 'exited' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContainerAction(container.id, 'start');
                          }}
                          className="p-1 text-green-400 hover:text-green-300 hover:bg-slate-600 rounded transition-colors"
                          title="Start"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContainerAction(container.id, 'stop');
                          }}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-slate-600 rounded transition-colors"
                          title="Stop"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      )}
                      
                      {container.status === 'running' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContainerAction(container.id, 'pause');
                          }}
                          className="p-1 text-yellow-400 hover:text-yellow-300 hover:bg-slate-600 rounded transition-colors"
                          title="Pause"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContainerAction(container.id, 'restart');
                        }}
                        className="p-1 text-cyan-400 hover:text-cyan-300 hover:bg-slate-600 rounded transition-colors"
                        title="Restart"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Container Details */}
      {selectedContainer && (
        <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Container Details</h3>
          {(() => {
            const container = containers.find(c => c.id === selectedContainer);
            if (!container) return null;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-slate-400">Container ID:</span>
                    <p className="text-slate-200 font-mono text-sm">{container.id}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Image:</span>
                    <p className="text-slate-200 font-mono text-sm">{container.image}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Network:</span>
                    <p className="text-slate-200 text-sm">{container.network}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-slate-400">Created:</span>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <p className="text-slate-200 text-sm">
                        {new Date(container.created).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Port Mappings:</span>
                    <div className="space-y-1">
                      {container.ports.length > 0 ? (
                        container.ports.map((port, idx) => (
                          <p key={idx} className="text-slate-200 font-mono text-sm">{port}</p>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm">No port mappings</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {!isConnected && (
        <div className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-300 font-medium">Offline Mode</span>
          </div>
          <p className="text-yellow-200 text-sm mt-2">
            Container management features are limited in offline mode. Connect to enable full functionality.
          </p>
        </div>
      )}
    </div>
  );
}