/**
 * Agent Design Studio - Foundation Phase 1
 *
 * Visual platform for designing, composing, and deploying intelligent agents
 * within the CTAS-7 ecosystem. Integrates with Forge Workflow System and SDIO discovery.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bot, Cpu, Network, Satellite, Globe, Anchor,
  Palette, Mic, Wrench, Brain, Users, Settings,
  Play, Save, Upload, Download, Eye, Edit3, Plus,
  Layers, Grid, Workflow, Zap, Shield, Database
} from 'lucide-react';

// Types for Agent Design Studio
interface AgentBlueprint {
  id: string;
  name: string;
  world: 'network' | 'space' | 'ctas' | 'geographical' | 'maritime';
  tenant: string;
  skills: SkillReference[];
  mcps: MCPConfiguration[];
  tools: ToolIntegration[];
  persona: PersonaDefinition;
  voice: VoiceConfiguration;
  executionEngine: 'synaptix9' | 'neural-mux' | 'legion-ecs';
  forgeNode: ForgeWorkflowNode;
  sdioFeatures: XSDFeature[];
}

interface SkillReference {
  id: string;
  name: string;
  category: 'analytical' | 'communicative' | 'operational' | 'cognitive' | 'creative';
  world: string[];
  implementation: string;
}

interface MCPConfiguration {
  name: string;
  version: string;
  world: string;
  protocol: {
    input_schema: any;
    output_schema: any;
    streaming: boolean;
  };
}

interface ToolIntegration {
  id: string;
  name: string;
  category: 'data_source' | 'analysis_engine' | 'communication' | 'action_executor';
  integration: {
    type: string;
    endpoint: string;
  };
}

interface PersonaDefinition {
  id: string;
  name: string;
  archetype: 'analyst' | 'commander' | 'specialist' | 'coordinator' | 'advisor';
  communication_style: string;
  world_specialization: string[];
}

interface VoiceConfiguration {
  id: string;
  name: string;
  tone: 'professional' | 'friendly' | 'authoritative' | 'supportive';
  formality: 'formal' | 'semi_formal' | 'casual';
  voiceNumber: number;
  accent: string;
  elevenLabsId: string;
}

interface ForgeWorkflowNode {
  node_type: 'AgentProcessor';
  workflow_id: string;
  instance_id: string;
  blake3_hash: string;
  usim_context: string;
}

interface XSDFeature {
  feature: 'XSD_P1_BasicAgent' | 'XSD_P2_NeuralMux' | 'XSD_P3_QuantumSafe';
  version: string;
  enabled: boolean;
}

interface ComponentPalette {
  skills: SkillReference[];
  mcps: MCPConfiguration[];
  tools: ToolIntegration[];
  personas: PersonaDefinition[];
  voices: VoiceConfiguration[];
}

export function AgentDesignStudio() {
  const [activeWorld, setActiveWorld] = useState<string>('network');
  const [selectedAgent, setSelectedAgent] = useState<AgentBlueprint | null>(null);
  const [isDesigning, setIsDesigning] = useState(false);
  const [componentPalette, setComponentPalette] = useState<ComponentPalette>({
    skills: [],
    mcps: [],
    tools: [],
    personas: [],
    voices: []
  });
  const [agents, setAgents] = useState<AgentBlueprint[]>([]);
  const [isConnectedToForge, setIsConnectedToForge] = useState(false);
  const [sdioStatus, setSDIOStatus] = useState<'connected' | 'discovering' | 'disconnected'>('disconnected');

  // World configuration with icons and colors
  const worlds = [
    {
      id: 'network',
      name: 'Network',
      icon: Network,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      description: 'Cyber intelligence, network analysis agents'
    },
    {
      id: 'space',
      name: 'Space',
      icon: Satellite,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      description: 'Satellite operations, orbital mechanics agents'
    },
    {
      id: 'ctas',
      name: 'CTAS',
      icon: Bot,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      description: 'Tactical analysis, decision support agents'
    },
    {
      id: 'geographical',
      name: 'Geographical',
      icon: Globe,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      description: 'Terrain analysis, location intelligence agents'
    },
    {
      id: 'maritime',
      name: 'Maritime',
      icon: Anchor,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      description: 'Naval operations, maritime domain agents'
    }
  ];

  // Component categories for the palette
  const componentCategories = [
    { id: 'skills', name: 'Skills', icon: Brain, color: 'text-emerald-400' },
    { id: 'mcps', name: 'MCPs', icon: Cpu, color: 'text-orange-400' },
    { id: 'tools', name: 'Tools', icon: Wrench, color: 'text-blue-400' },
    { id: 'personas', name: 'Personas', icon: Users, color: 'text-pink-400' },
    { id: 'voices', name: 'Voices', icon: Mic, color: 'text-violet-400' }
  ];

  // Initialize component discovery
  useEffect(() => {
    discoverComponents();
    testForgeConnection();
    initializeSDIODiscovery();
  }, [activeWorld]);

  const discoverComponents = useCallback(async () => {
    setSDIOStatus('discovering');

    try {
      // Simulate SDIO discovery for world-specific components
      const mockSkills: SkillReference[] = [
        {
          id: 'skill_001',
          name: 'Threat Analysis',
          category: 'analytical',
          world: [activeWorld],
          implementation: `ctas7-mcp-${activeWorld}-threat-analysis`
        },
        {
          id: 'skill_002',
          name: 'Data Correlation',
          category: 'cognitive',
          world: [activeWorld],
          implementation: `ctas7-mcp-${activeWorld}-data-correlation`
        },
        {
          id: 'skill_003',
          name: 'Real-time Monitoring',
          category: 'operational',
          world: [activeWorld],
          implementation: `ctas7-mcp-${activeWorld}-monitoring`
        }
      ];

      const mockMCPs: MCPConfiguration[] = [
        {
          name: `ctas7-mcp-${activeWorld}-control`,
          version: '1.0.0',
          world: activeWorld,
          protocol: {
            input_schema: {},
            output_schema: {},
            streaming: true
          }
        },
        {
          name: `ctas7-mcp-${activeWorld}-intelligence`,
          version: '1.0.0',
          world: activeWorld,
          protocol: {
            input_schema: {},
            output_schema: {},
            streaming: false
          }
        }
      ];

      const mockTools: ToolIntegration[] = [
        {
          id: 'tool_001',
          name: 'Database Connector',
          category: 'data_source',
          integration: {
            type: 'database',
            endpoint: 'supabase://ctas7-intelligence'
          }
        },
        {
          id: 'tool_002',
          name: 'Analysis Engine',
          category: 'analysis_engine',
          integration: {
            type: 'grpc',
            endpoint: 'localhost:50051'
          }
        }
      ];

      const mockPersonas: PersonaDefinition[] = [
        {
          id: 'persona_001',
          name: 'Intelligence Analyst',
          archetype: 'analyst',
          communication_style: 'technical',
          world_specialization: [activeWorld]
        },
        {
          id: 'persona_002',
          name: 'Mission Commander',
          archetype: 'commander',
          communication_style: 'authoritative',
          world_specialization: [activeWorld]
        }
      ];

      const mockVoices: VoiceConfiguration[] = [
        {
          id: 'voice_0',
          name: 'General System',
          tone: 'professional',
          formality: 'formal',
          voiceNumber: 0,
          accent: 'Neutral',
          elevenLabsId: '21m00Tcm4TlvDq8ikWAM'
        },
        {
          id: 'voice_1',
          name: 'Natasha (Russian)',
          tone: 'authoritative',
          formality: 'formal',
          voiceNumber: 1,
          accent: 'Russian',
          elevenLabsId: 'EXAVITQu4vr4xnSDxMaL'
        },
        {
          id: 'voice_2',
          name: 'Elena (Nuyorican)',
          tone: 'professional',
          formality: 'semi_formal',
          voiceNumber: 2,
          accent: 'Nuyorican',
          elevenLabsId: 'H9mEgO8K5PWTUMrk9TS0'
        },
        {
          id: 'voice_3',
          name: 'Lachlan (Australian)',
          tone: 'friendly',
          formality: 'casual',
          voiceNumber: 3,
          accent: 'Australian',
          elevenLabsId: 'HhGr1ybtHUOflpQ4AZto'
        },
        {
          id: 'voice_4',
          name: 'Marcus (Chinese)',
          tone: 'supportive',
          formality: 'formal',
          voiceNumber: 4,
          accent: 'Chinese',
          elevenLabsId: 'pqHfZKP75CvOlQylNhV4'
        },
        {
          id: 'voice_5',
          name: 'Commander (Military)',
          tone: 'authoritative',
          formality: 'formal',
          voiceNumber: 5,
          accent: 'Military',
          elevenLabsId: '21m00Tcm4TlvDq8ikWAM'
        },
        {
          id: 'voice_6',
          name: 'Sarah (Helper)',
          tone: 'supportive',
          formality: 'casual',
          voiceNumber: 6,
          accent: 'Sichuan',
          elevenLabsId: 'FGY2WhTYpPnrIDTdsKH5'
        },
        {
          id: 'voice_7',
          name: 'Reminder Assistant',
          tone: 'friendly',
          formality: 'casual',
          voiceNumber: 7,
          accent: 'Soft British',
          elevenLabsId: 'cgSgspJ2msm6clMCkdW9'
        },
        {
          id: 'voice_8',
          name: 'Warning System',
          tone: 'professional',
          formality: 'formal',
          voiceNumber: 8,
          accent: 'Clear American',
          elevenLabsId: 'ErXwobaYiN019PkySvjV'
        },
        {
          id: 'voice_9',
          name: 'Navigation Guide',
          tone: 'friendly',
          formality: 'semi_formal',
          voiceNumber: 9,
          accent: 'Canadian',
          elevenLabsId: 'IKne3meq5aSn9XLyUdCD'
        },
        {
          id: 'voice_10',
          name: 'Status Reporter',
          tone: 'professional',
          formality: 'formal',
          voiceNumber: 10,
          accent: 'Neutral Tech',
          elevenLabsId: 'TxGEqnHWrfWFTfGW9XjX'
        },
        {
          id: 'voice_11',
          name: 'Error Handler',
          tone: 'supportive',
          formality: 'semi_formal',
          voiceNumber: 11,
          accent: 'Calm Irish',
          elevenLabsId: 'MF3mGyEYCl7XYWbV9V6O'
        },
        {
          id: 'voice_12',
          name: 'Background Announcer',
          tone: 'professional',
          formality: 'formal',
          voiceNumber: 12,
          accent: 'News Anchor',
          elevenLabsId: 'onwK4e9ZLuTAKqWW03F9'
        }
      ];

      setComponentPalette({
        skills: mockSkills,
        mcps: mockMCPs,
        tools: mockTools,
        personas: mockPersonas,
        voices: mockVoices
      });

      setSDIOStatus('connected');
    } catch (error) {
      console.error('Component discovery failed:', error);
      setSDIOStatus('disconnected');
    }
  }, [activeWorld]);

  const testForgeConnection = useCallback(async () => {
    try {
      // Test connection to Forge Workflow System
      // In real implementation, this would hit the Forge API
      setIsConnectedToForge(true);
    } catch (error) {
      setIsConnectedToForge(false);
    }
  }, []);

  const initializeSDIODiscovery = useCallback(async () => {
    // Initialize SDIO discovery client
    // This would connect to the smart crate discovery system
  }, []);

  const createNewAgent = () => {
    const newAgent: AgentBlueprint = {
      id: `agent_${Date.now()}`,
      name: `New ${activeWorld.charAt(0).toUpperCase() + activeWorld.slice(1)} Agent`,
      world: activeWorld as any,
      tenant: 'axon_poc',
      skills: [],
      mcps: [],
      tools: [],
      persona: componentPalette.personas[0] || {} as PersonaDefinition,
      voice: componentPalette.voices[0] || {} as VoiceConfiguration,
      executionEngine: 'synaptix9',
      forgeNode: {
        node_type: 'AgentProcessor',
        workflow_id: `workflow_${Date.now()}`,
        instance_id: `instance_${Date.now()}`,
        blake3_hash: '',
        usim_context: activeWorld
      },
      sdioFeatures: [
        { feature: 'XSD_P1_BasicAgent', version: '1.0', enabled: true }
      ]
    };

    setSelectedAgent(newAgent);
    setIsDesigning(true);
  };

  const saveAgent = () => {
    if (selectedAgent) {
      setAgents(prev => [...prev, selectedAgent]);
      setSelectedAgent(null);
      setIsDesigning(false);
    }
  };

  const deployAgent = async () => {
    if (!selectedAgent) return;

    try {
      // Deploy agent to Forge Workflow System
      console.log('Deploying agent to Forge:', selectedAgent);

      // In real implementation:
      // 1. Validate agent configuration
      // 2. Create Forge workflow node
      // 3. Establish SDIO leases
      // 4. Deploy to execution engine

      alert(`Agent "${selectedAgent.name}" deployed successfully to ${selectedAgent.executionEngine}`);
    } catch (error) {
      console.error('Agent deployment failed:', error);
      alert('Agent deployment failed');
    }
  };

  return (
    <div className="h-screen bg-slate-900 text-white flex">
      {/* World Selection Rail */}
      <div className="w-20 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-4 space-y-4">
        <div className="text-xs font-bold text-slate-400 mb-2">WORLDS</div>
        {worlds.map((world) => {
          const Icon = world.icon;
          return (
            <button
              key={world.id}
              onClick={() => setActiveWorld(world.id)}
              className={`p-3 rounded-lg transition-all duration-200 group relative ${
                activeWorld === world.id
                  ? `${world.bgColor} ${world.color}`
                  : 'hover:bg-slate-700 text-slate-400'
              }`}
              title={world.description}
            >
              <Icon size={18} className="transition-transform group-hover:scale-110" />
              {activeWorld === world.id && (
                <div className="absolute -right-1 top-1 w-2 h-2 bg-green-400 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Component Palette */}
      <div className="w-80 bg-slate-850 border-r border-slate-700 flex flex-col">
        {/* Palette Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Component Palette</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                sdioStatus === 'connected' ? 'bg-green-400' :
                sdioStatus === 'discovering' ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className="text-xs text-slate-400">SDIO</span>
            </div>
          </div>
          <div className="text-sm text-slate-300">
            {worlds.find(w => w.id === activeWorld)?.name} World Components
          </div>
        </div>

        {/* Component Categories */}
        <div className="flex-1 overflow-y-auto">
          {componentCategories.map((category) => {
            const Icon = category.icon;
            const components = componentPalette[category.id as keyof ComponentPalette] || [];

            return (
              <div key={category.id} className="border-b border-slate-700">
                <div className="p-3 bg-slate-800 flex items-center space-x-3">
                  <Icon size={16} className={category.color} />
                  <span className="font-medium">{category.name}</span>
                  <span className="text-xs text-slate-400">({components.length})</span>
                </div>
                <div className="p-2 space-y-1">
                  {components.slice(0, 5).map((component: any, index: number) => (
                    <div
                      key={index}
                      className="p-2 rounded bg-slate-800 hover:bg-slate-700 cursor-move transition-colors text-sm"
                      draggable
                    >
                      {component.name || component.id}
                    </div>
                  ))}
                  {components.length > 5 && (
                    <div className="text-xs text-slate-400 p-2">
                      +{components.length - 5} more...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Discovery Status */}
        <div className="p-3 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Forge Connection</span>
            <span className={isConnectedToForge ? 'text-green-400' : 'text-red-400'}>
              {isConnectedToForge ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Design Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Header */}
        <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Agent Design Studio</h1>
            <div className="text-sm text-slate-400">
              {selectedAgent ? `Editing: ${selectedAgent.name}` : 'Select or create an agent'}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={createNewAgent}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span>New Agent</span>
            </button>

            {selectedAgent && (
              <>
                <button
                  onClick={saveAgent}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Save size={16} />
                  <span>Save</span>
                </button>

                <button
                  onClick={deployAgent}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  <Play size={16} />
                  <span>Deploy</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Design Canvas Area */}
        <div className="flex-1 relative">
          {isDesigning && selectedAgent ? (
            <AgentComposer
              agent={selectedAgent}
              onAgentChange={setSelectedAgent}
              componentPalette={componentPalette}
            />
          ) : (
            <AgentGallery
              agents={agents}
              onAgentSelect={(agent) => {
                setSelectedAgent(agent);
                setIsDesigning(true);
              }}
              onCreateNew={createNewAgent}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Agent Composer Component
function AgentComposer({
  agent,
  onAgentChange,
  componentPalette
}: {
  agent: AgentBlueprint;
  onAgentChange: (agent: AgentBlueprint) => void;
  componentPalette: ComponentPalette;
}) {
  return (
    <div className="h-full bg-slate-900 p-6">
      <div className="grid grid-cols-2 gap-6 h-full">
        {/* Agent Configuration */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="font-bold mb-3 flex items-center space-x-2">
              <Settings size={16} />
              <span>Agent Configuration</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Agent Name</label>
                <input
                  type="text"
                  value={agent.name}
                  onChange={(e) => onAgentChange({ ...agent, name: e.target.value })}
                  className="w-full p-2 bg-slate-700 rounded border border-slate-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Execution Engine</label>
                <select
                  value={agent.executionEngine}
                  onChange={(e) => onAgentChange({ ...agent, executionEngine: e.target.value as any })}
                  className="w-full p-2 bg-slate-700 rounded border border-slate-600 text-white"
                >
                  <option value="synaptix9">Synaptix9 (Workflow)</option>
                  <option value="neural-mux">Neural Mux (AI)</option>
                  <option value="legion-ecs">Legion ECS (Distributed)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="font-bold mb-3 flex items-center space-x-2">
              <Brain size={16} />
              <span>Skills ({agent.skills.length})</span>
            </h3>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {agent.skills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                  <span className="text-sm">{skill.name}</span>
                  <button
                    onClick={() => {
                      const newSkills = agent.skills.filter((_, i) => i !== index);
                      onAgentChange({ ...agent, skills: newSkills });
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* MCPs Section */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="font-bold mb-3 flex items-center space-x-2">
              <Cpu size={16} />
              <span>MCPs ({agent.mcps.length})</span>
            </h3>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {agent.mcps.map((mcp, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                  <span className="text-sm">{mcp.name}</span>
                  <button
                    onClick={() => {
                      const newMcps = agent.mcps.filter((_, i) => i !== index);
                      onAgentChange({ ...agent, mcps: newMcps });
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Voice Configuration Section */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="font-bold mb-3 flex items-center space-x-2">
              <Mic size={16} />
              <span>Voice Configuration</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Voice Selection</label>
                <select
                  value={agent.voice.id || 'voice_0'}
                  onChange={(e) => {
                    const selectedVoice = componentPalette.voices.find(v => v.id === e.target.value);
                    if (selectedVoice) {
                      onAgentChange({ ...agent, voice: selectedVoice });
                    }
                  }}
                  className="w-full p-2 bg-slate-700 rounded border border-slate-600 text-white"
                >
                  {componentPalette.voices.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      #{voice.voiceNumber} - {voice.name} ({voice.accent})
                    </option>
                  ))}
                </select>
              </div>

              {agent.voice.id && (
                <div className="bg-slate-700 rounded p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Voice #{agent.voice.voiceNumber}</span>
                    <span className="text-xs text-slate-400">{agent.voice.accent}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Tone: {agent.voice.tone}</span>
                    <span className="text-xs text-slate-400">Formality: {agent.voice.formality}</span>
                  </div>

                  <div className="flex space-x-2 mt-3">
                    <VoiceTestButton
                      voiceConfig={agent.voice}
                      testText={`Hello, this is ${agent.name}. I am ready to assist with ${agent.world} operations.`}
                    />
                    <button
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
                      onClick={() => {
                        // Start voice conversation with this agent
                        console.log('Starting conversation with agent:', agent.name);
                      }}
                    >
                      💬 Test Conversation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visual Workflow Designer */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="font-bold mb-3 flex items-center space-x-2">
            <Workflow size={16} />
            <span>Forge Workflow Designer</span>
          </h3>

          <div className="h-full bg-slate-900 rounded border-2 border-dashed border-slate-600 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <Grid size={48} className="mx-auto mb-4 opacity-50" />
              <p>Drag components here to build workflow</p>
              <p className="text-sm">Forge integration coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Agent Gallery Component
function AgentGallery({
  agents,
  onAgentSelect,
  onCreateNew
}: {
  agents: AgentBlueprint[];
  onAgentSelect: (agent: AgentBlueprint) => void;
  onCreateNew: () => void;
}) {
  return (
    <div className="h-full bg-slate-900 p-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Create New Agent Card */}
        <button
          onClick={onCreateNew}
          className="aspect-square bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center hover:border-slate-500 transition-colors"
        >
          <Plus size={48} className="text-slate-400 mb-4" />
          <span className="text-slate-400">Create New Agent</span>
        </button>

        {/* Existing Agents */}
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => onAgentSelect(agent)}
            className="aspect-square bg-slate-800 rounded-lg p-4 cursor-pointer hover:bg-slate-750 transition-colors border border-slate-700"
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <Bot size={24} className="text-green-400" />
                <span className="text-xs text-slate-400 capitalize">{agent.world}</span>
              </div>

              <h3 className="font-bold mb-2 truncate">{agent.name}</h3>

              <div className="text-xs text-slate-400 space-y-1 flex-1">
                <div>Skills: {agent.skills.length}</div>
                <div>MCPs: {agent.mcps.length}</div>
                <div>Tools: {agent.tools.length}</div>
              </div>

              <div className="text-xs text-slate-500 mt-auto">
                Engine: {agent.executionEngine}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Voice Test Button Component
function VoiceTestButton({
  voiceConfig,
  testText
}: {
  voiceConfig: VoiceConfiguration;
  testText: string;
}) {
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testVoice = async () => {
    setIsTesting(true);
    setError(null);

    try {
      // Use the existing ElevenLabs integration
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.elevenLabsId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.REACT_APP_ELEVENLABS_API_KEY || import.meta.env.VITE_ELEVENLABS_API_KEY || ''
        },
        body: JSON.stringify({
          text: testText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: voiceConfig.tone === 'authoritative' ? 0.7 : 0.5,
            similarity_boost: 0.8,
            style: voiceConfig.formality === 'formal' ? 0.2 : 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      await audio.play();

      // Cleanup
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Voice test failed';
      setError(errorMessage);
      console.error('Voice test error:', err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-1">
      <button
        onClick={testVoice}
        disabled={isTesting}
        className={`px-3 py-1 rounded text-sm transition-colors ${
          isTesting
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isTesting ? '🔊 Testing...' : `🎤 Test Voice #${voiceConfig.voiceNumber}`}
      </button>

      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  );
}