import React, { useState, useEffect } from 'react';
import {
  Skull,
  Zap,
  Target,
  Eye,
  Link,
  Settings,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Search,
  Plus,
  Download,
  Share,
  List,
  Grid,
  Filter,
  Users,
  Building,
  Globe,
  Shield,
  Layers,
  Code,
  Database,
  Brain,
  Activity,
  Lock,
  Unlock,
  AlertTriangle,
  Bug,
  Crosshair
} from 'lucide-react';

interface EvilToolChain {
  id: string;
  name: string;
  description: string;
  category: 'reconnaissance' | 'weaponization' | 'delivery' | 'exploitation' | 'installation' | 'c2' | 'exfiltration';
  killChainPhase: string;
  complexity: 'script-kiddie' | 'intermediate' | 'advanced' | 'nation-state';
  targetType: 'infrastructure' | 'personnel' | 'data' | 'operations' | 'perception';
  tools: EvilTool[];
  automationLevel: number; // 0-100%
  detectionRisk: 'low' | 'medium' | 'high' | 'critical';
  ethicalRating: 'red-team' | 'penetration-test' | 'research' | 'adversarial-training';
  cognigraphIntegration: CognigraphNode[];
  lastModified: string;
  executionCount: number;
  successRate: number;
}

interface EvilTool {
  id: string;
  name: string;
  type: 'exploit' | 'payload' | 'persistence' | 'evasion' | 'intelligence' | 'psychological';
  language: 'rust' | 'python' | 'powershell' | 'bash' | 'assembly' | 'javascript';
  description: string;
  code: string;
  dependencies: string[];
  iocs: string[]; // Indicators of Compromise
  mitigations: string[];
  attribution: 'custom' | 'apt' | 'ransomware' | 'insider' | 'hacktivist';
}

interface CognigraphNode {
  id: string;
  nodeType: 'decision' | 'action' | 'condition' | 'loop' | 'parallel' | 'cognitive-bias';
  name: string;
  description: string;
  parameters: Record<string, any>;
  connections: string[];
  psychological_impact: 'confusion' | 'fear' | 'urgency' | 'authority' | 'social-proof';
}

interface AdvversarialScenario {
  id: string;
  name: string;
  description: string;
  targetOrganization: string;
  timeline: string;
  budget: string;
  sophistication: string;
  toolChains: string[];
  expectedOutcome: string;
  defensiveCounters: string[];
}

interface EvilToolChainFactoryProps {
  onChainDeploy?: (chain: EvilToolChain) => void;
}

export const EvilToolChainFactory: React.FC<EvilToolChainFactoryProps> = ({
  onChainDeploy
}) => {
  const [toolChains, setToolChains] = useState<EvilToolChain[]>([]);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'chains' | 'cognigraph' | 'scenarios' | 'red-team'>('chains');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string>('Adversarial Simulation Suite');

  useEffect(() => {
    // Initialize evil tool chains for red team / penetration testing
    setToolChains([
      {
        id: 'chain-1',
        name: 'Corporate Social Engineering Pipeline',
        description: 'Multi-stage social engineering attack chain targeting corporate executives',
        category: 'reconnaissance',
        killChainPhase: 'Reconnaissance → Weaponization → Delivery',
        complexity: 'advanced',
        targetType: 'personnel',
        tools: [
          {
            id: 'tool-se-1',
            name: 'LinkedIn Scraper Pro',
            type: 'intelligence',
            language: 'python',
            description: 'Advanced OSINT tool for gathering corporate hierarchy and personal details',
            code: `import linkedin_api
import psycopological_profiler

class CorporateIntelGatherer:
    def __init__(self):
        self.api = linkedin_api.Linkedin()
        self.profiler = psycopological_profiler.PersonalityAnalyzer()

    def build_target_profile(self, company: str) -> TargetProfile:
        executives = self.api.get_company_executives(company)
        profiles = []

        for exec in executives:
            personal_data = self.gather_personal_intel(exec)
            psychological_profile = self.profiler.analyze_personality(personal_data)
            vulnerability_assessment = self.assess_social_vulnerabilities(psychological_profile)

            profiles.append({
                "name": exec.name,
                "position": exec.position,
                "psychological_profile": psychological_profile,
                "attack_vectors": vulnerability_assessment.attack_vectors,
                "recommended_approach": vulnerability_assessment.approach
            })

        return TargetProfile(profiles)`,
            dependencies: ['linkedin_api', 'psychological_profiler', 'osint_framework'],
            iocs: ['LinkedIn API access patterns', 'Bulk profile requests', 'Data scraping signatures'],
            mitigations: ['LinkedIn privacy settings', 'Social media monitoring', 'Executive security training'],
            attribution: 'custom'
          },
          {
            id: 'tool-se-2',
            name: 'Phishing Email Generator',
            type: 'payload',
            language: 'python',
            description: 'AI-powered spear phishing email generator with psychological manipulation',
            code: `class SpearPhishingGenerator:
    def __init__(self):
        self.ai_writer = GPTWriter()
        self.template_engine = PhishingTemplates()

    def generate_spear_phish(self, target_profile: TargetProfile) -> PhishingEmail:
        # Analyze target's psychological profile
        personality = target_profile.psychological_profile
        vulnerabilities = target_profile.vulnerabilities

        # Select optimal manipulation technique
        if personality.trait_openness > 0.7:
            approach = "curiosity_exploitation"
        elif personality.trait_conscientiousness > 0.8:
            approach = "authority_compliance"
        else:
            approach = "social_proof"

        # Generate contextual email
        email_content = self.ai_writer.generate_email(
            approach=approach,
            target_interests=target_profile.interests,
            company_context=target_profile.company_info,
            urgency_level=self.calculate_optimal_urgency(personality)
        )

        return PhishingEmail(
            content=email_content,
            tracking_pixels=self.embed_tracking(),
            payload_links=self.generate_malicious_links(),
            psychological_triggers=approach
        )`,
            dependencies: ['gpt_api', 'email_templates', 'tracking_system'],
            iocs: ['Tracking pixel requests', 'Suspicious email patterns', 'URL shortener abuse'],
            mitigations: ['Email security gateways', 'User awareness training', 'Link analysis'],
            attribution: 'custom'
          }
        ],
        automationLevel: 85,
        detectionRisk: 'medium',
        ethicalRating: 'red-team',
        cognigraphIntegration: [
          {
            id: 'cog-1',
            nodeType: 'cognitive-bias',
            name: 'Authority Bias Exploitation',
            description: 'Leverage authority bias to increase compliance rates',
            parameters: {
              authority_figure: 'CEO/CTO',
              urgency_level: 'high',
              deadline_pressure: true
            },
            connections: ['decision-compliance', 'action-click-link'],
            psychological_impact: 'authority'
          }
        ],
        lastModified: new Date().toISOString(),
        executionCount: 12,
        successRate: 73.5
      },
      {
        id: 'chain-2',
        name: 'Advanced Persistent Threat Simulation',
        description: 'Nation-state level APT simulation with long-term persistence',
        category: 'installation',
        killChainPhase: 'Installation → Command & Control → Exfiltration',
        complexity: 'nation-state',
        targetType: 'infrastructure',
        tools: [
          {
            id: 'tool-apt-1',
            name: 'Polymorphic Implant',
            type: 'persistence',
            language: 'rust',
            description: 'Self-modifying implant with advanced evasion capabilities',
            code: `use std::process::Command;
use crypto::aes::AES256;
use network::covert_channel::DNSCovert;

struct PolymorphicImplant {
    encryption_key: [u8; 32],
    c2_domains: Vec<String>,
    evasion_techniques: Vec<EvasionMethod>,
    persistence_methods: Vec<PersistenceMethod>,
}

impl PolymorphicImplant {
    fn new() -> Self {
        Self {
            encryption_key: generate_random_key(),
            c2_domains: load_domain_fronting_list(),
            evasion_techniques: vec![
                EvasionMethod::ProcessHollowing,
                EvasionMethod::ReflectiveDLLLoading,
                EvasionMethod::MemoryPatching,
            ],
            persistence_methods: vec![
                PersistenceMethod::RegistryRun,
                PersistenceMethod::ServiceInstallation,
                PersistenceMethod::WMIEventSubscription,
            ],
        }
    }

    async fn establish_persistence(&self) -> Result<(), ImplantError> {
        // Randomly select persistence method to avoid detection patterns
        let method = self.persistence_methods
            .choose(&mut thread_rng())
            .unwrap();

        match method {
            PersistenceMethod::ServiceInstallation => {
                self.install_as_service().await?;
            },
            PersistenceMethod::WMIEventSubscription => {
                self.create_wmi_persistence().await?;
            },
            _ => {}
        }

        Ok(())
    }

    async fn morph_code(&mut self) -> Result<(), ImplantError> {
        // Recompile with new binary signature
        let new_binary = self.generate_polymorphic_variant().await?;
        self.replace_running_process(new_binary).await?;

        // Update evasion techniques
        self.rotate_evasion_methods().await?;

        Ok(())
    }
}`,
            dependencies: ['crypto', 'windows_api', 'covert_channels'],
            iocs: ['Unusual network patterns', 'Registry modifications', 'Service installations'],
            mitigations: ['EDR solutions', 'Network monitoring', 'Behavioral analysis'],
            attribution: 'apt'
          }
        ],
        automationLevel: 95,
        detectionRisk: 'low',
        ethicalRating: 'adversarial-training',
        cognigraphIntegration: [
          {
            id: 'cog-apt-1',
            nodeType: 'decision',
            name: 'Persistence Decision Tree',
            description: 'Intelligent selection of persistence mechanisms based on environment',
            parameters: {
              os_version: 'dynamic',
              security_tools: 'detected',
              privilege_level: 'assessed'
            },
            connections: ['action-install-service', 'action-registry-modify'],
            psychological_impact: 'confusion'
          }
        ],
        lastModified: new Date(Date.now() - 86400000).toISOString(),
        executionCount: 3,
        successRate: 92.1
      },
      {
        id: 'chain-3',
        name: 'Cognitive Warfare Campaign',
        description: 'Information warfare and perception manipulation campaign',
        category: 'weaponization',
        killChainPhase: 'Weaponization → Delivery → Actions on Objectives',
        complexity: 'advanced',
        targetType: 'perception',
        tools: [
          {
            id: 'tool-cog-1',
            name: 'Narrative Injection Engine',
            type: 'psychological',
            language: 'javascript',
            description: 'Social media manipulation and narrative seeding platform',
            code: `class NarrativeInjectionEngine {
    constructor() {
        this.socialPlatforms = ['twitter', 'facebook', 'linkedin', 'reddit'];
        this.aiContentGenerator = new GPTContentEngine();
        this.influenceNetwork = new BotNetManager();
        this.sentimentAnalyzer = new SentimentAnalysis();
    }

    async deployNarrativeCampaign(narrative, targetAudience, duration) {
        // Phase 1: Seed initial narrative
        const seedContent = await this.generateSeedPosts(narrative, targetAudience);
        await this.deploySeedContent(seedContent);

        // Phase 2: Amplify through bot network
        const amplificationBots = await this.activateBotNetwork(targetAudience.size * 0.1);
        await this.amplifyNarrative(narrative, amplificationBots);

        // Phase 3: Monitor and adapt
        const sentimentTracker = setInterval(async () => {
            const currentSentiment = await this.sentimentAnalyzer.analyze(narrative.hashtags);

            if (currentSentiment.negativity > 0.7) {
                // Narrative is being rejected, pivot strategy
                const newAngle = await this.generateNarrativePivot(narrative, currentSentiment);
                await this.deployPivot(newAngle);
            }
        }, 60000); // Check every minute

        // Phase 4: Measure influence spread
        return new Promise((resolve) => {
            setTimeout(() => {
                clearInterval(sentimentTracker);
                const results = this.measureCampaignImpact(narrative);
                resolve(results);
            }, duration);
        });
    }

    async generatePsychologicalProfile(targetAudience) {
        // Analyze target audience psychological vulnerabilities
        const profiles = [];

        for (const segment of targetAudience.segments) {
            const cognitiveProfile = await this.analyzeCognitiveBiases(segment);
            const emotionalTriggers = await this.identifyEmotionalTriggers(segment);
            const groupThinkPatterns = await this.analyzeGroupDynamics(segment);

            profiles.push({
                segment: segment.name,
                biases: cognitiveProfile,
                triggers: emotionalTriggers,
                groupDynamics: groupThinkPatterns,
                optimalNarratives: this.generateOptimalNarratives(
                    cognitiveProfile,
                    emotionalTriggers
                )
            });
        }

        return profiles;
    }
}`,
            dependencies: ['social_apis', 'gpt_engine', 'sentiment_analysis', 'bot_management'],
            iocs: ['Coordinated inauthentic behavior', 'Rapid narrative spread', 'Bot-like posting patterns'],
            mitigations: ['Social media monitoring', 'Bot detection algorithms', 'Fact-checking systems'],
            attribution: 'hacktivist'
          }
        ],
        automationLevel: 90,
        detectionRisk: 'high',
        ethicalRating: 'research',
        cognigraphIntegration: [
          {
            id: 'cog-war-1',
            nodeType: 'parallel',
            name: 'Multi-Platform Narrative Deployment',
            description: 'Simultaneous narrative injection across multiple social platforms',
            parameters: {
              platforms: ['twitter', 'facebook', 'reddit'],
              timing: 'coordinated',
              message_variants: 'adaptive'
            },
            connections: ['condition-sentiment-check', 'action-pivot-strategy'],
            psychological_impact: 'social-proof'
          }
        ],
        lastModified: new Date(Date.now() - 172800000).toISOString(),
        executionCount: 7,
        successRate: 68.3
      }
    ]);
  }, []);

  const filteredChains = toolChains.filter(chain => {
    const matchesSearch = chain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chain.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || chain.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'nation-state': return 'text-red-400 bg-red-400/10';
      case 'advanced': return 'text-orange-400 bg-orange-400/10';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/10';
      case 'script-kiddie': return 'text-green-400 bg-green-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getDetectionRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reconnaissance': return <Eye className="w-4 h-4" />;
      case 'weaponization': return <Bug className="w-4 h-4" />;
      case 'delivery': return <Target className="w-4 h-4" />;
      case 'exploitation': return <Unlock className="w-4 h-4" />;
      case 'installation': return <Download className="w-4 h-4" />;
      case 'c2': return <Activity className="w-4 h-4" />;
      case 'exfiltration': return <Database className="w-4 h-4" />;
      default: return <Code className="w-4 h-4" />;
    }
  };

  const handleChainSelect = (chain: EvilToolChain) => {
    setSelectedChain(chain.id);
  };

  const tabs = [
    { id: 'chains', label: 'Evil Tool Chains', icon: Link },
    { id: 'cognigraph', label: 'Cognigraph', icon: Brain },
    { id: 'scenarios', label: 'Adversarial Scenarios', icon: Target },
    { id: 'red-team', label: 'Red Team Ops', icon: Skull }
  ];

  return (
    <div className="bg-slate-800 border border-red-400/20 rounded-lg overflow-hidden">
      {/* iTunes-style Header */}
      <div className="bg-gradient-to-r from-red-900 to-slate-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Skull className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold text-slate-100">Evil Tool Chain Factory</h2>
            <span className="px-3 py-1 bg-red-400/10 text-red-400 rounded-full text-sm">
              Adversarial Simulation
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
              placeholder="Search evil tool chains, attack vectors, or cognitive patterns..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:border-red-400 focus:outline-none"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:border-red-400 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="reconnaissance">Reconnaissance</option>
            <option value="weaponization">Weaponization</option>
            <option value="delivery">Delivery</option>
            <option value="exploitation">Exploitation</option>
            <option value="installation">Installation</option>
            <option value="c2">C2</option>
            <option value="exfiltration">Exfiltration</option>
          </select>

          <div className="flex items-center space-x-1 bg-slate-700 rounded-md p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200'
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
                    ? 'bg-red-600 text-white'
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
        {activeTab === 'chains' && (
          <div>
            {viewMode === 'list' ? (
              <div className="space-y-3">
                {filteredChains.map((chain, index) => (
                  <div
                    key={chain.id}
                    className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedChain === chain.id
                        ? 'bg-red-600/20 border border-red-400'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                    onClick={() => handleChainSelect(chain)}
                  >
                    <div className="w-8 text-slate-400 text-sm">{index + 1}</div>
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                      <Skull className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-slate-100 font-medium truncate">{chain.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(chain.complexity)}`}>
                          {chain.complexity.toUpperCase()}
                        </span>
                        <div className="flex items-center space-x-1">
                          {getCategoryIcon(chain.category)}
                          <span className="text-slate-400 text-sm capitalize">{chain.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-slate-400">
                        <span>{chain.killChainPhase}</span>
                        <span>{chain.tools.length} tools</span>
                        <span>{chain.automationLevel}% automated</span>
                        <span className={getDetectionRiskColor(chain.detectionRisk)}>
                          {chain.detectionRisk} detection risk
                        </span>
                        <span>Success: {chain.successRate}%</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-orange-400 text-sm">
                        {chain.executionCount} runs
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onChainDeploy?.(chain);
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                      >
                        Deploy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChains.map((chain) => (
                  <div
                    key={chain.id}
                    className={`bg-slate-700 rounded-lg p-6 cursor-pointer transition-colors ${
                      selectedChain === chain.id
                        ? 'ring-2 ring-red-400'
                        : 'hover:bg-slate-600'
                    }`}
                    onClick={() => handleChainSelect(chain)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
                        <Skull className="w-8 h-8" />
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(chain.complexity)}`}>
                        {chain.complexity.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-slate-100 font-medium mb-2">{chain.name}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{chain.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Category:</span>
                        <span className="text-slate-200 capitalize">{chain.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target:</span>
                        <span className="text-slate-200 capitalize">{chain.targetType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Automation:</span>
                        <span className="text-slate-200">{chain.automationLevel}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Success Rate:</span>
                        <span className="text-green-400">{chain.successRate}%</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-600">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onChainDeploy?.(chain);
                        }}
                        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      >
                        Deploy Evil Chain
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'cognigraph' && (
          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-6">Cognigraph Integration</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-800 rounded p-4">
                  <h4 className="text-slate-200 font-medium mb-3">Cognitive Bias Exploitation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-slate-700 rounded">
                      <span className="text-slate-300">Authority Bias</span>
                      <span className="text-red-400">High Impact</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-700 rounded">
                      <span className="text-slate-300">Confirmation Bias</span>
                      <span className="text-orange-400">Medium Impact</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-700 rounded">
                      <span className="text-slate-300">Social Proof</span>
                      <span className="text-red-400">High Impact</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-700 rounded">
                      <span className="text-slate-300">Scarcity Effect</span>
                      <span className="text-yellow-400">Variable Impact</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 rounded p-4">
                  <h4 className="text-slate-200 font-medium mb-3">Psychological Triggers</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-slate-700 rounded">
                      <span className="text-orange-400">Fear:</span>
                      <span className="text-slate-300 ml-2">Job security, data loss, reputation damage</span>
                    </div>
                    <div className="p-2 bg-slate-700 rounded">
                      <span className="text-blue-400">Urgency:</span>
                      <span className="text-slate-300 ml-2">Time-limited offers, deadline pressure</span>
                    </div>
                    <div className="p-2 bg-slate-700 rounded">
                      <span className="text-green-400">Authority:</span>
                      <span className="text-slate-300 ml-2">Executive requests, regulatory compliance</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-800 rounded p-4">
                  <h4 className="text-slate-200 font-medium mb-3">Decision Flow Graph</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 bg-slate-700 rounded">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span className="text-slate-300">Target Identification</span>
                      <span className="text-slate-400">→</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-slate-700 rounded">
                      <Eye className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-300">Psychological Profiling</span>
                      <span className="text-slate-400">→</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-slate-700 rounded">
                      <Target className="w-4 h-4 text-red-400" />
                      <span className="text-slate-300">Attack Vector Selection</span>
                      <span className="text-slate-400">→</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 bg-slate-700 rounded">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-slate-300">Execution & Adaptation</span>
                    </div>
                  </div>
                </div>

                <button className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors">
                  Open Cognigraph Designer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};