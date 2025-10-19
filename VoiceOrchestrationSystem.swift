import SwiftUI
import AVFoundation
import Speech
import MapKit
import UserNotifications

// MARK: - Voice Orchestration Manager
@MainActor
class VoiceOrchestrationManager: ObservableObject {
    static let shared = VoiceOrchestrationManager()

    // MARK: - Published Properties
    @Published var activeVoiceChannels: [VoiceChannel] = []
    @Published var voicePriorities: [VoiceType: VoicePriority] = [:]
    @Published var isVoiceArbitrationActive = false
    @Published var currentSpeaker: VoiceChannel?
    @Published var queuedVoiceMessages: [QueuedVoiceMessage] = []

    // MARK: - Voice Channel Management
    private var voiceChannels: [VoiceType: VoiceChannel] = [:]
    private let audioSession = AVAudioSession.sharedInstance()
    private var voiceQueue = DispatchQueue(label: "voice.orchestration", qos: .userInteractive)

    // MARK: - ElevenLabs Voice Assignments
    private let systemVoiceMapping: [VoiceType: ElevenLabsVoice] = [
        .agentConversation: .natasha,
        .turnByTurn: .cove,
        .systemAlerts: .elena,
        .notifications: .marcus,
        .emergencyAlerts: .commander,
        .contextualHelp: .sarah
    ]

    private init() {
        setupVoiceChannels()
        setupAudioSession()
        setupVoicePriorities()
    }

    // MARK: - Setup Methods
    private func setupVoiceChannels() {
        for voiceType in VoiceType.allCases {
            let channel = VoiceChannel(
                type: voiceType,
                elevenLabsVoice: systemVoiceMapping[voiceType] ?? .natasha,
                isActive: false
            )
            voiceChannels[voiceType] = channel
        }
    }

    private func setupAudioSession() {
        do {
            try audioSession.setCategory(
                .playAndRecord,
                mode: .default,
                options: [.duckOthers, .allowBluetooth, .allowAirPlay]
            )
        } catch {
            print("Failed to setup audio session: \(error)")
        }
    }

    private func setupVoicePriorities() {
        voicePriorities = [
            .emergencyAlerts: .critical,      // Highest priority
            .agentConversation: .high,        // User-initiated conversations
            .turnByTurn: .medium,             // Navigation guidance
            .systemAlerts: .medium,           // System notifications
            .contextualHelp: .low,            // Help and tips
            .notifications: .low,             // General notifications
            .siri: .highest                   // Siri always wins
        ]
    }

    // MARK: - Voice Orchestration
    func requestVoiceChannel(
        for type: VoiceType,
        message: String,
        priority: VoicePriority? = nil,
        interruptible: Bool = true
    ) async -> Bool {

        let requestPriority = priority ?? voicePriorities[type] ?? .medium

        // Check if we can interrupt current speaker
        if let currentSpeaker = currentSpeaker {
            let currentPriority = voicePriorities[currentSpeaker.type] ?? .medium

            if requestPriority.rawValue <= currentPriority.rawValue && !currentSpeaker.interruptible {
                // Queue the message if we can't interrupt
                queueVoiceMessage(type: type, message: message, priority: requestPriority)
                return false
            } else if requestPriority.rawValue > currentPriority.rawValue {
                // Interrupt current speaker
                await interruptCurrentSpeaker()
            }
        }

        // Assign voice channel and speak
        guard let channel = voiceChannels[type] else { return false }

        currentSpeaker = channel
        channel.isActive = true
        channel.interruptible = interruptible

        await speakMessage(message, using: channel)

        return true
    }

    private func queueVoiceMessage(type: VoiceType, message: String, priority: VoicePriority) {
        let queuedMessage = QueuedVoiceMessage(
            id: UUID(),
            type: type,
            message: message,
            priority: priority,
            timestamp: Date()
        )

        queuedVoiceMessages.append(queuedMessage)
        queuedVoiceMessages.sort { $0.priority.rawValue > $1.priority.rawValue }
    }

    private func interruptCurrentSpeaker() async {
        guard let current = currentSpeaker else { return }

        // Fade out current speaker
        await fadeOutVoice(for: current)

        // Mark as inactive
        current.isActive = false
        currentSpeaker = nil
    }

    private func speakMessage(_ message: String, using channel: VoiceChannel) async {
        do {
            // Configure audio for this voice type
            try await configureAudioForVoiceType(channel.type)

            // Generate speech using ElevenLabs
            let audioData = await generateElevenLabsSpeech(
                text: message,
                voice: channel.elevenLabsVoice
            )

            // Play with voice-specific settings
            await playAudioWithSettings(audioData, for: channel)

            // Voice finished, process queue
            await voiceFinished(channel)

        } catch {
            print("Failed to speak message: \(error)")
            await voiceFinished(channel)
        }
    }

    private func voiceFinished(_ channel: VoiceChannel) async {
        channel.isActive = false

        if currentSpeaker?.id == channel.id {
            currentSpeaker = nil
        }

        // Process next queued message
        await processNextQueuedMessage()
    }

    private func processNextQueuedMessage() async {
        guard !queuedVoiceMessages.isEmpty else { return }

        let nextMessage = queuedVoiceMessages.removeFirst()

        _ = await requestVoiceChannel(
            for: nextMessage.type,
            message: nextMessage.message,
            priority: nextMessage.priority
        )
    }

    // MARK: - Audio Configuration
    private func configureAudioForVoiceType(_ type: VoiceType) async throws {
        switch type {
        case .emergencyAlerts:
            // Maximum volume, override silent mode
            try audioSession.setCategory(.playback, options: [.overrideMutedMicrophoneInterruption])

        case .agentConversation:
            // Conversational volume, duck others
            try audioSession.setCategory(.playAndRecord, options: [.duckOthers])

        case .turnByTurn:
            // Navigation volume, mix with music
            try audioSession.setCategory(.playback, options: [.mixWithOthers])

        case .systemAlerts, .notifications:
            // Standard alerts
            try audioSession.setCategory(.playback, options: [.duckOthers])

        case .contextualHelp:
            // Quiet help voice
            try audioSession.setCategory(.playback, options: [.mixWithOthers])

        case .siri:
            // Siri handles its own audio
            break
        }
    }

    // MARK: - ElevenLabs Integration
    private func generateElevenLabsSpeech(text: String, voice: ElevenLabsVoice) async -> Data? {
        // Connect to existing ElevenLabs pipeline
        let message = VoiceOrchestrationMessage(
            type: .textToSpeech,
            text: text,
            voiceId: voice.voiceId,
            settings: voice.voiceSettings
        )

        // Send to voice pipeline on port 18765
        return await sendToVoicePipeline(message)
    }

    private func sendToVoicePipeline(_ message: VoiceOrchestrationMessage) async -> Data? {
        do {
            let url = URL(string: "ws://localhost:18765")!
            let data = try JSONEncoder().encode(message)

            // Use existing WebSocket connection or create new one
            return await VoiceWebSocketManager.shared.sendOrchestrationMessage(data)

        } catch {
            print("Failed to send to voice pipeline: \(error)")
            return nil
        }
    }

    private func playAudioWithSettings(_ audioData: Data?, for channel: VoiceChannel) async {
        guard let audioData = audioData else { return }

        // Apply voice-specific audio processing
        let processedAudio = await processAudioForVoiceType(audioData, type: channel.type)

        // Play through appropriate audio route
        await AudioPlaybackManager.shared.playAudio(processedAudio)
    }

    private func processAudioForVoiceType(_ audioData: Data, type: VoiceType) async -> Data {
        // Apply voice-specific processing
        switch type {
        case .emergencyAlerts:
            return await applyUrgencyProcessing(audioData)
        case .turnByTurn:
            return await applyNavigationProcessing(audioData)
        case .agentConversation:
            return await applyConversationalProcessing(audioData)
        default:
            return audioData
        }
    }

    private func fadeOutVoice(for channel: VoiceChannel) async {
        // Implement smooth fade-out
        await AudioPlaybackManager.shared.fadeOut(duration: 0.5)
    }

    // MARK: - System Integration
    func handleSiriActivation() {
        // Pause all other voices when Siri activates
        Task {
            for channel in voiceChannels.values where channel.isActive {
                await interruptCurrentSpeaker()
            }
        }
    }

    func handleNavigationEvent(_ event: NavigationEvent) async {
        let message = generateNavigationMessage(for: event)

        _ = await requestVoiceChannel(
            for: .turnByTurn,
            message: message,
            priority: .medium,
            interruptible: true
        )
    }

    func handleSystemAlert(_ alert: SystemAlert) async {
        let priority: VoicePriority = alert.isEmergency ? .critical : .medium
        let voiceType: VoiceType = alert.isEmergency ? .emergencyAlerts : .systemAlerts

        _ = await requestVoiceChannel(
            for: voiceType,
            message: alert.message,
            priority: priority,
            interruptible: false
        )
    }

    func handleNotification(_ notification: CTASNotification) async {
        let message = generateNotificationMessage(for: notification)

        _ = await requestVoiceChannel(
            for: .notifications,
            message: message,
            priority: .low,
            interruptible: true
        )
    }

    // MARK: - Voice Deconfliction Rules
    func setVoiceDeconflictionRules(_ rules: VoiceDeconflictionRules) {
        // Update priority mappings
        for (voiceType, priority) in rules.priorityOverrides {
            voicePriorities[voiceType] = priority
        }

        // Apply spatial audio rules
        applySpatialAudioRules(rules.spatialRules)
    }

    private func applySpatialAudioRules(_ rules: SpatialAudioRules) {
        // Configure spatial positioning for different voice types
        // Agent conversations: Center stage
        // Turn-by-turn: Right ear
        // Alerts: Left ear
        // Notifications: Background
    }
}

// MARK: - Voice Channel Model
class VoiceChannel: ObservableObject, Identifiable {
    let id = UUID()
    let type: VoiceType
    let elevenLabsVoice: ElevenLabsVoice
    @Published var isActive: Bool
    @Published var interruptible: Bool = true
    @Published var currentMessage: String?
    @Published var volume: Float = 1.0

    init(type: VoiceType, elevenLabsVoice: ElevenLabsVoice, isActive: Bool) {
        self.type = type
        self.elevenLabsVoice = elevenLabsVoice
        self.isActive = isActive
    }
}

// MARK: - Voice Types
enum VoiceType: String, CaseIterable {
    case agentConversation = "agent_conversation"
    case turnByTurn = "turn_by_turn"
    case systemAlerts = "system_alerts"
    case notifications = "notifications"
    case emergencyAlerts = "emergency_alerts"
    case contextualHelp = "contextual_help"
    case siri = "siri"

    var displayName: String {
        switch self {
        case .agentConversation: return "Agent Conversations"
        case .turnByTurn: return "Turn-by-Turn Navigation"
        case .systemAlerts: return "System Alerts"
        case .notifications: return "Notifications"
        case .emergencyAlerts: return "Emergency Alerts"
        case .contextualHelp: return "Contextual Help"
        case .siri: return "Siri"
        }
    }
}

// MARK: - Voice Priorities
enum VoicePriority: Int, CaseIterable {
    case critical = 5    // Emergency alerts
    case highest = 4     // Siri
    case high = 3        // Agent conversations
    case medium = 2      // Navigation, system alerts
    case low = 1         // Notifications, help

    var displayName: String {
        switch self {
        case .critical: return "Critical"
        case .highest: return "Highest"
        case .high: return "High"
        case .medium: return "Medium"
        case .low: return "Low"
        }
    }
}

// MARK: - ElevenLabs Voice Assignments
enum ElevenLabsVoice: String, CaseIterable {
    case natasha = "EXAVITQu4vr4xnSDxMaL"      // Agent conversations (Russian accent)
    case elena = "cgSgspJ2msm6clMCkdW9"        // System alerts (Nuyorican accent)
    case cove = "IKne3meq5aSn9XLyUdCD"         // Turn-by-turn (Australian accent)
    case marcus = "pqHfZKP75CvOlQylNhV4"       // Notifications (Mandarin accent)
    case sarah = "FGY2WhTYpPnrIDTdsKH5"        // Contextual help (Sichuan accent)
    case commander = "21m00Tcm4TlvDq8ikWAM"    // Emergency alerts (Authoritative)

    var voiceId: String { rawValue }

    var voiceSettings: ElevenLabsVoiceSettings {
        switch self {
        case .natasha:
            return ElevenLabsVoiceSettings(stability: 0.5, similarityBoost: 0.8, style: 0.0)
        case .elena:
            return ElevenLabsVoiceSettings(stability: 0.7, similarityBoost: 0.9, style: 0.2)
        case .cove:
            return ElevenLabsVoiceSettings(stability: 0.6, similarityBoost: 0.8, style: 0.1)
        case .marcus:
            return ElevenLabsVoiceSettings(stability: 0.8, similarityBoost: 0.7, style: 0.0)
        case .sarah:
            return ElevenLabsVoiceSettings(stability: 0.9, similarityBoost: 0.6, style: 0.0)
        case .commander:
            return ElevenLabsVoiceSettings(stability: 0.4, similarityBoost: 0.9, style: 0.5)
        }
    }

    var personality: String {
        switch self {
        case .natasha: return "Technical, authoritative, Russian accent"
        case .elena: return "Direct, street-smart, Nuyorican accent"
        case .cove: return "Clear, navigation-focused, Australian accent"
        case .marcus: return "Calm, informative, Mandarin accent"
        case .sarah: return "Helpful, warm, Sichuan accent"
        case .commander: return "Urgent, commanding, military precision"
        }
    }
}

struct ElevenLabsVoiceSettings: Codable {
    let stability: Double
    let similarityBoost: Double
    let style: Double
    let useSpeakerBoost: Bool = true
}

// MARK: - Queued Voice Message
struct QueuedVoiceMessage: Identifiable {
    let id: UUID
    let type: VoiceType
    let message: String
    let priority: VoicePriority
    let timestamp: Date
}

// MARK: - Voice Orchestration Message
struct VoiceOrchestrationMessage: Codable {
    let type: MessageType
    let text: String?
    let voiceId: String?
    let settings: ElevenLabsVoiceSettings?

    enum MessageType: String, Codable {
        case textToSpeech = "text_to_speech"
        case interrupt = "interrupt"
        case queue = "queue"
        case priority = "priority"
    }
}

// MARK: - System Event Models
struct NavigationEvent {
    let type: NavigationType
    let instruction: String
    let distance: Double?
    let roadName: String?
}

enum NavigationType {
    case turnLeft, turnRight, goStraight, arrive, recalculating
}

struct SystemAlert {
    let message: String
    let isEmergency: Bool
    let category: AlertCategory
}

enum AlertCategory {
    case security, system, network, application
}

struct CTASNotification {
    let title: String
    let body: String
    let category: NotificationCategory
    let priority: VoicePriority
}

enum NotificationCategory {
    case agentUpdate, systemStatus, integration, user
}

// MARK: - Voice Deconfliction Rules
struct VoiceDeconflictionRules {
    var priorityOverrides: [VoiceType: VoicePriority] = [:]
    var spatialRules: SpatialAudioRules = SpatialAudioRules()
    var timeBasedRules: TimeBasedRules = TimeBasedRules()
}

struct SpatialAudioRules {
    var agentPosition: AudioPosition = .center
    var navigationPosition: AudioPosition = .right
    var alertPosition: AudioPosition = .left
    var notificationPosition: AudioPosition = .background
}

enum AudioPosition {
    case center, left, right, background
}

struct TimeBasedRules {
    var quietHoursStart: Date?
    var quietHoursEnd: Date?
    var emergencyOverride: Bool = true
}

// MARK: - Audio Processing Extensions
extension VoiceOrchestrationManager {
    private func applyUrgencyProcessing(_ audioData: Data) async -> Data {
        // Apply urgency effects: increased volume, faster speech, attention-getting tones
        return audioData // Placeholder
    }

    private func applyNavigationProcessing(_ audioData: Data) async -> Data {
        // Apply navigation effects: clear articulation, spatial positioning
        return audioData // Placeholder
    }

    private func applyConversationalProcessing(_ audioData: Data) async -> Data {
        // Apply conversational effects: natural pacing, personality preservation
        return audioData // Placeholder
    }
}

// MARK: - Message Generation
extension VoiceOrchestrationManager {
    private func generateNavigationMessage(for event: NavigationEvent) -> String {
        switch event.type {
        case .turnLeft:
            return "In \(formatDistance(event.distance)), turn left\(formatRoadName(event.roadName))"
        case .turnRight:
            return "In \(formatDistance(event.distance)), turn right\(formatRoadName(event.roadName))"
        case .goStraight:
            return "Continue straight\(formatRoadName(event.roadName))"
        case .arrive:
            return "You have arrived at your destination"
        case .recalculating:
            return "Recalculating route"
        }
    }

    private func formatDistance(_ distance: Double?) -> String {
        guard let distance = distance else { return "" }

        if distance < 0.1 {
            return "now"
        } else if distance < 1.0 {
            return "\(Int(distance * 1000)) meters"
        } else {
            return String(format: "%.1f kilometers", distance)
        }
    }

    private func formatRoadName(_ roadName: String?) -> String {
        guard let roadName = roadName else { return "" }
        return " onto \(roadName)"
    }

    private func generateNotificationMessage(for notification: CTASNotification) -> String {
        switch notification.category {
        case .agentUpdate:
            return "Agent update: \(notification.body)"
        case .systemStatus:
            return "System status: \(notification.body)"
        case .integration:
            return "Integration alert: \(notification.body)"
        case .user:
            return notification.body
        }
    }
}

// MARK: - Voice Orchestration UI
struct VoiceOrchestrationControlPanel: View {
    @StateObject private var orchestrator = VoiceOrchestrationManager.shared
    @State private var showingSettings = false

    var body: some View {
        VStack(spacing: 20) {
            // Active Voice Channels
            VStack(alignment: .leading) {
                Text("Active Voice Channels")
                    .font(.headline)

                if orchestrator.activeVoiceChannels.isEmpty {
                    Text("No active voice channels")
                        .foregroundColor(.secondary)
                } else {
                    ForEach(orchestrator.activeVoiceChannels) { channel in
                        VoiceChannelRow(channel: channel)
                    }
                }
            }

            // Current Speaker
            if let currentSpeaker = orchestrator.currentSpeaker {
                VStack(alignment: .leading) {
                    Text("Currently Speaking")
                        .font(.headline)

                    CurrentSpeakerView(channel: currentSpeaker)
                }
            }

            // Voice Queue
            if !orchestrator.queuedVoiceMessages.isEmpty {
                VStack(alignment: .leading) {
                    Text("Voice Queue (\(orchestrator.queuedVoiceMessages.count))")
                        .font(.headline)

                    ForEach(orchestrator.queuedVoiceMessages.prefix(3)) { message in
                        QueuedMessageRow(message: message)
                    }
                }
            }

            // Test Buttons
            VStack {
                Text("Test Voice Deconfliction")
                    .font(.headline)

                HStack {
                    Button("Agent Message") {
                        Task {
                            _ = await orchestrator.requestVoiceChannel(
                                for: .agentConversation,
                                message: "Hello, this is Natasha with a system update."
                            )
                        }
                    }

                    Button("Navigation") {
                        Task {
                            _ = await orchestrator.requestVoiceChannel(
                                for: .turnByTurn,
                                message: "In 200 meters, turn right onto Main Street."
                            )
                        }
                    }

                    Button("Alert") {
                        Task {
                            _ = await orchestrator.requestVoiceChannel(
                                for: .systemAlerts,
                                message: "System security alert detected."
                            )
                        }
                    }
                }

                Button("Emergency Test") {
                    Task {
                        _ = await orchestrator.requestVoiceChannel(
                            for: .emergencyAlerts,
                            message: "Emergency: Critical system failure detected.",
                            priority: .critical,
                            interruptible: false
                        )
                    }
                }
                .foregroundColor(.red)
            }

            Spacer()
        }
        .padding()
        .navigationTitle("Voice Orchestration")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Settings") {
                    showingSettings = true
                }
            }
        }
        .sheet(isPresented: $showingSettings) {
            VoiceOrchestrationSettings()
        }
    }
}

struct VoiceChannelRow: View {
    @ObservedObject var channel: VoiceChannel

    var body: some View {
        HStack {
            Circle()
                .fill(channel.isActive ? Color.green : Color.gray)
                .frame(width: 12, height: 12)

            VStack(alignment: .leading) {
                Text(channel.type.displayName)
                    .font(.subheadline)
                    .fontWeight(.medium)

                Text(channel.elevenLabsVoice.personality)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            if let message = channel.currentMessage {
                Text(message.prefix(30) + "...")
                    .font(.caption)
                    .foregroundColor(.blue)
            }
        }
        .padding(.vertical, 4)
    }
}

struct CurrentSpeakerView: View {
    @ObservedObject var channel: VoiceChannel

    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(channel.type.displayName)
                    .font(.subheadline)
                    .fontWeight(.semibold)

                Text("Voice: \(channel.elevenLabsVoice.personality)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            // Volume indicator
            VStack {
                Text("Volume")
                    .font(.caption2)
                Slider(value: .constant(channel.volume), in: 0...1)
                    .frame(width: 80)
                    .disabled(true)
            }
        }
        .padding()
        .background(Color.blue.opacity(0.1))
        .cornerRadius(8)
    }
}

struct QueuedMessageRow: View {
    let message: QueuedVoiceMessage

    var body: some View {
        HStack {
            Text("\(message.priority.rawValue)")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.white)
                .frame(width: 20, height: 20)
                .background(priorityColor(message.priority))
                .clipShape(Circle())

            VStack(alignment: .leading) {
                Text(message.type.displayName)
                    .font(.caption)
                    .fontWeight(.medium)

                Text(message.message.prefix(40) + "...")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            Spacer()

            Text(message.timestamp, style: .time)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
    }

    private func priorityColor(_ priority: VoicePriority) -> Color {
        switch priority {
        case .critical: return .red
        case .highest: return .purple
        case .high: return .orange
        case .medium: return .blue
        case .low: return .gray
        }
    }
}

struct VoiceOrchestrationSettings: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            List {
                Section("Voice Assignments") {
                    ForEach(VoiceType.allCases.filter { $0 != .siri }, id: \.self) { voiceType in
                        VoiceAssignmentRow(voiceType: voiceType)
                    }
                }

                Section("Priority Settings") {
                    ForEach(VoiceType.allCases, id: \.self) { voiceType in
                        VoicePriorityRow(voiceType: voiceType)
                    }
                }

                Section("Spatial Audio") {
                    Text("Configure spatial positioning for different voice types")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    // Spatial audio configuration UI
                }
            }
            .navigationTitle("Voice Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

struct VoiceAssignmentRow: View {
    let voiceType: VoiceType

    var body: some View {
        HStack {
            Text(voiceType.displayName)
            Spacer()
            // Voice assignment picker
        }
    }
}

struct VoicePriorityRow: View {
    let voiceType: VoiceType

    var body: some View {
        HStack {
            Text(voiceType.displayName)
            Spacer()
            // Priority picker
        }
    }
}