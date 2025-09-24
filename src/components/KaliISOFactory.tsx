import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Download,
  Settings,
  Package,
  Terminal,
  Shield,
  Cpu,
  Zap,
  Code,
  Database,
  Network,
  Eye,
  Target,
  Skull,
  Activity,
  Lock,
  Unlock,
  Bug,
  Crosshair,
  Layers,
  FileText,
  GitBranch,
  Play,
  Stop,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface KaliISOConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  baseImage: 'kali-rolling' | 'kali-everything' | 'kali-light' | 'custom';
  architecture: 'x86_64' | 'arm64' | 'i386';
  purpose: 'penetration-testing' | 'red-team' | 'forensics' | 'training' | 'research';
  customTools: CustomTool[];
  evilToolChains: string[];
  kernelMods: KernelModification[];
  networking: NetworkConfig;
  persistence: PersistenceConfig;
  stealth: StealthConfig;
  size: string;
  buildTime: string;
  buildStatus: 'pending' | 'building' | 'completed' | 'failed';
  downloadUrl?: string;
}

interface CustomTool {
  id: string;
  name: string;
  category: 'reconnaissance' | 'exploitation' | 'post-exploitation' | 'forensics' | 'custom';
  language: 'rust' | 'python' | 'bash' | 'c' | 'go';
  repository: string;
  version: string;
  dependencies: string[];
  installScript: string;
  configFiles: ConfigFile[];
  integration: 'standalone' | 'ctas-integrated' | 'neural-mux-connected';
}

interface ConfigFile {
  path: string;
  content: string;
  permissions: string;
}

interface KernelModification {
  name: string;
  description: string;
  module: string;
  parameters: Record<string, any>;
  purpose: 'stealth' | 'performance' | 'compatibility' | 'exploitation';
}

interface NetworkConfig {
  vpnPreconfig: boolean;
  torIntegration: boolean;
  macRandomization: boolean;
  networkNamespaces: string[];
  customInterfaces: NetworkInterface[];
}

interface NetworkInterface {
  name: string;
  type: 'virtual' | 'bridge' | 'tunnel';
  configuration: Record<string, any>;
}

interface PersistenceConfig {
  bootPersistence: boolean;
  encryptedHome: boolean;
  secureDelete: boolean;
  antiForensics: boolean;
  customScripts: string[];
}

interface StealthConfig {
  vmDetectionEvasion: boolean;
  userAgentSpoofing: boolean;
  timestampManipulation: boolean;
  processNameObfuscation: boolean;
  networkSignatureModification: boolean;
}

interface BuildJob {
  id: string;
  isoConfigId: string;
  startTime: string;
  estimatedCompletion: string;
  progress: number;
  currentStage: string;
  logs: BuildLog[];
  status: 'queued' | 'building' | 'completed' | 'failed';
}

interface BuildLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  stage: string;
}

interface KaliISOFactoryProps {
  evilToolChains?: any[];
  customTools?: any[];
}

export const KaliISOFactory: React.FC<KaliISOFactoryProps> = ({
  evilToolChains = [],
  customTools = []
}) => {
  const [isoConfigs, setIsoConfigs] = useState<KaliISOConfig[]>([]);
  const [buildJobs, setBuildJobs] = useState<BuildJob[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'configs' | 'tools' | 'build' | 'download'>('configs');
  const [newConfigMode, setNewConfigMode] = useState(false);

  useEffect(() => {
    // Initialize with pre-configured Kali ISO templates
    setIsoConfigs([
      {
        id: 'iso-red-team',
        name: 'CTAS Red Team Arsenal',
        description: 'Full red team penetration testing suite with CTAS integration',
        version: '2024.1-ctas',
        baseImage: 'kali-everything',
        architecture: 'x86_64',
        purpose: 'red-team',
        customTools: [
          {
            id: 'ctas-scanner',
            name: 'CTAS Network Scanner',
            category: 'reconnaissance',
            language: 'rust',
            repository: 'https://github.com/ctas/network-scanner',
            version: '1.0.0',
            dependencies: ['libpcap-dev', 'rust-nightly'],
            installScript: `#!/bin/bash
cd /opt
git clone https://github.com/ctas/network-scanner
cd network-scanner
cargo build --release
ln -s /opt/network-scanner/target/release/ctas-scanner /usr/local/bin/
echo "CTAS Scanner installed successfully"`,
            configFiles: [
              {
                path: '/etc/ctas/scanner.conf',
                content: `# CTAS Scanner Configuration
neural_mux_endpoint=http://localhost:18100
reporting_enabled=true
stealth_mode=true
max_threads=100`,
                permissions: '644'
              }
            ],
            integration: 'neural-mux-connected'
          },
          {
            id: 'evil-chain-deployer',
            name: 'Evil Tool Chain Deployer',
            category: 'exploitation',
            language: 'python',
            repository: 'https://github.com/ctas/evil-chain-deployer',
            version: '2.0.0',
            dependencies: ['python3-requests', 'python3-cryptography'],
            installScript: `#!/bin/bash
pip3 install evil-chain-deployer
mkdir -p /opt/ctas/evil-chains
chmod 700 /opt/ctas/evil-chains
echo "Evil Chain Deployer ready for adversarial operations"`,
            configFiles: [
              {
                path: '/opt/ctas/evil-chains/config.json',
                content: `{
  "command_center": "http://localhost:5174",
  "neural_mux": "http://localhost:18100",
  "cognigraph_integration": true,
  "stealth_level": "maximum",
  "auto_report": true
}`,
                permissions: '600'
              }
            ],
            integration: 'ctas-integrated'
          }
        ],
        evilToolChains: ['chain-1', 'chain-2'],
        kernelMods: [
          {
            name: 'packet_stealth',
            description: 'Kernel module for stealthy packet injection',
            module: 'packet_stealth.ko',
            parameters: {
              stealth_level: 'maximum',
              evasion_techniques: ['fragmentation', 'timing_variance']
            },
            purpose: 'stealth'
          }
        ],
        networking: {
          vpnPreconfig: true,
          torIntegration: true,
          macRandomization: true,
          networkNamespaces: ['red-team', 'stealth', 'exfil'],
          customInterfaces: [
            {
              name: 'ctas0',
              type: 'virtual',
              configuration: {
                ip: '10.1.1.1/24',
                mtu: 1500,
                queue: 'fq_codel'
              }
            }
          ]
        },
        persistence: {
          bootPersistence: true,
          encryptedHome: true,
          secureDelete: true,
          antiForensics: true,
          customScripts: [
            '/opt/ctas/startup/neural-mux-connect.sh',
            '/opt/ctas/startup/stealth-init.sh'
          ]
        },
        stealth: {
          vmDetectionEvasion: true,
          userAgentSpoofing: true,
          timestampManipulation: true,
          processNameObfuscation: true,
          networkSignatureModification: true
        },
        size: '4.2 GB',
        buildTime: '~45 minutes',
        buildStatus: 'completed',
        downloadUrl: '/downloads/ctas-red-team-arsenal-2024.1.iso'
      },
      {
        id: 'iso-forensics',
        name: 'CTAS Digital Forensics Workstation',
        description: 'Comprehensive digital forensics and incident response platform',
        version: '2024.1-forensics',
        baseImage: 'kali-light',
        architecture: 'x86_64',
        purpose: 'forensics',
        customTools: [
          {
            id: 'ctas-forensics',
            name: 'CTAS Forensics Suite',
            category: 'forensics',
            language: 'rust',
            repository: 'https://github.com/ctas/forensics-suite',
            version: '1.5.0',
            dependencies: ['libewf-dev', 'libbfio-dev'],
            installScript: `#!/bin/bash
apt-get update
apt-get install -y libewf-dev libbfio-dev
cd /opt
git clone https://github.com/ctas/forensics-suite
cd forensics-suite
cargo build --release --features neural-mux
cp target/release/ctas-forensics /usr/local/bin/
echo "CTAS Forensics Suite installed"`,
            configFiles: [
              {
                path: '/etc/ctas/forensics.conf',
                content: `# CTAS Forensics Configuration
evidence_storage=/mnt/evidence
neural_mux_endpoint=http://localhost:18100
chain_of_custody=true
auto_hash_verification=true
timeline_integration=true`,
                permissions: '644'
              }
            ],
            integration: 'ctas-integrated'
          }
        ],
        evilToolChains: [],
        kernelMods: [
          {
            name: 'write_blocker',
            description: 'Hardware write blocker for evidence preservation',
            module: 'write_blocker.ko',
            parameters: {
              strict_mode: true,
              log_attempts: true
            },
            purpose: 'compatibility'
          }
        ],
        networking: {
          vpnPreconfig: false,
          torIntegration: false,
          macRandomization: false,
          networkNamespaces: ['forensics', 'isolated'],
          customInterfaces: []
        },
        persistence: {
          bootPersistence: true,
          encryptedHome: true,
          secureDelete: false,
          antiForensics: false,
          customScripts: [
            '/opt/ctas/startup/evidence-mount.sh',
            '/opt/ctas/startup/forensics-tools-init.sh'
          ]
        },
        stealth: {
          vmDetectionEvasion: false,
          userAgentSpoofing: false,
          timestampManipulation: false,
          processNameObfuscation: false,
          networkSignatureModification: false
        },
        size: '2.8 GB',
        buildTime: '~30 minutes',
        buildStatus: 'pending'
      },
      {
        id: 'iso-training',
        name: 'CTAS Training Environment',
        description: 'Safe training environment for cybersecurity education',
        version: '2024.1-training',
        baseImage: 'kali-light',
        architecture: 'x86_64',
        purpose: 'training',
        customTools: [
          {
            id: 'training-simulator',
            name: 'CTAS Training Simulator',
            category: 'custom',
            language: 'python',
            repository: 'https://github.com/ctas/training-simulator',
            version: '1.0.0',
            dependencies: ['python3-flask', 'python3-docker'],
            installScript: `#!/bin/bash
pip3 install flask docker
cd /opt
git clone https://github.com/ctas/training-simulator
cd training-simulator
chmod +x setup.sh
./setup.sh
echo "Training simulator ready"`,
            configFiles: [
              {
                path: '/opt/ctas/training/config.yaml',
                content: `# CTAS Training Configuration
training_mode: safe
network_isolation: true
logging_level: verbose
auto_reset: true
scenario_library: /opt/ctas/scenarios/`,
                permissions: '644'
              }
            ],
            integration: 'standalone'
          }
        ],
        evilToolChains: [],
        kernelMods: [],
        networking: {
          vpnPreconfig: false,
          torIntegration: false,
          macRandomization: false,
          networkNamespaces: ['training', 'sandbox'],
          customInterfaces: []
        },
        persistence: {
          bootPersistence: true,
          encryptedHome: false,
          secureDelete: false,
          antiForensics: false,
          customScripts: [
            '/opt/ctas/startup/training-init.sh'
          ]
        },
        stealth: {
          vmDetectionEvasion: false,
          userAgentSpoofing: false,
          timestampManipulation: false,
          processNameObfuscation: false,
          networkSignatureModification: false
        },
        size: '2.1 GB',
        buildTime: '~25 minutes',
        buildStatus: 'building'
      }
    ]);

    // Initialize build jobs
    setBuildJobs([
      {
        id: 'build-1',
        isoConfigId: 'iso-training',
        startTime: new Date(Date.now() - 600000).toISOString(),
        estimatedCompletion: new Date(Date.now() + 900000).toISOString(),
        progress: 67,
        currentStage: 'Installing custom tools',
        logs: [
          {
            timestamp: new Date(Date.now() - 600000).toISOString(),
            level: 'info',
            message: 'Starting ISO build process',
            stage: 'initialization'
          },
          {
            timestamp: new Date(Date.now() - 550000).toISOString(),
            level: 'info',
            message: 'Downloading Kali base image',
            stage: 'base-image'
          },
          {
            timestamp: new Date(Date.now() - 400000).toISOString(),
            level: 'info',
            message: 'Installing CTAS Training Simulator',
            stage: 'custom-tools'
          },
          {
            timestamp: new Date(Date.now() - 300000).toISOString(),
            level: 'warning',
            message: 'Python dependency version conflict resolved',
            stage: 'custom-tools'
          }
        ],
        status: 'building'
      }
    ]);
  }, []);

  const startBuild = (configId: string) => {
    const config = isoConfigs.find(c => c.id === configId);
    if (!config) return;

    const newJob: BuildJob = {
      id: `build-${Date.now()}`,
      isoConfigId: configId,
      startTime: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 2700000).toISOString(), // 45 minutes
      progress: 0,
      currentStage: 'Initializing build environment',
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Starting build for ${config.name}`,
          stage: 'initialization'
        }
      ],
      status: 'building'
    };

    setBuildJobs(prev => [...prev, newJob]);

    // Update config status
    setIsoConfigs(prev => prev.map(c =>
      c.id === configId ? { ...c, buildStatus: 'building' } : c
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'building': return 'text-blue-400 bg-blue-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'failed': return 'text-red-400 bg-red-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getPurposeIcon = (purpose: string) => {
    switch (purpose) {
      case 'red-team': return <Skull className="w-4 h-4" />;
      case 'penetration-testing': return <Target className="w-4 h-4" />;
      case 'forensics': return <Eye className="w-4 h-4" />;
      case 'training': return <FileText className="w-4 h-4" />;
      case 'research': return <Database className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'configs', label: 'ISO Configurations', icon: HardDrive },
    { id: 'tools', label: 'Custom Tools', icon: Package },
    { id: 'build', label: 'Build Jobs', icon: Settings },
    { id: 'download', label: 'Downloads', icon: Download }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <HardDrive className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-semibold text-slate-100">Custom Kali ISO Factory</h2>
            <span className="px-3 py-1 bg-orange-400/10 text-orange-400 rounded-full text-sm">
              Build & Deploy
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setNewConfigMode(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors"
            >
              <Package className="w-4 h-4" />
              <span>New ISO Config</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
              <GitBranch className="w-4 h-4" />
              <span>Import from Repo</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <HardDrive className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-slate-300">ISO Configs</span>
            </div>
            <div className="text-2xl font-bold text-orange-400">{isoConfigs.length}</div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Package className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-300">Custom Tools</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {isoConfigs.reduce((acc, config) => acc + config.customTools.length, 0)}
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span className="text-sm text-slate-300">Active Builds</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {buildJobs.filter(job => job.status === 'building').length}
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Download className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-slate-300">Ready Downloads</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {isoConfigs.filter(config => config.buildStatus === 'completed').length}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'configs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config List */}
          <div className="lg:col-span-2 space-y-4">
            {isoConfigs.map((config) => (
              <div
                key={config.id}
                className={`bg-slate-700 border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedConfig === config.id ? 'border-orange-400' : 'border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => setSelectedConfig(config.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2">
                      {getPurposeIcon(config.purpose)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(config.buildStatus)}`}>
                        {config.buildStatus.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-slate-100 font-medium">{config.name}</h3>
                      <p className="text-slate-400 text-sm">{config.description}</p>
                    </div>
                  </div>
                  <div className="text-slate-400 text-sm">
                    {config.size}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                  <div>
                    <span className="text-slate-400">Base:</span>
                    <span className="text-slate-200 ml-2">{config.baseImage}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Purpose:</span>
                    <span className="text-slate-200 ml-2 capitalize">{config.purpose}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Tools:</span>
                    <span className="text-slate-200 ml-2">{config.customTools.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Build Time:</span>
                    <span className="text-slate-200 ml-2">{config.buildTime}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {config.customTools.slice(0, 3).map((tool) => (
                      <span key={tool.id} className="bg-slate-600 text-slate-300 px-2 py-1 rounded text-xs">
                        {tool.name}
                      </span>
                    ))}
                    {config.customTools.length > 3 && (
                      <span className="text-slate-400 text-xs">+{config.customTools.length - 3}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {config.buildStatus === 'completed' && (
                      <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                        Download
                      </button>
                    )}
                    {config.buildStatus === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startBuild(config.id);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                      >
                        Build ISO
                      </button>
                    )}
                    {config.buildStatus === 'building' && (
                      <div className="px-3 py-1 bg-blue-400/10 text-blue-400 rounded text-sm">
                        Building...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Config Details */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Configuration Details</h3>
            {selectedConfig ? (
              <div>
                {(() => {
                  const config = isoConfigs.find(c => c.id === selectedConfig);
                  if (!config) return null;

                  return (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-slate-300 font-medium mb-2">{config.name}</h4>
                        <p className="text-slate-400 text-sm mb-3">{config.description}</p>
                      </div>

                      <div>
                        <h4 className="text-slate-300 font-medium mb-2">Custom Tools ({config.customTools.length})</h4>
                        <div className="space-y-2">
                          {config.customTools.map((tool) => (
                            <div key={tool.id} className="bg-slate-800 rounded p-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-200">{tool.name}</span>
                                <span className="text-xs text-slate-400">{tool.language}</span>
                              </div>
                              <div className="text-slate-400 text-xs mt-1">{tool.category}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-slate-300 font-medium mb-2">Stealth Features</h4>
                        <div className="space-y-1 text-sm">
                          {Object.entries(config.stealth).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className={value ? 'text-green-400' : 'text-red-400'}>
                                {value ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors">
                          Edit Configuration
                        </button>
                        <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                          Clone Configuration
                        </button>
                        <button className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                          Export to Repo
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p className="text-slate-400">Select a configuration to view details</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'build' && (
        <div className="space-y-6">
          {buildJobs.map((job) => {
            const config = isoConfigs.find(c => c.id === job.isoConfigId);
            if (!config) return null;

            return (
              <div key={job.id} className="bg-slate-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-slate-100 font-medium">{config.name}</h3>
                    <p className="text-slate-400 text-sm">Build ID: {job.id}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status.toUpperCase()}
                  </span>
                </div>

                {job.status === 'building' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300 text-sm">{job.currentStage}</span>
                      <span className="text-slate-400 text-sm">{job.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Started:</span>
                    <span className="text-slate-200 ml-2">{new Date(job.startTime).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">ETA:</span>
                    <span className="text-slate-200 ml-2">{new Date(job.estimatedCompletion).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Logs:</span>
                    <span className="text-slate-200 ml-2">{job.logs.length} entries</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-slate-300 font-medium mb-2">Recent Logs</h4>
                  <div className="bg-slate-800 rounded p-3 max-h-32 overflow-y-auto">
                    {job.logs.slice(-5).map((log, index) => (
                      <div key={index} className="text-xs text-slate-300 mb-1">
                        <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className={`ml-2 ${
                          log.level === 'error' ? 'text-red-400' :
                          log.level === 'warning' ? 'text-yellow-400' :
                          'text-slate-300'
                        }`}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'download' && (
        <div className="space-y-4">
          {isoConfigs.filter(config => config.buildStatus === 'completed').map((config) => (
            <div key={config.id} className="bg-slate-700 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <HardDrive className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-slate-100 font-medium">{config.name}</h3>
                    <p className="text-slate-400 text-sm">{config.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="text-slate-400">Size: <span className="text-slate-200">{config.size}</span></span>
                      <span className="text-slate-400">Version: <span className="text-slate-200">{config.version}</span></span>
                      <span className="text-slate-400">Architecture: <span className="text-slate-200">{config.architecture}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Download ISO</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                    <GitBranch className="w-4 h-4" />
                    <span>Push to Repo</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-slate-300 font-medium mb-2">Included Tools</h4>
                  <div className="flex flex-wrap gap-1">
                    {config.customTools.map((tool) => (
                      <span key={tool.id} className="bg-slate-600 text-slate-300 px-2 py-1 rounded text-xs">
                        {tool.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-slate-300 font-medium mb-2">Evil Tool Chains</h4>
                  <div className="flex flex-wrap gap-1">
                    {config.evilToolChains.map((chainId, index) => (
                      <span key={index} className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-xs">
                        Chain {chainId.split('-')[1]}
                      </span>
                    ))}
                    {config.evilToolChains.length === 0 && (
                      <span className="text-slate-400 text-xs">None (Safe for training)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};