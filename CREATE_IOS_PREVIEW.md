# How to View Swift Files in iOS Simulator

## Quick Setup (5 minutes)

### Option 1: Use Xcode GUI (Easiest)

1. **Open Xcode**
   ```bash
   open -a Xcode
   ```

2. **Create New Project**
   - File → New → Project
   - Choose "iOS" → "App"
   - Product Name: `CTAS-Preview`
   - Interface: SwiftUI
   - Language: Swift
   - Save to: `/Users/cp5337/Developer/ctas7-command-center/CTAS-iOS-Preview`

3. **Add Swift Files**
   - Drag and drop all `.swift` files from root into the Xcode project
   - Make sure "Copy items if needed" is **unchecked** (we want references)
   - Make sure "Add to targets: CTAS-Preview" is **checked**

4. **Create Main App File**
   Replace `ContentView.swift` with:
   ```swift
   import SwiftUI

   @main
   struct CTASPreviewApp: App {
       var body: some Scene {
           WindowGroup {
               TabView {
                   // Agent Productivity Widget
                   NavigationView {
                       AgentProductivityWidget()
                           .navigationTitle("Agent Productivity")
                   }
                   .tabItem {
                       Label("Agents", systemImage: "person.3.fill")
                   }
                   
                   // CTAS Quality Dashboard
                   NavigationView {
                       CTASQualityDashboard()
                           .environmentObject(CTASQualityAnalyzer())
                           .environmentObject(SDCEngine())
                           .navigationTitle("Quality")
                   }
                   .tabItem {
                       Label("Quality", systemImage: "checkmark.seal.fill")
                   }
                   
                   // Voice Interface
                   NavigationView {
                       VoiceConversationInterface()
                   }
                   .tabItem {
                       Label("Voice", systemImage: "mic.fill")
                   }
               }
           }
       }
   }
   ```

5. **Run in Simulator**
   - Select "iPhone 15 Pro" simulator
   - Press `Cmd + R` to build and run
   - View all the Swift UIs!

---

### Option 2: Command Line (Faster)

I'll create a script to do this automatically:

```bash
cd /Users/cp5337/Developer/ctas7-command-center
./create_ios_preview_app.sh
```

Then open in Xcode:
```bash
open CTAS-iOS-Preview/CTAS-Preview.xcodeproj
```

---

### Option 3: Swift Playgrounds (Quick Preview)

For quick previews without full app:

1. **Open Xcode**
2. **File → New → Playground**
3. **Choose "iOS" platform**
4. **Import the Swift files**:
   ```swift
   import SwiftUI
   import PlaygroundSupport
   
   // Copy/paste one of the Swift files here
   // Then at the bottom:
   
   PlaygroundPage.current.setLiveView(
       AgentProductivityWidget()
           .frame(width: 400, height: 600)
   )
   ```

---

## What You'll See

### 1. Agent Productivity Widget
- Live tracking of Claude, Copilot, Cursor, Codeium
- LOC metrics, nesting levels, last push times
- Animated updates every 30 seconds

### 2. CTAS Quality Dashboard
- Archaeological Code Standard™ metrics
- Three pillars: Preservation, Documentation, Analysis
- CTAS ratings: Artifact, Monument, Structure, etc.

### 3. Voice Conversation Interface
- Full voice assistant UI
- Audio visualizer (waveform)
- Conversation history
- Agent selection (Claude, GPT-4, etc.)

### 4. Neural Mux GIS Viewer
- MapKit integration
- Crate deployment visualization
- Layer controls

---

## Missing Dependencies

Some files reference types that don't exist yet:

### Need to Create:
1. **CTASDBEntity** - Database entity model
2. **SDCProject** - Project model
3. **SDCEngine** - Engine singleton
4. **VoiceAgent** - Agent model
5. **VoiceCommand** - Command model
6. **ConversationMessage** - Message model

I can create stub versions of these so the app compiles.

---

## Quick Start Script

Want me to create a script that:
1. Creates Xcode project
2. Adds all Swift files
3. Creates missing models
4. Opens in Xcode
5. Builds and runs in simulator

Just run:
```bash
cd /Users/cp5337/Developer/ctas7-command-center
./quick_ios_preview.sh
```

---

## Current Status

❌ **Cannot run yet** - Missing Xcode project
❌ **Cannot compile** - Missing model definitions
✅ **Can view in Xcode** - Just need to create project
✅ **Can preview** - Using Swift Playgrounds

---

## Next Steps

1. **Create Xcode project** (I can do this)
2. **Add stub models** (I can do this)
3. **Open in Xcode** (You do this)
4. **Run in simulator** (You do this)

Want me to create the full iOS preview app now? 🎯

