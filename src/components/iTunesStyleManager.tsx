import React, { useState, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Search,
  Plus,
  Star,
  Download,
  Share,
  List,
  Grid,
  Filter,
  Settings,
  Users,
  Building,
  Globe,
  Zap,
  Shield,
  Layers,
  Code,
  Database
} from 'lucide-react';

interface CustomerProfile {
  id: string;
  name: string;
  domain: string;
  industry: 'finance' | 'healthcare' | 'government' | 'tech' | 'defense' | 'energy';
  tier: 'starter' | 'professional' | 'enterprise' | 'government';
  status: 'onboarding' | 'active' | 'trial' | 'suspended';
  onboardingProgress: number;
  services: string[];
  customizations: CustomerCustomization[];
  lastActivity: string;
  totalUsers: number;
  dataProcessed: string;
  securityLevel: 'standard' | 'enhanced' | 'classified';
}

interface CustomerCustomization {
  type: 'ui-theme' | 'workflow' | 'integration' | 'security-policy' | 'data-retention';
  name: string;
  description: string;
  status: 'pending' | 'configured' | 'deployed';
  config: any;
}

interface DomainTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  features: string[];
  estimatedSetupTime: string;
  complexity: 'simple' | 'moderate' | 'complex';
  preview: string;
}

interface iTunesStyleManagerProps {
  onCustomerSelect?: (customer: CustomerProfile) => void;
}

export const iTunesStyleManager: React.FC<iTunesStyleManagerProps> = ({
  onCustomerSelect
}) => {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [domainTemplates, setDomainTemplates] = useState<DomainTemplate[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'customers' | 'templates' | 'onboarding' | 'analytics'>('customers');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string>('Customer Onboarding Suite');

  useEffect(() => {
    // Mock customer data
    setCustomers([
      {
        id: 'cust-1',
        name: 'Cyber Defense Corp',
        domain: 'cyberdefense.mil',
        industry: 'defense',
        tier: 'government',
        status: 'active',
        onboardingProgress: 100,
        services: ['CTAS Core', 'Honeypot Network', 'Threat Intel', 'Custom Workflows'],
        customizations: [
          {
            type: 'security-policy',
            name: 'NIST Cybersecurity Framework',
            description: 'Government-grade security policies and compliance',
            status: 'deployed',
            config: { framework: 'NIST', level: 'high' }
          },
          {
            type: 'ui-theme',
            name: 'Military Dark Theme',
            description: 'High contrast interface for operational environments',
            status: 'deployed',
            config: { theme: 'military-dark', contrast: 'high' }
          }
        ],
        lastActivity: '2 minutes ago',
        totalUsers: 247,
        dataProcessed: 'Real Network Monitor Active',
        securityLevel: 'classified'
      },
      {
        id: 'cust-2',
        name: 'Global Financial Services',
        domain: 'globalfin.com',
        industry: 'finance',
        tier: 'enterprise',
        status: 'onboarding',
        onboardingProgress: 65,
        services: ['CTAS Core', 'Fraud Detection', 'Compliance Dashboard'],
        customizations: [
          {
            type: 'integration',
            name: 'Bloomberg Terminal Integration',
            description: 'Real-time financial data integration',
            status: 'configured',
            config: { provider: 'bloomberg', realtime: true }
          },
          {
            type: 'data-retention',
            name: 'SOX Compliance Retention',
            description: '7-year data retention for SOX compliance',
            status: 'pending',
            config: { retention: '7years', compliance: 'SOX' }
          }
        ],
        lastActivity: '1 hour ago',
        totalUsers: 89,
        dataProcessed: 'Network Ping: 8.9ms to 192.168.1.218',
        securityLevel: 'enhanced'
      },
      {
        id: 'cust-3',
        name: 'MedTech Innovations',
        domain: 'medtech.health',
        industry: 'healthcare',
        tier: 'professional',
        status: 'trial',
        onboardingProgress: 30,
        services: ['CTAS Core', 'HIPAA Compliance'],
        customizations: [
          {
            type: 'security-policy',
            name: 'HIPAA Privacy Rules',
            description: 'Healthcare data protection and privacy',
            status: 'configured',
            config: { standard: 'HIPAA', encryption: 'AES-256' }
          }
        ],
        lastActivity: '3 hours ago',
        totalUsers: 12,
        dataProcessed: '450 GB',
        securityLevel: 'enhanced'
      }
    ]);

    // Mock domain templates
    setDomainTemplates([
      {
        id: 'tmpl-1',
        name: 'Financial Services Suite',
        industry: 'finance',
        description: 'Complete cybersecurity solution for financial institutions',
        features: ['Fraud Detection', 'SOX Compliance', 'Real-time Monitoring', 'Risk Assessment'],
        estimatedSetupTime: '2-3 weeks',
        complexity: 'complex',
        preview: 'Financial dashboard with real-time fraud detection and compliance monitoring'
      },
      {
        id: 'tmpl-2',
        name: 'Healthcare Security Framework',
        industry: 'healthcare',
        description: 'HIPAA-compliant security infrastructure for healthcare providers',
        features: ['HIPAA Compliance', 'Patient Data Protection', 'Audit Trails', 'Access Controls'],
        estimatedSetupTime: '1-2 weeks',
        complexity: 'moderate',
        preview: 'Healthcare-focused security dashboard with patient data protection'
      },
      {
        id: 'tmpl-3',
        name: 'Government Cyber Defense',
        industry: 'government',
        description: 'Military-grade cybersecurity for government agencies',
        features: ['NIST Framework', 'Classified Data Handling', 'Threat Intelligence', 'Incident Response'],
        estimatedSetupTime: '4-6 weeks',
        complexity: 'complex',
        preview: 'Government-grade interface with classification levels and threat monitoring'
      },
      {
        id: 'tmpl-4',
        name: 'Tech Startup Accelerator',
        industry: 'tech',
        description: 'Rapid deployment security suite for growing tech companies',
        features: ['Basic Monitoring', 'Developer Tools', 'API Security', 'Growth Analytics'],
        estimatedSetupTime: '3-5 days',
        complexity: 'simple',
        preview: 'Clean, developer-friendly interface with growth-focused metrics'
      }
    ]);
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = filterIndustry === 'all' || customer.industry === filterIndustry;
    return matchesSearch && matchesIndustry;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'onboarding': return 'text-blue-400 bg-blue-400/10';
      case 'trial': return 'text-yellow-400 bg-yellow-400/10';
      case 'suspended': return 'text-red-400 bg-red-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getIndustryIcon = (industry: string) => {
    switch (industry) {
      case 'finance': return <Building className="w-4 h-4" />;
      case 'healthcare': return <Plus className="w-4 h-4" />;
      case 'government': return <Shield className="w-4 h-4" />;
      case 'defense': return <Shield className="w-4 h-4" />;
      case 'tech': return <Code className="w-4 h-4" />;
      case 'energy': return <Zap className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'government': return 'text-red-400';
      case 'enterprise': return 'text-purple-400';
      case 'professional': return 'text-blue-400';
      case 'starter': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const handleCustomerSelect = (customer: CustomerProfile) => {
    setSelectedCustomer(customer.id);
    onCustomerSelect?.(customer);
  };

  const tabs = [
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'templates', label: 'Domain Templates', icon: Layers },
    { id: 'onboarding', label: 'Onboarding', icon: Download },
    { id: 'analytics', label: 'Analytics', icon: Database }
  ];

  return (
    <div className="bg-slate-800 border border-cyan-400/20 rounded-lg overflow-hidden">
      {/* iTunes-style Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Music className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-slate-100">Customer Experience Manager</h2>
            <span className="px-3 py-1 bg-cyan-400/10 text-cyan-400 rounded-full text-sm">
              Dynamic Domain Adaptation
            </span>
          </div>

          {/* iTunes-style Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-800 rounded-lg px-3 py-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-slate-300 hover:text-white transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button className="text-slate-300 hover:text-white transition-colors">
                <SkipBack className="w-4 h-4" />
              </button>
              <button className="text-slate-300 hover:text-white transition-colors">
                <SkipForward className="w-4 h-4" />
              </button>
              <Volume2 className="w-4 h-4 text-slate-400" />
            </div>

            <div className="text-slate-300 text-sm">
              ♪ {currentTrack}
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customers, domains, or services..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">All Industries</option>
            <option value="finance">Finance</option>
            <option value="healthcare">Healthcare</option>
            <option value="government">Government</option>
            <option value="defense">Defense</option>
            <option value="tech">Technology</option>
            <option value="energy">Energy</option>
          </select>

          <div className="flex items-center space-x-1 bg-slate-700 rounded-md p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 mt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-600'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="p-6 bg-slate-800">
        {activeTab === 'customers' && (
          <div>
            {viewMode === 'list' ? (
              <div className="space-y-2">
                {filteredCustomers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCustomer === customer.id
                        ? 'bg-cyan-600/20 border border-cyan-400'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="w-8 text-slate-400 text-sm">{index + 1}</div>
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                      {customer.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-slate-100 font-medium truncate">{customer.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                          {customer.status.toUpperCase()}
                        </span>
                        <div className="flex items-center space-x-1">
                          {getIndustryIcon(customer.industry)}
                          <span className="text-slate-400 text-sm capitalize">{customer.industry}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-slate-400">
                        <span>{customer.domain}</span>
                        <span className={getTierColor(customer.tier)}>{customer.tier}</span>
                        <span>{customer.totalUsers} users</span>
                        <span>{customer.dataProcessed} processed</span>
                        <span>Last active: {customer.lastActivity}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {customer.status === 'onboarding' && (
                        <div className="text-blue-400 text-sm">
                          {customer.onboardingProgress}% complete
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-slate-400 text-sm">{customer.services.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`bg-slate-700 rounded-lg p-6 cursor-pointer transition-colors ${
                      selectedCustomer === customer.id
                        ? 'ring-2 ring-cyan-400'
                        : 'hover:bg-slate-600'
                    }`}
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {customer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                        {customer.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-slate-100 font-medium mb-2">{customer.name}</h3>
                    <p className="text-slate-400 text-sm mb-4">{customer.domain}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Industry:</span>
                        <span className="text-slate-200 capitalize">{customer.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tier:</span>
                        <span className={getTierColor(customer.tier)}>{customer.tier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Users:</span>
                        <span className="text-slate-200">{customer.totalUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Services:</span>
                        <span className="text-slate-200">{customer.services.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {domainTemplates.map((template) => (
              <div key={template.id} className="bg-slate-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-slate-100 font-medium mb-2">{template.name}</h3>
                    <p className="text-slate-400 text-sm mb-3">{template.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-slate-400">Industry: <span className="text-slate-200 capitalize">{template.industry}</span></span>
                      <span className="text-slate-400">Setup: <span className="text-slate-200">{template.estimatedSetupTime}</span></span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    template.complexity === 'complex' ? 'bg-red-400/10 text-red-400' :
                    template.complexity === 'moderate' ? 'bg-yellow-400/10 text-yellow-400' :
                    'bg-green-400/10 text-green-400'
                  }`}>
                    {template.complexity.toUpperCase()}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="text-slate-300 text-sm font-medium mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {template.features.map((feature) => (
                      <span key={feature} className="bg-slate-600 text-slate-300 px-2 py-1 rounded text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800 rounded p-3 mb-4">
                  <p className="text-slate-300 text-sm">{template.preview}</p>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm transition-colors">
                    Deploy Template
                  </button>
                  <button className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded text-sm transition-colors">
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'onboarding' && selectedCustomer && (
          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-6">
              Customer Onboarding - {customers.find(c => c.id === selectedCustomer)?.name}
            </h3>

            <div className="space-y-6">
              {customers.find(c => c.id === selectedCustomer)?.customizations.map((customization, index) => (
                <div key={index} className="bg-slate-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-slate-100 font-medium">{customization.name}</h4>
                      <p className="text-slate-400 text-sm">{customization.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      customization.status === 'deployed' ? 'bg-green-400/10 text-green-400' :
                      customization.status === 'configured' ? 'bg-blue-400/10 text-blue-400' :
                      'bg-yellow-400/10 text-yellow-400'
                    }`}>
                      {customization.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-slate-800 rounded p-3">
                    <pre className="text-xs text-slate-300">
                      {JSON.stringify(customization.config, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};