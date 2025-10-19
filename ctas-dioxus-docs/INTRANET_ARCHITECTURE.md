# CTAS-7 Intranet - Multi-Purpose Platform Architecture

## Vision

A beautiful, mobile-ready **Dioxus-based intranet** that serves multiple audiences:

- 👨‍💻 **Internal Developers** - Dev Center, tools, documentation
- 🏢 **Operations Team** - System monitoring, deployment control
- 🎯 **Clients/Investors** - Demo platform, capability showcase
- 🆕 **New Hires** - Onboarding, training, exploration

---

## Site Structure

```
CTAS-7 Intranet
│
├── 🏠 Home (Landing Page)
│   ├── Hero section with live system stats
│   ├── Quick access cards
│   └── Recent activity feed
│
├── 💻 Dev Center
│   ├── Smart Crate Registry
│   ├── API Documentation
│   ├── Code Examples
│   ├── Development Tools
│   └── Testing Playground
│
├── ⚙️ Ops Center
│   ├── System Topology (Live)
│   ├── Service Health Dashboard
│   ├── Deployment Control
│   ├── Port Management
│   └── Security Audit
│
├── 🛠️ Tools
│   ├── Neural Mux Console
│   ├── Database Query Tool
│   ├── Log Viewer
│   ├── Performance Profiler
│   └── Network Analyzer
│
├── 🌍 GIS Showcase (Client Demo)
│   ├── Space World Visualization
│   ├── Network World (HFT)
│   ├── Ground World (Cognetix)
│   └── Fusion View
│
├── 📚 Documentation
│   ├── Architecture Guides
│   ├── Smart Crate Specs
│   ├── QA Blockchain
│   ├── Integration Guides
│   └── Best Practices
│
├── 🎓 Onboarding
│   ├── Getting Started
│   ├── System Overview
│   ├── Interactive Tutorials
│   ├── Video Walkthroughs
│   └── FAQ
│
└── 👥 Team
    ├── Team Directory
    ├── Project Status
    ├── Roadmap
    └── Achievements
```

---

## Page Designs

### 🏠 Home Page

**Hero Section**:
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│        🧠 CTAS-7 Command & Control Intranet        │
│                                                     │
│     Next-Generation Agentic Programming Platform   │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ 🟢 Live  │  │ 257 GS   │  │ 12 Sats  │        │
│  │ Systems  │  │ Active   │  │ Orbiting │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Quick Access Grid**:
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 💻 Dev Center│  │ ⚙️ Ops Center│  │ 🛠️ Tools     │
│              │  │              │  │              │
│ Smart Crates │  │ Live Topology│  │ Neural Mux   │
│ API Docs     │  │ Deployments  │  │ Logs         │
│ Examples     │  │ Health       │  │ Profiler     │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 🌍 GIS Demo  │  │ 📚 Docs      │  │ 🎓 Onboarding│
│              │  │              │  │              │
│ Space World  │  │ Architecture │  │ Get Started  │
│ Network HFT  │  │ Smart Crates │  │ Tutorials    │
│ Fusion View  │  │ Integration  │  │ Videos       │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

### 💻 Dev Center

**Smart Crate Registry**:
```
┌─────────────────────────────────────────────────────┐
│ 📦 Smart Crate Registry                    🔍 Search│
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ ctas7-gis-cesium                    v0.1.0  │   │
│ │ ⭐ QA Score: 94.7  🔒 SLSA Level 3          │   │
│ │ 📅 Retrofit: 2024-10-13                     │   │
│ │ 🔌 Ports: 18400, 18401                      │   │
│ │ [View Details] [Dependencies] [Deploy]      │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ ctas7-orbital-mechanics             v0.2.1  │   │
│ │ ⭐ QA Score: 98.3  🔒 SLSA Level 4          │   │
│ │ 📅 Retrofit: 2024-09-20                     │   │
│ │ 🔌 No ports (library crate)                 │   │
│ │ [View Details] [Dependencies] [Deploy]      │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**API Documentation**:
- Interactive API explorer
- Code examples in Rust, TypeScript, Python
- Live testing environment
- Response schemas

---

### ⚙️ Ops Center

**System Topology** (Live from Neural Mux):
```
┌─────────────────────────────────────────────────────┐
│ 🔴 Live System Topology              Last: 2s ago   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐                                  │
│  │ Neural Mux   │ 🟢 Healthy                       │
│  │ :18100       │ CPU: 12% | Mem: 340MB           │
│  └──────┬───────┘                                  │
│         │                                           │
│    ┌────┼────┬────────┐                           │
│    │    │    │        │                           │
│    ▼    ▼    ▼        ▼                           │
│  ┌───┐┌───┐┌───┐  ┌────┐                         │
│  │GIS││Ops││API│  │Supa│ 🟢 All Healthy          │
│  └───┘└───┘└───┘  └────┘                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Deployment Control**:
- One-click deployments
- Rollback capability
- Canary releases
- Health checks

---

### 🌍 GIS Showcase (Client Demo Mode)

**Client-Facing Features**:
- 🎬 **Auto-play demo mode** - Showcases capabilities automatically
- 📊 **Live metrics** - Real-time performance stats
- 🎯 **Interactive exploration** - Let clients play with the system
- 📸 **Screenshot mode** - Beautiful static views for presentations
- 🎥 **Screen recording** - Capture demos for later

**Demo Scenarios**:
1. **Space World** - "12 satellites tracking Van Allen belts"
2. **Network World** - "259 ground stations, quantum-secured links"
3. **Fusion View** - "Multi-domain situational awareness"

---

### 📚 Documentation

**Categories**:
- **Architecture** - System design, patterns, decisions
- **Smart Crates** - Specification, retrofit guide, QA process
- **Integration** - How to connect new services
- **API Reference** - Complete API documentation
- **Best Practices** - Coding standards, security, performance

**Features**:
- 🔍 Full-text search
- 📖 Version history
- 💬 Comments/feedback
- 🔗 Cross-references
- 📱 Mobile-optimized

---

### 🎓 Onboarding

**New Developer Journey**:
1. **Welcome** - Introduction to CTAS-7
2. **Setup** - Development environment
3. **First Task** - Build your first smart crate
4. **Exploration** - Interactive system tour
5. **Certification** - Complete onboarding quiz

**New Client Journey**:
1. **Capabilities Overview** - What CTAS-7 can do
2. **Live Demo** - See it in action
3. **Use Cases** - Real-world applications
4. **Technical Deep Dive** - Architecture and security
5. **Next Steps** - Engagement options

---

## Mobile-First Design

### Responsive Breakpoints

```css
/* Mobile First */
.container {
  padding: 1rem;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
  }
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large Desktop (1440px+) */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

### Touch-Friendly

- **Minimum tap target**: 44x44px (iOS standard)
- **Swipe gestures**: Navigate between sections
- **Pull to refresh**: Update live data
- **Haptic feedback**: On interactions (iOS)

---

## iOS Deployment

### Dioxus Mobile Configuration

```toml
[package]
name = "ctas7-intranet"
version = "0.1.0"

[dependencies]
dioxus = { version = "0.6", features = ["mobile", "router"] }
dioxus-mobile = "0.6"

[target.'cfg(target_os = "ios")'.dependencies]
# iOS-specific dependencies
```

### App Store Metadata

**App Name**: CTAS-7 Intranet
**Category**: Business / Developer Tools
**Description**: 
> Next-generation command and control platform for CTAS-7 systems. Monitor live infrastructure, manage deployments, explore documentation, and showcase capabilities to clients.

**Screenshots**:
1. Home dashboard with live stats
2. Smart Crate Registry
3. System Topology (live)
4. GIS Showcase (Space World)
5. Mobile-optimized documentation

---

## Client Demo Mode

### Special Features for Client Presentations

**Demo Mode Toggle**:
```rust
#[component]
fn DemoModeToggle() -> Element {
    let mut demo_mode = use_signal(|| false);
    
    rsx! {
        button {
            onclick: move |_| demo_mode.set(!demo_mode()),
            class: "demo-toggle",
            if demo_mode() {
                "🎬 Demo Mode: ON"
            } else {
                "🎬 Demo Mode: OFF"
            }
        }
    }
}
```

**Demo Mode Features**:
- 🎨 **Polished UI** - Hide dev tools, show only client-facing features
- 📊 **Curated Data** - Show impressive but realistic data
- 🎥 **Auto-play** - Automatically cycle through features
- 🔇 **Mute Errors** - Don't show technical errors to clients
- 📸 **Screenshot Ready** - Always looks perfect

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [x] Fix compilation errors
- [ ] Beautiful home page
- [ ] Navigation structure
- [ ] Mobile-responsive layout
- [ ] Basic routing

### Phase 2: Dev Center (Week 2)
- [ ] Smart Crate Registry browser
- [ ] API documentation viewer
- [ ] Code examples
- [ ] Search functionality

### Phase 3: Ops Center (Week 3)
- [ ] Live system topology
- [ ] Service health dashboard
- [ ] Deployment controls
- [ ] Log viewer

### Phase 4: GIS Showcase (Week 4)
- [ ] Integrate Space World visualization
- [ ] Network World demo
- [ ] Fusion View
- [ ] Client demo mode

### Phase 5: Documentation (Week 5)
- [ ] Architecture docs
- [ ] Smart Crate specs
- [ ] Integration guides
- [ ] Search and navigation

### Phase 6: Onboarding (Week 6)
- [ ] Getting started guides
- [ ] Interactive tutorials
- [ ] Video walkthroughs
- [ ] Certification system

### Phase 7: Polish & Mobile (Week 7-8)
- [ ] iOS app build
- [ ] Android app build
- [ ] Performance optimization
- [ ] User testing
- [ ] Client feedback

---

## Technology Stack

### Frontend
- **Dioxus 0.6** - Rust UI framework
- **Custom CSS** - Mobile-first responsive design
- **Tailwind-inspired** - Utility classes

### Backend Integration
- **Neural Mux** - System orchestration
- **Supabase** - Database queries
- **SurrealDB** - Graph queries
- **Sled** - KV cache

### Mobile
- **Dioxus Mobile** - iOS and Android
- **Native features** - Camera, notifications, etc.

### Deployment
- **Desktop**: Native app (macOS, Windows, Linux)
- **Web**: WASM deployment
- **iOS**: App Store
- **Android**: Play Store

---

## Next Steps

1. **Answer the 10 questions** in `DIOXUS_SUPERADMIN_BRIEFING.md`
2. **Design the home page** - Beautiful, mobile-ready landing
3. **Build Dev Center** - Smart Crate Registry first
4. **Create Ops Center** - Live system topology
5. **Add GIS Showcase** - Client demo mode
6. **Polish for mobile** - iOS deployment

---

## Success Metrics

### Internal Use
- ✅ Developers use it daily for crate management
- ✅ Ops team monitors system health
- ✅ New hires complete onboarding

### Client Demos
- ✅ Impressive visual showcase
- ✅ Interactive exploration
- ✅ Clear value proposition
- ✅ Technical credibility

### Mobile
- ✅ Works perfectly on iOS/Android
- ✅ Touch-friendly interface
- ✅ Fast and responsive
- ✅ Offline mode support

---

**This is not just documentation - it's a multi-purpose platform that serves developers, operations, clients, and new hires. Beautiful, functional, and mobile-ready.** 🚀

