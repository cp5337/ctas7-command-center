//
//  NeuralMux.swift - Universal React-to-SwiftUI Adapter
//  CTAS-7 Solutions Development Center
//
//  Neural Mux: Write Once, Run Anywhere
//  Converts React components to native SwiftUI with zero cognitive overhead
//

import SwiftUI
import MapKit
import Combine

// MARK: - Neural Mux Core Architecture
protocol NeuralMuxComponent {
    associatedtype ReactProps
    associatedtype SwiftUIView: View

    func transpile(props: ReactProps) -> SwiftUIView
}

// MARK: - React-like State Management for SwiftUI
@propertyWrapper
struct NeuralState<T>: DynamicProperty {
    @State private var wrappedValue: T

    init(wrappedValue: T) {
        self._wrappedValue = State(wrappedValue: wrappedValue)
    }

    var projectedValue: Binding<T> {
        $wrappedValue
    }
}

// MARK: - React Props → SwiftUI Props Mapping
struct ReactGISProps {
    let entities: [CTASDBEntity]
    let center: [Double]?  // [lat, lng]
    let zoom: Int?
    let onMarkerClick: ((CTASDBEntity) -> Void)?
    let onExport: (() -> Void)?
}

// MARK: - Neural Mux GIS Transpiler
struct NeuralMuxGIS: NeuralMuxComponent {
    typealias ReactProps = ReactGISProps
    typealias SwiftUIView = GISViewerSwift

    func transpile(props: ReactProps) -> GISViewerSwift {
        return GISViewerSwift(
            entities: props.entities,
            initialCenter: CLLocationCoordinate2D(
                latitude: props.center?[0] ?? 37.7749,
                longitude: props.center?[1] ?? -122.4194
            ),
            initialZoom: Double(props.zoom ?? 2),
            onMarkerTap: props.onMarkerClick,
            onExport: props.onExport
        )
    }
}

// MARK: - SwiftUI GIS Implementation
struct GISViewerSwift: View {
    let entities: [CTASDBEntity]
    let initialCenter: CLLocationCoordinate2D
    let initialZoom: Double
    let onMarkerTap: ((CTASDBEntity) -> Void)?
    let onExport: (() -> Void)?

    @NeuralState private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 37.7749, longitude: -122.4194),
        span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
    )

    @NeuralState private var selectedLayers: Set<String> = ["Crate Deploys"]
    @NeuralState private var showingExportOptions = false

    var body: some View {
        VStack(spacing: 0) {
            // Neural Mux: React MapContainer → SwiftUI Map
            Map(coordinateRegion: $region, annotationItems: crateMarkers) { marker in
                MapAnnotation(coordinate: marker.coordinate) {
                    CrateMarkerView(entity: marker.entity) {
                        onMarkerTap?(marker.entity)
                    }
                }
            }
            .frame(height: 384) // React: h-96 = 384px

            // Neural Mux: React LayersControl → SwiftUI Layer Toggle
            LayersControlView(selectedLayers: $selectedLayers)
                .padding(.horizontal)

            // Neural Mux: React button → SwiftUI Button
            HStack {
                Button("Feed Geo to Ops") {
                    onExport?()
                }
                .buttonStyle(.borderedProminent)
                .tint(.green)

                Spacer()

                Button("Export Options") {
                    showingExportOptions = true
                }
                .buttonStyle(.bordered)
            }
            .padding()
        }
        .onAppear {
            setupInitialRegion()
        }
        .sheet(isPresented: $showingExportOptions) {
            ExportOptionsView()
        }
    }

    // Neural Mux: React filter/map → SwiftUI computed property
    private var crateMarkers: [CrateMapAnnotation] {
        entities
            .filter { $0.domain == "Crates" }
            .compactMap { entity in
                guard let lat = entity.data["lat"] as? Double,
                      let lng = entity.data["lng"] as? Double else { return nil }

                return CrateMapAnnotation(
                    coordinate: CLLocationCoordinate2D(latitude: lat, longitude: lng),
                    entity: entity
                )
            }
    }

    private func setupInitialRegion() {
        region = MKCoordinateRegion(
            center: initialCenter,
            span: MKCoordinateSpan(
                latitudeDelta: max(0.1, 10.0 / initialZoom),
                longitudeDelta: max(0.1, 10.0 / initialZoom)
            )
        )
    }
}

// MARK: - Supporting Views
struct CrateMapAnnotation: Identifiable {
    let id = UUID()
    let coordinate: CLLocationCoordinate2D
    let entity: CTASDBEntity
}

struct CrateMarkerView: View {
    let entity: CTASDBEntity
    let onTap: () -> Void

    @State private var showingPopup = false

    var body: some View {
        Button(action: {
            showingPopup = true
            onTap()
        }) {
            ZStack {
                Circle()
                    .fill(isHealthy ? .green : .red)
                    .frame(width: 20, height: 20)

                Image(systemName: "cube.box")
                    .foregroundColor(.white)
                    .font(.system(size: 10, weight: .bold))
            }
        }
        .popover(isPresented: $showingPopup, arrowEdge: .bottom) {
            // Neural Mux: React Popup → SwiftUI Popover
            VStack(alignment: .leading, spacing: 8) {
                Text(entity.data["group"] as? String ?? "Unknown")
                    .font(.headline)

                Text(isHealthy ? "Healthy" : "Retrofit Required")
                    .foregroundColor(isHealthy ? .green : .red)
                    .font(.subheadline)

                if let hash = entity.data["unicodeHash"] as? String {
                    Text("Cert: \(String(hash.prefix(8)))...")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .presentationCompactAdaptation(.popover)
        }
    }

    private var isHealthy: Bool {
        entity.data["healthy"] as? Bool ?? false
    }
}

struct LayersControlView: View {
    @Binding var selectedLayers: Set<String>

    private let availableLayers = ["Crate Deploys", "Threat Layers", "Infrastructure", "Network Topology"]

    var body: some View {
        VStack(alignment: .leading) {
            Text("Map Layers")
                .font(.headline)
                .padding(.bottom, 4)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 8) {
                ForEach(availableLayers, id: \.self) { layer in
                    Button(action: {
                        if selectedLayers.contains(layer) {
                            selectedLayers.remove(layer)
                        } else {
                            selectedLayers.insert(layer)
                        }
                    }) {
                        Label(layer, systemImage: selectedLayers.contains(layer) ? "checkmark.circle.fill" : "circle")
                    }
                    .buttonStyle(.bordered)
                    .tint(selectedLayers.contains(layer) ? .blue : .gray)
                }
            }
        }
        .padding(.vertical)
    }
}

struct ExportOptionsView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Export Geographic Data")
                    .font(.title2)
                    .padding()

                VStack(spacing: 12) {
                    Button("Export to Ops Dashboard") {
                        // Export to ops system
                        dismiss()
                    }
                    .buttonStyle(.borderedProminent)

                    Button("Generate KML File") {
                        // Generate KML
                        dismiss()
                    }
                    .buttonStyle(.bordered)

                    Button("Create Threat Report") {
                        // Generate threat assessment
                        dismiss()
                    }
                    .buttonStyle(.bordered)
                }

                Spacer()
            }
            .navigationTitle("Export")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Neural Mux Usage Example
struct SDCGISView: View {
    let entities: [CTASDBEntity]

    var body: some View {
        let mux = NeuralMuxGIS()
        let props = ReactGISProps(
            entities: entities,
            center: [37.7749, -122.4194],
            zoom: 2,
            onMarkerClick: { entity in
                print("Marker tapped: \(entity.id)")
            },
            onExport: {
                print("Exporting geo data to ops...")
            }
        )

        return mux.transpile(props: props)
    }
}

#Preview {
    let sampleEntities = [
        CTASDBEntity(domain: "Crates", data: [
            "group": "Alpha-1",
            "lat": 37.7749,
            "lng": -122.4194,
            "healthy": true,
            "unicodeHash": "blake3_abc123def456"
        ]),
        CTASDBEntity(domain: "Crates", data: [
            "group": "Bravo-2",
            "lat": 40.7128,
            "lng": -74.0060,
            "healthy": false,
            "unicodeHash": "blake3_xyz789uvw012"
        ])
    ]

    return SDCGISView(entities: sampleEntities)
}