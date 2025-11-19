import { useState } from 'react';
import { CesiumWorldView } from './CesiumWorldView';
import { KeplerSatelliteViewer } from './KeplerSatelliteViewer';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { ZoteroAPIIntegration } from './ZoteroAPIIntegration';
import { LibraryOfCongressAPI } from './LibraryOfCongressAPI';

// Simplified placeholder components
const LaserControlPanel = () => (
  <div className="absolute left-4 top-4 w-72 bg-slate-900/95 backdrop-blur border border-red-500/30 rounded-lg p-4 z-50">
    <div className="text-center text-red-400">
      <h3 className="text-lg font-semibold mb-2">Laser Control Panel</h3>
      <p className="text-sm text-slate-300">Advanced laser targeting controls will be available here.</p>
    </div>
  </div>
);

const FinancialView = () => (
  <div className="h-full flex items-center justify-center text-slate-400">
    <div className="text-center">
      <h3 className="text-xl font-semibold text-slate-200 mb-2">Financial Services Suite</h3>
      <p className="max-w-md mx-auto">
        Real-time transaction monitoring and blockchain ledger integration.
      </p>
    </div>
  </div>
);

export function CTASCommandCenter() {
  const [activeTab, setActiveTab] = useState<'satellites' | 'research' | 'laser' | 'financial'>('satellites');
  const [researchTab, setResearchTab] = useState<'zotero' | 'loc'>('zotero');


  return (
    <div className="flex h-full bg-slate-950 text-slate-100 font-sans">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-12 min-h-0">
        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">

          {/* 3D Satellites View */}
          {activeTab === 'satellites' && (
            <div className="flex-1 relative overflow-hidden h-full">
              <KeplerSatelliteViewer onBack={() => {}} />
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
    </div>
  );
}

export default CTASCommandCenter;