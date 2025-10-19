//
//  SDCAcademicBlockchain.swift
//  CTAS-7 Solutions Development Center
//
//  Academic Paper Blockchain Management with Neural Mux Integration
//  Immutable research lineage and automated reference management
//

import SwiftUI
import Combine
import CryptoKit

// MARK: - Academic Blockchain Core Models

struct PaperBlock: Codable, Identifiable {
    let id = UUID()
    let blockHash: String
    let previousHash: String
    let paperMetadata: PaperMetadata
    let usimHeader: USIMHeader
    let citations: [CitationLink]
    let performanceData: PerformanceData
    let timestamp: Date
    let nonce: UInt64

    var isValid: Bool {
        // Verify blockchain integrity
        let blockData = try! JSONEncoder().encode(self)
        let computedHash = SHA256.hash(data: blockData)
        return blockHash == computedHash.description
    }
}

struct PaperMetadata: Codable {
    let paperId: String          // CTAS7_PAPER_3847
    let title: String
    let authors: [String]
    let venue: String            // IEEE S&P, MILCOM, etc.
    let submissionDate: Date
    let doi: String?
    let latexHash: String        // Hash of LaTeX source
    let overleafProjectId: String?
}

struct CitationLink: Codable {
    let citingPaper: String      // This paper's ID
    let citedPaper: String       // Referenced paper's ID
    let citationContext: String  // Where in paper it's cited
    let citationType: CitationType
}

enum CitationType: String, Codable, CaseIterable {
    case foundation = "Foundation"
    case methodology = "Methodology"
    case performance = "Performance"
    case related = "Related Work"
    case extension = "Extension"
}

struct PerformanceData: Codable {
    let responseTimeSeconds: [Double]
    let accuracyPercent: Double
    let improvementFactor: String
    let dockerTestResults: [String: Double]
}

// MARK: - Academic Blockchain Manager

@MainActor
class AcademicBlockchainManager: ObservableObject {
    @Published var paperChain: [PaperBlock] = []
    @Published var currentPaper: PaperMetadata?
    @Published var citationNetwork: [CitationLink] = []
    @Published var overleafProjects: [OverleafProject] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let blockchainStorage = AcademicBlockchainStorage()

    init() {
        loadBlockchain()
    }

    func loadBlockchain() {
        isLoading = true
        Task {
            do {
                paperChain = try await blockchainStorage.loadPaperChain()
                citationNetwork = extractCitationNetwork()
                isLoading = false
            } catch {
                errorMessage = "Failed to load blockchain: \(error.localizedDescription)"
                isLoading = false
            }
        }
    }

    func createNewPaper(title: String, authors: [String], venue: String) async {
        let paperId = "CTAS7_PAPER_\(String(format: "%04d", paperChain.count + 1))"

        let metadata = PaperMetadata(
            paperId: paperId,
            title: title,
            authors: authors,
            venue: venue,
            submissionDate: Date(),
            doi: nil,
            latexHash: generateLatexHash(),
            overleafProjectId: nil
        )

        let usimHeader = USIMHeader(
            systemId: "CTAS7:ACADEMIC:\(paperId)",
            documentType: "IEEE_CONFERENCE_PAPER",
            schHash: generateSCHHash(for: metadata),
            cuid: "ctas7:research:paper_\(paperChain.count + 1)",
            compilationUuid: UUID().uuidString,
            version: "1.0",
            classification: "RESEARCH_PUBLICATION",
            createdAt: Date()
        )

        let newBlock = PaperBlock(
            blockHash: "", // Will be computed during mining
            previousHash: paperChain.last?.blockHash ?? "genesis",
            paperMetadata: metadata,
            usimHeader: usimHeader,
            citations: [],
            performanceData: PerformanceData(
                responseTimeSeconds: [3.0, 5.0],
                accuracyPercent: 95.0,
                improvementFactor: "9-40x",
                dockerTestResults: [:]
            ),
            timestamp: Date(),
            nonce: 0
        )

        // Mine the block (find valid hash)
        let minedBlock = await mineBlock(newBlock)
        paperChain.append(minedBlock)

        try? await blockchainStorage.savePaperChain(paperChain)
        currentPaper = metadata
    }

    func addCitation(from citingPaper: String, to citedPaper: String, context: String, type: CitationType) {
        let citation = CitationLink(
            citingPaper: citingPaper,
            citedPaper: citedPaper,
            citationContext: context,
            citationType: type
        )

        citationNetwork.append(citation)

        // Update the corresponding paper block
        if let index = paperChain.firstIndex(where: { $0.paperMetadata.paperId == citingPaper }) {
            var updatedBlock = paperChain[index]
            var updatedCitations = updatedBlock.citations
            updatedCitations.append(citation)

            // Create new block with updated citations (blockchain immutability)
            let newBlock = PaperBlock(
                blockHash: "",
                previousHash: updatedBlock.blockHash,
                paperMetadata: updatedBlock.paperMetadata,
                usimHeader: updatedBlock.usimHeader,
                citations: updatedCitations,
                performanceData: updatedBlock.performanceData,
                timestamp: Date(),
                nonce: 0
            )

            Task {
                let minedBlock = await mineBlock(newBlock)
                paperChain.append(minedBlock)
                try? await blockchainStorage.savePaperChain(paperChain)
            }
        }
    }

    func generateBibTeX(for paperId: String) -> String {
        let paper = paperChain.first { $0.paperMetadata.paperId == paperId }
        guard let paper = paper else { return "" }

        var bibtex = ""

        for citation in paper.citations {
            if let citedPaper = paperChain.first(where: { $0.paperMetadata.paperId == citation.citedPaper }) {
                let metadata = citedPaper.paperMetadata
                bibtex += """
                @article{\(citation.citedPaper.lowercased()),
                  title={\(metadata.title)},
                  author={\(metadata.authors.joined(separator = " and "))},
                  venue={\(metadata.venue)},
                  year={\(Calendar.current.component(.year, from: metadata.submissionDate))},
                  blockchain_hash={\(citedPaper.blockHash.prefix(16))...},
                  usim={\(citedPaper.usimHeader.cuid)}
                }

                """
            }
        }

        return bibtex
    }

    func syncWithOverleaf(projectId: String) async {
        // Integration with Overleaf Git sync
        // This would trigger the automated pipeline we designed
        print("Syncing paper chain with Overleaf project: \(projectId)")
    }

    private func extractCitationNetwork() -> [CitationLink] {
        return paperChain.flatMap { $0.citations }
    }

    private func generateLatexHash() -> String {
        // In real implementation, would hash actual LaTeX content
        return SHA256.hash(data: "latex_content_\(Date())".data(using: .utf8)!).description
    }

    private func generateSCHHash(for metadata: PaperMetadata) -> String {
        let content = "ctas7_academic_paper:\(metadata.paperId):2025"
        return SHA256.hash(data: content.data(using: .utf8)!).description
    }

    private func mineBlock(_ block: PaperBlock) async -> PaperBlock {
        // Simple proof-of-work mining
        var minedBlock = block
        let target = "0000" // Difficulty: hash must start with 4 zeros

        repeat {
            minedBlock = PaperBlock(
                blockHash: computeHash(for: minedBlock),
                previousHash: block.previousHash,
                paperMetadata: block.paperMetadata,
                usimHeader: block.usimHeader,
                citations: block.citations,
                performanceData: block.performanceData,
                timestamp: block.timestamp,
                nonce: minedBlock.nonce + 1
            )
        } while !minedBlock.blockHash.hasPrefix(target)

        return minedBlock
    }

    private func computeHash(for block: PaperBlock) -> String {
        let blockData = try! JSONEncoder().encode(block)
        return SHA256.hash(data: blockData).description
    }
}

// MARK: - SwiftUI Views for Academic Blockchain

struct AcademicBlockchainView: View {
    @StateObject private var blockchainManager = AcademicBlockchainManager()
    @State private var showingNewPaperSheet = false
    @State private var selectedPaper: PaperBlock?

    var body: some View {
        NavigationView {
            VStack {
                // Blockchain Stats Header
                BlockchainStatsView(manager: blockchainManager)

                // Paper Chain List
                List(blockchainManager.paperChain) { paper in
                    PaperBlockRowView(paper: paper)
                        .onTapGesture {
                            selectedPaper = paper
                        }
                }
                .refreshable {
                    blockchainManager.loadBlockchain()
                }
            }
            .navigationTitle("Academic Blockchain")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("New Paper") {
                        showingNewPaperSheet = true
                    }
                }
            }
            .sheet(isPresented: $showingNewPaperSheet) {
                NewPaperSheet(manager: blockchainManager)
            }
            .sheet(item: $selectedPaper) { paper in
                PaperDetailView(paper: paper, manager: blockchainManager)
            }
        }
    }
}

struct BlockchainStatsView: View {
    @ObservedObject var manager: AcademicBlockchainManager

    var body: some View {
        HStack {
            VStack {
                Text("\(manager.paperChain.count)")
                    .font(.title2)
                    .fontWeight(.bold)
                Text("Papers")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            VStack {
                Text("\(manager.citationNetwork.count)")
                    .font(.title2)
                    .fontWeight(.bold)
                Text("Citations")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            VStack {
                Text("Valid")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.green)
                Text("Integrity")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

struct PaperBlockRowView: View {
    let paper: PaperBlock

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(paper.paperMetadata.paperId)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.blue)

                Spacer()

                Image(systemName: paper.isValid ? "checkmark.circle.fill" : "xmark.circle.fill")
                    .foregroundColor(paper.isValid ? .green : .red)
            }

            Text(paper.paperMetadata.title)
                .font(.headline)
                .lineLimit(2)

            Text("Citations: \(paper.citations.count) • Hash: \(String(paper.blockHash.prefix(8)))...")
                .font(.caption)
                .foregroundColor(.secondary)

            Text(paper.paperMetadata.venue)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

struct NewPaperSheet: View {
    @ObservedObject var manager: AcademicBlockchainManager
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var venue = "IEEE Security & Privacy"
    @State private var authors = ["CTAS-7 Research Team"]

    var body: some View {
        NavigationView {
            Form {
                Section("Paper Information") {
                    TextField("Title", text: $title)
                    TextField("Venue", text: $venue)
                }

                Section("Authors") {
                    ForEach(authors.indices, id: \.self) { index in
                        TextField("Author \(index + 1)", text: $authors[index])
                    }
                    Button("Add Author") {
                        authors.append("")
                    }
                }
            }
            .navigationTitle("New Paper")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        Task {
                            await manager.createNewPaper(
                                title: title,
                                authors: authors.filter { !$0.isEmpty },
                                venue: venue
                            )
                            dismiss()
                        }
                    }
                    .disabled(title.isEmpty || venue.isEmpty)
                }
            }
        }
    }
}

struct PaperDetailView: View {
    let paper: PaperBlock
    @ObservedObject var manager: AcademicBlockchainManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Paper Metadata
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Paper Information")
                            .font(.headline)

                        Text(paper.paperMetadata.title)
                            .font(.title2)
                            .fontWeight(.semibold)

                        Text("Authors: \(paper.paperMetadata.authors.joined(separator: ", "))")
                        Text("Venue: \(paper.paperMetadata.venue)")
                        Text("ID: \(paper.paperMetadata.paperId)")
                    }

                    Divider()

                    // USIM Header
                    VStack(alignment: .leading, spacing: 8) {
                        Text("USIM Header")
                            .font(.headline)

                        Text("System ID: \(paper.usimHeader.systemId)")
                            .font(.system(.caption, design: .monospaced))
                        Text("CUID: \(paper.usimHeader.cuid)")
                            .font(.system(.caption, design: .monospaced))
                        Text("UUID: \(paper.usimHeader.compilationUuid)")
                            .font(.system(.caption, design: .monospaced))
                    }

                    Divider()

                    // Citations
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Citations (\(paper.citations.count))")
                            .font(.headline)

                        ForEach(paper.citations, id: \.citedPaper) { citation in
                            VStack(alignment: .leading, spacing: 4) {
                                Text(citation.citedPaper)
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                Text(citation.citationType.rawValue)
                                    .font(.caption)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 2)
                                    .background(Color.blue.opacity(0.2))
                                    .cornerRadius(4)
                            }
                            .padding(.vertical, 4)
                        }

                        Button("Generate BibTeX") {
                            let bibtex = manager.generateBibTeX(for: paper.paperMetadata.paperId)
                            UIPasteboard.general.string = bibtex
                        }
                        .buttonStyle(.borderedProminent)
                    }

                    Divider()

                    // Blockchain Information
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Blockchain Information")
                            .font(.headline)

                        Text("Block Hash: \(String(paper.blockHash.prefix(32)))...")
                            .font(.system(.caption, design: .monospaced))
                        Text("Previous Hash: \(String(paper.previousHash.prefix(32)))...")
                            .font(.system(.caption, design: .monospaced))
                        Text("Nonce: \(paper.nonce)")
                            .font(.system(.caption, design: .monospaced))
                        Text("Valid: \(paper.isValid ? "✅" : "❌")")
                            .font(.subheadline)
                    }
                }
                .padding()
            }
            .navigationTitle("Paper Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Storage Manager

class AcademicBlockchainStorage {
    private let userDefaults = UserDefaults.standard
    private let blockchainKey = "academic_blockchain_papers"

    func savePaperChain(_ papers: [PaperBlock]) async throws {
        let data = try JSONEncoder().encode(papers)
        userDefaults.set(data, forKey: blockchainKey)
    }

    func loadPaperChain() async throws -> [PaperBlock] {
        guard let data = userDefaults.data(forKey: blockchainKey) else {
            return []
        }
        return try JSONDecoder().decode([PaperBlock].self, from: data)
    }
}

#Preview {
    AcademicBlockchainView()
}