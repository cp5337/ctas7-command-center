import React, { useState, useEffect } from 'react';
import {
  Brain,
  Network,
  GitBranch,
  Layers,
  Zap,
  Shield,
  Code,
  Database,
  Target,
  Eye,
  Cpu,
  Globe,
  Lock,
  Users,
  Building,
  Search,
  Plus,
  Settings,
  Download,
  Upload,
  Trash2,
  Edit,
  Link,
  Unlink
} from 'lucide-react';

interface OntologyEntity {
  id: string;
  type: 'concept' | 'relation' | 'instance' | 'rule' | 'constraint';
  name: string;
  description: string;
  namespace: string;
  properties: Record<string, any>;
  relationships: OntologyRelationship[];
  metadata: EntityMetadata;
  confidence: number;
  source: 'manual' | 'inferred' | 'learned' | 'imported';
}

interface OntologyRelationship {
  id: string;
  type: 'is-a' | 'part-of' | 'related-to' | 'implements' | 'depends-on' | 'threatens' | 'mitigates';
  source: string;
  target: string;
  weight: number;
  bidirectional: boolean;
  context?: string;
}

interface EntityMetadata {
  created: string;
  modified: string;
  version: string;
  tags: string[];
  domain: 'cybersecurity' | 'development' | 'operations' | 'compliance' | 'intelligence';
  classification: 'public' | 'internal' | 'confidential' | 'classified';
}

interface OntologyNamespace {
  id: string;
  name: string;
  description: string;
  prefix: string;
  version: string;
  entityCount: number;
  lastModified: string;
}

interface CTASOntologyManagerProps {
  onEntitySelect?: (entity: OntologyEntity) => void;
}

export const CTASOntologyManager: React.FC<CTASOntologyManagerProps> = ({
  onEntitySelect
}) => {
  const [entities, setEntities] = useState<OntologyEntity[]>([]);
  const [namespaces, setNamespaces] = useState<OntologyNamespace[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'entities' | 'relationships' | 'reasoning' | 'xsd' | 'import'>('entities');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNamespace, setFilterNamespace] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showRelationshipGraph, setShowRelationshipGraph] = useState(false);

  useEffect(() => {
    // Initialize CTAS ontology with core cybersecurity concepts
    setNamespaces([
      {
        id: 'ctas-core',
        name: 'CTAS Core',
        description: 'Core cybersecurity threat analysis concepts',
        prefix: 'ctas',
        version: '1.0.0',
        entityCount: 247,
        lastModified: new Date().toISOString()
      },
      {
        id: 'nist-csf',
        name: 'NIST Cybersecurity Framework',
        description: 'NIST CSF functions, categories, and subcategories',
        prefix: 'nist',
        version: '1.1',
        entityCount: 104,
        lastModified: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'mitre-attack',
        name: 'MITRE ATT&CK',
        description: 'MITRE ATT&CK tactics, techniques, and procedures',
        prefix: 'mitre',
        version: '14.1',
        entityCount: 892,
        lastModified: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 'cwe-cve',
        name: 'CWE/CVE',
        description: 'Common Weakness Enumeration and Common Vulnerabilities',
        prefix: 'cwe',
        version: '4.13',
        entityCount: 1547,
        lastModified: new Date(Date.now() - 259200000).toISOString()
      }
    ]);

    setEntities([
      {
        id: 'ctas-001',
        type: 'concept',
        name: 'Threat Actor',
        description: 'An individual, group, or organization that conducts malicious cyber activities',
        namespace: 'ctas-core',
        properties: {
          sophisticationLevel: ['low', 'medium', 'high', 'advanced'],
          motivation: ['financial', 'political', 'espionage', 'ideological', 'personal'],
          resources: ['limited', 'moderate', 'substantial', 'government-backed']
        },
        relationships: [
          {
            id: 'rel-001',
            type: 'threatens',
            source: 'ctas-001',
            target: 'ctas-002',
            weight: 0.9,
            bidirectional: false,
            context: 'primary relationship'
          }
        ],
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          version: '1.0',
          tags: ['threat', 'actor', 'adversary'],
          domain: 'cybersecurity',
          classification: 'public'
        },
        confidence: 0.95,
        source: 'manual'
      },
      {
        id: 'ctas-002',
        type: 'concept',
        name: 'Digital Asset',
        description: 'Any computing resource that has value to an organization',
        namespace: 'ctas-core',
        properties: {
          assetType: ['hardware', 'software', 'data', 'network', 'cloud'],
          criticality: ['low', 'medium', 'high', 'critical'],
          classification: ['public', 'internal', 'confidential', 'classified']
        },
        relationships: [
          {
            id: 'rel-002',
            type: 'part-of',
            source: 'ctas-002',
            target: 'ctas-003',
            weight: 0.8,
            bidirectional: false
          }
        ],
        metadata: {
          created: new Date(Date.now() - 3600000).toISOString(),
          modified: new Date().toISOString(),
          version: '1.1',
          tags: ['asset', 'resource', 'value'],
          domain: 'cybersecurity',
          classification: 'internal'
        },
        confidence: 0.92,
        source: 'manual'
      },
      {
        id: 'ctas-003',
        type: 'concept',
        name: 'Attack Surface',
        description: 'The sum of all possible attack vectors where an unauthorized user can enter or extract data',
        namespace: 'ctas-core',
        properties: {
          surfaceType: ['network', 'physical', 'human', 'software'],
          exposure: ['internal', 'external', 'hybrid'],
          complexity: ['simple', 'moderate', 'complex']
        },
        relationships: [
          {
            id: 'rel-003',
            type: 'related-to',
            source: 'ctas-003',
            target: 'mitre-001',
            weight: 0.7,
            bidirectional: true,
            context: 'attack vectors'
          }
        ],
        metadata: {
          created: new Date(Date.now() - 7200000).toISOString(),
          modified: new Date().toISOString(),
          version: '1.0',
          tags: ['attack', 'surface', 'exposure'],
          domain: 'cybersecurity',
          classification: 'internal'
        },
        confidence: 0.88,
        source: 'inferred'
      },
      {
        id: 'mitre-001',
        type: 'instance',
        name: 'Initial Access',
        description: 'MITRE ATT&CK Tactic: Initial Access (TA0001)',
        namespace: 'mitre-attack',
        properties: {
          tacticId: 'TA0001',
          techniques: ['T1189', 'T1190', 'T1133', 'T1078'],
          description: 'The adversary is trying to get into your network'
        },
        relationships: [
          {
            id: 'rel-004',
            type: 'implements',
            source: 'mitre-001',
            target: 'ctas-004',
            weight: 0.9,
            bidirectional: false
          }
        ],
        metadata: {
          created: new Date(Date.now() - 86400000).toISOString(),
          modified: new Date(Date.now() - 3600000).toISOString(),
          version: '14.1',
          tags: ['mitre', 'tactic', 'initial-access'],
          domain: 'cybersecurity',
          classification: 'public'
        },
        confidence: 1.0,
        source: 'imported'
      },
      {
        id: 'ctas-004',
        type: 'concept',
        name: 'Honeypot',
        description: 'A security mechanism that creates a virtual trap to lure attackers',
        namespace: 'ctas-core',
        properties: {
          honeypotType: ['low-interaction', 'medium-interaction', 'high-interaction'],
          purpose: ['detection', 'deception', 'research', 'intelligence'],
          deployment: ['network', 'host', 'application', 'database']
        },
        relationships: [
          {
            id: 'rel-005',
            type: 'mitigates',
            source: 'ctas-004',
            target: 'ctas-001',
            weight: 0.6,
            bidirectional: false,
            context: 'detection and deception'
          }
        ],
        metadata: {
          created: new Date(Date.now() - 172800000).toISOString(),
          modified: new Date().toISOString(),
          version: '2.0',
          tags: ['honeypot', 'deception', 'detection'],
          domain: 'cybersecurity',
          classification: 'internal'
        },
        confidence: 0.94,
        source: 'manual'
      }
    ]);
  }, []);

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesNamespace = filterNamespace === 'all' || entity.namespace === filterNamespace;
    const matchesType = filterType === 'all' || entity.type === filterType;
    return matchesSearch && matchesNamespace && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'concept': return 'text-blue-400 bg-blue-400/10';
      case 'relation': return 'text-green-400 bg-green-400/10';
      case 'instance': return 'text-purple-400 bg-purple-400/10';
      case 'rule': return 'text-orange-400 bg-orange-400/10';
      case 'constraint': return 'text-red-400 bg-red-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400';
    if (confidence >= 0.7) return 'text-yellow-400';
    if (confidence >= 0.5) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'manual': return <Edit className="w-4 h-4" />;
      case 'inferred': return <Brain className="w-4 h-4" />;
      case 'learned': return <Cpu className="w-4 h-4" />;
      case 'imported': return <Download className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const handleEntitySelect = (entity: OntologyEntity) => {
    setSelectedEntity(entity.id);
    onEntitySelect?.(entity);
  };

  const tabs = [
    { id: 'entities', label: 'Entities', icon: Database },
    { id: 'relationships', label: 'Relationships', icon: Network },
    { id: 'reasoning', label: 'Reasoning', icon: Brain },
    { id: 'xsd', label: 'XSD Schema', icon: Code },
    { id: 'import', label: 'Import/Export', icon: Upload }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-slate-100">CTAS Ontology Manager</h2>
            <span className="px-3 py-1 bg-purple-400/10 text-purple-400 rounded-full text-sm">
              Knowledge Framework
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Entity</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
              <Network className="w-4 h-4" />
              <span>Visualize Graph</span>
            </button>
          </div>
        </div>

        {/* Namespace Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {namespaces.map((namespace) => (
            <div key={namespace.id} className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-slate-300">{namespace.name}</span>
              </div>
              <div className="text-lg font-bold text-cyan-400">{namespace.entityCount}</div>
              <div className="text-xs text-slate-400">v{namespace.version}</div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search entities, relationships, or concepts..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:border-purple-400 focus:outline-none"
            />
          </div>

          <select
            value={filterNamespace}
            onChange={(e) => setFilterNamespace(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:border-purple-400 focus:outline-none"
          >
            <option value="all">All Namespaces</option>
            {namespaces.map((ns) => (
              <option key={ns.id} value={ns.id}>{ns.name}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:border-purple-400 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="concept">Concepts</option>
            <option value="relation">Relations</option>
            <option value="instance">Instances</option>
            <option value="rule">Rules</option>
            <option value="constraint">Constraints</option>
          </select>
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
                    ? 'bg-purple-600 text-white'
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
      {activeTab === 'entities' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entity List */}
          <div className="lg:col-span-2 space-y-3">
            {filteredEntities.map((entity) => (
              <div
                key={entity.id}
                className={`bg-slate-700 border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedEntity === entity.id ? 'border-purple-400' : 'border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => handleEntitySelect(entity)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2">
                      {getSourceIcon(entity.source)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(entity.type)}`}>
                        {entity.type.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-slate-100 font-medium">{entity.name}</h3>
                      <p className="text-slate-400 text-sm">{entity.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`text-sm ${getConfidenceColor(entity.confidence)}`}>
                      {(entity.confidence * 100).toFixed(0)}%
                    </span>
                    <span className="text-xs text-slate-400">{entity.namespace}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {entity.metadata.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="bg-slate-600 text-slate-300 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                    {entity.metadata.tags.length > 3 && (
                      <span className="text-slate-400 text-xs">+{entity.metadata.tags.length - 3}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span>{entity.relationships.length} relations</span>
                    <span>•</span>
                    <span>{entity.metadata.domain}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Entity Details */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Entity Details</h3>
            {selectedEntity ? (
              <div>
                {(() => {
                  const entity = entities.find(e => e.id === selectedEntity);
                  if (!entity) return null;

                  return (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-slate-300 font-medium mb-2">{entity.name}</h4>
                        <p className="text-slate-400 text-sm mb-3">{entity.description}</p>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-slate-400">Type:</span>
                            <span className="text-slate-200 ml-2">{entity.type}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Namespace:</span>
                            <span className="text-slate-200 ml-2">{entity.namespace}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Confidence:</span>
                            <span className={`ml-2 ${getConfidenceColor(entity.confidence)}`}>
                              {(entity.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">Source:</span>
                            <span className="text-slate-200 ml-2">{entity.source}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-slate-300 font-medium mb-2">Properties</h4>
                        <div className="bg-slate-800 rounded p-3 text-xs font-mono text-slate-300">
                          <pre>{JSON.stringify(entity.properties, null, 2)}</pre>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-slate-300 font-medium mb-2">Relationships ({entity.relationships.length})</h4>
                        <div className="space-y-2">
                          {entity.relationships.map((rel) => (
                            <div key={rel.id} className="bg-slate-800 rounded p-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="text-cyan-400">{rel.type}</span>
                                <span className="text-slate-400">→</span>
                                <span className="text-slate-200">{rel.target}</span>
                                <span className="text-slate-400 text-xs">({(rel.weight * 100).toFixed(0)}%)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-slate-300 font-medium mb-2">Metadata</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Created:</span>
                            <span className="text-slate-200">{new Date(entity.metadata.created).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Modified:</span>
                            <span className="text-slate-200">{new Date(entity.metadata.modified).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Version:</span>
                            <span className="text-slate-200">{entity.metadata.version}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Classification:</span>
                            <span className="text-slate-200">{entity.metadata.classification}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p className="text-slate-400">Select an entity to view details</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reasoning' && (
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-6">Ontological Reasoning Engine</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-slate-800 rounded p-4">
                <h4 className="text-slate-200 font-medium mb-3">Inference Rules</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300">If A threatens B and B part-of C, then A threatens C</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300">If X mitigates Y and Y implements Z, then X mitigates Z</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300">If P is-a Q and Q has property R, then P has property R</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded p-4">
                <h4 className="text-slate-200 font-medium mb-3">Consistency Checks</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Circular dependencies</span>
                    <span className="text-green-400">✓ None found</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Conflicting relationships</span>
                    <span className="text-yellow-400">⚠ 2 warnings</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Missing properties</span>
                    <span className="text-green-400">✓ All complete</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-800 rounded p-4">
                <h4 className="text-slate-200 font-medium mb-3">Derived Knowledge</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-slate-700 rounded">
                    <span className="text-cyan-400">Inferred:</span>
                    <span className="text-slate-300 ml-2">Threat Actor → Digital Asset (via Attack Surface)</span>
                  </div>
                  <div className="p-2 bg-slate-700 rounded">
                    <span className="text-cyan-400">Inferred:</span>
                    <span className="text-slate-300 ml-2">Honeypot → MITRE Initial Access (mitigation)</span>
                  </div>
                  <div className="p-2 bg-slate-700 rounded">
                    <span className="text-cyan-400">Learned:</span>
                    <span className="text-slate-300 ml-2">High-interaction honeypots → Advanced threat actors</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded p-4">
                <h4 className="text-slate-200 font-medium mb-3">Query Interface</h4>
                <textarea
                  placeholder="Enter SPARQL query or natural language question..."
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-400 focus:border-purple-400 focus:outline-none"
                />
                <button className="w-full mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors">
                  Execute Query
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* XSD Schema Tab */}
      {activeTab === 'xsd' && (
        <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Code className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-semibold text-slate-100">CTAS Ontology XSD Schema</h3>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                Validate
              </button>
              <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                Download XSD
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* XSD Schema Display */}
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-slate-100 mb-4">Schema Definition</h4>
                <div className="bg-slate-900 rounded p-4 text-sm font-mono overflow-x-auto max-h-96 overflow-y-auto">
                  <pre className="text-slate-300">
{`<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
           xmlns:ctas="http://ctas.cyber.gov/ontology/core"
           targetNamespace="http://ctas.cyber.gov/ontology/core"
           elementFormDefault="qualified">

  <!-- CTAS Core Ontology Schema -->
  <xs:element name="CTASOntology" type="ctas:OntologyType"/>

  <xs:complexType name="OntologyType">
    <xs:sequence>
      <xs:element name="metadata" type="ctas:MetadataType"/>
      <xs:element name="namespaces" type="ctas:NamespacesType"/>
      <xs:element name="entities" type="ctas:EntitiesType"/>
      <xs:element name="relationships" type="ctas:RelationshipsType"/>
    </xs:sequence>
    <xs:attribute name="version" type="xs:string" use="required"/>
  </xs:complexType>

  <!-- Threat Actor Entity -->
  <xs:complexType name="ThreatActorType">
    <xs:complexContent>
      <xs:extension base="ctas:EntityType">
        <xs:sequence>
          <xs:element name="capabilities" type="ctas:CapabilitiesType"/>
          <xs:element name="motivations" type="ctas:MotivationsType"/>
          <xs:element name="resources" type="ctas:ResourcesType"/>
          <xs:element name="sophistication" type="ctas:SophisticationType"/>
        </xs:sequence>
      </xs:extension>
    </xs:complexContent>
  </xs:complexType>

  <!-- Digital Asset Entity -->
  <xs:complexType name="DigitalAssetType">
    <xs:complexContent>
      <xs:extension base="ctas:EntityType">
        <xs:sequence>
          <xs:element name="assetType" type="ctas:AssetTypeEnum"/>
          <xs:element name="criticality" type="ctas:CriticalityEnum"/>
          <xs:element name="classification" type="ctas:ClassificationEnum"/>
        </xs:sequence>
      </xs:extension>
    </xs:complexContent>
  </xs:complexType>

  <!-- Initial Access Methods -->
  <xs:complexType name="InitialAccessType">
    <xs:choice maxOccurs="unbounded">
      <xs:element name="driveByCompromise" type="ctas:T1189Type"/>
      <xs:element name="exploitPublicFacing" type="ctas:T1190Type"/>
      <xs:element name="externalRemoteServices" type="ctas:T1133Type"/>
      <xs:element name="validAccounts" type="ctas:T1078Type"/>
    </xs:choice>
  </xs:complexType>

  <!-- Threat Actor Digital Asset Attack Service -->
  <xs:complexType name="ThreatActorDigitalAssetAttackType">
    <xs:sequence>
      <xs:element name="threatActor" type="ctas:ThreatActorType"/>
      <xs:element name="targetAsset" type="ctas:DigitalAssetType"/>
      <xs:element name="attackService" type="ctas:AttackServiceType"/>
      <xs:element name="initialAccess" type="ctas:InitialAccessType"/>
    </xs:sequence>
  </xs:complexType>

  <!-- Attack Service Definition -->
  <xs:complexType name="AttackServiceType">
    <xs:sequence>
      <xs:element name="serviceType" type="xs:string"/>
      <xs:element name="deliveryMethod" type="xs:string"/>
      <xs:element name="payload" type="xs:string"/>
      <xs:element name="persistence" type="xs:boolean"/>
    </xs:sequence>
  </xs:complexType>

</xs:schema>`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Schema Documentation */}
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-slate-100 mb-4">Schema Documentation</h4>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-cyan-400 pl-3">
                    <h5 className="font-medium text-cyan-300">ThreatActorDigitalAssetAttackType</h5>
                    <p className="text-slate-400">Complete attack chain from threat actor through digital asset targeting via attack services and initial access methods.</p>
                  </div>
                  <div className="border-l-4 border-green-400 pl-3">
                    <h5 className="font-medium text-green-300">InitialAccessType</h5>
                    <p className="text-slate-400">MITRE ATT&CK initial access techniques: T1189 (Drive-by), T1190 (Exploit Public-Facing), T1133 (External Remote), T1078 (Valid Accounts).</p>
                  </div>
                  <div className="border-l-4 border-yellow-400 pl-3">
                    <h5 className="font-medium text-yellow-300">AttackServiceType</h5>
                    <p className="text-slate-400">Attack-as-a-Service definitions including delivery methods, payloads, and persistence mechanisms.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-slate-100 mb-4">Schema Statistics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-600 rounded p-3">
                    <div className="text-cyan-400 font-medium">Complex Types</div>
                    <div className="text-2xl font-bold text-slate-100">8</div>
                  </div>
                  <div className="bg-slate-600 rounded p-3">
                    <div className="text-green-400 font-medium">Elements</div>
                    <div className="text-2xl font-bold text-slate-100">16</div>
                  </div>
                  <div className="bg-slate-600 rounded p-3">
                    <div className="text-yellow-400 font-medium">Enumerations</div>
                    <div className="text-2xl font-bold text-slate-100">4</div>
                  </div>
                  <div className="bg-slate-600 rounded p-3">
                    <div className="text-purple-400 font-medium">Namespaces</div>
                    <div className="text-2xl font-bold text-slate-100">3</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-slate-100 mb-4">Validation Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">XSD Validity</span>
                    <span className="text-green-400">✓ Valid</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">NIEM Compliance</span>
                    <span className="text-green-400">✓ Compliant</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">MITRE Alignment</span>
                    <span className="text-green-400">✓ Aligned</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">W3C Standards</span>
                    <span className="text-green-400">✓ Conformant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};