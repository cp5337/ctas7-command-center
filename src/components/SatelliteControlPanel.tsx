import React, { useState, useEffect } from 'react';
import {
  Target,
  ChevronLeft,
  ChevronRight,
  Radio,
  Satellite,
  Activity
} from 'lucide-react';
import { getWalkerDeltaPositions, calculateGroundStationTracking } from '../services/orbitalMechanics';
import { GROUND_STATIONS } from '../services/networkWorldData';

interface SatelliteControlPanelProps {
  onQuickJump: (target: string) => void;
}

export function SatelliteControlPanel({ onQuickJump }: SatelliteControlPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedSatellite, setSelectedSatellite] = useState<string>('');
  const [trackingData, setTrackingData] = useState<Map<string, any>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Update tracking data every 30 seconds
    const updateTracking = () => {
      const groundStations = GROUND_STATIONS.slice(0, 3).map(gs => ({
        lat: gs.lat,
        lon: gs.lon,
        altitude: gs.altitude,
        name: gs.name
      }));

      const tracking = calculateGroundStationTracking(groundStations);
      setTrackingData(tracking);
      setLastUpdate(new Date());
    };

    updateTracking();
    const interval = setInterval(updateTracking, 30000);
    return () => clearInterval(interval);
  }, []);

  // Greek alphabet names for satellites
  const greekAlphabet = [
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta',
    'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu'
  ];

  const satelliteList = Array.from({ length: 4 }, (_, plane) =>
    Array.from({ length: 3 }, (_, slot) => {
      const satIndex = plane * 3 + slot;
      return {
        id: `${plane}-${slot}`,
        name: greekAlphabet[satIndex],
        plane,
        slot
      };
    })
  ).flat();

  const getVisibleSatellites = () => {
    // Get first ground station's tracking data as example
    const firstStation = GROUND_STATIONS[0]?.name;
    if (!firstStation || !trackingData.has(firstStation)) return 0;

    const stationTracking = trackingData.get(firstStation) || [];
    return stationTracking.filter((track: any) => track.visible).length;
  };

  return (
    <div className={`
      fixed right-0 top-[129px] h-[calc(100vh-129px)] bg-slate-900/95 backdrop-blur border-l border-slate-700/50
      transition-all duration-300 z-30 flex flex-col
      ${isCollapsed ? 'w-12' : 'w-80'}
    `}>

      {/* Header */}
      {!isCollapsed && (
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center">
              <Satellite className="w-4 h-4 mr-2" />
              Satellite Control
            </h2>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="p-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
          >
            <ChevronLeft className="w-3 h-3 mx-auto" />
          </button>
        </div>
      )}

      {/* Control Panel Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Quick Bird Jump */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/20">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-4 h-4 text-red-400" />
              <span className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Quick Bird Jump
              </span>
            </div>

            <div className="relative mb-4">
              <select
                className="w-full bg-slate-900 border border-cyan-500/30 text-cyan-400 text-sm rounded px-3 py-2 pr-8 appearance-none focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                onChange={(e) => {
                  setSelectedSatellite(e.target.value);
                  onQuickJump(e.target.value);
                }}
                value={selectedSatellite}
              >
                <option value="">Select Satellite Target</option>
                {satelliteList.map((sat) => (
                  <option key={sat.id} value={sat.name}>
                    {sat.name}
                  </option>
                ))}
              </select>
              <Target className="w-3 h-3 text-cyan-500 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Constellation Status */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-blue-500/20">
            <div className="flex items-center space-x-2 mb-3">
              <Radio className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Constellation Status
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Satellites:</span>
                <span className="text-green-400 font-mono">12</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Visible Now:</span>
                <span className="text-cyan-400 font-mono">{getVisibleSatellites()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Orbital Pattern:</span>
                <span className="text-green-400 font-mono">12/4/1</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Altitude:</span>
                <span className="text-cyan-400 font-mono">~21,000 km</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Inclination:</span>
                <span className="text-cyan-400 font-mono">55.0°</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Coverage:</span>
                <span className="text-green-400 font-mono">Van Allen Belt</span>
              </div>
            </div>
          </div>

          {/* Ground Station Tracking */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-amber-500/20">
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Ground Tracking
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-slate-400 mb-2">
                Primary Stations: {GROUND_STATIONS.slice(0, 3).map(gs => gs.name.split(' ')[0]).join(', ')}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Last Update:</span>
                <span className="text-slate-300 font-mono">{lastUpdate.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Auto-Refresh:</span>
                <span className="text-green-400 font-mono">30s</span>
              </div>
            </div>
          </div>

          {/* Beam Shape Display Placeholder */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-red-500/20">
            <div className="text-sm font-semibold text-slate-200 mb-2">
              Beam Shape Display
            </div>
            <div className="text-xs text-slate-400 mb-2">
              {selectedSatellite ? `Selected: ${selectedSatellite}` : 'No satellite selected'}
            </div>
            <div className="text-xs text-slate-500 italic">
              Click satellite card to display ground station declination and lens slewing requirements
            </div>
          </div>

        </div>
      )}
    </div>
  );
}