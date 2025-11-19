import React, { useState } from 'react';
import { 
  Globe, 
  BookOpen, 
  Wifi, 
  DollarSign, 
  Settings, 
  Target,
  Power
} from 'lucide-react';
import { CesiumWorldView } from './CesiumWorldView';
import { MEO_SATELLITES } from '../services/networkWorldData';
import { ZoteroAPIIntegration } from './ZoteroAPIIntegration';
import { LibraryOfCongressAPI } from './LibraryOfCongressAPI';

// Placeholder for Laser Light component (will be implemented fully later)
const LaserControlPanel = () => {
  const [power, setPower] = useState(true);
  const [laserMode, setLaserMode] = useState('active');
  const [pulseMode, setPulseMode] = useState('10ms');
  const [expandedSat, setExpandedSat] = useState<string | null>('ALPHA 75 E');

  const satellites = [
    'ALPHA', 'BETA', 'DELTA',
    'EPSILON', 'ZETA', 'GAMMA',
    'LAMBDA', 'ZETA', 'ALPHA',
    'BETA', 'DELTA', 'GAMMA'
  ];

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900/90 border-l border-slate-700 p-4 overflow-y-auto backdrop-blur-sm z-30">
      {/* Quick Bird Jump Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-cyan-400 uppercase flex items-center">
            <Target className="w-3 h-3 mr-1" /> Quick Bird Jump
          </h3>
          <div className="flex space-x-1">
             <button className="text-[10px] px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-slate-400">Auto-Center</button>
             <button className="text-[10px] px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-slate-400">Re-route</button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {satellites.map((sat, i) => (
            <button 
              key={i}
              className="px-2 py-1.5 bg-slate-800/80 hover:bg-cyan-900/50 border border-slate-700 hover:border-cyan-500/50 rounded text-[10px] text-slate-300 hover:text-cyan-400 transition-colors text-center"
            >
              {sat}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-2">
            <button className="text-[10px] text-cyan-400 flex items-center"><span className="mr-1">+</span> Expand All</button>
            <button className="text-[10px] text-slate-500 flex items-center"><span className="mr-1">-</span> Collapse All</button>
        </div>
      </div>

      {/* Satellite Selection */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-slate-400 mb-2">Satellite Selection & Operations</h3>
        <select className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 mb-2 focus:outline-none focus:border-cyan-500">
          <option>All Satellites</option>
          <option>Active Constellation</option>
          <option>Maintenance Mode</option>
        </select>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center px-3 py-1.5 bg-green-900/30 border border-green-500/30 rounded text-xs text-green-400 hover:bg-green-900/50">
            <Power className="w-3 h-3 mr-1.5" /> Power On
          </button>
          <button className="flex items-center justify-center px-3 py-1.5 bg-red-900/30 border border-red-500/30 rounded text-xs text-red-400 hover:bg-red-900/50">
            <Power className="w-3 h-3 mr-1.5" /> Power Off
          </button>
        </div>
      </div>

      {/* Individual Controls */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 mb-2">Individual Controls</h3>
        <div className="text-[10px] text-slate-500 mb-2">Debug: 12 satellites, 12 controls</div>
        
        <div className="border border-slate-700 rounded bg-slate-800/50 overflow-hidden">
          <button 
            className="w-full flex items-center justify-between p-2 bg-slate-800 border-b border-slate-700"
            onClick={() => setExpandedSat(expandedSat === 'ALPHA 75 E' ? null : 'ALPHA 75 E')}
          >
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs font-medium text-slate-200">ALPHA 75 E</span>
            </div>
            <div className="text-[10px] text-slate-500">10ms latency</div>
          </button>
          
          {expandedSat === 'ALPHA 75 E' && (
            <div className="p-3 space-y-4">
              {/* Power Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Power</span>
                <button 
                  onClick={() => setPower(!power)}
                  className={`w-8 h-4 rounded-full relative transition-colors ${power ? 'bg-green-500' : 'bg-slate-600'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${power ? 'left-4.5 translate-x-full' : 'left-0.5'}`} style={{ left: power ? 'calc(100% - 14px)' : '2px' }}></div>
                </button>
              </div>

              {/* Laser Mode */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-slate-400">Laser Mode</span>
                    <span className="text-[10px] text-slate-500">{laserMode}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {['active', 'standby', 'safe', 'off'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setLaserMode(mode)}
                      className={`px-2 py-1 rounded text-[10px] capitalize border transition-colors ${
                        laserMode === mode 
                          ? mode === 'active' ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                          : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                          : 'bg-slate-700 border-transparent text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {mode === 'active' && <span className="w-1 h-1 rounded-full bg-green-400 inline-block mr-1"></span>}
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pulse Control */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-slate-400">Pulse Control</span>
                    <span className="text-[10px] text-cyan-400">{pulseMode} / 200ms</span>
                </div>
                <div className="flex space-x-1 mb-2">
                  {['10ms', '100ms', '1s'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPulseMode(mode)}
                      className={`flex-1 px-2 py-1 rounded text-[10px] border transition-colors ${
                        pulseMode === mode 
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                          : 'bg-slate-700 border-transparent text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <input type="range" className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
              </div>
              
              {/* Telemetry */}
              <div className="pt-2 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex justify-between">
                      <span className="text-slate-500">Lat:</span>
                      <span className="text-slate-300 font-mono">34.55° N</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-slate-500">Lon:</span>
                      <span className="text-slate-300 font-mono">112.4° W</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-slate-500">Alt:</span>
                      <span className="text-slate-300 font-mono">8000 km</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-slate-500">Tmp:</span>
                      <span className="text-green-400 font-mono">24°C</span>
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Placeholder for Financial View
const FinancialView = () => (
  <div className="h-full flex items-center justify-center text-slate-400">
    <div className="text-center">
      <DollarSign className="w-16 h-16 mx-auto mb-4 text-green-400 opacity-50" />
      <h3 className="text-xl font-semibold text-slate-200 mb-2">Financial Services Suite</h3>
      <p className="max-w-md mx-auto">
        Real-time transaction monitoring and blockchain ledger integration.
        Connects to iTunesStyleManager for customer experience data.
      </p>
    </div>
  </div>
);

export function CTASCommandCenter() {
  const [activeTab, setActiveTab] = useState<'satellites' | 'research' | 'laser' | 'financial'>('satellites');
  const [researchTab, setResearchTab] = useState<'zotero' | 'loc'>('zotero');

  const handleQuickJump = (target: string) => {
    console.log(`Jumping to ${target}`);
    // Dispatch event for CesiumWorldView to handle
    const event = new CustomEvent('ctas-camera-flyto', { 
      detail: { target } 
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans">
      {/* Command Center Header */}
      <header className="bg-slate-900 border-b border-cyan-500/20 px-6 py-3 flex items-center justify-between shrink-0 z-50 relative shadow-lg shadow-black/20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Globe className="w-6 h-6 animate-pulse-slow" />
            <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              CTAS-7 COMMAND CENTER
            </h1>
          </div>
          <div className="h-6 w-px bg-slate-700 mx-2"></div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>SYSTEM ONLINE</span>
            <span className="text-slate-600">|</span>
            <span>LAT: 34.0522 N</span>
            <span>LON: 118.2437 W</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
           {/* Navigation Tabs */}
           <nav className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
             {[
               { id: 'satellites', label: '3D Satellites', icon: Globe },
               { id: 'research', label: 'Research Paper', icon: BookOpen },
               { id: 'laser', label: 'Laser Light', icon: Wifi },
               { id: 'financial', label: 'Financial', icon: DollarSign },
             ].map((tab) => {
               const Icon = tab.icon;
               return (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm transition-all duration-200 ${
                     activeTab === tab.id
                       ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                       : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                   }`}
                 >
                   <Icon className="w-4 h-4" />
                   <span>{tab.label}</span>
                 </button>
               );
             })}
           </nav>

           {activeTab === 'satellites' && (
             <div className="flex items-center space-x-2 bg-slate-800 rounded-md px-3 py-1.5 border border-slate-700">
               <Target className="w-4 h-4 text-red-400" />
               <span className="text-xs text-slate-400 uppercase">Quick Jump:</span>
               <div className="flex items-center space-x-2">
            <div className="relative">
              <select 
                className="bg-slate-900 border border-cyan-500/30 text-cyan-400 text-xs rounded px-2 py-1 pr-8 appearance-none focus:outline-none focus:border-cyan-400"
                onChange={(e) => handleQuickJump(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Quick Bird Jump</option>
                {MEO_SATELLITES.map(sat => (
                  <option key={sat.id} value={sat.name}>{sat.name}</option>
                ))}
              </select>
              <Target className="w-3 h-3 text-cyan-500 absolute right-2 top-1.5 pointer-events-none" />
            </div>
             </div>
           </div>
           )}
           <button className="p-2 text-slate-400 hover:text-white transition-colors">
             <Settings className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        
        {/* 3D Satellites View */}
        {activeTab === 'satellites' && (
        <div className="flex-1 relative overflow-hidden h-full">
          <CesiumWorldView />
        </div>
      )}
      
      {/* Laser Light View (3D + Control Panel) */}
      {activeTab === 'laser' && (
        <div className="flex-1 relative overflow-hidden h-full">
          <CesiumWorldView />
          <LaserControlPanel />
        </div>
      )}

        {/* Research Paper View */}
        {activeTab === 'research' && (
          <div className="absolute inset-0 overflow-y-auto bg-slate-900 z-20">
            <div className="max-w-7xl mx-auto p-6">
              <div className="mb-6 flex items-center space-x-4 border-b border-slate-800 pb-4">
                <button 
                  onClick={() => setResearchTab('zotero')}
                  className={`text-lg font-semibold pb-2 border-b-2 transition-colors ${
                    researchTab === 'zotero' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Zotero Library
                </button>
                <button 
                  onClick={() => setResearchTab('loc')}
                  className={`text-lg font-semibold pb-2 border-b-2 transition-colors ${
                    researchTab === 'loc' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Library of Congress
                </button>
              </div>
              
              {researchTab === 'zotero' ? <ZoteroAPIIntegration /> : <LibraryOfCongressAPI />}
            </div>
          </div>
        )}

        {/* Financial View */}
        {activeTab === 'financial' && (
          <div className="absolute inset-0 overflow-y-auto bg-slate-900 z-20">
            <FinancialView />
          </div>
        )}
      </main>
    </div>
  );
}

export default CTASCommandCenter;
