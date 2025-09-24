import React, { useState, useEffect } from 'react';
import { getBackendBaseUrl, getWebSocketUrl, getEnvironmentInfo } from '../utils/url';
import { apiService } from '../services/api';
import { Wifi, WifiOff, AlertCircle, CheckCircle, Info } from 'lucide-react';

export const WebSocketDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [backendHealth, setBackendHealth] = useState<boolean | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const info = getEnvironmentInfo();
    setDebugInfo(info);
    
    // Check backend health
    apiService.healthCheck().then(setBackendHealth);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-slate-700 hover:bg-slate-600 text-slate-300 p-2 rounded-full transition-colors z-50"
        title="WebSocket Debug Info"
      >
        <Info size={16} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 border border-slate-600 rounded-lg p-4 max-w-md z-50 text-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-100 font-semibold">Connection Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-slate-200"
        >
          ×
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center space-x-2">
          {backendHealth === true ? (
            <CheckCircle size={14} className="text-green-400" />
          ) : backendHealth === false ? (
            <AlertCircle size={14} className="text-red-400" />
          ) : (
            <WifiOff size={14} className="text-yellow-400" />
          )}
          <span className="text-slate-300">
            Backend: {backendHealth === true ? 'Healthy' : backendHealth === false ? 'Unreachable' : 'Checking...'}
          </span>
        </div>

        {debugInfo && (
          <>
            <div className="border-t border-slate-600 pt-2 mt-2">
              <p className="text-slate-400">Environment:</p>
              <p className="text-slate-300 font-mono break-all">{debugInfo.hostname}</p>
            </div>

            <div>
              <p className="text-slate-400">Backend URL:</p>
              <p className="text-slate-300 font-mono break-all">{debugInfo.backendUrl}</p>
            </div>

            <div>
              <p className="text-slate-400">WebSocket URL:</p>
              <p className="text-slate-300 font-mono break-all">{debugInfo.wsUrl}</p>
            </div>

            <div>
              <p className="text-slate-400">Port Mapping:</p>
              <p className="text-slate-300">{debugInfo.frontendPort} → {debugInfo.backendPort}</p>
            </div>

            <div>
              <p className="text-slate-400">Container Mode:</p>
              <p className="text-slate-300">{debugInfo.isContainer ? 'Yes' : 'No'}</p>
            </div>
          </>
        )}

        <div className="border-t border-slate-600 pt-2 mt-2">
          <p className="text-slate-400 mb-1">Troubleshooting:</p>
          <ul className="text-slate-300 space-y-1">
            <li>• Ensure backend server is running on port {debugInfo?.backendPort || '8080'}</li>
            <li>• Check WebSocket endpoint exists at /ws</li>
            <li>• Verify port mapping in container environment</li>
          </ul>
        </div>
      </div>
    </div>
  );
};