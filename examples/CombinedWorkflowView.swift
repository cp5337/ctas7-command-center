import SwiftUI

// MARK: - Combined Workflow View
// Periodic table sidebar + Canvas main area
// Perfect for iPad split view or iPhone modal presentation

struct CombinedWorkflowView: View {
    @StateObject private var workflowState = WorkflowState()
    @State private var showElementLibrary: Bool = false
    @State private var selectedView: ViewMode = .canvas
    
    enum ViewMode {
        case library, canvas, split
    }
    
    var body: some View {
        GeometryReader { geometry in
            if geometry.size.width > 768 {
                // iPad: Split view (library + canvas)
                iPadSplitView
            } else {
                // iPhone: Tabbed view
                iPhoneTabbedView
            }
        }
        .background(Color.black)
    }
    
    // MARK: - iPad Split View
    
    private var iPadSplitView: some View {
        HStack(spacing: 0) {
            // Left sidebar: Periodic table library
            VStack(spacing: 0) {
                // Sidebar header
                HStack {
                    Text("Primitives")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Button(action: { 
                        withAnimation {
                            workflowState.isSidebarCollapsed.toggle()
                        }
                    }) {
                        Image(systemName: workflowState.isSidebarCollapsed ? "sidebar.left" : "sidebar.left.fill")
                            .foregroundColor(Color(hex: "#0A84FF"))
                    }
                }
                .padding()
                .background(Color(hex: "#1C1C1E"))
                
                if !workflowState.isSidebarCollapsed {
                    // Periodic table
                    PeriodicTableView(
                        elements: workflowState.availableElements,
                        onElementTap: { element in
                            workflowState.selectedElement = element
                        },
                        onElementDragStart: { element in
                            workflowState.draggingElement = element
                        }
                    )
                }
            }
            .frame(width: workflowState.isSidebarCollapsed ? 0 : 320)
            .background(Color.black)
            
            // Divider
            if !workflowState.isSidebarCollapsed {
                Divider()
                    .background(Color(hex: "#2C2C2E"))
            }
            
            // Right main area: Canvas
            VStack(spacing: 0) {
                // Canvas header
                HStack {
                    if !workflowState.isSidebarCollapsed {
                        Button(action: { 
                            withAnimation {
                                workflowState.isSidebarCollapsed = true
                            }
                        }) {
                            Image(systemName: "sidebar.left")
                                .foregroundColor(Color(hex: "#0A84FF"))
                        }
                    }
                    
                    Text(workflowState.workflowName)
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    // Canvas controls
                    HStack(spacing: 16) {
                        Button(action: { workflowState.zoomIn() }) {
                            Image(systemName: "plus.magnifyingglass")
                                .foregroundColor(Color(hex: "#0A84FF"))
                        }
                        
                        Button(action: { workflowState.zoomOut() }) {
                            Image(systemName: "minus.magnifyingglass")
                                .foregroundColor(Color(hex: "#0A84FF"))
                        }
                        
                        Button(action: { workflowState.resetView() }) {
                            Image(systemName: "arrow.counterclockwise")
                                .foregroundColor(Color(hex: "#0A84FF"))
                        }
                        
                        Divider()
                            .frame(height: 20)
                        
                        Button(action: { workflowState.deleteSelected() }) {
                            Image(systemName: "trash")
                                .foregroundColor(Color(hex: "#FF453A"))
                        }
                        
                        Button(action: { workflowState.executeWorkflow() }) {
                            Label("Execute", systemImage: "play.circle.fill")
                                .foregroundColor(Color(hex: "#30D158"))
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color(hex: "#30D158").opacity(0.2))
                                .cornerRadius(8)
                        }
                    }
                }
                .padding()
                .background(Color(hex: "#1C1C1E"))
                
                // Canvas
                CanvasArea(state: workflowState)
            }
        }
    }
    
    // MARK: - iPhone Tabbed View
    
    private var iPhoneTabbedView: some View {
        TabView(selection: $selectedView) {
            // Library tab
            NavigationView {
                PeriodicTableView(
                    elements: workflowState.availableElements,
                    onElementTap: { element in
                        workflowState.addNode(element: element, at: CGPoint(x: 200, y: 200))
                        selectedView = .canvas
                    },
                    onElementDragStart: { _ in }
                )
                .navigationTitle("Library")
                .navigationBarTitleDisplayMode(.inline)
            }
            .tabItem {
                Label("Library", systemImage: "square.grid.3x3.fill")
            }
            .tag(ViewMode.library)
            
            // Canvas tab
            VStack(spacing: 0) {
                // Compact header
                HStack {
                    Text(workflowState.workflowName)
                        .font(.headline)
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Button(action: { workflowState.executeWorkflow() }) {
                        Image(systemName: "play.circle.fill")
                            .foregroundColor(Color(hex: "#30D158"))
                    }
                    
                    Menu {
                        Button(action: { workflowState.zoomIn() }) {
                            Label("Zoom In", systemImage: "plus.magnifyingglass")
                        }
                        Button(action: { workflowState.zoomOut() }) {
                            Label("Zoom Out", systemImage: "minus.magnifyingglass")
                        }
                        Button(action: { workflowState.resetView() }) {
                            Label("Reset View", systemImage: "arrow.counterclockwise")
                        }
                        Divider()
                        Button(role: .destructive, action: { workflowState.deleteSelected() }) {
                            Label("Delete Selected", systemImage: "trash")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                            .foregroundColor(Color(hex: "#0A84FF"))
                    }
                }
                .padding()
                .background(Color(hex: "#1C1C1E"))
                
                CanvasArea(state: workflowState)
            }
            .tabItem {
                Label("Canvas", systemImage: "square.split.2x2")
            }
            .tag(ViewMode.canvas)
        }
    }
}

// MARK: - Workflow State Manager

class WorkflowState: ObservableObject {
    @Published var workflowName: String = "Untitled Workflow"
    @Published var nodes: [CanvasNode] = []
    @Published var connections: [CanvasConnection] = []
    @Published var selectedNodeId: String? = nil
    @Published var selectedElement: ElementCard? = nil
    @Published var draggingElement: ElementCard? = nil
    @Published var isSidebarCollapsed: Bool = false
    @Published var canvasScale: CGFloat = 1.0
    @Published var canvasOffset: CGSize = .zero
    
    // Available elements for this workflow
    @Published var availableElements: [ElementCard] = []
    
    init() {
        loadDefaultElements()
    }
    
    func loadDefaultElements() {
        // Load PLC primitives by default
        availableElements = [
            // Control
            ElementCard(id: "pid", symbol: "PID", name: "PID Controller", category: .control, icon: "slider.horizontal.3", description: "Proportional-Integral-Derivative feedback controller", metadata: ["type": "feedback"]),
            ElementCard(id: "onoff", symbol: "ON/OFF", name: "On-Off Control", category: .control, icon: "power", description: "Simple binary control", metadata: ["states": "2"]),
            
            // Sensors
            ElementCard(id: "temp", symbol: "TEMP", name: "Temperature", category: .sensor, icon: "thermometer", description: "Temperature sensor input", metadata: ["unit": "°C"]),
            ElementCard(id: "pressure", symbol: "PSI", name: "Pressure", category: .sensor, icon: "gauge", description: "Pressure sensor input", metadata: ["unit": "PSI"]),
            ElementCard(id: "flow", symbol: "FLOW", name: "Flow Rate", category: .sensor, icon: "waveform.path", description: "Flow rate sensor", metadata: ["unit": "L/min"]),
            
            // Actuators
            ElementCard(id: "motor", symbol: "MTR", name: "Motor", category: .actuator, icon: "fan", description: "Electric motor control", metadata: ["type": "3-phase"]),
            ElementCard(id: "valve", symbol: "VLV", name: "Valve", category: .actuator, icon: "valve.fill", description: "Flow control valve", metadata: ["range": "0-100%"]),
            ElementCard(id: "pump", symbol: "PMP", name: "Pump", category: .actuator, icon: "water.waves", description: "Liquid pump", metadata: ["power": "variable"]),
            
            // Logic
            ElementCard(id: "and", symbol: "AND", name: "Logic AND", category: .logic, icon: "arrow.triangle.merge", description: "Boolean AND gate", metadata: ["inputs": "2+"]),
            ElementCard(id: "or", symbol: "OR", name: "Logic OR", category: .logic, icon: "arrow.triangle.branch", description: "Boolean OR gate", metadata: ["inputs": "2+"]),
            ElementCard(id: "timer", symbol: "TMR", name: "Timer", category: .logic, icon: "timer", description: "Delay timer", metadata: ["range": "0-999s"]),
            ElementCard(id: "counter", symbol: "CNT", name: "Counter", category: .logic, icon: "number", description: "Count events", metadata: ["max": "9999"]),
            
            // Communication
            ElementCard(id: "modbus", symbol: "MDB", name: "Modbus TCP", category: .communication, icon: "network", description: "Modbus TCP/IP", metadata: ["port": "502"]),
            ElementCard(id: "mqtt", symbol: "MQTT", name: "MQTT Publish", category: .communication, icon: "antenna.radiowaves.left.and.right", description: "MQTT messaging", metadata: ["qos": "0-2"]),
            
            // Safety
            ElementCard(id: "estop", symbol: "E-STOP", name: "Emergency Stop", category: .safety, icon: "exclamationmark.octagon.fill", description: "Emergency shutdown", metadata: ["priority": "highest"]),
            ElementCard(id: "geofence", symbol: "GEO", name: "Geofence", category: .safety, icon: "location.circle", description: "Geographic boundary", metadata: ["type": "circular"]),
            ElementCard(id: "watchdog", symbol: "WDT", name: "Watchdog", category: .safety, icon: "eye.circle", description: "System monitor", metadata: ["timeout": "configurable"]),
            
            // Monitoring
            ElementCard(id: "alarm", symbol: "ALRM", name: "Alarm", category: .monitoring, icon: "bell.fill", description: "Condition alarm", metadata: ["levels": "warning, critical"]),
            ElementCard(id: "logger", symbol: "LOG", name: "Data Logger", category: .monitoring, icon: "chart.xyaxis.line", description: "Time-series logging", metadata: ["storage": "Sled KVS"]),
            ElementCard(id: "trend", symbol: "TRND", name: "Trend", category: .monitoring, icon: "chart.line.uptrend.xyaxis", description: "Real-time trending", metadata: ["buffer": "1000 pts"]),
            
            // Utility
            ElementCard(id: "math", symbol: "f(x)", name: "Math Function", category: .utility, icon: "function", description: "Mathematical operation", metadata: ["ops": "+, -, *, /, √, ^"]),
            ElementCard(id: "scale", symbol: "SCAL", name: "Scale", category: .utility, icon: "slider.vertical.3", description: "Linear scaling", metadata: ["in": "0-100", "out": "0-100"]),
            ElementCard(id: "compare", symbol: "CMP", name: "Compare", category: .utility, icon: "equal", description: "Value comparison", metadata: ["ops": "<, >, =, ≤, ≥, ≠"]),
        ]
    }
    
    func addNode(element: ElementCard, at position: CGPoint) {
        let node = CanvasNode(
            id: UUID().uuidString,
            position: position,
            element: element,
            inputs: [],
            outputs: [],
            config: [:]
        )
        nodes.append(node)
    }
    
    func deleteSelected() {
        guard let nodeId = selectedNodeId else { return }
        connections.removeAll { $0.fromNodeId == nodeId || $0.toNodeId == nodeId }
        nodes.removeAll { $0.id == nodeId }
        selectedNodeId = nil
    }
    
    func zoomIn() {
        canvasScale = min(2.0, canvasScale * 1.2)
    }
    
    func zoomOut() {
        canvasScale = max(0.5, canvasScale / 1.2)
    }
    
    func resetView() {
        canvasScale = 1.0
        canvasOffset = .zero
    }
    
    func executeWorkflow() {
        print("🚀 Executing: \(workflowName)")
        print("   Nodes: \(nodes.count)")
        print("   Connections: \(connections.count)")
        
        // Simple execution order (topological sort would go here)
        for node in nodes {
            print("   ▶ Execute: \(node.element.name)")
        }
    }
}

// MARK: - Canvas Area

struct CanvasArea: View {
    @ObservedObject var state: WorkflowState
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Grid background
                CanvasBackground(gridSize: 20, scale: state.canvasScale)
                    .offset(state.canvasOffset)
                
                // Connections
                ForEach(state.connections) { connection in
                    if let fromNode = state.nodes.first(where: { $0.id == connection.fromNodeId }),
                       let toNode = state.nodes.first(where: { $0.id == connection.toNodeId }) {
                        ConnectionLine(
                            from: fromNode.position,
                            to: toNode.position,
                            isSelected: false
                        )
                        .offset(state.canvasOffset)
                        .scaleEffect(state.canvasScale)
                    }
                }
                
                // Nodes
                ForEach(state.nodes) { node in
                    CanvasNodeView(
                        node: node,
                        isSelected: state.selectedNodeId == node.id,
                        isDragging: false,
                        onTap: { state.selectedNodeId = node.id },
                        onDragChanged: { _ in },
                        onDragEnded: { _ in },
                        onOutputPortTap: { _ in },
                        onInputPortTap: { _ in }
                    )
                    .position(
                        x: node.position.x * state.canvasScale + state.canvasOffset.width,
                        y: node.position.y * state.canvasScale + state.canvasOffset.height
                    )
                }
                
                // Drop zone indicator
                if state.draggingElement != nil {
                    Text("Drop here to add node")
                        .font(.headline)
                        .foregroundColor(Color(hex: "#8E8E93"))
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }
            .onDrop(of: [.text], isTargeted: nil) { providers, location in
                if let element = state.draggingElement {
                    state.addNode(element: element, at: location)
                    state.draggingElement = nil
                    return true
                }
                return false
            }
        }
        .background(Color.black)
    }
}

// MARK: - Preview

#Preview("iPad") {
    CombinedWorkflowView()
        .previewDevice(PreviewDevice(rawValue: "iPad Pro (12.9-inch) (6th generation)"))
        .previewDisplayName("iPad Pro 12.9\"")
}

#Preview("iPhone") {
    CombinedWorkflowView()
        .previewDevice(PreviewDevice(rawValue: "iPhone 15 Pro"))
        .previewDisplayName("iPhone 15 Pro")
}




