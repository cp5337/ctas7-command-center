import React, { useState, useEffect } from 'react';
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  TrendingUp,
  Users,
  Code,
  Bug
} from 'lucide-react';

interface DetectedIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  source: 'code-analysis' | 'system-metrics' | 'user-behavior' | 'deployment';
  suggestedAssignee?: string;
  estimatedEffort?: string;
  tags: string[];
  autoCreated?: boolean;
  relatedFiles?: string[];
  stackTrace?: string;
  timestamp: string;
}

interface AIIssueDetectorProps {
  onCreateIssue: (issue: Partial<DetectedIssue>) => void;
  systemMetrics: any[];
}

export const AIIssueDetector: React.FC<AIIssueDetectorProps> = ({
  onCreateIssue,
  systemMetrics
}) => {
  const [detectedIssues, setDetectedIssues] = useState<DetectedIssue[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStats, setAnalysisStats] = useState({
    totalScanned: 0,
    issuesFound: 0,
    falsePositives: 0,
    accuracy: 94.7
  });

  // Simulate AI issue detection
  useEffect(() => {
    const detectIssues = () => {
      setIsAnalyzing(true);

      // Simulate various types of AI-detected issues
      const mockIssues: DetectedIssue[] = [
        {
          id: `ai-${Date.now()}-1`,
          title: 'Memory leak detected in crate analyzer',
          description: 'AI detected unusual memory usage patterns in the Universal Telemetry service. Memory consumption has increased 45% over 24 hours without corresponding load increase.',
          severity: 'high',
          confidence: 92,
          source: 'system-metrics',
          suggestedAssignee: 'backend-team',
          estimatedEffort: '2-3 days',
          tags: ['memory', 'performance', 'telemetry'],
          relatedFiles: ['src/telemetry/collector.rs', 'src/memory/allocator.rs'],
          timestamp: new Date().toISOString()
        },
        {
          id: `ai-${Date.now()}-2`,
          title: 'Potential security vulnerability in cannon plug API',
          description: 'Pattern analysis suggests possible injection vulnerability in /xsd/analyze endpoint. Input validation appears insufficient based on code patterns.',
          severity: 'critical',
          confidence: 87,
          source: 'code-analysis',
          suggestedAssignee: 'security-team',
          estimatedEffort: '1-2 days',
          tags: ['security', 'api', 'xsd', 'validation'],
          relatedFiles: ['src/api/xsd.rs', 'src/validation/input.rs'],
          timestamp: new Date().toISOString()
        },
        {
          id: `ai-${Date.now()}-3`,
          title: 'Unusual error rate spike in port routing',
          description: 'AI detected 300% increase in port routing failures over the last 2 hours. Pattern suggests potential configuration drift or service degradation.',
          severity: 'medium',
          confidence: 95,
          source: 'system-metrics',
          suggestedAssignee: 'devops-team',
          estimatedEffort: '4-6 hours',
          tags: ['routing', 'networking', 'configuration'],
          relatedFiles: ['src/routing/port_manager.rs'],
          timestamp: new Date().toISOString()
        }
      ];

      setTimeout(() => {
        setDetectedIssues(mockIssues);
        setIsAnalyzing(false);
        setAnalysisStats(prev => ({
          ...prev,
          totalScanned: prev.totalScanned + 147,
          issuesFound: prev.issuesFound + mockIssues.length
        }));
      }, 2000);
    };

    // Run initial detection and then periodically
    detectIssues();
    const interval = setInterval(detectIssues, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: DetectedIssue['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-400/10';
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-blue-400 bg-blue-400/10';
    }
  };

  const getSourceIcon = (source: DetectedIssue['source']) => {
    switch (source) {
      case 'code-analysis': return <Code className="w-4 h-4" />;
      case 'system-metrics': return <TrendingUp className="w-4 h-4" />;
      case 'user-behavior': return <Users className="w-4 h-4" />;
      case 'deployment': return <Zap className="w-4 h-4" />;
    }
  };

  const handleCreateIssue = (issue: DetectedIssue) => {
    onCreateIssue({
      title: issue.title,
      description: `**AI Detected Issue**\n\n${issue.description}\n\n**Details:**\n- Confidence: ${issue.confidence}%\n- Source: ${issue.source}\n- Estimated Effort: ${issue.estimatedEffort}\n\n**Related Files:**\n${issue.relatedFiles?.map(f => `- \`${f}\``).join('\n') || 'None'}\n\n**Tags:** ${issue.tags.join(', ')}`,
      priority: issue.severity === 'critical' ? 'urgent' : issue.severity === 'high' ? 'high' : 'medium',
      assignee: issue.suggestedAssignee
    });

    // Remove from detected issues
    setDetectedIssues(prev => prev.filter(i => i.id !== issue.id));
  };

  const handleDismissIssue = (issueId: string) => {
    setDetectedIssues(prev => prev.filter(i => i.id !== issueId));
    setAnalysisStats(prev => ({
      ...prev,
      falsePositives: prev.falsePositives + 1,
      accuracy: ((prev.issuesFound - prev.falsePositives - 1) / prev.issuesFound) * 100
    }));
  };

  return (
    <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-purple-400" />
          <h2 className="text-lg font-semibold text-slate-100">AI Issue Detection</h2>
          {isAnalyzing && (
            <div className="flex items-center space-x-2 text-sm text-purple-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
              <span>Analyzing...</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <div className="text-slate-400">
            Accuracy: <span className="text-green-400 font-medium">{analysisStats.accuracy.toFixed(1)}%</span>
          </div>
          <div className="text-slate-400">
            Scanned: <span className="text-cyan-400 font-medium">{analysisStats.totalScanned}</span>
          </div>
        </div>
      </div>

      {/* Analysis Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-slate-300">Critical Issues</span>
          </div>
          <div className="text-2xl font-bold text-red-400">
            {detectedIssues.filter(i => i.severity === 'critical').length}
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-slate-300">High Priority</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">
            {detectedIssues.filter(i => i.severity === 'high').length}
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-slate-300">Medium Priority</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            {detectedIssues.filter(i => i.severity === 'medium').length}
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm text-slate-300">Auto-Resolved</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {analysisStats.totalScanned - analysisStats.issuesFound}
          </div>
        </div>
      </div>

      {/* Detected Issues */}
      <div className="space-y-4">
        {detectedIssues.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-slate-400">No issues detected. All systems operating normally.</p>
          </div>
        ) : (
          detectedIssues.map((issue) => (
            <div key={issue.id} className="bg-slate-700 border-l-4 border-purple-400 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center space-x-2">
                    {getSourceIcon(issue.source)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                      {issue.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-100 font-medium mb-1">{issue.title}</h3>
                    <p className="text-slate-300 text-sm mb-2">{issue.description}</p>

                    <div className="flex items-center space-x-4 text-xs text-slate-400">
                      <span>Confidence: {issue.confidence}%</span>
                      <span>Source: {issue.source}</span>
                      <span>Effort: {issue.estimatedEffort}</span>
                      {issue.suggestedAssignee && (
                        <span>→ {issue.suggestedAssignee}</span>
                      )}
                    </div>

                    {issue.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {issue.tags.map((tag) => (
                          <span key={tag} className="bg-slate-600 text-slate-300 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCreateIssue(issue)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                  >
                    Create Issue
                  </button>
                  <button
                    onClick={() => handleDismissIssue(issue.id)}
                    className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-slate-300 text-sm rounded transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              {issue.relatedFiles && issue.relatedFiles.length > 0 && (
                <div className="mt-3 p-3 bg-slate-800 rounded">
                  <div className="text-xs text-slate-400 mb-1">Related Files:</div>
                  <div className="space-y-1">
                    {issue.relatedFiles.map((file) => (
                      <div key={file} className="text-xs font-mono text-cyan-400">{file}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};