//
//  SDCClaudeCodeIntegration.swift - Premium Claude Code & Custom GPT Features
//  CTAS-7 Solutions Development Center
//
//  Special benefits for Claude Code users and Custom GPT integrations
//  Tesla/SpaceX-grade code quality with AI-powered development acceleration
//

import SwiftUI
import SwiftData
import Combine

// MARK: - Claude Code Premium Features Manager
@MainActor
class ClaudeCodeManager: ObservableObject {
    @Published var isClaudeCodeConnected = false
    @Published var claudeCodeFeatures: [ClaudeCodeFeature] = []
    @Published var activeProjects: [ClaudeCodeProject] = []
    @Published var codeQualityMetrics: CodeQualityMetrics?
    @Published var customGPTs: [CustomGPT] = []

    private let claudeCodeAPI = ClaudeCodeAPI()

    init() {
        loadClaudeCodeFeatures()
        loadCustomGPTs()
    }

    func connectToClaudeCode() async {
        do {
            isClaudeCodeConnected = try await claudeCodeAPI.authenticate()
            if isClaudeCodeConnected {
                await syncActiveProjects()
                await loadCodeQualityMetrics()
            }
        } catch {
            print("Claude Code connection failed: \(error)")
        }
    }

    private func loadClaudeCodeFeatures() {
        claudeCodeFeatures = [
            ClaudeCodeFeature(
                name: "Real-time Code Analysis",
                description: "Live code quality feedback with Tesla/SpaceX standards",
                icon: "doc.text.magnifyingglass",
                isPremium: true
            ),
            ClaudeCodeFeature(
                name: "Auto-Documentation Generation",
                description: "Automatically generate DoDAF/TOGAF architecture docs",
                icon: "doc.richtext",
                isPremium: true
            ),
            ClaudeCodeFeature(
                name: "Security Vulnerability Detection",
                description: "Real-time security analysis with NIST framework mapping",
                icon: "shield.checkerboard",
                isPremium: true
            ),
            ClaudeCodeFeature(
                name: "Performance Optimization Suggestions",
                description: "AI-powered performance recommendations",
                icon: "speedometer",
                isPremium: true
            ),
            ClaudeCodeFeature(
                name: "Smart Refactoring Assistant",
                description: "Intelligent code restructuring with best practices",
                icon: "arrow.triangle.2.circlepath",
                isPremium: true
            )
        ]
    }

    private func loadCustomGPTs() {
        customGPTs = [
            CustomGPT(
                name: "CTAS-7 Architecture GPT",
                description: "Specialized in CTAS-7 system architecture and DoD requirements",
                capabilities: ["Architecture Design", "Security Analysis", "Compliance Checking"],
                icon: "building.2",
                category: .architecture
            ),
            CustomGPT(
                name: "SwiftUI Expert GPT",
                description: "iOS development specialist with Tesla/SpaceX code quality standards",
                capabilities: ["SwiftUI Development", "iOS Best Practices", "Performance Optimization"],
                icon: "swift",
                category: .development
            ),
            CustomGPT(
                name: "Cybersecurity Operations GPT",
                description: "Red/Blue/Purple team operations and NIST framework expertise",
                capabilities: ["Threat Analysis", "Security Planning", "Incident Response"],
                icon: "shield",
                category: .security
            ),
            CustomGPT(
                name: "DevOps Pipeline GPT",
                description: "CI/CD pipeline optimization and infrastructure as code specialist",
                capabilities: ["Pipeline Design", "IaC Generation", "Deployment Strategies"],
                icon: "pipe.and.tap",
                category: .devops
            )
        ]
    }

    private func syncActiveProjects() async {
        do {
            activeProjects = try await claudeCodeAPI.getActiveProjects()
        } catch {
            print("Failed to sync Claude Code projects: \(error)")
        }
    }

    private func loadCodeQualityMetrics() async {
        do {
            codeQualityMetrics = try await claudeCodeAPI.getCodeQualityMetrics()
        } catch {
            print("Failed to load code quality metrics: \(error)")
        }
    }

    func generateArchitectureDocumentation(for project: SDCProject) async -> String? {
        guard isClaudeCodeConnected else { return nil }

        do {
            return try await claudeCodeAPI.generateDocumentation(
                projectId: project.id,
                type: .architecture,
                standards: [.dodaf, .togaf, .sabsa]
            )
        } catch {
            print("Documentation generation failed: \(error)")
            return nil
        }
    }

    func analyzeCodeSecurity(code: String) async -> SecurityAnalysis? {
        guard isClaudeCodeConnected else { return nil }

        do {
            return try await claudeCodeAPI.analyzeCodeSecurity(code: code)
        } catch {
            print("Security analysis failed: \(error)")
            return nil
        }
    }

    func chatWithCustomGPT(_ gpt: CustomGPT, message: String) async -> String? {
        do {
            return try await claudeCodeAPI.chatWithCustomGPT(
                gptId: gpt.id,
                message: message,
                context: getCurrentProjectContext()
            )
        } catch {
            print("Custom GPT chat failed: \(error)")
            return nil
        }
    }

    private func getCurrentProjectContext() -> ProjectContext {
        // Provide current SDC context to Custom GPTs
        return ProjectContext(
            activeProjects: activeProjects.map { $0.name },
            currentTasks: [], // Add current tasks
            techStack: ["SwiftUI", "SwiftData", "CoreML", "MapKit"],
            securityRequirements: ["NIST", "DoD Standards", "FISMA"]
        )
    }
}

// MARK: - Claude Code API Client
class ClaudeCodeAPI {
    private let baseURL = "https://api.claude.com/v1"
    private let session = URLSession.shared

    func authenticate() async throws -> Bool {
        // Check for Claude Code session token in keychain
        guard let token = KeychainManager.shared.getAPIKey(for: .claudeCode) else {
            return false
        }

        var request = URLRequest(url: URL(string: "\(baseURL)/auth/verify")!)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let (_, response) = try await session.data(for: request)
        return (response as? HTTPURLResponse)?.statusCode == 200
    }

    func getActiveProjects() async throws -> [ClaudeCodeProject] {
        guard let token = KeychainManager.shared.getAPIKey(for: .claudeCode) else {
            throw APIError.missingToken
        }

        var request = URLRequest(url: URL(string: "\(baseURL)/projects/active")!)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode([ClaudeCodeProject].self, from: data)
    }

    func getCodeQualityMetrics() async throws -> CodeQualityMetrics {
        guard let token = KeychainManager.shared.getAPIKey(for: .claudeCode) else {
            throw APIError.missingToken
        }

        var request = URLRequest(url: URL(string: "\(baseURL)/metrics/quality")!)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode(CodeQualityMetrics.self, from: data)
    }

    func generateDocumentation(projectId: UUID, type: DocumentationType, standards: [ComplianceStandard]) async throws -> String {
        guard let token = KeychainManager.shared.getAPIKey(for: .claudeCode) else {
            throw APIError.missingToken
        }

        var request = URLRequest(url: URL(string: "\(baseURL)/generate/documentation")!)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = DocumentationRequest(
            projectId: projectId,
            type: type,
            standards: standards,
            format: .markdown
        )
        request.httpBody = try JSONEncoder().encode(body)

        let (data, _) = try await session.data(for: request)
        let response = try JSONDecoder().decode(DocumentationResponse.self, from: data)
        return response.content
    }

    func analyzeCodeSecurity(code: String) async throws -> SecurityAnalysis {
        guard let token = KeychainManager.shared.getAPIKey(for: .claudeCode) else {
            throw APIError.missingToken
        }

        var request = URLRequest(url: URL(string: "\(baseURL)/analyze/security")!)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = ["code": code, "frameworks": ["NIST", "OWASP", "DoD"]]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode(SecurityAnalysis.self, from: data)
    }

    func chatWithCustomGPT(gptId: UUID, message: String, context: ProjectContext) async throws -> String {
        guard let token = KeychainManager.shared.getAPIKey(for: .claudeCode) else {
            throw APIError.missingToken
        }

        var request = URLRequest(url: URL(string: "\(baseURL)/gpt/chat")!)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = CustomGPTChatRequest(
            gptId: gptId,
            message: message,
            context: context
        )
        request.httpBody = try JSONEncoder().encode(body)

        let (data, _) = try await session.data(for: request)
        let response = try JSONDecoder().decode(CustomGPTChatResponse.self, from: data)
        return response.message
    }
}

// MARK: - Models
struct ClaudeCodeFeature {
    let name: String
    let description: String
    let icon: String
    let isPremium: Bool
}

struct ClaudeCodeProject: Codable, Identifiable {
    let id: UUID
    let name: String
    let language: String
    let lastUpdated: Date
    let qualityScore: Double
    let securityScore: Double
}

struct CodeQualityMetrics: Codable {
    let overallScore: Double
    let maintainabilityIndex: Double
    let technicalDebt: TimeInterval
    let testCoverage: Double
    let performanceScore: Double
    let securityScore: Double
    let trends: QualityTrends
}

struct QualityTrends: Codable {
    let weeklyImprovement: Double
    let monthlyImprovement: Double
    let issuesResolved: Int
    let newIssues: Int
}

struct CustomGPT: Identifiable {
    let id = UUID()
    let name: String
    let description: String
    let capabilities: [String]
    let icon: String
    let category: GPTCategory
}

enum GPTCategory: CaseIterable {
    case architecture, development, security, devops

    var title: String {
        switch self {
        case .architecture: return "Architecture"
        case .development: return "Development"
        case .security: return "Security"
        case .devops: return "DevOps"
        }
    }
}

struct SecurityAnalysis: Codable {
    let overallRisk: RiskLevel
    let vulnerabilities: [SecurityVulnerability]
    let recommendations: [SecurityRecommendation]
    let nistMapping: [String]
    let owaspMapping: [String]
}

struct SecurityVulnerability: Codable, Identifiable {
    let id = UUID()
    let type: String
    let severity: RiskLevel
    let description: String
    let lineNumber: Int?
    let remediation: String
}

struct SecurityRecommendation: Codable, Identifiable {
    let id = UUID()
    let title: String
    let description: String
    let priority: RiskLevel
    let effort: EffortLevel
}

enum RiskLevel: String, Codable, CaseIterable {
    case low = "low"
    case medium = "medium"
    case high = "high"
    case critical = "critical"

    var color: Color {
        switch self {
        case .low: return .green
        case .medium: return .yellow
        case .high: return .orange
        case .critical: return .red
        }
    }
}

enum EffortLevel: String, Codable, CaseIterable {
    case minimal = "minimal"
    case moderate = "moderate"
    case significant = "significant"
}

enum DocumentationType: String, Codable {
    case architecture = "architecture"
    case security = "security"
    case api = "api"
    case deployment = "deployment"
}

enum ComplianceStandard: String, Codable {
    case dodaf = "dodaf"
    case togaf = "togaf"
    case sabsa = "sabsa"
    case nist = "nist"
    case fisma = "fisma"
}

struct DocumentationRequest: Codable {
    let projectId: UUID
    let type: DocumentationType
    let standards: [ComplianceStandard]
    let format: DocumentFormat
}

struct DocumentationResponse: Codable {
    let content: String
    let metadata: DocumentMetadata
}

struct DocumentMetadata: Codable {
    let generatedAt: Date
    let standards: [ComplianceStandard]
    let version: String
}

enum DocumentFormat: String, Codable {
    case markdown = "markdown"
    case html = "html"
    case pdf = "pdf"
}

struct ProjectContext: Codable {
    let activeProjects: [String]
    let currentTasks: [String]
    let techStack: [String]
    let securityRequirements: [String]
}

struct CustomGPTChatRequest: Codable {
    let gptId: UUID
    let message: String
    let context: ProjectContext
}

struct CustomGPTChatResponse: Codable {
    let message: String
    let suggestions: [String]
    let relatedTopics: [String]
}

enum APIError: Error {
    case missingToken
    case invalidResponse
    case networkError
}

// MARK: - Extension for LLMService
extension LLMService {
    static let claudeCode = LLMService.claude // Reuse Claude service for Claude Code

    var displayName: String {
        switch self {
        case .openai: return "OpenAI GPT"
        case .claude: return "Claude Code"
        }
    }
}

// MARK: - Claude Code Integration Views
struct ClaudeCodeDashboard: View {
    @StateObject private var claudeManager = ClaudeCodeManager()

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Connection Status
                ClaudeCodeConnectionCard()

                // Premium Features
                ClaudeCodeFeaturesSection()

                // Code Quality Dashboard
                if claudeManager.isClaudeCodeConnected {
                    CodeQualityDashboard()
                }

                // Custom GPTs Section
                CustomGPTsSection()
            }
            .padding()
        }
        .navigationTitle("Claude Code Integration")
        .environmentObject(claudeManager)
        .task {
            await claudeManager.connectToClaudeCode()
        }
    }
}

struct ClaudeCodeConnectionCard: View {
    @EnvironmentObject private var claudeManager: ClaudeCodeManager

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "brain.head.profile")
                    .font(.title2)
                    .foregroundColor(.blue)

                VStack(alignment: .leading) {
                    Text("Claude Code Integration")
                        .font(.headline)
                    Text(claudeManager.isClaudeCodeConnected ? "Connected" : "Not Connected")
                        .font(.subheadline)
                        .foregroundColor(claudeManager.isClaudeCodeConnected ? .green : .red)
                }

                Spacer()

                if !claudeManager.isClaudeCodeConnected {
                    Button("Connect") {
                        Task {
                            await claudeManager.connectToClaudeCode()
                        }
                    }
                    .buttonStyle(.borderedProminent)
                }
            }

            if claudeManager.isClaudeCodeConnected {
                Text("🎉 Premium features unlocked! Enjoy Tesla/SpaceX-grade development tools.")
                    .font(.caption)
                    .foregroundColor(.green)
                    .padding(.top, 4)
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(12)
    }
}

struct ClaudeCodeFeaturesSection: View {
    @EnvironmentObject private var claudeManager: ClaudeCodeManager

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Premium Features")
                .font(.title2)
                .fontWeight(.semibold)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 12) {
                ForEach(claudeManager.claudeCodeFeatures, id: \.name) { feature in
                    ClaudeCodeFeatureCard(feature: feature)
                }
            }
        }
    }
}

struct ClaudeCodeFeatureCard: View {
    let feature: ClaudeCodeFeature
    @EnvironmentObject private var claudeManager: ClaudeCodeManager

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: feature.icon)
                    .font(.title3)
                    .foregroundColor(.blue)

                Spacer()

                if feature.isPremium && claudeManager.isClaudeCodeConnected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                }
            }

            Text(feature.name)
                .font(.headline)
                .lineLimit(2)

            Text(feature.description)
                .font(.caption)
                .foregroundColor(.secondary)
                .lineLimit(3)
        }
        .padding()
        .background(claudeManager.isClaudeCodeConnected ? .blue.opacity(0.1) : .gray.opacity(0.1))
        .cornerRadius(8)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(claudeManager.isClaudeCodeConnected ? .blue : .gray, lineWidth: 1)
        )
    }
}

struct CustomGPTsSection: View {
    @EnvironmentObject private var claudeManager: ClaudeCodeManager

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Custom GPT Specialists")
                .font(.title2)
                .fontWeight(.semibold)

            ForEach(GPTCategory.allCases, id: \.self) { category in
                CustomGPTCategorySection(category: category)
            }
        }
    }
}

struct CustomGPTCategorySection: View {
    let category: GPTCategory
    @EnvironmentObject private var claudeManager: ClaudeCodeManager

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(category.title)
                .font(.headline)

            let gpts = claudeManager.customGPTs.filter { $0.category == category }
            ForEach(gpts) { gpt in
                CustomGPTCard(gpt: gpt)
            }
        }
    }
}

struct CustomGPTCard: View {
    let gpt: CustomGPT
    @EnvironmentObject private var claudeManager: ClaudeCodeManager

    var body: some View {
        HStack {
            Image(systemName: gpt.icon)
                .font(.title2)
                .foregroundColor(.blue)
                .frame(width: 40)

            VStack(alignment: .leading, spacing: 4) {
                Text(gpt.name)
                    .font(.subheadline)
                    .fontWeight(.semibold)

                Text(gpt.description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(2)

                HStack {
                    ForEach(gpt.capabilities.prefix(2), id: \.self) { capability in
                        Text(capability)
                            .font(.caption2)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(.blue.opacity(0.2))
                            .foregroundColor(.blue)
                            .cornerRadius(4)
                    }
                }
            }

            Spacer()

            Button("Chat") {
                // Open custom GPT chat
            }
            .buttonStyle(.bordered)
            .disabled(!claudeManager.isClaudeCodeConnected)
        }
        .padding(.vertical, 8)
    }
}

struct CodeQualityDashboard: View {
    @EnvironmentObject private var claudeManager: ClaudeCodeManager

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Code Quality Dashboard")
                .font(.title2)
                .fontWeight(.semibold)

            if let metrics = claudeManager.codeQualityMetrics {
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 12) {
                    QualityMetricCard(title: "Overall Score", value: metrics.overallScore, format: .percentage)
                    QualityMetricCard(title: "Security Score", value: metrics.securityScore, format: .percentage)
                    QualityMetricCard(title: "Test Coverage", value: metrics.testCoverage, format: .percentage)
                    QualityMetricCard(title: "Maintainability", value: metrics.maintainabilityIndex, format: .score)
                    QualityMetricCard(title: "Performance", value: metrics.performanceScore, format: .percentage)
                    QualityMetricCard(title: "Tech Debt", value: metrics.technicalDebt / 3600, format: .hours)
                }
            }
        }
    }
}

struct QualityMetricCard: View {
    let title: String
    let value: Double
    let format: MetricFormat

    var body: some View {
        VStack(spacing: 8) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)

            Text(formattedValue)
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(color)
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(8)
    }

    private var formattedValue: String {
        switch format {
        case .percentage:
            return "\(Int(value * 100))%"
        case .score:
            return String(format: "%.1f", value)
        case .hours:
            return "\(Int(value))h"
        }
    }

    private var color: Color {
        switch format {
        case .percentage, .score:
            return value > 0.8 ? .green : value > 0.6 ? .orange : .red
        case .hours:
            return value < 10 ? .green : value < 50 ? .orange : .red
        }
    }
}

enum MetricFormat {
    case percentage, score, hours
}

#Preview {
    ClaudeCodeDashboard()
        .environmentObject(ClaudeCodeManager())
}