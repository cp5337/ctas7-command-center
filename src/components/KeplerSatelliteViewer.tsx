// KEPLER SATELLITE VIEWER COMMENTED OUT - DEPENDENCY ISSUES
import React, { useState, useEffect } from 'react';
import { Satellite, Globe, Settings, Download } from 'lucide-react';
import { generateMockSatelliteData } from '../data/satelliteData';

interface KeplerSatelliteViewerProps {
  onBack: () => void;
}

export const KeplerSatelliteViewer: React.FC<KeplerSatelliteViewerProps> = ({ onBack }) => {
  const [satelliteData, setSatelliteData] = useState(generateMockSatelliteData());
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Update satellite data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSatelliteData(generateMockSatelliteData());
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const exportData = () => {
    const dataStr = JSON.stringify(satelliteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `satellite-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      <div className="px-6 py-3 border-b border-slate-700/50">
        <button
          onClick={onBack}
          className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          ← Back to Main View
        </button>
      </div>

      {/* Header Controls */}
      <div className="px-6 py-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-100 flex items-center">
            <Globe className="w-6 h-6 mr-2" />
            Satellite Data Viewer
          </h2>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <Satellite className="w-4 h-4" />
              <span>{satelliteData.length} satellites</span>
              <span>•</span>
              <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>

            <button
              onClick={exportData}
              className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
              title="Export Data"
            >
              <Download className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Satellite Data Display */}
      <div className="flex-1 relative overflow-auto">
        <div className="w-full h-full p-6">
          <div className="text-center text-slate-400 max-w-7xl mx-auto">
            <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-4">Walker Delta Free Space Optical Constellation</h3>

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

            <div className="mt-8 p-4 bg-slate-900 rounded-lg border border-slate-700">
              <p className="text-sm text-slate-300 mb-2">
                Mock GPS satellite constellation data • Updates every 30 seconds
              </p>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-medium"
              >
                Export Satellite Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};