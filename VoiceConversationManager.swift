import SwiftUI
import AVFoundation
import Speech
import Combine
import Network
import CryptoKit

// MARK: - Voice Agent Models
struct VoiceAgent: Identifiable, Codable, Hashable {
    let id: String
    let name: String
    let persona: String
    let accent: String
    let languages: [String]
    let voiceID: String  // ElevenLabs Voice ID
    let grpcPort: Int
    let llmProvider: LLMProvider
    let symbol: String
    let colorHex: String

    var color: Color {
        Color(hex: colorHex)
    }

    var systemPrompt: String {
        switch id {
        case "natasha_volkov":
            return """
            You are Natasha Volkov, Technical Lead and AI Specialist for CTAS-7.
            Russian accent, authoritative, precise. Expert in Neural Mux and AI systems.
            Respond in character with confidence and technical expertise.
            Keep responses under 50 words for voice interaction.
            """
        case "elena_rodriguez":
            return """
            You are Elena Rodriguez, QA Engineer and GIS Specialist for CTAS-7.
            Nuyorican accent, street-smart, direct. Expert in PhD Analysis and GIS.
            Keep it real, no-nonsense, and precise.
            Keep responses under 50 words for voice interaction.
            """
        case "cove_harris":
            return """
            You are Lachlan 'Cove' Harris, Enterprise Architect for CTAS-7.
            Australian accent, strategic, commanding. Expert in XSD Orchestration.
            Provide architectural and strategic guidance.
            Keep responses under 50 words for voice interaction.
            """
        case "marcus_chen":
            return """
            You are Marcus Chen, System Architect for CTAS-7.
            Mandarin/English bilingual, analytical, precise. Expert in Trivariate Hashing.
            Focus on system-level solutions and technical architecture.
            Keep responses under 50 words for voice interaction.
            """
        default:
            return "CTAS-7 agent providing helpful assistance."
        }
    }

    static let allAgents: [VoiceAgent] = [
        VoiceAgent(
            id: "natasha_volkov",
            name: "Natasha Volkov",
            persona: "Technical Lead & AI Specialist",
            accent: "Russian/English",
            languages: ["Russian", "English"],
            voiceID: "EXAVITQu4vr4xnSDxMaL",
            grpcPort: 18101,
            llmProvider: .grok,
            symbol: "🤖",
            colorHex: "#E74C3C"
        ),
        VoiceAgent(
            id: "elena_rodriguez",
            name: "Elena Rodriguez",
            persona: "QA Engineer & GIS Specialist",
            accent: "Nuyorican/Spanish/English",
            languages: ["Spanish", "English"],
            voiceID: "cgSgspJ2msm6clMCkdW9",
            grpcPort: 18103,
            llmProvider: .claudeOpus,
            symbol: "🗺️",
            colorHex: "#3498DB"
        ),
        VoiceAgent(
            id: "cove_harris",
            name: "Cove Harris",
            persona: "Enterprise Architect",
            accent: "Australian/English",
            languages: ["English"],
            voiceID: "IKne3meq5aSn9XLyUdCD",
            grpcPort: 15181,
            llmProvider: .claudeSonnet,
            symbol: "🏗️",
            colorHex: "#9B59B6"
        ),
        VoiceAgent(
            id: "marcus_chen",
            name: "Marcus Chen",
            persona: "System Architect",
            accent: "Mandarin/English",
            languages: ["Mandarin", "English"],
            voiceID: "pqHfZKP75CvOlQylNhV4",
            grpcPort: 18104,
            llmProvider: .geminiPro,
            symbol: "⚡",
            colorHex: "#F39C12"
        )
    ]
}

enum LLMProvider: String, CaseIterable, Codable {
    case grok = "grok"
    case claudeOpus = "claude-opus"
    case claudeSonnet = "claude-sonnet"
    case geminiPro = "gemini-pro"
}

// MARK: - Conversation Models
struct ConversationMessage: Identifiable, Codable {
    let id = UUID()
    let agentId: String
    let content: String
    let timestamp: Date
    let type: MessageType
    let audioUrl: String?

    enum MessageType: String, Codable {
        case userVoice = "user_voice"
        case agentVoice = "agent_voice"
        case userText = "user_text"
        case agentText = "agent_text"
    }
}

struct VoiceCommand: Identifiable, Codable {
    let id = UUID()
    let text: String
    let targetAgent: String
    let intent: VoiceIntent
    let confidence: Double
    let timestamp: Date
    let wasSuccessful: Bool
}

enum VoiceIntent: String, Codable, CaseIterable {
    case showSystemHealth = "show_system_health"
    case startAllAgents = "start_all_agents"
    case stopAllAgents = "stop_all_agents"
    case showMetrics = "show_metrics"
    case filterCrates = "filter_crates"
    case retrofitCrate = "retrofit_crate"
    case showCrateDetails = "show_crate_details"
    case analyzeData = "analyze_data"
    case runDiagnostics = "run_diagnostics"
    case unknown = "unknown"
}

// MARK: - Voice Metrics
struct VoiceMetrics: Codable {
    var averageLatency: TimeInterval = 0
    var successRate: Double = 1.0
    var activeConnections: Int = 0
    var audioQuality: AudioQuality = .excellent
    var agentResponseTimes: [String: TimeInterval] = [:]
    var totalCommands: Int = 0
    var commandsToday: Int = 0
}

enum AudioQuality: String, Codable, CaseIterable {
    case excellent = "excellent"
    case good = "good"
    case fair = "fair"
    case poor = "poor"
}

// MARK: - Voice Message Protocol
struct VoiceMessage: Codable {
    let type: MessageType
    let audioData: Data?
    let text: String?
    let targetAgent: String?
    let timestamp: Date
    let sessionId: String

    enum MessageType: String, Codable {
        case voiceInput = "voice_input"
        case textInput = "text_input"
        case agentResponse = "agent_response"
        case error = "error"
        case heartbeat = "heartbeat"
    }
}

// MARK: - Voice WebSocket Manager
@MainActor
class VoiceWebSocketManager: ObservableObject {
    @Published var isConnected = false
    @Published var connectionError: Error?

    private var webSocketTask: URLSessionWebSocketTask?
    private let url = URL(string: "ws://localhost:18765")!
    private let mirrorUrl = URL(string: "ws://localhost:28765")!
    private var currentUrl: URL
    private let sessionId = UUID().uuidString

    init() {
        self.currentUrl = url
    }

    func connect() async {
        do {
            await disconnect()

            webSocketTask = URLSession.shared.webSocketTask(with: currentUrl)
            webSocketTask?.resume()

            // Start listening for messages
            Task { await listenForMessages() }

            // Send heartbeat to establish connection
            await sendHeartbeat()

            isConnected = true
            connectionError = nil

        } catch {
            // Try mirror port if primary fails
            if currentUrl == url {
                currentUrl = mirrorUrl
                await connect()
            } else {
                connectionError = error
                isConnected = false
            }
        }
    }

    func disconnect() async {
        webSocketTask?.cancel(with: .goingAway, reason: nil)
        webSocketTask = nil
        isConnected = false
    }

    func sendVoiceMessage(_ message: VoiceMessage) async throws {
        guard isConnected else {
            throw VoiceError.notConnected
        }

        let data = try JSONEncoder().encode(message)
        let websocketMessage = URLSessionWebSocketTask.Message.data(data)

        try await webSocketTask?.send(websocketMessage)
    }

    private func listenForMessages() async {
        guard let webSocketTask = webSocketTask else { return }

        do {
            for try await message in webSocketTask.messages {
                await handleIncomingMessage(message)
            }
        } catch {
            if isConnected {
                connectionError = error
                isConnected = false
            }
        }
    }

    private func handleIncomingMessage(_ message: URLSessionWebSocketTask.Message) async {
        switch message {
        case .data(let data):
            // Handle binary audio response
            await AudioPlaybackManager.shared.playAudio(data)
        case .string(let text):
            // Handle JSON responses
            if let data = text.data(using: .utf8),
               let response = try? JSONDecoder().decode(VoiceMessage.self, from: data) {
                await VoiceConversationManager.shared.handleVoiceResponse(response)
            }
        @unknown default:
            break
        }
    }

    private func sendHeartbeat() async {
        let heartbeat = VoiceMessage(
            type: .heartbeat,
            audioData: nil,
            text: "ping",
            targetAgent: nil,
            timestamp: Date(),
            sessionId: sessionId
        )

        try? await sendVoiceMessage(heartbeat)
    }
}

// MARK: - Audio Playback Manager
@MainActor
class AudioPlaybackManager: ObservableObject {
    static let shared = AudioPlaybackManager()

    @Published var isPlaying = false
    private var audioPlayer: AVAudioPlayer?

    private init() {}

    func playAudio(_ data: Data) async {
        do {
            audioPlayer = try AVAudioPlayer(data: data)
            audioPlayer?.delegate = AudioPlayerDelegate.shared

            isPlaying = true
            audioPlayer?.play()

        } catch {
            print("Failed to play audio: \(error)")
            isPlaying = false
        }
    }

    func stopPlayback() {
        audioPlayer?.stop()
        isPlaying = false
    }
}

// MARK: - Audio Player Delegate
class AudioPlayerDelegate: NSObject, AVAudioPlayerDelegate {
    static let shared = AudioPlayerDelegate()

    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        Task { @MainActor in
            AudioPlaybackManager.shared.isPlaying = false
        }
    }
}

// MARK: - Voice Conversation Manager
@MainActor
class VoiceConversationManager: ObservableObject {
    static let shared = VoiceConversationManager()

    // MARK: - Published Properties
    @Published var isListening = false
    @Published var isProcessing = false
    @Published var isSpeaking = false
    @Published var activeAgent: VoiceAgent?
    @Published var transcription = ""
    @Published var agentResponse = ""
    @Published var conversationHistory: [ConversationMessage] = []
    @Published var audioLevels: [Float] = Array(repeating: 0.0, count: 100)
    @Published var voiceMetrics = VoiceMetrics()
    @Published var activeCommand: VoiceCommand?

    // MARK: - Dependencies
    private let webSocketManager = VoiceWebSocketManager()
    private let audioStreamProcessor = AudioStreamProcessor()
    private let speechRecognizer = SFSpeechRecognizer()
    private let audioSession = AVAudioSession.sharedInstance()

    // MARK: - Private Properties
    private var cancellables = Set<AnyCancellable>()
    private let sessionId = UUID().uuidString

    private init() {
        setupAudioSession()
        setupPublishers()
    }

    // MARK: - Setup Methods
    private func setupAudioSession() {
        do {
            try audioSession.setCategory(.playAndRecord, mode: .measurement, options: [.duckOthers, .allowBluetooth])
            try audioSession.setActive(true)
        } catch {
            print("Failed to setup audio session: \(error)")
        }
    }

    private func setupPublishers() {
        // Monitor WebSocket connection
        webSocketManager.$isConnected
            .receive(on: DispatchQueue.main)
            .sink { [weak self] isConnected in
                if !isConnected && self?.isListening == true {
                    Task { await self?.stopListening() }
                }
            }
            .store(in: &cancellables)

        // Monitor audio levels from processor
        audioStreamProcessor.$audioLevels
            .receive(on: DispatchQueue.main)
            .assign(to: \.audioLevels, on: self)
            .store(in: &cancellables)

        // Monitor playback state
        AudioPlaybackManager.shared.$isPlaying
            .receive(on: DispatchQueue.main)
            .assign(to: \.isSpeaking, on: self)
            .store(in: &cancellables)
    }

    // MARK: - Voice Conversation Methods
    func startListening(with agent: VoiceAgent? = nil) async {
        guard !isListening else { return }

        do {
            // Ensure WebSocket connection
            if !webSocketManager.isConnected {
                await webSocketManager.connect()
            }

            // Set active agent
            activeAgent = agent ?? VoiceAgent.allAgents[0]

            // Request microphone permission
            let permission = await requestMicrophonePermission()
            guard permission else {
                throw VoiceError.microphonePermissionDenied
            }

            // Start audio processing
            try await audioStreamProcessor.startRecording { [weak self] audioData in
                Task { await self?.processAudioData(audioData) }
            }

            isListening = true
            transcription = ""
            agentResponse = ""

        } catch {
            print("Failed to start listening: \(error)")
            isListening = false
        }
    }

    func stopListening() async {
        guard isListening else { return }

        await audioStreamProcessor.stopRecording()
        isListening = false
    }

    func sendTextMessage(_ text: String, to agent: VoiceAgent) async {
        activeAgent = agent
        isProcessing = true

        let message = VoiceMessage(
            type: .textInput,
            audioData: nil,
            text: text,
            targetAgent: agent.id,
            timestamp: Date(),
            sessionId: sessionId
        )

        do {
            try await webSocketManager.sendVoiceMessage(message)

            // Add to conversation history
            let userMessage = ConversationMessage(
                agentId: "user",
                content: text,
                timestamp: Date(),
                type: .userText,
                audioUrl: nil
            )
            conversationHistory.append(userMessage)

        } catch {
            print("Failed to send text message: \(error)")
            isProcessing = false
        }
    }

    private func processAudioData(_ audioData: Data) async {
        guard !isProcessing else { return }

        isProcessing = true

        let message = VoiceMessage(
            type: .voiceInput,
            audioData: audioData,
            text: nil,
            targetAgent: activeAgent?.id,
            timestamp: Date(),
            sessionId: sessionId
        )

        do {
            try await webSocketManager.sendVoiceMessage(message)
        } catch {
            print("Failed to send voice message: \(error)")
            isProcessing = false
        }
    }

    func handleVoiceResponse(_ response: VoiceMessage) async {
        switch response.type {
        case .agentResponse:
            if let text = response.text {
                agentResponse = text

                // Add to conversation history
                let agentMessage = ConversationMessage(
                    agentId: response.targetAgent ?? "unknown",
                    content: text,
                    timestamp: response.timestamp,
                    type: .agentVoice,
                    audioUrl: nil
                )
                conversationHistory.append(agentMessage)

                // Update metrics
                updateMetrics(for: response)
            }
            isProcessing = false

        case .error:
            print("Voice error: \(response.text ?? "Unknown error")")
            isProcessing = false

        default:
            break
        }
    }

    // MARK: - Agent Selection
    func determineAgent(from text: String) -> VoiceAgent {
        let analysis = analyzeIntent(text)
        return VoiceAgent.allAgents.first { $0.id == analysis.suggestedAgent } ?? VoiceAgent.allAgents[0]
    }

    private func analyzeIntent(_ text: String) -> (suggestedAgent: String, intent: VoiceIntent) {
        let lowerText = text.lowercased()

        // AI/ML/Neural tasks → Natasha
        if lowerText.contains("natasha") || lowerText.contains("ai") || lowerText.contains("neural") || lowerText.contains("threat") {
            return ("natasha_volkov", extractIntent(from: lowerText))
        }

        // QA/GIS/Analysis → Elena
        if lowerText.contains("elena") || lowerText.contains("qa") || lowerText.contains("gis") || lowerText.contains("analysis") {
            return ("elena_rodriguez", extractIntent(from: lowerText))
        }

        // Architecture/Repository → Cove
        if lowerText.contains("cove") || lowerText.contains("architecture") || lowerText.contains("repo") || lowerText.contains("design") {
            return ("cove_harris", extractIntent(from: lowerText))
        }

        // System Architecture → Marcus
        if lowerText.contains("marcus") || lowerText.contains("system") || lowerText.contains("hash") || lowerText.contains("xsd") {
            return ("marcus_chen", extractIntent(from: lowerText))
        }

        return ("natasha_volkov", extractIntent(from: lowerText))
    }

    private func extractIntent(from text: String) -> VoiceIntent {
        if text.contains("health") || text.contains("status") {
            return .showSystemHealth
        } else if text.contains("start") && text.contains("all") {
            return .startAllAgents
        } else if text.contains("stop") && text.contains("all") {
            return .stopAllAgents
        } else if text.contains("metrics") || text.contains("performance") {
            return .showMetrics
        } else if text.contains("filter") && text.contains("crate") {
            return .filterCrates
        } else if text.contains("retrofit") {
            return .retrofitCrate
        } else if text.contains("analyze") {
            return .analyzeData
        } else if text.contains("diagnostic") {
            return .runDiagnostics
        }

        return .unknown
    }

    // MARK: - Utility Methods
    private func requestMicrophonePermission() async -> Bool {
        await withCheckedContinuation { continuation in
            AVAudioSession.sharedInstance().requestRecordPermission { granted in
                continuation.resume(returning: granted)
            }
        }
    }

    private func updateMetrics(for response: VoiceMessage) {
        let latency = Date().timeIntervalSince(response.timestamp)
        voiceMetrics.averageLatency = (voiceMetrics.averageLatency + latency) / 2
        voiceMetrics.totalCommands += 1

        if let agent = response.targetAgent {
            voiceMetrics.agentResponseTimes[agent] = latency
        }
    }

    func clearConversation() {
        conversationHistory.removeAll()
        transcription = ""
        agentResponse = ""
    }
}

// MARK: - Audio Stream Processor
class AudioStreamProcessor: ObservableObject {
    @Published var audioLevels: [Float] = Array(repeating: 0.0, count: 100)
    @Published var isRecording = false

    private let audioEngine = AVAudioEngine()
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let speechRecognizer = SFSpeechRecognizer()

    private var audioDataHandler: ((Data) -> Void)?

    func startRecording(audioDataHandler: @escaping (Data) -> Void) async throws {
        self.audioDataHandler = audioDataHandler

        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)

        // Setup speech recognition
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else {
            throw VoiceError.recognitionSetupFailed
        }
        recognitionRequest.shouldReportPartialResults = true

        // Install audio tap for processing
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, _ in
            recognitionRequest.append(buffer)

            // Calculate audio levels for visualization
            let levels = self?.calculateAudioLevels(from: buffer) ?? []

            DispatchQueue.main.async {
                self?.audioLevels = levels
            }

            // Convert buffer to data for transmission
            if let audioData = self?.bufferToData(buffer) {
                audioDataHandler(audioData)
            }
        }

        audioEngine.prepare()
        try audioEngine.start()
        isRecording = true
    }

    func stopRecording() async {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()

        recognitionRequest = nil
        recognitionTask = nil
        isRecording = false
    }

    private func calculateAudioLevels(from buffer: AVAudioPCMBuffer) -> [Float] {
        guard let channelData = buffer.floatChannelData?[0] else { return [] }

        let frameLength = Int(buffer.frameLength)
        let stepSize = max(frameLength / 100, 1)

        return stride(from: 0, to: frameLength, by: stepSize).map { index in
            abs(channelData[index])
        }
    }

    private func bufferToData(_ buffer: AVAudioPCMBuffer) -> Data? {
        guard let channelData = buffer.floatChannelData?[0] else { return nil }

        let frameLength = Int(buffer.frameLength)
        let dataSize = frameLength * MemoryLayout<Float>.size

        return Data(bytes: channelData, count: dataSize)
    }
}

// MARK: - Error Types
enum VoiceError: Error, LocalizedError {
    case notConnected
    case microphonePermissionDenied
    case recognitionSetupFailed
    case audioSessionFailed

    var errorDescription: String? {
        switch self {
        case .notConnected:
            return "Not connected to voice service"
        case .microphonePermissionDenied:
            return "Microphone permission denied"
        case .recognitionSetupFailed:
            return "Speech recognition setup failed"
        case .audioSessionFailed:
            return "Audio session setup failed"
        }
    }
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}