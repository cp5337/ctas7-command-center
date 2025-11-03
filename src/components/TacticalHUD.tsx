import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TacticalHUDProps {
  groundStationData?: any;
  telemetryData?: any;
  missionStatus?: string;
  className?: string;
}

export const TacticalHUD: React.FC<TacticalHUDProps> = ({
  groundStationData,
  telemetryData,
  missionStatus = 'OPERATIONAL',
  className = ''
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alertLevel, setAlertLevel] = useState<'GREEN' | 'YELLOW' | 'RED'>('GREEN');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toISOString().replace('T', ' ').slice(0, 19) + 'Z';
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPERATIONAL': return 'text-green-400';
      case 'DEGRADED': return 'text-yellow-400';
      case 'CRITICAL': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className={`fixed top-4 left-4 z-50 ${className}`}>
      {/* Status Bar */}
      <Card className="bg-black/90 border-slate-600 mb-2">
        <CardContent className="p-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  alertLevel === 'GREEN' ? 'bg-green-400' : 
                  alertLevel === 'YELLOW' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                <span className="text-slate-300">CTAS-7</span>
              </div>
              <div className={getStatusColor(missionStatus)}>
                {missionStatus}
              </div>
            </div>
            <div className="text-slate-300">
              {formatTime(currentTime)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Telemetry Overview */}
      {telemetryData && (
        <Card className="bg-black/90 border-slate-600 mb-2 w-72">
          <CardHeader className="pb-2 border-b border-slate-700">
            <h3 className="text-xs font-semibold text-slate-200 font-mono uppercase">
              TELEMETRY STATUS
            </h3>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="space-y-1">
                <div className="text-slate-400">POSITION</div>
                <div className="text-green-400">
                  {telemetryData.latitude?.toFixed(4)}°N
                </div>
                <div className="text-green-400">
                  {telemetryData.longitude?.toFixed(4)}°E
                </div>
                <div className="text-green-400">
                  {telemetryData.altitude_km?.toFixed(2)} km
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-400">COMMS</div>
                <div className="text-green-400">
                  {telemetryData.signal_strength?.toFixed(1)} dBm
                </div>
                <div className="text-green-400">
                  {telemetryData.data_rate || 'N/A'} bps
                </div>
                <div className={`${
                  telemetryData.comm_status === 'GOOD' ? 'text-green-400' :
                  telemetryData.comm_status === 'MARGINAL' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {telemetryData.comm_status}
                </div>
              </div>
            </div>
            
            <div className="mt-3 pt-2 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">PWR</span>
                <span className="text-green-400 text-xs">
                  {telemetryData.power_w?.toFixed(1)}W / {telemetryData.battery_pct?.toFixed(0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mission Controls */}
      <Card className="bg-black/90 border-slate-600">
        <CardHeader className="pb-2 border-b border-slate-700">
          <h3 className="text-xs font-semibold text-slate-200 font-mono uppercase">
            MISSION CONTROL
          </h3>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              className="bg-blue-900 hover:bg-blue-800 text-xs h-8 font-mono"
            >
              ACQ
            </Button>
            <Button
              size="sm"
              className="bg-green-900 hover:bg-green-800 text-xs h-8 font-mono"
            >
              TRK
            </Button>
            <Button
              size="sm"
              className="bg-yellow-900 hover:bg-yellow-800 text-xs h-8 font-mono"
            >
              HOLD
            </button>
            <Button
              size="sm"
              className="bg-red-900 hover:bg-red-800 text-xs h-8 font-mono"
            >
              SAFE
            </Button>
          </div>
          
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">AZ/EL:</span>
              <span className="text-green-400">245.2° / 15.8°</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">RANGE:</span>
              <span className="text-green-400">1,247 km</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">DOPPLER:</span>
              <span className="text-green-400">-2.3 kHz</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TacticalHUD;
