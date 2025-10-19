# Cesium Logic Audit - What Needs to Move to Rust

## Executive Summary

**Current State**: ~2,000 lines of business logic embedded in Cesium components and utilities  
**Target State**: Cesium = pure visualization, all logic in Rust crates  
**Effort**: Medium (2-3 days to extract and refactor)

---

## 1. Orbital Mechanics Logic (CRITICAL - Move to Rust)

### File: `src/utils/orbitalMechanics.ts` (~350 lines)

**Heavy Math Operations**:
- `simplifiedSGP4Propagate()` - Satellite position propagation (SGP4 algorithm)
- `eciToGeodetic()` - Coordinate transformations (ECI → Geodetic)
- `calculateGMST()` - Greenwich Mean Sidereal Time
- `calculateLShell()` - Magnetic field L-shell calculation
- `calculateMagneticField()` - Earth's magnetic field modeling
- `calculateRadiationFlux()` - Van Allen belt radiation calculations
- `calculateRadiationParameters()` - Comprehensive radiation environment
- `calculateLinkGeometry()` - Ground-to-satellite link geometry
- `calculateDopplerShift()` - Doppler frequency shifts
- `calculateAtmosphericAttenuation()` - Signal attenuation through atmosphere

**Why Rust?**:
- Performance-critical (runs every frame for 12+ satellites)
- Complex floating-point math
- Can leverage existing `nyx` crate for orbital mechanics
- WASM compilation for browser or native for backend

**Rust Crate Candidate**: `ctas7-orbital-mechanics` or use existing `nyx-space`

---

## 2. Orbital Animation Manager (Move to Rust/Service)

### File: `src/services/orbitalAnimation.ts` (~370 lines)

**What It Does**:
- Manages satellite entities and their animations
- Updates satellite positions every frame
- Manages laser link rendering
- Handles ground station tracking

**Current Architecture** (BAD):
```typescript
class OrbitalAnimationManager {
  // Tightly coupled to Cesium
  private viewer: Cesium.Viewer;
  
  // Business logic mixed with rendering
  updateSatellitePosition() {
    const pos = simplifiedSGP4Propagate(...); // LOGIC
    this.entity.position = Cesium.Cartesian3(...); // RENDERING
  }
}
```

**Target Architecture** (GOOD):
```typescript
// Pure logic service (or Rust WASM)
class SpaceLogicService {
  updateSatellitePositions(): SatelliteState[] {
    // Call Rust WASM or native module
    return rustOrbitalMechanics.propagateAll(satellites, time);
  }
}

// Pure Cesium renderer
class SatelliteRenderer {
  render(viewer: Cesium.Viewer, states: SatelliteState[]) {
    // Only rendering, no logic
    states.forEach(state => {
      entity.position = Cesium.Cartesian3.fromDegrees(...);
    });
  }
}
```

---

## 3. Beam Quality Calculations (Move to Rust)

### File: `src/utils/beamQuality.ts` (~200 lines)

**Complex Calculations**:
- `calculateOpticalQuality()` - Optical link quality metrics
- `calculateAtmosphericQuality()` - Weather impact on beams
- `calculateGeometricQuality()` - Link geometry quality
- `calculateRadiationQuality()` - Radiation belt impact
- `calculateStabilityQuality()` - Link stability metrics
- `calculateQBERPenalty()` - Quantum Bit Error Rate penalties
- `calculateCompositeQuality()` - Overall beam quality score

**Why Rust?**:
- Performance-critical (259 ground stations × 12 satellites = 3,108 potential links)
- Complex floating-point math
- Can be parallelized with Rayon
- Deterministic results needed for HFT routing

**Rust Crate Candidate**: `ctas7-beam-quality` or integrate into `beam-patterns-wasm`

---

## 4. Network Routing Logic (Move to Rust + SurrealDB)

### File: `src/services/networkWorldData.ts` (~400 lines)

**What It Does**:
- `calculateOptimalRoute()` - Dijkstra's algorithm for path finding
- Network link management
- Ground station and satellite data structures

**Current State**: Stub implementation in TypeScript

**Target State**: 
- Rust crate with graph algorithms (Dijkstra, A*, multi-constraint routing)
- SurrealDB for graph storage
- Sled for hot path caching

**Rust Crate Candidate**: `ctas7-network-routing` or extend existing HFT crate

---

## 5. Cesium World Manager (Refactor, Keep in TS)

### File: `src/services/cesiumWorldManager.ts` (~430 lines)

**What It Does**:
- Manages Cesium data sources
- Handles world switching (production, staging, sandbox, fusion)
- Entity lifecycle management

**Current State**: Mix of logic and rendering

**Target State**: 
- Keep in TypeScript (not performance-critical)
- Refactor to use plugin architecture
- Separate entity management from business logic

**Action**: Refactor, not rewrite in Rust

---

## 6. Weather Service (Keep in TS or Move to Rust)

### File: `src/services/weatherService.ts` (~50 lines)

**What It Does**:
- Fetches weather data from APIs
- Calculates weather scores for ground stations

**Decision**: 
- If just API calls → Keep in TypeScript
- If complex weather modeling → Move to Rust

---

## Logic Extraction Priority

### Phase 1: CRITICAL (Do First)
1. **Orbital Mechanics** → Rust crate or `nyx-space` integration
   - Files: `orbitalMechanics.ts` (350 lines)
   - Impact: Performance, accuracy, real-time animation
   - Rust Crate: `ctas7-orbital-mechanics` or use `nyx`

2. **Beam Quality** → Rust crate
   - Files: `beamQuality.ts` (200 lines)
   - Impact: HFT routing decisions, network optimization
   - Rust Crate: `ctas7-beam-quality`

### Phase 2: HIGH PRIORITY
3. **Network Routing** → Rust + SurrealDB
   - Files: `networkWorldData.ts` (400 lines)
   - Impact: HFT system, optimal path finding
   - Rust Crate: `ctas7-network-routing`

4. **Orbital Animation Manager** → Refactor to service
   - Files: `orbitalAnimation.ts` (370 lines)
   - Impact: Clean separation of concerns
   - Action: Extract logic to `SpaceLogicService`, keep rendering in TS

### Phase 3: MEDIUM PRIORITY
5. **Cesium World Manager** → Refactor
   - Files: `cesiumWorldManager.ts` (430 lines)
   - Impact: Plugin architecture enablement
   - Action: Refactor to `CTASGISEngine` pattern

---

## Rust Crate Architecture

### Proposed Crates

```
ctas7-space-logic/
├── orbital-mechanics/     # SGP4, coordinate transforms
├── radiation-modeling/    # Van Allen belts, SEU probability
└── link-geometry/         # Ground-to-sat geometry, Doppler

ctas7-network-logic/
├── routing/               # Dijkstra, A*, multi-constraint
├── beam-quality/          # Link quality calculations
└── slot-graph/            # SurrealDB integration

ctas7-gis-wasm/            # WASM bindings for browser
├── space-wasm/            # Orbital mechanics WASM
└── network-wasm/          # Routing WASM
```

### Integration Pattern

```typescript
// Import Rust WASM
import * as spaceLogic from '@ctas7/space-logic-wasm';
import * as networkLogic from '@ctas7/network-logic-wasm';

// Use in services
class SpaceLogicService {
  async updateSatellites(time: number): Promise<SatelliteState[]> {
    // Call Rust WASM
    return spaceLogic.propagate_satellites(this.satellites, time);
  }
}

class NetworkLogicService {
  async findOptimalRoute(from: string, to: string): Promise<Route> {
    // Call Rust WASM
    return networkLogic.find_optimal_path(from, to, this.constraints);
  }
}
```

---

## Summary: How Much Logic is in Cesium?

### Total Logic to Extract: ~1,800 lines

| Component | Lines | Priority | Target |
|-----------|-------|----------|--------|
| Orbital Mechanics | 350 | CRITICAL | Rust crate |
| Beam Quality | 200 | CRITICAL | Rust crate |
| Network Routing | 400 | HIGH | Rust + SurrealDB |
| Orbital Animation | 370 | HIGH | Refactor to service |
| Cesium World Manager | 430 | MEDIUM | Refactor to plugin engine |
| Weather Service | 50 | LOW | Keep in TS or Rust |

### Cesium Should Only Have: ~200 lines

- Entity creation (points, billboards, polylines)
- Camera controls
- Event handlers (click, hover)
- Visual styling

### Everything Else: Rust or TypeScript Services

- **Rust**: Math-heavy, performance-critical (orbital mechanics, beam quality, routing)
- **TypeScript Services**: API calls, data fetching, orchestration
- **Cesium**: Pure visualization

---

## Next Steps

1. **Audit existing Rust crates** - Do you already have orbital mechanics or routing crates?
2. **Create WASM bindings** - For browser integration
3. **Build plugin architecture** - As outlined in the plan
4. **Extract logic incrementally** - Start with orbital mechanics (biggest impact)
5. **Benchmark** - Measure performance improvements

---

## Questions for You

1. **Do you have existing Rust crates for**:
   - Orbital mechanics (nyx-space or similar)?
   - Network routing/graph algorithms?
   - Beam pattern calculations?

2. **Deployment preference**:
   - WASM for browser (slower, but portable)?
   - Native Rust modules for Node.js (faster, but platform-specific)?
   - Hybrid (WASM for frontend, native for backend)?

3. **Python's role**:
   - Development/prototyping only?
   - Offline batch processing?
   - Remove entirely?

