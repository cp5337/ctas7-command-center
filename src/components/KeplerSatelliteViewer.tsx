// KEPLER SATELLITE VIEWER COMMENTED OUT - DEPENDENCY ISSUES
import React, { useState, useEffect } from 'react';
import { generateMockSatelliteData } from '../data/satelliteData';

interface KeplerSatelliteViewerProps {
  onBack: () => void;
}

export const KeplerSatelliteViewer: React.FC<KeplerSatelliteViewerProps> = () => {
  const [satelliteData, setSatelliteData] = useState(generateMockSatelliteData());

  // Update satellite data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSatelliteData(generateMockSatelliteData());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Satellite Data Display */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {satelliteData.map((satellite, index) => (
              <div key={index} className="bg-slate-800/90 backdrop-blur rounded-xl p-5 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200 hover:shadow-xl hover:shadow-slate-900/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-100">{satellite.name}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    satellite.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    satellite.status === 'tracking' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {satellite.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lat:</span>
                    <span className="text-slate-200 font-mono">{satellite.lat.toFixed(2)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lon:</span>
                    <span className="text-slate-200 font-mono">{satellite.lon.toFixed(2)}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Alt:</span>
                    <span className="text-slate-200 font-mono">{satellite.alt.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vel:</span>
                    <span className="text-slate-200 font-mono">{satellite.velocity} km/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">NORAD:</span>
                    <span className="text-slate-300 font-mono">{satellite.noradId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};