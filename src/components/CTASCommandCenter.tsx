import { useState } from 'react';
import { CesiumWorldView } from './CesiumWorldView';
import { KeplerSatelliteViewer } from './KeplerSatelliteViewer';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { SatelliteControlPanel } from './SatelliteControlPanel';
import { ZoteroAPIIntegration } from './ZoteroAPIIntegration';
import { LibraryOfCongressAPI } from './LibraryOfCongressAPI';


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

  const handleQuickJump = (target: string) => {
    console.log(`Jumping to ${target}`);
    const event = new CustomEvent('ctas-camera-flyto', {
      detail: { target }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="flex h-full bg-slate-950 text-slate-100 font-sans">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickJump={handleQuickJump}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 min-h-0 ${
        activeTab === 'satellites' ? 'ml-12 mr-80' : 'ml-12 mr-0'
      }`}>
        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">

          {/* 3D Satellites View */}
          {activeTab === 'satellites' && (
            <div className="flex-1 relative overflow-hidden h-full">
              <KeplerSatelliteViewer onBack={() => {}} />
            </div>
          )}

          {/* Laser Light View (3D) */}
          {activeTab === 'laser' && (
            <div className="flex-1 relative overflow-hidden h-full">
              <CesiumWorldView />
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

      {/* Right Panel - Satellite Controls */}
      {activeTab === 'satellites' && (
        <SatelliteControlPanel onQuickJump={handleQuickJump} />
      )}
    </div>
  );
}

export default CTASCommandCenter;