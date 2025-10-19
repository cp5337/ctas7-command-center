//
//  SDCScreenViews.swift - Solutions Development Center Screen Implementations
//  CTAS-7 Command Center iOS Native - App Store Compliant
//
//  Complete screen implementations using proprietary standards system
//  Military-grade development tools with local LLM integration
//

import SwiftUI
import SwiftData
import Charts

// MARK: - Dashboard View
struct SDCDashboardView: View {
    @EnvironmentObject private var engine: SDCEngine
    @Query private var projects: [SDCProject]
    @Query private var tasks: [SDCTask]
    @Query private var insights: [SDCInsight]

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 20) {
                // Quick Stats Cards
                QuickStatsSection()

                // Project Progress Overview
                ProjectProgressSection()

                // Recent Activity Timeline
                RecentActivitySection()

                // AI Insights Panel
                AIInsightsPanel()
            }
            .padding()
        }
        .refreshable {
            await engine.initialize()
        }
    }
}

struct QuickStatsSection: View {
    @EnvironmentObject private var engine: SDCEngine

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Development Overview")
                .font(.title2)
                .fontWeight(.semibold)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                StatsCard(
                    title: "Active Projects",
                    value: "\(engine.projects.filter { $0.status == "active" }.count)",
                    icon: "folder.fill",
                    color: .blue
                )

                StatsCard(
                    title: "Pending Tasks",
                    value: "\(engine.tasks.filter { $0.status == .pending }.count)",
                    icon: "checklist",
                    color: .orange
                )

                StatsCard(
                    title: "AI Insights",
                    value: "\(engine.insights.count)",
                    icon: "lightbulb.fill",
                    color: .green
                )
            }
        }
    }
}

struct StatsCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)

            Text(value)
                .font(.title)
                .fontWeight(.bold)

            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(12)
    }
}

// MARK: - Projects View
struct SDCProjectsView: View {
    @EnvironmentObject private var engine: SDCEngine
    @State private var showingNewProject = false

    var body: some View {
        NavigationView {
            List {
                ForEach(engine.projects) { project in
                    ProjectListRow(project: project)
                }
            }
            .navigationTitle("Projects")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add Project") {
                        showingNewProject = true
                    }
                }
            }
            .sheet(isPresented: $showingNewProject) {
                NewProjectView()
            }
        }
    }
}

struct ProjectListRow: View {
    let project: SDCProject

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(project.name)
                    .font(.headline)

                Spacer()

                Text("\(Int(project.progress * 100))%")
                    .font(.subheadline)
                    .fontWeight(.semibold)
            }

            ProgressView(value: project.progress)
                .tint(.blue)

            HStack {
                Label(project.status.capitalized, systemImage: "circle.fill")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Spacer()

                Text(project.lastUpdated, style: .date)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Tasks View
struct SDCTasksView: View {
    @EnvironmentObject private var engine: SDCEngine
    @State private var selectedFilter: TaskStatus?
    @State private var showingNewTask = false

    var filteredTasks: [SDCTask] {
        if let filter = selectedFilter {
            return engine.tasks.filter { $0.status == filter }
        }
        return engine.tasks
    }

    var body: some View {
        NavigationView {
            VStack {
                // Filter Buttons
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        FilterButton(title: "All", isSelected: selectedFilter == nil) {
                            selectedFilter = nil
                        }

                        ForEach(TaskStatus.allCases, id: \.self) { status in
                            FilterButton(
                                title: status.rawValue.capitalized,
                                isSelected: selectedFilter == status
                            ) {
                                selectedFilter = status
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical, 8)

                // Tasks List
                List {
                    ForEach(filteredTasks) { task in
                        TaskListRow(task: task)
                    }
                }
            }
            .navigationTitle("Tasks")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add Task") {
                        showingNewTask = true
                    }
                }
            }
            .sheet(isPresented: $showingNewTask) {
                NewTaskView()
            }
        }
    }
}

struct FilterButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? .blue : .gray.opacity(0.2))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(16)
        }
    }
}

struct TaskListRow: View {
    let task: SDCTask

    var body: some View {
        HStack(spacing: 12) {
            // Priority Indicator
            Circle()
                .fill(priorityColor)
                .frame(width: 8, height: 8)

            VStack(alignment: .leading, spacing: 4) {
                Text(task.name)
                    .font(.headline)

                HStack {
                    Label(task.type.rawValue.capitalized, systemImage: typeIcon)
                        .font(.caption)
                        .foregroundColor(.secondary)

                    Spacer()

                    Text(task.status.rawValue.capitalized)
                        .font(.caption)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(statusColor.opacity(0.2))
                        .foregroundColor(statusColor)
                        .cornerRadius(4)
                }
            }
        }
        .padding(.vertical, 4)
    }

    private var priorityColor: Color {
        switch task.priority {
        case .low: return .green
        case .medium: return .yellow
        case .high: return .orange
        case .critical: return .red
        }
    }

    private var statusColor: Color {
        switch task.status {
        case .pending: return .orange
        case .inProgress: return .blue
        case .completed: return .green
        case .blocked: return .red
        }
    }

    private var typeIcon: String {
        switch task.type {
        case .development: return "hammer.fill"
        case .review: return "eye.fill"
        case .testing: return "checkmark.shield.fill"
        case .deployment: return "arrow.up.circle.fill"
        case .documentation: return "doc.text.fill"
        }
    }
}

// MARK: - Insights View
struct SDCInsightsView: View {
    @EnvironmentObject private var engine: SDCEngine

    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: 16) {
                    ForEach(engine.insights) { insight in
                        InsightCard(insight: insight)
                    }

                    if engine.insights.isEmpty {
                        EmptyInsightsView()
                    }
                }
                .padding()
            }
            .navigationTitle("AI Insights")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Generate Insights") {
                        Task {
                            for project in engine.projects.prefix(3) {
                                await engine.generateInsight(for: project)
                            }
                        }
                    }
                }
            }
        }
    }
}

struct InsightCard: View {
    let insight: SDCInsight

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: insight.type.icon)
                    .font(.title2)
                    .foregroundColor(insight.type.color)

                VStack(alignment: .leading) {
                    Text(insight.title)
                        .font(.headline)

                    Text(insight.createdAt, style: .relative)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()
            }

            Text(insight.content)
                .font(.body)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(12)
    }
}

// MARK: - LLM View
struct SDCLLMView: View {
    @EnvironmentObject private var engine: SDCEngine
    @State private var messages: [ChatMessage] = []
    @State private var newMessage = ""
    @State private var isProcessing = false

    var body: some View {
        VStack {
            // Model Selection
            ModelSelectionHeader()

            // Chat Messages
            ScrollView {
                LazyVStack(alignment: .leading, spacing: 12) {
                    ForEach(messages) { message in
                        ChatBubble(message: message)
                    }
                }
                .padding()
            }

            // Input Area
            ChatInputView(
                message: $newMessage,
                isProcessing: isProcessing
            ) {
                sendMessage()
            }
        }
        .navigationTitle("AI Assistant")
    }

    private func sendMessage() {
        guard !newMessage.isEmpty else { return }

        let userMessage = ChatMessage(content: newMessage, isUser: true)
        messages.append(userMessage)

        let messageToProcess = newMessage
        newMessage = ""
        isProcessing = true

        Task {
            do {
                let response = try await engine.llmManager.generateResponse(prompt: messageToProcess)
                let aiMessage = ChatMessage(content: response, isUser: false)

                await MainActor.run {
                    messages.append(aiMessage)
                    isProcessing = false
                }
            } catch {
                await MainActor.run {
                    let errorMessage = ChatMessage(content: "Error: \(error.localizedDescription)", isUser: false)
                    messages.append(errorMessage)
                    isProcessing = false
                }
            }
        }
    }
}

// MARK: - Settings View
struct SDCSettingsView: View {
    @EnvironmentObject private var engine: SDCEngine
    @State private var showingAPIKeySetup = false

    var body: some View {
        NavigationView {
            List {
                Section("AI Integration") {
                    NavigationLink("Claude Code Integration", destination: ClaudeCodeDashboard())

                    Button("Setup API Keys") {
                        showingAPIKeySetup = true
                    }

                    HStack {
                        Text("Current Model")
                        Spacer()
                        Text(engine.llmManager.currentModel?.name ?? "None")
                            .foregroundColor(.secondary)
                    }
                }

                Section("Development") {
                    NavigationLink("Code Quality Metrics", destination: Text("Code Quality Settings"))
                    NavigationLink("Neural Mux Settings", destination: Text("Neural Mux Settings"))
                }

                Section("Data") {
                    Button("Export Projects") {
                        // Export functionality
                    }

                    Button("Clear Cache") {
                        // Clear cache functionality
                    }
                }

                Section("About") {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                }
            }
            .navigationTitle("Settings")
            .sheet(isPresented: $showingAPIKeySetup) {
                APIKeySetupView()
            }
        }
    }
}

// MARK: - Supporting Views
struct ProjectProgressSection: View {
    @EnvironmentObject private var engine: SDCEngine

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Project Progress")
                .font(.title2)
                .fontWeight(.semibold)

            ForEach(engine.projects.prefix(3)) { project in
                ProjectProgressRow(project: project)
            }

            NavigationLink("View All Projects", destination: SDCProjectsView())
                .font(.subheadline)
                .foregroundColor(.blue)
        }
    }
}

struct ProjectProgressRow: View {
    let project: SDCProject

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(project.name)
                    .font(.headline)

                Spacer()

                Text("\(Int(project.progress * 100))%")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.blue)
            }

            ProgressView(value: project.progress)
                .tint(.blue)

            HStack {
                Text(project.status.capitalized)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(statusColor.opacity(0.2))
                    .foregroundColor(statusColor)
                    .cornerRadius(4)

                Spacer()

                Text(project.lastUpdated, style: .relative)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(8)
    }

    private var statusColor: Color {
        switch project.status {
        case "active": return .green
        case "planning": return .orange
        case "testing": return .blue
        default: return .gray
        }
    }
}

struct RecentActivitySection: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent Activity")
                .font(.title2)
                .fontWeight(.semibold)

            VStack(alignment: .leading, spacing: 8) {
                ActivityRow(title: "Project updated", time: "2 minutes ago", icon: "folder")
                ActivityRow(title: "Code review completed", time: "1 hour ago", icon: "checkmark")
                ActivityRow(title: "New insight generated", time: "3 hours ago", icon: "lightbulb")
            }
            .padding()
            .background(.ultraThinMaterial)
            .cornerRadius(12)
        }
    }
}

struct ActivityRow: View {
    let title: String
    let time: String
    let icon: String

    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.blue)
                .frame(width: 20)

            Text(title)
                .font(.subheadline)

            Spacer()

            Text(time)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

struct AIInsightsPanel: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("AI Insights")
                .font(.title2)
                .fontWeight(.semibold)

            VStack(alignment: .leading, spacing: 12) {
                Text("💡 Consider refactoring the UserManager class for better performance")
                    .font(.subheadline)

                Text("🔒 Security recommendation: Update API authentication mechanism")
                    .font(.subheadline)

                NavigationLink("View All Insights", destination: SDCInsightsView())
                    .font(.subheadline)
                    .foregroundColor(.blue)
            }
            .padding()
            .background(.ultraThinMaterial)
            .cornerRadius(12)
        }
    }
}

struct ModelSelectionHeader: View {
    @EnvironmentObject private var engine: SDCEngine

    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text("Current Model")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text(engine.llmManager.currentModel?.name ?? "No model selected")
                    .font(.subheadline)
                    .fontWeight(.semibold)
            }

            Spacer()

            Circle()
                .fill(engine.llmManager.isModelLoaded ? .green : .red)
                .frame(width: 8, height: 8)
        }
        .padding()
        .background(.ultraThinMaterial)
    }
}

struct ChatBubble: View {
    let message: ChatMessage

    var body: some View {
        HStack {
            if message.isUser {
                Spacer(minLength: 50)
            }

            VStack(alignment: message.isUser ? .trailing : .leading) {
                Text(message.content)
                    .padding()
                    .background(message.isUser ? .blue : .gray.opacity(0.2))
                    .foregroundColor(message.isUser ? .white : .primary)
                    .cornerRadius(12)

                Text(message.timestamp, style: .time)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            if !message.isUser {
                Spacer(minLength: 50)
            }
        }
    }
}

struct ChatInputView: View {
    @Binding var message: String
    let isProcessing: Bool
    let onSend: () -> Void

    var body: some View {
        HStack {
            TextField("Ask your AI assistant...", text: $message, axis: .vertical)
                .textFieldStyle(.roundedBorder)
                .disabled(isProcessing)

            Button(action: onSend) {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.title2)
                    .foregroundColor(.blue)
            }
            .disabled(message.isEmpty || isProcessing)
        }
        .padding()
    }
}

struct EmptyInsightsView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "lightbulb")
                .font(.system(size: 60))
                .foregroundColor(.gray)

            Text("No Insights Yet")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Generate insights from your projects to get AI-powered recommendations.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}

// MARK: - Supporting Models
struct ChatMessage: Identifiable {
    let id = UUID()
    let content: String
    let isUser: Bool
    let timestamp = Date()
}

extension InsightType {
    var icon: String {
        switch self {
        case .analysis: return "chart.bar"
        case .recommendation: return "lightbulb"
        case .warning: return "exclamationmark.triangle"
        case .optimization: return "speedometer"
        }
    }

    var color: Color {
        switch self {
        case .analysis: return .blue
        case .recommendation: return .green
        case .warning: return .orange
        case .optimization: return .purple
        }
    }
}

// MARK: - Placeholder Views
struct NewProjectView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            Text("New Project Form")
                .navigationTitle("New Project")
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") { dismiss() }
                    }
                }
        }
    }
}

struct NewTaskView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            Text("New Task Form")
                .navigationTitle("New Task")
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") { dismiss() }
                    }
                }
        }
    }
}

struct APIKeySetupView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            Text("API Key Setup")
                .navigationTitle("API Keys")
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") { dismiss() }
                    }
                }
        }
    }
}

#Preview {
    SDCDashboardView()
        .environmentObject(SDCEngine())
}