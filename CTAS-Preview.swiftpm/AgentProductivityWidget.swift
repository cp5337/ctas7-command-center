import SwiftUI
import Foundation

struct AgentProductivity: Identifiable {
    let id = UUID()
    let name: String
    let symbol: String // UTF8 character
    let color: Color
    var locToday: Int
    var locThisHour: Int
    var lastPushMinutes: Int
    var codeNestingLevel: Double
    var trend: ProductivityTrend
}

enum ProductivityTrend: CaseIterable {
    case up, down, stable

    var arrow: String {
        switch self {
        case .up: return "↗"
        case .down: return "↘"
        case .stable: return "→"
        }
    }

    var color: Color {
        switch self {
        case .up: return .green
        case .down: return .red
        case .stable: return .gray
        }
    }
}

struct AgentProductivityWidget: View {
    @State private var agents: [AgentProductivity] = [
        AgentProductivity(
            name: "Claude",
            symbol: "⚡",
            color: .blue,
            locToday: 1247,
            locThisHour: 89,
            lastPushMinutes: 23,
            codeNestingLevel: 3.2,
            trend: .up
        ),
        AgentProductivity(
            name: "Copilot",
            symbol: "🚀",
            color: .purple,
            locToday: 892,
            locThisHour: 156,
            lastPushMinutes: 7,
            codeNestingLevel: 4.8,
            trend: .up
        ),
        AgentProductivity(
            name: "Cursor",
            symbol: "🎯",
            color: .green,
            locToday: 1456,
            locThisHour: 203,
            lastPushMinutes: 45,
            codeNestingLevel: 2.9,
            trend: .stable
        ),
        AgentProductivity(
            name: "Codeium",
            symbol: "💎",
            color: .cyan,
            locToday: 678,
            locThisHour: 67,
            lastPushMinutes: 12,
            codeNestingLevel: 3.7,
            trend: .down
        )
    ]

    @State private var timer: Timer?

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            HStack {
                Image(systemName: "laptopcomputer")
                    .foregroundColor(.cyan)
                Text("Agent Productivity")
                    .font(.headline)
                    .foregroundColor(.primary)
                Spacer()
                Text("Live Tracking")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            // Agent Grid
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 12) {
                ForEach(agents) { agent in
                    AgentCard(agent: agent)
                }
            }

            // Summary Stats
            VStack {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(height: 1)

                HStack {
                    VStack {
                        Text("\(totalLOCToday)")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.cyan)
                        Text("Total LOC Today")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    VStack {
                        Text("\(totalLOCThisHour)")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.green)
                        Text("This Hour")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    VStack {
                        Text(String(format: "%.1f", averageNesting))
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.yellow)
                        Text("Avg Nesting")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.top, 8)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .onAppear {
            startTimer()
        }
        .onDisappear {
            timer?.invalidate()
        }
    }

    private var totalLOCToday: Int {
        agents.reduce(0) { $0 + $1.locToday }
    }

    private var totalLOCThisHour: Int {
        agents.reduce(0) { $0 + $1.locThisHour }
    }

    private var averageNesting: Double {
        agents.reduce(0) { $0 + $1.codeNestingLevel } / Double(agents.count)
    }

    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 30.0, repeats: true) { _ in
            updateAgentData()
        }
    }

    private func updateAgentData() {
        for i in agents.indices {
            agents[i].locThisHour = max(0, agents[i].locThisHour + Int.random(in: -5...20))
            agents[i].locToday += Int.random(in: 0...10)
            agents[i].lastPushMinutes += 1
            agents[i].codeNestingLevel = max(1.0, min(10.0, agents[i].codeNestingLevel + Double.random(in: -0.5...0.5)))

            if Bool.random() && Double.random() > 0.7 {
                agents[i].trend = ProductivityTrend.allCases.randomElement() ?? .stable
            }
        }
    }
}

struct AgentCard: View {
    let agent: AgentProductivity
    @State private var showTooltip = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Agent Header
            HStack {
                Text(agent.symbol)
                    .font(.title2)
                Text(agent.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(agent.color)
                Spacer()
                Text(agent.trend.arrow)
                    .font(.caption)
                    .foregroundColor(agent.trend.color)
            }

            // Quick Stats
            VStack(spacing: 4) {
                StatRow(label: "Today", value: "\(agent.locToday.formatted()) LOC", color: .primary)
                StatRow(label: "This hour", value: "\(agent.locThisHour) LOC", color: .cyan)
                StatRow(label: "Last push", value: formatLastPush(agent.lastPushMinutes), color: .green)
                StatRow(label: "Nesting", value: String(format: "%.1f", agent.codeNestingLevel), color: nestingColor(agent.codeNestingLevel))
            }
        }
        .padding(12)
        .background(Color(.systemGray5))
        .cornerRadius(8)
        .onTapGesture {
            showTooltip.toggle()
        }
        .popover(isPresented: $showTooltip) {
            AgentTooltip(agent: agent)
        }
    }

    private func nestingColor(_ level: Double) -> Color {
        if level < 3.0 { return .green }
        if level < 5.0 { return .yellow }
        return .red
    }

    private func formatLastPush(_ minutes: Int) -> String {
        if minutes < 60 { return "\(minutes)m" }
        if minutes < 1440 { return "\(minutes / 60)h" }
        return "\(minutes / 1440)d"
    }
}

struct StatRow: View {
    let label: String
    let value: String
    let color: Color

    var body: some View {
        HStack {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(color)
        }
    }
}

struct AgentTooltip: View {
    let agent: AgentProductivity

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("\(agent.name) Productivity")
                .font(.headline)
                .fontWeight(.bold)

            Group {
                Text("Lines written today: **\(agent.locToday.formatted())**")
                Text("Current hour: **\(agent.locThisHour)** LOC")
                Text("Last git push: **\(formatLastPush(agent.lastPushMinutes))** ago")
                Text("Code nesting level: **\(String(format: "%.2f", agent.codeNestingLevel))**")
                Text("Trend: **\(agent.trend.arrow) \(String(describing: agent.trend))**")
            }
            .font(.caption)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(8)
        .shadow(radius: 4)
    }

    private func formatLastPush(_ minutes: Int) -> String {
        if minutes < 60 { return "\(minutes)m" }
        if minutes < 1440 { return "\(minutes / 60)h" }
        return "\(minutes / 1440)d"
    }
}

#Preview {
    AgentProductivityWidget()
        .preferredColorScheme(.dark)
}