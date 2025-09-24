import React, { useState, useEffect } from 'react';
import {
  Shield,
  Target,
  Eye,
  AlertTriangle,
  Code,
  Network,
  Lock,
  Zap,
  Activity,
  GitBranch,
  Database,
  Server,
  Wifi,
  Bug,
  Settings,
  Play,
  Square,
  Download
} from 'lucide-react';

interface HoneypotTemplate {
  id: string;
  name: string;
  type: 'web' | 'ssh' | 'ftp' | 'database' | 'api' | 'iot';
  language: 'rust' | 'python' | 'go' | 'javascript';
  description: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'testing' | 'deployed' | 'compromised';
  deployedInstances: number;
  detectedAttacks: number;
  lastActivity: string;
  codePreview: string;
}

interface ThreatIntelligence {
  id: string;
  source: string;
  type: 'malware' | 'ip' | 'domain' | 'vulnerability' | 'technique';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  description: string;
  indicators: string[];
  timestamp: string;
  confidence: number;
}

interface CyberOpsWorkspaceProps {
  isConnected: boolean;
}

export const CyberOpsWorkspace: React.FC<CyberOpsWorkspaceProps> = ({
  isConnected
}) => {
  const [activeTab, setActiveTab] = useState<'honeypots' | 'threats' | 'analysis' | 'integrations'>('honeypots');
  const [honeypots, setHoneypots] = useState<HoneypotTemplate[]>([]);
  const [threats, setThreats] = useState<ThreatIntelligence[]>([]);
  const [selectedHoneypot, setSelectedHoneypot] = useState<string | null>(null);

  useEffect(() => {
    // Mock honeypot templates
    setHoneypots([
      {
        id: 'hp-1',
        name: 'Web Application Honeypot',
        type: 'web',
        language: 'rust',
        description: 'Simulates vulnerable web application with common OWASP Top 10 vulnerabilities',
        threatLevel: 'high',
        status: 'deployed',
        deployedInstances: 3,
        detectedAttacks: 127,
        lastActivity: '2 minutes ago',
        codePreview: `// Rust Axum Web Honeypot
use axum::{routing::get, Router};
use serde_json::json;

async fn fake_login() -> axum::Json<serde_json::Value> {
    // Log attempt and return fake success
    log_attack_attempt("login_attempt");
    json!({"status": "success", "token": "fake_jwt_token"})
}`
      },
      {
        id: 'hp-2',
        name: 'SSH Honeypot',
        type: 'ssh',
        language: 'python',
        description: 'SSH server that captures login attempts and command execution',
        threatLevel: 'medium',
        status: 'testing',
        deployedInstances: 1,
        detectedAttacks: 45,
        lastActivity: '15 minutes ago',
        codePreview: `# Python SSH Honeypot
import paramiko
import threading

class SSHHoneypot:
    def handle_connection(self, client):
        # Log connection attempt
        self.log_attempt(client.getpeername())
        # Simulate weak authentication
        return True`
      },
      {
        id: 'hp-3',
        name: 'API Gateway Honeypot',
        type: 'api',
        language: 'rust',
        description: 'REST API that simulates database endpoints with injection vulnerabilities',
        threatLevel: 'critical',
        status: 'draft',
        deployedInstances: 0,
        detectedAttacks: 0,
        lastActivity: 'Never',
        codePreview: `// Rust API Honeypot with fake SQL injection
#[get("/users/{id}")]
async fn get_user(Path(id): Path<String>) -> Json<Value> {
    // Log potential SQL injection attempt
    if id.contains("'") || id.contains("--") {
        log_sql_injection_attempt(&id);
    }
    fake_user_response(id)
}`
      }
    ]);

    // Mock threat intelligence
    setThreats([
      {
        id: 'threat-1',
        source: 'Honeypot Network',
        type: 'ip',
        severity: 'high',
        description: 'Coordinated brute force attacks from botnet',
        indicators: ['192.168.1.100', '10.0.0.50', '172.16.0.25'],
        timestamp: new Date().toISOString(),
        confidence: 95
      },
      {
        id: 'threat-2',
        source: 'Code Analysis',
        type: 'vulnerability',
        severity: 'critical',
        description: 'Buffer overflow vulnerability detected in C++ crate',
        indicators: ['CVE-2024-1234', 'buffer_overflow', 'memory_corruption'],
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        confidence: 88
      }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'text-green-400 bg-green-400/10';
      case 'testing': return 'text-yellow-400 bg-yellow-400/10';
      case 'draft': return 'text-blue-400 bg-blue-400/10';
      case 'compromised': return 'text-red-400 bg-red-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web': return <Network className="w-4 h-4" />;
      case 'ssh': return <Server className="w-4 h-4" />;
      case 'ftp': return <Database className="w-4 h-4" />;
      case 'api': return <Zap className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
      case 'iot': return <Wifi className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'honeypots', label: 'Honeypots', icon: Target },
    { id: 'threats', label: 'Threat Intel', icon: AlertTriangle },
    { id: 'analysis', label: 'Analysis', icon: Activity },
    { id: 'integrations', label: 'Integrations', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold text-slate-100">Cyber Operations Workspace</h2>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              isConnected ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm">{isConnected ? 'Neural Mux Active' : 'Offline Mode'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
              <Target className="w-4 h-4" />
              <span>Deploy Honeypot</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors">
              <Eye className="w-4 h-4" />
              <span>Monitor Threats</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-red-400" />
              <span className="text-sm text-slate-300">Active Honeypots</span>
            </div>
            <div className="text-2xl font-bold text-red-400">4</div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-slate-300">Threats Detected</span>
            </div>
            <div className="text-2xl font-bold text-orange-400">172</div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span className="text-sm text-slate-300">Active Sessions</span>
            </div>
            <div className="text-2xl font-bold text-green-400">12</div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Network className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-300">Attack Vectors</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">8</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 mt-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
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
      {activeTab === 'honeypots' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Honeypot List */}
          <div className="lg:col-span-2 space-y-4">
            {honeypots.map((honeypot) => (
              <div
                key={honeypot.id}
                className={`bg-slate-700 border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedHoneypot === honeypot.id ? 'border-red-400' : 'border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => setSelectedHoneypot(honeypot.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(honeypot.type)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(honeypot.status)}`}>
                        {honeypot.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-slate-100 font-medium">{honeypot.name}</h3>
                      <p className="text-slate-400 text-sm">{honeypot.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${getThreatLevelColor(honeypot.threatLevel)}`}>
                      {honeypot.threatLevel.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Instances:</span>
                    <span className="text-slate-200 ml-2">{honeypot.deployedInstances}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Attacks:</span>
                    <span className="text-red-400 ml-2">{honeypot.detectedAttacks}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Last Activity:</span>
                    <span className="text-slate-200 ml-2">{honeypot.lastActivity}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      honeypot.language === 'rust' ? 'bg-orange-400/10 text-orange-400' :
                      honeypot.language === 'python' ? 'bg-blue-400/10 text-blue-400' :
                      'bg-green-400/10 text-green-400'
                    }`}>
                      {honeypot.language.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {honeypot.status === 'deployed' && (
                      <button className="p-1 text-red-400 hover:bg-red-400/10 rounded">
                        <Square className="w-4 h-4" />
                      </button>
                    )}
                    {honeypot.status !== 'deployed' && (
                      <button className="p-1 text-green-400 hover:bg-green-400/10 rounded">
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-1 text-blue-400 hover:bg-blue-400/10 rounded">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-slate-400 hover:bg-slate-400/10 rounded">
                      <Code className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Code Preview */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Code Preview</h3>
            {selectedHoneypot ? (
              <div>
                <div className="bg-slate-800 rounded p-3 text-xs font-mono text-slate-300 mb-4">
                  <pre>{honeypots.find(h => h.id === selectedHoneypot)?.codePreview}</pre>
                </div>
                <div className="space-y-2">
                  <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                    Edit Code
                  </button>
                  <button className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                    Deploy
                  </button>
                  <button className="w-full px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm transition-colors">
                    Export to Crate
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Select a honeypot to view code</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'threats' && (
        <div className="space-y-4">
          {threats.map((threat) => (
            <div key={threat.id} className="bg-slate-700 border border-slate-600 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className={`w-5 h-5 ${getThreatLevelColor(threat.severity)}`} />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      threat.severity === 'critical' ? 'bg-red-400/10 text-red-400' :
                      threat.severity === 'high' ? 'bg-orange-400/10 text-orange-400' :
                      'bg-yellow-400/10 text-yellow-400'
                    }`}>
                      {threat.severity.toUpperCase()}
                    </span>
                    <span className="text-slate-400 text-sm">{threat.source}</span>
                  </div>
                  <h3 className="text-slate-100 font-medium mb-1">{threat.description}</h3>
                  <p className="text-slate-400 text-sm">Confidence: {threat.confidence}%</p>
                </div>
                <div className="text-slate-400 text-sm">
                  {new Date(threat.timestamp).toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-slate-300">Indicators:</div>
                <div className="flex flex-wrap gap-2">
                  {threat.indicators.map((indicator, index) => (
                    <span key={index} className="bg-slate-600 text-slate-300 px-2 py-1 rounded text-xs font-mono">
                      {indicator}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mainstream Integrations */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Design Tools</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-600 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center text-white font-bold">C</div>
                  <span className="text-slate-100">Canva</span>
                </div>
                <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors">
                  Connect
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-600 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold">F</div>
                  <span className="text-slate-100">Figma</span>
                </div>
                <span className="text-green-400 text-sm">Connected</span>
              </div>
            </div>
          </div>

          {/* Security Tools */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Security Tools</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-600 rounded">
                <span className="text-slate-100">Metasploit</span>
                <span className="text-green-400 text-sm">Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-600 rounded">
                <span className="text-slate-100">Nmap</span>
                <span className="text-green-400 text-sm">Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-600 rounded">
                <span className="text-slate-100">Burp Suite</span>
                <span className="text-yellow-400 text-sm">Pending</span>
              </div>
            </div>
          </div>

          {/* Development Tools */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Dev Tools</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-600 rounded">
                <span className="text-slate-100">GitHub</span>
                <span className="text-green-400 text-sm">Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-600 rounded">
                <span className="text-slate-100">Docker Hub</span>
                <span className="text-green-400 text-sm">Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-600 rounded">
                <span className="text-slate-100">Crates.io</span>
                <span className="text-green-400 text-sm">Connected</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};