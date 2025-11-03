import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Satellite,
  Target,
  Zap,
  Shield,
  AlertTriangle,
  Lock,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Activity
} from 'lucide-react';

interface SatelliteCommand {
  id: string;
  satelliteId: string;
  commandType: 'laser_fire' | 'attitude_adjust' | 'power_cycle' | 'emergency_shutdown' | 'orbit_maneuver';
  operator: string;
  timestamp: string;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
  conflictCheckPassed: boolean;
  requiredAuthorizations: string[];
  receivedAuthorizations: string[];
  safetyLockout: boolean;
  estimatedDuration: number; // seconds
  priority: 'routine' | 'high' | 'critical' | 'emergency';
}

interface ActiveOperations {
  [satelliteId: string]: {
    commandId: string;
    commandType: string;
    operator: string;
    startTime: string;
    estimatedEndTime: string;
    lockoutResources: string[];
  }
}

interface SatelliteStatus {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'offline' | 'emergency';
  position: [number, number, number]; // lat, lon, alt
  laserStatus: 'ready' | 'firing' | 'charging' | 'maintenance' | 'offline';
  powerLevel: number;
  operationalMode: 'autonomous' | 'manual' | 'emergency' | 'maintenance';
  lastCommand: string;
  lockoutUntil?: string;
}

interface ConflictRule {
  resource: string;
  conflictsWith: string[];
  maxConcurrent: number;
  requiresExclusiveAccess: boolean;
}

const CONFLICT_RULES: ConflictRule[] = [
  {
    resource: 'laser_system',
    conflictsWith: ['power_cycle', 'maintenance', 'emergency_shutdown'],
    maxConcurrent: 1,
    requiresExclusiveAccess: true
  },
  {
    resource: 'attitude_control',
    conflictsWith: ['orbit_maneuver', 'emergency_shutdown'],
    maxConcurrent: 1,
    requiresExclusiveAccess: true
  },
  {
    resource: 'power_system',
    conflictsWith: ['power_cycle'],
    maxConcurrent: 1,
    requiresExclusiveAccess: false
  }
];

export default function SatelliteControlCenter() {
  const [satellites, setSatellites] = useState<SatelliteStatus[]>([]);
  const [activeCommands, setActiveCommands] = useState<SatelliteCommand[]>([]);
  const [activeOperations, setActiveOperations] = useState<ActiveOperations>({});
  const [selectedSatellite, setSelectedSatellite] = useState<string>('');
  const [operatorId] = useState('OPERATOR_001'); // In real app, get from auth
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [conflictAlerts, setConflictAlerts] = useState<string[]>([]);

  const commandQueueRef = useRef<SatelliteCommand[]>([]);

  useEffect(() => {
    // Initialize with sample satellites
    setSatellites([
      {
        id: 'LASERLIGHT_MEO_01',
        name: 'LaserLight MEO-1',
        status: 'operational',
        position: [35.0, -120.0, 12000],
        laserStatus: 'ready',
        powerLevel: 95,
        operationalMode: 'autonomous',
        lastCommand: 'status_check'
      },
      {
        id: 'LASERLIGHT_MEO_02',
        name: 'LaserLight MEO-2',
        status: 'operational',
        position: [45.0, -90.0, 12000],
        laserStatus: 'ready',
        powerLevel: 87,
        operationalMode: 'manual',
        lastCommand: 'laser_calibration'
      },
      {
        id: 'LASERLIGHT_MEO_03',
        name: 'LaserLight MEO-3',
        status: 'degraded',
        position: [25.0, -75.0, 12000],
        laserStatus: 'maintenance',
        powerLevel: 45,
        operationalMode: 'maintenance',
        lastCommand: 'power_reduction',
        lockoutUntil: new Date(Date.now() + 1800000).toISOString() // 30 min lockout
      }
    ]);
  }, []);

  // Process coordination system - prevents duplicate critical operations
  const checkCommandConflicts = (command: SatelliteCommand): {
    hasConflicts: boolean;
    conflicts: string[];
    canProceed: boolean;
  } => {
    const conflicts: string[] = [];
    const satellite = satellites.find(s => s.id === command.satelliteId);

    if (!satellite) {
      return { hasConflicts: true, conflicts: ['Satellite not found'], canProceed: false };
    }

    // Check if satellite is in lockout period
    if (satellite.lockoutUntil && new Date(satellite.lockoutUntil) > new Date()) {
      conflicts.push(`Satellite locked until ${new Date(satellite.lockoutUntil).toLocaleTimeString()}`);
    }

    // Check for active operations on same satellite
    const activeOp = activeOperations[command.satelliteId];
    if (activeOp) {
      const resourceConflicts = CONFLICT_RULES.find(rule =>
        rule.resource === getCommandResource(command.commandType) &&
        rule.conflictsWith.includes(activeOp.commandType)
      );

      if (resourceConflicts) {
        conflicts.push(`Conflicts with active ${activeOp.commandType} by ${activeOp.operator}`);
      }
    }

    // Check for laser firing conflicts across the constellation
    if (command.commandType === 'laser_fire') {
      const otherLaserOps = Object.values(activeOperations).filter(op =>
        op.commandType === 'laser_fire' && op.commandId !== command.id
      );

      if (otherLaserOps.length > 0) {
        conflicts.push(`Another laser operation active (${otherLaserOps[0].operator})`);
      }

      // Check target coordination to prevent cross-fire
      if (isLaserTargetConflict(command, activeOperations)) {
        conflicts.push('Laser target area conflict detected');
      }
    }

    // Emergency commands can override most conflicts
    const canProceed = command.priority === 'emergency' || conflicts.length === 0;

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      canProceed
    };
  };

  const getCommandResource = (commandType: string): string => {
    switch (commandType) {
      case 'laser_fire': return 'laser_system';
      case 'attitude_adjust': return 'attitude_control';
      case 'orbit_maneuver': return 'attitude_control';
      case 'power_cycle': return 'power_system';
      default: return 'general';
    }
  };

  const isLaserTargetConflict = (command: SatelliteCommand, operations: ActiveOperations): boolean => {
    // In a real system, this would check actual target coordinates
    // For demo, assume conflict if multiple laser operations in same time window
    return Object.values(operations).some(op =>
      op.commandType === 'laser_fire' &&
      new Date(op.estimatedEndTime) > new Date()
    );
  };

  const executeCommand = async (commandType: string, priority: 'routine' | 'high' | 'critical' | 'emergency' = 'routine') => {
    if (!selectedSatellite) {
      alert('Please select a satellite first');
      return;
    }

    const command: SatelliteCommand = {
      id: `CMD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      satelliteId: selectedSatellite,
      commandType: commandType as any,
      operator: operatorId,
      timestamp: new Date().toISOString(),
      status: 'pending',
      conflictCheckPassed: false,
      requiredAuthorizations: priority === 'emergency' ? ['EMERGENCY_AUTH'] :
                            priority === 'critical' ? ['SUPERVISOR_AUTH'] : [],
      receivedAuthorizations: [],
      safetyLockout: false,
      estimatedDuration: getCommandDuration(commandType),
      priority
    };

    // Critical safety check - prevent duplicate operations
    const conflictCheck = checkCommandConflicts(command);

    if (!conflictCheck.canProceed) {
      setConflictAlerts(prev => [...prev,
        `🚨 COMMAND BLOCKED: ${conflictCheck.conflicts.join(', ')}`
      ]);
      return;
    }

    command.conflictCheckPassed = conflictCheck.canProceed;

    // Add to command queue
    setActiveCommands(prev => [...prev, command]);
    commandQueueRef.current.push(command);

    // For high-risk operations, require confirmation
    if (['laser_fire', 'emergency_shutdown', 'orbit_maneuver'].includes(commandType)) {
      const confirmed = confirm(
        `⚠️ CONFIRM HIGH-RISK OPERATION\n\n` +
        `Command: ${commandType.toUpperCase()}\n` +
        `Satellite: ${satellites.find(s => s.id === selectedSatellite)?.name}\n` +
        `Operator: ${operatorId}\n` +
        `Conflicts: ${conflictCheck.conflicts.length > 0 ? conflictCheck.conflicts.join(', ') : 'None'}\n\n` +
        `Do you want to proceed?`
      );

      if (!confirmed) {
        setActiveCommands(prev => prev.filter(cmd => cmd.id !== command.id));
        return;
      }
    }

    // Execute the command
    await processCommand(command);
  };

  const processCommand = async (command: SatelliteCommand) => {
    try {
      // Update command status
      setActiveCommands(prev =>
        prev.map(cmd => cmd.id === command.id ? { ...cmd, status: 'executing' } : cmd)
      );

      // Add to active operations (prevents conflicts)
      const endTime = new Date(Date.now() + command.estimatedDuration * 1000);
      setActiveOperations(prev => ({
        ...prev,
        [command.satelliteId]: {
          commandId: command.id,
          commandType: command.commandType,
          operator: command.operator,
          startTime: new Date().toISOString(),
          estimatedEndTime: endTime.toISOString(),
          lockoutResources: [getCommandResource(command.commandType)]
        }
      }));

      // Update satellite status
      setSatellites(prev => prev.map(sat =>
        sat.id === command.satelliteId
          ? {
              ...sat,
              lastCommand: command.commandType,
              laserStatus: command.commandType === 'laser_fire' ? 'firing' : sat.laserStatus,
              operationalMode: command.commandType === 'emergency_shutdown' ? 'emergency' : sat.operationalMode
            }
          : sat
      ));

      // Simulate command execution
      console.log(`🛰️ Executing ${command.commandType} on ${command.satelliteId}`);
      await new Promise(resolve => setTimeout(resolve, command.estimatedDuration * 100)); // Sped up for demo

      // Complete command
      setActiveCommands(prev =>
        prev.map(cmd => cmd.id === command.id ? { ...cmd, status: 'completed' } : cmd)
      );

      // Remove from active operations
      setActiveOperations(prev => {
        const updated = { ...prev };
        delete updated[command.satelliteId];
        return updated;
      });

      // Reset satellite status
      setSatellites(prev => prev.map(sat =>
        sat.id === command.satelliteId
          ? {
              ...sat,
              laserStatus: command.commandType === 'laser_fire' ? 'ready' : sat.laserStatus,
              operationalMode: sat.operationalMode === 'emergency' ? 'autonomous' : sat.operationalMode
            }
          : sat
      ));

    } catch (error) {
      console.error('Command execution failed:', error);
      setActiveCommands(prev =>
        prev.map(cmd => cmd.id === command.id ? { ...cmd, status: 'failed' } : cmd)
      );
    }
  };

  const getCommandDuration = (commandType: string): number => {
    switch (commandType) {
      case 'laser_fire': return 30; // 30 seconds
      case 'attitude_adjust': return 120; // 2 minutes
      case 'power_cycle': return 300; // 5 minutes
      case 'emergency_shutdown': return 60; // 1 minute
      case 'orbit_maneuver': return 1800; // 30 minutes
      default: return 60;
    }
  };

  const emergencyShutdownAll = () => {
    if (!confirm('🚨 EMERGENCY SHUTDOWN ALL SATELLITES?\n\nThis will immediately halt all operations!')) {
      return;
    }

    satellites.forEach(satellite => {
      if (satellite.status === 'operational') {
        executeCommand('emergency_shutdown', 'emergency');
      }
    });

    setEmergencyMode(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'offline': return 'text-red-500';
      case 'emergency': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getLaserStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-500';
      case 'firing': return 'text-red-500 animate-pulse';
      case 'charging': return 'text-yellow-500';
      case 'maintenance': return 'text-gray-500';
      case 'offline': return 'text-red-700';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Emergency Alert System */}
      {conflictAlerts.length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {conflictAlerts.map((alert, index) => (
                <div key={index} className="text-red-700 font-medium">{alert}</div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConflictAlerts([])}
                className="mt-2"
              >
                Clear Alerts
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Emergency Controls */}
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Shield className="h-5 w-5" />
            Emergency Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant="destructive"
              onClick={emergencyShutdownAll}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Emergency Shutdown All
            </Button>
            <Badge variant={emergencyMode ? "destructive" : "secondary"}>
              {emergencyMode ? "EMERGENCY MODE ACTIVE" : "Normal Operations"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Satellite Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            Satellite Constellation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {satellites.map(satellite => (
              <div
                key={satellite.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedSatellite === satellite.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedSatellite(satellite.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{satellite.name}</h3>
                  <Badge variant={satellite.status === 'operational' ? 'default' : 'destructive'}>
                    {satellite.status}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Laser:</span>
                    <span className={getLaserStatusColor(satellite.laserStatus)}>
                      {satellite.laserStatus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Power:</span>
                    <span>{satellite.powerLevel}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mode:</span>
                    <span>{satellite.operationalMode}</span>
                  </div>
                  {satellite.lockoutUntil && (
                    <div className="flex items-center gap-1 text-red-600">
                      <Lock className="h-3 w-3" />
                      <span>Locked until {new Date(satellite.lockoutUntil).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>

                {/* Active Operation Indicator */}
                {activeOperations[satellite.id] && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>Active: {activeOperations[satellite.id].commandType}</span>
                    </div>
                    <div>By: {activeOperations[satellite.id].operator}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Command Center */}
      {selectedSatellite && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Command Center - {satellites.find(s => s.id === selectedSatellite)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Button
                onClick={() => executeCommand('laser_fire', 'critical')}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                disabled={!!activeOperations[selectedSatellite]}
              >
                <Zap className="h-4 w-4" />
                Fire Laser
              </Button>

              <Button
                onClick={() => executeCommand('attitude_adjust', 'high')}
                variant="outline"
                disabled={!!activeOperations[selectedSatellite]}
              >
                <Target className="h-4 w-4" />
                Adjust Attitude
              </Button>

              <Button
                onClick={() => executeCommand('orbit_maneuver', 'high')}
                variant="outline"
                disabled={!!activeOperations[selectedSatellite]}
              >
                <Satellite className="h-4 w-4" />
                Orbit Maneuver
              </Button>

              <Button
                onClick={() => executeCommand('power_cycle', 'routine')}
                variant="outline"
                disabled={!!activeOperations[selectedSatellite]}
              >
                Power Cycle
              </Button>

              <Button
                onClick={() => executeCommand('emergency_shutdown', 'emergency')}
                variant="destructive"
              >
                <AlertTriangle className="h-4 w-4" />
                Emergency Stop
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Commands Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Command History & Active Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activeCommands.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No commands executed</p>
            ) : (
              activeCommands.slice(-10).reverse().map(command => (
                <div key={command.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {command.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {command.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                      {command.status === 'executing' && <Activity className="h-4 w-4 text-blue-500 animate-pulse" />}
                      {command.status === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <div>
                      <div className="font-medium">{command.commandType.replace('_', ' ').toUpperCase()}</div>
                      <div className="text-sm text-gray-500">
                        {satellites.find(s => s.id === command.satelliteId)?.name} • {command.operator}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant={
                      command.status === 'completed' ? 'default' :
                      command.status === 'failed' ? 'destructive' :
                      command.status === 'executing' ? 'secondary' : 'outline'
                    }>
                      {command.status}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(command.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}