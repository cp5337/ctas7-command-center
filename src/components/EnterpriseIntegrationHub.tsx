import React, { useState } from 'react';
import {
  Database,
  Globe,
  Shield,
  Cloud,
  Zap,
  Activity,
  Settings,
  CheckCircle,
  Clock,
  MapPin,
  Thermometer
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync: string;
  recordCount: number;
}

export const EnterpriseIntegrationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'niem' | 'ndex' | 'weather' | 'xsd' | 'overview'>('overview');

  const mockIntegrations: Integration[] = [
    {
      id: 'niem-core',
      name: 'NIEM Core Schema',
      status: 'connected',
      lastSync: new Date(Date.now() - 300000).toISOString(),
      recordCount: 15847
    },
    {
      id: 'ndex-primary',
      name: 'N-DEX Primary',
      status: 'connected',
      lastSync: new Date(Date.now() - 600000).toISOString(),
      recordCount: 8923
    },
    {
      id: 'weather-api',
      name: 'Weather API',
      status: 'connected',
      lastSync: new Date(Date.now() - 120000).toISOString(),
      recordCount: 1247
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'syncing': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'syncing': return <Clock className="w-4 h-4 animate-spin" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'niem', label: 'NIEM', icon: Database },
    { id: 'ndex', label: 'N-DEX', icon: Shield },
    { id: 'weather', label: 'Weather', icon: Cloud },
    { id: 'xsd', label: 'XSD Schema', icon: Settings }
  ];

  return (
    <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Globe className="w-6 h-6 text-cyan-400" />
        <h2 className="text-xl font-semibold text-slate-100">Enterprise Integration Hub</h2>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockIntegrations.map((integration) => (
              <div key={integration.id} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-100">{integration.name}</h3>
                  <div className={`flex items-center space-x-1 ${getStatusColor(integration.status)}`}>
                    {getStatusIcon(integration.status)}
                    <span className="text-xs capitalize">{integration.status}</span>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Records:</span>
                    <span className="text-cyan-400">{integration.recordCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Sync:</span>
                    <span>{new Date(integration.lastSync).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">3</div>
                <div className="text-sm text-slate-400">Active Integrations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">0</div>
                <div className="text-sm text-slate-400">Syncing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">26,017</div>
                <div className="text-sm text-slate-400">Total Records</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'niem' && (
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Database className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-100">NIEM Integration</h3>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            National Information Exchange Model for standardized data sharing.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-600 rounded">
              <span className="text-slate-200">Core Schema</span>
              <span className="text-green-400 text-sm">Connected</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-600 rounded">
              <span className="text-slate-200">Justice Domain</span>
              <span className="text-green-400 text-sm">Connected</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-600 rounded">
              <span className="text-slate-200">Intelligence Domain</span>
              <span className="text-yellow-400 text-sm">Syncing</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ndex' && (
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-slate-100">N-DEX Integration</h3>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            National Data Exchange for law enforcement information sharing.
          </p>
          <div className="bg-slate-600 rounded p-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-200">Agency Access</span>
              <span className="text-green-400 text-sm">Active</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'weather' && (
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Cloud className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-100">Weather API</h3>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Real-time weather data for operational planning.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-600 rounded">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-slate-200">Current Location</span>
              </div>
              <span className="text-cyan-400 text-sm">72°F</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-600 rounded">
              <div className="flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <span className="text-slate-200">Conditions</span>
              </div>
              <span className="text-green-400 text-sm">Clear</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'xsd' && (
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-slate-100">XSD Schema</h3>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            XML Schema Definition for CTAS ontology and enterprise data validation.
          </p>

          <div className="space-y-4">
            <div className="bg-slate-600 rounded-lg p-4">
              <h4 className="text-md font-semibold text-slate-100 mb-3">Schema Overview</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">47</div>
                  <div className="text-slate-400">Complex Types</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">23</div>
                  <div className="text-slate-400">Elements</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">Valid</div>
                  <div className="text-slate-400">Status</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-600 rounded-lg p-4">
              <h4 className="text-md font-semibold text-slate-100 mb-3">Core Schema Definition</h4>
              <div className="bg-slate-800 rounded p-3 font-mono text-xs overflow-x-auto">
                <div className="text-blue-300">&lt;?xml version="1.0" encoding="UTF-8"?&gt;</div>
                <div className="text-purple-300">&lt;xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"</div>
                <div className="text-purple-300 ml-4">targetNamespace="http://ctas7.ontology/threat-actor"</div>
                <div className="text-purple-300 ml-4">xmlns:ctas="http://ctas7.ontology/threat-actor"&gt;</div>
                <br />
                <div className="text-green-300">  &lt;!-- Threat Actor Digital Asset Attack --&gt;</div>
                <div className="text-purple-300">  &lt;xs:complexType name="ThreatActorDigitalAssetAttackType"&gt;</div>
                <div className="text-yellow-300 ml-4">    &lt;xs:sequence&gt;</div>
                <div className="text-cyan-300 ml-6">      &lt;xs:element name="initialAccess" type="ctas:InitialAccessType"/&gt;</div>
                <div className="text-cyan-300 ml-6">      &lt;xs:element name="attackService" type="ctas:AttackServiceType"/&gt;</div>
                <div className="text-cyan-300 ml-6">      &lt;xs:element name="digitalAsset" type="ctas:DigitalAssetType"/&gt;</div>
                <div className="text-yellow-300 ml-4">    &lt;/xs:sequence&gt;</div>
                <div className="text-purple-300">  &lt;/xs:complexType&gt;</div>
                <br />
                <div className="text-green-300">  &lt;!-- Initial Access Techniques --&gt;</div>
                <div className="text-purple-300">  &lt;xs:complexType name="InitialAccessType"&gt;</div>
                <div className="text-yellow-300 ml-4">    &lt;xs:choice&gt;</div>
                <div className="text-cyan-300 ml-6">      &lt;xs:element name="driveByCompromise" type="xs:string"/&gt; &lt;!-- T1189 --&gt;</div>
                <div className="text-cyan-300 ml-6">      &lt;xs:element name="exploitPublicApplication" type="xs:string"/&gt; &lt;!-- T1190 --&gt;</div>
                <div className="text-cyan-300 ml-6">      &lt;xs:element name="externalRemoteServices" type="xs:string"/&gt; &lt;!-- T1133 --&gt;</div>
                <div className="text-cyan-300 ml-6">      &lt;xs:element name="validAccounts" type="xs:string"/&gt; &lt;!-- T1078 --&gt;</div>
                <div className="text-yellow-300 ml-4">    &lt;/xs:choice&gt;</div>
                <div className="text-purple-300">  &lt;/xs:complexType&gt;</div>
                <div className="text-purple-300">&lt;/xs:schema&gt;</div>
              </div>
            </div>

            <div className="bg-slate-600 rounded-lg p-4">
              <h4 className="text-md font-semibold text-slate-100 mb-3">Validation Rules</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-2 bg-slate-700 rounded">
                  <span className="text-slate-200">MITRE ATT&CK Compliance</span>
                  <span className="text-green-400">✓ Valid</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-700 rounded">
                  <span className="text-slate-200">NIEM Compatibility</span>
                  <span className="text-green-400">✓ Valid</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-700 rounded">
                  <span className="text-slate-200">XML Schema Validation</span>
                  <span className="text-green-400">✓ Valid</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};