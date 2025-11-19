import React, { useState } from 'react';
import {
  Globe,
  BookOpen,
  Wifi,
  DollarSign,
  Settings,
  Activity,
  Zap,
  Database,
  Target
} from 'lucide-react';
import { CesiumWorldView } from './CesiumWorldView';
import { MEO_SATELLITES, NETWORK_LINKS } from '../services/networkWorldData';
import { ZoteroAPIIntegration } from './ZoteroAPIIntegration';
import { LibraryOfCongressAPI } from './LibraryOfCongressAPI';

// Placeholder for Laser Light component (will be implemented fully later)
const LaserLightView = () => {
  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="grid grid-cols-12 gap-6">
        {/* Link Budget Analysis */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-slate-800 border border-cyan-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center">
                <Activity className="w-5 h-5 text-cyan-400 mr-2" />
                Optical Link Budget Analysis
              </h3>
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                  System Optimal
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                <div className="text-slate-400 text-xs mb-1">Active Links</div>
                <div className="text-2xl font-mono text-cyan-400">{NETWORK_LINKS.filter(l => l.status === 'active').length}</div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                <div className="text-slate-400 text-xs mb-1">Avg BER</div>
                <div className="text-2xl font-mono text-green-400">1.2e-9</div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                <div className="text-slate-400 text-xs mb-1">QKD Status</div>
                <div className="text-2xl font-mono text-cyan-400">SECURE</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">Active Satellite Links</h4>
              {NETWORK_LINKS.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded border border-slate-700 hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${link.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                    <div>
                      <div className="text-sm font-medium text-slate-200">{link.id}</div>
                      <div className="text-xs text-slate-400">{link.type} • {link.bandwidth_gbps} Gbps</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-cyan-400">-{link.latency_ms}dBm</div>
                    <div className="text-xs text-slate-500">Signal Strength</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Satellite Status */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-slate-800 border border-cyan-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center">
              <Zap className="w-5 h-5 text-yellow-400 mr-2" />
              Laser Terminals
            </h3>
            <div className="space-y-3">
              {MEO_SATELLITES.slice(0, 5).map((sat) => (
                <div key={sat.id} className="p-3 bg-slate-700/30 rounded border border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-slate-200">{sat.name}</div>
                    <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] rounded border border-cyan-500/30">
                      {sat.orbital_plane}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Power:</span>
                      <span className="text-slate-300 ml-1">{sat.laser_power_w}W</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Temp:</span>
                      <span className="text-green-400 ml-1">Nominal</span>
                    </div>
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

// Placeholder for Financial View
const FinancialView = () => (
  <div className="p-6 bg-slate-900 text-slate-100 flex items-center justify-center h-full">
    <div className="text-center">
      <DollarSign className="w-16 h-16 text-slate-600 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-slate-400">Financial Services Suite</h2>
      <p className="text-slate-500 mt-2">Connect to iTunesStyleManager for financial data.</p>
    </div>
  </div>
);

export const CTASCommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'satellites' | 'research' | 'laser' | 'financial'>('satellites');
  const [researchTab, setResearchTab] = useState<'zotero' | 'loc'>('zotero');



  const handleQuickJump = (target: string) => {
    console.log(`Jumping to ${target}`);
    // Logic to trigger flyTo in SpaceWorldDemo will go here
    // This might require lifting state up or using a context/event bus
    const event = new CustomEvent('ctas-camera-flyto', { detail: { target } });
    window.dispatchEvent(event);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex-none bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between z-50">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30">
            <Globe className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-wide">CTAS-7 COMMAND CENTER</h1>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>SYSTEM ONLINE</span>
              <span className="text-slate-600">|</span>
              <span>v7.0.2-alpha</span>
            </div>
          </div>
        </div>

        <nav className="flex items-center space-x-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('satellites')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'satellites'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>3D Satellites</span>
          </button>

          <button
            onClick={() => setActiveTab('research')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'research'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Research Paper</span>
          </button>

          <button
            onClick={() => setActiveTab('laser')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'laser'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>Laser Light</span>
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === 'financial'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Financial</span>
          </button>
        </nav>

        <div className="flex items-center space-x-3">
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
        <div className="flex-1 relative overflow-hidden">
          <CesiumWorldView />
        </div>
      )}   {/* Research Paper View */}
        {activeTab === 'research' && (
          <div className="absolute inset-0 overflow-y-auto bg-slate-900 z-20">
            <div className="max-w-7xl mx-auto p-6">
              <div className="flex items-center space-x-4 mb-6 border-b border-slate-800 pb-4">
                <button
                  onClick={() => setResearchTab('zotero')}
                  className={`text-lg font-medium transition-colors ${
                    researchTab === 'zotero' ? 'text-orange-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Zotero Integration
                </button>
                <span className="text-slate-700">|</span>
                <button
                  onClick={() => setResearchTab('loc')}
                  className={`text-lg font-medium transition-colors ${
                    researchTab === 'loc' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Library of Congress
                </button>
              </div>

              {researchTab === 'zotero' ? <ZoteroAPIIntegration /> : <LibraryOfCongressAPI />}
            </div>
          </div>
        )}

        {/* Laser Light View */}
        {activeTab === 'laser' && (
          <div className="absolute inset-0 overflow-y-auto bg-slate-900 z-20">
            <LaserLightView />
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
};

export default CTASCommandCenter;
