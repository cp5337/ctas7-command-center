import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            // Agent Productivity
            NavigationView {
                AgentProductivityWidget()
                    .navigationTitle("Agent Productivity")
            }
            .tabItem {
                Label("Agents", systemImage: "person.3.fill")
            }
            
            // Voice Interface Preview
            NavigationView {
                VoiceInterfacePreview()
                    .navigationTitle("Voice Assistant")
            }
            .tabItem {
                Label("Voice", systemImage: "mic.fill")
            }
            
            // Code Quality
            NavigationView {
                CodeQualityPreview()
                    .navigationTitle("Code Quality")
            }
            .tabItem {
                Label("Quality", systemImage: "checkmark.seal.fill")
            }
        }
    }
}

// Preview for Voice Interface (simplified)
struct VoiceInterfacePreview: View {
    @State private var isListening = false
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Voice Assistant Preview")
                .font(.title2)
                .fontWeight(.bold)
            
            // Simplified voice visualizer
            Circle()
                .fill(isListening ? Color.red : Color.blue)
                .frame(width: 100, height: 100)
                .scaleEffect(isListening ? 1.2 : 1.0)
                .animation(.easeInOut(duration: 0.6).repeatForever(autoreverses: true), value: isListening)
                .overlay(
                    Image(systemName: "mic.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.white)
                )
            
            Text(isListening ? "Listening..." : "Tap to speak")
                .font(.headline)
                .foregroundColor(isListening ? .red : .blue)
            
            Button(action: {
                isListening.toggle()
            }) {
                Text(isListening ? "Stop" : "Start Voice")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(isListening ? Color.red : Color.blue)
                    .cornerRadius(12)
            }
            .padding(.horizontal)
            
            Text("Full voice interface available in VoiceConversationInterface.swift")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding()
        }
        .padding()
    }
}

// Preview for Code Quality (simplified)
struct CodeQualityPreview: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                VStack(spacing: 12) {
                    Image(systemName: "building.columns")
                        .font(.system(size: 50))
                        .foregroundColor(.blue)
                    
                    Text("CTAS Archaeological Code Standard™")
                        .font(.title2)
                        .fontWeight(.bold)
                        .multilineTextAlignment(.center)
                    
                    Text("Military-grade software craftsmanship")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(.ultraThinMaterial)
                .cornerRadius(16)
                
                // Rating Card
                VStack(spacing: 16) {
                    HStack {
                        Image(systemName: "crown.fill")
                            .font(.title)
                            .foregroundColor(.purple)
                        
                        VStack(alignment: .leading) {
                            Text("CTAS Rating: Artifact")
                                .font(.headline)
                            
                            Text("Museum-quality code")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        Text("94")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundColor(.purple)
                    }
                    
                    // Three Pillars
                    VStack(spacing: 8) {
                        PillarRow(title: "Preservation", score: 92, icon: "shield.fill")
                        PillarRow(title: "Documentation", score: 95, icon: "doc.text.fill")
                        PillarRow(title: "Analysis", score: 96, icon: "chart.bar.fill")
                    }
                }
                .padding()
                .background(.ultraThinMaterial)
                .cornerRadius(16)
                
                Text("Full quality dashboard available in CTASCodeStandard.swift")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding()
            }
            .padding()
        }
    }
}

struct PillarRow: View {
    let title: String
    let score: Int
    let icon: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.blue)
                .frame(width: 20)
            
            Text(title)
                .font(.subheadline)
            
            Spacer()
            
            Text("\(score)")
                .font(.subheadline)
                .fontWeight(.semibold)
            
            ProgressView(value: Double(score) / 100.0)
                .frame(width: 60)
                .tint(.blue)
        }
    }
}

