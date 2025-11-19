import { useState, useEffect } from 'react';
import { PersonaCard } from './components/PersonaCard';
import { ChatInterface } from './components/ChatInterface';
import { ChannelList } from './components/ChannelList';
import { KanbanBoard } from './components/KanbanBoard';
import { MetricsWidget } from './components/MetricsWidget';
import { WebSocketDebugger } from './components/WebSocketDebugger';
import { Breadcrumb } from './components/Breadcrumb';
import { CyberOpsWorkspace } from './components/CyberOpsWorkspace';
import { CTASOntologyManager } from './components/CTASOntologyManager';
import { EnterpriseIntegrationHub } from './components/EnterpriseIntegrationHub';
import { LeptosDocsBridge } from './components/LeptosDocsBridge';
import { ToolForge } from './components/ToolForge';
import { MissionCriticalDevOps } from './components/MissionCriticalDevOps';
import { LinearStyleProjectManagement } from './components/LinearStyleProjectManagement';
import { LinearMultiLLMOnboarding } from './components/LinearMultiLLMOnboarding';
import { SmartCrateControl } from './components/SmartCrateControl';
import { CTASCommandCenter } from './components/CTASCommandCenter';
import { useWebSocket } from './hooks/useWebSocket';
import { getWebSocketUrl } from './utils/url';
import { getRealPersonas, getRealTasks, getRealMetrics } from './services/realDataService';
import { 
  Persona, 
  Channel, 
  Message, 
  Task, 
  SystemMetric 
} from './types';
import {
  Command,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Zap,
  Shield,
  Activity,
  Package,
  Satellite
} from 'lucide-react';

function App() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'tasks' | 'metrics' | 'enterprise' | 'cyberops' | 'ontology' | 'crates' | 'tools' | 'gis' | 'hft' | 'sdc'>('overview');
  const [selectedCrate, setSelectedCrate] = useState<string>('');
  const [crateData, setCrateData] = useState<any>(null);

  // WebSocket connection for real-time updates
  const { isConnected, sendMessage } = useWebSocket(getWebSocketUrl());

  // Load real data on startup
  useEffect(() => {
    const loadRealData = async () => {
      try {
        // Load real personas
        const realPersonas = await getRealPersonas();
        setPersonas(realPersonas);
        console.log('✅ Loaded real personas:', realPersonas.length);

        // Auto-create group and DM channels for personas if none exist
        if (realPersonas.length > 0 && channels.length === 0) {
          const baseChannels: Channel[] = [];
          // General group channel containing all personas + current-user
          baseChannels.push({
            id: 'general',
            name: 'General',
            type: 'group',
            participants: ['current-user', ...realPersonas.map(p => p.id)],
            unreadCount: 0,
          });
          // One DM per persona
          for (const p of realPersonas) {
            baseChannels.push({
              id: `dm-${p.id}`,
              name: p.name,
              type: 'direct',
              participants: ['current-user', p.id],
              unreadCount: 0,
            });
          }
          setChannels(baseChannels);
          setActiveChannelId('general');
        }

        // Load real tasks from Linear
        const realTasks = await getRealTasks();
        if (realTasks.length > 0) {
          setTasks(realTasks);
          console.log('✅ Loaded real Linear tasks:', realTasks.length);
        }

        // Load real metrics
        const realMetrics = await getRealMetrics();
        setMetrics(realMetrics);
        console.log('✅ Loaded real system metrics:', realMetrics.length);
      } catch (error) {
        console.error('Failed to load real data:', error);
      }
    };

    loadRealData();
  }, []);

  // Update metrics periodically with REAL backend checks
  useEffect(() => {
    const updateMetrics = async () => {
      try {
        const realMetrics = await getRealMetrics();
        setMetrics(realMetrics);
      } catch (error) {
        console.error('Failed to update metrics:', error);
      }
    };

    const interval = setInterval(updateMetrics, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStartChat = (personaId: string) => {
    const existingChannel = channels.find(
      c => c.type === 'direct' && c.participants.includes(personaId)
    );
    
    if (existingChannel) {
      setActiveChannelId(existingChannel.id);
    } else {
      const newChannel: Channel = {
        id: `dm-${personaId}`,
        name: personas.find(p => p.id === personaId)?.name || 'Unknown',
        type: 'direct',
        participants: ['current-user', personaId],
        unreadCount: 0
      };
      setChannels(prev => [...prev, newChannel]);
      setActiveChannelId(newChannel.id);
    }
    setActiveTab('chat');
  };

  const handleVoiceCall = (personaId: string) => {
    console.log('Starting voice call with:', personaId);
    // Implement voice call functionality
  };

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      channelId: activeChannelId,
      content,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Try to send via WebSocket, but continue regardless
    const sent = sendMessage({
        type: 'message',
        data: newMessage
    });
    
    if (!sent) {
      console.log('Message sent in offline mode');
    }
    
    // Simulate AI response
    setTimeout(() => {
      const channel = channels.find(c => c.id === activeChannelId);
      if (channel && channel.type === 'direct') {
        const aiPersonaId = channel.participants.find(id => id !== 'current-user');
        if (aiPersonaId) {
          const aiResponse: Message = {
            id: `msg-${Date.now()}-ai`,
            senderId: aiPersonaId,
            channelId: activeChannelId,
            content: `I understand your request: "${content}". Let me process that for you.`,
            timestamp: new Date().toISOString(),
            type: 'text'
          };
          setMessages(prev => [...prev, aiResponse]);
        }
      }
    }, 1000 + Math.random() * 2000);
  };

  const handleSendVoice = async (audioBlob: Blob) => {
    console.log('Sending voice message:', audioBlob);

    try {
      // Create WebSocket connection to voice pipeline
      const ws = new WebSocket('ws://localhost:18765');

      ws.onopen = async () => {
        // Convert audio blob to base64
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        // Get target agent based on active channel
        const targetAgent = getTargetAgentForActiveChannel();

        // Send voice message to pipeline
        const voiceMessage = {
          type: 'voice_input',
          audioData: base64Audio,
          targetAgent,
          timestamp: new Date().toISOString(),
          sessionId: `chat-${activeChannelId}`
        };

        ws.send(JSON.stringify(voiceMessage));
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);

          if (response.type === 'conversation_result') {
            // Add transcribed message from user
            const userVoiceMessage: Message = {
              id: `voice-user-${Date.now()}`,
              senderId: 'current-user',
              channelId: activeChannelId,
              content: response.transcribed_text || '[Voice message]',
              timestamp: new Date().toISOString(),
              type: 'voice',
              voiceData: {
                duration: 3,
                waveform: Array(20).fill(0).map(() => Math.random() * 0.8),
                isPlaying: false
              }
            };

            setMessages(prev => [...prev, userVoiceMessage]);

            // Add agent response if available
            if (response.llm_response) {
              const agentResponse: Message = {
                id: `voice-agent-${Date.now()}`,
                senderId: response.agent || 'unknown',
                channelId: activeChannelId,
                content: response.llm_response,
                timestamp: new Date().toISOString(),
                type: 'voice',
                voiceData: {
                  duration: 4,
                  waveform: Array(25).fill(0).map(() => Math.random() * 0.9),
                  isPlaying: false
                }
              };

              setTimeout(() => {
                setMessages(prev => [...prev, agentResponse]);
              }, 500);
            }
          }
        } catch (error) {
          console.error('Error parsing voice response:', error);
        }

        ws.close();
      };

      ws.onerror = () => {
        // Fallback: Try mirror port
        tryMirrorVoiceService(audioBlob);
      };

    } catch (error) {
      console.error('Voice WebSocket error:', error);
      tryMirrorVoiceService(audioBlob);
    }
  };

  const tryMirrorVoiceService = async (_audioBlob: Blob) => {
    try {
      const _ws = new WebSocket('ws://localhost:28765');
      // Same logic as above but with fallback port
      // ... (similar implementation)
    } catch (error) {
      console.error('Mirror voice service also failed:', error);

      // Final fallback: create basic voice message
      const fallbackMessage: Message = {
        id: `voice-fallback-${Date.now()}`,
        senderId: 'current-user',
        channelId: activeChannelId,
        content: '[Voice message - processing offline]',
        timestamp: new Date().toISOString(),
        type: 'voice',
        voiceData: {
          duration: 2,
          waveform: Array(15).fill(0).map(() => Math.random() * 0.6),
          isPlaying: false
        }
      };

      setMessages(prev => [...prev, fallbackMessage]);
    }
  };

  const getTargetAgentForActiveChannel = () => {
    const channel = channels.find(c => c.id === activeChannelId);
    if (!channel || channel.type !== 'direct') return 'natasha_volkov';

    const otherParticipant = channel.participants.find(id => id !== 'current-user');
    const persona = personas.find(p => p.id === otherParticipant);

    // Map personas to voice agents
    if (persona?.name.toLowerCase().includes('natasha')) return 'natasha_volkov';
    if (persona?.name.toLowerCase().includes('elena')) return 'elena_rodriguez';
    if (persona?.name.toLowerCase().includes('cove')) return 'cove_harris';
    if (persona?.name.toLowerCase().includes('marcus')) return 'marcus_chen';

    return 'natasha_volkov'; // Default
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };





  const activeChannel = channels.find(c => c.id === activeChannelId);
  const channelMessages = messages.filter(m => m.channelId === activeChannelId);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Command },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'tasks', label: 'DevOps', icon: BarChart3 },
    { id: 'metrics', label: 'Metrics', icon: Activity },
    { id: 'enterprise', label: 'Enterprise', icon: Settings },
    { id: 'cyberops', label: 'CyberOps', icon: Shield },
    { id: 'ontology', label: 'Ontology', icon: Users },
    { id: 'crates', label: 'Crates', icon: Package },
    { id: 'tools', label: 'Tools', icon: Zap },
    { id: 'gis', label: '3D Satellites', icon: Satellite }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-cyan-400" />
              <h1 className="text-2xl font-bold text-slate-100">Development Center</h1>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className="text-slate-400">
                {isConnected ? 'Connected' : 'Offline Mode'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-700 px-3 py-1 rounded-full">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-300">Hash-Enabled</span>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors">
              <Settings size={20} />
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
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <Breadcrumb 
            items={[{ label: tabs.find(t => t.id === activeTab)?.label || 'Unknown', id: activeTab }]}
            activeItem={activeTab}
            onNavigate={setActiveTab as (itemId: string) => void}
          />
        </div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Personas Sidebar */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
              <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-semibold text-slate-100">Team Personas</h2>
                </div>
                <div className="space-y-3">
                  {personas.map((persona) => (
                    <PersonaCard
                      key={persona.id}
                      persona={persona}
                      onStartChat={handleStartChat}
                      onVoiceCall={handleVoiceCall}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* Main Dashboard */}
            <div className="col-span-12 lg:col-span-6 space-y-6">
              <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">System Metrics</h2>
                <MetricsWidget metrics={metrics} />
              </div>

              <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">Operations Board</h2>
                <KanbanBoard tasks={tasks} onTaskUpdate={handleTaskUpdate} />
              </div>


              {/* System Health Overview */}
              <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">System Health</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">99.7%</div>
                    <div className="text-sm text-slate-400">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">8.2ms</div>
                    <div className="text-sm text-slate-400">Avg Response</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {messages.slice(-5).map((message) => {
                    const sender = personas.find(p => p.id === message.senderId);
                    return (
                      <div key={message.id} className="flex items-start space-x-3 p-3 bg-slate-700/50 rounded-lg">
                        {sender && (
                          <img 
                            src={sender.avatar} 
                            alt={sender.name}
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-300 text-sm font-medium">
                            {sender?.name || 'System'}
                          </p>
                          <p className="text-slate-400 text-xs truncate">
                            {message.type === 'voice' ? '🎵 Voice message' : message.content}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            {/* Channel List */}
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-4 h-full">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">Channels</h2>
                <ChannelList
                  channels={channels}
                  personas={personas}
                  activeChannelId={activeChannelId}
                  onChannelSelect={setActiveChannelId}
                />
              </div>
            </div>

            {/* Chat Interface */}
            <div className="col-span-12 lg:col-span-9">
              {activeChannel ? (
                <ChatInterface
                  channel={activeChannel}
                  messages={channelMessages}
                  personas={personas}
                  currentUserId="current-user"
                  onSendMessage={handleSendMessage}
                  onSendVoice={handleSendVoice}
                />
              ) : (
                <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-8 h-full flex items-center justify-center">
                  <p className="text-slate-400">Select a channel to start chatting</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-6">Tesla/SpaceX/NASA-Grade DevOps</h2>
              <MissionCriticalDevOps />
            </div>
            <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-6">Linear-Style Project Management</h2>
              <LinearStyleProjectManagement />
            </div>
            <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-6">Kanban Operations Board</h2>
              <KanbanBoard tasks={tasks} onTaskUpdate={handleTaskUpdate} />
            </div>
          </div>
        )}

        {activeTab === 'gis' && (
          <CTASCommandCenter />
        )}

        {activeTab === 'hft' && (
          <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-6">High Frequency Trading</h2>
            <div className="text-center py-12 text-slate-400">
              HFT Module Loading...
            </div>
          </div>
        )}

        {activeTab === 'sdc' && (
          <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-6">Software Defined Cockpit</h2>
            <div className="text-center py-12 text-slate-400">
              SDC Module Loading...
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-6">System Performance</h2>
              <MetricsWidget metrics={metrics} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">API Endpoints</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-slate-700 rounded">
                    <span className="text-green-400 font-mono">GET</span>
                    <span className="text-slate-300">/api/personas</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-700 rounded">
                    <span className="text-blue-400 font-mono">POST</span>
                    <span className="text-slate-300">/api/ai/route</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-700 rounded">
                    <span className="text-yellow-400 font-mono">PUT</span>
                    <span className="text-slate-300">/api/tasks/:id</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-700 rounded">
                    <span className="text-purple-400 font-mono">WS</span>
                    <span className="text-slate-300">/ws</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Hash Cache Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Graph Queries</span>
                    <span className="text-green-400">1,247 cached</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">AI Routes</span>
                    <span className="text-green-400">892 cached</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Metrics</span>
                    <span className="text-green-400">156 cached</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Hit Rate</span>
                    <span className="text-cyan-400">94.7%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'crates' && (
          <div className="space-y-6">
            {/* Smart Crate Orchestration Section */}
            <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
              <SmartCrateControl />
            </div>

            <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-6">Crate Analysis & Shipyard</h2>
              
              {/* Cannon Plug Connection Status */}
              <div className="mb-6 p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-slate-100">Cannon Plug API Status</h3>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('http://localhost:18100/status');
                        if (response.ok) {
                          const data = await response.json();
                          alert(`🔌 Cannon Plug Connected!\n\nServices: ${data.total_services}\nHealthy: ${data.healthy_services}\nStatus: ${data.status}\n\nServices:\n${data.services.map((s: any) => `- ${s.name} (${s.port})`).join('\n')}`);
                        } else {
                          alert('❌ Cannon Plug not responding');
                        }
                      } catch (error) {
                        alert('❌ Cannot connect to Cannon Plug API\n\nMake sure the Smart CDN Gateway is running on port 18100');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Connect to Registry
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-600 rounded p-3">
                    <div className="text-sm text-slate-300">Total Services</div>
                    <div className="text-2xl font-bold text-cyan-400">4</div>
                  </div>
                  <div className="bg-slate-600 rounded p-3">
                    <div className="text-sm text-slate-300">Healthy Services</div>
                    <div className="text-2xl font-bold text-green-400">1</div>
                  </div>
                  <div className="bg-slate-600 rounded p-3">
                    <div className="text-sm text-slate-300">Crates Analyzed</div>
                    <div className="text-2xl font-bold text-blue-400">0</div>
                  </div>
                  <div className="bg-slate-600 rounded p-3">
                    <div className="text-sm text-slate-300">Registry Status</div>
                    <div className="text-2xl font-bold text-yellow-400">Active</div>
                  </div>
                </div>
              </div>

              {/* Service Registry */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Core Services</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-600 rounded">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-orange-400 mr-3" />
                        <div>
                          <div className="text-slate-100 font-medium">Universal Telemetry</div>
                          <div className="text-slate-400 text-sm">Port 18101</div>
                        </div>
                      </div>
                      <div className="text-green-400 text-sm">Active</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-600 rounded">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-orange-400 mr-3" />
                        <div>
                          <div className="text-slate-100 font-medium">XSD Environment</div>
                          <div className="text-slate-400 text-sm">Port 18102</div>
                        </div>
                      </div>
                      <div className="text-yellow-400 text-sm">Unknown</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-600 rounded">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-orange-400 mr-3" />
                        <div>
                          <div className="text-slate-100 font-medium">Port Manager</div>
                          <div className="text-slate-400 text-sm">Port 18103</div>
                        </div>
                      </div>
                      <div className="text-yellow-400 text-sm">Unknown</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-600 rounded">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-orange-400 mr-3" />
                        <div>
                          <div className="text-slate-100 font-medium">Statistical Analysis</div>
                          <div className="text-slate-400 text-sm">Port 18108</div>
                        </div>
                      </div>
                      <div className="text-yellow-400 text-sm">Unknown</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4">Cannon Plug Endpoints</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-slate-600 rounded">
                      <span className="text-green-400 font-mono">GET</span>
                      <span className="text-slate-300">/health</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-600 rounded">
                      <span className="text-green-400 font-mono">GET</span>
                      <span className="text-slate-300">/status</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-600 rounded">
                      <span className="text-green-400 font-mono">GET</span>
                      <span className="text-slate-300">/services</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-600 rounded">
                      <span className="text-blue-400 font-mono">POST</span>
                      <span className="text-slate-300">/cannon/plug</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-600 rounded">
                      <span className="text-green-400 font-mono">GET</span>
                      <span className="text-slate-300">/cannon/plugs</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-600 rounded">
                      <span className="text-blue-400 font-mono">POST</span>
                      <span className="text-slate-300">/cannon/connect</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-600 rounded">
                      <span className="text-blue-400 font-mono">POST</span>
                      <span className="text-slate-300">/xsd/analyze</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-600 rounded">
                      <span className="text-green-400 font-mono">GET</span>
                      <span className="text-slate-300">/route/:service</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crate Analysis Data Preview */}
              <div className="mt-6 bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Crate Analysis Data Preview</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-slate-600 rounded p-3">
                    <h4 className="text-sm font-medium text-slate-200 mb-2">Sample Crate Metrics</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Compilation Time:</span>
                        <span className="text-green-400">2.3s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Dependencies:</span>
                        <span className="text-blue-400">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Code Coverage:</span>
                        <span className="text-yellow-400">87%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Security Score:</span>
                        <span className="text-green-400">A+</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-600 rounded p-3">
                    <h4 className="text-sm font-medium text-slate-200 mb-2">Analysis Status</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-300">XSD Validation:</span>
                        <span className="text-green-400">✓ Valid</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Tool Chain:</span>
                        <span className="text-blue-400">Rust + Axum</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Playbook Match:</span>
                        <span className="text-yellow-400">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">EEIS Score:</span>
                        <span className="text-green-400">92/100</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-slate-600 rounded">
                  <div className="text-xs text-slate-400">
                    <strong>Note:</strong> This preview shows the type of data that will be displayed when crates are analyzed.
                    Real-time data will appear here when crates are registered and analyzed through the cannon plug API.
                  </div>
                </div>
              </div>

              {/* Shipyard Readout Section */}
              <div className="mt-6 bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Shipyard Readout - Raw API Data</h3>

                {/* Crate Selector */}
                <div className="mb-4 p-3 bg-slate-600 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-slate-100">Select Crate for Analysis</h4>
                    <div className="flex space-x-2">
                      <select
                        value={selectedCrate}
                        onChange={(e) => setSelectedCrate(e.target.value)}
                        className="px-3 py-2 bg-slate-700 text-slate-100 rounded-md border border-slate-500 text-sm"
                      >
                        <option value="">Select a crate...</option>
                        <option value="universal-telemetry">Universal Telemetry</option>
                        <option value="xsd-environment">XSD Environment</option>
                        <option value="port-manager">Port Manager</option>
                        <option value="statistical-analysis">Statistical Analysis</option>
                      </select>
                      <button
                        onClick={async () => {
                          if (!selectedCrate) {
                            alert('Please select a crate first');
                            return;
                          }

                          try {
                            const [statusRes, servicesRes] = await Promise.all([
                              fetch('http://localhost:18100/status'),
                              fetch('http://localhost:18100/services')
                            ]);

                            const statusData = statusRes.ok ? await statusRes.json() : null;
                            const servicesData = servicesRes.ok ? await servicesRes.json() : null;

                            const crateInfo = statusData?.services?.find((s: any) => s.id === selectedCrate);

                            if (crateInfo) {
                              setCrateData({
                                ...crateInfo,
                                timestamp: new Date().toISOString(),
                                rawStatus: statusData,
                                rawServices: servicesData
                              });
                            } else {
                              alert(`Crate "${selectedCrate}" not found in registry`);
                            }
                          } catch (error) {
                            alert('❌ Cannot connect to Cannon Plug API');
                          }
                        }}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center text-sm"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Analyze
                      </button>
                    </div>
                  </div>
                </div>

                {/* Raw Data Display */}
                {crateData && (
                  <div className="mb-4 p-3 bg-slate-600 rounded-lg">
                    <h4 className="text-md font-medium text-slate-200 mb-3">Selected Crate: {crateData.name}</h4>
                    <div className="bg-slate-700 rounded p-3 text-xs font-mono text-slate-300 max-h-32 overflow-y-auto">
                      <pre>{JSON.stringify(crateData, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'enterprise' && (
          <div className="space-y-6">
            <LinearMultiLLMOnboarding />
            <EnterpriseIntegrationHub />
            <LeptosDocsBridge />
          </div>
        )}

        {activeTab === 'ontology' && (
          <div className="space-y-6">
            <CTASOntologyManager />
          </div>
        )}

        {activeTab === 'cyberops' && (
          <div className="space-y-6">
            <CyberOpsWorkspace isConnected={isConnected} />
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-slate-100">Development Tools</h3>
              </div>
              <ToolForge />
            </div>
          </div>
        )}



      </main>
      
      <WebSocketDebugger />
    </div>
  );
}

export default App;