import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Satellite,
  Zap,
  Activity,
  Eye,
  Target,
  Power,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface SatelliteStatus {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'offline';
  laserFiring: boolean;
  lastFired: string;
  targetStation?: string;
  powerLevel: number;
  signalStrength: number;
  position: {
    lat: number;
    lon: number;
    alt: number;
  };
}

interface SatelliteListProps {
  satellites: any[];
  onSatelliteSelect?: (satelliteId: string) => void;
  selectedSatellite?: string;
}

export default function SatelliteList({ satellites, onSatelliteSelect, selectedSatellite }: SatelliteListProps) {
  const [satelliteStatuses, setSatelliteStatuses] = useState<SatelliteStatus[]>([]);
  const [activeLasers, setActiveLasers] = useState<string[]>([]);

  useEffect(() => {
    // Convert database satellites to status objects
    const statuses: SatelliteStatus[] = satellites.map((sat, index) => ({
      id: sat.id || `sat_${index}`,
      name: sat.name || `Satellite ${index + 1}`,
      status: Math.random() > 0.8 ? 'degraded' : 'operational',
      laserFiring: false,
      lastFired: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      powerLevel: 75 + Math.random() * 25,
      signalStrength: 60 + Math.random() * 40,
      position: {
        lat: sat.latitude || (Math.random() - 0.5) * 180,
        lon: sat.longitude || (Math.random() - 0.5) * 360,
        alt: sat.altitude || 550000
      }
    }));

    setSatelliteStatuses(statuses);
  }, [satellites]);

  useEffect(() => {
    // Simulate laser firing cycles
    const interval = setInterval(() => {
      const firingCount = Math.floor(Math.random() * 4); // 0-3 satellites firing at once
      const firing = satelliteStatuses
        .sort(() => Math.random() - 0.5)
        .slice(0, firingCount)
        .map(s => s.id);

      setActiveLasers(firing);

      // Update last fired times
      setSatelliteStatuses(prev => prev.map(sat => ({
        ...sat,
        laserFiring: firing.includes(sat.id),
        lastFired: firing.includes(sat.id) ? new Date().toISOString() : sat.lastFired
      })));
    }, 4000); // Update every 4 seconds

    return () => clearInterval(interval);
  }, [satelliteStatuses.length]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'offline': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const activeFiringCount = satelliteStatuses.filter(s => s.laserFiring).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            Satellite Constellation ({satelliteStatuses.length} Total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {satelliteStatuses.filter(s => s.status === 'operational').length}
              </div>
              <div className="text-sm text-gray-500">Operational</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {satelliteStatuses.filter(s => s.status === 'degraded').length}
              </div>
              <div className="text-sm text-gray-500">Degraded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {activeFiringCount}
              </div>
              <div className="text-sm text-gray-500">Firing Now</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {Math.round(satelliteStatuses.reduce((sum, s) => sum + s.powerLevel, 0) / satelliteStatuses.length)}%
              </div>
              <div className="text-sm text-gray-500">Avg Power</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Satellite List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Satellite List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {satelliteStatuses.map((satellite) => (
              <div
                key={satellite.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedSatellite === satellite.id
                    ? 'border-blue-500 bg-blue-50'
                    : satellite.laserFiring
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onSatelliteSelect?.(satellite.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(satellite.status)}
                    <div>
                      <h3 className="font-medium">{satellite.name}</h3>
                      <p className="text-sm text-gray-500">ID: {satellite.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {satellite.laserFiring && (
                      <Badge variant="destructive" className="animate-pulse">
                        <Zap className="h-3 w-3 mr-1" />
                        FIRING
                      </Badge>
                    )}
                    <Badge variant={satellite.status === 'operational' ? 'default' : 'destructive'}>
                      {satellite.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Power Level</div>
                    <div className={`font-medium ${satellite.powerLevel < 30 ? 'text-red-500' : 'text-green-500'}`}>
                      {satellite.powerLevel.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Signal</div>
                    <div className="font-medium">{satellite.signalStrength.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Position</div>
                    <div className="font-mono text-xs">
                      {satellite.position.lat.toFixed(1)}°, {satellite.position.lon.toFixed(1)}°
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Last Fired</div>
                    <div className="text-xs">
                      {new Date(satellite.lastFired).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {satellite.laserFiring && (
                  <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                    🔴 LASER ACTIVE - High power optical transmission in progress
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Currently Firing */}
      {activeFiringCount > 0 && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Zap className="h-5 w-5" />
              Currently Firing ({activeFiringCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {satelliteStatuses
                .filter(s => s.laserFiring)
                .map(satellite => (
                  <div key={satellite.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">{satellite.name}</span>
                    </div>
                    <div className="text-sm text-red-600">
                      Power: {satellite.powerLevel.toFixed(1)}%
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}