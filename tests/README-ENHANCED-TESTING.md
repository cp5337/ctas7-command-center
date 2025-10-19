# CTAS-7 Enhanced Testing Infrastructure

## Overview

Comprehensive Playwright testing suite for CTAS-7 Command Center with Layer 2 Mathematical Intelligence Fabric integration and stealth capabilities.

## Test Suites

### 🔍 **Environment Inventory & Bootstrap**
Advanced system discovery and validation tests:

```bash
# Run environment inventory
npm run inventory

# Run bootstrap validation
npm run bootstrap

# Run complete inventory + bootstrap
npm run inventory:full
```

**Features:**
- ✅ **Dashboard Discovery** - Auto-discover CTAS-7 UI components
- ✅ **Service Health Checks** - Validate all microservices (SurrealDB, Neural Mux, etc.)
- ✅ **Performance Metrics** - Sub-50ms latency validation
- ✅ **Export Detection** - Find and trigger JSON/CSV exports
- ✅ **Configuration Analysis** - Extract runtime configuration
- ✅ **Bootstrap Timing** - Measure initialization performance

### 🧠 **Layer 2 Mathematical Intelligence Fabric**
Advanced testing of your mathematical intelligence components:

```bash
# Run Layer 2 fabric tests
npm run layer2:fabric
```

**Features:**
- ✅ **TETH Algorithm Testing** - Entropy analysis validation (0.0-4.0 range)
- ✅ **L* Learning Algorithm** - Active learning and observation tables
- ✅ **Blake3 Authentication** - Layer 2 security validation (64-char hex)
- ✅ **QKD Encryption** - Quantum key distribution testing
- ✅ **Multi-Domain Network** - Satellite, undersea, terrestrial validation
- ✅ **Neural Mux Events** - Intelligent routing verification
- ✅ **Foundation Crate Integration** - Orchestrator validation

### 🥷 **Stealth Testing Capabilities**
Native Playwright stealth configuration (no external plugins):

**Stealth Features:**
- ✅ **Anti-Detection** - Chrome flags for stealth operation
- ✅ **Custom User Agents** - CTAS-7 identification headers
- ✅ **Mathematical Intelligence Injection** - Layer 2 fabric monitoring
- ✅ **Multi-Context Testing** - Stealth and Layer 2 contexts

## Test Configuration Files

### Core Files
- **`playwright.config.ts`** - Main Playwright configuration
- **`stealth-config.ts`** - Enhanced stealth testing framework
- **`ctas7-environment-inventory.spec.ts`** - Environment discovery
- **`ctas7-bootstrap-validation.spec.ts`** - System initialization
- **`layer2-fabric-stealth.spec.ts`** - Layer 2 fabric testing

### Test Results
All test results are saved to `/analysis/` directory:
- **`ctas7_inventory_snapshot.json`** - Environment inventory
- **`ctas7_bootstrap_validation.json`** - Bootstrap performance
- **`ctas7_config_validation.json`** - Configuration analysis

## Available Commands

### Quick Commands
```bash
# Original test suite
npm test                    # Run all tests
npm run test:headed        # Run with browser visible
npm run test:ui            # Run with Playwright UI

# New enhanced commands
npm run inventory          # Environment discovery
npm run bootstrap         # System validation
npm run inventory:full     # Complete analysis
npm run layer2:fabric     # Mathematical intelligence tests

# Device-specific testing
npm run test:mobile        # Mobile responsive tests
npm run test:tablet        # Tablet responsive tests
npm run test:all-devices   # All device configurations

# Reporting
npm run report:open        # Open HTML reports
npm run report:json        # View JSON reports
```

### Environment Variables
```bash
export CTAS_BASE=http://localhost:5173    # Your dev server
export CTAS_ENV=development               # Environment
export CTAS_DB_URL=ws://localhost:8000    # SurrealDB
export CTAS_NEURAL_MUX=ws://localhost:18100  # Neural Mux
```

## Test Projects

### Browser Configurations
- **CTAS7-Dioxus** - Desktop Chrome (1280x720)
- **CTAS7-Mobile** - iPhone 12 (375x667)
- **CTAS7-Tablet** - iPad Pro (1024x768)
- **CTAS7-Firefox** - Desktop Firefox (1280x720)

### Test Targets
- **Dashboard Components** - Dioxus reactive UI
- **Layer 2 Fabric** - Mathematical intelligence
- **Service Integration** - SurrealDB, Neural Mux, Repository
- **Network Performance** - 400 Gbps undersea cables, sub-50ms routing
- **Security Systems** - Blake3 auth, QKD encryption

## Performance Thresholds

### Bootstrap Validation
- **Total Bootstrap Time:** < 15 seconds
- **Layer 2 Fabric Init:** < 10 seconds
- **Navigation Load:** < 5 seconds
- **DOM Content Loaded:** < 5 seconds

### Network Performance
- **Global Latency:** < 50ms
- **Throughput Capacity:** ≤ 400 Gbps
- **Page Load Time:** < 10 seconds
- **Service Health:** > 50% minimum

### Mathematical Intelligence
- **TETH Entropy Range:** 0.0 - 4.0
- **L* Learning Accuracy:** > 80%
- **Blake3 Hash Format:** 64-character hex
- **Authentication Response:** < 8 seconds

## Integration Points

### CTAS-7 Components Tested
- ✅ **Dioxus Dashboard** - Reactive UI components
- ✅ **Neural Mux** - Intelligent routing engine
- ✅ **SurrealDB** - Live telemetry database
- ✅ **Layer 2 Fabric** - Mathematical intelligence
- ✅ **High Speed Routing** - Multi-domain network
- ✅ **Foundation Crates** - Orchestration system

### Service Discovery
- ✅ **Port 5173** - Vite dev server
- ✅ **Port 8000** - SurrealDB WebSocket
- ✅ **Port 18100** - Neural Mux WebSocket
- ✅ **Port 15180** - Repository HTTP
- ✅ **Port 18108** - Statistics HTTP

## Usage Examples

### Run Complete Environment Analysis
```bash
# Start your CTAS-7 services first
npm run dev                 # Start Vite dev server
# Start SurrealDB and Neural Mux services

# Run comprehensive analysis
npm run inventory:full

# View results
cat ./analysis/ctas7_inventory_snapshot.json
cat ./analysis/ctas7_bootstrap_validation.json
```

### Test Layer 2 Mathematical Intelligence
```bash
# Test TETH algorithm and L* learning
npm run layer2:fabric

# View mathematical intelligence results
npm run report:open
```

### Debug with UI Mode
```bash
# Interactive testing with Playwright UI
npm run test:ui

# Or run specific test with browser visible
npm run test:headed -- tests/playwright/layer2-fabric-stealth.spec.ts
```

## Expected Results

### Successful Environment Inventory
```json
{
  "modules": ["Compute", "Data", "Networking", "Layer2", "Fabric"],
  "ctas_components": {
    "data-testid-ctas7": 5,
    "data-dioxus-component": 12,
    "data-testid-layer2": 3
  },
  "layer2_fabric_status": {
    "teth-algorithm": { "visible": true, "content": "Entropy: 2.1" },
    "lstar-learning": { "visible": true, "content": "Learning Active" }
  },
  "performance_metrics": {
    "total_load_time_ms": 3500,
    "dom_content_loaded": 1200
  }
}
```

### Successful Bootstrap Validation
```json
{
  "bootstrap_sequence": [
    "Layer 2 Fabric Initialized",
    "CTAS Dashboard Loaded",
    "Navigation Menu Loaded",
    "TETH Algorithm Active",
    "L* Learning Active"
  ],
  "total_bootstrap_time": 8500,
  "errors": [],
  "performance_validation": {
    "total_time": { "passed": true, "actual_ms": 8500 }
  }
}
```

This enhanced testing infrastructure provides comprehensive validation of your CTAS-7 system with deep integration into your Layer 2 Mathematical Intelligence Fabric!