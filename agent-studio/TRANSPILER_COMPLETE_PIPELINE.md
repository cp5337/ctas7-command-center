# CTAS-7 Complete Transpiler Pipeline
## Figma → bolt.diy → React Native → Intelligent Transpiler → iOS Native

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE PIPELINE ARCHITECTURE - NO BOTTLENECKS, DIRECT CONNECTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────────┐
│                        DESIGN & INTELLIGENCE                         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
   ┌────▼────┐                 ┌────▼────┐               ┌──────▼──────┐
   │  Figma  │                 │  Canva  │               │   Google    │
   │   API   │                 │   API   │               │  Workspace  │
   │  (EA)   │                 │ (Slides)│               │ (Docs/Sheets)│
   └────┬────┘                 └────┬────┘               └──────┬──────┘
        │                           │                           │
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
                              ┌─────▼─────┐
                              │   Forge   │
                              │ Port 18220│
                              │ (Orchestrator)
                              └─────┬─────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
   ┌────▼────────┐           ┌──────▼──────┐          ┌────────▼────────┐
   │  bolt.diy   │           │  Neural Mux │          │   Crawl4AI      │
   │  Port 5173  │           │  Port 50051 │          │  Intelligence   │
   │ (Code Gen)  │◄──────────┤  (Routing)  ├─────────►│   Gathering     │
   └─────┬───────┘           └─────────────┘          └─────────────────┘
         │
         │ Generated React Native Code
         │
   ┌─────▼─────────────────────────────────────────────────────────┐
   │         ctas7-intelligent-transpiler (Port 19000)             │
   │  ┌─────────────────────────────────────────────────────────┐ │
   │  │  Site Analysis Engine                                   │ │
   │  │  • Parse React Native components                        │ │
   │  │  • Extract design tokens                                │ │
   │  │  • Map component hierarchy                              │ │
   │  └─────────────────────────────────────────────────────────┘ │
   │  ┌─────────────────────────────────────────────────────────┐ │
   │  │  Intelligent Manifest Generator                         │ │
   │  │  • Create SwiftUI views                                 │ │
   │  │  • Map React Native → Swift                             │ │
   │  │  • Generate UIKit bridges                               │ │
   │  └─────────────────────────────────────────────────────────┘ │
   │  ┌─────────────────────────────────────────────────────────┐ │
   │  │  Containerized Transpiler                               │ │
   │  │  • Docker-based execution                               │ │
   │  │  • Deterministic builds                                 │ │
   │  │  • Version-locked dependencies                          │ │
   │  └─────────────────────────────────────────────────────────┘ │
   └───────────────────────────────┬───────────────────────────────┘
                                   │
                          Native iOS App (.xcodeproj)
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
   ┌─────▼─────┐           ┌───────▼──────┐        ┌────────▼────────┐
   │  iPhone   │           │     iPad     │        │   M5 Pro Mac    │
   │  Native   │           │   Optimized  │        │    Desktop      │
   └───────────┘           └──────────────┘        └─────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOD EA ARTIFACTS & BUSINESS CAPTURE PIPELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Forge Orchestrates:

1. Figma EA Templates
   ├─ System Context Diagrams (C4 Level 1)
   ├─ Container Diagrams (C4 Level 2)
   ├─ Component Diagrams (C4 Level 3)
   └─ Deployment Diagrams

        │ Export to
        ▼

2. Canva Business Presentations
   ├─ Executive Briefings
   ├─ Technical Deep Dives
   ├─ Proposal Slides
   └─ Capability Statements

        │ Export to
        ▼

3. Google Workspace Documents
   ├─ Docs → System Specifications
   ├─ Sheets → Cost Models & Schedules
   └─ Slides → Architecture Overviews

        │ Convert to Microsoft Office
        ▼

4. Microsoft Office Package (DOD Compliant)
   ├─ Word (.docx) → EA Documentation
   ├─ PowerPoint (.pptx) → Presentations
   └─ Excel (.xlsx) → Cost/Schedule Data

        │ Package for
        ▼

5. Business Capture & Proposal
   ├─ RFP Response Templates
   ├─ Technical Volume
   ├─ Management Volume
   ├─ Cost Volume
   └─ Past Performance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Key Components

### 1. **Forge (Port 18220)** - Central Orchestrator
- **Direct HTTP connections** to all services
- **No gateway bottleneck** - peer-to-peer communication
- Coordinates multi-service workflows
- TAPS Pub-Sub for real-time updates

### 2. **bolt.diy (Port 5173)** - AI Code Generation
- Containerized self-hosted deployment
- Multi-LLM support (Claude, GPT-4, Gemini, Groq)
- Figma design import
- React Native code generation
- Vercel auto-deployment
- Git integration

### 3. **Intelligent Transpiler (Port 19000)**
- React Native → Swift/UIKit
- Deterministic transpilation
- Design token preservation
- Component mapping
- M-series optimization

### 4. **Document Intelligence Stack**
- **Figma** → EA diagrams (PDF, SVG, PNG)
- **Canva** → Business presentations (PPTX, PDF)
- **Google Workspace** → Documents (Docs, Sheets, Slides)
- **Microsoft Office** → DOD-compliant formats (DOCX, XLSX, PPTX)

## Workflow Examples

### Example 1: Figma → iOS App
```bash
# User voice command to Natasha
"Convert the CTAS tactical dashboard from Figma to iOS"

# Forge orchestrates:
1. Extract Figma design URL from Linear issue
2. Call bolt.diy: POST /api/generate (Figma → React Native)
3. Call transpiler: POST /api/transpile (React Native → iOS)
4. Return .xcodeproj + deployment instructions
```

### Example 2: Generate DOD EA Artifacts
```bash
# User voice command
"Generate complete EA package for CTAS-7 proposal"

# Forge orchestrates:
1. Figma: Generate C4 diagrams for all levels
2. Canva: Create executive presentation
3. Google Docs: Generate system specification
4. Export all to Microsoft Office formats
5. Package for delivery: ZIP with DOCX, PPTX, XLSX
```

### Example 3: Business Capture Automation
```bash
# User voice command
"Create RFP response for DOD contract XYZ"

# Forge orchestrates:
1. Crawl4AI: Extract RFP requirements
2. Google Docs: Generate technical volume
3. Canva: Create capability statement slides
4. Google Sheets: Build cost model
5. Export all to Microsoft Office
6. Store in ABE for AI summarization
```

## Direct Service Communication

**No Bottlenecks:**
```
Forge ──HTTP──> bolt.diy (Code Gen)
      ├──HTTP──> Figma API (Design)
      ├──HTTP──> Canva API (Slides)
      ├──HTTP──> Vercel API (Deploy)
      ├──gRPC──> Neural Mux (Routing)
      └──HTTP──> Transpiler (iOS)
```

**All services are peers** - Forge coordinates, doesn't filter

## Deployment

```bash
cd /Users/cp5337/Developer/ctas7-command-center/agent-studio

# Start complete stack
docker-compose up -d

# Services started:
# - Agent Gateway (15181)
# - bolt.diy (5173)
# - ABE (15170)
# - Neural Mux (50051, 15001)
# - SurrealDB (8000)
# - Redis (6379)

# Test bolt.diy
curl http://localhost:5173/health

# Test Forge → bolt.diy integration
# (From Forge port 18220)
```

## Environment Configuration

Add to `agent-studio/config/.env`:

```bash
# bolt.diy Configuration
BOLT_DIY_URL=http://bolt-diy:5173
BOLT_DIY_ENABLED=true

# Intelligent Transpiler
TRANSPILER_URL=http://localhost:19000
TRANSPILER_ENABLED=true

# Microsoft Office Export
MICROSOFT_OFFICE_EXPORT=true
OFFICE_OUTPUT_DIR=/app/exports/microsoft

# DOD Compliance
DOD_EA_COMPLIANT=true
EA_TEMPLATE_SOURCE=figma
PROPOSAL_AUTOMATION=true
```

## Future Enhancements

1. **Playwright Testing** - Automated UI/UX validation
2. **Phi-3 LoRA** - Fine-tuned transpilation models
3. **AXON Monitoring** - Track transpilation quality
4. **Linear Integration** - Auto-create issues for generated code
5. **Archive Manager** - Version control for generated artifacts

---

**Status**: ✅ Complete transpiler pipeline ready for deployment
**DOD Compliance**: ✅ Microsoft Office export ready
**Business Capture**: ✅ Automated proposal generation ready

