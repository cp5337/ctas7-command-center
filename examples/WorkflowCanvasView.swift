import SwiftUI

// MARK: - Workflow Canvas View (n8n-style drag-and-drop)
// Context-agnostic: Can be used for PLC sequences, Cognigraph planning, or Forge orchestration

/// Node placed on the canvas
struct CanvasNode: Identifiable, Equatable {
    let id: String
    var position: CGPoint
    let element: ElementCard
    var inputs: [String]         // IDs of input connections
    var outputs: [String]        // IDs of output connections
    var config: [String: String] // Node-specific configuration
    
    static func == (lhs: CanvasNode, rhs: CanvasNode) -> Bool {
        lhs.id == rhs.id
    }
}

/// Connection between nodes
struct CanvasConnection: Identifiable, Equatable {
    let id: String
    let fromNodeId: String
    let toNodeId: String
    let fromPort: Int  // Output port index
    let toPort: Int    // Input port index
    
    static func == (lhs: CanvasConnection, rhs: CanvasConnection) -> Bool {
        lhs.id == rhs.id
    }
}

/// Main workflow canvas view
struct WorkflowCanvasView: View {
    @State private var nodes: [CanvasNode] = []
    @State private var connections: [CanvasConnection] = []
    @State private var selectedNodeId: String? = nil
    @State private var draggingNodeId: String? = nil
    @State private var dragOffset: CGSize = .zero
    @State private var canvasOffset: CGSize = .zero
    @State private var canvasScale: CGFloat = 1.0
    @State private var showElementLibrary: Bool = false
    @State private var connectingFrom: (nodeId: String, port: Int)? = nil
    
    // Grid settings
    private let gridSize: CGFloat = 20
    private let snapToGrid: Bool = true
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background with grid
                CanvasBackground(gridSize: gridSize, scale: canvasScale)
                    .offset(canvasOffset)
                
                // Connections layer
                ForEach(connections) { connection in
                    if let fromNode = nodes.first(where: { $0.id == connection.fromNodeId }),
                       let toNode = nodes.first(where: { $0.id == connection.toNodeId }) {
                        ConnectionLine(
                            from: fromNode.position,
                            to: toNode.position,
                            isSelected: false
                        )
                        .offset(canvasOffset)
                        .scaleEffect(canvasScale)
                    }
                }
                
                // Nodes layer
                ForEach(nodes) { node in
                    CanvasNodeView(
                        node: node,
                        isSelected: selectedNodeId == node.id,
                        isDragging: draggingNodeId == node.id,
                        onTap: { selectNode(node.id) },
                        onDragChanged: { value in
                            handleNodeDrag(node.id, value: value)
                        },
                        onDragEnded: { value in
                            handleNodeDragEnd(node.id, value: value)
                        },
                        onOutputPortTap: { portIndex in
                            startConnection(from: node.id, port: portIndex)
                        },
                        onInputPortTap: { portIndex in
                            completeConnection(to: node.id, port: portIndex)
                        }
                    )
                    .position(
                        x: node.position.x * canvasScale + canvasOffset.width,
                        y: node.position.y * canvasScale + canvasOffset.height
                    )
                }
                
                // Active connection being drawn
                if let connecting = connectingFrom,
                   let fromNode = nodes.first(where: { $0.id == connecting.nodeId }) {
                    ConnectionLine(
                        from: fromNode.position,
                        to: CGPoint(x: 200, y: 200), // Follow cursor in real impl
                        isSelected: true
                    )
                    .offset(canvasOffset)
                    .scaleEffect(canvasScale)
                }
                
                // Toolbar
                VStack {
                    CanvasToolbar(
                        onAddNode: { showElementLibrary = true },
                        onZoomIn: { canvasScale *= 1.2 },
                        onZoomOut: { canvasScale /= 1.2 },
                        onResetView: { 
                            canvasScale = 1.0
                            canvasOffset = .zero
                        },
                        onDelete: { deleteSelectedNode() },
                        onExecute: { executeWorkflow() }
                    )
                    Spacer()
                }
                
                // Node inspector (right side)
                if let nodeId = selectedNodeId,
                   let node = nodes.first(where: { $0.id == nodeId }) {
                    HStack {
                        Spacer()
                        NodeInspector(node: binding(for: node))
                            .frame(width: 300)
                    }
                }
            }
            .gesture(
                DragGesture()
                    .onChanged { value in
                        if selectedNodeId == nil {
                            canvasOffset = value.translation
                        }
                    }
            )
            .gesture(
                MagnificationGesture()
                    .onChanged { scale in
                        canvasScale = max(0.5, min(2.0, scale))
                    }
            )
            .sheet(isPresented: $showElementLibrary) {
                ElementLibrarySheet(onSelect: { element in
                    addNode(element: element, at: geometry.size.center)
                    showElementLibrary = false
                })
            }
        }
        .background(Color.black)
    }
    
    // MARK: - Helper Functions
    
    private func selectNode(_ nodeId: String) {
        selectedNodeId = nodeId
    }
    
    private func handleNodeDrag(_ nodeId: String, value: DragGesture.Value) {
        draggingNodeId = nodeId
        if let index = nodes.firstIndex(where: { $0.id == nodeId }) {
            let newX = nodes[index].position.x + value.translation.width / canvasScale
            let newY = nodes[index].position.y + value.translation.height / canvasScale
            nodes[index].position = CGPoint(x: newX, y: newY)
        }
    }
    
    private func handleNodeDragEnd(_ nodeId: String, value: DragGesture.Value) {
        draggingNodeId = nil
        if snapToGrid, let index = nodes.firstIndex(where: { $0.id == nodeId }) {
            let snapped = snapToGridPoint(nodes[index].position)
            nodes[index].position = snapped
        }
    }
    
    private func snapToGridPoint(_ point: CGPoint) -> CGPoint {
        CGPoint(
            x: round(point.x / gridSize) * gridSize,
            y: round(point.y / gridSize) * gridSize
        )
    }
    
    private func addNode(element: ElementCard, at position: CGPoint) {
        let node = CanvasNode(
            id: UUID().uuidString,
            position: snapToGrid ? snapToGridPoint(position) : position,
            element: element,
            inputs: [],
            outputs: [],
            config: [:]
        )
        nodes.append(node)
    }
    
    private func startConnection(from nodeId: String, port: Int) {
        connectingFrom = (nodeId, port)
    }
    
    private func completeConnection(to nodeId: String, port: Int) {
        guard let from = connectingFrom, from.nodeId != nodeId else {
            connectingFrom = nil
            return
        }
        
        let connection = CanvasConnection(
            id: UUID().uuidString,
            fromNodeId: from.nodeId,
            toNodeId: nodeId,
            fromPort: from.port,
            toPort: port
        )
        connections.append(connection)
        
        // Update node input/output lists
        if let fromIndex = nodes.firstIndex(where: { $0.id == from.nodeId }) {
            nodes[fromIndex].outputs.append(connection.id)
        }
        if let toIndex = nodes.firstIndex(where: { $0.id == nodeId }) {
            nodes[toIndex].inputs.append(connection.id)
        }
        
        connectingFrom = nil
    }
    
    private func deleteSelectedNode() {
        guard let nodeId = selectedNodeId else { return }
        
        // Remove connections
        connections.removeAll { $0.fromNodeId == nodeId || $0.toNodeId == nodeId }
        
        // Remove node
        nodes.removeAll { $0.id == nodeId }
        
        selectedNodeId = nil
    }
    
    private func executeWorkflow() {
        print("🚀 Executing workflow with \(nodes.count) nodes")
        // Topological sort and execute in order
        let sorted = topologicalSort(nodes: nodes, connections: connections)
        print("📊 Execution order: \(sorted.map { $0.element.name })")
    }
    
    private func topologicalSort(nodes: [CanvasNode], connections: [CanvasConnection]) -> [CanvasNode] {
        // Simple topological sort (Kahn's algorithm)
        var result: [CanvasNode] = []
        var inDegree: [String: Int] = [:]
        var queue: [String] = []
        
        // Calculate in-degrees
        for node in nodes {
            inDegree[node.id] = 0
        }
        for connection in connections {
            inDegree[connection.toNodeId, default: 0] += 1
        }
        
        // Start with nodes that have no dependencies
        for node in nodes {
            if inDegree[node.id] == 0 {
                queue.append(node.id)
            }
        }
        
        // Process queue
        while !queue.isEmpty {
            let nodeId = queue.removeFirst()
            if let node = nodes.first(where: { $0.id == nodeId }) {
                result.append(node)
                
                // Reduce in-degree for connected nodes
                let outgoing = connections.filter { $0.fromNodeId == nodeId }
                for connection in outgoing {
                    inDegree[connection.toNodeId, default: 0] -= 1
                    if inDegree[connection.toNodeId] == 0 {
                        queue.append(connection.toNodeId)
                    }
                }
            }
        }
        
        return result
    }
    
    private func binding(for node: CanvasNode) -> Binding<CanvasNode> {
        guard let index = nodes.firstIndex(where: { $0.id == node.id }) else {
            fatalError("Node not found")
        }
        return $nodes[index]
    }
}

// MARK: - Canvas Background with Grid

struct CanvasBackground: View {
    let gridSize: CGFloat
    let scale: CGFloat
    
    var body: some View {
        GeometryReader { geometry in
            Path { path in
                let width = geometry.size.width
                let height = geometry.size.height
                let scaledGrid = gridSize * scale
                
                // Vertical lines
                var x: CGFloat = 0
                while x < width {
                    path.move(to: CGPoint(x: x, y: 0))
                    path.addLine(to: CGPoint(x: x, y: height))
                    x += scaledGrid
                }
                
                // Horizontal lines
                var y: CGFloat = 0
                while y < height {
                    path.move(to: CGPoint(x: 0, y: y))
                    path.addLine(to: CGPoint(x: width, y: y))
                    y += scaledGrid
                }
            }
            .stroke(Color(hex: "#1C1C1E"), lineWidth: 1)
        }
    }
}

// MARK: - Canvas Node View

struct CanvasNodeView: View {
    let node: CanvasNode
    let isSelected: Bool
    let isDragging: Bool
    let onTap: () -> Void
    let onDragChanged: (DragGesture.Value) -> Void
    let onDragEnded: (DragGesture.Value) -> Void
    let onOutputPortTap: (Int) -> Void
    let onInputPortTap: (Int) -> Void
    
    var body: some View {
        VStack(spacing: 8) {
            // Node header
            HStack {
                Image(systemName: node.element.icon)
                    .font(.system(size: 14))
                    .foregroundColor(node.element.category.color)
                
                Text(node.element.name)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.white)
                    .lineLimit(1)
                
                Spacer()
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(node.element.category.color.opacity(0.3))
            
            // Node body with ports
            HStack(spacing: 0) {
                // Input ports (left)
                VStack(spacing: 8) {
                    ForEach(0..<max(1, node.inputs.count), id: \.self) { index in
                        ConnectionPort(type: .input, isConnected: index < node.inputs.count)
                            .onTapGesture {
                                onInputPortTap(index)
                            }
                    }
                }
                
                Spacer()
                
                // Node content
                VStack {
                    Text(node.element.symbol)
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                }
                .frame(maxWidth: .infinity)
                
                Spacer()
                
                // Output ports (right)
                VStack(spacing: 8) {
                    ForEach(0..<max(1, node.outputs.count + 1), id: \.self) { index in
                        ConnectionPort(type: .output, isConnected: index < node.outputs.count)
                            .onTapGesture {
                                onOutputPortTap(index)
                            }
                    }
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 16)
        }
        .frame(width: 160, height: 100)
        .background(Color(hex: "#2C2C2E"))
        .cornerRadius(8)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(
                    isSelected ? node.element.category.color : Color(hex: "#1C1C1E"),
                    lineWidth: isSelected ? 3 : 1
                )
        )
        .shadow(color: .black.opacity(0.3), radius: isDragging ? 10 : 5)
        .scaleEffect(isDragging ? 1.05 : 1.0)
        .animation(.spring(response: 0.3), value: isDragging)
        .onTapGesture(perform: onTap)
        .gesture(
            DragGesture()
                .onChanged(onDragChanged)
                .onEnded(onDragEnded)
        )
    }
}

// MARK: - Connection Port

enum PortType {
    case input, output
}

struct ConnectionPort: View {
    let type: PortType
    let isConnected: Bool
    
    var body: some View {
        Circle()
            .fill(isConnected ? Color(hex: "#0A84FF") : Color(hex: "#1C1C1E"))
            .frame(width: 12, height: 12)
            .overlay(
                Circle()
                    .stroke(Color(hex: "#0A84FF"), lineWidth: 2)
            )
    }
}

// MARK: - Connection Line

struct ConnectionLine: View {
    let from: CGPoint
    let to: CGPoint
    let isSelected: Bool
    
    var body: some View {
        Path { path in
            path.move(to: from)
            
            // Bezier curve for smooth connection
            let controlPoint1 = CGPoint(x: from.x + (to.x - from.x) * 0.5, y: from.y)
            let controlPoint2 = CGPoint(x: from.x + (to.x - from.x) * 0.5, y: to.y)
            
            path.addCurve(to: to, control1: controlPoint1, control2: controlPoint2)
        }
        .stroke(
            isSelected ? Color(hex: "#0A84FF") : Color(hex: "#64D2FF"),
            style: StrokeStyle(lineWidth: 2, lineCap: .round)
        )
        .shadow(color: Color(hex: "#0A84FF").opacity(0.5), radius: isSelected ? 5 : 0)
    }
}

// MARK: - Canvas Toolbar

struct CanvasToolbar: View {
    let onAddNode: () -> Void
    let onZoomIn: () -> Void
    let onZoomOut: () -> Void
    let onResetView: () -> Void
    let onDelete: () -> Void
    let onExecute: () -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            ToolbarButton(icon: "plus.circle", action: onAddNode)
            ToolbarButton(icon: "magnifyingglass.circle", action: onZoomIn)
            ToolbarButton(icon: "minus.magnifyingglass", action: onZoomOut)
            ToolbarButton(icon: "arrow.counterclockwise", action: onResetView)
            
            Spacer()
            
            ToolbarButton(icon: "trash", color: .red, action: onDelete)
            ToolbarButton(icon: "play.circle.fill", color: .green, action: onExecute)
        }
        .padding()
        .background(Color(hex: "#1C1C1E").opacity(0.9))
    }
}

struct ToolbarButton: View {
    let icon: String
    var color: Color = Color(hex: "#0A84FF")
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(color)
                .frame(width: 44, height: 44)
                .background(Color(hex: "#2C2C2E"))
                .cornerRadius(8)
        }
    }
}

// MARK: - Node Inspector

struct NodeInspector: View {
    @Binding var node: CanvasNode
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Node Inspector")
                .font(.headline)
                .foregroundColor(.white)
            
            Divider()
            
            Text(node.element.name)
                .font(.title3)
                .foregroundColor(.white)
            
            Text(node.element.description)
                .font(.caption)
                .foregroundColor(Color(hex: "#8E8E93"))
            
            Divider()
            
            Text("Configuration")
                .font(.subheadline)
                .foregroundColor(.white)
            
            ForEach(Array(node.config.keys.sorted()), id: \.self) { key in
                HStack {
                    Text(key)
                        .foregroundColor(Color(hex: "#8E8E93"))
                    Spacer()
                    TextField("Value", text: binding(for: key))
                        .textFieldStyle(.roundedBorder)
                }
            }
            
            Spacer()
        }
        .padding()
        .background(Color(hex: "#1C1C1E"))
    }
    
    private func binding(for key: String) -> Binding<String> {
        Binding(
            get: { node.config[key] ?? "" },
            set: { node.config[key] = $0 }
        )
    }
}

// MARK: - Element Library Sheet

struct ElementLibrarySheet: View {
    let onSelect: (ElementCard) -> Void
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            PeriodicTableView(
                elements: sampleElements,
                onElementTap: { element in
                    onSelect(element)
                },
                onElementDragStart: { _ in }
            )
            .navigationTitle("Add Node")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    private let sampleElements: [ElementCard] = [
        ElementCard(id: "pid", symbol: "PID", name: "PID Controller", category: .control, icon: "slider.horizontal.3", description: "PID controller", metadata: [:]),
        ElementCard(id: "temp", symbol: "TEMP", name: "Temperature", category: .sensor, icon: "thermometer", description: "Temperature sensor", metadata: [:]),
        ElementCard(id: "motor", symbol: "MTR", name: "Motor", category: .actuator, icon: "fan", description: "Motor control", metadata: [:]),
    ]
}

// MARK: - CGSize Extension

extension CGSize {
    var center: CGPoint {
        CGPoint(x: width / 2, y: height / 2)
    }
}

// MARK: - Preview

#Preview {
    WorkflowCanvasView()
}




