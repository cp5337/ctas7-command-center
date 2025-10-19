import SwiftUI
import AVFoundation

// MARK: - Main Voice Conversation Interface
struct VoiceConversationInterface: View {
    @StateObject private var voiceManager = VoiceConversationManager.shared
    @State private var selectedAgent: VoiceAgent = VoiceAgent.allAgents[0]
    @State private var textInput = ""
    @State private var showingAgentPicker = false
    @Environment(\.dismiss) private var dismiss

    let screenContext: ScreenContext?

    init(context: ScreenContext? = nil) {
        self.screenContext = context
    }

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Header with Agent Selection
                VoiceHeaderView(
                    selectedAgent: $selectedAgent,
                    showingAgentPicker: $showingAgentPicker,
                    metrics: voiceManager.voiceMetrics
                )

                // Real-time Audio Visualizer
                VoiceVisualizerView(
                    audioLevels: voiceManager.audioLevels,
                    isListening: voiceManager.isListening,
                    isProcessing: voiceManager.isProcessing,
                    isSpeaking: voiceManager.isSpeaking
                )

                // Conversation Display
                ConversationView(
                    messages: voiceManager.conversationHistory,
                    transcription: voiceManager.transcription,
                    agentResponse: voiceManager.agentResponse,
                    activeAgent: voiceManager.activeAgent
                )

                Spacer()

                // Voice Controls
                VoiceControlsView(
                    isListening: voiceManager.isListening,
                    isProcessing: voiceManager.isProcessing,
                    selectedAgent: selectedAgent
                ) {
                    // Start/Stop Voice
                    if voiceManager.isListening {
                        Task { await voiceManager.stopListening() }
                    } else {
                        Task { await voiceManager.startListening(with: selectedAgent) }
                    }
                }

                // Text Input Alternative
                TextInputView(
                    text: $textInput,
                    selectedAgent: selectedAgent,
                    isProcessing: voiceManager.isProcessing
                ) {
                    if !textInput.isEmpty {
                        Task {
                            await voiceManager.sendTextMessage(textInput, to: selectedAgent)
                            textInput = ""
                        }
                    }
                }
            }
            .padding()
            .navigationTitle("Voice Assistant")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") { dismiss() }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { voiceManager.clearConversation() }) {
                        Image(systemName: "trash")
                    }
                }
            }
            .sheet(isPresented: $showingAgentPicker) {
                AgentPickerView(selectedAgent: $selectedAgent)
            }
        }
        .onAppear {
            if let agent = voiceManager.activeAgent {
                selectedAgent = agent
            }
        }
    }
}

// MARK: - Voice Header View
struct VoiceHeaderView: View {
    @Binding var selectedAgent: VoiceAgent
    @Binding var showingAgentPicker: Bool
    let metrics: VoiceMetrics

    var body: some View {
        VStack(spacing: 12) {
            // Agent Selection
            Button(action: { showingAgentPicker = true }) {
                HStack {
                    Text(selectedAgent.symbol)
                        .font(.title2)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(selectedAgent.name)
                            .font(.headline)
                            .foregroundColor(.primary)

                        Text(selectedAgent.persona)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    Image(systemName: "chevron.down")
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(selectedAgent.color.opacity(0.1))
                .cornerRadius(12)
            }
            .buttonStyle(PlainButtonStyle())

            // Metrics Row
            HStack(spacing: 20) {
                MetricView(
                    title: "Latency",
                    value: "\(Int(metrics.averageLatency * 1000))ms",
                    color: latencyColor(metrics.averageLatency)
                )

                MetricView(
                    title: "Success",
                    value: "\(Int(metrics.successRate * 100))%",
                    color: successColor(metrics.successRate)
                )

                MetricView(
                    title: "Commands",
                    value: "\(metrics.totalCommands)",
                    color: .blue
                )
            }
        }
    }

    private func latencyColor(_ latency: TimeInterval) -> Color {
        if latency < 1.0 { return .green }
        if latency < 2.0 { return .orange }
        return .red
    }

    private func successColor(_ rate: Double) -> Color {
        if rate > 0.9 { return .green }
        if rate > 0.7 { return .orange }
        return .red
    }
}

// MARK: - Metric View
struct MetricView: View {
    let title: String
    let value: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(color)

            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Voice Visualizer View
struct VoiceVisualizerView: View {
    let audioLevels: [Float]
    let isListening: Bool
    let isProcessing: Bool
    let isSpeaking: Bool

    var body: some View {
        VStack(spacing: 16) {
            // Status Indicator
            VoiceStatusIndicator(
                isListening: isListening,
                isProcessing: isProcessing,
                isSpeaking: isSpeaking
            )

            // Audio Waveform
            AudioWaveformView(
                levels: audioLevels,
                isActive: isListening || isSpeaking
            )
        }
        .frame(height: 120)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(16)
    }
}

// MARK: - Voice Status Indicator
struct VoiceStatusIndicator: View {
    let isListening: Bool
    let isProcessing: Bool
    let isSpeaking: Bool

    var body: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(statusColor)
                .frame(width: 12, height: 12)
                .scaleEffect(isActive ? 1.2 : 1.0)
                .animation(.easeInOut(duration: 0.6).repeatForever(autoreverses: true), value: isActive)

            Text(statusText)
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(statusColor)
        }
    }

    private var isActive: Bool {
        isListening || isProcessing || isSpeaking
    }

    private var statusColor: Color {
        if isListening { return .green }
        if isProcessing { return .orange }
        if isSpeaking { return .blue }
        return .gray
    }

    private var statusText: String {
        if isListening { return "Listening..." }
        if isProcessing { return "Processing..." }
        if isSpeaking { return "Speaking..." }
        return "Ready"
    }
}

// MARK: - Audio Waveform View
struct AudioWaveformView: View {
    let levels: [Float]
    let isActive: Bool

    var body: some View {
        HStack(alignment: .center, spacing: 2) {
            ForEach(0..<levels.count, id: \.self) { index in
                RoundedRectangle(cornerRadius: 1)
                    .fill(isActive ? Color.blue : Color.gray.opacity(0.3))
                    .frame(width: 2, height: max(2, CGFloat(levels[index]) * 30))
                    .animation(.easeInOut(duration: 0.1), value: levels[index])
            }
        }
        .frame(height: 40)
    }
}

// MARK: - Conversation View
struct ConversationView: View {
    let messages: [ConversationMessage]
    let transcription: String
    let agentResponse: String
    let activeAgent: VoiceAgent?

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 12) {
                ForEach(messages) { message in
                    ConversationMessageView(message: message)
                }

                // Live transcription
                if !transcription.isEmpty {
                    LiveTranscriptionView(text: transcription)
                }

                // Live agent response
                if !agentResponse.isEmpty {
                    LiveAgentResponseView(
                        text: agentResponse,
                        agent: activeAgent
                    )
                }
            }
            .padding(.horizontal)
        }
        .frame(maxHeight: 200)
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color(.systemGray4), lineWidth: 1)
        )
    }
}

// MARK: - Conversation Message View
struct ConversationMessageView: View {
    let message: ConversationMessage

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            // Avatar
            if message.agentId == "user" {
                Image(systemName: "person.circle.fill")
                    .foregroundColor(.blue)
                    .font(.title2)
            } else {
                if let agent = VoiceAgent.allAgents.first(where: { $0.id == message.agentId }) {
                    Text(agent.symbol)
                        .font(.title2)
                } else {
                    Image(systemName: "brain.head.profile")
                        .foregroundColor(.purple)
                        .font(.title2)
                }
            }

            // Message content
            VStack(alignment: .leading, spacing: 4) {
                Text(message.content)
                    .font(.body)
                    .foregroundColor(.primary)

                Text(message.timestamp, style: .time)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            Spacer()
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Live Transcription View
struct LiveTranscriptionView: View {
    let text: String

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: "mic.fill")
                .foregroundColor(.green)
                .font(.title2)

            VStack(alignment: .leading, spacing: 4) {
                Text(text)
                    .font(.body)
                    .foregroundColor(.primary)
                    .italic()

                Text("Transcribing...")
                    .font(.caption2)
                    .foregroundColor(.green)
            }

            Spacer()
        }
        .padding(.vertical, 4)
        .opacity(0.8)
    }
}

// MARK: - Live Agent Response View
struct LiveAgentResponseView: View {
    let text: String
    let agent: VoiceAgent?

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            if let agent = agent {
                Text(agent.symbol)
                    .font(.title2)
            } else {
                Image(systemName: "brain.head.profile")
                    .foregroundColor(.purple)
                    .font(.title2)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(text)
                    .font(.body)
                    .foregroundColor(.primary)

                Text("Responding...")
                    .font(.caption2)
                    .foregroundColor(.orange)
            }

            Spacer()
        }
        .padding(.vertical, 4)
        .opacity(0.8)
    }
}

// MARK: - Voice Controls View
struct VoiceControlsView: View {
    let isListening: Bool
    let isProcessing: Bool
    let selectedAgent: VoiceAgent
    let toggleVoice: () -> Void

    var body: some View {
        HStack(spacing: 20) {
            // Voice Toggle Button
            Button(action: toggleVoice) {
                ZStack {
                    Circle()
                        .fill(isListening ? Color.red : selectedAgent.color)
                        .frame(width: 80, height: 80)
                        .scaleEffect(isListening ? 1.1 : 1.0)
                        .animation(.easeInOut(duration: 0.6).repeatForever(autoreverses: true), value: isListening)

                    Image(systemName: isListening ? "mic.slash.fill" : "mic.fill")
                        .font(.title)
                        .foregroundColor(.white)
                }
            }
            .disabled(isProcessing)
            .buttonStyle(PlainButtonStyle())

            // Quick Actions
            VStack(spacing: 8) {
                QuickActionButton(
                    icon: "heart.text.square",
                    title: "Health",
                    color: .green
                ) {
                    // Trigger health check command
                }

                QuickActionButton(
                    icon: "chart.bar.fill",
                    title: "Metrics",
                    color: .blue
                ) {
                    // Trigger metrics command
                }
            }
        }
    }
}

// MARK: - Quick Action Button
struct QuickActionButton: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.caption)

                Text(title)
                    .font(.caption2)
                    .fontWeight(.medium)
            }
            .foregroundColor(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color.opacity(0.1))
            .cornerRadius(8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Text Input View
struct TextInputView: View {
    @Binding var text: String
    let selectedAgent: VoiceAgent
    let isProcessing: Bool
    let sendMessage: () -> Void

    var body: some View {
        HStack {
            TextField("Type a message to \(selectedAgent.name)...", text: $text)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .onSubmit {
                    sendMessage()
                }

            Button(action: sendMessage) {
                Image(systemName: "paperplane.fill")
                    .font(.title2)
                    .foregroundColor(text.isEmpty ? .gray : selectedAgent.color)
            }
            .disabled(text.isEmpty || isProcessing)
        }
    }
}

// MARK: - Agent Picker View
struct AgentPickerView: View {
    @Binding var selectedAgent: VoiceAgent
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            List {
                ForEach(VoiceAgent.allAgents) { agent in
                    AgentPickerRow(
                        agent: agent,
                        isSelected: agent.id == selectedAgent.id
                    ) {
                        selectedAgent = agent
                        dismiss()
                    }
                }
            }
            .navigationTitle("Select Agent")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Agent Picker Row
struct AgentPickerRow: View {
    let agent: VoiceAgent
    let isSelected: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            HStack(spacing: 12) {
                Text(agent.symbol)
                    .font(.title2)

                VStack(alignment: .leading, spacing: 4) {
                    Text(agent.name)
                        .font(.headline)
                        .foregroundColor(.primary)

                    Text(agent.persona)
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    HStack {
                        Text(agent.accent)
                            .font(.caption)
                            .foregroundColor(.secondary)

                        Spacer()

                        Text(agent.llmProvider.rawValue.uppercased())
                            .font(.caption2)
                            .fontWeight(.semibold)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(agent.color.opacity(0.2))
                            .cornerRadius(4)
                    }
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(agent.color)
                        .font(.title2)
                }
            }
            .padding(.vertical, 4)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Floating Voice Button
struct VoiceActionButton: View {
    let context: ScreenContext?
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            ZStack {
                Circle()
                    .fill(.ultraThinMaterial)
                    .frame(width: 56, height: 56)
                    .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: 4)

                Image(systemName: "mic.fill")
                    .font(.title2)
                    .foregroundColor(.blue)
            }
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Screen Context Enum
enum ScreenContext: String, CaseIterable {
    case dashboard = "dashboard"
    case crates = "crates"
    case agents = "agents"
    case metrics = "metrics"
    case devOps = "devops"
    case integrations = "integrations"
    case monitoring = "monitoring"
    case settings = "settings"
    case profile = "profile"

    var displayName: String {
        switch self {
        case .dashboard: return "Dashboard"
        case .crates: return "Crates"
        case .agents: return "Agents"
        case .metrics: return "Metrics"
        case .devOps: return "DevOps"
        case .integrations: return "Integrations"
        case .monitoring: return "Monitoring"
        case .settings: return "Settings"
        case .profile: return "Profile"
        }
    }
}

// MARK: - Voice-Enabled Screen Wrapper
struct VoiceEnabledScreen<Content: View>: View {
    @StateObject private var voiceManager = VoiceConversationManager.shared
    @State private var showingVoiceInterface = false
    let content: Content
    let screenContext: ScreenContext

    init(context: ScreenContext, @ViewBuilder content: () -> Content) {
        self.screenContext = context
        self.content = content()
    }

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            content

            // Floating Voice Action Button
            VoiceActionButton(context: screenContext) {
                showingVoiceInterface = true
            }
            .padding()
        }
        .sheet(isPresented: $showingVoiceInterface) {
            VoiceConversationInterface(context: screenContext)
        }
        .onReceive(voiceManager.$activeCommand) { command in
            if let command = command {
                handleVoiceCommand(command)
            }
        }
    }

    private func handleVoiceCommand(_ command: VoiceCommand) {
        switch screenContext {
        case .dashboard:
            handleDashboardCommand(command)
        case .crates:
            handleCratesCommand(command)
        case .agents:
            handleAgentsCommand(command)
        case .metrics:
            handleMetricsCommand(command)
        default:
            // Handle other screen contexts
            break
        }
    }

    private func handleDashboardCommand(_ command: VoiceCommand) {
        switch command.intent {
        case .showSystemHealth:
            // Navigate to system health
            break
        case .startAllAgents:
            // Trigger mass agent startup
            break
        case .showMetrics:
            // Navigate to metrics screen
            break
        default:
            break
        }
    }

    private func handleCratesCommand(_ command: VoiceCommand) {
        switch command.intent {
        case .filterCrates:
            // Apply voice-specified filter
            break
        case .retrofitCrate:
            // Initiate crate retrofit
            break
        case .showCrateDetails:
            // Navigate to specific crate
            break
        default:
            break
        }
    }

    private func handleAgentsCommand(_ command: VoiceCommand) {
        switch command.intent {
        case .startAllAgents:
            // Start all agents
            break
        case .stopAllAgents:
            // Stop all agents
            break
        case .runDiagnostics:
            // Run agent diagnostics
            break
        default:
            break
        }
    }

    private func handleMetricsCommand(_ command: VoiceCommand) {
        switch command.intent {
        case .showMetrics:
            // Show detailed metrics
            break
        case .analyzeData:
            // Trigger data analysis
            break
        default:
            break
        }
    }
}

// MARK: - Preview
struct VoiceConversationInterface_Previews: PreviewProvider {
    static var previews: some View {
        VoiceConversationInterface()
    }
}