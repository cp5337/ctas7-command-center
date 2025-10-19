import Foundation
import Combine

// MARK: - Model (Data Structures)

struct PLCNode: Codable, Identifiable {
    let id: String
    let name: String
    let status: String
    let lastSeen: String
    let ttl: Int
}

struct PLCCommand: Codable {
    let node: String
    let command: String
    let ttl: Int
}

struct PLCStatus: Codable {
    let connected: Bool
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
    }
}

// MARK: - Service Layer (Business Logic)

/// PLC Service with Neural Mux integration
class PLCService {
    private let muxClient: NeuralMuxClient
    private let baseURL: URL
    
    init(baseURL: String = "http://localhost:18113") {
        self.baseURL = URL(string: baseURL)!
        self.muxClient = NeuralMuxClient(baseURL: baseURL)
    }
    
    // Route through Neural Mux for intelligent request handling
    func getStatus() async throws -> PLCStatus {
        let url = baseURL.appendingPathComponent("api/orchestrator/status")
        
        // Option 1: Direct API call
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode(PLCStatus.self, from: data)
        
        // Option 2: Route through Neural Mux for intelligence
        // let response = try await muxClient.route(endpoint: "/orchestrator/status")
        // return try JSONDecoder().decode(PLCStatus.self, from: response)
    }
    
    func fetchNodes() async throws -> [PLCNode] {
        let url = baseURL.appendingPathComponent("api/plc/nodes")
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([PLCNode].self, from: data)
    }
    
    func sendCommand(_ command: PLCCommand) async throws {
        let url = baseURL.appendingPathComponent("api/plc/command")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(command)
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw PLCError.commandFailed
        }
    }
    
    // Use Phi (via Neural Mux) for intelligent command suggestions
    func suggestOptimalCommand(for node: PLCNode) async throws -> String {
        let prompt = """
        Given PLC node:
        - ID: \(node.id)
        - Status: \(node.status)
        - Last seen: \(node.lastSeen)
        - TTL: \(node.ttl)
        
        Suggest the optimal control command.
        """
        
        return try await muxClient.queryPhi(prompt: prompt)
    }
}

enum PLCError: LocalizedError {
    case connectionFailed
    case commandFailed
    case invalidResponse
    
    var errorDescription: String? {
        switch self {
        case .connectionFailed: return "Failed to connect to PLC orchestrator"
        case .commandFailed: return "Command execution failed"
        case .invalidResponse: return "Invalid response from server"
        }
    }
}

// MARK: - ViewModel (UI State Management)

@MainActor
final class CognetixPLCViewModel: ObservableObject {
    // Published properties for UI binding
    @Published var nodes: [PLCNode] = []
    @Published var isConnected = false
    @Published var eventLog: [PLCEvent] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let service: PLCService
    private var cancellables = Set<AnyCancellable>()
    
    init(service: PLCService = PLCService()) {
        self.service = service
    }
    
    // MARK: - User Actions
    
    func connect() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let status = try await service.getStatus()
            isConnected = status.connected
            
            if isConnected {
                await loadNodes()
                logEvent(.info, message: "Connected to PLC orchestrator")
            }
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
    
    func sendCommand(to nodeID: String, command: String, ttl: Int = 60) async {
        let cmd = PLCCommand(node: nodeID, command: command, ttl: ttl)
        
        do {
            try await service.sendCommand(cmd)
            logEvent(.info, message: "Command sent: \(nodeID) → \(command)")
            
            // Refresh nodes after command
            await loadNodes()
        } catch {
            errorMessage = error.localizedDescription
            logEvent(.error, message: "Command failed: \(error.localizedDescription)")
        }
    }
    
    func suggestCommand(for node: PLCNode) async {
        do {
            let suggestion = try await service.suggestOptimalCommand(for: node)
            logEvent(.info, message: "Phi suggestion for \(node.name): \(suggestion)")
        } catch {
            logEvent(.warning, message: "Failed to get AI suggestion")
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

// MARK: - Neural Mux Client (Mux Layer)

/// Client for Neural Mux integration
class NeuralMuxClient {
    private let baseURL: URL
    
    init(baseURL: String) {
        self.baseURL = URL(string: baseURL)!
    }
    
    func route(endpoint: String) async throws -> Data {
        let url = baseURL.appendingPathComponent(endpoint)
        let (data, _) = try await URLSession.shared.data(from: url)
        return data
    }
    
    func queryPhi(prompt: String) async throws -> String {
        let url = baseURL.appendingPathComponent("phi/inference")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let payload = ["prompt": prompt]
        request.httpBody = try JSONEncoder().encode(payload)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(PhiResponse.self, from: data)
        return response.text
    }
}

struct PhiResponse: Codable {
    let text: String
    let tokensGenerated: Int?
    let inferenceTimeMs: Double?
}

// MARK: - SwiftUI View Example (would be in separate file)

/*
import SwiftUI

struct CognetixPLCView: View {
    @StateObject private var viewModel = CognetixPLCViewModel()
    
    var body: some View {
        NavigationStack {
            VStack {
                // Connection status
                HStack {
                    Circle()
                        .fill(viewModel.isConnected ? Color.green : Color.red)
                        .frame(width: 12, height: 12)
                    Text(viewModel.isConnected ? "Connected" : "Disconnected")
                        .font(.headline)
                }
                .padding()
                
                // Nodes list
                List(viewModel.nodes) { node in
                    VStack(alignment: .leading) {
                        Text(node.name).font(.headline)
                        Text("Status: \(node.status)").font(.caption)
                    }
                    .contextMenu {
                        Button("Send Command") {
                            Task {
                                await viewModel.sendCommand(to: node.id, command: "status")
                            }
                        }
                        Button("AI Suggestion") {
                            Task {
                                await viewModel.suggestCommand(for: node)
                            }
                        }
                    }
                }
                
                // Event log
                EventLogView(events: viewModel.eventLog)
            }
            .navigationTitle("Cognetix PLC")
            .toolbar {
                Button("Connect") {
                    Task { await viewModel.connect() }
                }
            }
        }
    }
}

struct EventLogView: View {
    let events: [PLCEvent]
    
    var body: some View {
        VStack(alignment: .leading) {
            Text("Event Log").font(.headline).padding(.leading)
            List(events) { event in
                HStack {
                    Text(event.level.emoji)
                    VStack(alignment: .leading) {
                        Text(event.message).font(.caption)
                        Text(event.timestamp.formatted()).font(.caption2).foregroundColor(.secondary)
                    }
                }
            }
            .frame(height: 200)
        }
    }
}
*/




