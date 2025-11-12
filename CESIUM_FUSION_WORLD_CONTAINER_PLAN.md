# 🌍 Cesium Fusion World - Standalone Container Architecture

**Status**: ARCHITECTURAL PLAN  
**Priority**: HIGH - Leverage existing hard-fought Cesium implementation  
**Goal**: Create a pure, containerized Cesium service with robust layers and APIs for multi-domain fusion

---

## 🎯 Executive Summary

You have a **working Cesium implementation** in `ctas7-command-center` that was "hard-fought" to get right. Instead of rebuilding from scratch, we'll:

1. **Extract** the working Cesium components into a standalone service
2. **Containerize** it in OrbStack for deployment independence
3. **Enhance** it with robust layer system and comprehensive APIs
4. **Integrate** it as the **Fusion World** visualization layer for all CTAS domains

---

## 📊 Current Cesium Implementation Analysis

### ✅ What's Already Working

From your existing `ctas7-command-center`:

```typescript
// Core Components (src/components/)
- CesiumWorldView.tsx           // Main 3D globe component
- CesiumOperatorControls.tsx    // Operator UI controls

// Services (src/services/)
- cesiumWorldManager.ts          // World management (production/staging/sandbox/fusion)
- orbitalAnimation.ts            // Satellite orbital mechanics
- dataLoader.ts                  // Data fetching from Supabase

// Utilities (src/utils/)
- orbitalMechanics.ts            // Orbital calculations
- orbitalZones.ts                // LEO/MEO/GEO zone definitions

// Fusion System (src/fusion/)
- worlds/WorldManager.ts         // Multi-world coordination
- domains/MaritimeDomain.ts      // Maritime entity management
```

### 🔧 Current Capabilities

- ✅ **Multi-World Support**: Production, Staging, Sandbox, Fusion
- ✅ **Entity Management**: Ground stations, satellites, network links
- ✅ **Layer System**: Toggleable layers with opacity control
- ✅ **Maritime Domain**: Vessels, ports, shipping routes, alerts
- ✅ **Time Controls**: Animation speed, play/pause
- ✅ **Camera Management**: Saved positions per world
- ✅ **Event Bus**: Entity selection, time updates, world switching
- ✅ **Real-time Data**: Supabase integration with mock fallback

### 💪 Hard-Fought Victories (Don't Break These!)

From `CESIUM_WORKING.md`:
- **WebGL Configuration**: High-performance settings tuned
- **Position Calculations**: Satellite altitude/lat/lon working
- **Entity Rendering**: 16+ entities rendering correctly
- **Imagery Loading**: Cesium Ion integration stable
- **Camera Controls**: Smooth pan/zoom/rotate

---

## 🏗️ Standalone Container Architecture

### Container Structure

```
ctas7-cesium-fusion-world/
├── Dockerfile                          # OrbStack-optimized container
├── docker-compose.yml                  # Standalone + integrated modes
├── package.json                        # Node.js dependencies
├── tsconfig.json                       # TypeScript config
├── vite.config.ts                      # Vite bundler (fast HMR)
│
├── src/
│   ├── main.ts                         # Entry point
│   ├── app.tsx                         # Root React component
│   │
│   ├── api/                            # REST + WebSocket APIs
│   │   ├── server.ts                   # Express server
│   │   ├── routes/
│   │   │   ├── layers.ts               # Layer management API
│   │   │   ├── entities.ts             # Entity CRUD API
│   │   │   ├── worlds.ts               # World switching API
│   │   │   ├── camera.ts               # Camera control API
│   │   │   └── data.ts                 # Data ingestion API
│   │   └── websocket/
│   │       ├── realtime.ts             # Real-time updates (TAPS)
│   │       └── events.ts               # Event streaming
│   │
│   ├── cesium/                         # Core Cesium logic (extracted)
│   │   ├── CesiumFusionViewer.tsx      # Main viewer component
│   │   ├── WorldManager.ts             # Multi-world orchestration
│   │   ├── LayerManager.ts             # Enhanced layer system
│   │   ├── EntityManager.ts            # Entity lifecycle
│   │   ├── CameraManager.ts            # Camera + bookmarks
│   │   └── TimeManager.ts              # Time controls
│   │
│   ├── layers/                         # Domain-Specific Layers
│   │   ├── SpaceLayer.ts               # Satellites, orbits, debris
│   │   ├── NetworkLayer.ts             # Ground stations, links, CDNs
│   │   ├── MaritimeLayer.ts            # Vessels, ports, cables
│   │   ├── GeospatialLayer.ts          # Terrain, infrastructure, GeoIP
│   │   ├── CyberLayer.ts               # Network topology, threats
│   │   └── FusionLayer.ts              # Multi-domain correlation
│   │
│   ├── data/                           # Data Adapters
│   │   ├── SupabaseAdapter.ts          # Supabase integration
│   │   ├── SurrealDBAdapter.ts         # SurrealDB graph queries
│   │   ├── TAPSAdapter.ts              # Real-time streaming
│   │   ├── GeoJSONAdapter.ts           # KML/GeoJSON import
│   │   └── TeleGeographyAdapter.ts     # Submarine cables
│   │
│   ├── ui/                             # Operator Interface
│   │   ├── ControlPanel.tsx            # Main control panel
│   │   ├── LayerControls.tsx           # Layer toggle/opacity
│   │   ├── EntityInfo.tsx              # Selected entity details
│   │   ├── TimeControls.tsx            # Time manipulation
│   │   └── WorldSelector.tsx           # World switching UI
│   │
│   └── utils/
│       ├── orbitalMechanics.ts         # (existing)
│       ├── orbitalZones.ts             # (existing)
│       ├── geospatialUtils.ts          # Lat/lon/alt conversions
│       └── colorSchemes.ts             # Consistent color palette
│
├── public/
│   ├── assets/
│   │   ├── icons/                      # Entity icons
│   │   ├── models/                     # 3D models (satellites, ships)
│   │   └── textures/                   # Custom globe textures
│   └── data/                           # Static GeoJSON layers
│
├── config/
│   ├── layers.json                     # Layer definitions
│   ├── worlds.json                     # World configurations
│   └── cesium.json                     # Cesium Ion settings
│
└── tests/
    ├── api.spec.ts                     # API endpoint tests
    ├── layers.spec.ts                  # Layer rendering tests
    └── integration.spec.ts             # Full stack tests
```

---

## 🌐 API Specification

### REST API Endpoints

#### Layer Management
```typescript
GET    /api/layers                      // List all layers
GET    /api/layers/:id                  // Get layer details
POST   /api/layers/:id/visibility       // Toggle layer visibility
POST   /api/layers/:id/opacity          // Set layer opacity
POST   /api/layers/:id/filter           // Apply layer filter
GET    /api/layers/:id/entities         // Get entities in layer
```

#### Entity Management
```typescript
GET    /api/entities                    // List all entities
GET    /api/entities/:id                // Get entity details
POST   /api/entities                    // Create entity
PUT    /api/entities/:id                // Update entity
DELETE /api/entities/:id                // Delete entity
POST   /api/entities/bulk               // Bulk import (GeoJSON)
```

#### World Management
```typescript
GET    /api/worlds                      // List worlds
GET    /api/worlds/:name                // Get world state
POST   /api/worlds/:name/switch         // Switch to world
POST   /api/worlds/:name/save           // Save world state
POST   /api/worlds/:name/restore        // Restore world state
```

#### Camera Control
```typescript
GET    /api/camera                      // Get camera position
POST   /api/camera/flyto                // Fly to position
POST   /api/camera/bookmark             // Save bookmark
GET    /api/camera/bookmarks            // List bookmarks
POST   /api/camera/lookat               // Look at entity
```

#### Data Ingestion
```typescript
POST   /api/data/geojson                // Import GeoJSON
POST   /api/data/kml                    // Import KML
POST   /api/data/csv                    // Import CSV (lat/lon)
POST   /api/data/telegeography          // Import submarine cables
GET    /api/data/sources                // List data sources
```

### WebSocket API

```typescript
// Real-time Updates
ws://localhost:8080/ws/realtime

// Messages:
{
  "type": "entity_update",
  "entity_id": "SAT-001",
  "position": [lon, lat, alt],
  "timestamp": "2025-01-09T12:00:00Z"
}

{
  "type": "layer_toggle",
  "layer_id": "maritime",
  "visible": true
}

{
  "type": "world_switch",
  "world": "fusion",
  "timestamp": "2025-01-09T12:00:00Z"
}

{
  "type": "alert",
  "severity": "high",
  "message": "Maritime alert in Suez Canal",
  "entity_id": "VESSEL-003",
  "position": [32.3498, 29.9527]
}
```

---

## 📦 Layer System Architecture

### Layer Hierarchy

```typescript
interface Layer {
  id: string;                           // Unique layer ID
  name: string;                         // Display name
  type: LayerType;                      // space | network | maritime | geospatial | cyber | fusion
  visible: boolean;                     // Visibility toggle
  opacity: number;                      // 0.0 - 1.0
  zIndex: number;                       // Render order
  children?: Layer[];                   // Sub-layers
  dataSource: DataSourceConfig;         // Where to get data
  style: LayerStyle;                    // Visual appearance
  filters: LayerFilter[];               // Active filters
  metadata: Record<string, any>;        // Custom metadata
}

type LayerType = 
  | 'space'                             // Satellites, orbits, debris
  | 'network'                           // Ground stations, links, CDNs
  | 'maritime'                          // Vessels, ports, cables
  | 'geospatial'                        // Terrain, infrastructure, GeoIP
  | 'cyber'                             // Network topology, threats
  | 'fusion';                           // Multi-domain correlation

interface LayerStyle {
  pointSize?: number;
  pointColor?: string;
  lineWidth?: number;
  lineColor?: string;
  fillColor?: string;
  icon?: string;
  model?: string;
  label?: LabelStyle;
}

interface LayerFilter {
  field: string;                        // Entity property to filter
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'in';
  value: any;
}
```

### Pre-Configured Layers

```json
{
  "layers": [
    {
      "id": "space",
      "name": "Space Domain",
      "type": "space",
      "visible": true,
      "opacity": 1.0,
      "zIndex": 100,
      "children": [
        {
          "id": "space.satellites.leo",
          "name": "LEO Satellites",
          "visible": true,
          "style": { "pointColor": "#06b6d4", "pointSize": 8 }
        },
        {
          "id": "space.satellites.meo",
          "name": "MEO Satellites (LaserLight)",
          "visible": true,
          "style": { "pointColor": "#10b981", "pointSize": 10 }
        },
        {
          "id": "space.satellites.geo",
          "name": "GEO Satellites",
          "visible": true,
          "style": { "pointColor": "#f59e0b", "pointSize": 12 }
        },
        {
          "id": "space.orbits",
          "name": "Orbital Paths",
          "visible": false,
          "style": { "lineColor": "#0ea5e9", "lineWidth": 2, "opacity": 0.3 }
        },
        {
          "id": "space.debris",
          "name": "Space Debris",
          "visible": false,
          "style": { "pointColor": "#ef4444", "pointSize": 4 }
        }
      ]
    },
    {
      "id": "network",
      "name": "Network Domain",
      "type": "network",
      "visible": true,
      "opacity": 1.0,
      "zIndex": 90,
      "children": [
        {
          "id": "network.ground_stations",
          "name": "Ground Stations (257)",
          "visible": true,
          "style": { "pointColor": "#10b981", "pointSize": 10, "icon": "laser-station" }
        },
        {
          "id": "network.fso_links",
          "name": "FSO Links (Ground-Sat)",
          "visible": true,
          "style": { "lineColor": "#06b6d4", "lineWidth": 2, "opacity": 0.5 }
        },
        {
          "id": "network.isl_links",
          "name": "Inter-Satellite Links",
          "visible": true,
          "style": { "lineColor": "#f59e0b", "lineWidth": 2, "opacity": 0.4 }
        },
        {
          "id": "network.cdn_nodes",
          "name": "CDN Nodes",
          "visible": false,
          "style": { "pointColor": "#8b5cf6", "pointSize": 8 }
        }
      ]
    },
    {
      "id": "maritime",
      "name": "Maritime Domain",
      "type": "maritime",
      "visible": true,
      "opacity": 1.0,
      "zIndex": 80,
      "children": [
        {
          "id": "maritime.submarine_cables",
          "name": "Submarine Cables (TeleGeography)",
          "visible": true,
          "style": { "lineColor": "#06b6d4", "lineWidth": 3, "opacity": 0.6 }
        },
        {
          "id": "maritime.cable_landings",
          "name": "Cable Landing Points (1,888)",
          "visible": true,
          "style": { "pointColor": "#f59e0b", "pointSize": 8 }
        },
        {
          "id": "maritime.vessels",
          "name": "Vessels (AIS)",
          "visible": true,
          "style": { "icon": "ship", "pointSize": 12 }
        },
        {
          "id": "maritime.ports",
          "name": "Ports",
          "visible": true,
          "style": { "pointColor": "#16a34a", "pointSize": 10 }
        },
        {
          "id": "maritime.shipping_routes",
          "name": "Shipping Routes",
          "visible": false,
          "style": { "lineColor": "#0ea5e9", "lineWidth": 2, "opacity": 0.3 }
        }
      ]
    },
    {
      "id": "geospatial",
      "name": "Geospatial Domain",
      "type": "geospatial",
      "visible": true,
      "opacity": 1.0,
      "zIndex": 70,
      "children": [
        {
          "id": "geospatial.critical_infrastructure",
          "name": "Critical Infrastructure",
          "visible": true,
          "style": { "pointColor": "#ef4444", "pointSize": 10, "icon": "infrastructure" }
        },
        {
          "id": "geospatial.data_centers",
          "name": "Data Centers",
          "visible": true,
          "style": { "pointColor": "#8b5cf6", "pointSize": 10 }
        },
        {
          "id": "geospatial.geoip",
          "name": "GeoIP (Malicious)",
          "visible": false,
          "style": { "pointColor": "#dc2626", "pointSize": 6 }
        },
        {
          "id": "geospatial.weather",
          "name": "Weather Overlays (GEE)",
          "visible": false,
          "style": { "opacity": 0.5 }
        }
      ]
    },
    {
      "id": "cyber",
      "name": "Cyber Domain",
      "type": "cyber",
      "visible": false,
      "opacity": 1.0,
      "zIndex": 60,
      "children": [
        {
          "id": "cyber.network_topology",
          "name": "Network Topology",
          "visible": false,
          "style": { "lineColor": "#8b5cf6", "lineWidth": 2 }
        },
        {
          "id": "cyber.threat_actors",
          "name": "Threat Actor Locations",
          "visible": false,
          "style": { "pointColor": "#dc2626", "pointSize": 10, "icon": "skull" }
        },
        {
          "id": "cyber.attack_vectors",
          "name": "Attack Vectors",
          "visible": false,
          "style": { "lineColor": "#ef4444", "lineWidth": 3, "opacity": 0.7 }
        }
      ]
    },
    {
      "id": "fusion",
      "name": "Fusion Layer",
      "type": "fusion",
      "visible": true,
      "opacity": 1.0,
      "zIndex": 50,
      "children": [
        {
          "id": "fusion.correlations",
          "name": "Multi-Domain Correlations",
          "visible": true,
          "style": { "lineColor": "#f59e0b", "lineWidth": 2, "opacity": 0.5 }
        },
        {
          "id": "fusion.alerts",
          "name": "Fusion Alerts",
          "visible": true,
          "style": { "pointColor": "#ef4444", "pointSize": 14, "icon": "alert" }
        },
        {
          "id": "fusion.heatmaps",
          "name": "Threat Heatmaps",
          "visible": false,
          "style": { "opacity": 0.6 }
        }
      ]
    }
  ]
}
```

---

## 🐳 Docker Configuration

### Dockerfile

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Install dependencies
RUN npm ci

# Copy source
COPY src/ ./src/
COPY public/ ./public/
COPY config/ ./config/

# Build
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/config ./config

# Expose ports
EXPOSE 8080 8081

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node healthcheck.js

# Start server
CMD ["node", "dist/api/server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  cesium-fusion-world:
    build: .
    container_name: ctas7-cesium-fusion-world
    ports:
      - "8080:8080"    # HTTP API
      - "8081:8081"    # WebSocket
    environment:
      - NODE_ENV=production
      - CESIUM_ION_TOKEN=${CESIUM_ION_TOKEN}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
      - SURREALDB_URL=http://surrealdb:8000
      - TAPS_URL=ws://taps:9000
    volumes:
      - ./config:/app/config:ro
      - ./public/data:/app/public/data:ro
      - cesium-cache:/app/.cache
    networks:
      - ctas-network
    depends_on:
      - surrealdb
      - taps
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  surrealdb:
    image: surrealdb/surrealdb:latest
    container_name: ctas7-surrealdb
    ports:
      - "8000:8000"
    command: start --log trace --user root --pass root memory
    networks:
      - ctas-network
    restart: unless-stopped

  taps:
    image: ctas7-taps:latest
    container_name: ctas7-taps
    ports:
      - "9000:9000"
    networks:
      - ctas-network
    restart: unless-stopped

volumes:
  cesium-cache:

networks:
  ctas-network:
    external: true
```

---

## 🔌 Integration Points

### 1. CTAS Main Ops Integration

```typescript
// In CTAS Main Ops frontend
import { CesiumFusionClient } from '@ctas7/cesium-fusion-world-client';

const cesiumClient = new CesiumFusionClient('http://localhost:8080');

// Embed Cesium viewer in iframe
<iframe 
  src="http://localhost:8080/embed?world=fusion&layers=space,network,maritime"
  width="100%"
  height="800px"
/>

// Or use API
await cesiumClient.layers.toggle('maritime.vessels', true);
await cesiumClient.camera.flyTo({ lon: -74, lat: 40, alt: 500000 });
await cesiumClient.entities.create({
  type: 'satellite',
  name: 'LASER-SAT-13',
  position: [0, 0, 8000000]
});
```

### 2. PLASMA Integration

```rust
// In PLASMA (Rust)
use ctas7_cesium_client::CesiumFusionClient;

let cesium = CesiumFusionClient::new("http://localhost:8080");

// Send threat alert to Cesium
cesium.entities.create(Entity {
    id: "THREAT-001".to_string(),
    entity_type: "threat".to_string(),
    position: Position { lon: 32.3498, lat: 29.9527, alt: 0.0 },
    metadata: json!({
        "severity": "high",
        "description": "Suspicious vessel activity"
    })
}).await?;

// Subscribe to entity selections
let mut events = cesium.events.subscribe().await?;
while let Some(event) = events.next().await {
    match event {
        Event::EntitySelected { id, .. } => {
            // Operator clicked on entity in Cesium
            plasma.investigate_entity(&id).await?;
        }
    }
}
```

### 3. Voice Command Integration

```typescript
// Voice Gateway → Cesium
voiceGateway.on('command', async (cmd) => {
  if (cmd.intent === 'show_maritime_domain') {
    await cesiumClient.worlds.switch('fusion');
    await cesiumClient.layers.toggle('maritime', true);
    await cesiumClient.camera.flyTo({ lon: 0, lat: 0, alt: 10000000 });
  }
});
```

---

## 🚀 Deployment Plan

### Phase 1: Extract & Containerize (Day 1)
1. ✅ Create new repo: `ctas7-cesium-fusion-world`
2. ✅ Copy working Cesium components from `ctas7-command-center`
3. ✅ Set up Docker + docker-compose
4. ✅ Build and test container locally
5. ✅ Verify existing functionality works in container

### Phase 2: API Layer (Day 2)
1. ✅ Implement REST API endpoints
2. ✅ Implement WebSocket real-time updates
3. ✅ Add API authentication (JWT)
4. ✅ Create Postman collection for testing
5. ✅ Write API documentation

### Phase 3: Enhanced Layers (Day 3)
1. ✅ Implement LayerManager with hierarchical layers
2. ✅ Add all 6 domain layers (space, network, maritime, geospatial, cyber, fusion)
3. ✅ Integrate TeleGeography submarine cables
4. ✅ Add GeoJSON/KML import
5. ✅ Implement layer filters

### Phase 4: Integration (Day 4)
1. ✅ Create client libraries (TypeScript, Rust)
2. ✅ Integrate with CTAS Main Ops
3. ✅ Integrate with PLASMA
4. ✅ Test voice command integration
5. ✅ Deploy to OrbStack

### Phase 5: Production Hardening (Day 5)
1. ✅ Add comprehensive error handling
2. ✅ Implement rate limiting
3. ✅ Add monitoring (Prometheus metrics)
4. ✅ Set up logging (structured JSON logs)
5. ✅ Performance optimization

---

## 📊 Success Metrics

- ✅ Container boots in < 10 seconds
- ✅ API responds in < 100ms (p95)
- ✅ WebSocket latency < 50ms
- ✅ Supports 1000+ entities without lag
- ✅ 99.9% uptime
- ✅ Zero data loss on container restart

---

## 🎯 Next Steps

**IMMEDIATE (After this plan):**
1. Flip back to PLASMA architecture
2. Define PLASMA → Cesium integration points
3. Ensure PLASMA can send threat alerts to Cesium
4. Ensure Cesium can trigger PLASMA investigations

**TOMORROW:**
1. Start Phase 1: Extract & Containerize
2. Get basic container running
3. Verify existing Cesium functionality

---

**This plan preserves your hard-fought Cesium implementation while making it a robust, standalone service that can be used across all CTAS systems!** 🚀

