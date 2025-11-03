import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronRight,
  ChevronDown,
  Network,
  Database,
  Cpu,
  Satellite,
  Globe,
  Ship,
  Eye,
  Settings,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  RefreshCw,
  Filter,
  Download,
  Share,
  Layers,
  GitBranch,
  Boxes,
  Radio,
  Target,
  ExternalLink,
  Terminal,
  Monitor
} from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'network' | 'space' | 'ctas' | 'geographical' | 'maritime' | 'neural' | 'legion';
  world: string;
  position: { x: number; y: number; z: number };
  metadata: {
    status: 'online' | 'offline' | 'degraded' | 'critical';
    connections: number;
    load: number;
    tenant?: string;
    hash?: string;
    systemType?: 'supabase' | 'surrealdb' | 'neural-mux' | 'sled' | 'cesium' | 'legion-ecs';
    dashboardUrl?: string;
  };
  properties: Record<string, any>;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'data' | 'control' | 'neural' | 'quantum' | 'rf';
  weight: number;
  latency?: number;
  bandwidth?: number;
  status: 'active' | 'inactive' | 'congested' | 'failed';
}

interface GraphVisualizationProps {
  tenant?: string;
  world?: string;
  realTime?: boolean;
  height?: string;
}

export function GraphVisualization({
  tenant = 'default',
  world = 'all',
  realTime = true,
  height = '600px'
}: GraphVisualizationProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [filteredWorld, setFilteredWorld] = useState<string>(world);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPlaying, setIsPlaying] = useState(realTime);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [layerVisibility, setLayerVisibility] = useState({
    data: true,
    control: true,
    neural: true,
    quantum: true,
    rf: true,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // World configurations matching the Agent Factory pattern
  const WORLD_CONFIGS = {
    network: {
      color: '#3b82f6',
      glyph: '🌐',
      name: 'Network World',
      description: 'Cyber infrastructure and network topology'
    },
    space: {
      color: '#8b5cf6',
      glyph: '🛰️',
      name: 'Space World',
      description: 'Satellite constellation and orbital mechanics'
    },
    ctas: {
      color: '#10b981',
      glyph: '🎯',
      name: 'CTAS World',
      description: 'Cognitive Tactical Analysis System'
    },
    geographical: {
      color: '#f59e0b',
      glyph: '🌍',
      name: 'Geographical World',
      description: 'Terrestrial locations and geographic intelligence'
    },
    maritime: {
      color: '#06b6d4',
      glyph: '⚓',
      name: 'Maritime World',
      description: 'Naval operations and maritime domain'
    },
    neural: {
      color: '#ef4444',
      glyph: '🧠',
      name: 'Neural World',
      description: 'Neural networks and cognitive processing'
    },
    legion: {
      color: '#a855f7',
      glyph: '⚡',
      name: 'Legion World',
      description: 'Distributed slot graph and ECS systems'
    }
  };

  // System access configurations
  const SYSTEM_ACCESS = {
    supabase: {
      name: 'Supabase Dashboard',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL + '/dashboard',
      fallbackUrl: 'https://app.supabase.com',
      icon: <Database className="w-4 h-4" />,
      description: 'Supabase database management'
    },
    surrealdb: {
      name: 'SurrealDB Studio',
      url: 'http://localhost:58471/studio',
      fallbackUrl: 'http://localhost:58471',
      icon: <Terminal className="w-4 h-4" />,
      description: 'SurrealDB query interface'
    },
    'neural-mux': {
      name: 'Neural-Mux Monitor',
      url: 'http://localhost:50051/dashboard',
      fallbackUrl: 'http://localhost:50051',
      icon: <Cpu className="w-4 h-4" />,
      description: 'Neural multiplexer monitoring'
    },
    sled: {
      name: 'Sled KVS Admin',
      url: 'http://localhost:50059/admin',
      fallbackUrl: 'http://localhost:50059',
      icon: <Boxes className="w-4 h-4" />,
      description: 'Sled key-value store administration'
    },
    cesium: {
      name: 'Cesium Viewer',
      url: 'http://localhost:21575',
      fallbackUrl: 'http://localhost:21575',
      icon: <Globe className="w-4 h-4" />,
      description: 'Cesium 3D globe visualization'
    },
    'legion-ecs': {
      name: 'Legion ECS Monitor',
      url: 'http://localhost:50052/legion',
      fallbackUrl: 'http://localhost:50052',
      icon: <Network className="w-4 h-4" />,
      description: 'Legion entity component system monitoring'
    }
  };

  // Generate mock graph data with system access information
  const generateGraphData = useCallback(() => {
    const mockNodes: GraphNode[] = [
      {
        id: 'supabase_primary',
        label: 'Supabase Primary',
        type: 'network',
        world: 'network',
        position: { x: 0, y: 0, z: 0 },
        metadata: {
          status: 'online',
          connections: 24,
          load: 0.75,
          tenant: 'ctas_primary',
          hash: 'sch_supabase_001',
          systemType: 'supabase',
          dashboardUrl: SYSTEM_ACCESS.supabase.url
        },
        properties: {
          database: 'ctas7_primary',
          tables: '12',
          connections_pool: '20/50'
        }
      },
      {
        id: 'surrealdb_geo',
        label: 'SurrealDB Geo',
        type: 'geographical',
        world: 'geographical',
        position: { x: 150, y: 100, z: 25 },
        metadata: {
          status: 'online',
          connections: 8,
          load: 0.45,
          tenant: 'ctas_geo',
          hash: 'sch_surreal_geo_001',
          systemType: 'surrealdb',
          dashboardUrl: SYSTEM_ACCESS.surrealdb.url
        },
        properties: {
          namespace: 'ctas7',
          database: 'geo',
          records: '259 stations'
        }
      },
      {
        id: 'neural_mux_cluster',
        label: 'Neural-Mux Cluster',
        type: 'neural',
        world: 'neural',
        position: { x: -150, y: 100, z: -25 },
        metadata: {
          status: 'degraded',
          connections: 156,
          load: 0.89,
          tenant: 'axon_poc',
          hash: 'cuid_neural_001',
          systemType: 'neural-mux',
          dashboardUrl: SYSTEM_ACCESS['neural-mux'].url
        },
        properties: {
          processing_power: '2.4 TFLOPS',
          memory: '128GB',
          efficiency: '0.92'
        }
      },
      {
        id: 'sled_kvs_hash',
        label: 'Sled KVS Hash Store',
        type: 'ctas',
        world: 'ctas',
        position: { x: 75, y: -150, z: 80 },
        metadata: {
          status: 'critical',
          connections: 64,
          load: 0.95,
          tenant: 'hash_system',
          hash: 'uuid_sled_001',
          systemType: 'sled',
          dashboardUrl: SYSTEM_ACCESS.sled.url
        },
        properties: {
          keys: '1,024,000',
          compression: 'LZ4',
          fragmentation: '12%'
        }
      },
      {
        id: 'cesium_laserlight',
        label: 'Cesium LaserLight',
        type: 'space',
        world: 'space',
        position: { x: 200, y: -50, z: 120 },
        metadata: {
          status: 'online',
          connections: 12,
          load: 0.34,
          tenant: 'laserlight',
          hash: 'sch_cesium_001',
          systemType: 'cesium',
          dashboardUrl: SYSTEM_ACCESS.cesium.url
        },
        properties: {
          satellites: '12 active',
          coverage: 'Global',
          frame_rate: '60fps'
        }
      },
      {
        id: 'legion_ecs_system',
        label: 'Legion ECS Core',
        type: 'legion',
        world: 'legion',
        position: { x: -100, y: -100, z: -50 },
        metadata: {
          status: 'online',
          connections: 256,
          load: 0.67,
          tenant: 'distributed_ecs',
          hash: 'uuid_legion_ecs_001',
          systemType: 'legion-ecs',
          dashboardUrl: SYSTEM_ACCESS['legion-ecs'].url
        },
        properties: {
          entities: '65,536',
          systems: '128',
          slots: '4,096'
        }
      }
    ];

    const mockEdges: GraphEdge[] = [
      {
        id: 'edge_supabase_surreal',
        source: 'supabase_primary',
        target: 'surrealdb_geo',
        type: 'data',
        weight: 0.8,
        latency: 5,
        bandwidth: 1000,
        status: 'active'
      },
      {
        id: 'edge_supabase_neural',
        source: 'supabase_primary',
        target: 'neural_mux_cluster',
        type: 'neural',
        weight: 0.95,
        latency: 2,
        bandwidth: 10000,
        status: 'active'
      },
      {
        id: 'edge_neural_sled',
        source: 'neural_mux_cluster',
        target: 'sled_kvs_hash',
        type: 'data',
        weight: 0.75,
        latency: 1,
        bandwidth: 25000,
        status: 'congested'
      },
      {
        id: 'edge_cesium_supabase',
        source: 'cesium_laserlight',
        target: 'supabase_primary',
        type: 'data',
        weight: 0.67,
        latency: 15,
        bandwidth: 500,
        status: 'active'
      },
      {
        id: 'edge_legion_all',
        source: 'legion_ecs_system',
        target: 'neural_mux_cluster',
        type: 'control',
        weight: 0.89,
        latency: 3,
        bandwidth: 2000,
        status: 'active'
      }
    ];

    setNodes(mockNodes);
    setEdges(mockEdges);
  }, []);

  useEffect(() => {
    generateGraphData();
  }, [generateGraphData]);

  // Filter nodes by world and search term
  const filteredNodes = nodes.filter(node => {
    const worldMatch = filteredWorld === 'all' || node.world === filteredWorld;
    const searchMatch = !searchTerm ||
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.id.toLowerCase().includes(searchTerm.toLowerCase());
    return worldMatch && searchMatch;
  });

  const handleNodeSelect = (node: GraphNode) => {
    setSelectedNode(node);
    setIsDrawerOpen(true);
  };

  const handleSystemAccess = (node: GraphNode, event: React.MouseEvent) => {
    event.stopPropagation();

    if (node.metadata.systemType && SYSTEM_ACCESS[node.metadata.systemType]) {
      const systemConfig = SYSTEM_ACCESS[node.metadata.systemType];
      const targetUrl = node.metadata.dashboardUrl || systemConfig.url;

      // Open in new window/tab
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'data': return <Database className="w-3 h-3" />;
      case 'control': return <Settings className="w-3 h-3" />;
      case 'neural': return <Cpu className="w-3 h-3" />;
      case 'quantum': return <Target className="w-3 h-3" />;
      case 'rf': return <Radio className="w-3 h-3" />;
      default: return <Network className="w-3 h-3" />;
    }
  };

  return (
    <div className="flex h-full">
      {/* Glyph Rail - matching the satellite drawer style */}
      <div className="w-16 bg-gray-900 border-r border-gray-700 flex flex-col items-center py-4 space-y-2">
        <div className="text-white text-xs font-mono mb-4">GRAPH</div>

        {/* World filters with glyphs */}
        {Object.entries(WORLD_CONFIGS).map(([worldKey, config]) => {
          const nodeCount = nodes.filter(n => n.world === worldKey).length;
          return (
            <button
              key={worldKey}
              onClick={() => setFilteredWorld(filteredWorld === worldKey ? 'all' : worldKey)}
              className={`
                relative group w-12 h-12 rounded-lg border-2 transition-all duration-200
                ${filteredWorld === worldKey
                  ? 'border-white bg-white/10'
                  : 'border-gray-600 hover:border-gray-400'
                }
              `}
              style={{ borderColor: filteredWorld === worldKey ? config.color : undefined }}
            >
              <span className="text-lg">{config.glyph}</span>
              {nodeCount > 0 && (
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs text-white flex items-center justify-center font-mono"
                  style={{ backgroundColor: config.color }}
                >
                  {nodeCount}
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
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-12 h-12 rounded-lg border border-gray-600 hover:border-gray-400 flex items-center justify-center text-white"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <button
          onClick={() => {
            setZoom(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="w-12 h-12 rounded-lg border border-gray-600 hover:border-gray-400 flex items-center justify-center text-white"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setLayerVisibility({ ...layerVisibility })}
          className="w-12 h-12 rounded-lg border border-gray-600 hover:border-gray-400 flex items-center justify-center text-white"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 flex flex-col">
        {/* Header Controls */}
        <div className="bg-gray-100 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold flex items-center">
                <GitBranch className="w-5 h-5 mr-2" />
                CTAS-7 System Graph
                <Badge variant="outline" className="ml-2">
                  {filteredNodes.length} systems
                </Badge>
              </h2>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search systems..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant={isPlaying ? "default" : "secondary"}>
                {isPlaying ? 'Real-time' : 'Paused'}
              </Badge>
              <Badge variant="outline">
                Tenant: {tenant}
              </Badge>
            </div>
          </div>
        </div>

        {/* Graph Canvas with System Cards */}
        <div
          ref={containerRef}
          className="flex-1 relative bg-gray-50 overflow-hidden"
          style={{ height }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            width={800}
            height={600}
          />

          {/* System Cards with Direct Access */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-6 p-8">
              {filteredNodes.map((node) => {
                const config = WORLD_CONFIGS[node.type as keyof typeof WORLD_CONFIGS];
                const systemConfig = node.metadata.systemType ? SYSTEM_ACCESS[node.metadata.systemType] : null;

                return (
                  <Card
                    key={node.id}
                    className={`cursor-pointer transition-all hover:shadow-lg border-l-4 relative group`}
                    style={{ borderLeftColor: config.color }}
                    onClick={() => handleNodeSelect(node)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{config.glyph}</div>
                          <div className="flex-1">
                            <div className="font-medium">{node.label}</div>
                            <div className="text-sm text-gray-500">{node.id}</div>
                            <div className="flex items-center space-x-2 mt-2">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(node.metadata.status)}`} />
                              <span className="text-xs text-gray-600">{node.metadata.status}</span>
                              <Badge variant="outline" className="text-xs">
                                {node.metadata.connections} conn
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Direct System Access Gear Icon */}
                        {systemConfig && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleSystemAccess(node, e)}
                            title={`Open ${systemConfig.name}`}
                          >
                            <Settings className="w-4 h-4" />
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>

                      {/* System Type Badge */}
                      {node.metadata.systemType && (
                        <div className="mt-2 flex items-center space-x-2">
                          {SYSTEM_ACCESS[node.metadata.systemType]?.icon}
                          <span className="text-xs text-gray-600">
                            {SYSTEM_ACCESS[node.metadata.systemType]?.name}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Drawer System with System Access */}
      {isDrawerOpen && selectedNode && (
        <div className="w-96 bg-white border-l border-gray-200 shadow-xl flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center">
                <span className="text-xl mr-2">
                  {WORLD_CONFIGS[selectedNode.type as keyof typeof WORLD_CONFIGS].glyph}
                </span>
                {selectedNode.label}
              </h3>
              <div className="flex items-center space-x-2">
                {/* Direct System Access Button */}
                {selectedNode.metadata.systemType && SYSTEM_ACCESS[selectedNode.metadata.systemType] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleSystemAccess(selectedNode, e)}
                    className="flex items-center space-x-1"
                  >
                    {SYSTEM_ACCESS[selectedNode.metadata.systemType].icon}
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-1">{selectedNode.id}</div>
            {selectedNode.metadata.systemType && (
              <Badge variant="outline" className="mt-2">
                {SYSTEM_ACCESS[selectedNode.metadata.systemType]?.name}
              </Badge>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="connections">Connections</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="access">Access</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Health</span>
                        <Badge className={getStatusColor(selectedNode.metadata.status)}>
                          {selectedNode.metadata.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Load</span>
                        <span className="text-sm font-mono">
                          {(selectedNode.metadata.load * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Connections</span>
                        <span className="text-sm font-mono">
                          {selectedNode.metadata.connections}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">World</span>
                        <Badge style={{ backgroundColor: WORLD_CONFIGS[selectedNode.type as keyof typeof WORLD_CONFIGS].color }}>
                          {selectedNode.world}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Tenant</span>
                        <span className="text-sm font-mono">
                          {selectedNode.metadata.tenant}
                        </span>
                      </div>
                      {selectedNode.metadata.hash && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Hash</span>
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                            {selectedNode.metadata.hash}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="connections" className="space-y-4">
                <div className="space-y-2">
                  {edges
                    .filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id)
                    .map(edge => {
                      const connectedNodeId = edge.source === selectedNode.id ? edge.target : edge.source;
                      const connectedNode = nodes.find(n => n.id === connectedNodeId);
                      return (
                        <Card key={edge.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getConnectionIcon(edge.type)}
                              <span className="text-sm">{connectedNode?.label || connectedNodeId}</span>
                            </div>
                            <Badge variant={edge.status === 'active' ? 'default' : 'secondary'}>
                              {edge.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {edge.latency && `${edge.latency}ms`}
                            {edge.bandwidth && ` • ${edge.bandwidth}Mbps`}
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </TabsContent>

              <TabsContent value="properties" className="space-y-4">
                <div className="space-y-2">
                  {Object.entries(selectedNode.properties).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                      <span className="text-sm font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="access" className="space-y-4">
                {selectedNode.metadata.systemType && SYSTEM_ACCESS[selectedNode.metadata.systemType] ? (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Direct System Access</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            {SYSTEM_ACCESS[selectedNode.metadata.systemType].icon}
                            <span className="font-medium">
                              {SYSTEM_ACCESS[selectedNode.metadata.systemType].name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {SYSTEM_ACCESS[selectedNode.metadata.systemType].description}
                          </p>
                          <Button
                            onClick={(e) => handleSystemAccess(selectedNode, e)}
                            className="w-full"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open {SYSTEM_ACCESS[selectedNode.metadata.systemType].name}
                          </Button>
                          <div className="text-xs text-gray-500 font-mono">
                            {selectedNode.metadata.dashboardUrl || SYSTEM_ACCESS[selectedNode.metadata.systemType].url}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Monitor className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No direct system access available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}