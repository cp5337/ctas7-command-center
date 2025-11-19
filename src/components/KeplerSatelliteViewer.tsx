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
      <div className="flex-1 relative overflow-auto">
        <div className="w-full h-full p-4">
          <div className="text-center text-slate-400 max-w-7xl mx-auto">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {satelliteData.map((satellite, index) => (
                <div key={index} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-slate-200">{satellite.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      satellite.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                    }`}>
                      {satellite.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-400">
                    <div>Lat: {satellite.lat.toFixed(2)}°</div>
                    <div>Lon: {satellite.lon.toFixed(2)}°</div>
                    <div>Alt: {satellite.alt.toLocaleString()} km</div>
                    <div>Vel: {satellite.velocity} km/s</div>
                    <div>NORAD: {satellite.noradId}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};