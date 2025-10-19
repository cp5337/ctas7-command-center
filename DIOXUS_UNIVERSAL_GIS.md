# Universal GIS for Dioxus - Full Rust Stack

## Architecture: Rust Everywhere

```
┌─────────────────────────────────────────────────┐
│         Dioxus Frontend (Rust → WASM)           │
│  - Universal GIS Adapter                        │
│  - World Transformers                           │
│  - UI Components                                │
└─────────────────────┬───────────────────────────┘
                      │
                      │ All Rust, no FFI overhead
                      │
┌─────────────────────▼───────────────────────────┐
│         Rust Logic Crates                       │
│  - ctas7-orbital-mechanics                      │
│  - ctas7-beam-quality                           │
│  - ctas7-network-routing                        │
└─────────────────────┬───────────────────────────┘
                      │
                      │ Direct function calls
                      │
┌─────────────────────▼───────────────────────────┐
│         Rust Backend (Actix-Web/Axum)           │
│  - SurrealDB integration                        │
│  - Supabase client                              │
│  - WebSocket server                             │
└─────────────────────────────────────────────────┘
```

## Benefits of Dioxus + Rust Stack

### 1. **No JavaScript/TypeScript**
- Everything in Rust
- Type safety across frontend and backend
- Share types between frontend and backend (no duplication)

### 2. **Direct Crate Integration**
- Frontend can call `ctas7-orbital-mechanics` directly
- No WASM bindings needed (it's already Rust)
- No serialization overhead

### 3. **Performance**
- Rust → WASM is faster than JavaScript
- No GC pauses
- Predictable performance

### 4. **Code Reuse**
- Same `GeoEntity` struct in frontend and backend
- Same transformers can run in browser or server
- Same validation logic everywhere

---

## Dioxus Universal GIS Implementation

### Core Types (Shared Crate)

```rust
// crates/ctas7-gis-core/src/geo_entity.rs

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Geometry {
    Point {
        coordinates: [f64; 3], // [lon, lat, alt]
    },
    Line {
        coordinates: Vec<[f64; 3]>,
    },
    Polygon {
        coordinates: Vec<Vec<[f64; 3]>>,
    },
    Volume {
        shape: VolumeShape,
        center: [f64; 3],
        dimensions: VolumeDimensions,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VolumeShape {
    Sphere,
    Ellipsoid,
    Cylinder,
    Box,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VolumeDimensions {
    pub radii: Option<[f64; 3]>,
    pub inner_radii: Option<[f64; 3]>,
    pub height: Option<f64>,
    pub radius: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RenderStyle {
    pub color: Option<String>,
    pub size: Option<f64>,
    pub width: Option<f64>,
    pub opacity: Option<f64>,
    pub icon: Option<String>,
    pub label: Option<String>,
    pub animated: Option<bool>,
    pub dashed: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeoEntity {
    pub id: String,
    pub geometry: Geometry,
    pub properties: serde_json::Value, // Flexible metadata
    pub style: Option<RenderStyle>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LayerConfig {
    pub visible: bool,
    pub interactive: bool,
    pub z_index: i32,
}
```

### GIS Engine Trait

```rust
// crates/ctas7-gis-core/src/engine.rs

use crate::geo_entity::{GeoEntity, LayerConfig};

pub trait GISEngine {
    fn initialize(&mut self, container_id: &str);
    fn add_layer(&mut self, layer_id: &str, entities: Vec<GeoEntity>, config: Option<LayerConfig>);
    fn update_layer(&mut self, layer_id: &str, entities: Vec<GeoEntity>);
    fn hide_layer(&mut self, layer_id: &str);
    fn show_layer(&mut self, layer_id: &str);
    fn remove_layer(&mut self, layer_id: &str);
    fn set_camera(&mut self, lat: f64, lon: f64, height: f64);
    fn destroy(&mut self);
}
```

### Universal GIS Adapter

```rust
// crates/ctas7-gis-core/src/adapter.rs

use std::collections::HashMap;
use crate::engine::GISEngine;
use crate::geo_entity::{GeoEntity, LayerConfig};

pub struct UniversalGISAdapter<E: GISEngine> {
    engine: E,
    layers: HashMap<String, LayerData>,
}

struct LayerData {
    world_id: String,
    entities: Vec<GeoEntity>,
    config: Option<LayerConfig>,
}

impl<E: GISEngine> UniversalGISAdapter<E> {
    pub fn new(engine: E) -> Self {
        Self {
            engine,
            layers: HashMap::new(),
        }
    }

    pub fn initialize(&mut self, container_id: &str) {
        self.engine.initialize(container_id);
    }

    pub fn show_entities(
        &mut self,
        world_id: &str,
        entities: Vec<GeoEntity>,
        config: Option<LayerConfig>,
    ) -> String {
        let layer_id = format!("{}-{}", world_id, chrono::Utc::now().timestamp_millis());
        
        self.engine.add_layer(&layer_id, entities.clone(), config.clone());
        
        self.layers.insert(
            layer_id.clone(),
            LayerData {
                world_id: world_id.to_string(),
                entities,
                config,
            },
        );
        
        layer_id
    }

    pub fn update_entities(&mut self, layer_id: &str, entities: Vec<GeoEntity>) {
        if let Some(layer) = self.layers.get_mut(layer_id) {
            self.engine.update_layer(layer_id, entities.clone());
            layer.entities = entities;
        }
    }

    pub fn hide_layer(&mut self, layer_id: &str) {
        self.engine.hide_layer(layer_id);
    }

    pub fn show_layer(&mut self, layer_id: &str) {
        self.engine.show_layer(layer_id);
    }

    pub fn remove_layer(&mut self, layer_id: &str) {
        self.engine.remove_layer(layer_id);
        self.layers.remove(layer_id);
    }

    pub fn remove_world(&mut self, world_id: &str) {
        let layer_ids: Vec<String> = self
            .layers
            .iter()
            .filter(|(_, layer)| layer.world_id == world_id)
            .map(|(id, _)| id.clone())
            .collect();

        for layer_id in layer_ids {
            self.remove_layer(&layer_id);
        }
    }
}
```

### World Transformers

```rust
// crates/ctas7-gis-transformers/src/space_world.rs

use ctas7_gis_core::geo_entity::{GeoEntity, Geometry, RenderStyle};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Satellite {
    pub id: String,
    pub name: String,
    pub latitude: f64,
    pub longitude: f64,
    pub altitude: f64,
    pub norad_id: Option<String>,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpaceWorldData {
    pub satellites: Vec<Satellite>,
}

pub struct SpaceWorldTransformer;

impl SpaceWorldTransformer {
    pub fn transform(data: SpaceWorldData) -> Vec<GeoEntity> {
        data.satellites
            .into_iter()
            .map(|sat| GeoEntity {
                id: sat.id.clone(),
                geometry: Geometry::Point {
                    coordinates: [sat.longitude, sat.latitude, sat.altitude * 1000.0],
                },
                properties: serde_json::json!({
                    "name": sat.name,
                    "type": "satellite",
                    "norad_id": sat.norad_id,
                    "status": sat.status,
                    "altitude_km": sat.altitude,
                }),
                style: Some(RenderStyle {
                    color: Some("#06b6d4".to_string()),
                    size: Some(0.8),
                    icon: Some("satellite".to_string()),
                    label: Some(sat.name),
                    ..Default::default()
                }),
            })
            .collect()
    }
}
```

### Dioxus Component

```rust
// src/pages/universal_gis_demo.rs

use dioxus::prelude::*;
use ctas7_gis_core::{adapter::UniversalGISAdapter, geo_entity::GeoEntity};
use ctas7_gis_engines::DioxusGISEngine; // Your Dioxus-specific engine
use ctas7_gis_transformers::{SpaceWorldTransformer, NetworkWorldTransformer};

#[component]
pub fn UniversalGISDemo() -> Element {
    let mut gis = use_signal(|| {
        let engine = DioxusGISEngine::new();
        UniversalGISAdapter::new(engine)
    });
    
    let mut active_world = use_signal(|| None::<String>);

    let show_space_world = move |_| {
        // Mock space data
        let space_data = SpaceWorldData {
            satellites: vec![
                Satellite {
                    id: "sat-001".to_string(),
                    name: "CTAS-Alpha".to_string(),
                    latitude: 45.5,
                    longitude: -122.6,
                    altitude: 550.0,
                    norad_id: Some("12345".to_string()),
                    status: "active".to_string(),
                },
            ],
        };

        // Transform and visualize
        let entities = SpaceWorldTransformer::transform(space_data);
        gis.write().show_entities("space", entities, None);
        active_world.set(Some("space".to_string()));
    };

    let show_network_world = move |_| {
        // Similar to space world...
        let network_data = NetworkWorldData {
            ground_stations: vec![/* ... */],
            links: vec![/* ... */],
        };

        let entities = NetworkWorldTransformer::transform(network_data);
        gis.write().show_entities("network", entities, None);
        active_world.set(Some("network".to_string()));
    };

    let clear_all = move |_| {
        if let Some(world) = active_world.read().as_ref() {
            gis.write().remove_world(world);
            active_world.set(None);
        }
    };

    rsx! {
        div {
            class: "min-h-screen bg-slate-950 p-6",
            div {
                class: "max-w-7xl mx-auto",
                
                // Header Card
                div {
                    class: "bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6",
                    h1 {
                        class: "text-2xl text-cyan-400 font-bold mb-2",
                        "Universal GIS Infrastructure - Dioxus Edition"
                    }
                    p {
                        class: "text-slate-400 text-sm",
                        "Full Rust stack: Dioxus frontend + Rust logic crates + Rust backend"
                    }
                }

                // Controls
                div {
                    class: "flex gap-3 mb-6",
                    button {
                        class: "px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded",
                        onclick: show_space_world,
                        "🛰️ Show Space World"
                    }
                    button {
                        class: "px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded",
                        onclick: show_network_world,
                        "🌐 Show Network World"
                    }
                    button {
                        class: "px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded border border-slate-600",
                        onclick: clear_all,
                        "Clear All"
                    }
                }

                // GIS Container
                div {
                    id: "gis-container",
                    class: "w-full h-[600px] bg-slate-900 rounded-lg border border-slate-700"
                }
            }
        }
    }
}
```

---

## Integration with Existing Rust Crates

### Direct Crate Calls (No WASM Bindings Needed!)

```rust
// In your Dioxus component, call Rust crates directly:

use ctas7_orbital_mechanics::propagate_satellites;
use ctas7_beam_quality::calculate_link_quality;
use ctas7_network_routing::find_optimal_path;

#[component]
pub fn SpaceWorld() -> Element {
    let update_satellites = move |_| {
        // Call Rust crate directly - no FFI, no serialization!
        let new_positions = propagate_satellites(satellites, delta_time);
        
        // Transform to GeoEntities
        let entities = SpaceWorldTransformer::transform(new_positions);
        
        // Update GIS
        gis.write().update_entities(&layer_id, entities);
    };

    // ...
}
```

### Shared Types Between Frontend and Backend

```rust
// crates/ctas7-types/src/lib.rs
// This crate is used by BOTH frontend (Dioxus) and backend (Actix-Web)

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GroundStation {
    pub id: String,
    pub name: String,
    pub latitude: f64,
    pub longitude: f64,
    pub tier: i32,
    pub display_tag: String,
}

// Frontend uses it:
use ctas7_types::GroundStation;

// Backend uses it:
use ctas7_types::GroundStation;

// NO DUPLICATION! Same type everywhere!
```

---

## Recommended Crate Structure

```
ctas7-command-center/
├── crates/
│   ├── ctas7-gis-core/          # Core GIS types and adapter
│   │   ├── src/
│   │   │   ├── geo_entity.rs
│   │   │   ├── engine.rs
│   │   │   └── adapter.rs
│   │   └── Cargo.toml
│   │
│   ├── ctas7-gis-engines/       # GIS engine implementations
│   │   ├── src/
│   │   │   ├── dioxus_engine.rs # Dioxus-specific renderer
│   │   │   └── cesium_engine.rs # Cesium via JS interop
│   │   └── Cargo.toml
│   │
│   ├── ctas7-gis-transformers/  # World transformers
│   │   ├── src/
│   │   │   ├── space_world.rs
│   │   │   ├── network_world.rs
│   │   │   └── ground_world.rs
│   │   └── Cargo.toml
│   │
│   ├── ctas7-orbital-mechanics/ # Existing orbital mechanics
│   ├── ctas7-beam-quality/      # Existing beam quality
│   └── ctas7-network-routing/   # Existing network routing
│
├── src/                         # Dioxus frontend
│   ├── pages/
│   │   └── universal_gis_demo.rs
│   └── main.rs
│
└── Cargo.toml
```

---

## Next Steps for Dioxus Implementation

### 1. Create GIS Core Crate
```bash
cargo new --lib crates/ctas7-gis-core
```

### 2. Create GIS Engines Crate
```bash
cargo new --lib crates/ctas7-gis-engines
```

### 3. Create Transformers Crate
```bash
cargo new --lib crates/ctas7-gis-transformers
```

### 4. Implement Dioxus Engine
Choose rendering approach:
- **Option A**: HTML/CSS rendering (like TextGISEngine)
- **Option B**: Canvas rendering (2D)
- **Option C**: WebGL rendering (3D)
- **Option D**: Cesium via JS interop

### 5. Add to Dioxus App
```rust
// src/main.rs
mod pages;

use dioxus::prelude::*;
use pages::universal_gis_demo::UniversalGISDemo;

fn main() {
    dioxus::launch(App);
}

#[component]
fn App() -> Element {
    rsx! {
        UniversalGISDemo {}
    }
}
```

---

## Benefits of This Approach

### ✅ Full Rust Stack
- No JavaScript/TypeScript
- Type safety everywhere
- Share code between frontend and backend

### ✅ Direct Crate Integration
- Call `ctas7-orbital-mechanics` directly from frontend
- No WASM bindings needed
- No serialization overhead

### ✅ Performance
- Rust → WASM is fast
- No GC pauses
- Predictable performance

### ✅ Same Universal GIS Architecture
- Still world-agnostic
- Still uses transformers
- Still swappable engines
- Just in Rust instead of TypeScript!

---

## Questions

1. **Which Dioxus rendering approach do you want?**
   - HTML/CSS (simple, works everywhere)
   - Canvas 2D (better performance)
   - WebGL 3D (best for GIS)
   - Cesium via JS interop (most features)

2. **Do you already have a Dioxus app structure?**
   - Should I integrate into existing app?
   - Or create standalone demo?

3. **Which existing Rust crates should I integrate?**
   - `ctas7-orbital-mechanics`?
   - `beam-patterns-wasm`?
   - Others?

Let me know and I'll create the Dioxus implementation! 🦀

