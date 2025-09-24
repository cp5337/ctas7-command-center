import React, { useState } from 'react';
import {
  Smartphone,
  Code,
  Layers,
  Zap,
  Shield,
  Bell,
  Fingerprint,
  Download,
  GitBranch,
  Cpu,
  Database,
  Wifi,
  Settings,
  Play
} from 'lucide-react';

interface ComponentMapping {
  typescript: string;
  swift: string;
  swiftUI: string;
  description: string;
  complexity: 'low' | 'medium' | 'high';
  dependencies: string[];
  iosFeatures: string[];
}

interface IOSArchitectureMapperProps {
  onExportToXcode?: () => void;
}

export const IOSArchitectureMapper: React.FC<IOSArchitectureMapperProps> = ({
  onExportToXcode
}) => {
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'components' | 'features' | 'architecture' | 'export'>('components');

  const componentMappings: Record<string, ComponentMapping> = {
    'CyberOpsWorkspace': {
      typescript: `interface CyberOpsWorkspaceProps {
  isConnected: boolean;
}

export const CyberOpsWorkspace: React.FC<CyberOpsWorkspaceProps>`,
      swift: `import SwiftUI
import Combine

struct CyberOpsWorkspace: View {
    @StateObject private var viewModel = CyberOpsViewModel()
    @State private var isConnected: Bool = false
}`,
      swiftUI: `struct CyberOpsWorkspace: View {
    var body: some View {
        NavigationView {
            TabView {
                HoneypotListView()
                    .tabItem {
                        Image(systemName: "target")
                        Text("Honeypots")
                    }

                ThreatIntelView()
                    .tabItem {
                        Image(systemName: "exclamationmark.triangle")
                        Text("Threats")
                    }
            }
            .navigationTitle("Cyber Ops")
        }
    }
}`,
      description: 'Main cyber operations interface with honeypot management and threat detection',
      complexity: 'high',
      dependencies: ['Combine', 'Network', 'CryptoKit', 'BackgroundTasks'],
      iosFeatures: ['Push Notifications', 'Background App Refresh', 'Biometric Auth', 'Network Monitoring']
    },

    'AIIssueDetector': {
      typescript: `interface DetectedIssue {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
}`,
      swift: `import Foundation
import CoreML

struct DetectedIssue: Identifiable, Codable {
    let id = UUID()
    let title: String
    let severity: IssueSeverity
    let confidence: Double
}

enum IssueSeverity: String, CaseIterable {
    case critical, high, medium, low
}`,
      swiftUI: `struct AIIssueDetectorView: View {
    @StateObject private var detector = AIIssueDetector()

    var body: some View {
        List(detector.detectedIssues) { issue in
            IssueRowView(issue: issue)
                .swipeActions {
                    Button("Create Issue") {
                        detector.createIssue(from: issue)
                    }
                    .tint(.green)

                    Button("Dismiss") {
                        detector.dismiss(issue)
                    }
                    .tint(.red)
                }
        }
        .refreshable {
            await detector.scanForIssues()
        }
    }
}`,
      description: 'AI-powered issue detection with Linear-style intelligent routing',
      complexity: 'high',
      dependencies: ['CoreML', 'CreateML', 'NaturalLanguage'],
      iosFeatures: ['Machine Learning', 'Siri Shortcuts', 'Push Notifications', 'Spotlight Search']
    },

    'KanbanBoard': {
      typescript: `interface Task {
  id: string;
  title: string;
  status: 'todo' | 'progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}`,
      swift: `struct Task: Identifiable, Codable, Hashable {
    let id = UUID()
    var title: String
    var status: TaskStatus
    var priority: TaskPriority
    var createdAt: Date
    var assignee: String?
}

enum TaskStatus: String, CaseIterable {
    case todo = "To Do"
    case inProgress = "In Progress"
    case review = "Review"
    case done = "Done"
}`,
      swiftUI: `struct KanbanBoardView: View {
    @StateObject private var taskManager = TaskManager()

    var body: some View {
        ScrollView(.horizontal) {
            HStack(spacing: 16) {
                ForEach(TaskStatus.allCases, id: \\.self) { status in
                    VStack {
                        Text(status.rawValue)
                            .font(.headline)

                        LazyVStack {
                            ForEach(taskManager.tasks(for: status)) { task in
                                TaskCardView(task: task)
                                    .draggable(task)
                            }
                        }
                        .dropDestination(for: Task.self) { tasks, location in
                            taskManager.move(tasks, to: status)
                            return true
                        }
                    }
                    .frame(width: 300)
                }
            }
            .padding()
        }
    }
}`,
      description: 'Drag-and-drop task management with iOS native gestures',
      complexity: 'medium',
      dependencies: ['UniformTypeIdentifiers'],
      iosFeatures: ['Drag and Drop', 'Haptic Feedback', 'Context Menus', 'Quick Actions']
    },

    'MetricsWidget': {
      typescript: `interface SystemMetric {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}`,
      swift: `struct SystemMetric: Identifiable, Codable {
    let id = UUID()
    let name: String
    var value: Double
    var trend: MetricTrend
    let unit: String
    let timestamp: Date
}

enum MetricTrend: String, Codable {
    case up, down, stable
}`,
      swiftUI: `struct MetricsWidgetView: View {
    let metrics: [SystemMetric]

    var body: some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible())
        ]) {
            ForEach(metrics) { metric in
                VStack {
                    HStack {
                        Text(metric.name)
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Spacer()
                        Image(systemName: metric.trend.icon)
                            .foregroundColor(metric.trend.color)
                    }

                    Text("\\(metric.value, specifier: "%.1f")")
                        .font(.title2.bold())

                    Text(metric.unit)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(.regularMaterial)
                .cornerRadius(12)
            }
        }
    }
}`,
      description: 'Real-time system metrics with iOS native chart integration',
      complexity: 'medium',
      dependencies: ['Charts', 'WidgetKit'],
      iosFeatures: ['Widgets', 'Live Activities', 'Charts Framework', 'Background Updates']
    }
  };

  const iosFeatures = [
    {
      name: 'Push Notifications',
      icon: Bell,
      description: 'Real-time threat alerts and system notifications',
      implementation: 'UserNotifications framework with rich media support'
    },
    {
      name: 'Biometric Authentication',
      icon: Fingerprint,
      description: 'Secure access to sensitive cyber ops functions',
      implementation: 'LocalAuthentication with TouchID/FaceID'
    },
    {
      name: 'Background Processing',
      icon: Cpu,
      description: 'Continue monitoring threats when app is backgrounded',
      implementation: 'Background App Refresh and Background Tasks'
    },
    {
      name: 'Offline Capabilities',
      icon: Database,
      description: 'Cache critical data for field operations',
      implementation: 'Core Data with CloudKit sync'
    },
    {
      name: 'Network Monitoring',
      icon: Wifi,
      description: 'Real-time connection status and Neural Mux integration',
      implementation: 'Network framework with path monitoring'
    },
    {
      name: 'Machine Learning',
      icon: Zap,
      description: 'On-device AI for threat detection and issue routing',
      implementation: 'Core ML with custom trained models'
    }
  ];

  const architectureLayers = [
    {
      name: 'SwiftUI Views',
      description: 'Native iOS interface components',
      components: ['CyberOpsWorkspace', 'HoneypotListView', 'ThreatIntelView', 'TaskCardView'],
      color: 'bg-blue-500'
    },
    {
      name: 'ViewModels (MVVM)',
      description: 'Business logic and state management',
      components: ['CyberOpsViewModel', 'TaskManager', 'ThreatDetector', 'AIAnalyzer'],
      color: 'bg-green-500'
    },
    {
      name: 'Service Layer',
      description: 'API communication and data processing',
      components: ['NeuralMuxService', 'HoneypotAPI', 'ThreatIntelService', 'CrateAnalyzer'],
      color: 'bg-orange-500'
    },
    {
      name: 'Core Data',
      description: 'Local storage and synchronization',
      components: ['TaskEntity', 'ThreatEntity', 'MetricEntity', 'HoneypotEntity'],
      color: 'bg-purple-500'
    },
    {
      name: 'System Integration',
      description: 'iOS system services and frameworks',
      components: ['NotificationCenter', 'BackgroundTasks', 'Biometrics', 'NetworkMonitor'],
      color: 'bg-red-500'
    }
  ];

  const tabs = [
    { id: 'components', label: 'Components', icon: Layers },
    { id: 'features', label: 'iOS Features', icon: Smartphone },
    { id: 'architecture', label: 'Architecture', icon: GitBranch },
    { id: 'export', label: 'Export', icon: Download }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-cyan-400/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-slate-100">iOS Architecture Mapper</h2>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
              TypeScript → SwiftUI
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onExportToXcode}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export to Xcode</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
              <Play className="w-4 h-4" />
              <span>Generate iOS Project</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'components' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Component List */}
          <div className="space-y-4">
            {Object.entries(componentMappings).map(([name, mapping]) => (
              <div
                key={name}
                className={`bg-slate-700 border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedMapping === name ? 'border-blue-400' : 'border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => setSelectedMapping(name)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-slate-100 font-medium">{name}</h3>
                    <p className="text-slate-400 text-sm">{mapping.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    mapping.complexity === 'high' ? 'bg-red-400/10 text-red-400' :
                    mapping.complexity === 'medium' ? 'bg-yellow-400/10 text-yellow-400' :
                    'bg-green-400/10 text-green-400'
                  }`}>
                    {mapping.complexity.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {mapping.iosFeatures.slice(0, 3).map((feature) => (
                    <span key={feature} className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs">
                      {feature}
                    </span>
                  ))}
                  {mapping.iosFeatures.length > 3 && (
                    <span className="text-slate-400 text-xs">+{mapping.iosFeatures.length - 3} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Code Preview */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Code Mapping</h3>
            {selectedMapping && componentMappings[selectedMapping] ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">TypeScript (Current)</h4>
                  <div className="bg-slate-800 rounded p-3 text-xs font-mono text-slate-300">
                    <pre>{componentMappings[selectedMapping].typescript}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Swift (Target)</h4>
                  <div className="bg-slate-800 rounded p-3 text-xs font-mono text-slate-300">
                    <pre>{componentMappings[selectedMapping].swift}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">SwiftUI Implementation</h4>
                  <div className="bg-slate-800 rounded p-3 text-xs font-mono text-slate-300">
                    <pre>{componentMappings[selectedMapping].swiftUI}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Dependencies</h4>
                  <div className="flex flex-wrap gap-2">
                    {componentMappings[selectedMapping].dependencies.map((dep) => (
                      <span key={dep} className="bg-orange-500/10 text-orange-400 px-2 py-1 rounded text-xs">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Select a component to view code mapping</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {iosFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.name} className="bg-slate-700 rounded-lg p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Icon className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">{feature.name}</h3>
                    <p className="text-slate-400 text-sm mb-3">{feature.description}</p>
                    <div className="bg-slate-800 rounded p-3">
                      <p className="text-xs font-mono text-slate-300">{feature.implementation}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-6">iOS App Architecture Layers</h3>
            <div className="space-y-4">
              {architectureLayers.map((layer, index) => (
                <div key={layer.name} className="flex items-start space-x-4">
                  <div className={`w-4 h-4 rounded-full ${layer.color} flex-shrink-0 mt-2`}></div>
                  <div className="flex-1">
                    <h4 className="text-slate-100 font-medium mb-1">{layer.name}</h4>
                    <p className="text-slate-400 text-sm mb-2">{layer.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {layer.components.map((component) => (
                        <span key={component} className="bg-slate-600 text-slate-300 px-2 py-1 rounded text-xs">
                          {component}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Export Options</h3>
            <div className="space-y-4">
              <button className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-3">
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Xcode Project</div>
                  <div className="text-sm opacity-80">Complete iOS project with SwiftUI views</div>
                </div>
              </button>

              <button className="w-full p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-3">
                <Code className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Swift Package</div>
                  <div className="text-sm opacity-80">Reusable Swift Package Manager library</div>
                </div>
              </button>

              <button className="w-full p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-3">
                <Settings className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Configuration Files</div>
                  <div className="text-sm opacity-80">Info.plist, entitlements, and build settings</div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Project Structure</h3>
            <div className="bg-slate-800 rounded p-4 text-xs font-mono text-slate-300">
              <pre>{`CTASCyberOps/
├── App/
│   ├── CTASCyberOpsApp.swift
│   └── ContentView.swift
├── Views/
│   ├── CyberOpsWorkspace.swift
│   ├── HoneypotListView.swift
│   ├── ThreatIntelView.swift
│   └── TaskCardView.swift
├── ViewModels/
│   ├── CyberOpsViewModel.swift
│   ├── TaskManager.swift
│   └── ThreatDetector.swift
├── Services/
│   ├── NeuralMuxService.swift
│   ├── HoneypotAPI.swift
│   └── ThreatIntelService.swift
├── Models/
│   ├── Task.swift
│   ├── Threat.swift
│   └── Honeypot.swift
└── Resources/
    ├── Assets.xcassets
    └── Info.plist`}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};