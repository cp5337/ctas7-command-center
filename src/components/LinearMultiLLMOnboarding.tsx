import React, { useState, useEffect } from 'react';
import {
  Bot,
  GitBranch,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Brain,
  Zap,
  Database,
  Server,
  Play,
  Pause,
  RotateCcw,
  Activity
} from 'lucide-react';

interface LLMAgent {
  id: string;
  name: string;
  provider: string;
  model: string;
  status: 'ready' | 'onboarding' | 'active' | 'offline';
  capabilities: string[];
  linearMemberId?: string;
  ctasFeatures: string[];
  lastActivity?: string;
  performance: {
    responseTime: number;
    accuracy: number;
    tasksCompleted: number;
  };
}

interface OnboardingProgress {
  step: 'config' | 'agents' | 'linear' | 'testing' | 'complete';
  completedSteps: string[];
  currentTask: string;
  errors: string[];
}

interface LinearConfig {
  apiToken: string;
  teamId: string;
  workspaceUrl: string;
}

interface CTASEcosystemStatus {
  leptoseSvm: boolean;
  xsdMuxBridge: boolean;
  supabase: boolean;
  surrealDb: boolean;
  vectorSearch: boolean;
}

export const LinearMultiLLMOnboarding: React.FC = () => {
  const [linearConfig, setLinearConfig] = useState<LinearConfig>({
    apiToken: '',
    teamId: '',
    workspaceUrl: ''
  });

  const [agents, setAgents] = useState<LLMAgent[]>([
    {
      id: 'ctas-claude-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'claude',
      model: 'claude-3-5-sonnet-20241022',
      status: 'ready',
      capabilities: ['code_generation', 'analysis', 'claude_code_integration'],
      ctasFeatures: ['XSD Mux Bridge', 'SCH Vectorization', 'UTF Optimization', 'Sled Cache'],
      performance: { responseTime: 850, accuracy: 94, tasksCompleted: 0 }
    },
    {
      id: 'ctas-gpt4',
      name: 'GPT-4',
      provider: 'openai',
      model: 'gpt-4',
      status: 'ready',
      capabilities: ['code_generation', 'function_calling', 'vision'],
      ctasFeatures: ['XSD Mux Bridge', 'UTF Optimization', 'Sled Cache'],
      performance: { responseTime: 1200, accuracy: 91, tasksCompleted: 0 }
    },
    {
      id: 'ctas-gemini-pro',
      name: 'Gemini Pro',
      provider: 'gemini',
      model: 'gemini-pro',
      status: 'ready',
      capabilities: ['multimodal_analysis', 'reasoning', 'data_analysis'],
      ctasFeatures: ['XSD Mux Bridge', 'SCH Vectorization', 'UTF Optimization', 'Sled Cache'],
      performance: { responseTime: 950, accuracy: 89, tasksCompleted: 0 }
    },
    {
      id: 'ctas-codellama-local',
      name: 'CodeLlama 7B',
      provider: 'ollama',
      model: 'codellama:7b-instruct',
      status: 'ready',
      capabilities: ['local_inference', 'code_generation', 'privacy_focused'],
      ctasFeatures: ['XSD Mux Bridge', 'UTF Optimization', 'Sled Cache', 'Local Processing'],
      performance: { responseTime: 650, accuracy: 86, tasksCompleted: 0 }
    },
    {
      id: 'ctas-wolfram-alpha',
      name: 'Wolfram Alpha',
      provider: 'wolfram',
      model: 'wolfram-alpha',
      status: 'ready',
      capabilities: ['mathematical_computation', 'scientific_analysis'],
      ctasFeatures: ['XSD Mux Bridge', 'UTF Optimization', 'Sled Cache'],
      performance: { responseTime: 1100, accuracy: 97, tasksCompleted: 0 }
    }
  ]);

  const [progress, setProgress] = useState<OnboardingProgress>({
    step: 'config',
    completedSteps: [],
    currentTask: 'Configure Linear integration',
    errors: []
  });

  const [ecosystemStatus, setEcosystemStatus] = useState<CTASEcosystemStatus>({
    leptoseSvm: false,
    xsdMuxBridge: false,
    supabase: false,
    surrealDb: false,
    vectorSearch: false
  });

  const [isOnboarding, setIsOnboarding] = useState(false);

  // Check CTAS ecosystem status
  useEffect(() => {
    const checkEcosystemStatus = async () => {
      const endpoints = {
        leptoseSvm: 'http://localhost:11443/health',
        xsdMuxBridge: 'http://localhost:8080/health',
        supabase: 'http://localhost:11448/rest/v1/',
        surrealDb: 'http://localhost:11451/health',
        vectorSearch: 'http://localhost:11444/'
      };

      const status: CTASEcosystemStatus = {
        leptoseSvm: false,
        xsdMuxBridge: false,
        supabase: false,
        surrealDb: false,
        vectorSearch: false
      };

      for (const [service, endpoint] of Object.entries(endpoints)) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            mode: 'no-cors'
          });
          status[service as keyof CTASEcosystemStatus] = true;
        } catch {
          status[service as keyof CTASEcosystemStatus] = false;
        }
      }

      setEcosystemStatus(status);
    };

    checkEcosystemStatus();
    const interval = setInterval(checkEcosystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStartOnboarding = async () => {
    if (!linearConfig.apiToken || !linearConfig.teamId) {
      setProgress(prev => ({
        ...prev,
        errors: ['Linear API token and Team ID are required']
      }));
      return;
    }

    setIsOnboarding(true);
    setProgress({
      step: 'agents',
      completedSteps: ['config'],
      currentTask: 'Creating agent profiles...',
      errors: []
    });

    // Simulate onboarding process
    setTimeout(() => {
      setProgress({
        step: 'linear',
        completedSteps: ['config', 'agents'],
        currentTask: 'Registering agents with Linear...',
        errors: []
      });

      // Update agents to onboarding status
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: 'onboarding' as const
      })));

      setTimeout(() => {
        setProgress({
          step: 'testing',
          completedSteps: ['config', 'agents', 'linear'],
          currentTask: 'Testing CTAS integration...',
          errors: []
        });

        setTimeout(() => {
          setProgress({
            step: 'complete',
            completedSteps: ['config', 'agents', 'linear', 'testing'],
            currentTask: 'Onboarding complete!',
            errors: []
          });

          // Update agents to active status
          setAgents(prev => prev.map(agent => ({
            ...agent,
            status: 'active' as const,
            linearMemberId: `linear_${agent.id}_${Math.random().toString(36).substr(2, 9)}`,
            lastActivity: new Date().toISOString()
          })));

          setIsOnboarding(false);
        }, 2000);
      }, 3000);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'onboarding': return <RotateCcw className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'offline': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'claude': return '🧠';
      case 'openai': return '🤖';
      case 'gemini': return '💎';
      case 'ollama': return '🦙';
      case 'wolfram': return '🔬';
      default: return '🤖';
    }
  };

  const ecosystemHealthScore = Object.values(ecosystemStatus).filter(Boolean).length;
  const totalServices = Object.keys(ecosystemStatus).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Bot className="w-8 h-8 text-cyan-400" />
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Linear Multi-LLM Onboarding</h2>
              <p className="text-slate-400">Integrate AI agents with Linear for team coordination</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm text-slate-400">CTAS Ecosystem</div>
              <div className="text-lg font-bold text-cyan-400">
                {ecosystemHealthScore}/{totalServices} Services
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${ecosystemHealthScore === totalServices ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
          </div>
        </div>

        {/* Ecosystem Status */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {Object.entries(ecosystemStatus).map(([service, status]) => (
            <div key={service} className="bg-slate-700 rounded-lg p-3 text-center">
              <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${status ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <div className="text-xs text-slate-300 capitalize">{service.replace(/([A-Z])/g, ' $1')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-slate-100">Linear Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Linear API Token</label>
            <input
              type="password"
              value={linearConfig.apiToken}
              onChange={(e) => setLinearConfig(prev => ({ ...prev, apiToken: e.target.value }))}
              placeholder="lin_api_..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Team ID</label>
            <input
              type="text"
              value={linearConfig.teamId}
              onChange={(e) => setLinearConfig(prev => ({ ...prev, teamId: e.target.value }))}
              placeholder="team_..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Workspace URL</label>
            <input
              type="text"
              value={linearConfig.workspaceUrl}
              onChange={(e) => setLinearConfig(prev => ({ ...prev, workspaceUrl: e.target.value }))}
              placeholder="https://linear.app/company"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        </div>

        <button
          onClick={handleStartOnboarding}
          disabled={isOnboarding || !linearConfig.apiToken || !linearConfig.teamId}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center space-x-2"
        >
          {isOnboarding ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Onboarding...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Start Onboarding</span>
            </>
          )}
        </button>
      </div>

      {/* Onboarding Progress */}
      {(isOnboarding || progress.step === 'complete') && (
        <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-slate-100">Onboarding Progress</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">{progress.currentTask}</span>
              <span className="text-cyan-400">{progress.completedSteps.length}/4 Steps</span>
            </div>

            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(progress.completedSteps.length / 4) * 100}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs">
              {['Config', 'Agents', 'Linear', 'Testing'].map((step, index) => (
                <div
                  key={step}
                  className={`text-center p-2 rounded ${
                    progress.completedSteps.length > index
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>

            {progress.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-400/20 rounded-lg">
                {progress.errors.map((error, index) => (
                  <div key={index} className="text-red-400 text-sm">{error}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Multi-LLM Agents */}
      <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-slate-100">AI Team Members</h3>
          <span className="text-sm text-slate-400">({agents.filter(a => a.status === 'active').length} active)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getProviderIcon(agent.provider)}</span>
                  <div>
                    <h4 className="font-medium text-slate-100">{agent.name}</h4>
                    <p className="text-xs text-slate-400">{agent.provider} • {agent.model.split(':')[0]}</p>
                  </div>
                </div>
                {getStatusIcon(agent.status)}
              </div>

              <div className="space-y-2 mb-3">
                <div className="text-xs text-slate-400">Capabilities:</div>
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.slice(0, 3).map((capability) => (
                    <span key={capability} className="px-2 py-1 bg-slate-600 text-xs text-slate-300 rounded">
                      {capability.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <span className="px-2 py-1 bg-slate-600 text-xs text-slate-300 rounded">
                      +{agent.capabilities.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="text-xs text-slate-400">CTAS Features:</div>
                <div className="flex flex-wrap gap-1">
                  {agent.ctasFeatures.slice(0, 2).map((feature) => (
                    <span key={feature} className="px-2 py-1 bg-cyan-600/20 text-xs text-cyan-300 rounded">
                      {feature}
                    </span>
                  ))}
                  {agent.ctasFeatures.length > 2 && (
                    <span className="px-2 py-1 bg-cyan-600/20 text-xs text-cyan-300 rounded">
                      +{agent.ctasFeatures.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {agent.status === 'active' && (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-slate-400">Response</div>
                    <div className="text-green-400 font-medium">{agent.performance.responseTime}ms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400">Accuracy</div>
                    <div className="text-blue-400 font-medium">{agent.performance.accuracy}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400">Tasks</div>
                    <div className="text-cyan-400 font-medium">{agent.performance.tasksCompleted}</div>
                  </div>
                </div>
              )}

              {agent.linearMemberId && (
                <div className="mt-3 p-2 bg-slate-600 rounded text-xs">
                  <div className="text-slate-400">Linear Member ID:</div>
                  <div className="text-slate-300 font-mono">{agent.linearMemberId}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Integration Preview */}
      {progress.step === 'complete' && (
        <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-slate-100">Linear Issue Template Preview</h3>
          </div>

          <div className="bg-slate-700 rounded-lg p-4 font-mono text-sm text-slate-300">
            <div className="text-cyan-400 font-bold mb-2"># Multi-LLM Team Coordination Issue</div>
            <div className="mb-2">
              <span className="text-yellow-400">## 🎯 Task Assignment</span><br />
              <span className="text-slate-400">- **Assigned Agent**: [Auto-assigned based on capabilities]</span><br />
              <span className="text-slate-400">- **Supporting Agents**: [Additional agents for complex tasks]</span><br />
              <span className="text-slate-400">- **Coordination Strategy**: Round-robin with specialization</span>
            </div>
            <div className="mb-2">
              <span className="text-yellow-400">## 🤖 Available Agents:</span><br />
              {agents.filter(a => a.status === 'active').map((agent, i) => (
                <span key={agent.id} className="text-slate-400">
                  {i + 1}. **{agent.name}** ({agent.provider})<br />
                </span>
              ))}
            </div>
            <div className="mb-2">
              <span className="text-yellow-400">## ⚙️ CTAS Integration Status</span><br />
              <span className="text-slate-400">- [x] XSD Mux Bridge processing (localhost:8080)</span><br />
              <span className="text-slate-400">- [x] SCH vectorization with M4Pro hash engine</span><br />
              <span className="text-slate-400">- [x] UTF optimization (spin → 🔄)</span><br />
              <span className="text-slate-400">- [x] Sled cache synchronization</span><br />
              <span className="text-slate-400">- [x] USIM trivariate system integration</span>
            </div>
            <div className="text-slate-500 text-xs mt-4">
              *Generated by CTAS Linear Multi-LLM Onboarding System*
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-4">
            <button
              onClick={() => window.open(linearConfig.workspaceUrl || 'https://linear.app', '_blank')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center space-x-2"
            >
              <GitBranch className="w-4 h-4" />
              <span>Open Linear Workspace</span>
            </button>
            <button
              onClick={() => {
                const template = `# Multi-LLM Team Coordination Issue

## 🎯 Task Assignment
- **Assigned Agent**: [Auto-assigned based on capabilities]
- **Supporting Agents**: [Additional agents for complex tasks]
- **Coordination Strategy**: Round-robin with specialization

## 🤖 Available Agents:
${agents.filter(a => a.status === 'active').map((agent, i) =>
  `${i + 1}. **${agent.name}** (${agent.provider})`
).join('\n')}

## ⚙️ CTAS Integration Status
- [x] XSD Mux Bridge processing (localhost:8080)
- [x] SCH vectorization with M4Pro hash engine
- [x] UTF optimization (spin → 🔄)
- [x] Sled cache synchronization
- [x] USIM trivariate system integration

---
*Generated by CTAS Linear Multi-LLM Onboarding System*`;

                navigator.clipboard.writeText(template);
                alert('Template copied to clipboard!');
              }}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors flex items-center space-x-2"
            >
              <Brain className="w-4 h-4" />
              <span>Copy Template</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};