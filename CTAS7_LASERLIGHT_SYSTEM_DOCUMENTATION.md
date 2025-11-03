# CTAS-7 LaserLight Optical Communication Network
## System Architecture & Demo Documentation

**Document Version:** 1.0
**Created:** October 29, 2025
**System:** CTAS-7 Command Center - LaserLight MultiView

---

## Table of Contents

1. [System Overview](#system-overview)
2. [LaserLight MultiView Component](#laserlight-multiview-component)
3. [Ground Station Infrastructure](#ground-station-infrastructure)
4. [WASM Ground Station Network](#wasm-ground-station-network)
5. [MEO Satellite Constellation](#meo-satellite-constellation)
6. [Data Architecture](#data-architecture)
7. [Demo vs Production Modes](#demo-vs-production-modes)
8. [Known Issues & Solutions](#known-issues--solutions)
9. [Development Infrastructure](#development-infrastructure)

---

## System Overview

The CTAS-7 LaserLight system is a **Free Space Optical (FSO) communication network** that provides high-speed laser communication links between:

- **257+ Ground Stations** worldwide (strategic locations)
- **100+ WASM Virtual Ground Stations** (ultra-portable WebAssembly instances)
- **12 MEO Satellites** (MEO-001 through MEO-012) in Medium Earth Orbit
- **Quantum Key Distribution (QKD)** for secure communications
- **Real-time optical beam management** with atmospheric compensation

### Core Capabilities

- **Laser Communication**: Free Space Optical links up to 400 Gbps per beam
- **Global Coverage**: 257 ground stations providing worldwide optical network
- **Virtual Ground Network**: 100+ WASM instances for scalable deployment
- **MEO Constellation**: 12 satellites in Medium Earth Orbit for relay communications
- **Quantum Security**: QKD integration for unhackable communications
- **Weather Adaptation**: Atmospheric compensation and RF backup systems
- **Real-time Visualization**: 3D Cesium globe and 2D tactical displays
- **Ultra-portable Deployment**: WebAssembly ground stations for edge/embedded systems

---

## LaserLight MultiView Component

**Location:** `/src/components/LaserLightMultiView.tsx`

The LaserLightMultiView is the primary interface for monitoring and controlling the optical communication network.

### View Modes

#### 1. **3D Globe View** (`3d-globe`)
- **Cesium 3D Earth** with real terrain
- **Pulsing laser beams** between ground stations and satellites
- **Real-time orbital motion** of MEO constellation
- **Atmospheric scattering effects** visualization
- **Interactive camera controls** (zoom, pan, rotate)

#### 2. **2D Tactical View** (`2d-tactical`)
- **Mercator projection** world map
- **Ground station positions** with status indicators
- **Satellite tracks** and orbital paths
- **Laser link status** with beam quality metrics
- **Weather overlay** integration

#### 3. **Network Diagram** (`network-diagram`)
- **Node-link topology** view
- **Connection matrices** between stations
- **Bandwidth utilization** per link
- **QKD key distribution** status

### Interactive Controls

#### Left Rail - View Controls
- **3D Globe**: Cesium interactive earth
- **2D Tactical**: Flat tactical display
- **Network**: Topology diagram
- **Grid**: Coordinate grid overlay

#### Right Rail - Layer Controls
- **Stations**: Ground station visibility
- **Satellites**: MEO constellation display
- **Beams**: Laser communication links
- **Weather**: Atmospheric conditions
- **Paths**: Orbital trajectory display

#### Bottom Controls
- **Play/Pause**: Animation control
- **Time Speed**: Temporal simulation rate
- **Entity Info**: Selected station/satellite details

---

## Ground Station Infrastructure

### Station Distribution

**Total Stations:** 257+ worldwide strategic locations

#### Tier 1 Strategic Hubs (6 stations)
- **Dubai Strategic Hub** (25.2048°, 55.2708°)
- **New York Metropolitan** (40.7127°, -74.0060°)
- **London Gateway** (51.5074°, -0.1278°)
- **Tokyo Central** (35.6762°, 139.6503°)
- **Sydney Pacific** (-33.8688°, 151.2093°)
- **São Paulo South** (-23.5505°, -46.6333°)

#### Tier 2 Regional Stations (251+ stations)
- **Cable Landing Sites**: Major submarine cable endpoints
- **Strategic Islands**: Hawaii, Ascension, Diego Garcia
- **Continental Hubs**: Major cities and communication centers
- **Remote Outposts**: Arctic, Antarctic, and oceanic coverage

### Station Capabilities

Each ground station includes:

- **Primary FSO Terminal**: 1550nm wavelength, up to 400 Gbps
- **Tracking System**: Sub-arcsecond precision for satellite tracking
- **Atmospheric Compensation**: Adaptive optics for scintillation correction
- **RF Backup**: Fallback communication when optical blocked
- **Weather Monitoring**: Real-time atmospheric condition assessment
- **QKD Integration**: Quantum key distribution terminals

### Geographic Coverage

- **North America**: 89 stations
- **Europe**: 67 stations
- **Asia Pacific**: 71 stations
- **Middle East**: 12 stations
- **Africa**: 8 stations
- **South America**: 6 stations
- **Antarctica**: 4 stations

---

## WASM Ground Station Network

The CTAS-7 system includes a revolutionary **WebAssembly (WASM) Ground Station Network** that provides ultra-portable, virtualized ground stations capable of running across multiple deployment targets.

### Overview

**WASM Ground Stations** are lightweight, virtualized ground station simulators built with Rust and compiled to WebAssembly. They provide full ground station functionality in portable packages that can be deployed anywhere WebAssembly is supported.

**Key Capabilities:**
- **257 Real Ground Station Configurations** with precise GIS coordinates
- **Ultra-portable deployment** across browsers, edge compute, and embedded systems
- **Real-time telemetry generation** with trivariate hash integration
- **MCP integration** for telemetry streaming
- **Cesium visualization bridge** for 3D real-time display
- **Neural Mux routing** for high-speed data processing
- **SatNOGS and OpenLST integration** for real radio connectivity

### Deployment Targets

WASM ground stations can run on:

- **Browser Tabs** (via `wasm32-unknown-unknown`)
- **Firefly Embedded Systems** (via `wasm32-wasi`)
- **Edge Compute Platforms** (Fermyon Spin, Cloudflare Workers)
- **Raspberry Pi** (via Wasmtime/Wasmer)
- **Docker Containers** (production orchestration)

### Architecture

#### Core Components

**Location:** `/ctas7-wasm-ground-station/src/`

1. **Station Configuration System** (`station_config.rs`)
   - Individual configs for all 257 global stations
   - Precise GIS coordinates with UTM/MGRS grid references
   - Operational parameters (frequency, antenna specs, weather thresholds)
   - Cesium visualization settings
   - Station splitting and control configurations

2. **Telemetry Generator** (`telemetry.rs`)
   - Real-time telemetry packet generation
   - CTAS Foundation trivariate hash integration
   - Configurable interval streaming
   - MCP-compatible data formats

3. **Cesium Integration Bridge** (`cesium_bridge.rs`)
   - WebSocket streaming to Cesium 3D visualization
   - Real-time position and status updates
   - Network link management
   - Weather condition simulation

4. **Communication Adapters** (`comms.rs`, `mux.rs`)
   - Neural Mux routing integration
   - HTTP/WebSocket telemetry transmission
   - RF simulation and backup systems

5. **Radio Integrations**
   - **SatNOGS Integration** (`satnogs_integration.rs`) - Community ground station network
   - **OpenLST Integration** (`openlst_integration.rs`) - Open source radio platform

### Global Station Network

#### 257 Real Ground Station Locations

The WASM system includes configurations for **257 real ground stations** worldwide, based on actual satellite communication facilities:

**Major Strategic Locations:**
- **Wallops** (37.9403°, -75.4669°) - NASA Wallops Flight Facility
- **Vandenberg** (34.7420°, -120.5724°) - Space Force Base
- **Baikonur** (45.6200°, 63.3050°) - Kazakhstan Cosmodrome
- **Kourou** (5.2361°, -52.7683°) - ESA Launch Site
- **Tanegashima** (30.3910°, 130.9691°) - JAXA Space Center
- **Diego Garcia** (-7.3134°, 72.4111°) - Strategic Indian Ocean
- **McMurdo** (-77.8419°, 166.6863°) - Antarctica Research

#### Station Configuration Features

Each station includes:

```rust
pub struct StationConfig {
    pub station_id: String,           // GS-001 through GS-257
    pub station_code: String,         // CTAS001-CTAS257
    pub name: String,                 // Human-readable name
    pub location: GISLocation,        // Precise coordinates + UTM/MGRS
    pub operational_params: OperationalParams,  // RF specs
    pub cesium_config: CesiumConfig,  // Visualization settings
    pub split_config: SplitConfig,    // Control and failover
}
```

**Operational Parameters:**
- **Frequency Bands**: L, S, C, X, Ku, Ka
- **Antenna Diameters**: 3.0-12.5 meters
- **Transmit Power**: 100-1100 watts
- **Data Rates**: 10-110 Mbps
- **Weather Thresholds**: Wind, precipitation, visibility limits
- **Tracking Capabilities**: 1.0-3.5 deg/s tracking rates

#### Station Splitting & Control

Advanced station management features:

- **Split Modes**: Independent, Primary/Backup, Load Balanced, Coordinated Pair
- **Control Priority**: 1-10 priority levels
- **Failover Groups**: Automatic backup station assignment
- **Load Balancing**: Distributed traffic management
- **Maintenance Windows**: Scheduled downtime coordination

### Docker Integration

#### WASM Station Pool

**Service:** `ground-station-wasm-pool`
**Location:** Docker Compose service in `docker-compose.ctas7-ground-station.yml:204-238`

**Configuration:**
- **100 WASM Instances** running simultaneously
- **Port Range**: 7000-7100 (one per instance)
- **Scalable Deployment**: 3 replicas with resource limits
- **Integration Endpoints**:
  - Ground Station Core: `http://ground-station-core:8080`
  - Hash Engine: `http://trivariate-hash-engine:8090`
  - Neural Mux: `http://neural-mux-router:9000`

**Environment Variables:**
```yaml
environment:
  - WASM_INSTANCES=100
  - STATION_REFERENCE_ENDPOINT=http://ground-station-core:8080
  - HASH_ENGINE_ENDPOINT=http://trivariate-hash-engine:8090
  - NEURAL_MUX_ENDPOINT=http://neural-mux-router:9000
  - INTERPOLATION_MODE=reference_based
  - SATNOGS_INTEGRATION=enabled
  - OPENLST_SIMULATION=enabled
  - CESIUM_INTEGRATION=enabled
```

**Resource Allocation:**
- **CPU Limits**: 2.0 cores per replica
- **Memory Limits**: 4GB per replica
- **CPU Reservations**: 0.5 cores minimum
- **Memory Reservations**: 1GB minimum

### Integration Features

#### Cesium 3D Visualization

**Real-time Cesium Integration:**
- **CZML Generation**: Automatic Cesium entity generation for all 257 stations
- **Live Updates**: WebSocket streaming of position, status, and telemetry
- **Visual Customization**: Color-coded by frequency band, size by antenna diameter
- **Coverage Areas**: Configurable coverage radius visualization
- **Network Links**: Real-time link quality and bandwidth display

**Cesium Data Flow:**
```
WASM Stations → Cesium Bridge → WebSocket → LaserLightMultiView → 3D Display
```

#### CTAS Foundation Integration

**Trivariate Hash Generation:**
```rust
// Each telemetry packet includes CTAS Foundation hash
fn generate_trivariate_hash(&self, packet: &TelemetryPacket) -> String {
    let mut hasher = Hasher::new();

    // SCH (Schema Hash) - packet structure
    hasher.update(b"ctas7_telemetry_v1");

    // CUID (Context Hash) - station context
    hasher.update(self.config.station_id.as_bytes());
    hasher.update(&self.config.coordinates[0].to_le_bytes());

    // UUID (Content Hash) - packet data
    hasher.update(packet.timestamp.as_bytes());
    hasher.update(&packet.latitude.to_le_bytes());

    // Base96-compatible hash output
    hex::encode(&hash.as_bytes()[..24])
}
```

#### MCP Integration

**Model Context Protocol Support:**
- **Telemetry Streaming**: Direct MCP endpoint integration
- **Real-time Updates**: Configurable interval transmission
- **Error Handling**: Automatic retry and fallback mechanisms
- **Session Management**: UUID-based session tracking

### Operational Features

#### Health Monitoring

Each WASM station provides comprehensive health data:

```rust
pub struct StationStatus {
    pub station_id: String,
    pub is_running: bool,
    pub session_id: String,
    pub uptime_ms: u64,
    pub coordinates: Vec<f64>,
    pub neural_mux_enabled: bool,
    pub last_telemetry: String,
}
```

#### Weather Simulation

**Realistic Weather Modeling:**
- **Location-based conditions**: Latitude/longitude-dependent weather
- **Seasonal variations**: Time-based weather patterns
- **Operational impact**: Weather score affecting station availability
- **Visibility effects**: Precipitation impact on optical links

#### Performance Monitoring

**Real-time Metrics:**
- **CPU Utilization**: Per-station processing load
- **Memory Usage**: WASM instance memory consumption
- **Network Throughput**: Data transmission rates
- **Signal Strength**: Simulated RF signal levels
- **Satellite Tracking**: Number of tracked satellites per station

### Development Features

#### Station Configuration Management

**Individual Station Tinkering:**
```rust
// Export station config for modification
let config_json = station_manager.export_config("GS-001")?;

// Modify and re-import
let modified_config = modify_station_config(config_json);
station_manager.import_config(&modified_config)?;
```

#### Testing and Simulation

**Built-in Test Capabilities:**
- **Monte Carlo Testing**: Statistical reliability analysis
- **Weather Scenario Testing**: Various weather condition simulations
- **Failover Testing**: Station split and backup scenarios
- **Load Testing**: High-throughput data stream testing

### Production Deployment

#### Scaling Strategy

The WASM ground station network supports massive horizontal scaling:

- **Base Deployment**: 100 instances across 3 Docker replicas
- **Geographic Distribution**: Station instances can run near their real-world locations
- **Edge Deployment**: Cloudflare Workers for global distribution
- **Embedded Deployment**: Raspberry Pi stations for remote locations

#### Real-world Integration

**Hybrid Physical/Virtual Network:**
- **Physical Stations**: Real RF hardware at major locations
- **WASM Stations**: Virtual stations filling coverage gaps
- **Seamless Integration**: Unified API and telemetry format
- **Failover Support**: WASM stations as backup for physical hardware

---

## MEO Satellite Constellation

### Constellation Design

**Total Satellites:** 12 (MEO-001 through MEO-012)
**Orbital Altitude:** 12,000-18,000 km (Medium Earth Orbit)
**Orbital Period:** ~6-12 hours (varies by altitude)
**Coverage Pattern:** Global with polar and equatorial coverage

### Satellite Capabilities

Each MEO satellite features:

- **Dual FSO Terminals**: Ground and inter-satellite links
- **Laser Power**: 25-50 watts for long-distance links
- **Beam Steering**: Fast acquisition and tracking systems
- **Relay Capacity**: Up to 1 Tbps aggregate throughput
- **Quantum Repeaters**: QKD relay for global quantum networks
- **Autonomous Operation**: AI-driven beam management

### Orbital Distribution

- **MEO-001 to MEO-004**: Equatorial coverage (±30° inclination)
- **MEO-005 to MEO-008**: Mid-latitude coverage (60° inclination)
- **MEO-009 to MEO-012**: Polar coverage (90° inclination)

---

## Data Architecture

### Database Systems

#### 1. **SurrealDB** (Primary - Port 8000)
- **Ground Station Registry**: 257+ station database
- **Satellite Ephemeris**: Real-time orbital data
- **Network Topology**: Current link configurations
- **Performance Metrics**: Throughput, latency, availability

```surql
-- Example ground station record
CREATE node:dubai_strategic_hub SET
  name = 'Dubai Strategic Hub',
  kind = 'ground',
  lat = 25.2048,
  lon = 55.2708,
  tier = 1,
  bandwidth_gbps = 1000,
  status = 'operational';
```

#### 2. **Supabase** (Demo Data)
- **Mock Ground Stations**: 6 demo stations
- **Test Satellites**: Simplified constellation
- **QKD Metrics**: Sample quantum communication data
- **Weather Data**: Simulated atmospheric conditions

#### 3. **InfluxDB** (Time Series - Planned)
- **Telemetry Streams**: Real-time performance data
- **Beam Quality Metrics**: Signal strength, BER, atmospheric effects
- **Historical Analytics**: Long-term network performance

### Data Flow

```
Ground Stations → SurrealDB → LaserLightMultiView → Cesium 3D
     ↓              ↓              ↓                    ↓
MEO Satellites → WebSocket → React Hooks → Interactive Display
```

---

## Demo vs Production Modes

### Demo Mode (Current)

**Data Source:** Supabase mock data
**Stations:** 6 major cities
**Satellites:** 6 simplified orbits
**Features:**
- ✅ 3D visualization working
- ✅ Laser beam animations
- ✅ Interactive controls
- ✅ Real-time updates
- ❌ Limited to 6 stations
- ❌ Simplified orbital mechanics

### Production Mode (Target)

**Data Source:** SurrealDB + Docker infrastructure
**Stations:** 257+ real ground stations
**Satellites:** 12 MEO constellation
**Features:**
- 🔄 Full ground station network
- 🔄 Real orbital mechanics
- 🔄 Actual performance metrics
- 🔄 Weather integration
- 🔄 QKD status monitoring
- 🔄 Network optimization algorithms

---

## Known Issues & Solutions

### 1. **Ground Stations in Ocean** ❌

**Issue:** Some ground stations appear in ocean instead of on land
**Root Cause:** Coordinate data structure mismatch
**Location:** `useGroundNodes()` hook in `/src/hooks/useSupabaseData.ts`

**Problem:**
```javascript
// Expected: flat coordinates
{ latitude: 25.2048, longitude: 55.2708 }

// Actual: nested position object
{ position: { latitude: 25.2048, longitude: 55.2708 } }
```

**Solution:**
```javascript
// Fix coordinate mapping in useGroundNodes hook
const mappedNodes = data.map(station => ({
  id: station.id,
  name: station.name,
  latitude: station.position?.latitude || station.latitude,
  longitude: station.position?.longitude || station.longitude,
  // ... other fields
}));
```

### 2. **Missing Fallback Data** ❌

**Issue:** Empty ground station array when Supabase fails
**Solution:** Add mock data fallback in error handler

### 3. **SurrealDB Connection** ⚠️

**Issue:** 415 Unsupported Media Type when querying SurrealDB
**Solution:** Fix content-type headers for SurrealDB API calls

---

## Development Infrastructure

### Docker Services

**Location:** `/Cognitive Tactics Engine/docker-compose.ctas7-ground-station.yml`

#### Core Services
- **SurrealDB**: Main database (port 8000)
- **Neural Mux Router**: High-speed routing (port 9000)
- **Trivariate Hash Engine**: Security layer (port 8090)
- **LaserLight FSO Simulator**: MEO constellation (port 6000)

#### Ground Station Services
- **Ground Station Core**: Reference implementation (port 8080)
- **WASM Station Pool**: 100 virtual ground stations (ports 7000-7100)
  - **3 Docker Replicas**: Scalable deployment with resource limits
  - **SatNOGS Integration**: Community ground station network connectivity
  - **OpenLST Integration**: Open source radio platform support
  - **Cesium Integration**: Real-time 3D visualization bridge

#### Supporting Services
- **OpenMCT Dashboard**: Mission control (port 8084)
- **OpenC3 Commands**: Ground station control (port 2900)
- **Prometheus/Grafana**: Monitoring (ports 9090/3000)
- **HAProxy Load Balancer**: High-speed routing (ports 80/443/8404)
- **Redis Cache**: High-speed caching (port 6379)

### Development Commands

```bash
# Start full ground station network
cd "Cognitive Tactics Engine"
docker-compose -f docker-compose.ctas7-ground-station.yml up

# Start ctas7-command-center demo
cd ctas7-command-center
npm run dev

# Query SurrealDB directly
curl -u root:root http://localhost:8000/sql \
  -H "Content-Type: application/json" \
  -H "NS: ctas7" -H "DB: geo" \
  -d "SELECT * FROM node WHERE kind = 'ground';"
```

### File Structure

```
ctas7-command-center/
├── src/
│   ├── components/
│   │   └── LaserLightMultiView.tsx      # Main component
│   ├── hooks/
│   │   └── useSupabaseData.ts           # Data loading hooks
│   ├── services/
│   │   ├── dataLoader.ts                # Data transformation
│   │   └── cesiumWorldManager.ts        # 3D visualization
│   └── types/
│       └── index.ts                     # TypeScript definitions
├── vite.config.ts                       # Proxy to SurrealDB
└── CTAS7_LASERLIGHT_SYSTEM_DOCUMENTATION.md
```

---

## Operational Flow

### 1. **System Initialization**
```
LaserLightMultiView loads → useGroundNodes() hook → Supabase query
   ↓
If successful: Display real data
If failed: Use mock data (6 stations)
   ↓
Cesium viewer initializes → Add ground stations → Add satellites → Render laser beams
```

### 2. **Real-time Updates**
```
Ground stations broadcast telemetry → SurrealDB → WebSocket → React state → Cesium update
MEO satellites update positions → Orbital mechanics → Beam pointing → Visual update
Weather conditions change → Atmospheric model → Beam quality → Color/opacity changes
```

### 3. **User Interactions**
```
User clicks station → Entity selection → Info panel → Performance metrics
User changes view → React state → Cesium camera → Smooth transition
User toggles layers → Layer visibility → Entity show/hide → Render update
```

---

## Next Steps

### Immediate Fixes (Phase 1)
1. ✅ Fix coordinate mapping in `useGroundNodes`
2. ✅ Add mock data fallback for demo stability
3. ✅ Resolve SurrealDB connection issues
4. ⏳ Connect to real 257-station database

### Production Integration (Phase 2)
1. 🔄 Full Docker infrastructure deployment
2. 🔄 Real MEO satellite ephemeris data
3. 🔄 Weather API integration
4. 🔄 QKD performance monitoring
5. 🔄 Network optimization algorithms

### Advanced Features (Phase 3)
1. 📋 Real-time beam steering control
2. 📋 Atmospheric compensation algorithms
3. 📋 Quantum communication metrics
4. 📋 Automated network optimization
5. 📋 Emergency failover procedures

---

**Document Status:** Living document - updated as system evolves
**Maintainer:** CTAS-7 Engineering Team
**Last Updated:** October 29, 2025