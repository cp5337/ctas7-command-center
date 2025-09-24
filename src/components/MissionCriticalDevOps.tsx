import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Satellite,
  Gauge,
  Shield,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Cpu,
  HardDrive,
  Network,
  Database,
  GitBranch,
  Play,
  Pause,
  Square,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Bell,
  Settings,
  Command,
  Terminal,
  Monitor,
  Server,
  Cloud,
  Code,
  Bug,
  Wrench,
  FlaskConical,
  Layers,
  GitCommit,
  Timer,
  Thermometer
} from 'lucide-react';

interface MissionCriticalMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'nominal' | 'warning' | 'critical' | 'abort';
  trend: 'up' | 'down' | 'stable';
  threshold: {
    warning: number;
    critical: number;
    abort: number;
  };
  lastUpdate: string;
  category: 'performance' | 'reliability' | 'security' | 'capacity' | 'quality';
}

interface DeploymentPipeline {
  id: string;
  name: string;
  environment: 'dev' | 'staging' | 'prod' | 'mission-critical';
  status: 'idle' | 'running' | 'success' | 'failed' | 'aborted' | 'rollback';
  stage: string;
  progress: number;
  startTime: string;
  duration: string;
  tests: {
    unit: { passed: number; total: number; };
    integration: { passed: number; total: number; };
    e2e: { passed: number; total: number; };
    security: { passed: number; total: number; };
    performance: { passed: number; total: number; };
  };
  deployment: {
    canary: number;
    blueGreen: boolean;
    rollback: boolean;
  };
}

interface FlightReadinessReview {
  id: string;
  system: string;
  status: 'go' | 'no-go' | 'hold' | 'scrub';
  checklist: Array<{
    item: string;
    status: 'complete' | 'pending' | 'failed';
    owner: string;
    criticality: 'critical' | 'high' | 'medium' | 'low';
  }>;
  signOff: {
    lead: boolean;
    security: boolean;
    reliability: boolean;
    performance: boolean;
  };
}

export const MissionCriticalDevOps: React.FC = () => {
  const [activeView, setActiveView] = useState<'overview' | 'pipelines' | 'telemetry' | 'frr' | 'incidents'>('overview');
  const [metrics, setMetrics] = useState<MissionCriticalMetric[]>([]);
  const [pipelines, setPipelines] = useState<DeploymentPipeline[]>([]);
  const [frr, setFrr] = useState<FlightReadinessReview[]>([]);
  const [realTimeMode, setRealTimeMode] = useState(true);

  useEffect(() => {
    // Initialize mission-critical metrics
    setMetrics([
      {
        id: 'system-availability',
        name: 'System Availability',
        value: 99.97,
        unit: '%',
        status: 'nominal',
        trend: 'stable',
        threshold: { warning: 99.5, critical: 99.0, abort: 98.0 },
        lastUpdate: new Date().toISOString(),
        category: 'reliability'
      },
      {
        id: 'response-time',
        name: 'P99 Response Time',
        value: 45.2,
        unit: 'ms',
        status: 'nominal',
        trend: 'down',
        threshold: { warning: 100, critical: 200, abort: 500 },
        lastUpdate: new Date().toISOString(),
        category: 'performance'
      },
      {
        id: 'error-rate',
        name: 'Error Rate',
        value: 0.001,
        unit: '%',
        status: 'nominal',
        trend: 'stable',
        threshold: { warning: 0.1, critical: 0.5, abort: 1.0 },
        lastUpdate: new Date().toISOString(),
        category: 'reliability'
      },
      {
        id: 'security-score',
        name: 'Security Posture',
        value: 98.5,
        unit: '/100',
        status: 'nominal',
        trend: 'up',
        threshold: { warning: 90, critical: 80, abort: 70 },
        lastUpdate: new Date().toISOString(),
        category: 'security'
      },
      {
        id: 'deployment-frequency',
        name: 'Deployment Frequency',
        value: 47,
        unit: '/day',
        status: 'nominal',
        trend: 'up',
        threshold: { warning: 10, critical: 5, abort: 1 },
        lastUpdate: new Date().toISOString(),
        category: 'performance'
      },
      {
        id: 'mttr',
        name: 'Mean Time to Recovery',
        value: 8.3,
        unit: 'min',
        status: 'warning',
        trend: 'up',
        threshold: { warning: 10, critical: 30, abort: 60 },
        lastUpdate: new Date().toISOString(),
        category: 'reliability'
      }
    ]);

    setPipelines([
      {
        id: 'mission-critical-backend',
        name: 'Mission Critical Backend',
        environment: 'mission-critical',
        status: 'running',
        stage: 'Performance Testing',
        progress: 73,
        startTime: new Date(Date.now() - 420000).toISOString(),
        duration: '7m 23s',
        tests: {
          unit: { passed: 2847, total: 2847 },
          integration: { passed: 492, total: 492 },
          e2e: { passed: 156, total: 156 },
          security: { passed: 89, total: 89 },
          performance: { passed: 23, total: 31 }
        },
        deployment: {
          canary: 5,
          blueGreen: true,
          rollback: true
        }
      },
      {
        id: 'telemetry-ingestion',
        name: 'Telemetry Ingestion Service',
        environment: 'prod',
        status: 'success',
        stage: 'Deployed',
        progress: 100,
        startTime: new Date(Date.now() - 1200000).toISOString(),
        duration: '12m 45s',
        tests: {
          unit: { passed: 1234, total: 1234 },
          integration: { passed: 234, total: 234 },
          e2e: { passed: 67, total: 67 },
          security: { passed: 45, total: 45 },
          performance: { passed: 12, total: 12 }
        },
        deployment: {
          canary: 100,
          blueGreen: false,
          rollback: false
        }
      }
    ]);

    setFrr([
      {
        id: 'frr-001',
        system: 'Mission Critical Platform',
        status: 'go',
        checklist: [
          { item: 'All tests passing', status: 'complete', owner: 'QA Team', criticality: 'critical' },
          { item: 'Security scan clean', status: 'complete', owner: 'Security Team', criticality: 'critical' },
          { item: 'Performance benchmarks met', status: 'complete', owner: 'Performance Team', criticality: 'critical' },
          { item: 'Rollback procedures verified', status: 'complete', owner: 'DevOps Team', criticality: 'high' },
          { item: 'Monitoring alerts configured', status: 'complete', owner: 'SRE Team', criticality: 'high' }
        ],
        signOff: {
          lead: true,
          security: true,
          reliability: true,
          performance: true
        }
      }
    ]);

    // Real-time updates
    if (realTimeMode) {
      const interval = setInterval(() => {
        setMetrics(prev => prev.map(metric => ({
          ...metric,
          value: Math.max(0, metric.value + (Math.random() - 0.5) * 0.1),
          lastUpdate: new Date().toISOString()
        })));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [realTimeMode]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nominal':
      case 'go':
      case 'success':
      case 'complete':
        return 'text-green-400';
      case 'warning':
      case 'hold':
      case 'pending':
        return 'text-yellow-400';
      case 'critical':
      case 'no-go':
      case 'failed':
        return 'text-red-400';
      case 'abort':
      case 'scrub':
        return 'text-red-600';
      case 'running':
        return 'text-blue-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'nominal':
      case 'go':
      case 'success':
      case 'complete':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
      case 'hold':
      case 'pending':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
      case 'no-go':
      case 'failed':
        return <AlertTriangle className="w-4 h-4" />;
      case 'abort':
      case 'scrub':
        return <Square className="w-4 h-4" />;
      case 'running':
        return <Activity className="w-4 h-4 animate-pulse" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-400" />;
      default:
        return <Minus className="w-3 h-3 text-slate-400" />;
    }
  };

  const views = [
    { id: 'overview', label: 'Mission Control', icon: Rocket },
    { id: 'pipelines', label: 'Launch Pipelines', icon: GitBranch },
    { id: 'telemetry', label: 'Live Telemetry', icon: Satellite },
    { id: 'frr', label: 'Flight Readiness', icon: Target },
    { id: 'incidents', label: 'Anomaly Response', icon: Bell }
  ];

  return (
    <div className="space-y-6">
      {/* Mission Control Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-cyan-400/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Rocket className="w-8 h-8 text-cyan-400" />
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Mission Critical DevOps</h2>
                <p className="text-slate-400 text-sm">Aerospace-Grade Reliability • Tesla/SpaceX/NASA Standards</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${realTimeMode ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></div>
              <span className="text-sm text-slate-300">
                {realTimeMode ? 'Live Telemetry' : 'Static Mode'}
              </span>
            </div>
            <button
              onClick={() => setRealTimeMode(!realTimeMode)}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm transition-colors"
            >
              {realTimeMode ? 'Pause' : 'Resume'} Live Data
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex space-x-2">
        {views.map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === view.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{view.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mission Control Overview */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Critical Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <div key={metric.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-200">{metric.name}</h3>
                  <div className="flex items-center space-x-1">
                    <div className={getStatusColor(metric.status)}>
                      {getStatusIcon(metric.status)}
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>
                </div>

                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-2xl font-bold text-slate-100">
                    {metric.value.toFixed(metric.unit === '%' || metric.unit === '/100' ? 2 : 1)}
                  </span>
                  <span className="text-sm text-slate-400">{metric.unit}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Warning: {metric.threshold.warning}</span>
                    <span className="text-yellow-400">Critical: {metric.threshold.critical}</span>
                    <span className="text-red-400">Abort: {metric.threshold.abort}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all ${
                        metric.value >= metric.threshold.warning ? 'bg-green-400' :
                        metric.value >= metric.threshold.critical ? 'bg-yellow-400' :
                        metric.value >= metric.threshold.abort ? 'bg-red-400' : 'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(100, (metric.value / metric.threshold.abort) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* System Health Dashboard */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-cyan-400" />
              <span>System Health Dashboard</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-700 rounded p-4 text-center">
                <div className="text-3xl font-bold text-green-400">99.97%</div>
                <div className="text-sm text-slate-400">Uptime SLA</div>
                <div className="text-xs text-green-400 mt-1">✓ Target: 99.95%</div>
              </div>
              <div className="bg-slate-700 rounded p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">47</div>
                <div className="text-sm text-slate-400">Deploys/Day</div>
                <div className="text-xs text-blue-400 mt-1">↑ 15% from last week</div>
              </div>
              <div className="bg-slate-700 rounded p-4 text-center">
                <div className="text-3xl font-bold text-cyan-400">8.3m</div>
                <div className="text-sm text-slate-400">MTTR</div>
                <div className="text-xs text-yellow-400 mt-1">⚠ Target: &lt;10m</div>
              </div>
              <div className="bg-slate-700 rounded p-4 text-center">
                <div className="text-3xl font-bold text-purple-400">0.001%</div>
                <div className="text-sm text-slate-400">Error Rate</div>
                <div className="text-xs text-green-400 mt-1">✓ Target: &lt;0.1%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Launch Pipelines */}
      {activeView === 'pipelines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">Launch Pipelines</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                <Play className="w-3 h-3 inline mr-1" />
                Launch All
              </button>
              <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
                <Square className="w-3 h-3 inline mr-1" />
                Emergency Stop
              </button>
            </div>
          </div>

          {pipelines.map((pipeline) => (
            <div key={pipeline.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={getStatusColor(pipeline.status)}>
                    {getStatusIcon(pipeline.status)}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-slate-100">{pipeline.name}</h4>
                    <p className="text-sm text-slate-400">
                      {pipeline.environment.toUpperCase()} • {pipeline.stage} • {pipeline.duration}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-200">{pipeline.progress}%</div>
                    <div className="text-xs text-slate-400">Progress</div>
                  </div>
                  <div className="w-16 bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-cyan-400 h-2 rounded-full transition-all"
                      style={{ width: `${pipeline.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Test Results */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {Object.entries(pipeline.tests).map(([testType, results]) => (
                  <div key={testType} className="bg-slate-700 rounded p-3 text-center">
                    <div className="text-sm font-medium text-slate-200 capitalize mb-1">{testType}</div>
                    <div className={`text-lg font-bold ${
                      results.passed === results.total ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {results.passed}/{results.total}
                    </div>
                    <div className="text-xs text-slate-400">
                      {((results.passed / results.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>

              {/* Deployment Strategy */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-slate-400">Deployment:</span>
                  <span className="text-cyan-400">Canary {pipeline.deployment.canary}%</span>
                  {pipeline.deployment.blueGreen && (
                    <span className="text-blue-400">Blue/Green</span>
                  )}
                  {pipeline.deployment.rollback && (
                    <span className="text-green-400">Rollback Ready</span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button className="p-1 text-slate-400 hover:text-cyan-400 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-yellow-400 transition-colors">
                    <Pause className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-red-400 transition-colors">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Telemetry */}
      {activeView === 'telemetry' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center space-x-2">
            <Satellite className="w-5 h-5 text-cyan-400" />
            <span>Live System Telemetry</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real-time Metrics */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h4 className="text-md font-semibold text-slate-100 mb-4">Real-time Performance</h4>
              <div className="space-y-3">
                {['CPU Usage', 'Memory Usage', 'Network I/O', 'Disk I/O'].map((metric, index) => (
                  <div key={metric} className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{metric}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full transition-all"
                          style={{ width: `${Math.random() * 80 + 10}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-12 text-right">
                        {(Math.random() * 80 + 10).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert Status */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h4 className="text-md font-semibold text-slate-100 mb-4">Alert Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-500/10 border border-green-500/20 rounded">
                  <span className="text-sm text-green-400">All systems nominal</span>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                  <span className="text-sm text-yellow-400">High memory usage detected</span>
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flight Readiness Review */}
      {activeView === 'frr' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center space-x-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <span>Flight Readiness Review</span>
          </h3>

          {frr.map((review) => (
            <div key={review.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-lg font-medium text-slate-100">{review.system}</h4>
                  <p className="text-sm text-slate-400">Pre-deployment verification checklist</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  review.status === 'go' ? 'bg-green-600 text-white' :
                  review.status === 'no-go' ? 'bg-red-600 text-white' :
                  review.status === 'hold' ? 'bg-yellow-600 text-black' :
                  'bg-slate-600 text-white'
                }`}>
                  {review.status.toUpperCase()}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {review.checklist.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                    <div className="flex items-center space-x-3">
                      <div className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)}
                      </div>
                      <span className="text-sm text-slate-200">{item.item}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.criticality === 'critical' ? 'bg-red-600 text-white' :
                        item.criticality === 'high' ? 'bg-orange-600 text-white' :
                        item.criticality === 'medium' ? 'bg-yellow-600 text-black' :
                        'bg-green-600 text-white'
                      }`}>
                        {item.criticality}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{item.owner}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(review.signOff).map(([role, signed]) => (
                  <div key={role} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                    <span className="text-sm text-slate-300 capitalize">{role}</span>
                    <div className={signed ? 'text-green-400' : 'text-slate-500'}>
                      {signed ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};