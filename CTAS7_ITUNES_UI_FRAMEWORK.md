# 🎵 CTAS-7 iTunes UI Framework
**Universal Album/Track Pattern for All CTAS Apps**

## 🎯 **Design Philosophy**

The iTunes UI pattern is **context-agnostic** and reusable across all CTAS-7 applications:
- **Albums** = Collections (Systems, Missions, Tool Chains)
- **Songs** = Items (Devices, Atoms, Scripts)
- **Liner Notes** = Metadata (MARC cards, intel, docs)
- **Playlists** = Sequences (Execution orders, mission plans)

---

## 📱 **Core UI Components**

### **1. Album Grid View**
```
┌─────────────────────────────────────────────────┐
│  ← Back              Library Name          🔍📊 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ [Icon]  │  │ [Icon]  │  │ [Icon]  │         │
│  │         │  │         │  │         │         │
│  │ Album 1 │  │ Album 2 │  │ Album 3 │         │
│  │ 8 items │  │ 12 items│  │ 5 items │         │
│  └─────────┘  └─────────┘  └─────────┘         │
│                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ [Icon]  │  │ [Icon]  │  │ [Icon]  │         │
│  │         │  │         │  │         │         │
│  │ Album 4 │  │ Album 5 │  │ Album 6 │         │
│  │ 3 items │  │ 15 items│  │ 7 items │         │
│  └─────────┘  └─────────┘  └─────────┘         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### **2. Album Detail View**
```
┌─────────────────────────────────────────────────┐
│  ← Albums            Album Name            ⋯    │
├─────────────────────────────────────────────────┤
│                                                 │
│              ┌──────────────┐                   │
│              │              │                   │
│              │  Album Art   │                   │
│              │   [Icon]     │                   │
│              │              │                   │
│              └──────────────┘                   │
│                                                 │
│             Album Title                         │
│             Subtitle / Category                 │
│             12 items • Last active 2h ago       │
│                                                 │
│  ┌─ Play All ────────┐  ┌─ Shuffle ─────┐      │
│  └──────────────────┘  └───────────────┘      │
│                                                 │
├─────────────────────────────────────────────────┤
│  Track List:                                    │
│                                                 │
│  ⦿  [Icon]  Track 1 Name            3:24  ⟩   │
│  ⦿  [Icon]  Track 2 Name            2:18  ⟩   │
│  ⦿  [Icon]  Track 3 Name            5:47  ⟩   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### **3. Track Detail View**
```
┌─────────────────────────────────────────────────┐
│  ← Back              Track Name             ⋯   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │                                          │   │
│  │         Track Details / Preview          │   │
│  │                                          │   │
│  │  ┌────────────────────────────────────┐  │   │
│  │  │ [Icon/Thumbnail]                   │  │   │
│  │  └────────────────────────────────────┘  │   │
│  │                                          │   │
│  │  Property 1:  Value                     │   │
│  │  Property 2:  Value                     │   │
│  │  Status:      ⬤ Online                  │   │
│  │  Duration:    3:24                      │   │
│  │                                          │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
│  ┌────────────────────────────────────────┐     │
│  │           ▶ Execute / Play             │     │
│  └────────────────────────────────────────┘     │
│                                                 │
│  Liner Notes / Documentation:                   │
│  ┌──────────────────────────────────────────┐   │
│  │ This track controls the XYZ subsystem... │   │
│  │ • Requirement A                          │   │
│  │ • Constraint B                           │   │
│  │ • Safety note C                          │   │
│  └──────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🔄 **Application-Specific Mappings**

### **Synaptix PLC** (Industrial Control)
```swift
Album {
    title: "HVAC System Alpha"
    icon: "fan.and.light.ceiling"
    iconColor: .cyan
    items: [
        Track {
            title: "Cooling Tower 1"
            icon: "fan.floor"
            status: .online
            duration: "Active 24/7"
            metadata: {
                ip: "192.168.1.10"
                modbus_address: 40001
                last_reading: "72°F"
            }
        },
        Track {
            title: "Chiller Pump A"
            icon: "water.waves"
            status: .running
            duration: "2h 34m runtime"
        }
    ]
    liner_notes: "MARC card with system specs, safety protocols"
}
```

### **Cognigraph** (Mission Planning)
```swift
Album {
    title: "Operation Red Dawn"
    icon: "shield.lefthalf.filled"
    iconColor: .red
    items: [
        Track {
            title: "Recon Phase"
            icon: "eye"
            status: .pending
            duration: "Est. 45m"
            metadata: {
                atom_type: "Monitor (B₇)"
                forces: [(F_ij: 8.3, target: "Alpha")]
                physics: "6D validated ✓"
            }
        },
        Track {
            title: "Infiltration"
            icon: "figure.walk"
            status: .ready
            duration: "Est. 1h 20m"
        }
    ]
    liner_notes: "Intelligence briefing, risk assessment, physics constraints"
}
```

### **Forge Orchestrator** (Development Tools)
```swift
Album {
    title: "Backend Deployment"
    icon: "server.rack"
    iconColor: .green
    items: [
        Track {
            title: "Database Migration"
            icon: "cylinder.split.1x2"
            status: .idle
            duration: "~3m 45s"
            metadata: {
                script: "migrate_v2_to_v3.sh"
                hash: "abc123..."
                dependencies: ["postgres", "redis"]
            }
        },
        Track {
            title: "Docker Build"
            icon: "shippingbox"
            status: .success
            duration: "2m 18s (last run)"
        }
    ]
    liner_notes: "Build logs, dependency graph, rollback instructions"
}
```

---

## 🎨 **iOS Design Tokens**

### **Colors** (iOS Dark Mode)
```swift
enum CTASColors {
    static let background = Color(hex: "#000000")          // Black
    static let cardBackground = Color(hex: "#1C1C1E")      // Dark Gray
    static let cardElevated = Color(hex: "#2C2C2E")        // Light Gray
    static let textPrimary = Color(hex: "#FFFFFF")         // White
    static let textSecondary = Color(hex: "#8E8E93")       // Gray
    static let accent = Color(hex: "#0A84FF")              // Apple Blue
    static let green = Color(hex: "#30D158")               // Apple Green
    static let yellow = Color(hex: "#FFD60A")              // Apple Yellow
    static let red = Color(hex: "#FF453A")                 // Apple Red
    static let cyan = Color(hex: "#64D2FF")                // Apple Cyan
    static let purple = Color(hex: "#BF5AF2")              // Apple Purple
}
```

### **Typography** (SF Pro)
```swift
enum CTASTypography {
    static let largeTitle = Font.system(size: 34, weight: .bold)
    static let title1 = Font.system(size: 28, weight: .bold)
    static let title2 = Font.system(size: 22, weight: .bold)
    static let title3 = Font.system(size: 20, weight: .semibold)
    static let headline = Font.system(size: 17, weight: .semibold)
    static let body = Font.system(size: 17, weight: .regular)
    static let callout = Font.system(size: 16, weight: .regular)
    static let subheadline = Font.system(size: 15, weight: .regular)
    static let footnote = Font.system(size: 13, weight: .regular)
    static let caption1 = Font.system(size: 12, weight: .regular)
    static let caption2 = Font.system(size: 11, weight: .regular)
}
```

### **Layout** (Adaptive)
```swift
enum CTASLayout {
    // Album Grid
    static let albumCardSize: CGFloat = 160  // Square cards
    static let albumGridSpacing: CGFloat = 16
    static let albumGridPadding: CGFloat = 16
    
    // Track List
    static let trackRowHeight: CGFloat = 64
    static let trackIconSize: CGFloat = 44
    static let trackSpacing: CGFloat = 12
    
    // Corner Radius
    static let cardRadius: CGFloat = 12
    static let buttonRadius: CGFloat = 8
    
    // iPad Adaptivity
    static var albumColumns: Int {
        UIDevice.current.userInterfaceIdiom == .pad ? 4 : 2
    }
}
```

---

## 🏗️ **SwiftUI Framework**

### **1. Generic Album Model**
```swift
/// Universal album structure for all CTAS apps
struct CTASAlbum: Identifiable, Codable {
    let id: String
    let title: String
    let subtitle: String?
    let icon: String  // SF Symbol name
    let iconColor: String  // Hex color
    let artwork: String?  // Optional image URL
    let itemCount: Int
    let metadata: [String: AnyCodable]
    let linerNotes: String?
    
    // Application-specific data
    let appContext: AppContext
}

enum AppContext: String, Codable {
    case synaptixPLC
    case cognigraph
    case forge
    case devCenter
}
```

### **2. Generic Track Model**
```swift
/// Universal track/item structure
struct CTASTrack: Identifiable, Codable {
    let id: String
    let albumId: String
    let title: String
    let subtitle: String?
    let icon: String
    let iconColor: String
    let duration: String?  // "3:24" or "Active 24/7"
    let status: TrackStatus
    let metadata: [String: AnyCodable]
    let linerNotes: String?
}

enum TrackStatus: String, Codable {
    case idle, running, online, offline, error, success, pending, ready
    
    var color: Color {
        switch self {
        case .running, .online, .success: return CTASColors.green
        case .error, .offline: return CTASColors.red
        case .ready: return CTASColors.cyan
        case .pending: return CTASColors.yellow
        default: return CTASColors.textSecondary
        }
    }
}
```

### **3. Reusable Views**
```swift
/// Album card component
struct AlbumCard: View {
    let album: CTASAlbum
    let onTap: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Album artwork
            ZStack {
                RoundedRectangle(cornerRadius: CTASLayout.cardRadius)
                    .fill(Color(hex: album.iconColor).opacity(0.2))
                
                if let artwork = album.artwork {
                    AsyncImage(url: URL(string: artwork)) { image in
                        image.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Image(systemName: album.icon)
                            .font(.system(size: 48))
                            .foregroundColor(Color(hex: album.iconColor))
                    }
                } else {
                    Image(systemName: album.icon)
                        .font(.system(size: 48))
                        .foregroundColor(Color(hex: album.iconColor))
                }
            }
            .frame(width: CTASLayout.albumCardSize, height: CTASLayout.albumCardSize)
            
            // Album info
            Text(album.title)
                .font(CTASTypography.callout)
                .fontWeight(.semibold)
                .foregroundColor(CTASColors.textPrimary)
                .lineLimit(2)
            
            Text("\(album.itemCount) \(album.itemCount == 1 ? "item" : "items")")
                .font(CTASTypography.caption1)
                .foregroundColor(CTASColors.textSecondary)
        }
        .frame(width: CTASLayout.albumCardSize)
        .onTapGesture(perform: onTap)
    }
}

/// Track row component
struct TrackRow: View {
    let track: CTASTrack
    let onTap: () -> Void
    
    var body: some View {
        HStack(spacing: CTASLayout.trackSpacing) {
            // Track icon
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color(hex: track.iconColor).opacity(0.2))
                
                Image(systemName: track.icon)
                    .font(.system(size: 24))
                    .foregroundColor(Color(hex: track.iconColor))
            }
            .frame(width: CTASLayout.trackIconSize, height: CTASLayout.trackIconSize)
            
            // Track info
            VStack(alignment: .leading, spacing: 4) {
                Text(track.title)
                    .font(CTASTypography.body)
                    .foregroundColor(CTASColors.textPrimary)
                
                if let subtitle = track.subtitle {
                    Text(subtitle)
                        .font(CTASTypography.subheadline)
                        .foregroundColor(CTASColors.textSecondary)
                }
            }
            
            Spacer()
            
            // Status & duration
            HStack(spacing: 8) {
                if let duration = track.duration {
                    Text(duration)
                        .font(CTASTypography.subheadline)
                        .foregroundColor(CTASColors.textSecondary)
                }
                
                Circle()
                    .fill(track.status.color)
                    .frame(width: 8, height: 8)
                
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(CTASColors.textSecondary)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .frame(height: CTASLayout.trackRowHeight)
        .background(CTASColors.cardBackground)
        .onTapGesture(perform: onTap)
    }
}
```

---

## 📦 **Swift Package: CTASiTunesUI**

```swift
// Package.swift
// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "CTASiTunesUI",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(
            name: "CTASiTunesUI",
            targets: ["CTASiTunesUI"]
        ),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "CTASiTunesUI",
            dependencies: [],
            path: "Sources"
        ),
        .testTarget(
            name: "CTASiTunesUITests",
            dependencies: ["CTASiTunesUI"]
        ),
    ]
)
```

### **Usage in Apps**
```swift
import CTASiTunesUI

// In Synaptix PLC
struct PLCLibraryView: View {
    @StateObject var viewModel = PLCLibraryViewModel()
    
    var body: some View {
        CTASLibraryView(
            albums: viewModel.systems,
            tracks: viewModel.devices,
            context: .synaptixPLC,
            onAlbumTap: viewModel.selectSystem,
            onTrackTap: viewModel.selectDevice,
            onTrackExecute: viewModel.executeDevice
        )
    }
}

// In Cognigraph
struct MissionLibraryView: View {
    @StateObject var viewModel = MissionViewModel()
    
    var body: some View {
        CTASLibraryView(
            albums: viewModel.missions,
            tracks: viewModel.atoms,
            context: .cognigraph,
            onAlbumTap: viewModel.selectMission,
            onTrackTap: viewModel.selectAtom,
            onTrackExecute: viewModel.planAtom
        )
    }
}
```

---

## 🎯 **Benefits of Shared Framework**

1. **Consistent UX**: Users learn once, use everywhere
2. **Code Reuse**: DRY across all CTAS apps
3. **Fast Development**: New apps inherit polished UI instantly
4. **Easy Theming**: Change colors/fonts globally
5. **Accessibility**: VoiceOver/Dynamic Type handled once
6. **Testing**: Shared test suite for UI components

---

## 🚀 **Implementation Plan**

### **Phase 1: Core Framework** (2 weeks)
- [ ] Create `CTASiTunesUI` Swift Package
- [ ] Implement `AlbumCard`, `TrackRow`, `LibraryView`
- [ ] Add iOS design tokens (colors, typography, layout)
- [ ] Write unit tests for components

### **Phase 2: Synaptix PLC Integration** (1 week)
- [ ] Map PLC systems to albums
- [ ] Map devices to tracks
- [ ] Add Modbus metadata to tracks
- [ ] Integrate with HomeKit status

### **Phase 3: Cognigraph Integration** (1 week)
- [ ] Map missions to albums
- [ ] Map cognitive atoms to tracks
- [ ] Add 6D physics metadata
- [ ] Integrate with force calculations

### **Phase 4: Forge Integration** (1 week)
- [ ] Map tool chains to albums
- [ ] Map scripts to tracks
- [ ] Add execution metadata
- [ ] Integrate with Neural Mux

---

## 📝 **Next Steps**

1. Create the `CTASiTunesUI` package
2. Build Synaptix PLC with the framework
3. Extract patterns for Cognigraph
4. Extend to Forge and other apps

**Result**: One UI framework, infinite applications! 🎵

---

*This framework ensures all CTAS-7 apps have the same intuitive iTunes-style experience while maintaining complete backend independence.*




