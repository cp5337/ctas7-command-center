import SwiftUI

// MARK: - Periodic Table View for Primitives/Elements
// Context-agnostic: Can display PLC primitives, cognitive atoms, or any categorized elements

/// A single element/primitive card in the periodic table
struct ElementCard: Identifiable {
    let id: String
    let symbol: String          // "PID" or "B₁" or "HTTP"
    let name: String            // "PID Controller" or "Source Node" or "HTTP Get"
    let category: ElementCategory
    let icon: String            // SF Symbol
    let description: String
    let metadata: [String: String]
}

enum ElementCategory: String, CaseIterable {
    case control = "Control"
    case sensor = "Sensor"
    case actuator = "Actuator"
    case logic = "Logic"
    case communication = "Comm"
    case safety = "Safety"
    case monitoring = "Monitor"
    case utility = "Utility"
    
    var color: Color {
        switch self {
        case .control: return Color(hex: "#0A84FF")      // Blue
        case .sensor: return Color(hex: "#30D158")       // Green
        case .actuator: return Color(hex: "#FF453A")     // Red
        case .logic: return Color(hex: "#FFD60A")        // Yellow
        case .communication: return Color(hex: "#64D2FF") // Cyan
        case .safety: return Color(hex: "#FF9F0A")       // Orange
        case .monitoring: return Color(hex: "#BF5AF2")   // Purple
        case .utility: return Color(hex: "#8E8E93")      // Gray
        }
    }
}

/// Main periodic table view
struct PeriodicTableView: View {
    let elements: [ElementCard]
    let onElementTap: (ElementCard) -> Void
    let onElementDragStart: (ElementCard) -> Void
    
    @State private var selectedCategory: ElementCategory? = nil
    @State private var searchText: String = ""
    
    private var filteredElements: [ElementCard] {
        var result = elements
        
        if let category = selectedCategory {
            result = result.filter { $0.category == category }
        }
        
        if !searchText.isEmpty {
            result = result.filter { element in
                element.name.localizedCaseInsensitiveContains(searchText) ||
                element.symbol.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        return result
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Header with search
            VStack(spacing: 12) {
                Text("Primitive Library")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                // Search bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(Color(hex: "#8E8E93"))
                    
                    TextField("Search primitives...", text: $searchText)
                        .foregroundColor(.white)
                        .autocapitalization(.none)
                    
                    if !searchText.isEmpty {
                        Button(action: { searchText = "" }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(Color(hex: "#8E8E93"))
                        }
                    }
                }
                .padding(12)
                .background(Color(hex: "#1C1C1E"))
                .cornerRadius(10)
                
                // Category filter chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(ElementCategory.allCases, id: \.self) { category in
                            CategoryChip(
                                category: category,
                                isSelected: selectedCategory == category,
                                onTap: {
                                    selectedCategory = (selectedCategory == category) ? nil : category
                                }
                            )
                        }
                    }
                }
            }
            .padding(16)
            .background(Color.black)
            
            // Periodic table grid
            ScrollView {
                LazyVGrid(
                    columns: [
                        GridItem(.adaptive(minimum: 100, maximum: 120), spacing: 12)
                    ],
                    spacing: 12
                ) {
                    ForEach(filteredElements) { element in
                        ElementTile(element: element)
                            .onTapGesture {
                                onElementTap(element)
                            }
                            .onDrag {
                                onElementDragStart(element)
                                return NSItemProvider(object: element.id as NSString)
                            }
                    }
                }
                .padding(16)
            }
            .background(Color.black)
        }
    }
}

/// Category filter chip
struct CategoryChip: View {
    let category: ElementCategory
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Text(category.rawValue)
            .font(.system(size: 14, weight: .semibold))
            .foregroundColor(isSelected ? .white : category.color)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                isSelected ? category.color : category.color.opacity(0.2)
            )
            .cornerRadius(16)
            .onTapGesture(perform: onTap)
    }
}

/// Individual element tile (like periodic table element)
struct ElementTile: View {
    let element: ElementCard
    @State private var isPressed: Bool = false
    
    var body: some View {
        VStack(spacing: 4) {
            // Symbol (large, centered)
            Text(element.symbol)
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(1)
                .minimumScaleFactor(0.5)
            
            // Name (small, below symbol)
            Text(element.name)
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(Color(hex: "#8E8E93"))
                .lineLimit(2)
                .multilineTextAlignment(.center)
                .minimumScaleFactor(0.8)
            
            // Icon (small, at bottom)
            Image(systemName: element.icon)
                .font(.system(size: 12))
                .foregroundColor(element.category.color)
        }
        .frame(width: 100, height: 100)
        .padding(8)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(element.category.color.opacity(isPressed ? 0.3 : 0.2))
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(element.category.color, lineWidth: isPressed ? 3 : 1)
                )
        )
        .scaleEffect(isPressed ? 0.95 : 1.0)
        .animation(.spring(response: 0.3), value: isPressed)
        .gesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in isPressed = true }
                .onEnded { _ in isPressed = false }
        )
    }
}

// MARK: - Example Usage

struct PeriodicTableView_Example: View {
    @State private var selectedElement: ElementCard?
    
    // Example elements for Synaptix PLC
    let plcElements: [ElementCard] = [
        // Control Category
        ElementCard(
            id: "pid",
            symbol: "PID",
            name: "PID Controller",
            category: .control,
            icon: "slider.horizontal.3",
            description: "Proportional-Integral-Derivative feedback controller",
            metadata: ["type": "feedback", "latency": "<10ms"]
        ),
        ElementCard(
            id: "on_off",
            symbol: "ON/OFF",
            name: "On-Off Control",
            category: .control,
            icon: "power",
            description: "Simple binary control",
            metadata: ["type": "binary", "states": "2"]
        ),
        
        // Sensor Category
        ElementCard(
            id: "temp",
            symbol: "TEMP",
            name: "Temperature",
            category: .sensor,
            icon: "thermometer",
            description: "Temperature sensor input",
            metadata: ["unit": "°C", "range": "-40 to 125"]
        ),
        ElementCard(
            id: "pressure",
            symbol: "PSI",
            name: "Pressure",
            category: .sensor,
            icon: "gauge",
            description: "Pressure sensor input",
            metadata: ["unit": "PSI", "range": "0-100"]
        ),
        
        // Actuator Category
        ElementCard(
            id: "motor",
            symbol: "MTR",
            name: "Motor",
            category: .actuator,
            icon: "fan",
            description: "Electric motor control",
            metadata: ["power": "3-phase", "speed": "variable"]
        ),
        ElementCard(
            id: "valve",
            symbol: "VLV",
            name: "Valve",
            category: .actuator,
            icon: "valve.fill",
            description: "Flow control valve",
            metadata: ["type": "proportional", "range": "0-100%"]
        ),
        
        // Logic Category
        ElementCard(
            id: "and",
            symbol: "AND",
            name: "Logic AND",
            category: .logic,
            icon: "arrow.triangle.merge",
            description: "Boolean AND gate",
            metadata: ["inputs": "2+", "output": "boolean"]
        ),
        ElementCard(
            id: "timer",
            symbol: "TMR",
            name: "Timer",
            category: .logic,
            icon: "timer",
            description: "Delay/pulse timer",
            metadata: ["mode": "on-delay, off-delay", "range": "0-999s"]
        ),
        
        // Communication Category
        ElementCard(
            id: "modbus",
            symbol: "MDB",
            name: "Modbus TCP",
            category: .communication,
            icon: "network",
            description: "Modbus TCP/IP protocol",
            metadata: ["protocol": "TCP", "port": "502"]
        ),
        
        // Safety Category
        ElementCard(
            id: "estop",
            symbol: "E-STOP",
            name: "Emergency Stop",
            category: .safety,
            icon: "exclamationmark.octagon.fill",
            description: "Emergency shutdown",
            metadata: ["priority": "highest", "latency": "<1ms"]
        ),
        ElementCard(
            id: "geofence",
            symbol: "GEO",
            name: "Geofence",
            category: .safety,
            icon: "location.circle",
            description: "Geographic boundary check",
            metadata: ["type": "circular", "trigger": "exit/enter"]
        ),
        
        // Monitoring Category
        ElementCard(
            id: "alarm",
            symbol: "ALRM",
            name: "Alarm",
            category: .monitoring,
            icon: "bell.fill",
            description: "Condition monitoring alarm",
            metadata: ["levels": "warning, critical", "log": "enabled"]
        ),
        ElementCard(
            id: "logger",
            symbol: "LOG",
            name: "Data Logger",
            category: .monitoring,
            icon: "chart.xyaxis.line",
            description: "Time-series data logging",
            metadata: ["storage": "Sled KVS", "rate": "configurable"]
        ),
        
        // Utility Category
        ElementCard(
            id: "math",
            symbol: "f(x)",
            name: "Math Function",
            category: .utility,
            icon: "function",
            description: "Mathematical operation",
            metadata: ["ops": "+, -, *, /, √, ^", "precision": "f64"]
        ),
    ]
    
    var body: some View {
        NavigationView {
            PeriodicTableView(
                elements: plcElements,
                onElementTap: { element in
                    selectedElement = element
                },
                onElementDragStart: { element in
                    print("🎯 Drag started: \(element.name)")
                }
            )
            .sheet(item: $selectedElement) { element in
                ElementDetailSheet(element: element)
            }
        }
    }
}

/// Detail sheet when element is tapped
struct ElementDetailSheet: View {
    let element: ElementCard
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Large symbol
                    HStack {
                        Spacer()
                        VStack {
                            Text(element.symbol)
                                .font(.system(size: 64, weight: .bold))
                                .foregroundColor(.white)
                            
                            Image(systemName: element.icon)
                                .font(.system(size: 48))
                                .foregroundColor(element.category.color)
                        }
                        Spacer()
                    }
                    .padding(.vertical, 20)
                    .background(element.category.color.opacity(0.2))
                    .cornerRadius(12)
                    
                    // Name and category
                    VStack(alignment: .leading, spacing: 8) {
                        Text(element.name)
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)
                        
                        HStack {
                            Text(element.category.rawValue)
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(element.category.color)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(element.category.color.opacity(0.2))
                                .cornerRadius(16)
                        }
                    }
                    
                    // Description
                    Text(element.description)
                        .font(.body)
                        .foregroundColor(Color(hex: "#8E8E93"))
                    
                    // Metadata
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Properties")
                            .font(.headline)
                            .foregroundColor(.white)
                        
                        ForEach(Array(element.metadata.keys.sorted()), id: \.self) { key in
                            HStack {
                                Text(key.capitalized + ":")
                                    .foregroundColor(Color(hex: "#8E8E93"))
                                Spacer()
                                Text(element.metadata[key] ?? "")
                                    .foregroundColor(.white)
                                    .fontWeight(.semibold)
                            }
                            .padding()
                            .background(Color(hex: "#1C1C1E"))
                            .cornerRadius(8)
                        }
                    }
                    
                    // Add to canvas button
                    Button(action: {
                        print("➕ Add \(element.name) to canvas")
                        dismiss()
                    }) {
                        HStack {
                            Image(systemName: "plus.circle.fill")
                            Text("Add to Canvas")
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(element.category.color)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                }
                .padding()
            }
            .background(Color.black)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(Color(hex: "#0A84FF"))
                }
            }
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
            (a, r, g, b) = (255, 0, 0, 0)
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

#Preview {
    PeriodicTableView_Example()
}




