# CTAS-7 Dioxus + Playwright Test Harness

**Status:** ✅ **INITIALIZED**
**Framework:** Dioxus + Playwright + SurrealDB
**Version:** 0.7.0

## 🎯 Purpose

Validate visual integrity, DB connectivity, and user interaction consistency across mobile/desktop for the CTAS-7 Enterprise Architecture Console.

## 🏗️ Architecture

### Primary Components

- **Dioxus Runtime**: Renders EA/QA dashboards with SmartCrate-linked DB routes
- **Playwright Harness**: Automated UI/UX and data-binding validation
- **SurrealDB Integration**: Live data sources for DoDAF, BNE cases, QA5 metrics
- **Neural-Mux Triggers**: Real-time event routing for telemetry and KPIs

### Database Routes

```yaml
surrealdb://ctas/docgraph/ov      # Operational Views (DoDAF)
surrealdb://ctas/docgraph/sv      # Systems Views (DoDAF)
surrealdb://ctas/docgraph/bne_cases # Archaeological Cases
supabase://ctas-core/standards    # Technical Standards
supabase://ctas-core/qa5_sources  # QA5 Validation Data
redis://edge-cache/kpi:recycling  # Real-time KPI Metrics
```

### Neural-Mux Topics

```yaml
kpi.recycling    # Archaeological recycling metrics
ops.trackers     # Operational tracking data
qa5.events       # QA5 validation events
```

## 📊 Auto-Discovery & Classification

The Playwright harness automatically discovers and classifies UI elements by:

- **Role**: `drawer-toggle`, `navigation`, `kpi-display`, `action-trigger`
- **Trigger Type**: `click`, `hover`, `interval`, `socket`
- **Dependencies**: `gis`, `database`, `neural-mux`, `css-animations`
- **DB Routes**: Maps to SurrealDB, Supabase, Redis endpoints

### Element Detection

Elements are discovered via data attributes:
```html
<div data-component="kpi-tile"
     data-kpi="recycling-success"
     data-route="redis://edge-cache/kpi:recycling"
     data-action="refresh-kpi">
```

## 🧪 Testing Commands

### Basic Testing
```bash
# Run CTAS-7 specific tests
npm run test:ctas7

# Test all device types (desktop, mobile, tablet)
npm run test:all-devices

# Visual testing with browser UI
npm run test:headed

# Interactive test runner
npm run test:ui
```

### Reports & Analysis
```bash
# Generate action matrix report
npm run inventory

# View markdown action matrix
npm run report:matrix

# View JSON test results
npm run report:json

# Open HTML test report
npm run report:open
```

### Development Setup
```bash
# Seed SurrealDB with test data
npm run db:seed

# Validate XML manifest against XSD schema
npm run validate:schema

# Complete development setup
npm run dev:setup

# Clean test artifacts
npm run clean
```

## 📱 Mobile & Desktop Validation

### Viewport Testing
- **Desktop**: 1280x720 (Chrome)
- **Mobile**: iPhone 12 (375x667)
- **Tablet**: iPad Pro (1024x768)

### Responsive Requirements
- All action bindings must work across viewports
- Mobile layout preserves functionality with responsive scaling
- Touch targets meet minimum 44px accessibility standards

## ⚡ Performance Criteria

### Latency Thresholds
- **Database acknowledgment**: < 250ms
- **UI animations**: < 300ms
- **Neural-Mux events**: < 50ms
- **KPI refresh**: < 200ms

### Success Criteria
- **Button triggers**: Must execute once and only once
- **Slider events**: Must emit Neural-Mux data events
- **Action success rate**: ≥ 95%
- **Mobile compatibility**: 100% action binding preservation

## 📋 Generated Reports

### Action Matrix (`playwright_action_matrix.md`)
| Element | Role | DB Route | Trigger Type | Expected Response | Latency (ms) | Result |
|---------|------|----------|--------------|------------------|--------------|--------|
| archaeology-nav | navigation | surrealdb://ctas/docgraph/bne_cases | click | archaeological-cases-data | 100 | ✅ |
| kpi-recycling-success | kpi-display | redis://edge-cache/kpi:recycling | click | kpi-refresh | 200 | ✅ |

### JSON Report (`playwright_actions_report.json`)
```json
{
  "timestamp": "2025-10-18T20:45:00.000Z",
  "elements": [...],
  "summary": {
    "total": 12,
    "passed": 11,
    "failed": 1,
    "avgLatency": 185.2
  }
}
```

### Visual Artifacts
- `./tests/screenshots/desktop_dashboard.png`
- `./tests/screenshots/mobile_dashboard.png`
- `./tests/reports/html-report/` (Interactive Playwright report)

## 🔧 Configuration

### Environment Variables
```bash
CTAS_BASE=http://localhost:3000           # Application URL
CTAS_DB_URL=ws://localhost:8000           # SurrealDB WebSocket
CTAS_NEURAL_MUX=ws://localhost:18100      # Neural-Mux endpoint
RUST_LOG=info                             # Dioxus logging level
```

### Test Projects
- **CTAS7-Dioxus**: Desktop Chrome testing
- **CTAS7-Mobile**: iPhone 12 simulation
- **CTAS7-Tablet**: iPad Pro simulation
- **CTAS7-Firefox**: Legacy browser support

## 🚀 Execution

### Standard Run
```bash
npx playwright test --project="CTAS7-Dioxus" --reporter=list --trace=retain-on-failure
```

### CI/CD Integration
```bash
npm run ci  # Runs all devices with JSON reporting
```

### Debug Mode
```bash
npm run test:trace  # Captures full trace for debugging
```

## 📁 File Structure

```
/src/dioxus_dashboard/mod.rs           # Dioxus UI components
/tests/playwright/ctas7_dioxus_harness.spec.ts  # Main test harness
/tests/global-setup.ts                 # Environment validation
/playwright.config.ts                  # Multi-device configuration
/schemas/ctas7_ea.xsd                  # XSD validation schema
/manifests/ctas7_ea_manifest.xml       # Infrastructure manifest
/database/surrealdb_seed.surql         # Test data seed script
```

## 🎯 Success Metrics

- ✅ All UI elements auto-discovered and classified
- ✅ Database connectivity validated across all routes
- ✅ Neural-Mux event binding functional
- ✅ Mobile/desktop responsive consistency maintained
- ✅ < 250ms average latency achieved
- ✅ ≥ 95% action success rate
- ✅ Visual regression testing with screenshots
- ✅ Trace capture for failed actions

**Status: READY FOR DEPLOYMENT** 🚀