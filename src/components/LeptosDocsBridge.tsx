import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  ExternalLink,
  Database,
  Cpu,
  FileText,
  Search,
  RefreshCw,
  Code,
  Layers,
  Zap,
  Settings,
  Download,
  Upload,
  Link,
  Server,
  Globe,
  Eye,
  Target,
  Shield
} from 'lucide-react';

interface LeptosDocument {
  doc_id: string;
  title: string;
  content: string;
  category: 'NIEM' | 'N-DEX' | 'Weather' | 'Kali' | 'Enterprise' | 'General';
  tags: string[];
  lastModified: string;
  sourceType: 'manual' | 'generated' | 'imported' | 'synchronized';
  url: string;
  metadata: Record<string, any>;
}

interface KnowledgeGraphNode {
  id: string;
  type: 'concept' | 'integration' | 'tool' | 'standard' | 'process';
  name: string;
  description: string;
  connections: string[];
  confidence: number;
  leptos_url?: string;
}

interface DocumentationSync {
  id: string;
  name: string;
  description: string;
  source: 'Enterprise Hub' | 'Command Center' | 'Main CTAS UI';
  syncStatus: 'pending' | 'syncing' | 'completed' | 'error';
  lastSync: string;
  documentCount: number;
  knowledgeNodes: number;
}

interface LeptosDocsBridgeProps {
  onDocumentSelect?: (doc: LeptosDocument) => void;
  enterpriseData?: any;
}

export const LeptosDocsBridge: React.FC<LeptosDocsBridgeProps> = ({
  onDocumentSelect,
  enterpriseData
}) => {
  const [documents, setDocuments] = useState<LeptosDocument[]>([]);
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraphNode[]>([]);
  const [syncOperations, setSyncOperations] = useState<DocumentationSync[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'docs' | 'knowledge' | 'sync' | 'export'>('docs');
  const [leptosConnected, setLeptosConnected] = useState(false);

  useEffect(() => {
    // Check Leptos Knowledge Engine connection
    checkLeptosConnection();

    // Initialize documentation from Enterprise Hub
    initializeDocumentation();

    // Set up knowledge graph synchronization
    initializeKnowledgeGraph();
  }, [enterpriseData]);

  const checkLeptosConnection = async () => {
    try {
      // Try to connect to Leptos Knowledge Engine (assuming it runs on port 8080)
      const response = await fetch('http://localhost:8080/api/health');
      setLeptosConnected(response.ok);
    } catch (error) {
      setLeptosConnected(false);
    }
  };

  const initializeDocumentation = () => {
    // Generate documentation from Enterprise Integration Hub data
    const generatedDocs: LeptosDocument[] = [
      {
        doc_id: 'niem-integration-guide',
        title: 'NIEM Integration Implementation Guide',
        content: `# NIEM Integration for CTAS 7.0

## Overview
The National Information Exchange Model (NIEM) integration provides standardized data exchange capabilities for law enforcement and emergency management systems.

## Core Schemas
- **NIEM Core 5.2**: Base vocabulary and common data elements
- **Justice Domain**: Law enforcement specific data structures
- **Intelligence Domain**: Threat analysis and cybersecurity data
- **Emergency Management**: Incident response and coordination

## Technical Implementation
\`\`\`rust
// Leptos Knowledge Engine NIEM Integration
use ctas_leptose_knowledge_engine::niem::{NIEMSchema, JusticeDomain};

async fn sync_niem_data() -> Result<NIEMSyncResult, LeptoseError> {
    let schema = NIEMSchema::load_version("5.2").await?;
    let justice_data = JusticeDomain::fetch_records().await?;

    // Transform and validate data
    let validated_records = schema.validate_records(justice_data)?;

    // Store in knowledge graph
    knowledge_engine.store_niem_entities(validated_records).await
}
\`\`\`

## Data Flow Architecture
1. **Ingest**: Receive NIEM-compliant XML/JSON from external systems
2. **Validate**: XSD schema validation using Leptos XSD integrator
3. **Transform**: Convert to internal knowledge graph format
4. **Store**: Persist in unified knowledge repository
5. **Query**: Expose via Neural Mux API for Command Center access

## Configuration
Enterprise Integration Hub → Leptos Knowledge Engine → Command Center UI`,
        category: 'NIEM',
        tags: ['NIEM', 'integration', 'law-enforcement', 'standards'],
        lastModified: new Date().toISOString(),
        sourceType: 'generated',
        url: '/docs/integrations/niem',
        metadata: {
          schemaVersion: '5.2',
          recordCount: 15847,
          lastSync: new Date(Date.now() - 300000).toISOString()
        }
      },
      {
        doc_id: 'ndex-implementation',
        title: 'N-DEX Implementation and Agency Integration',
        content: `# N-DEX Integration for Multi-Agency Intelligence Sharing

## Introduction
The National Data Exchange (N-DEX) integration enables secure information sharing between law enforcement agencies while maintaining proper access controls and audit trails.

## Agency Configuration
\`\`\`typescript
// Command Center N-DEX Configuration
interface NDEXConfig {
  agencyId: string;
  jurisdiction: 'Federal' | 'State' | 'Local' | 'Regional';
  accessLevel: 'read' | 'write' | 'admin';
  dataTypes: NDEXDataType[];
  encryption: {
    level: 'AES256' | 'RSA2048';
    keyRotation: number; // days
  };
}
\`\`\`

## Data Types Supported
- **Incident Reports**: Cross-jurisdictional incident correlation
- **Suspect Information**: Multi-agency person of interest tracking
- **Vehicle Records**: Stolen vehicle and BOLO notifications
- **Property Records**: Stolen property and evidence tracking

## Security Implementation
All N-DEX communications use end-to-end encryption and are routed through the Neural Mux multiplexer for additional security and monitoring.

## Audit and Compliance
Every N-DEX query and data access is logged for compliance with federal information sharing guidelines.`,
        category: 'N-DEX',
        tags: ['N-DEX', 'law-enforcement', 'intelligence-sharing', 'security'],
        lastModified: new Date(Date.now() - 600000).toISOString(),
        sourceType: 'generated',
        url: '/docs/integrations/ndex',
        metadata: {
          activeAgencies: 2,
          dataTypesSupported: 4,
          lastActivity: new Date(Date.now() - 1800000).toISOString()
        }
      },
      {
        doc_id: 'weather-api-integration',
        title: 'Weather API Integration for Operational Intelligence',
        content: `# Weather API Integration

## Purpose
Environmental conditions significantly impact cyber operations, field deployments, and threat scenarios. The Weather API integration provides real-time meteorological data for operational planning.

## Supported Providers
- **OpenWeatherMap**: Primary provider with global coverage
- **NOAA**: Government weather service integration
- **WeatherAPI**: Backup provider for redundancy

## Operational Use Cases
1. **Physical Security**: Weather impact on surveillance equipment
2. **Field Operations**: Environmental conditions for deployment planning
3. **Infrastructure Security**: Weather-related vulnerability assessments
4. **Emergency Response**: Disaster preparedness and response coordination

## Technical Integration
\`\`\`rust
// Leptos Weather Module
use ctas_leptose_knowledge_engine::weather::{WeatherProvider, LocationMonitor};

struct WeatherIntelligence {
    providers: Vec<WeatherProvider>,
    locations: Vec<MonitoredLocation>,
    alerts: WeatherAlertSystem,
}

impl WeatherIntelligence {
    async fn assess_operational_impact(&self, location: &Location) -> OperationalAssessment {
        let conditions = self.get_current_conditions(location).await?;
        let forecast = self.get_forecast(location, Duration::hours(24)).await?;

        OperationalAssessment {
            visibility_impact: conditions.assess_visibility(),
            equipment_impact: conditions.assess_equipment_performance(),
            personnel_impact: conditions.assess_personnel_safety(),
            recommendations: self.generate_recommendations(&conditions, &forecast),
        }
    }
}
\`\`\`

## Data Structure
Weather data is normalized and stored in the knowledge graph for correlation with operational events and threat intelligence.`,
        category: 'Weather',
        tags: ['weather', 'api', 'operational-intelligence', 'environmental'],
        lastModified: new Date(Date.now() - 900000).toISOString(),
        sourceType: 'generated',
        url: '/docs/integrations/weather',
        metadata: {
          monitoredLocations: 2,
          updateInterval: 300000,
          lastUpdate: new Date().toISOString()
        }
      },
      {
        doc_id: 'custom-kali-tools',
        title: 'Custom Kali Tools Development Framework',
        content: `# Custom Kali Tools Development

## Overview
The CTAS Custom Kali Tools framework enables rapid development of penetration testing tools with built-in CTAS integration and reporting capabilities.

## Tool Categories
- **Reconnaissance**: Network discovery and enumeration tools
- **Scanning**: Vulnerability assessment and port scanning
- **Exploitation**: Custom exploit development and deployment
- **Post-Exploitation**: Persistence and lateral movement tools
- **Forensics**: Digital evidence collection and analysis
- **Custom**: Specialized tools for unique operational requirements

## Development Framework
\`\`\`python
# CTAS Kali Tool Template
from ctas_integration import CTASReporter, NeuralMuxClient

class CTASKaliTool:
    def __init__(self, tool_name: str, category: str):
        self.name = tool_name
        self.category = category
        self.ctas_reporter = CTASReporter()
        self.neural_mux = NeuralMuxClient("http://localhost:18100")

    def execute(self, params: Dict[str, Any]) -> ToolResult:
        # Tool implementation
        result = self._perform_operation(params)

        # Automatic CTAS reporting
        self.ctas_reporter.report_execution({
            "tool": self.name,
            "category": self.category,
            "parameters": params,
            "result": result,
            "timestamp": datetime.utcnow(),
            "operator": self._get_current_user()
        })

        return result

    def _perform_operation(self, params: Dict[str, Any]) -> ToolResult:
        # Override in specific tool implementations
        raise NotImplementedError
\`\`\`

## Integration Points
1. **Neural Mux Reporting**: All tool executions reported to Command Center
2. **Knowledge Graph**: Tool results stored as intelligence entities
3. **Honeypot Integration**: Tools can deploy and manage honeypots
4. **Threat Intelligence**: Automatic correlation with threat databases

## Deployment Pipeline
Custom tools are packaged as crates, tested in isolated environments, and deployed through the Command Center interface.

## Security Considerations
All custom tools undergo automated security analysis and approval workflow before deployment in operational environments.`,
        category: 'Kali',
        tags: ['kali', 'pentesting', 'custom-tools', 'security', 'development'],
        lastModified: new Date(Date.now() - 1800000).toISOString(),
        sourceType: 'generated',
        url: '/docs/development/kali-tools',
        metadata: {
          totalTools: 25,
          deployedTools: 12,
          categories: 6
        }
      }
    ];

    setDocuments(generatedDocs);
  };

  const initializeKnowledgeGraph = () => {
    const knowledgeNodes: KnowledgeGraphNode[] = [
      {
        id: 'niem-core',
        type: 'standard',
        name: 'NIEM Core Schema',
        description: 'National Information Exchange Model core vocabulary',
        connections: ['justice-domain', 'intelligence-domain', 'emergency-mgmt'],
        confidence: 0.98,
        leptos_url: '/knowledge/niem-core'
      },
      {
        id: 'neural-mux',
        type: 'integration',
        name: 'Neural Mux API Gateway',
        description: 'Central API multiplexer for all CTAS services',
        connections: ['cannon-plug', 'command-center', 'enterprise-hub', 'weather-api'],
        confidence: 0.95,
        leptos_url: '/knowledge/neural-mux'
      },
      {
        id: 'honeypot-framework',
        type: 'tool',
        name: 'Dynamic Honeypot Framework',
        description: 'Programmable deception technology platform',
        connections: ['kali-tools', 'threat-intelligence', 'cyber-ops'],
        confidence: 0.92,
        leptos_url: '/knowledge/honeypots'
      },
      {
        id: 'enterprise-ontology',
        type: 'concept',
        name: 'CTAS Enterprise Ontology',
        description: 'Unified knowledge representation for cybersecurity operations',
        connections: ['niem-core', 'mitre-attack', 'cwe-cve', 'knowledge-graph'],
        confidence: 0.94,
        leptos_url: '/knowledge/ontology'
      }
    ];

    setKnowledgeGraph(knowledgeNodes);
  };

  const syncToLeptos = async (documentId: string) => {
    const document = documents.find(doc => doc.doc_id === documentId);
    if (!document) return;

    try {
      // Sync document to Leptos Knowledge Engine
      const response = await fetch('http://localhost:8080/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doc_id: document.doc_id,
          title: document.title,
          content: document.content,
          metadata: {
            ...document.metadata,
            source: 'Enterprise Integration Hub',
            category: document.category,
            tags: document.tags,
          }
        })
      });

      if (response.ok) {
        console.log(`Document ${document.title} synced to Leptos successfully`);
      }
    } catch (error) {
      console.error('Failed to sync to Leptos:', error);
    }
  };

  const exportToLeptos = async () => {
    // Export all Enterprise Hub documentation to Leptos
    for (const doc of documents) {
      await syncToLeptos(doc.doc_id);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'NIEM': return <Database className="w-4 h-4" />;
      case 'N-DEX': return <Shield className="w-4 h-4" />;
      case 'Weather': return <Globe className="w-4 h-4" />;
      case 'Kali': return <Target className="w-4 h-4" />;
      case 'Enterprise': return <Settings className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getSourceTypeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'generated': return 'text-blue-400 bg-blue-400/10';
      case 'manual': return 'text-green-400 bg-green-400/10';
      case 'imported': return 'text-orange-400 bg-orange-400/10';
      case 'synchronized': return 'text-purple-400 bg-purple-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const tabs = [
    { id: 'docs', label: 'Documentation', icon: BookOpen },
    { id: 'knowledge', label: 'Knowledge Graph', icon: Layers },
    { id: 'sync', label: 'Leptos Sync', icon: RefreshCw },
    { id: 'export', label: 'Export', icon: Download }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-slate-100">Leptos Documentation Bridge</h2>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              leptosConnected ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${leptosConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm">
                {leptosConnected ? 'Leptos Connected' : 'Leptos Offline'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={exportToLeptos}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Sync to Leptos</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
              <ExternalLink className="w-4 h-4" />
              <span>Open Leptos Site</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documentation, knowledge graph, or integration guides..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
            />
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
                    ? 'bg-cyan-600 text-white'
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
      {activeTab === 'docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.doc_id}
                className={`bg-slate-700 border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedDocument === doc.doc_id ? 'border-cyan-400' : 'border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => {
                  setSelectedDocument(doc.doc_id);
                  onDocumentSelect?.(doc);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(doc.category)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceTypeColor(doc.sourceType)}`}>
                        {doc.sourceType.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-slate-100 font-medium">{doc.title}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2">
                        {doc.content.substring(0, 150)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        syncToLeptos(doc.doc_id);
                      }}
                      className="p-1 text-cyan-400 hover:bg-cyan-400/10 rounded"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-blue-400 hover:bg-blue-400/10 rounded">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="bg-slate-600 text-slate-300 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {doc.tags.length > 3 && (
                      <span className="text-slate-400 text-xs">+{doc.tags.length - 3}</span>
                    )}
                  </div>
                  <span className="text-slate-400">
                    {new Date(doc.lastModified).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Document Preview */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Document Preview</h3>
            {selectedDocument ? (
              <div>
                {(() => {
                  const doc = documents.find(d => d.doc_id === selectedDocument);
                  if (!doc) return null;

                  return (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-slate-300 font-medium mb-2">{doc.title}</h4>
                        <div className="flex items-center space-x-2 mb-3">
                          {getCategoryIcon(doc.category)}
                          <span className="text-slate-400 text-sm">{doc.category}</span>
                        </div>
                      </div>

                      <div className="bg-slate-800 rounded p-3 text-xs text-slate-300 max-h-64 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{doc.content.substring(0, 800)}...</pre>
                      </div>

                      <div>
                        <h4 className="text-slate-300 font-medium mb-2">Metadata</h4>
                        <div className="bg-slate-800 rounded p-3 text-xs text-slate-300">
                          <pre>{JSON.stringify(doc.metadata, null, 2)}</pre>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button className="w-full px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm transition-colors">
                          Open in Leptos
                        </button>
                        <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                          Edit Documentation
                        </button>
                        <button className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                          Sync to Knowledge Graph
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p className="text-slate-400">Select a document to preview</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-6">Knowledge Graph Visualization</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {knowledgeGraph.map((node) => (
                <div key={node.id} className="bg-slate-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-slate-100 font-medium">{node.name}</h4>
                      <p className="text-slate-400 text-sm">{node.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      node.type === 'concept' ? 'bg-blue-400/10 text-blue-400' :
                      node.type === 'integration' ? 'bg-green-400/10 text-green-400' :
                      node.type === 'tool' ? 'bg-purple-400/10 text-purple-400' :
                      node.type === 'standard' ? 'bg-orange-400/10 text-orange-400' :
                      'bg-slate-400/10 text-slate-400'
                    }`}>
                      {node.type.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Confidence:</span>
                      <span className="text-green-400">{(node.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Connections:</span>
                      <span className="text-slate-200">{node.connections.length}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex space-x-2">
                    <button className="flex-1 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm transition-colors">
                      View in Leptos
                    </button>
                    <button className="px-3 py-1 bg-slate-500 hover:bg-slate-400 text-white rounded text-sm transition-colors">
                      <Link className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-6">Export to Leptos Knowledge Engine</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-slate-800 rounded p-4">
                <h4 className="text-slate-200 font-medium mb-3">Export Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-slate-300">Enterprise Integration Documentation</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-slate-300">Knowledge Graph Entities</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-slate-300">API Documentation</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-slate-300">Configuration Templates</span>
                  </label>
                </div>
              </div>

              <div className="bg-slate-800 rounded p-4">
                <h4 className="text-slate-200 font-medium mb-3">Export Format</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="format" value="markdown" className="rounded" defaultChecked />
                    <span className="text-slate-300">Markdown (.md)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="format" value="json" className="rounded" />
                    <span className="text-slate-300">JSON (.json)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="format" value="rust" className="rounded" />
                    <span className="text-slate-300">Rust Documentation (.rs)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-800 rounded p-4">
                <h4 className="text-slate-200 font-medium mb-3">Export Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Documents:</span>
                    <span className="text-slate-200">{documents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Knowledge Nodes:</span>
                    <span className="text-slate-200">{knowledgeGraph.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Export:</span>
                    <span className="text-slate-200">Never</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Leptos Status:</span>
                    <span className={leptosConnected ? 'text-green-400' : 'text-red-400'}>
                      {leptosConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={exportToLeptos}
                className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export to Leptos Knowledge Engine</span>
              </button>

              <div className="text-center text-sm text-slate-400">
                This will sync all Enterprise Hub documentation to the Leptos Knowledge Engine for unified access via the CTAS documentation site.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};