import Foundation
import Combine

// MARK: - Mux Configuration

struct MuxConfig {
    /// Neural Mux base URL (orchestrator + routing)
    static let baseURL = URL(string: "http://localhost:18113")!
    
    /// Request timeout for PLC commands
    static let timeout: TimeInterval = 5.0
    
    /// Use Neural Mux for intelligent routing
    static let useMux: Bool = true
    
    /// Fallback to direct API if Mux unavailable
    static let directAPIURL = URL(string: "http://localhost:18100")!
}

// MARK: - Models

struct PLCNode: Codable, Identifiable {
    let id: String
    let name: String
    let status: String
    let lastSeen: String
    let ttl: Int
    
    enum CodingKeys: String, CodingKey {
        case id, name, status, ttl
        case lastSeen = "last_seen"
    }
}

struct PLCCommand: Codable {
    let node: String
    let command: String
    let ttl: Int
}

struct PLCStatus: Codable {
    let connected: Bool
    let nodeCount: Int?
    let uptime: String?
    
    enum CodingKeys: String, CodingKey {
        case connected
        case nodeCount = "node_count"
        case uptime
    }
}

struct PLCEvent: Identifiable {
    let id = UUID()
    let timestamp: Date
    let level: EventLevel
    let message: String
    
    enum EventLevel: String {
        case info, warning, error
        
        var emoji: String {
            switch self {
            case .info: return "ℹ️"
            case .warning: return "⚠️"
            case .error: return "❌"
            }
        }
        
        var color: String {
            switch self {
            case .info: return "blue"
            case .warning: return "yellow"
            case .error: return "red"
            }
        }
    }
}

// MARK: - Service Layer (Connects to Rust Backend)

/// PLC Service - Communicates with Rust SynaptixPLC backend
class PLCService {
    private let baseURL: URL
    private let muxClient: NeuralMuxClient
    private let useMux: Bool
    private let session: URLSession
    
    init(baseURL: String = MuxConfig.baseURL.absoluteString, useMux: Bool = MuxConfig.useMux) {
        self.baseURL = URL(string: baseURL)!
        self.muxClient = NeuralMuxClient(baseURL: baseURL)
        self.useMux = useMux
        
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = MuxConfig.timeout
        config.timeoutIntervalForResource = MuxConfig.timeout * 2
        self.session = URLSession(configuration: config)
    }
    
    // MARK: - Status
    
    func getStatus() async throws -> PLCStatus {
        if useMux {
            // Route through Neural Mux (intelligent)
            return try await fetchViaWMux(endpoint: "/api/orchestrator/status")
        } else {
            // Direct API call (fallback)
            return try await fetchDirect(endpoint: "/api/orchestrator/status")
        }
    }
    
    // MARK: - Nodes
    
    /// Query all PLC nodes (maps to Rust `query_nodes()`)
    func fetchNodes() async throws -> [PLCNode] {
        if useMux {
            return try await fetchViaMux(endpoint: "/api/plc/nodes")
        } else {
            return try await fetchDirect(endpoint: "/api/plc/nodes")
        }
    }
    
    // MARK: - Commands
    
    /// Send command to PLC node (maps to Rust `send_command()`)
    func sendCommand(_ command: PLCCommand) async throws {
        let url: URL
        if useMux {
            url = baseURL.appendingPathComponent("/api/plc/command")
        } else {
            url = MuxConfig.directAPIURL.appendingPathComponent("/api/plc/command")
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(command)
        request.timeoutInterval = MuxConfig.timeout
        
        let (_, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw PLCError.invalidResponse
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            throw PLCError.commandFailed(statusCode: httpResponse.statusCode)
        }
    }
    
    // MARK: - AI Integration
    
    /// Use Phi (via Neural Mux) for intelligent command suggestions
    func suggestOptimalCommand(for node: PLCNode) async throws -> String {
        let prompt = """
        PLC Node Analysis:
        - ID: \(node.id)
        - Name: \(node.name)
        - Status: \(node.status)
        - Last Seen: \(node.lastSeen)
        - TTL: \(node.ttl)
        
        Suggest optimal control command and explain reasoning.
        """
        
        return try await muxClient.queryPhi(prompt: prompt)
    }
    
    /// Analyze event log for anomalies
    func analyzeEventLog(_ events: [PLCEvent]) async throws -> String {
        let eventSummary = events.prefix(20).map { event in
            "[\(event.level.rawValue)] \(event.message)"
        }.joined(separator: "\n")
        
        let prompt = """
        Analyze this PLC event log for anomalies:
        
        \(eventSummary)
        
        Identify any patterns or issues requiring attention.
        """
        
        return try await muxClient.queryPhi(prompt: prompt)
    }
    
    // MARK: - Private Helpers
    
    private func fetchViaMux<T: Decodable>(endpoint: String) async throws -> T {
        let data = try await muxClient.route(endpoint: endpoint)
        return try JSONDecoder().decode(T.self, from: data)
    }
    
    private func fetchDirect<T: Decodable>(endpoint: String) async throws -> T {
        let url = MuxConfig.directAPIURL.appendingPathComponent(endpoint)
        let (data, _) = try await session.data(from: url)
        return try JSONDecoder().decode(T.self, from: data)
    }
}

// MARK: - Errors

enum PLCError: LocalizedError {
    case connectionFailed
    case commandFailed(statusCode: Int)
    case invalidResponse
    case timeout
    case muxUnavailable
    
    var errorDescription: String? {
        switch self {
        case .connectionFailed:
            return "Failed to connect to PLC orchestrator"
        case .commandFailed(let code):
            return "Command execution failed (HTTP \(code))"
        case .invalidResponse:
            return "Invalid response from server"
        case .timeout:
            return "Request timed out (\(MuxConfig.timeout)s)"
        case .muxUnavailable:
            return "Neural Mux unavailable, falling back to direct API"
        }
    }
}

// MARK: - ViewModel

@MainActor
final class CognetixPLCViewModel: ObservableObject {
    // Published properties
    @Published var nodes: [PLCNode] = []
    @Published var isConnected = false
    @Published var eventLog: [PLCEvent] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var aiAnalysis: String?
    
    private let service: PLCService
    private var refreshTimer: Timer?
    
    init(service: PLCService = PLCService()) {
        self.service = service
    }
    
    // MARK: - Lifecycle
    
    func startMonitoring(refreshInterval: TimeInterval = 5.0) {
        refreshTimer = Timer.scheduledTimer(withTimeInterval: refreshInterval, repeats: true) { [weak self] _ in
            Task { @MainActor in
                await self?.refreshNodes()
            }
        }
    }
    
    func stopMonitoring() {
        refreshTimer?.invalidate()
        refreshTimer = nil
    }
    
    // MARK: - Actions
    
    func connect() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let status = try await service.getStatus()
            isConnected = status.connected
            
            if isConnected {
                await loadNodes()
                logEvent(.info, message: "Connected to PLC orchestrator")
                
                if let nodeCount = status.nodeCount {
                    logEvent(.info, message: "Found \(nodeCount) PLC nodes")
                }
            } else {
                logEvent(.warning, message: "Orchestrator not ready")
            }
        } catch PLCError.timeout {
            errorMessage = "Connection timeout - check if Rust backend is running"
            logEvent(.error, message: "Connection timeout")
        } catch {
            errorMessage = error.localizedDescription
            logEvent(.error, message: "Connection failed: \(error.localizedDescription)")
        }
    }
    
    func loadNodes() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            nodes = try await service.fetchNodes()
            logEvent(.info, message: "Loaded \(nodes.count) PLC nodes")
        } catch {
            errorMessage = error.localizedDescription
            logEvent(.error, message: "Failed to load nodes: \(error.localizedDescription)")
        }
    }
    
    private func refreshNodes() async {
        // Silent refresh (no loading indicator)
        do {
            nodes = try await service.fetchNodes()
        } catch {
            // Log but don't show error for background refresh
            logEvent(.warning, message: "Background refresh failed")
        }
    }
    
    func sendCommand(to nodeID: String, command: String, ttl: Int = 60) async {
        let cmd = PLCCommand(node: nodeID, command: command, ttl: ttl)
        
        do {
            try await service.sendCommand(cmd)
            logEvent(.info, message: "✅ Command sent: \(nodeID) → \(command)")
            
            // Refresh nodes after command
            await loadNodes()
        } catch PLCError.commandFailed(let code) {
            errorMessage = "Command failed with HTTP \(code)"
            logEvent(.error, message: "❌ Command failed (HTTP \(code))")
        } catch {
            errorMessage = error.localizedDescription
            logEvent(.error, message: "❌ Command failed: \(error.localizedDescription)")
        }
    }
    
    // MARK: - AI Features
    
    func suggestCommand(for node: PLCNode) async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let suggestion = try await service.suggestOptimalCommand(for: node)
            aiAnalysis = suggestion
            logEvent(.info, message: "🤖 Phi suggestion for \(node.name): \(suggestion.prefix(50))...")
        } catch {
            logEvent(.warning, message: "Failed to get AI suggestion")
        }
    }
    
    func analyzeLog() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let analysis = try await service.analyzeEventLog(eventLog)
            aiAnalysis = analysis
            logEvent(.info, message: "🤖 Log analysis complete")
        } catch {
            logEvent(.warning, message: "Failed to analyze log")
        }
    }
    
    // MARK: - Event Logging
    
    func logEvent(_ level: PLCEvent.EventLevel, message: String) {
        let event = PLCEvent(
            timestamp: Date(),
            level: level,
            message: message
        )
        eventLog.insert(event, at: 0) // Most recent first
        
        // Keep only last 100 events
        if eventLog.count > 100 {
            eventLog = Array(eventLog.prefix(100))
        }
    }
    
    func clearLog() {
        eventLog.removeAll()
    }
}

// MARK: - Neural Mux Client

/// Client for Neural Mux integration
class NeuralMuxClient {
    private let baseURL: URL
    private let session: URLSession
    
    init(baseURL: String) {
        self.baseURL = URL(string: baseURL)!
        
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = MuxConfig.timeout
        self.session = URLSession(configuration: config)
    }
    
    func route(endpoint: String) async throws -> Data {
        let url = baseURL.appendingPathComponent(endpoint)
        let (data, _) = try await session.data(from: url)
        return data
    }
    
    func queryPhi(prompt: String) async throws -> String {
        let url = baseURL.appendingPathComponent("/phi/inference")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let payload = ["prompt": prompt, "max_tokens": 500] as [String : Any]
        request.httpBody = try JSONSerialization.data(withJSONObject: payload)
        
        let (data, _) = try await session.data(for: request)
        let response = try JSONDecoder().decode(PhiResponse.self, from: data)
        return response.text
    }
}

struct PhiResponse: Codable {
    let text: String
    let tokensGenerated: Int?
    let inferenceTimeMs: Double?
    
    enum CodingKeys: String, CodingKey {
        case text
        case tokensGenerated = "tokens_generated"
        case inferenceTimeMs = "inference_time_ms"
    }
}

// MARK: - SwiftUI View Example

/*
import SwiftUI

struct CognetixPLCView: View {
    @StateObject private var viewModel = CognetixPLCViewModel()
    @State private var showingAIAnalysis = false
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Connection Status Bar
                ConnectionStatusBar(
                    isConnected: viewModel.isConnected,
                    nodeCount: viewModel.nodes.count
                )
                
                // Main Content
                if viewModel.isLoading && viewModel.nodes.isEmpty {
                    ProgressView("Connecting to PLC Orchestrator...")
                        .frame(maxHeight: .infinity)
                } else {
                    ScrollView {
                        VStack(spacing: 16) {
                            // PLC Nodes Section
                            PLCNodesSection(
                                nodes: viewModel.nodes,
                                onCommand: { node, command in
                                    Task {
                                        await viewModel.sendCommand(
                                            to: node.id,
                                            command: command
                                        )
                                    }
                                },
                                onSuggest: { node in
                                    Task {
                                        await viewModel.suggestCommand(for: node)
                                        showingAIAnalysis = true
                                    }
                                }
                            )
                            
                            // Event Log Section
                            EventLogSection(
                                events: viewModel.eventLog,
                                onClear: { viewModel.clearLog() },
                                onAnalyze: {
                                    Task {
                                        await viewModel.analyzeLog()
                                        showingAIAnalysis = true
                                    }
                                }
                            )
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Cognetix PLC")
            .toolbar {
                ToolbarItemGroup(placement: .primaryAction) {
                    if viewModel.isLoading {
                        ProgressView()
                            .controlSize(.small)
                    }
                    
                    Button {
                        Task { await viewModel.connect() }
                    } label: {
                        Label("Refresh", systemImage: "arrow.clockwise")
                    }
                    .disabled(viewModel.isLoading)
                }
            }
            .sheet(isPresented: $showingAIAnalysis) {
                AIAnalysisSheet(
                    analysis: viewModel.aiAnalysis ?? "No analysis available",
                    onDismiss: { showingAIAnalysis = false }
                )
            }
            .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
                Button("OK") { viewModel.errorMessage = nil }
            } message: {
                Text(viewModel.errorMessage ?? "")
            }
            .task {
                await viewModel.connect()
                viewModel.startMonitoring(refreshInterval: 5.0)
            }
            .onDisappear {
                viewModel.stopMonitoring()
            }
        }
    }
}

struct ConnectionStatusBar: View {
    let isConnected: Bool
    let nodeCount: Int
    
    var body: some View {
        HStack {
            Circle()
                .fill(isConnected ? Color.green : Color.red)
                .frame(width: 8, height: 8)
            
            Text(isConnected ? "Connected" : "Disconnected")
                .font(.caption)
                .fontWeight(.medium)
            
            Spacer()
            
            if isConnected {
                Text("\(nodeCount) nodes")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
        .background(Color(uiColor: .secondarySystemBackground))
    }
}

struct PLCNodesSection: View {
    let nodes: [PLCNode]
    let onCommand: (PLCNode, String) -> Void
    let onSuggest: (PLCNode) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("PLC Nodes")
                .font(.headline)
            
            if nodes.isEmpty {
                ContentUnavailableView(
                    "No PLC Nodes",
                    systemImage: "antenna.radiowaves.left.and.right.slash",
                    description: Text("Connect to see available nodes")
                )
                .frame(height: 200)
            } else {
                LazyVStack(spacing: 8) {
                    ForEach(nodes) { node in
                        PLCNodeCard(
                            node: node,
                            onCommand: onCommand,
                            onSuggest: onSuggest
                        )
                    }
                }
            }
        }
    }
}

struct PLCNodeCard: View {
    let node: PLCNode
    let onCommand: (PLCNode, String) -> Void
    let onSuggest: (PLCNode) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(node.name)
                        .font(.headline)
                    
                    HStack(spacing: 12) {
                        Label(node.status, systemImage: statusIcon)
                            .font(.caption)
                            .foregroundColor(statusColor)
                        
                        Text("TTL: \(node.ttl)s")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                Menu {
                    Button {
                        onCommand(node, "status")
                    } label: {
                        Label("Get Status", systemImage: "info.circle")
                    }
                    
                    Button {
                        onCommand(node, "restart")
                    } label: {
                        Label("Restart", systemImage: "arrow.clockwise")
                    }
                    
                    Divider()
                    
                    Button {
                        onSuggest(node)
                    } label: {
                        Label("AI Suggestion", systemImage: "sparkles")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle.fill")
                        .font(.title3)
                        .foregroundColor(.blue)
                }
            }
            
            Text("Last seen: \(node.lastSeen)")
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(uiColor: .tertiarySystemBackground))
        .cornerRadius(12)
    }
    
    private var statusIcon: String {
        switch node.status.lowercased() {
        case "active": return "checkmark.circle.fill"
        case "idle": return "pause.circle.fill"
        case "error": return "exclamationmark.circle.fill"
        default: return "questionmark.circle.fill"
        }
    }
    
    private var statusColor: Color {
        switch node.status.lowercased() {
        case "active": return .green
        case "idle": return .orange
        case "error": return .red
        default: return .gray
        }
    }
}

struct EventLogSection: View {
    let events: [PLCEvent]
    let onClear: () -> Void
    let onAnalyze: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Event Log")
                    .font(.headline)
                
                Spacer()
                
                Button("Analyze", systemImage: "sparkles") {
                    onAnalyze()
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
                
                Button("Clear", systemImage: "trash") {
                    onClear()
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
            }
            
            if events.isEmpty {
                ContentUnavailableView(
                    "No Events",
                    systemImage: "tray",
                    description: Text("Event log is empty")
                )
                .frame(height: 150)
            } else {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 6) {
                        ForEach(events.prefix(20)) { event in
                            HStack(alignment: .top, spacing: 8) {
                                Text(event.level.emoji)
                                    .font(.caption)
                                
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(event.message)
                                        .font(.caption)
                                    
                                    Text(event.timestamp.formatted())
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }
                .frame(maxHeight: 300)
            }
        }
    }
}

struct AIAnalysisSheet: View {
    let analysis: String
    let onDismiss: () -> Void
    
    var body: some View {
        NavigationStack {
            ScrollView {
                Text(analysis)
                    .font(.body)
                    .padding()
            }
            .navigationTitle("AI Analysis")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { onDismiss() }
                }
            }
        }
    }
}
*/




