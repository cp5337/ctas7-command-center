import React, { useState, useEffect } from 'react';
import {
  Zap,
  Target,
  Users,
  GitBranch,
  MessageSquare,
  Bell,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Circle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  User,
  Tag,
  Link,
  Command,
  Hash,
  Sparkles,
  GitCommit,
  Rocket,
  Activity,
  Globe,
  Database,
  Shield,
  Code,
  Settings,
  Eye,
  Star,
  ChevronDown,
  ChevronRight,
  Archive,
  Play,
  Pause,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';

interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done' | 'canceled';
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'no-priority';
  assignee?: {
    name: string;
    avatar: string;
  };
  labels: string[];
  estimate?: number;
  team: string;
  project?: string;
  cycle?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  comments: number;
  linkedPRs: number;
  automationTriggers: string[];
}

interface LinearCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  progress: number;
  issuesTotal: number;
  issuesCompleted: number;
  team: string;
}

interface LinearProject {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'canceled';
  progress: number;
  team: string;
  lead: string;
  targetDate?: string;
  icon: string;
  color: string;
}

export const LinearStyleProjectManagement: React.FC = () => {
  const [activeView, setActiveView] = useState<'issues' | 'projects' | 'cycles' | 'roadmap' | 'insights'>('issues');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showNewIssue, setShowNewIssue] = useState(false);
  const [issues, setIssues] = useState<LinearIssue[]>([]);
  const [cycles, setCycles] = useState<LinearCycle[]>([]);
  const [projects, setProjects] = useState<LinearProject[]>([]);

  const teams = ['Engineering', 'Design', 'Product', 'Security', 'DevOps', 'Data'];

  useEffect(() => {
    // Load real Linear data or fallback to mock data
    loadLinearData();
  }, []);

  const loadLinearData = async () => {
    try {
      // Import Linear service
      const { linearService } = await import('../services/linearService');

      if (linearService) {
        console.log('Loading CTAS data from Linear...');

        // Load real data from Linear
        const [linearIssues, linearProjects, linearCycles] = await Promise.all([
          linearService.getCTASIssues(),
          linearService.getCTASProjects(),
          linearService.getCTASCycles()
        ]);

        // Convert Linear data to CTAS format
        const ctasIssues = linearIssues.map(issue => linearService.convertLinearIssueToCTAS(issue));

        setIssues(ctasIssues);
        console.log(`Loaded ${ctasIssues.length} issues from Linear`);

        // Set projects and cycles (would need similar conversion functions)
        // setProjects(linearProjects);
        // setCycles(linearCycles);

        return;
      }
    } catch (error) {
      console.warn('Failed to load from Linear, using mock data:', error);
    }

    // Fallback to mock data if Linear is not configured or fails
    console.log('Using mock data - Linear not configured or unavailable');
    setIssues([
      {
        id: '1',
        identifier: 'ENG-247',
        title: 'Implement real-time telemetry dashboard',
        description: 'Build aerospace-grade monitoring dashboard with sub-second latency',
        status: 'in-progress',
        priority: 'urgent',
        assignee: { name: 'Sarah Chen', avatar: '👩‍💻' },
        labels: ['backend', 'monitoring', 'critical'],
        estimate: 8,
        team: 'Engineering',
        project: 'Mission Critical Platform',
        cycle: 'Sprint 24.3',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-16T14:30:00Z',
        dueDate: '2024-01-20T00:00:00Z',
        comments: 7,
        linkedPRs: 2,
        automationTriggers: ['deployment-ready', 'security-scan']
      },
      {
        id: '2',
        identifier: 'ENG-248',
        title: 'Optimize deployment pipeline performance',
        description: 'Reduce deployment time from 12min to <5min using parallel testing',
        status: 'todo',
        priority: 'high',
        assignee: { name: 'Alex Rodriguez', avatar: '👨‍💻' },
        labels: ['devops', 'ci/cd', 'performance'],
        estimate: 5,
        team: 'DevOps',
        project: 'Infrastructure Optimization',
        cycle: 'Sprint 24.3',
        createdAt: '2024-01-14T09:00:00Z',
        updatedAt: '2024-01-16T11:00:00Z',
        comments: 3,
        linkedPRs: 0,
        automationTriggers: ['performance-test', 'auto-deploy']
      },
      {
        id: '3',
        identifier: 'SEC-89',
        title: 'Zero-trust security architecture implementation',
        description: 'Implement comprehensive zero-trust security model across all services',
        status: 'in-review',
        priority: 'urgent',
        assignee: { name: 'Maya Patel', avatar: '👩‍🔒' },
        labels: ['security', 'architecture', 'zero-trust'],
        estimate: 13,
        team: 'Security',
        project: 'Security Hardening',
        cycle: 'Sprint 24.3',
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-01-16T16:45:00Z',
        dueDate: '2024-01-18T00:00:00Z',
        comments: 12,
        linkedPRs: 4,
        automationTriggers: ['security-review', 'compliance-check']
      }
    ]);

    setCycles([
      {
        id: '1',
        name: 'Sprint 24.3',
        startDate: '2024-01-15T00:00:00Z',
        endDate: '2024-01-28T00:00:00Z',
        status: 'active',
        progress: 68,
        issuesTotal: 23,
        issuesCompleted: 15,
        team: 'Engineering'
      },
      {
        id: '2',
        name: 'Q1 Security Sprint',
        startDate: '2024-01-08T00:00:00Z',
        endDate: '2024-01-22T00:00:00Z',
        status: 'active',
        progress: 82,
        issuesTotal: 12,
        issuesCompleted: 10,
        team: 'Security'
      }
    ]);

    setProjects([
      {
        id: '1',
        name: 'Mission Critical Platform',
        description: 'Aerospace-grade reliability infrastructure',
        status: 'active',
        progress: 74,
        team: 'Engineering',
        lead: 'Sarah Chen',
        targetDate: '2024-03-15T00:00:00Z',
        icon: '🚀',
        color: 'bg-blue-500'
      },
      {
        id: '2',
        name: 'Security Hardening',
        description: 'Zero-trust security implementation',
        status: 'active',
        progress: 45,
        team: 'Security',
        lead: 'Maya Patel',
        targetDate: '2024-02-28T00:00:00Z',
        icon: '🛡️',
        color: 'bg-red-500'
      }
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'backlog': return 'text-slate-400';
      case 'todo': return 'text-blue-400';
      case 'in-progress': return 'text-yellow-400';
      case 'in-review': return 'text-purple-400';
      case 'done': return 'text-green-400';
      case 'canceled': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'backlog': return <Circle className="w-4 h-4" />;
      case 'todo': return <Circle className="w-4 h-4 fill-current" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'in-review': return <Eye className="w-4 h-4" />;
      case 'done': return <CheckCircle2 className="w-4 h-4" />;
      case 'canceled': return <Archive className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.identifier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = selectedTeam === 'all' || issue.team === selectedTeam;
    const matchesPriority = filterPriority === 'all' || issue.priority === filterPriority;

    return matchesSearch && matchesTeam && matchesPriority;
  });

  const views = [
    { id: 'issues', label: 'Issues', icon: Circle },
    { id: 'projects', label: 'Projects', icon: Target },
    { id: 'cycles', label: 'Cycles', icon: Calendar },
    { id: 'roadmap', label: 'Roadmap', icon: TrendingUp },
    { id: 'insights', label: 'Insights', icon: Activity }
  ];

  return (
    <div className="space-y-6">
      {/* Linear-style Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-slate-100">Linear-Style Project Management</h2>
          </div>
          <div className="text-sm text-slate-400">
            Simplicity scales • High-velocity development
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNewIssue(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Issue</span>
            <kbd className="ml-1 px-1 py-0.5 text-xs bg-purple-700 rounded">C</kbd>
          </button>
        </div>
      </div>

      {/* Navigation & Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1">
            {views.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm ${
                    activeView === view.id
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{view.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm w-64"
            />
            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-1 py-0.5 text-xs text-slate-400 bg-slate-700 rounded">
              ⌘K
            </kbd>
          </div>

          {/* Team Filter */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="all">All Teams</option>
            {teams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>
      </div>

      {/* Content Views */}
      {activeView === 'issues' && (
        <div className="space-y-3">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-lg p-4 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Status & Priority */}
                  <div className="flex items-center space-x-2">
                    <div className={getStatusColor(issue.status)}>
                      {getStatusIcon(issue.status)}
                    </div>
                    <span className="text-xs font-mono text-slate-400">{issue.identifier}</span>
                    <span className="text-sm">{getPriorityIcon(issue.priority)}</span>
                  </div>

                  {/* Title & Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-slate-100 font-medium text-sm truncate group-hover:text-purple-300 transition-colors">
                      {issue.title}
                    </h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs text-slate-400">{issue.team}</span>
                      {issue.project && (
                        <span className="text-xs text-slate-400">• {issue.project}</span>
                      )}
                      {issue.cycle && (
                        <span className="text-xs text-slate-400">• {issue.cycle}</span>
                      )}
                      {issue.estimate && (
                        <span className="text-xs text-slate-400">• {issue.estimate}pts</span>
                      )}
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="flex flex-wrap gap-1">
                    {issue.labels.slice(0, 3).map((label, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded-full"
                      >
                        {label}
                      </span>
                    ))}
                    {issue.labels.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-slate-700 text-slate-400 rounded-full">
                        +{issue.labels.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Assignee & Meta */}
                  <div className="flex items-center space-x-3">
                    {issue.assignee && (
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{issue.assignee.avatar}</span>
                        <span className="text-xs text-slate-400 hidden md:block">{issue.assignee.name}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-slate-400">
                      {issue.comments > 0 && (
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-3 h-3" />
                          <span className="text-xs">{issue.comments}</span>
                        </div>
                      )}
                      {issue.linkedPRs > 0 && (
                        <div className="flex items-center space-x-1">
                          <GitBranch className="w-3 h-3" />
                          <span className="text-xs">{issue.linkedPRs}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 text-slate-400 hover:text-purple-400 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-slate-200 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Automation Triggers */}
              {issue.automationTriggers.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-slate-400">Automations:</span>
                    <div className="flex space-x-1">
                      {issue.automationTriggers.map((trigger, index) => (
                        <span
                          key={index}
                          className="px-1.5 py-0.5 text-xs bg-purple-600/20 text-purple-300 rounded"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeView === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 ${project.color} rounded-lg flex items-center justify-center text-lg`}>
                  {project.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{project.name}</h3>
                  <p className="text-sm text-slate-400">{project.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Progress</span>
                  <span className="text-sm text-slate-200">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${project.color}`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Lead: {project.lead}</span>
                  <span className="text-slate-400">{project.team}</span>
                </div>

                {project.targetDate && (
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Due {new Date(project.targetDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === 'cycles' && (
        <div className="space-y-4">
          {cycles.map((cycle) => (
            <div key={cycle.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{cycle.name}</h3>
                  <p className="text-sm text-slate-400">
                    {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  cycle.status === 'active' ? 'bg-green-600 text-white' :
                  cycle.status === 'completed' ? 'bg-blue-600 text-white' :
                  'bg-slate-600 text-slate-300'
                }`}>
                  {cycle.status}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-100">{cycle.progress}%</div>
                  <div className="text-sm text-slate-400">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-100">{cycle.issuesCompleted}/{cycle.issuesTotal}</div>
                  <div className="text-sm text-slate-400">Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-100">{cycle.team}</div>
                  <div className="text-sm text-slate-400">Team</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${cycle.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === 'roadmap' && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-6">Product Roadmap</h3>
          <div className="space-y-6">
            {projects.map((project, index) => (
              <div key={project.id} className="flex items-center space-x-4">
                <div className={`w-4 h-4 ${project.color} rounded-full flex-shrink-0`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-slate-100 font-medium">{project.name}</h4>
                    <span className="text-sm text-slate-400">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${project.color}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-400">Velocity</span>
            </div>
            <div className="text-2xl font-bold text-slate-100">23.4</div>
            <div className="text-xs text-green-400">+12% from last cycle</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-400">Completion Rate</span>
            </div>
            <div className="text-2xl font-bold text-slate-100">87%</div>
            <div className="text-xs text-blue-400">Above target (85%)</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-400">Cycle Time</span>
            </div>
            <div className="text-2xl font-bold text-slate-100">3.2d</div>
            <div className="text-xs text-yellow-400">-8% from last cycle</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-400">Focus Score</span>
            </div>
            <div className="text-2xl font-bold text-slate-100">94%</div>
            <div className="text-xs text-purple-400">Excellent focus</div>
          </div>
        </div>
      )}
    </div>
  );
};