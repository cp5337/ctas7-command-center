import React, { useState, useEffect } from 'react';
import { Clock, Code, GitBranch, TrendingUp } from 'lucide-react';

interface AgentProductivity {
  id: string;
  name: string;
  symbol: string; // UTF8 character
  color: string;
  locToday: number;
  locThisHour: number;
  lastPushMinutes: number;
  codeNestingLevel: number;
  trend: 'up' | 'down' | 'stable';
}

export const AgentProductivityWidget: React.FC = () => {
  const [agents, setAgents] = useState<AgentProductivity[]>([
    {
      id: 'claude',
      name: 'Claude',
      symbol: '⚡', // Lightning bolt
      color: 'text-blue-400',
      locToday: 1247,
      locThisHour: 89,
      lastPushMinutes: 23,
      codeNestingLevel: 3.2,
      trend: 'up'
    },
    {
      id: 'copilot',
      name: 'Copilot',
      symbol: '🚀', // Rocket
      color: 'text-purple-400',
      locToday: 892,
      locThisHour: 156,
      lastPushMinutes: 7,
      codeNestingLevel: 4.8,
      trend: 'up'
    },
    {
      id: 'cursor',
      name: 'Cursor',
      symbol: '🎯', // Target
      color: 'text-green-400',
      locToday: 1456,
      locThisHour: 203,
      lastPushMinutes: 45,
      codeNestingLevel: 2.9,
      trend: 'stable'
    },
    {
      id: 'codeium',
      name: 'Codeium',
      symbol: '💎', // Diamond
      color: 'text-cyan-400',
      locToday: 678,
      locThisHour: 67,
      lastPushMinutes: 12,
      codeNestingLevel: 3.7,
      trend: 'down'
    }
  ]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        locThisHour: Math.max(0, agent.locThisHour + Math.floor(Math.random() * 20 - 5)),
        locToday: agent.locToday + Math.floor(Math.random() * 10),
        lastPushMinutes: agent.lastPushMinutes + 1,
        codeNestingLevel: Math.max(1, Math.min(10, agent.codeNestingLevel + (Math.random() - 0.5) * 0.5)),
        trend: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'up' : 'down') : agent.trend
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatLastPush = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return `${Math.floor(minutes / 1440)}d`;
  };

  const getNestingColor = (level: number) => {
    if (level < 3) return 'text-green-400';
    if (level < 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Code className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-slate-100">Agent Productivity</h3>
        <span className="text-xs text-slate-400">Live Tracking</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="group relative bg-slate-700/50 hover:bg-slate-700 rounded-lg p-3 transition-all duration-200 cursor-pointer"
          >
            {/* Agent Symbol & Name */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">{agent.symbol}</span>
              <span className={`text-sm font-medium ${agent.color}`}>
                {agent.name}
              </span>
              <span className="text-xs text-slate-400">
                {getTrendIcon(agent.trend)}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Today</span>
                <span className="text-sm font-mono text-slate-200">
                  {agent.locToday.toLocaleString()} LOC
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">This hour</span>
                <span className="text-sm font-mono text-cyan-400">
                  {agent.locThisHour} LOC
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Last push</span>
                <span className="text-sm font-mono text-green-400">
                  {formatLastPush(agent.lastPushMinutes)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Nesting</span>
                <span className={`text-sm font-mono ${getNestingColor(agent.codeNestingLevel)}`}>
                  {agent.codeNestingLevel.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Hover Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
              <div className="space-y-1">
                <div><strong>{agent.name}</strong> Productivity</div>
                <div>Lines written today: <span className="text-cyan-400">{agent.locToday.toLocaleString()}</span></div>
                <div>Current hour: <span className="text-green-400">{agent.locThisHour}</span> LOC</div>
                <div>Last git push: <span className="text-yellow-400">{formatLastPush(agent.lastPushMinutes)} ago</span></div>
                <div>Code nesting level: <span className={getNestingColor(agent.codeNestingLevel)}>{agent.codeNestingLevel.toFixed(2)}</span></div>
                <div>Trend: <span className="text-slate-400">{agent.trend}</span> {getTrendIcon(agent.trend)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-3 border-t border-slate-600">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-cyan-400">
              {agents.reduce((sum, agent) => sum + agent.locToday, 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">Total LOC Today</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">
              {agents.reduce((sum, agent) => sum + agent.locThisHour, 0)}
            </div>
            <div className="text-xs text-slate-400">This Hour</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-400">
              {(agents.reduce((sum, agent) => sum + agent.codeNestingLevel, 0) / agents.length).toFixed(1)}
            </div>
            <div className="text-xs text-slate-400">Avg Nesting</div>
          </div>
        </div>
      </div>
    </div>
  );
};