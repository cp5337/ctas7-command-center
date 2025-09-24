import React, { useState, useEffect } from 'react';
import {
  Package,
  Shield,
  Settings,
  Database,
  Network,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Terminal,
  Globe,
  Server,
  Cpu,
  HardDrive,
  Activity,
  Zap,
  Target
} from 'lucide-react';

interface CrateInfo {
  name: string;
  category: 'foundation' | 'candidate' | 'analysis' | 'infrastructure';
  status: 'active' | 'building' | 'error' | 'stopped';
  qaStatus: 'passed' | 'failed' | 'running' | 'pending';
  complexity: number;
  maintainability: number;
  port?: number;
  wasmReady: boolean;
  eeiAssigned: boolean;
  xsdValidated: boolean;
  playbookReady: boolean;
  lastAnalysis?: string;
}

const CTASCrateManagement: React.FC = () => {
  const [crates, setCrates] = useState<CrateInfo[]>([]);
  const [selectedCrate, setSelectedCrate] = useState<string | null>(null);
  const [certificationMode, setCertificationMode] = useState<'sterile' | 'development'>('development');
  const [qaMode, setQaMode] = useState<'docker' | 'wasm'>('docker');
  const [activePhase, setActivePhase] = useState<'certification' | 'port_assignment' | 'eei' | 'xsd' | 'playbook' | 'toolchain' | 'interview'>('certification');

  // Initialize with discovered crates
  useEffect(() => {
    const initializeCrates = async () => {
      const mockCrates: CrateInfo[] = [
        // Foundation Crates
        { name: 'ctas7-core-foundation-staging', category: 'foundation', status: 'active', qaStatus: 'passed', complexity: 12, maintainability: 78, port: 18001, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },
        { name: 'ctas7-data-foundation-staging', category: 'foundation', status: 'active', qaStatus: 'passed', complexity: 15, maintainability: 82, port: 18002, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },
        { name: 'ctas7-foundation-tactical-staging', category: 'foundation', status: 'active', qaStatus: 'passed', complexity: 8, maintainability: 85, port: 18003, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },
        { name: 'ctas7-interface-foundation-staging', category: 'foundation', status: 'active', qaStatus: 'passed', complexity: 18, maintainability: 75, port: 18004, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },

        // Analysis & QA Crates
        { name: 'ctas7-analysis-gold-standard', category: 'analysis', status: 'active', qaStatus: 'passed', complexity: 5, maintainability: 92, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },
        { name: 'ctas7-qa-analyzer', category: 'analysis', status: 'active', qaStatus: 'passed', complexity: 7, maintainability: 88, port: 18107, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },

        // Infrastructure Crates
        { name: 'ctas7-isolated-monitoring-cdn-staging', category: 'infrastructure', status: 'active', qaStatus: 'running', complexity: 22, maintainability: 68, port: 18108, wasmReady: false, eeiAssigned: true, xsdValidated: true, playbookReady: false },
        { name: 'ctas7-exploit-vector-machine-staging', category: 'infrastructure', status: 'building', qaStatus: 'pending', complexity: 45, maintainability: 45, wasmReady: false, eeiAssigned: false, xsdValidated: false, playbookReady: false },
        { name: 'ctas7-legion-test-staging', category: 'infrastructure', status: 'active', qaStatus: 'passed', complexity: 12, maintainability: 80, port: 18109, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },
        { name: 'ctas7-scripts-staging', category: 'infrastructure', status: 'active', qaStatus: 'passed', complexity: 6, maintainability: 90, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },

        // Candidate Crates (Main Workspace)
        { name: 'ctas7-candidate-crates-staging', category: 'candidate', status: 'active', qaStatus: 'passed', complexity: 25, maintainability: 72, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },
        { name: 'ctas7-streaming-engine', category: 'candidate', status: 'active', qaStatus: 'passed', complexity: 18, maintainability: 76, port: 18201, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },
        { name: 'ctas-pubsub-core', category: 'candidate', status: 'active', qaStatus: 'passed', complexity: 14, maintainability: 78, port: 18202, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },
        { name: 'ctas-xsd-environment', category: 'candidate', status: 'active', qaStatus: 'passed', complexity: 16, maintainability: 80, port: 18203, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },
        { name: 'ctas-qa-system', category: 'candidate', status: 'active', qaStatus: 'passed', complexity: 5, maintainability: 95, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },
        { name: 'ctas7-unified-data-structure', category: 'candidate', status: 'active', qaStatus: 'passed', complexity: 20, maintainability: 74, port: 18204, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },
        { name: 'ctas7-leptose-knowledge-engine', category: 'candidate', status: 'active', qaStatus: 'running', complexity: 35, maintainability: 62, port: 18205, wasmReady: false, eeiAssigned: true, xsdValidated: true, playbookReady: false },
        { name: 'ctas7-statistical-analysis-cdn', category: 'candidate', status: 'active', qaStatus: 'passed', complexity: 12, maintainability: 82, port: 18206, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },
        { name: 'ctas7-smart-cdn-gateway', category: 'candidate', status: 'active', qaStatus: 'passed', complexity: 10, maintainability: 85, port: 18207, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },
        { name: 'ctas-threat-vector-db', category: 'candidate', status: 'active', qaStatus: 'passed', complexity: 22, maintainability: 70, port: 18208, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },
        { name: 'ctas7-common', category: 'candidate', status: 'active', qaStatus: 'passed', complexity: 8, maintainability: 88, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },
        { name: 'ctas7-monitoring-cdn-main', category: 'candidate', status: 'active', qaStatus: 'passed', complexity: 15, maintainability: 79, port: 18209, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true },
        { name: 'ctas-slotgraph-tools', category: 'candidate', status: 'building', qaStatus: 'pending', complexity: 28, maintainability: 65, wasmReady: false, eeiAssigned: false, xsdValidated: false, playbookReady: false },
        { name: 'ctas-core-foundation', category: 'candidate', status: 'active', qaStatus: 'passed', complexity: 12, maintainability: 80, wasmReady: true, eeiAssigned: true, xsdValidated: true, playbookReady: true }
      ];
      setCrates(mockCrates);
    };

    initializeCrates();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': case 'passed': return 'text-green-400';
      case 'building': case 'running': return 'text-yellow-400';
      case 'error': case 'failed': return 'text-red-400';
      case 'stopped': case 'pending': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active': case 'passed': return <CheckCircle className="w-4 h-4" />;
      case 'building': case 'running': return <Clock className="w-4 h-4 animate-spin" />;
      case 'error': case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'foundation': return <Shield className="w-5 h-5 text-blue-400" />;
      case 'candidate': return <Package className="w-5 h-5 text-purple-400" />;
      case 'analysis': return <Target className="w-5 h-5 text-green-400" />;
      case 'infrastructure': return <Server className="w-5 h-5 text-orange-400" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const runQAAnalysis = (crateName: string, mode: 'docker' | 'wasm') => {
    console.log(`Running QA analysis on ${crateName} in ${mode} mode`);
    // Update crate status to running
    setCrates(prev => prev.map(crate =>
      crate.name === crateName
        ? { ...crate, qaStatus: 'running' }
        : crate
    ));
  };

  const certifyInSterileEnvironment = (crateName: string) => {
    console.log(`Starting sterile environment certification for ${crateName}`);
    // Trigger certification workflow
  };

  const assignPort = (crateName: string) => {
    const availablePorts = [18300, 18301, 18302, 18303, 18304];
    const nextPort = availablePorts.find(port =>
      !crates.some(crate => crate.port === port)
    );

    if (nextPort) {
      setCrates(prev => prev.map(crate =>
        crate.name === crateName
          ? { ...crate, port: nextPort }
          : crate
      ));
    }
  };

  const selectedCrateData = crates.find(crate => crate.name === selectedCrate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-6">
      <div className="max-w-full mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            CTAS-7 Crate Management & Operational Certification
          </h1>
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg">
              <Package className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-medium">{crates.length} Total Crates</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium">{crates.filter(c => c.qaStatus === 'passed').length} QA Certified</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg">
              <Globe className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium">{crates.filter(c => c.wasmReady).length} WASM Ready</span>
            </div>
          </div>
        </div>

        {/* Mode Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Certification Mode
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setCertificationMode('development')}
                className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                  certificationMode === 'development'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Development
              </button>
              <button
                onClick={() => setCertificationMode('sterile')}
                className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                  certificationMode === 'sterile'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Sterile Environment
              </button>
            </div>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              QA Analysis Mode
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setQaMode('docker')}
                className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                  qaMode === 'docker'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Docker
              </button>
              <button
                onClick={() => setQaMode('wasm')}
                className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                  qaMode === 'wasm'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                WASM
              </button>
            </div>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-yellow-400" />
              Active Phase
            </h3>
            <select
              value={activePhase}
              onChange={(e) => setActivePhase(e.target.value as any)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
            >
              <option value="certification">Certification</option>
              <option value="port_assignment">Port Assignment</option>
              <option value="eei">EEI Assignment</option>
              <option value="xsd">XSD Validation</option>
              <option value="playbook">Playbook Integration</option>
              <option value="toolchain">Toolchain Management</option>
              <option value="interview">Node Interview</option>
            </select>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Crate List */}
          <div className="xl:col-span-2 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-xl font-semibold mb-4">Crate Registry</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {crates.map((crate) => (
                <div
                  key={crate.name}
                  onClick={() => setSelectedCrate(crate.name)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedCrate === crate.name
                      ? 'bg-cyan-600/20 border-cyan-500'
                      : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(crate.category)}
                      <div>
                        <h3 className="font-medium text-sm">{crate.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="capitalize">{crate.category}</span>
                          {crate.port && <span>Port: {crate.port}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 ${getStatusColor(crate.status)}`}>
                        {getStatusIcon(crate.status)}
                        <span className="text-xs capitalize">{crate.status}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${getStatusColor(crate.qaStatus)}`}>
                        <Shield className="w-3 h-3" />
                        <span className="text-xs capitalize">{crate.qaStatus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Indicators */}
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    <div className={`h-2 rounded ${crate.wasmReady ? 'bg-green-500' : 'bg-gray-600'}`} title="WASM Ready" />
                    <div className={`h-2 rounded ${crate.eeiAssigned ? 'bg-blue-500' : 'bg-gray-600'}`} title="EEI Assigned" />
                    <div className={`h-2 rounded ${crate.xsdValidated ? 'bg-purple-500' : 'bg-gray-600'}`} title="XSD Validated" />
                    <div className={`h-2 rounded ${crate.playbookReady ? 'bg-orange-500' : 'bg-gray-600'}`} title="Playbook Ready" />
                    <div className={`h-2 rounded ${crate.complexity <= 15 ? 'bg-green-500' : crate.complexity <= 30 ? 'bg-yellow-500' : 'bg-red-500'}`} title={`Complexity: ${crate.complexity}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crate Detail Panel */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            {selectedCrateData ? (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  {getCategoryIcon(selectedCrateData.category)}
                  Crate Operations
                </h2>

                <div className="space-y-4">
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h3 className="font-medium mb-2">{selectedCrateData.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Status: <span className={getStatusColor(selectedCrateData.status)}>{selectedCrateData.status}</span></div>
                      <div>QA: <span className={getStatusColor(selectedCrateData.qaStatus)}>{selectedCrateData.qaStatus}</span></div>
                      <div>Complexity: <span className="text-yellow-400">{selectedCrateData.complexity}</span></div>
                      <div>Maintainability: <span className="text-green-400">{selectedCrateData.maintainability}</span></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => runQAAnalysis(selectedCrateData.name, qaMode)}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Run QA Analysis ({qaMode.toUpperCase()})
                    </button>

                    {certificationMode === 'sterile' && (
                      <button
                        onClick={() => certifyInSterileEnvironment(selectedCrateData.name)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        Sterile Certification
                      </button>
                    )}

                    {!selectedCrateData.port && (
                      <button
                        onClick={() => assignPort(selectedCrateData.name)}
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Network className="w-4 h-4" />
                        Assign Port
                      </button>
                    )}

                    <button
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Database className="w-4 h-4" />
                      Node Interview
                    </button>

                    <button
                      className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Toolchain Config
                    </button>
                  </div>

                  {/* Phase Status */}
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="font-medium mb-3">Certification Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>WASM Ready</span>
                        {selectedCrateData.wasmReady ?
                          <CheckCircle className="w-4 h-4 text-green-400" /> :
                          <Clock className="w-4 h-4 text-gray-400" />
                        }
                      </div>
                      <div className="flex items-center justify-between">
                        <span>EEI Assigned</span>
                        {selectedCrateData.eeiAssigned ?
                          <CheckCircle className="w-4 h-4 text-green-400" /> :
                          <Clock className="w-4 h-4 text-gray-400" />
                        }
                      </div>
                      <div className="flex items-center justify-between">
                        <span>XSD Validated</span>
                        {selectedCrateData.xsdValidated ?
                          <CheckCircle className="w-4 h-4 text-green-400" /> :
                          <Clock className="w-4 h-4 text-gray-400" />
                        }
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Playbook Ready</span>
                        {selectedCrateData.playbookReady ?
                          <CheckCircle className="w-4 h-4 text-green-400" /> :
                          <Clock className="w-4 h-4 text-gray-400" />
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a crate to view operations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASCrateManagement;