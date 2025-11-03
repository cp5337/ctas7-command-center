import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Satellite,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Database,
  Network,
  Eye,
  Clock,
  Users,
  Target,
  Shield,
  Hash
} from 'lucide-react';

interface WASMInstance {
  id: string;
  name: string;
  port: number;
  status: 'running' | 'starting' | 'stopped' | 'error' | 'conflict';
  stationId: string;
  position: [number, number, number]; // lat, lon, alt
  health: {
    cpuUsage: number;
    memoryUsage: number;
    networkThroughput: number;
    errorRate: number;
    uptime: number;
  };
  operations: {
    active: ActiveOperation[];
    completed: number;
    failed: number;
  };
  dataFlow: {
    telemetryRate: number;
    commandsProcessed: number;
    duplicatesDetected: number;
    lastSync: string;
  };
  conflicts: ConflictReport[];
  trivariatehHash: string;
  lastHeartbeat: string;
}

interface ActiveOperation {
  id: string;
  type: 'laser_fire' | 'telemetry_burst' | 'attitude_adjust' | 'emergency';
  startTime: string;
  estimatedEndTime: string;
  target?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  exclusiveResources: string[];
  operatorId: string;
}

interface ConflictReport {
  conflictId: string;
  type: 'resource_conflict' | 'duplicate_operation' | 'timing_conflict' | 'target_overlap';
  severity: 'warning' | 'error' | 'critical';
  conflictingInstances: string[];
  conflictingOperations: string[];
  description: string;
  resolvedBy?: string;
  timestamp: string;
}

interface ConstellationHealth {
  totalInstances: number;
  healthyInstances: number;
  conflictingInstances: number;
  totalOperations: number;
  duplicateOperations: number;
  averageLatency: number;
  dataIntegrity: number;
}

export default function WASMConstellationMonitor() {
  const [wasmInstances, setWasmInstances] = useState<WASMInstance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'conflicts' | 'operations' | 'dataflow'>('grid');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [constellationHealth, setConstellationHealth] = useState<ConstellationHealth>({
    totalInstances: 0,
    healthyInstances: 0,
    conflictingInstances: 0,
    totalOperations: 0,
    duplicateOperations: 0,
    averageLatency: 0,
    dataIntegrity: 0
  });
  const [globalConflicts, setGlobalConflicts] = useState<ConflictReport[]>([]);

  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Initialize with simulated WASM constellation data
    initializeWASMConstellation();

    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        updateWASMData();
        detectConflicts();
      }, 2000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh]);

  const initializeWASMConstellation = () => {
    const instances: WASMInstance[] = [];

    // Create 100 WASM ground station instances (ports 7000-7099)
    for (let i = 0; i < 100; i++) {
      const stationIndex = i + 1;
      const instance: WASMInstance = {
        id: `wasm_gs_${stationIndex.toString().padStart(3, '0')}`,
        name: `WASM Ground Station ${stationIndex}`,
        port: 7000 + i,
        status: getRandomStatus(),
        stationId: `GS-${stationIndex.toString().padStart(3, '0')}`,
        position: [
          -90 + Math.random() * 180, // Random latitude
          -180 + Math.random() * 360, // Random longitude
          Math.random() * 1000 // Random altitude up to 1km
        ],
        health: {
          cpuUsage: 10 + Math.random() * 80,
          memoryUsage: 20 + Math.random() * 60,
          networkThroughput: Math.random() * 1000,
          errorRate: Math.random() * 0.1,
          uptime: Math.random() * 86400 // Up to 24 hours
        },
        operations: {
          active: generateRandomOperations(),
          completed: Math.floor(Math.random() * 1000),
          failed: Math.floor(Math.random() * 50)
        },
        dataFlow: {
          telemetryRate: 1 + Math.random() * 10,
          commandsProcessed: Math.floor(Math.random() * 500),
          duplicatesDetected: Math.floor(Math.random() * 5),
          lastSync: new Date(Date.now() - Math.random() * 60000).toISOString()
        },
        conflicts: [],
        trivariatehHash: generateTrivariatehHash(`GS-${stationIndex}`, i),
        lastHeartbeat: new Date().toISOString()
      };

      instances.push(instance);
    }

    setWasmInstances(instances);
    updateConstellationHealth(instances);
  };

  const getRandomStatus = (): WASMInstance['status'] => {
    const rand = Math.random();
    if (rand < 0.7) return 'running';
    if (rand < 0.85) return 'starting';
    if (rand < 0.95) return 'stopped';
    return 'error';
  };

  const generateRandomOperations = (): ActiveOperation[] => {
    const operations: ActiveOperation[] = [];
    const numOps = Math.floor(Math.random() * 3); // 0-2 active operations per instance

    for (let i = 0; i < numOps; i++) {
      const startTime = new Date(Date.now() - Math.random() * 300000);
      const duration = 30000 + Math.random() * 600000; // 30s to 10min

      operations.push({
        id: `op_${Date.now()}_${i}`,
        type: ['laser_fire', 'telemetry_burst', 'attitude_adjust', 'emergency'][Math.floor(Math.random() * 4)] as any,
        startTime: startTime.toISOString(),
        estimatedEndTime: new Date(startTime.getTime() + duration).toISOString(),
        target: Math.random() > 0.5 ? `SAT_${Math.floor(Math.random() * 12) + 1}` : undefined,
        priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
        exclusiveResources: ['laser_system', 'attitude_control', 'power_system'].slice(0, Math.floor(Math.random() * 3) + 1),
        operatorId: `OP_${Math.floor(Math.random() * 10) + 1}`
      });
    }

    return operations;
  };

  const generateTrivariatehHash = (stationId: string, index: number): string => {
    // Simulate trivariate hash: SCH + CUID + UUID
    const sch = `SCH${index.toString(16).padStart(4, '0')}`;
    const cuid = `CUID${(stationId.charCodeAt(3) * 1000 + index).toString(16).padStart(4, '0')}`;
    const uuid = `UUID${Math.random().toString(16).substr(2, 8)}`;
    return `${sch}${cuid}${uuid}`.toUpperCase();
  };

  const updateWASMData = () => {
    setWasmInstances(prev => prev.map(instance => ({
      ...instance,
      health: {
        ...instance.health,
        cpuUsage: Math.max(0, Math.min(100, instance.health.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, instance.health.memoryUsage + (Math.random() - 0.5) * 5)),
        networkThroughput: Math.max(0, instance.health.networkThroughput + (Math.random() - 0.5) * 100),
        errorRate: Math.max(0, Math.min(1, instance.health.errorRate + (Math.random() - 0.5) * 0.01)),
        uptime: instance.health.uptime + 2 // Add 2 seconds
      },
      dataFlow: {
        ...instance.dataFlow,
        telemetryRate: Math.max(0, instance.dataFlow.telemetryRate + (Math.random() - 0.5) * 2),
        commandsProcessed: instance.dataFlow.commandsProcessed + Math.floor(Math.random() * 3),
        duplicatesDetected: instance.dataFlow.duplicatesDetected + (Math.random() < 0.05 ? 1 : 0),
        lastSync: new Date().toISOString()
      },
      lastHeartbeat: new Date().toISOString()
    })));
  };

  const detectConflicts = () => {
    const allInstances = wasmInstances;
    const conflicts: ConflictReport[] = [];

    // Check for duplicate operations across instances
    const allOperations = allInstances.flatMap(instance =>
      instance.operations.active.map(op => ({ ...op, instanceId: instance.id }))
    );

    // Group operations by type and target
    const operationGroups = allOperations.reduce((groups, op) => {
      const key = `${op.type}_${op.target || 'no_target'}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(op);
      return groups;
    }, {} as Record<string, any[]>);

    // Detect conflicts
    Object.entries(operationGroups).forEach(([key, ops]) => {
      if (ops.length > 1) {
        // Check for laser firing conflicts
        if (key.startsWith('laser_fire')) {
          conflicts.push({
            conflictId: `LASER_CONFLICT_${Date.now()}`,
            type: 'duplicate_operation',
            severity: 'critical',
            conflictingInstances: ops.map(op => op.instanceId),
            conflictingOperations: ops.map(op => op.id),
            description: `Multiple laser firing operations detected for ${key.split('_')[2] || 'same target'}`,
            timestamp: new Date().toISOString()
          });
        }

        // Check for resource conflicts
        if (ops.some(op => op.exclusiveResources.length > 0)) {
          conflicts.push({
            conflictId: `RESOURCE_CONFLICT_${Date.now()}`,
            type: 'resource_conflict',
            severity: 'error',
            conflictingInstances: ops.map(op => op.instanceId),
            conflictingOperations: ops.map(op => op.id),
            description: `Resource conflict detected: ${ops[0].exclusiveResources.join(', ')}`,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    setGlobalConflicts(conflicts);

    // Update instance-specific conflicts
    setWasmInstances(prev => prev.map(instance => {
      const instanceConflicts = conflicts.filter(conflict =>
        conflict.conflictingInstances.includes(instance.id)
      );

      return {
        ...instance,
        conflicts: instanceConflicts,
        status: instanceConflicts.some(c => c.severity === 'critical') ? 'conflict' : instance.status
      };
    }));

    updateConstellationHealth(wasmInstances);
  };

  const updateConstellationHealth = (instances: WASMInstance[]) => {
    const totalInstances = instances.length;
    const healthyInstances = instances.filter(i => i.status === 'running' && i.conflicts.length === 0).length;
    const conflictingInstances = instances.filter(i => i.conflicts.length > 0).length;
    const totalOperations = instances.reduce((sum, i) => sum + i.operations.active.length, 0);
    const duplicateOperations = globalConflicts.filter(c => c.type === 'duplicate_operation').length;
    const averageLatency = instances.reduce((sum, i) => sum + i.health.networkThroughput, 0) / totalInstances;
    const dataIntegrity = ((totalInstances - conflictingInstances) / totalInstances) * 100;

    setConstellationHealth({
      totalInstances,
      healthyInstances,
      conflictingInstances,
      totalOperations,
      duplicateOperations,
      averageLatency,
      dataIntegrity
    });
  };

  const resolveConflict = (conflictId: string, instanceId: string) => {
    setGlobalConflicts(prev => prev.map(conflict =>
      conflict.conflictId === conflictId
        ? { ...conflict, resolvedBy: `AUTO_RESOLVER_${instanceId}` }
        : conflict
    ));

    setWasmInstances(prev => prev.map(instance => ({
      ...instance,
      conflicts: instance.conflicts.filter(c => c.conflictId !== conflictId)
    })));
  };

  const getStatusColor = (status: WASMInstance['status']) => {
    switch (status) {
      case 'running': return 'text-green-500';
      case 'starting': return 'text-yellow-500';
      case 'stopped': return 'text-gray-500';
      case 'error': return 'text-red-500';
      case 'conflict': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const selectedInstanceData = wasmInstances.find(i => i.id === selectedInstance);

  return (
    <div className="p-6 space-y-6">
      {/* Constellation Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            WASM Constellation Health Overview
            <Badge variant={autoRefresh ? "default" : "secondary"} className="ml-auto">
              {autoRefresh ? "Live" : "Static"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{constellationHealth.totalInstances}</div>
              <div className="text-sm text-gray-500">Total WASM</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{constellationHealth.healthyInstances}</div>
              <div className="text-sm text-gray-500">Healthy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{constellationHealth.conflictingInstances}</div>
              <div className="text-sm text-gray-500">Conflicts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{constellationHealth.totalOperations}</div>
              <div className="text-sm text-gray-500">Active Ops</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{constellationHealth.duplicateOperations}</div>
              <div className="text-sm text-gray-500">Duplicates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{constellationHealth.averageLatency.toFixed(1)}ms</div>
              <div className="text-sm text-gray-500">Avg Latency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{constellationHealth.dataIntegrity.toFixed(1)}%</div>
              <div className="text-sm text-gray-500">Data Integrity</div>
            </div>
          </div>

          {/* Global Conflict Alerts */}
          {globalConflicts.length > 0 && (
            <Alert className="mt-4 border-red-500 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium text-red-700 mb-2">
                  🚨 {globalConflicts.length} Active Conflict(s) Detected
                </div>
                <div className="space-y-1 text-sm">
                  {globalConflicts.slice(0, 3).map(conflict => (
                    <div key={conflict.conflictId} className="text-red-600">
                      • {conflict.description} ({conflict.conflictingInstances.length} instances)
                    </div>
                  ))}
                  {globalConflicts.length > 3 && (
                    <div className="text-red-600">• ... and {globalConflicts.length - 3} more</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* View Mode Controls */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          onClick={() => setViewMode('grid')}
          className="flex items-center gap-2"
        >
          <Database className="h-4 w-4" />
          Instance Grid
        </Button>
        <Button
          variant={viewMode === 'conflicts' ? 'default' : 'outline'}
          onClick={() => setViewMode('conflicts')}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4" />
          Conflicts ({globalConflicts.length})
        </Button>
        <Button
          variant={viewMode === 'operations' ? 'default' : 'outline'}
          onClick={() => setViewMode('operations')}
          className="flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          Operations
        </Button>
        <Button
          variant={viewMode === 'dataflow' ? 'default' : 'outline'}
          onClick={() => setViewMode('dataflow')}
          className="flex items-center gap-2"
        >
          <Network className="h-4 w-4" />
          Data Flow
        </Button>
        <Button
          variant={autoRefresh ? 'default' : 'outline'}
          onClick={() => setAutoRefresh(!autoRefresh)}
          className="flex items-center gap-2 ml-auto"
        >
          <Clock className="h-4 w-4" />
          {autoRefresh ? 'Pause' : 'Resume'}
        </Button>
      </div>

      {/* Content Based on View Mode */}
      {viewMode === 'grid' && (
        <Card>
          <CardHeader>
            <CardTitle>WASM Instance Grid View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {wasmInstances.map(instance => (
                <div
                  key={instance.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedInstance === instance.id
                      ? 'border-blue-500 bg-blue-50'
                      : instance.conflicts.length > 0
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedInstance(instance.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-sm">{instance.name}</div>
                      <div className="text-xs text-gray-500">Port {instance.port}</div>
                    </div>
                    <Badge variant={instance.status === 'running' ? 'default' : 'destructive'}>
                      {instance.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>CPU:</span>
                      <span className={instance.health.cpuUsage > 80 ? 'text-red-500' : 'text-green-500'}>
                        {instance.health.cpuUsage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ops:</span>
                      <span>{instance.operations.active.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conflicts:</span>
                      <span className={instance.conflicts.length > 0 ? 'text-red-500' : 'text-green-500'}>
                        {instance.conflicts.length}
                      </span>
                    </div>
                  </div>

                  {instance.conflicts.length > 0 && (
                    <div className="mt-2 text-xs text-red-600">
                      🚨 {instance.conflicts[0].type.replace('_', ' ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'conflicts' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Conflict Detection & Resolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {globalConflicts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  No conflicts detected across the constellation
                </div>
              ) : (
                globalConflicts.map(conflict => (
                  <div key={conflict.conflictId} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-red-700">{conflict.type.replace('_', ' ').toUpperCase()}</div>
                        <div className="text-sm text-red-600">{conflict.description}</div>
                      </div>
                      <Badge variant="destructive">{conflict.severity}</Badge>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      <div>Affected Instances: {conflict.conflictingInstances.join(', ')}</div>
                      <div>Time: {new Date(conflict.timestamp).toLocaleTimeString()}</div>
                    </div>

                    {!conflict.resolvedBy && (
                      <Button
                        size="sm"
                        onClick={() => resolveConflict(conflict.conflictId, conflict.conflictingInstances[0])}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Auto-Resolve
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'operations' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Active Operations Across Constellation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {wasmInstances
                .filter(instance => instance.operations.active.length > 0)
                .map(instance => (
                  <div key={instance.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="font-medium mb-2">{instance.name}</div>
                    <div className="space-y-2">
                      {instance.operations.active.map(operation => (
                        <div key={operation.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-sm">{operation.type.replace('_', ' ').toUpperCase()}</div>
                            <div className="text-xs text-gray-500">
                              {operation.target && `Target: ${operation.target} • `}
                              Priority: {operation.priority}
                            </div>
                          </div>
                          <Badge variant={operation.priority === 'critical' ? 'destructive' : 'default'}>
                            {operation.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'dataflow' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Independent WASM Data Flow Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-4">Data Flow Statistics</h3>
                <div className="space-y-4">
                  {wasmInstances.slice(0, 10).map(instance => (
                    <div key={instance.id} className="border border-gray-200 rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium text-sm">{instance.name}</div>
                        <Badge variant={instance.dataFlow.duplicatesDetected > 0 ? 'destructive' : 'default'}>
                          {instance.dataFlow.telemetryRate.toFixed(1)} Hz
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Commands: {instance.dataFlow.commandsProcessed}</div>
                        <div>Duplicates: {instance.dataFlow.duplicatesDetected}</div>
                        <div>Hash: {instance.trivariatehHash.substring(0, 12)}...</div>
                        <div>Sync: {new Date(instance.dataFlow.lastSync).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Real-time Data Flow</h3>
                <div className="bg-gray-50 rounded p-4 font-mono text-xs max-h-64 overflow-y-auto">
                  {wasmInstances
                    .filter(instance => instance.status === 'running')
                    .slice(0, 20)
                    .map(instance => (
                      <div key={instance.id} className="mb-1">
                        <span className="text-blue-600">{instance.id}</span>
                        <span className="text-gray-500"> → </span>
                        <span className="text-green-600">TEL:{instance.dataFlow.telemetryRate.toFixed(1)}</span>
                        <span className="text-gray-500"> | </span>
                        <span className="text-purple-600">CMD:{instance.dataFlow.commandsProcessed}</span>
                        {instance.dataFlow.duplicatesDetected > 0 && (
                          <span className="text-red-600"> | DUP:{instance.dataFlow.duplicatesDetected}</span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Instance Details */}
      {selectedInstanceData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detailed View: {selectedInstanceData.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-4">Health Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>CPU Usage:</span>
                    <span className={selectedInstanceData.health.cpuUsage > 80 ? 'text-red-500' : 'text-green-500'}>
                      {selectedInstanceData.health.cpuUsage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory:</span>
                    <span>{selectedInstanceData.health.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span>{selectedInstanceData.health.networkThroughput.toFixed(1)} Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate:</span>
                    <span className={selectedInstanceData.health.errorRate > 0.05 ? 'text-red-500' : 'text-green-500'}>
                      {(selectedInstanceData.health.errorRate * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span>{Math.floor(selectedInstanceData.health.uptime / 3600)}h {Math.floor((selectedInstanceData.health.uptime % 3600) / 60)}m</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Operations</h3>
                <div className="space-y-2">
                  {selectedInstanceData.operations.active.length === 0 ? (
                    <div className="text-gray-500 text-sm">No active operations</div>
                  ) : (
                    selectedInstanceData.operations.active.map(op => (
                      <div key={op.id} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="font-medium">{op.type.replace('_', ' ')}</div>
                        <div className="text-xs text-gray-500">
                          {op.target && `Target: ${op.target} • `}
                          Priority: {op.priority}
                        </div>
                      </div>
                    ))
                  )}
                  <div className="mt-4 text-xs text-gray-500">
                    Completed: {selectedInstanceData.operations.completed} |
                    Failed: {selectedInstanceData.operations.failed}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">Conflicts & Hash</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium">Trivariate Hash:</div>
                    <div className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                      {selectedInstanceData.trivariatehHash}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium">Conflicts:</div>
                    {selectedInstanceData.conflicts.length === 0 ? (
                      <div className="text-green-600 text-sm">✓ No conflicts</div>
                    ) : (
                      <div className="space-y-1">
                        {selectedInstanceData.conflicts.map(conflict => (
                          <div key={conflict.conflictId} className="text-red-600 text-sm">
                            • {conflict.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-medium">Last Heartbeat:</div>
                    <div className="text-xs text-gray-500">
                      {new Date(selectedInstanceData.lastHeartbeat).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}