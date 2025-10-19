# Universal GIS Infrastructure for Legion Worlds

## The Vision: One GIS System, All Worlds

**Problem**: Every Legion world (Space, Network, Ground, Cyber, Maritime, Fusion) needs visualization, but we don't want to recode GIS for each one.

**Solution**: Universal GIS infrastructure where:
1. **Neural Mux** routes visualization requests
2. **One GIS adapter** handles all rendering
3. **Reusable widgets/forms/pages** are mapped to world types
4. **CDN delivers** the right components on demand
5. **No recoding** - just configuration and composition

---

## Architecture: Neural Mux → GIS Adapter → Cesium

```
┌─────────────────────────────────────────────────────────┐
│                    LEGION WORLDS                        │
│  Space | Network | Ground | Cyber | Maritime | Fusion  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ Visualization requests
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  NEURAL MUX                             │
│  - Routes visualization requests                        │
│  - Determines which widgets/forms needed                │
│  - Fetches components from CDN                          │
│  - Calls GIS adapter with standardized data             │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ Standard visualization API
                      │
┌─────────────────────▼───────────────────────────────────┐
│              UNIVERSAL GIS ADAPTER                      │
│  - Single interface for all worlds                      │
│  - Renders points, lines, polygons, 3D objects          │
│  - Manages layers, camera, interactions                 │
│  - World-agnostic (doesn't know about satellites, etc.) │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ Rendering commands
                      │
┌─────────────────────▼───────────────────────────────────┐
│                CESIUM (or Mapbox, Leaflet)              │
│  - Pure rendering engine                                │
│  - Swappable                                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    WIDGET CDN                           │
│  - Reusable forms, panels, controls                     │
│  - Mapped to world types                                │
│  - Delivered on demand                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Universal GIS Adapter: World-Agnostic Interface

### Core Concept: Everything is Geometry + Metadata

```typescript
// Universal data model - works for ANY world
interface GeoEntity {
  id: string;
  geometry: Point | Line | Polygon | Volume;
  properties: Record<string, any>; // World-specific metadata
  style?: RenderStyle;
}

interface Point {
  type: 'point';
  coordinates: [lon: number, lat: number, alt?: number];
}

interface Line {
  type: 'line';
  coordinates: [lon: number, lat: number, alt?: number][];
}

interface Polygon {
  type: 'polygon';
  coordinates: [lon: number, lat: number, alt?: number][][];
}

interface Volume {
  type: 'volume';
  shape: 'sphere' | 'ellipsoid' | 'cylinder' | 'box';
  center: [lon: number, lat: number, alt: number];
  dimensions: any;
}
```

### Universal GIS Adapter

```typescript
// src/adapters/UniversalGISAdapter.ts

export class UniversalGISAdapter {
  private engine: GISEngine;
  private layers: Map<string, Layer> = new Map();

  // Universal API - works for ANY world
  showEntities(worldId: string, entities: GeoEntity[], config?: LayerConfig): string {
    const layerId = `${worldId}-${Date.now()}`;
    
    // Group by geometry type
    const points = entities.filter(e => e.geometry.type === 'point');
    const lines = entities.filter(e => e.geometry.type === 'line');
    const polygons = entities.filter(e => e.geometry.type === 'polygon');
    const volumes = entities.filter(e => e.geometry.type === 'volume');
    
    // Render each type
    if (points.length) this.engine.addPoints(layerId, points, config);
    if (lines.length) this.engine.addLines(layerId, lines, config);
    if (polygons.length) this.engine.addPolygons(layerId, polygons, config);
    if (volumes.length) this.engine.addVolumes(layerId, volumes, config);
    
    this.layers.set(layerId, { worldId, entities, config });
    return layerId;
  }

  updateEntities(layerId: string, entities: GeoEntity[]): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      this.engine.updateLayer(layerId, entities);
      layer.entities = entities;
    }
  }

  hideLayer(layerId: string): void {
    this.engine.hideLayer(layerId);
  }

  removeLayer(layerId: string): void {
    this.engine.removeLayer(layerId);
    this.layers.delete(layerId);
  }
}
```

---

## Neural Mux Integration: World-to-Visualization Mapping

### Neural Mux Routes Visualization Requests

```typescript
// src/neural-mux/VisualizationRouter.ts

export class VisualizationRouter {
  constructor(
    private gis: UniversalGISAdapter,
    private widgetCDN: WidgetCDN
  ) {}

  async visualizeWorld(worldType: string, data: any): Promise<VisualizationResult> {
    // 1. Transform world data to GeoEntities
    const entities = this.transformToGeoEntities(worldType, data);
    
    // 2. Get visualization config for this world type
    const config = await this.getWorldVisualizationConfig(worldType);
    
    // 3. Show on GIS
    const layerId = this.gis.showEntities(worldType, entities, config);
    
    // 4. Load world-specific widgets from CDN
    const widgets = await this.widgetCDN.loadWidgets(config.widgets);
    
    // 5. Return visualization handle
    return {
      layerId,
      widgets,
      controls: this.createControls(worldType, layerId)
    };
  }

  private transformToGeoEntities(worldType: string, data: any): GeoEntity[] {
    // Use world-specific transformer
    const transformer = this.getTransformer(worldType);
    return transformer.transform(data);
  }

  private getTransformer(worldType: string): WorldTransformer {
    // Transformers are registered, not hardcoded
    return this.transformers.get(worldType) || new DefaultTransformer();
  }
}
```

### World-Specific Transformers (Registered, Not Hardcoded)

```typescript
// src/transformers/SpaceWorldTransformer.ts

export class SpaceWorldTransformer implements WorldTransformer {
  transform(data: SpaceWorldData): GeoEntity[] {
    const entities: GeoEntity[] = [];
    
    // Transform satellites to points
    data.satellites.forEach(sat => {
      entities.push({
        id: sat.id,
        geometry: {
          type: 'point',
          coordinates: [sat.longitude, sat.latitude, sat.altitude * 1000]
        },
        properties: {
          name: sat.name,
          type: 'satellite',
          norad_id: sat.norad_id,
          status: sat.status
        },
        style: {
          color: '#06b6d4',
          size: 0.8,
          icon: 'satellite'
        }
      });
    });
    
    // Transform orbital paths to lines
    data.orbits.forEach(orbit => {
      entities.push({
        id: orbit.satellite_id,
        geometry: {
          type: 'line',
          coordinates: orbit.path
        },
        properties: {
          type: 'orbit',
          satellite_id: orbit.satellite_id
        },
        style: {
          color: '#0ea5e9',
          width: 2,
          dashed: true
        }
      });
    });
    
    // Transform radiation belts to volumes
    entities.push({
      id: 'inner-van-allen',
      geometry: {
        type: 'volume',
        shape: 'ellipsoid',
        center: [0, 0, 0],
        dimensions: {
          radii: [13000000, 13000000, 6500000],
          innerRadii: [7378000, 7378000, 3689000]
        }
      },
      properties: {
        type: 'radiation-belt',
        name: 'Inner Van Allen Belt'
      },
      style: {
        color: '#ff6b6b',
        opacity: 0.25
      }
    });
    
    return entities;
  }
}

// src/transformers/NetworkWorldTransformer.ts

export class NetworkWorldTransformer implements WorldTransformer {
  transform(data: NetworkWorldData): GeoEntity[] {
    const entities: GeoEntity[] = [];
    
    // Transform ground stations to points
    data.groundStations.forEach(station => {
      entities.push({
        id: station.id,
        geometry: {
          type: 'point',
          coordinates: [station.longitude, station.latitude]
        },
        properties: {
          name: station.name,
          type: 'ground-station',
          tier: station.tier,
          display_tag: station.display_tag
        },
        style: {
          color: station.tier === 1 ? '#10b981' : station.tier === 2 ? '#3b82f6' : '#6b7280',
          size: 10 - station.tier * 2
        }
      });
    });
    
    // Transform network links to lines
    data.links.forEach(link => {
      entities.push({
        id: link.id,
        geometry: {
          type: 'line',
          coordinates: [
            [link.from_lon, link.from_lat, link.from_alt || 0],
            [link.to_lon, link.to_lat, link.to_alt || 0]
          ]
        },
        properties: {
          type: 'network-link',
          status: link.status,
          bandwidth_gbps: link.bandwidth_gbps,
          latency_ms: link.latency_ms
        },
        style: {
          color: link.status === 'active' ? '#10b981' : link.status === 'congested' ? '#f59e0b' : '#ef4444',
          width: 2,
          animated: true
        }
      });
    });
    
    return entities;
  }
}

// Register transformers
visualizationRouter.registerTransformer('space', new SpaceWorldTransformer());
visualizationRouter.registerTransformer('network', new NetworkWorldTransformer());
visualizationRouter.registerTransformer('ground', new GroundWorldTransformer());
visualizationRouter.registerTransformer('cyber', new CyberWorldTransformer());
visualizationRouter.registerTransformer('maritime', new MaritimeWorldTransformer());
```

---

## Widget CDN: Reusable UI Components

### Widget Mapping Configuration

```typescript
// src/config/world-widget-mappings.ts

export const WORLD_WIDGET_MAPPINGS = {
  space: {
    panels: ['satellite-list', 'orbital-elements', 'radiation-info'],
    controls: ['time-control', 'camera-presets', 'layer-toggle'],
    forms: ['satellite-config', 'orbit-planner']
  },
  network: {
    panels: ['link-status', 'routing-matrix', 'bandwidth-monitor'],
    controls: ['link-filter', 'route-highlighter', 'qkd-toggle'],
    forms: ['link-config', 'route-planner']
  },
  ground: {
    panels: ['station-list', 'weather-overlay', 'tier-breakdown'],
    controls: ['tier-filter', 'region-selector', 'weather-toggle'],
    forms: ['station-config', 'coverage-planner']
  },
  fusion: {
    panels: ['all-worlds-status', 'cross-world-links', 'unified-timeline'],
    controls: ['world-selector', 'fusion-filter', 'correlation-view'],
    forms: ['cross-world-query']
  }
};
```

### Widget CDN Loader

```typescript
// src/services/WidgetCDN.ts

export class WidgetCDN {
  private cache: Map<string, React.ComponentType> = new Map();
  private cdnUrl: string = 'https://cdn.ctas7.io/widgets';

  async loadWidgets(widgetNames: string[]): Promise<Map<string, React.ComponentType>> {
    const widgets = new Map<string, React.ComponentType>();
    
    for (const name of widgetNames) {
      // Check cache first
      if (this.cache.has(name)) {
        widgets.set(name, this.cache.get(name)!);
        continue;
      }
      
      // Load from CDN
      const component = await this.loadWidget(name);
      this.cache.set(name, component);
      widgets.set(name, component);
    }
    
    return widgets;
  }

  private async loadWidget(name: string): Promise<React.ComponentType> {
    // Dynamic import from CDN
    const module = await import(/* @vite-ignore */ `${this.cdnUrl}/${name}.js`);
    return module.default;
  }
}
```

---

## Usage: Visualizing Any World

### Example 1: Space World

```typescript
// Legion Space World requests visualization
const spaceData = {
  satellites: [...],
  orbits: [...],
  radiationBelts: [...]
};

// Neural Mux routes it
const viz = await neuralMux.visualizeWorld('space', spaceData);

// Result:
// - Satellites appear on GIS as cyan points
// - Orbital paths appear as dashed lines
// - Radiation belts appear as semi-transparent volumes
// - Satellite list panel loads from CDN
// - Time control widget loads from CDN
// - Camera presets widget loads from CDN
```

### Example 2: Network World

```typescript
// Legion Network World requests visualization
const networkData = {
  groundStations: [...],
  satellites: [...],
  links: [...]
};

// Neural Mux routes it
const viz = await neuralMux.visualizeWorld('network', networkData);

// Result:
// - Ground stations appear as colored points (tier-based)
// - Laser links appear as animated lines (status-based colors)
// - Link status panel loads from CDN
// - Routing matrix widget loads from CDN
// - Link filter control loads from CDN
```

### Example 3: Cyber World (New!)

```typescript
// Legion Cyber World requests visualization (geographic cyber threats)
const cyberData = {
  attackSources: [...],  // IPs with geolocation
  targets: [...],        // Your infrastructure
  attackVectors: [...]   // Connections between sources and targets
};

// Neural Mux routes it
const viz = await neuralMux.visualizeWorld('cyber', cyberData);

// Result:
// - Attack sources appear as red points
// - Your infrastructure appears as green points
// - Attack vectors appear as red animated lines
// - Threat panel loads from CDN
// - Attack filter control loads from CDN
// - NO GIS RECODING NEEDED!
```

---

## Key Benefits

### 1. **One GIS System, All Worlds**
- Universal GIS adapter doesn't know about satellites, ground stations, or cyber threats
- It only knows about points, lines, polygons, volumes
- Works for ANY Legion world

### 2. **Reusable Widgets**
- Widgets are mapped to world types
- Same widget can be reused across worlds
- CDN delivers only what's needed

### 3. **No Recoding**
- Add new world? Write a transformer, register it, done
- Need new visualization? Add widget to CDN, update mapping
- GIS adapter stays unchanged

### 4. **Neural Mux Orchestration**
- Neural Mux knows which widgets each world needs
- Neural Mux transforms world data to GeoEntities
- Neural Mux coordinates everything

### 5. **Composability**
- Mix and match widgets
- Combine multiple worlds (Fusion view)
- Reuse components across processes

---

## Implementation Checklist

### Phase 1: Universal GIS Adapter
- [ ] Define `GeoEntity` interface (point, line, polygon, volume)
- [ ] Create `UniversalGISAdapter` with world-agnostic API
- [ ] Implement Cesium engine for rendering

### Phase 2: World Transformers
- [ ] Create `WorldTransformer` interface
- [ ] Implement `SpaceWorldTransformer`
- [ ] Implement `NetworkWorldTransformer`
- [ ] Implement `GroundWorldTransformer`
- [ ] Register transformers with Neural Mux

### Phase 3: Widget CDN
- [ ] Set up widget CDN infrastructure
- [ ] Create reusable widget library
- [ ] Define world-to-widget mappings
- [ ] Implement dynamic widget loading

### Phase 4: Neural Mux Integration
- [ ] Create `VisualizationRouter` in Neural Mux
- [ ] Connect to Universal GIS Adapter
- [ ] Connect to Widget CDN
- [ ] Test with Space World
- [ ] Test with Network World

### Phase 5: Expand to All Worlds
- [ ] Add Cyber World transformer and widgets
- [ ] Add Maritime World transformer and widgets
- [ ] Add Fusion World (combines all)
- [ ] Document how to add new worlds

---

## The Power: Adding a New World

### Before (Old Way - Recoding GIS)
```
1. Create new Cesium component
2. Write rendering logic
3. Handle entity lifecycle
4. Manage camera controls
5. Build custom UI panels
6. Integrate with data sources
7. Test everything
8. Deploy
= 2-3 weeks of work
```

### After (New Way - Configuration)
```
1. Write WorldTransformer (1 file, ~100 lines)
2. Register transformer with Neural Mux (1 line)
3. Define widget mapping (5 lines in config)
4. Done!
= 2-3 hours of work
```

---

## This is the CTAS Way

**Universal infrastructure that adapts to any world, not custom code for each world.**

Neural Mux + Universal GIS + Widget CDN = Infinite scalability

