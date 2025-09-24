import React, { useState, useEffect } from 'react';
import {
  Settings,
  Activity,
  Zap,
  Shield,
  Database,
  Monitor,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  Square,
  RefreshCw,
  BarChart3,
  Cpu,
  HardDrive,
  Network,
  Clock,
  TrendingUp,
  Link,
  ExternalLink,
  Globe,
  Palette
} from 'lucide-react';

interface TelemetryService {
  id: string;
  name: string;
  port: number;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  lastSeen: string;
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    requests: number;
    uptime: string;
  };
}

interface ProgressStage {
  id: string;
  name: string;
  status: 'notstarted' | 'inprogress' | 'completed' | 'failed' | 'paused';
  progress: number;
  timestamp: string;
}

interface QualityGate {
  id: string;
  name: string;
  status: 'open' | 'closed' | 'warning' | 'critical';
  requirements: string[];
  passedRequirements: string[];
}

export const SystemAdminPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'telemetry' | 'progress' | 'monitoring' | 'integrations' | 'control'>('telemetry');
  const [telemetryServices, setTelemetryServices] = useState<TelemetryService[]>([]);
  const [progressStages, setProgressStages] = useState<ProgressStage[]>([]);
  const [qualityGates, setQualityGates] = useState<QualityGate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSystemData();
      const interval = setInterval(loadSystemData, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadSystemData = async () => {
    setIsLoading(true);
    try {
      // Mock data - in production would fetch from actual services
      setTelemetryServices([
        {
          id: 'universal-telemetry',
          name: 'Universal Telemetry (18101)',
          port: 18101,
          status: 'healthy',
          lastSeen: new Date().toISOString(),
          metrics: {
            cpuUsage: Math.random() * 10 + 2,
            memoryUsage: Math.random() * 200 + 50,
            requests: Math.floor(Math.random() * 1000 + 500),
            uptime: '2h 34m'
          }
        },
        {
          id: 'progress-system',
          name: 'Progress System (18105)',
          port: 18105,
          status: 'healthy',
          lastSeen: new Date().toISOString(),
          metrics: {
            cpuUsage: Math.random() * 5 + 1,
            memoryUsage: Math.random() * 100 + 30,
            requests: Math.floor(Math.random() * 500 + 200),
            uptime: '1h 12m'
          }
        },
        {
          id: 'isolated-monitoring',
          name: 'Isolated Monitoring CDN',
          port: 18106,
          status: 'warning',
          lastSeen: new Date(Date.now() - 120000).toISOString(),
          metrics: {
            cpuUsage: Math.random() * 15 + 5,
            memoryUsage: Math.random() * 300 + 100,
            requests: Math.floor(Math.random() * 200 + 100),
            uptime: '45m'
          }
        }
      ]);

      setProgressStages([
        {
          id: 'stage-1',
          name: 'System Initialization',
          status: 'completed',
          progress: 100,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'stage-2',
          name: 'Service Discovery',
          status: 'inprogress',
          progress: 75,
          timestamp: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: 'stage-3',
          name: 'Quality Gates',
          status: 'notstarted',
          progress: 0,
          timestamp: new Date().toISOString()
        }
      ]);

      setQualityGates([
        {
          id: 'gate-1',
          name: 'Performance Gate',
          status: 'open',
          requirements: ['CPU < 5%', 'Memory < 200MB', 'Response < 100ms'],
          passedRequirements: ['CPU < 5%', 'Memory < 200MB']
        },
        {
          id: 'gate-2',
          name: 'Security Gate',
          status: 'closed',
          requirements: ['No CVEs', 'Authentication', 'Encryption'],
          passedRequirements: ['No CVEs', 'Authentication', 'Encryption']
        }
      ]);
    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
      case 'open':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
      case 'inprogress':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'critical':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'closed':
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
      case 'open':
        return 'text-green-400';
      case 'warning':
      case 'inprogress':
        return 'text-yellow-400';
      case 'critical':
      case 'failed':
        return 'text-red-400';
      case 'closed':
        return 'text-blue-400';
      default:
        return 'text-slate-400';
    }
  };

  const handleServiceAction = async (serviceId: string, action: 'start' | 'stop' | 'restart') => {
    console.log(`${action} service:`, serviceId);
    // In production, would make API calls to control services
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      loadSystemData();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6 w-full max-w-6xl h-5/6 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-slate-100">System Administration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation */}
        <div className="flex space-x-2 mb-6">
          {[
            { id: 'telemetry', label: 'Telemetry Services', icon: Database },
            { id: 'progress', label: 'Progress System', icon: BarChart3 },
            { id: 'monitoring', label: 'Isolated Monitoring', icon: Monitor },
            { id: 'integrations', label: 'Integrations', icon: Zap },
            { id: 'control', label: 'System Control', icon: Settings }
          ].map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="h-full overflow-y-auto">
          {activeSection === 'telemetry' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Telemetry Services Status</h3>
                <button
                  onClick={loadSystemData}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {telemetryServices.map((service) => (
                  <div key={service.id} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-medium text-slate-100">{service.name}</h4>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(service.status)}
                        <span className={`text-xs capitalize ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Cpu className="w-3 h-3 text-blue-400" />
                          <span className="text-slate-300">CPU:</span>
                        </div>
                        <span className="text-cyan-400">{service.metrics.cpuUsage.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <HardDrive className="w-3 h-3 text-green-400" />
                          <span className="text-slate-300">Memory:</span>
                        </div>
                        <span className="text-cyan-400">{service.metrics.memoryUsage.toFixed(0)}MB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Network className="w-3 h-3 text-purple-400" />
                          <span className="text-slate-300">Requests:</span>
                        </div>
                        <span className="text-cyan-400">{service.metrics.requests}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3 text-yellow-400" />
                          <span className="text-slate-300">Uptime:</span>
                        </div>
                        <span className="text-cyan-400">{service.metrics.uptime}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => handleServiceAction(service.id, 'restart')}
                        className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Restart</span>
                      </button>
                      <button
                        onClick={() => handleServiceAction(service.id, 'stop')}
                        className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                      >
                        <Square className="w-3 h-3" />
                        <span>Stop</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'progress' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-100">Progress System Overview</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-slate-100 mb-4">Progress Stages</h4>
                  <div className="space-y-3">
                    {progressStages.map((stage) => (
                      <div key={stage.id} className="bg-slate-600 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-200 font-medium">{stage.name}</span>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(stage.status)}
                            <span className={`text-xs capitalize ${getStatusColor(stage.status)}`}>
                              {stage.status}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-500 rounded-full h-2">
                          <div
                            className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stage.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{stage.progress}% complete</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-slate-100 mb-4">Quality Gates</h4>
                  <div className="space-y-3">
                    {qualityGates.map((gate) => (
                      <div key={gate.id} className="bg-slate-600 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-200 font-medium">{gate.name}</span>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(gate.status)}
                            <span className={`text-xs capitalize ${getStatusColor(gate.status)}`}>
                              {gate.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">
                          {gate.passedRequirements.length}/{gate.requirements.length} requirements met
                        </div>
                        <div className="mt-2">
                          {gate.requirements.map((req, index) => (
                            <div
                              key={index}
                              className={`text-xs ${
                                gate.passedRequirements.includes(req)
                                  ? 'text-green-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {gate.passedRequirements.includes(req) ? '✓' : '○'} {req}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'monitoring' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-100">Isolated Monitoring CDN</h3>

              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-md font-semibold text-slate-100 mb-4">Performance Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-600 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-cyan-400">47</div>
                    <div className="text-sm text-slate-400">Complex Types</div>
                  </div>
                  <div className="bg-slate-600 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">&lt;2%</div>
                    <div className="text-sm text-slate-400">CPU Overhead</div>
                  </div>
                  <div className="bg-slate-600 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-blue-400">1.2ms</div>
                    <div className="text-sm text-slate-400">Avg Latency</div>
                  </div>
                  <div className="bg-slate-600 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-purple-400">99.7%</div>
                    <div className="text-sm text-slate-400">Uptime</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-md font-semibold text-slate-100 mb-4">Statistical Analysis</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-slate-600 rounded">
                    <span className="text-slate-200">Confidence Level</span>
                    <span className="text-green-400">95%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-600 rounded">
                    <span className="text-slate-200">Sample Size</span>
                    <span className="text-cyan-400">10,247</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-600 rounded">
                    <span className="text-slate-200">Statistical Power</span>
                    <span className="text-blue-400">80%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'integrations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-100">External Integrations</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* Canva Integration */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Palette className="w-5 h-5 text-purple-400" />
                      <h4 className="text-md font-medium text-slate-100">Canva</h4>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400">Connected</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-300">API Status:</span>
                      <span className="text-green-400">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Webhook:</span>
                      <span className="text-cyan-400">Configured</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Templates:</span>
                      <span className="text-blue-400">23 Available</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      <span>Open Canva Dashboard</span>
                    </button>
                    <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                      <RefreshCw className="w-3 h-3" />
                      <span>Sync Templates</span>
                    </button>
                  </div>
                </div>

                {/* Figma Integration - Now Active */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-blue-400" />
                      <h4 className="text-md font-medium text-slate-100">Figma</h4>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-400">Connected</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-300">API Status:</span>
                      <span className="text-green-400">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">MCP Server:</span>
                      <span className="text-cyan-400">Port 18120</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Design Files:</span>
                      <span className="text-blue-400">Ready</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      <span>Open Figma Dashboard</span>
                    </button>
                    <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                      <RefreshCw className="w-3 h-3" />
                      <span>Sync Design Files</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4 opacity-60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Database className="w-5 h-5 text-green-400" />
                      <h4 className="text-md font-medium text-slate-100">Adobe Creative Suite</h4>
                    </div>
                    <div className="flex items-center space-x-1">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-yellow-400">Planned</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-300">API Status:</span>
                      <span className="text-slate-400">Not Connected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Integration:</span>
                      <span className="text-slate-400">Coming Soon</span>
                    </div>
                  </div>

                  <button disabled className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-600 text-slate-400 rounded text-sm cursor-not-allowed">
                    <Link className="w-3 h-3" />
                    <span>Configure Integration</span>
                  </button>
                </div>
              </div>

              {/* Integration Management */}
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-md font-semibold text-slate-100 mb-4">Integration Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-600 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">1</div>
                    <div className="text-sm text-slate-400">Active Integrations</div>
                  </div>
                  <div className="bg-slate-600 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-400">2</div>
                    <div className="text-sm text-slate-400">Pending Setup</div>
                  </div>
                  <div className="bg-slate-600 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-blue-400">847</div>
                    <div className="text-sm text-slate-400">API Calls Today</div>
                  </div>
                  <div className="bg-slate-600 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-purple-400">99.8%</div>
                    <div className="text-sm text-slate-400">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'control' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-100">System Control Center</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-slate-100 mb-4">Service Management</h4>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
                      <Play className="w-4 h-4" />
                      <span>Start All Services</span>
                    </button>
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors">
                      <RefreshCw className="w-4 h-4" />
                      <span>Restart All Services</span>
                    </button>
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
                      <Square className="w-4 h-4" />
                      <span>Emergency Stop</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-slate-100 mb-4">System Health</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-600 rounded">
                      <span className="text-slate-200">Overall Health</span>
                      <span className="text-green-400">Optimal</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-600 rounded">
                      <span className="text-slate-200">Active Services</span>
                      <span className="text-cyan-400">3/4</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-600 rounded">
                      <span className="text-slate-200">Total Uptime</span>
                      <span className="text-blue-400">2d 14h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};