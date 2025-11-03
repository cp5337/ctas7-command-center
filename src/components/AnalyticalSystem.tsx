import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Database,
  Brain,
  Zap,
  Globe,
  Satellite,
  Network,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  Filter,
  Download,
  Share,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Bell,
  CreditCard,
  Target,
  Layers,
  GitBranch,
  MonitorSpeaker,
  Calculator,
  Gauge
} from 'lucide-react';

interface AnalyticalMetrics {
  totalRevenue: number;
  activeUsers: number;
  systemLoad: number;
  dataProcessed: number;
  paygoUsage: number;
  abeQueries: number;
  tenantCount: number;
  alertsCount: number;
}

interface TenantInfo {
  id: string;
  name: string;
  tier: 'free' | 'pro' | 'enterprise' | 'custom';
  usage: number;
  limit: number;
  cost: number;
  status: 'active' | 'suspended' | 'trial' | 'overdue';
  lastActivity: string;
}

interface ABEQuery {
  id: string;
  tenant: string;
  query: string;
  executionTime: number;
  cost: number;
  status: 'running' | 'completed' | 'failed' | 'cached';
  timestamp: string;
  resultSize: number;
}

interface PaygoTransaction {
  id: string;
  tenant: string;
  service: 'compute' | 'storage' | 'neural' | 'analytics' | 'bandwidth';
  amount: number;
  units: number;
  timestamp: string;
  region?: string;
}

interface AnalyticalSystemProps {
  tenant?: string;
  isFullScreen?: boolean;
  onPopOut?: () => void;
  onToggleFullScreen?: () => void;
  height?: string;
}

export function AnalyticalSystem({
  tenant = 'all',
  isFullScreen = false,
  onPopOut,
  onToggleFullScreen,
  height = '600px'
}: AnalyticalSystemProps) {
  const [metrics, setMetrics] = useState<AnalyticalMetrics>({
    totalRevenue: 0,
    activeUsers: 0,
    systemLoad: 0,
    dataProcessed: 0,
    paygoUsage: 0,
    abeQueries: 0,
    tenantCount: 0,
    alertsCount: 0
  });

  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [abeQueries, setAbeQueries] = useState<ABEQuery[]>([]);
  const [paygoTransactions, setPaygoTransactions] = useState<PaygoTransaction[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>(tenant);
  const [timeRange, setTimeRange] = useState<string>('1h');
  const [isRealTime, setIsRealTime] = useState(true);
  const [activeView, setActiveView] = useState<string>('dashboard');

  const containerRef = useRef<HTMLDivElement>(null);

  // World/Service configurations for multi-tenant analytics
  const SERVICE_CONFIGS = {
    compute: {
      color: '#3b82f6',
      glyph: '🔹',
      name: 'Compute',
      description: 'Processing and computation services'
    },
    storage: {
      color: '#10b981',
      glyph: '💾',
      name: 'Storage',
      description: 'Data storage and retrieval'
    },
    neural: {
      color: '#ef4444',
      glyph: '🧠',
      name: 'Neural',
      description: 'AI and neural network processing'
    },
    analytics: {
      color: '#8b5cf6',
      glyph: '📊',
      name: 'Analytics',
      description: 'Data analytics and ABE queries'
    },
    bandwidth: {
      color: '#f59e0b',
      glyph: '📡',
      name: 'Bandwidth',
      description: 'Network and data transfer'
    }
  };

  // Generate mock analytical data
  const generateAnalyticalData = useCallback(() => {
    // Mock metrics
    setMetrics({
      totalRevenue: 124500.75,
      activeUsers: 1247,
      systemLoad: 0.73,
      dataProcessed: 2.4e12, // 2.4TB
      paygoUsage: 87250.25,
      abeQueries: 15420,
      tenantCount: 89,
      alertsCount: 3
    });

    // Mock tenants
    const mockTenants: TenantInfo[] = [
      {
        id: 'ctas_primary',
        name: 'CTAS Primary Operations',
        tier: 'enterprise',
        usage: 892.5,
        limit: 1000,
        cost: 15750.50,
        status: 'active',
        lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        id: 'laserlight',
        name: 'LaserLight Constellation',
        tier: 'pro',
        usage: 445.2,
        limit: 500,
        cost: 8250.25,
        status: 'active',
        lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString()
      },
      {
        id: 'axon_poc',
        name: 'AXON Neural Research',
        tier: 'custom',
        usage: 756.8,
        limit: 2000,
        cost: 22500.75,
        status: 'active',
        lastActivity: new Date(Date.now() - 1 * 60 * 1000).toISOString()
      },
      {
        id: 'ground_ops',
        name: 'Ground Station Operations',
        tier: 'pro',
        usage: 123.4,
        limit: 250,
        cost: 2750.00,
        status: 'trial',
        lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      }
    ];
    setTenants(mockTenants);

    // Mock ABE queries
    const mockAbeQueries: ABEQuery[] = [
      {
        id: 'abe_001',
        tenant: 'ctas_primary',
        query: 'SELECT satellite_health, link_quality FROM constellation WHERE status = active',
        executionTime: 1250,
        cost: 2.45,
        status: 'completed',
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        resultSize: 156789
      },
      {
        id: 'abe_002',
        tenant: 'laserlight',
        query: 'ANALYZE network_topology PREDICT optimal_routing',
        executionTime: 5670,
        cost: 12.75,
        status: 'running',
        timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        resultSize: 0
      },
      {
        id: 'abe_003',
        tenant: 'axon_poc',
        query: 'NEURAL_PROCESS cognitive_state CORRELATE decision_patterns',
        executionTime: 890,
        cost: 18.50,
        status: 'completed',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        resultSize: 892456
      }
    ];
    setAbeQueries(mockAbeQueries);

    // Mock PayGo transactions
    const mockPaygoTransactions: PaygoTransaction[] = [
      {
        id: 'paygo_001',
        tenant: 'ctas_primary',
        service: 'compute',
        amount: 125.50,
        units: 2510,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        region: 'us-west-2'
      },
      {
        id: 'paygo_002',
        tenant: 'laserlight',
        service: 'bandwidth',
        amount: 45.75,
        units: 1525,
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        region: 'global'
      },
      {
        id: 'paygo_003',
        tenant: 'axon_poc',
        service: 'neural',
        amount: 289.25,
        units: 578,
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        region: 'us-east-1'
      }
    ];
    setPaygoTransactions(mockPaygoTransactions);
  }, []);

  useEffect(() => {
    generateAnalyticalData();

    if (isRealTime) {
      const interval = setInterval(generateAnalyticalData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [generateAnalyticalData, isRealTime]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-gray-500';
      case 'pro': return 'bg-blue-500';
      case 'enterprise': return 'bg-purple-500';
      case 'custom': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'trial': return 'bg-yellow-500';
      case 'suspended': return 'bg-red-500';
      case 'overdue': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className={`flex h-full ${isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Analytical Glyph Rail */}
      <div className="w-16 bg-gray-900 border-r border-gray-700 flex flex-col items-center py-4 space-y-2">
        <div className="text-white text-xs font-mono mb-4">ANALYTICS</div>

        {/* Service filters */}
        {Object.entries(SERVICE_CONFIGS).map(([serviceKey, config]) => {
          const usage = paygoTransactions
            .filter(t => t.service === serviceKey)
            .reduce((sum, t) => sum + t.amount, 0);

          return (
            <button
              key={serviceKey}
              onClick={() => setActiveView(serviceKey)}
              className={`
                relative group w-12 h-12 rounded-lg border-2 transition-all duration-200
                ${activeView === serviceKey
                  ? 'border-white bg-white/10'
                  : 'border-gray-600 hover:border-gray-400'
                }
              `}
              style={{ borderColor: activeView === serviceKey ? config.color : undefined }}
            >
              <span className="text-lg">{config.glyph}</span>
              {usage > 0 && (
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs text-white flex items-center justify-center font-mono"
                  style={{ backgroundColor: config.color }}
                >
                  $
                </div>
              )}
              <div className="absolute left-16 top-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                {config.name}
              </div>
            </button>
          );
        })}

        <div className="border-t border-gray-700 w-8 my-2"></div>

        {/* Control buttons */}
        <button
          onClick={() => setActiveView('dashboard')}
          className={`w-12 h-12 rounded-lg border ${activeView === 'dashboard' ? 'border-white bg-white/10' : 'border-gray-600 hover:border-gray-400'} flex items-center justify-center text-white`}
        >
          <BarChart3 className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveView('abe')}
          className={`w-12 h-12 rounded-lg border ${activeView === 'abe' ? 'border-white bg-white/10' : 'border-gray-600 hover:border-gray-400'} flex items-center justify-center text-white`}
        >
          <Brain className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveView('paygo')}
          className={`w-12 h-12 rounded-lg border ${activeView === 'paygo' ? 'border-white bg-white/10' : 'border-gray-600 hover:border-gray-400'} flex items-center justify-center text-white`}
        >
          <CreditCard className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsRealTime(!isRealTime)}
          className="w-12 h-12 rounded-lg border border-gray-600 hover:border-gray-400 flex items-center justify-center text-white"
        >
          {isRealTime ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Analytics Area */}
      <div className="flex-1 flex flex-col">
        {/* Header Controls */}
        <div className="bg-gray-100 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                CTAS-7 Analytics Engine
                <Badge variant="outline" className="ml-2">
                  {tenants.length} tenants
                </Badge>
              </h2>
              <div className="flex items-center space-x-2">
                <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tenants</SelectItem>
                    {tenants.map(tenant => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="24h">24 Hours</SelectItem>
                    <SelectItem value="7d">7 Days</SelectItem>
                    <SelectItem value="30d">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant={isRealTime ? "default" : "secondary"}>
                {isRealTime ? 'Live' : 'Paused'}
              </Badge>
              {metrics.alertsCount > 0 && (
                <Badge variant="destructive" className="flex items-center">
                  <Bell className="w-3 h-3 mr-1" />
                  {metrics.alertsCount}
                </Badge>
              )}
              {onToggleFullScreen && (
                <Button variant="outline" size="sm" onClick={onToggleFullScreen}>
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              )}
              {onPopOut && (
                <Button variant="outline" size="sm" onClick={onPopOut}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeView === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Key Metrics Cards */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(metrics.totalRevenue)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">+12.5%</span>
                    <span className="text-gray-500 ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">+8.2%</span>
                    <span className="text-gray-500 ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">System Load</p>
                      <p className="text-2xl font-bold">{(metrics.systemLoad * 100).toFixed(1)}%</p>
                    </div>
                    <Activity className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <span className={`w-4 h-4 mr-1 ${metrics.systemLoad > 0.8 ? 'text-red-500' : 'text-green-500'}`}>
                      {metrics.systemLoad > 0.8 ? <TrendingUp /> : <TrendingDown />}
                    </span>
                    <span className={metrics.systemLoad > 0.8 ? 'text-red-600' : 'text-green-600'}>
                      {metrics.systemLoad > 0.8 ? 'High' : 'Normal'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Data Processed</p>
                      <p className="text-2xl font-bold">{formatBytes(metrics.dataProcessed)}</p>
                    </div>
                    <Database className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="flex items-center mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-600">+24.1%</span>
                    <span className="text-gray-500 ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tenant Analysis */}
          {(activeView === 'dashboard' || activeView === 'paygo') && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Multi-Tenant Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenants.map(tenant => (
                    <div key={tenant.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">{tenant.name}</h3>
                          <Badge className={getTierColor(tenant.tier)}>
                            {tenant.tier}
                          </Badge>
                          <Badge className={getStatusColor(tenant.status)}>
                            {tenant.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(tenant.cost)}</div>
                          <div className="text-xs text-gray-500">
                            {tenant.usage.toFixed(1)} / {tenant.limit} units
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${tenant.usage > tenant.limit * 0.9 ? 'bg-red-500' : tenant.usage > tenant.limit * 0.7 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(100, (tenant.usage / tenant.limit) * 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Last activity: {new Date(tenant.lastActivity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ABE Query Analysis */}
          {activeView === 'abe' && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  ABE (Analytics Business Engine) Queries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {abeQueries.map(query => (
                    <div key={query.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Badge className={query.status === 'running' ? 'bg-blue-500' : query.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}>
                            {query.status}
                          </Badge>
                          <span className="font-medium">{query.tenant}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(query.cost)}</div>
                          <div className="text-xs text-gray-500">
                            {query.executionTime}ms
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-100 p-2 rounded font-mono text-sm mb-2">
                        {query.query}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(query.timestamp).toLocaleString()}</span>
                        {query.resultSize > 0 && (
                          <span>Result: {formatBytes(query.resultSize)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* PayGo Transaction Analysis */}
          {activeView === 'paygo' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay-as-you-Go Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paygoTransactions.map(transaction => (
                    <div key={transaction.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">
                            {SERVICE_CONFIGS[transaction.service].glyph}
                          </span>
                          <div>
                            <div className="font-medium">{transaction.tenant}</div>
                            <div className="text-sm text-gray-500">
                              {SERVICE_CONFIGS[transaction.service].name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(transaction.amount)}</div>
                          <div className="text-xs text-gray-500">
                            {transaction.units} units
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(transaction.timestamp).toLocaleString()}</span>
                        {transaction.region && (
                          <Badge variant="outline">{transaction.region}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}