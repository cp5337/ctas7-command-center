# Bolt-On GIS Architecture

## Philosophy: GIS as a Service, Not Deep Integration

**Traditional Approach (BAD)**:
- GIS logic woven throughout your codebase
- Tight coupling to Cesium APIs
- Hard to upgrade, swap, or remove
- Business logic mixed with visualization

**Bolt-On Approach (GOOD)**:
- GIS is a **black box service** you call
- Simple API: "Here's my data, show it on a map"
- Swap GIS engines without touching your code
- Business logic stays in your domain

---

## Architecture: Three-Layer Separation

```
┌─────────────────────────────────────────────────────┐
│         YOUR APPLICATION (CTAS Command Center)      │
│  - Business logic (HFT, routing, satellites)        │
│  - Data management (Supabase, SurrealDB, Sled)      │
│  - Domain models (GroundStation, Satellite, Link)   │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ Simple API calls
                      │
┌─────────────────────▼───────────────────────────────┐
│              GIS ADAPTER (Thin Interface)           │
│  - Translates your data → GIS format                │
│  - Simple methods: show(), hide(), update()         │
│  - No business logic, just data transformation      │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ Pluggable
                      │
┌─────────────────────▼───────────────────────────────┐
│         GIS ENGINE (Cesium, Mapbox, Leaflet, etc.)  │
│  - Pure visualization                               │
│  - Handles rendering, camera, user interaction      │
│  - Swappable without touching your app              │
└─────────────────────────────────────────────────────┘
```

---

## The GIS Adapter: Your Bolt-On Interface

### Simple API (What You Want)

```typescript
// Initialize GIS (one line)
const gis = new CTASGISAdapter('cesiumContainer');

// Show ground stations (one call)
gis.showGroundStations(groundStations, {
  color: (station) => station.tier === 1 ? 'green' : 'blue',
  size: 8,
  label: (station) => station.display_tag
});

// Show satellites (one call)
gis.showSatellites(satellites, {
  color: 'cyan',
  showOrbits: true
});

// Show network links (one call)
gis.showLinks(links, {
  color: (link) => link.status === 'active' ? 'green' : 'red',
  animated: true
});

// Update data (one call)
gis.updateGroundStations(newData);

// Switch GIS engine (one line)
gis.switchEngine('mapbox'); // Cesium → Mapbox, no code changes!
```

### Implementation

```typescript
// src/adapters/CTASGISAdapter.ts

export interface GISEngine {
  initialize(container: string): void;
  addPoints(data: any[], style: any): string; // Returns layer ID
  addLines(data: any[], style: any): string;
  updateLayer(layerId: string, data: any[]): void;
  removeLayer(layerId: string): void;
  setCamera(position: { lat: number; lon: number; height: number }): void;
}

export class CTASGISAdapter {
  private engine: GISEngine;
  private layers: Map<string, string> = new Map(); // Your ID → Engine layer ID

  constructor(container: string, engineType: 'cesium' | 'mapbox' | 'leaflet' = 'cesium') {
    // Pluggable engine
    this.engine = this.createEngine(engineType);
    this.engine.initialize(container);
  }

  private createEngine(type: string): GISEngine {
    switch (type) {
      case 'cesium': return new CesiumEngine();
      case 'mapbox': return new MapboxEngine();
      case 'leaflet': return new LeafletEngine();
      default: throw new Error(`Unknown engine: ${type}`);
    }
  }

  // Simple, high-level API
  showGroundStations(stations: GroundStation[], style?: any): void {
    const layerId = this.engine.addPoints(
      stations.map(s => ({
        lat: s.latitude,
        lon: s.longitude,
        properties: s
      })),
      style
    );
    this.layers.set('ground-stations', layerId);
  }

  showSatellites(satellites: Satellite[], style?: any): void {
    const layerId = this.engine.addPoints(
      satellites.map(s => ({
        lat: s.latitude,
        lon: s.longitude,
        alt: s.altitude,
        properties: s
      })),
      style
    );
    this.layers.set('satellites', layerId);
  }

  showLinks(links: NetworkLink[], style?: any): void {
    const layerId = this.engine.addLines(
      links.map(l => ({
        from: { lat: l.from_lat, lon: l.from_lon },
        to: { lat: l.to_lat, lon: l.to_lon },
        properties: l
      })),
      style
    );
    this.layers.set('network-links', layerId);
  }

  updateGroundStations(stations: GroundStation[]): void {
    const layerId = this.layers.get('ground-stations');
    if (layerId) {
      this.engine.updateLayer(layerId, stations);
    }
  }

  hide(layerName: string): void {
    const layerId = this.layers.get(layerName);
    if (layerId) {
      this.engine.removeLayer(layerId);
    }
  }

  switchEngine(newEngine: 'cesium' | 'mapbox' | 'leaflet'): void {
    // Save current state
    const currentData = this.exportState();
    
    // Destroy old engine
    this.engine.destroy();
    
    // Create new engine
    this.engine = this.createEngine(newEngine);
    this.engine.initialize(this.container);
    
    // Restore state
    this.importState(currentData);
  }
}
```

---

## Cesium Engine Implementation (Bolt-On)

```typescript
// src/adapters/engines/CesiumEngine.ts

export class CesiumEngine implements GISEngine {
  private viewer: Cesium.Viewer | null = null;
  private layerEntities: Map<string, Cesium.Entity[]> = new Map();

  initialize(container: string): void {
    this.viewer = new Cesium.Viewer(container, {
      timeline: false,
      animation: false,
      // ... minimal config
    });
  }

  addPoints(data: any[], style: any): string {
    const layerId = `layer-${Date.now()}`;
    const entities: Cesium.Entity[] = [];

    data.forEach(point => {
      const entity = this.viewer!.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          point.lon,
          point.lat,
          point.alt || 0
        ),
        point: {
          pixelSize: style?.size || 8,
          color: Cesium.Color.fromCssColorString(
            typeof style?.color === 'function'
              ? style.color(point.properties)
              : style?.color || '#ffffff'
          )
        },
        label: style?.label ? {
          text: typeof style.label === 'function'
            ? style.label(point.properties)
            : style.label,
          font: '12px sans-serif',
          pixelOffset: new Cesium.Cartesian2(0, -15)
        } : undefined
      });
      entities.push(entity);
    });

    this.layerEntities.set(layerId, entities);
    return layerId;
  }

  addLines(data: any[], style: any): string {
    const layerId = `layer-${Date.now()}`;
    const entities: Cesium.Entity[] = [];

    data.forEach(line => {
      const entity = this.viewer!.entities.add({
        polyline: {
          positions: [
            Cesium.Cartesian3.fromDegrees(line.from.lon, line.from.lat),
            Cesium.Cartesian3.fromDegrees(line.to.lon, line.to.lat)
          ],
          width: style?.width || 2,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.2,
            color: Cesium.Color.fromCssColorString(
              typeof style?.color === 'function'
                ? style.color(line.properties)
                : style?.color || '#ffffff'
            )
          })
        }
      });
      entities.push(entity);
    });

    this.layerEntities.set(layerId, entities);
    return layerId;
  }

  updateLayer(layerId: string, data: any[]): void {
    // Remove old entities
    this.removeLayer(layerId);
    
    // Add new entities (reuse addPoints/addLines logic)
    // This is simplified; real implementation would preserve style
  }

  removeLayer(layerId: string): void {
    const entities = this.layerEntities.get(layerId);
    if (entities && this.viewer) {
      entities.forEach(e => this.viewer!.entities.remove(e));
      this.layerEntities.delete(layerId);
    }
  }

  setCamera(position: { lat: number; lon: number; height: number }): void {
    this.viewer?.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        position.lon,
        position.lat,
        position.height
      )
    });
  }

  destroy(): void {
    if (this.viewer && !this.viewer.isDestroyed()) {
      this.viewer.destroy();
    }
  }
}
```

---

## Usage in Your Application

### Before (Deeply Integrated - BAD)

```typescript
// Your code is tightly coupled to Cesium
import * as Cesium from 'cesium';

function MyComponent() {
  const viewer = new Cesium.Viewer('container');
  
  // Business logic mixed with Cesium
  groundStations.forEach(station => {
    const color = station.tier === 1 ? '#10b981' : '#3b82f6';
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(
        station.longitude,
        station.latitude
      ),
      point: {
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString(color)
      }
    });
  });
  
  // Now you're stuck with Cesium forever!
}
```

### After (Bolt-On - GOOD)

```typescript
// Your code is GIS-agnostic
import { CTASGISAdapter } from '@/adapters/CTASGISAdapter';

function MyComponent() {
  const gis = new CTASGISAdapter('container', 'cesium');
  
  // Simple, declarative API
  gis.showGroundStations(groundStations, {
    color: (s) => s.tier === 1 ? '#10b981' : '#3b82f6',
    size: 8,
    label: (s) => s.display_tag
  });
  
  // Want to switch to Mapbox? One line:
  // gis.switchEngine('mapbox');
}
```

---

## Three Worlds with Bolt-On GIS

```typescript
// src/worlds/SpaceWorld.ts

export class SpaceWorld {
  constructor(private gis: CTASGISAdapter) {}

  async initialize() {
    // Fetch data from Rust/Supabase
    const satellites = await this.fetchSatellites();
    const orbitalElements = await this.fetchOrbitalElements();
    
    // Show on GIS (one call)
    this.gis.showSatellites(satellites, {
      color: '#06b6d4',
      size: 0.8,
      showOrbits: true
    });
    
    // Add radiation belts (static layer)
    this.gis.showRadiationBelts({
      inner: { color: '#ff6b6b', opacity: 0.3 },
      outer: { color: '#4ecdc4', opacity: 0.2 }
    });
  }

  update(deltaTime: number) {
    // Calculate new positions (Rust WASM)
    const newPositions = rustOrbitalMechanics.propagate(deltaTime);
    
    // Update GIS (one call)
    this.gis.updateSatellites(newPositions);
  }
}

// src/worlds/NetworkWorld.ts

export class NetworkWorld {
  constructor(private gis: CTASGISAdapter) {}

  async initialize() {
    // Fetch from SurrealDB slot graph
    const links = await this.fetchNetworkLinks();
    
    // Show on GIS (one call)
    this.gis.showLinks(links, {
      color: (link) => {
        if (link.status === 'active') return '#10b981';
        if (link.status === 'congested') return '#f59e0b';
        return '#ef4444';
      },
      animated: true,
      width: 2
    });
  }
}

// src/worlds/GroundWorld.ts

export class GroundWorld {
  constructor(private gis: CTASGISAdapter) {}

  async initialize() {
    // Fetch from Supabase
    const stations = await this.fetchGroundStations();
    
    // Show on GIS (one call)
    this.gis.showGroundStations(stations, {
      color: (s) => {
        if (s.tier === 1) return '#10b981';
        if (s.tier === 2) return '#3b82f6';
        return '#6b7280';
      },
      size: (s) => 10 - s.tier * 2,
      label: (s) => s.display_tag
    });
  }
}
```

---

## Benefits of Bolt-On Architecture

### 1. **Minimal Coupling**
- Your code doesn't import Cesium
- GIS is a black box you call
- Easy to upgrade or replace

### 2. **Swappable Engines**
- Start with Cesium
- Switch to Mapbox for 2D
- Try Leaflet for lightweight
- **No code changes in your app**

### 3. **Testability**
- Mock the GIS adapter
- Test your logic without rendering
- Fast unit tests

### 4. **Maintainability**
- GIS updates don't break your code
- Clear separation of concerns
- Easy to understand

### 5. **Flexibility**
- Add new GIS features without touching your domain logic
- Support multiple GIS engines simultaneously
- Easy to add new visualization types

---

## Implementation Plan

### Phase 1: Create GIS Adapter Interface
1. Define `GISEngine` interface
2. Define `CTASGISAdapter` with simple API
3. No Cesium yet, just interfaces

### Phase 2: Implement Cesium Engine
1. Create `CesiumEngine` implementing `GISEngine`
2. Keep it minimal - just rendering
3. No business logic

### Phase 3: Extract Your Logic
1. Move orbital mechanics to Rust WASM
2. Move network routing to SurrealDB queries
3. Move ground station logic to services
4. **Keep all logic OUT of GIS adapter**

### Phase 4: Create World Classes
1. `SpaceWorld` - manages satellite data and updates
2. `NetworkWorld` - manages network topology
3. `GroundWorld` - manages ground stations
4. Each world **calls** GIS adapter, doesn't integrate with it

### Phase 5: (Optional) Add More Engines
1. Implement `MapboxEngine`
2. Implement `LeafletEngine`
3. Users can switch engines at runtime

---

## Key Principle

**GIS is a TOOL you use, not a FRAMEWORK you build on.**

- Your app owns the data
- Your app owns the logic
- GIS just renders what you tell it

This is how you've done it before, and it works!

