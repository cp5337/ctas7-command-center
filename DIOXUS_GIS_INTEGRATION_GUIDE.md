# Universal GIS Integration into ctas-dioxus-docs

## Quick Integration Steps

### 1. Add GIS Route to `routes.rs`

```rust
// ctas-dioxus-docs/src/routes.rs

#[derive(Clone, Routable, Debug, PartialEq)]
#[rustfmt::skip]
pub enum Route {
    #[layout(MainLayout)]
        #[route("/")]
        Home {},
        
        // ... existing routes ...
        
        #[route("/gis")]
        UniversalGIS {},  // NEW!
        
        #[route("/gis/:world")]
        GISWorld { world: String },  // NEW!
}
```

### 2. Add GIS Navigation Link

```rust
// In MainLayout, add to nav:
nav { class: "nav mt-4",
    Link { to: Route::Home {}, class: "nav-item", "Overview" }
    Link { to: Route::DevCenter {}, class: "nav-item", "Dev Center" }
    Link { to: Route::Apps {}, class: "nav-item", "Apps" }
    Link { to: Route::SystemInfo {}, class: "nav-item", "System" }
    Link { to: Route::LiveTopology {}, class: "nav-item", "Live Topology" }
    Link { to: Route::UniversalGIS {}, class: "nav-item", "🌍 GIS" }  // NEW!
}
```

### 3. Create GIS Component

```rust
// ctas-dioxus-docs/src/routes.rs (add at bottom)

#[component]
fn UniversalGIS() -> Element {
    let mut active_world = use_signal(|| None::<String>);

    rsx! {
        div { class: "animate-in",
            // Header
            div { class: "card-elevated mb-8",
                h1 { class: "text-largeTitle mb-4", "Universal GIS Infrastructure" }
                p { class: "text-body text-[var(--color-text-secondary)] mb-4",
                    "One GIS adapter for all Legion worlds. No recoding needed."
                }
                div { class: "flex items-center gap-2 text-caption1 text-cyan-400",
                    div { class: "w-2 h-2 rounded-full bg-cyan-400 animate-pulse" }
                    "Neural Mux Routing • World Transformers • Swappable Engines"
                }
            }
            
            // World Selection Grid
            div { class: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8",
                // Space World
                Link { to: Route::GISWorld { world: "space".to_string() },
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer border-2 border-cyan-400/30",
                        span { class: "text-4xl mb-3 block", "🛰️" }
                        h3 { class: "text-title3 mb-2", "Space World" }
                        p { class: "text-callout text-[var(--color-text-secondary)] mb-3",
                            "12 satellites • Orbital paths • Van Allen belts • Radiation zones"
                        }
                        div { class: "text-caption2 text-cyan-400", "Orbital Mechanics • SGP4 Propagation" }
                    }
                }
                
                // Network World
                Link { to: Route::GISWorld { world: "network".to_string() },
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer border-2 border-emerald-400/30",
                        span { class: "text-4xl mb-3 block", "🌐" }
                        h3 { class: "text-title3 mb-2", "Network World (HFT)" }
                        p { class: "text-callout text-[var(--color-text-secondary)] mb-3",
                            "259 ground stations • Laser links • QKD routing • Slot graph"
                        }
                        div { class: "text-caption2 text-emerald-400", "SurrealDB • Sled Cache • Real-time Routing" }
                    }
                }
                
                // Ground World (Cognetix)
                Link { to: Route::GISWorld { world: "ground".to_string() },
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer border-2 border-green-400/30",
                        span { class: "text-4xl mb-3 block", "🗺️" }
                        h3 { class: "text-title3 mb-2", "Ground World (Cognetix)" }
                        p { class: "text-callout text-[var(--color-text-secondary)] mb-3",
                            "Terrestrial infrastructure • Weather overlays • Tier-based stations"
                        }
                        div { class: "text-caption2 text-green-400", "Supabase • Weather API • Monte Carlo" }
                    }
                }
            }
            
            // Architecture Overview
            div { class: "card-elevated",
                h2 { class: "text-title2 mb-4", "How It Works" }
                div { class: "space-y-4 text-callout text-[var(--color-text-secondary)]",
                    div { class: "flex items-start gap-3",
                        span { class: "text-2xl", "1️⃣" }
                        div {
                            h3 { class: "text-headline text-white mb-1", "Universal Geometry" }
                            p { "All worlds use the same geometry types: Point, Line, Polygon, Volume" }
                        }
                    }
                    div { class: "flex items-start gap-3",
                        span { class: "text-2xl", "2️⃣" }
                        div {
                            h3 { class: "text-headline text-white mb-1", "World Transformers" }
                            p { "Each world has a transformer that converts domain data → GeoEntities" }
                        }
                    }
                    div { class: "flex items-start gap-3",
                        span { class: "text-2xl", "3️⃣" }
                        div {
                            h3 { class: "text-headline text-white mb-1", "One GIS Adapter" }
                            p { "Same adapter renders all worlds. No recoding for new worlds!" }
                        }
                    }
                    div { class: "flex items-start gap-3",
                        span { class: "text-2xl", "4️⃣" }
                        div {
                            h3 { class: "text-headline text-white mb-1", "Neural Mux Routing" }
                            p { "Neural Mux routes visualization requests and loads widgets from CDN" }
                        }
                    }
                }
            }
            
            // Tech Stack
            div { class: "grid grid-cols-1 md:grid-cols-2 gap-6 mt-6",
                div { class: "card",
                    h3 { class: "text-headline mb-3", "Frontend Stack" }
                    ul { class: "space-y-2 text-callout text-[var(--color-text-secondary)]",
                        li { "• Dioxus (Rust → WASM)" }
                        li { "• Universal GIS Adapter" }
                        li { "• World Transformers" }
                        li { "• Swappable Engines (Text, Cesium, Mapbox)" }
                    }
                }
                div { class: "card",
                    h3 { class: "text-headline mb-3", "Backend Stack" }
                    ul { class: "space-y-2 text-callout text-[var(--color-text-secondary)]",
                        li { "• Rust crates (orbital mechanics, routing)" }
                        li { "• Supabase (ACID database)" }
                        li { "• SurrealDB (slot graph)" }
                        li { "• Sled (KV cache)" }
                    }
                }
            }
        }
    }
}

#[component]
fn GISWorld(world: String) -> Element {
    rsx! {
        div { class: "animate-in",
            // Back button
            Link { to: Route::UniversalGIS {},
                class: "inline-flex items-center gap-2 text-callout text-cyan-400 hover:text-cyan-300 mb-6",
                "← Back to GIS Overview"
            }
            
            // World Header
            div { class: "card-elevated mb-6",
                h1 { class: "text-largeTitle mb-2",
                    match world.as_str() {
                        "space" => "🛰️ Space World",
                        "network" => "🌐 Network World (HFT)",
                        "ground" => "🗺️ Ground World (Cognetix)",
                        _ => "🌍 GIS World"
                    }
                }
                p { class: "text-body text-[var(--color-text-secondary)]",
                    match world.as_str() {
                        "space" => "Satellites, orbital mechanics, and radiation belt visualization",
                        "network" => "High-frequency trading network with 259 ground stations and laser links",
                        "ground" => "Terrestrial infrastructure and weather-aware ground station network",
                        _ => "Geographic information system"
                    }
                }
            }
            
            // GIS Visualization Container
            div { class: "card mb-6",
                div { 
                    id: "gis-container",
                    class: "w-full h-[600px] bg-slate-950 rounded-lg flex items-center justify-center",
                    div { class: "text-center",
                        div { class: "text-6xl mb-4",
                            match world.as_str() {
                                "space" => "🛰️",
                                "network" => "🌐",
                                "ground" => "🗺️",
                                _ => "🌍"
                            }
                        }
                        p { class: "text-headline text-[var(--color-text-secondary)] mb-2",
                            "GIS Engine Initializing..."
                        }
                        p { class: "text-caption1 text-[var(--color-text-tertiary)]",
                            "Loading {world} world data from Neural Mux"
                        }
                    }
                }
            }
            
            // World-Specific Info
            div { class: "grid grid-cols-1 md:grid-cols-2 gap-6",
                div { class: "card",
                    h3 { class: "text-headline mb-3", "Data Sources" }
                    ul { class: "space-y-2 text-callout text-[var(--color-text-secondary)]",
                        match world.as_str() {
                            "space" => rsx! {
                                li { "• Supabase: satellites table" }
                                li { "• Supabase: orbital_elements table" }
                                li { "• Rust crate: ctas7-orbital-mechanics" }
                                li { "• SGP4 propagation for real-time positions" }
                            },
                            "network" => rsx! {
                                li { "• SurrealDB: slot graph (network topology)" }
                                li { "• Sled: hot path cache (sub-second queries)" }
                                li { "• Supabase: ground_nodes, beams tables" }
                                li { "• Rust crate: ctas7-network-routing" }
                            },
                            "ground" => rsx! {
                                li { "• Supabase: ground_nodes table (259 stations)" }
                                li { "• Supabase: weather_data table" }
                                li { "• NOAA Weather API integration" }
                                li { "• Monte Carlo simulation results" }
                            },
                            _ => rsx! { li { "• Unknown data sources" } }
                        }
                    }
                }
                div { class: "card",
                    h3 { class: "text-headline mb-3", "Visualization Features" }
                    ul { class: "space-y-2 text-callout text-[var(--color-text-secondary)]",
                        match world.as_str() {
                            "space" => rsx! {
                                li { "• Real-time satellite positions" }
                                li { "• Orbital path visualization" }
                                li { "• Van Allen radiation belts" }
                                li { "• Orbital zone overlays (LEO, MEO, GEO)" }
                            },
                            "network" => rsx! {
                                li { "• 259 ground stations (tier-based colors)" }
                                li { "• Animated laser links" }
                                li { "• QKD-capable path highlighting" }
                                li { "• Real-time link status (active/congested/offline)" }
                            },
                            "ground" => rsx! {
                                li { "• Tier 1/2/3 station classification" }
                                li { "• Weather overlay (cloud cover, visibility)" }
                                li { "• Coverage area visualization" }
                                li { "• Monte Carlo confidence intervals" }
                            },
                            _ => rsx! { li { "• Unknown features" } }
                        }
                    }
                }
            }
        }
    }
}
```

### 4. Update Cargo.toml (if needed)

```toml
# ctas-dioxus-docs/Cargo.toml

[dependencies]
# ... existing dependencies ...

# Add if you want to integrate actual GIS rendering:
# cesium-rs = "0.1"  # If you create Cesium bindings
# leaflet-rs = "0.1"  # If you create Leaflet bindings
```

### 5. Run the Dioxus App

```bash
cd ctas-dioxus-docs
dx serve
```

Then navigate to `http://localhost:8080/gis` to see the Universal GIS page!

---

## Next Steps

### Phase 1: Text-Based Proof of Concept (Current)
- ✅ Route added
- ✅ Navigation link added
- ✅ World selection page
- ✅ Individual world pages
- 🔄 Shows placeholder (no actual rendering yet)

### Phase 2: Add Actual GIS Rendering
Choose one:
1. **HTML/CSS Renderer** (simplest, works everywhere)
2. **Canvas 2D Renderer** (better performance)
3. **WebGL Renderer** (best for 3D GIS)
4. **Cesium via JS Interop** (most features, requires JS bridge)

### Phase 3: Connect to Real Data
- Query Supabase from Dioxus
- Call Rust crates for calculations
- Stream updates via WebSocket

### Phase 4: Neural Mux Integration
- Neural Mux routes visualization requests
- Loads widgets from CDN
- Coordinates between worlds

---

## File Structure

```
ctas-dioxus-docs/
├── src/
│   ├── main.rs
│   ├── routes.rs          # ← Updated with GIS routes
│   ├── components/
│   │   └── mod.rs
│   └── neural_mux_client.rs
└── Cargo.toml
```

---

## Benefits

### ✅ Fits Existing Architecture
- Uses your existing routing system
- Matches your design language (card-elevated, material-thick)
- Follows your navigation pattern

### ✅ Rust All the Way
- No JavaScript/TypeScript
- Direct crate integration
- Type safety everywhere

### ✅ Documentation + Live Demo
- GIS documentation in Dioxus docs
- Live visualization in same app
- Neural Mux integration ready

---

## Ready to Integrate?

The code above is ready to drop into your `routes.rs`. Just:
1. Copy the route definitions
2. Copy the components
3. Add the nav link
4. Run `dx serve`

Want me to create the actual rendering engine next, or is this documentation/placeholder approach good for now?

