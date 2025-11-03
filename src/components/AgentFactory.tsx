import React, { useState, useEffect } from 'react';
import {
  Bot,
  Brain,
  Cog,
  Package,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  Zap,
  Settings,
  Target,
  Network,
  Globe,
  Ship,
  Map
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  world?: 'network' | 'space' | 'ctas' | 'geographical' | 'maritime';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface AgentConfig {
  id: string;
  name: string;
  persona: string;
  skills: string[];
  tools: string[];
  mcpName: string;
  microkernel: string;
  world: string;
  taskGraph: string[];
  sourceTaskId: string;
}

interface AgentFactoryProps {
  tasks: Task[];
  onAgentCreate?: (agent: AgentConfig) => void;
}

const WORLD_CONFIGS = {
  network: {
    icon: Network,
    color: 'text-red-400',
    bgColor: 'bg-red-900/20',
    borderColor: 'border-red-500/30',
    agentType: 'ctas7-mcp-agent-network-defender',
    persona: 'Cybersecurity operations specialist',
    skills: ['Threat hunting', 'Network analysis', 'Incident response'],
    tools: ['nmap', 'masscan', 'Wireshark', 'Metasploit', 'BPF filters'],
    mcp: 'ctas7-mcp-network-security-engine',
    microkernel: 'Network security processing engine',
    taskGraph: ['Threat detection', 'Analysis', 'Response', 'Recovery']
  },
  space: {
    icon: Globe,
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-500/30',
    agentType: 'ctas7-mcp-agent-space-operator',
    persona: 'Satellite constellation manager',
    skills: ['Orbital mechanics', 'RF management', 'LaserLight FSO'],
    tools: ['Cesium.js', 'SatNOGS', 'OpenLST', 'antenna control'],
    mcp: 'ctas7-mcp-space-constellation-controller',
    microkernel: 'Satellite control subsystem',
    taskGraph: ['Orbit planning', 'Link establishment', 'Data relay', 'Maintenance']
  },
  ctas: {
    icon: Brain,
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-500/30',
    agentType: 'ctas7-mcp-agent-ctas-commander',
    persona: 'Strategic operations coordinator',
    skills: ['OODA loops', 'Neural mux decision-making', 'Tactical planning'],
    tools: ['Neural Mux', 'Unicode Assembly Language', 'trivariate hash'],
    mcp: 'ctas7-mcp-ctas-neural-processor',
    microkernel: 'CTAS core decision engine',
    taskGraph: ['Observe', 'Orient', 'Decide', 'Act', 'Learn']
  },
  geographical: {
    icon: Map,
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-500/30',
    agentType: 'ctas7-mcp-agent-geo-analyst',
    persona: 'Geographic intelligence specialist',
    skills: ['GIS analysis', 'Terrain modeling', 'Spatial intelligence'],
    tools: ['QGIS', 'PostGIS', 'elevation models', 'imagery analysis'],
    mcp: 'ctas7-mcp-geo-intelligence-engine',
    microkernel: 'Geospatial processing system',
    taskGraph: ['Data collection', 'Spatial analysis', 'Intelligence production', 'Dissemination']
  },
  maritime: {
    icon: Ship,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/20',
    borderColor: 'border-cyan-500/30',
    agentType: 'ctas7-mcp-agent-maritime-operator',
    persona: 'Naval operations specialist',
    skills: ['Maritime domain awareness', 'Vessel tracking', 'Port security'],
    tools: ['AIS tracking', 'radar correlation', 'port management systems'],
    mcp: 'ctas7-mcp-maritime-domain-controller',
    microkernel: 'Maritime operations engine',
    taskGraph: ['Detection', 'Tracking', 'Classification', 'Engagement']
  }
};

export const AgentFactory: React.FC<AgentFactoryProps> = ({ tasks, onAgentCreate }) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>([]);
  const [showAgentBuilder, setShowAgentBuilder] = useState(false);
  const [currentTaskForAgent, setCurrentTaskForAgent] = useState<Task | null>(null);

  // Auto-detect world from task content
  const detectWorld = (task: Task): keyof typeof WORLD_CONFIGS => {
    const content = `${task.title} ${task.description || ''}`.toLowerCase();

    if (content.includes('network') || content.includes('cyber') || content.includes('security')) {
      return 'network';
    }
    if (content.includes('satellite') || content.includes('space') || content.includes('orbital')) {
      return 'space';
    }
    if (content.includes('ooda') || content.includes('neural') || content.includes('decision')) {
      return 'ctas';
    }
    if (content.includes('geo') || content.includes('map') || content.includes('spatial')) {
      return 'geographical';
    }
    if (content.includes('maritime') || content.includes('naval') || content.includes('ship')) {
      return 'maritime';
    }

    return 'ctas'; // Default to CTAS world
  };

  const generateAgentFromTask = (task: Task) => {
    const world = detectWorld(task);
    const config = WORLD_CONFIGS[world];

    const agent: AgentConfig = {
      id: `agent-${task.id}`,
      name: `${task.title} Agent`,
      persona: config.persona,
      skills: config.skills,
      tools: config.tools,
      mcpName: config.mcp,
      microkernel: config.microkernel,
      world: world,
      taskGraph: config.taskGraph,
      sourceTaskId: task.id
    };

    return agent;
  };

  const handleCreateAgent = (task: Task) => {
    const agent = generateAgentFromTask(task);
    setAgentConfigs(prev => [...prev, agent]);

    if (onAgentCreate) {
      onAgentCreate(agent);
    }
  };

  const handleBulkCreateAgents = () => {
    const newAgents = selectedTasks.map(taskId => {
      const task = tasks.find(t => t.id === taskId);
      return task ? generateAgentFromTask(task) : null;
    }).filter(Boolean) as AgentConfig[];

    setAgentConfigs(prev => [...prev, ...newAgents]);
    setSelectedTasks([]);
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const WorldIcon = ({ world }: { world: keyof typeof WORLD_CONFIGS }) => {
    const Icon = WORLD_CONFIGS[world].icon;
    return <Icon className={`w-4 h-4 ${WORLD_CONFIGS[world].color}`} />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Bot className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Agent Factory</h1>
            <p className="text-slate-300">Transform tasks into complete agent ecosystems</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {Object.entries(WORLD_CONFIGS).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <span className="text-white font-medium capitalize">{key}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {config.agentType.replace('ctas7-mcp-agent-', '')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task-to-Agent Transformation */}
      <div className="grid grid-cols-12 gap-6">
        {/* Task Selection */}
        <div className="col-span-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Available Tasks</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-400">
                    {selectedTasks.length} selected
                  </span>
                  {selectedTasks.length > 0 && (
                    <button
                      onClick={handleBulkCreateAgents}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Create Agents
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {tasks.map(task => {
                const world = detectWorld(task);
                const isSelected = selectedTasks.includes(task.id);

                return (
                  <div
                    key={task.id}
                    className={`p-4 border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${
                      isSelected ? 'bg-cyan-900/20 border-l-4 border-l-cyan-400' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleTaskSelection(task.id)}
                            className="rounded border-slate-600 bg-slate-700 text-cyan-400"
                          />
                          <WorldIcon world={world} />
                          <h3 className="text-white font-medium">{task.title}</h3>
                        </div>
                        {task.description && (
                          <p className="text-slate-400 text-sm mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-3 text-xs">
                          <span className={`px-2 py-1 rounded ${
                            task.status === 'Done' ? 'bg-green-900/20 text-green-400' :
                            task.status === 'In Progress' ? 'bg-blue-900/20 text-blue-400' :
                            task.status === 'Review' ? 'bg-yellow-900/20 text-yellow-400' :
                            'bg-slate-700 text-slate-400'
                          }`}>
                            {task.status}
                          </span>
                          <span className="text-slate-500">→ {world} world</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCreateAgent(task)}
                        className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded transition-colors"
                        title="Create Agent"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Generated Agents */}
        <div className="col-span-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">Generated Agents</h2>
              <p className="text-slate-400 text-sm">Complete agent ecosystems with personas, skills & tools</p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {agentConfigs.map(agent => {
                const world = agent.world as keyof typeof WORLD_CONFIGS;
                const config = WORLD_CONFIGS[world];

                return (
                  <div
                    key={agent.id}
                    className={`p-4 border-b border-slate-700 ${config.bgColor} ${config.borderColor} border-l-4`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Bot className={`w-5 h-5 ${config.color}`} />
                        <h3 className="text-white font-medium">{agent.name}</h3>
                      </div>
                      <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">
                        {agent.world}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-slate-400">Persona:</span>
                        <p className="text-sm text-slate-300">{agent.persona}</p>
                      </div>

                      <div>
                        <span className="text-xs text-slate-400">MCP:</span>
                        <code className="text-xs text-cyan-400 bg-slate-900 px-1 rounded">
                          {agent.mcpName}
                        </code>
                      </div>

                      <div>
                        <span className="text-xs text-slate-400">Skills:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {agent.skills.map((skill, idx) => (
                            <span key={idx} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-slate-400">Tools:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {agent.tools.map((tool, idx) => (
                            <span key={idx} className="text-xs bg-slate-600 text-slate-200 px-2 py-1 rounded">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-slate-400">Task Graph:</span>
                        <div className="flex items-center space-x-1 mt-1">
                          {agent.taskGraph.map((step, idx) => (
                            <React.Fragment key={idx}>
                              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                                {step}
                              </span>
                              {idx < agent.taskGraph.length - 1 && (
                                <ArrowRight className="w-3 h-3 text-slate-500" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <button className="text-xs text-cyan-400 hover:text-cyan-300 underline">
                        Edit Configuration
                      </button>
                      <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-xs transition-colors">
                        Deploy Agent
                      </button>
                    </div>
                  </div>
                );
              })}

              {agentConfigs.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No agents generated yet</p>
                  <p className="text-sm">Select tasks to create agent ecosystems</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Agent Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            <span className="text-slate-400 text-sm">Total Agents</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{agentConfigs.length}</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-400" />
            <span className="text-slate-400 text-sm">Personas</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {new Set(agentConfigs.map(a => a.persona)).size}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-slate-400 text-sm">Tools</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {agentConfigs.reduce((acc, agent) => acc + agent.tools.length, 0)}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-slate-400 text-sm">Worlds</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {new Set(agentConfigs.map(a => a.world)).size}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentFactory;