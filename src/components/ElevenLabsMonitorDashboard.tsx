import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Volume2,
  Settings,
  BarChart3,
  Zap,
  Clock,
  Users,
  Activity,
  RefreshCw
} from 'lucide-react';

interface ElevenLabsStatus {
  isOnline: boolean;
  latency: number;
  lastCheck: Date;
  consecutiveFailures: number;
  uptime: number;
  charactersUsed: number;
  charactersLimit: number;
  voicesAvailable: number;
}

interface VoicePersona {
  id: string;
  name: string;
  voiceNumber: number;
  elevenLabsId: string;
  status: 'active' | 'testing' | 'offline';
  lastUsed: Date;
  usageCount: number;
  accent: string;
}

interface ApiQuota {
  charactersUsed: number;
  charactersLimit: number;
  resetDate: Date;
  percentUsed: number;
}

const ElevenLabsMonitorDashboard: React.FC = () => {
  const [status, setStatus] = useState<ElevenLabsStatus>({
    isOnline: false,
    latency: 0,
    lastCheck: new Date(),
    consecutiveFailures: 0,
    uptime: 0,
    charactersUsed: 0,
    charactersLimit: 10000,
    voicesAvailable: 0
  });

  const [personas, setPersonas] = useState<VoicePersona[]>([
    { id: 'zoe-expert', name: 'Zoe Expert', voiceNumber: 0, elevenLabsId: 'EXj7B4WDXNbDYqe8KKP3', status: 'active', lastUsed: new Date(), usageCount: 45, accent: 'Standard' },
    { id: 'zoe-satellite', name: 'Zoe Satellite', voiceNumber: 1, elevenLabsId: 'TxGEqnHWrfWFTfGW9XjX', status: 'active', lastUsed: new Date(), usageCount: 32, accent: 'Technical' },
    { id: 'zoe-ground', name: 'Zoe Ground Station', voiceNumber: 2, elevenLabsId: 'VR6AewLTigWG4xSOukaG', status: 'active', lastUsed: new Date(), usageCount: 28, accent: 'Operational' },
    { id: 'emergency', name: 'Emergency Alert', voiceNumber: 3, elevenLabsId: 'pNInz6obpgDQGcFmaJgB', status: 'active', lastUsed: new Date(), usageCount: 3, accent: 'Urgent' },
    { id: 'natasha', name: 'Natasha Tactical', voiceNumber: 4, elevenLabsId: 'ErXwobaYiN019PkySvjV', status: 'active', lastUsed: new Date(), usageCount: 15, accent: 'Military' },
    { id: 'agent-assistant', name: 'Agent Assistant', voiceNumber: 5, elevenLabsId: 'AZnzlk1XvdvUeBnXmlld', status: 'active', lastUsed: new Date(), usageCount: 67, accent: 'Professional' }
  ]);

  const [quota, setQuota] = useState<ApiQuota>({
    charactersUsed: 2847,
    charactersLimit: 10000,
    resetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    percentUsed: 28.47
  });

  const [notifications, setNotifications] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Health check function
  const checkElevenLabsHealth = useCallback(async (): Promise<boolean> => {
    const startTime = Date.now();

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        method: 'GET',
        headers: {
          'xi-api-key': process.env.REACT_APP_ELEVENLABS_API_KEY || '',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        setStatus(prev => ({
          ...prev,
          isOnline: true,
          latency,
          lastCheck: new Date(),
          consecutiveFailures: 0,
          voicesAvailable: data.voices?.length || 0
        }));
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        latency,
        lastCheck: new Date(),
        consecutiveFailures: prev.consecutiveFailures + 1
      }));

      // IMMEDIATE NOTIFICATION when ElevenLabs is down
      const errorMessage = `🚨 ELEVENLABS DOWN! Failure #${status.consecutiveFailures + 1} at ${new Date().toLocaleTimeString()}`;
      setNotifications(prev => [errorMessage, ...prev.slice(0, 9)]);

      // Browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('ElevenLabs Service Down!', {
          body: `API is unreachable. Consecutive failures: ${status.consecutiveFailures + 1}`,
          icon: '/favicon.ico',
          requireInteraction: true
        });
      }

      // Console warning for immediate developer attention
      console.error('🚨 ELEVENLABS API DOWN:', error);

      return false;
    }
  }, [status.consecutiveFailures]);

  // Check quota usage
  const checkQuotaUsage = useCallback(async () => {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
        headers: {
          'xi-api-key': process.env.REACT_APP_ELEVENLABS_API_KEY || '',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuota(prev => ({
          ...prev,
          charactersUsed: data.character_count || prev.charactersUsed,
          charactersLimit: data.character_limit || prev.charactersLimit,
          percentUsed: ((data.character_count / data.character_limit) * 100) || prev.percentUsed
        }));

        // Warn if approaching quota limit
        const percentUsed = (data.character_count / data.character_limit) * 100;
        if (percentUsed > 80) {
          const warning = `⚠️ ElevenLabs quota at ${percentUsed.toFixed(1)}% - ${data.character_count}/${data.character_limit} characters used`;
          setNotifications(prev => [warning, ...prev.slice(0, 9)]);
        }
      }
    } catch (error) {
      console.error('Failed to check quota:', error);
    }
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Auto-refresh health checks
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      checkElevenLabsHealth();
      checkQuotaUsage();
    }, 10000); // Check every 10 seconds

    // Initial check
    checkElevenLabsHealth();
    checkQuotaUsage();

    return () => clearInterval(interval);
  }, [autoRefresh, checkElevenLabsHealth, checkQuotaUsage]);

  const getStatusColor = (isOnline: boolean, consecutiveFailures: number) => {
    if (!isOnline) return 'text-red-400';
    if (consecutiveFailures > 0) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusIcon = (isOnline: boolean) => {
    return isOnline ? CheckCircle : XCircle;
  };

  const testVoicePersona = async (persona: VoicePersona) => {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${persona.elevenLabsId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.REACT_APP_ELEVENLABS_API_KEY || ''
        },
        body: JSON.stringify({
          text: `Voice test for ${persona.name}. This is voice number ${persona.voiceNumber}.`,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8
          }
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        await audio.play();

        setNotifications(prev => [`✅ Voice test successful: ${persona.name}`, ...prev.slice(0, 9)]);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setNotifications(prev => [`❌ Voice test failed: ${persona.name} - ${error}`, ...prev.slice(0, 9)]);
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Volume2 className="h-8 w-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-slate-100">ElevenLabs Monitor Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-700"
                />
                <span className="text-sm text-slate-300">Auto-refresh</span>
              </label>
              <button
                onClick={() => {
                  checkElevenLabsHealth();
                  checkQuotaUsage();
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* API Status */}
          <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">API Status</p>
                <div className="flex items-center space-x-2 mt-2">
                  {React.createElement(getStatusIcon(status.isOnline), {
                    className: `h-5 w-5 ${getStatusColor(status.isOnline, status.consecutiveFailures)}`
                  })}
                  <span className={`text-lg font-semibold ${getStatusColor(status.isOnline, status.consecutiveFailures)}`}>
                    {status.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-slate-500" />
            </div>
            <div className="mt-4 text-xs text-slate-400">
              Last check: {status.lastCheck.toLocaleTimeString()}
            </div>
          </div>

          {/* Latency */}
          <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">API Latency</p>
                <p className="text-2xl font-bold text-slate-100">{status.latency}ms</p>
              </div>
              <Zap className="h-8 w-8 text-slate-500" />
            </div>
            <div className="mt-4 text-xs text-slate-400">
              Failures: {status.consecutiveFailures}
            </div>
          </div>

          {/* Quota Usage */}
          <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Quota Usage</p>
                <p className="text-2xl font-bold text-slate-100">{quota.percentUsed.toFixed(1)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-slate-500" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${quota.percentUsed > 80 ? 'bg-red-500' : quota.percentUsed > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(quota.percentUsed, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {quota.charactersUsed.toLocaleString()} / {quota.charactersLimit.toLocaleString()} characters
              </div>
            </div>
          </div>

          {/* Active Voices */}
          <div className="bg-slate-800 rounded-lg shadow-md p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Active Voices</p>
                <p className="text-2xl font-bold text-slate-100">{personas.filter(p => p.status === 'active').length}</p>
              </div>
              <Users className="h-8 w-8 text-slate-500" />
            </div>
            <div className="mt-4 text-xs text-slate-400">
              Total configured: {personas.length}
            </div>
          </div>
        </div>

        {/* Voice Personas Management */}
        <div className="bg-slate-800 rounded-lg shadow-md mb-8 border border-slate-700">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-slate-100">Voice Personas</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personas.map((persona) => (
                <div key={persona.id} className="border border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow bg-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-slate-100">{persona.name}</h3>
                      <p className="text-sm text-slate-400">Voice #{persona.voiceNumber} • {persona.accent}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      persona.status === 'active' ? 'bg-green-100 text-green-800' :
                      persona.status === 'testing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {persona.status}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-300">
                    <div>ElevenLabs ID: <code className="text-xs bg-slate-600 px-1 rounded text-slate-200">{persona.elevenLabsId}</code></div>
                    <div>Usage: {persona.usageCount} times</div>
                    <div>Last used: {persona.lastUsed.toLocaleDateString()}</div>
                  </div>

                  <button
                    onClick={() => testVoicePersona(persona)}
                    className="mt-3 w-full px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Test Voice
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="bg-slate-800 rounded-lg shadow-md border border-slate-700">
          <div className="px-6 py-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-100">System Notifications</h2>
              <button
                onClick={() => setNotifications([])}
                className="text-sm text-slate-400 hover:text-slate-200"
              >
                Clear all
              </button>
            </div>
          </div>
          <div className="p-6">
            {notifications.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No notifications</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-slate-700 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-100">{notification}</p>
                      <p className="text-xs text-slate-400 mt-1">Just now</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElevenLabsMonitorDashboard;