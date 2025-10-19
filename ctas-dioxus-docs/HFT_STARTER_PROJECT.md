# 🚀 HFT Network Viewer - Starter Project

## 🎯 Perfect First Project

**Why this is ideal:**
- ✅ **Backend data exists** (10 ground stations, 4 satellites, network links)
- ✅ **No frontend yet** (greenfield - build from scratch)
- ✅ **Simple scope** (just visualization + basic routing)
- ✅ **Real use case** (high-frequency trading network)
- ✅ **Existing styling** (use Main Ops Tailwind components)

---

## 📊 What We Have (Data)

### Ground Stations (10 Strategic Hubs)
```typescript
// From: src/services/networkWorldData.ts
1. Dubai Strategic Hub          - 100 Gbps, 310 clear sky days
2. Johannesburg Strategic Hub   - 100 Gbps, 280 clear sky days
3. Fortaleza Strategic Hub      - 100 Gbps, 250 clear sky days
4. Hawaii Strategic Hub         - 95 Gbps, 200 clear sky days
5. Guam Strategic Hub           - 90 Gbps, 180 clear sky days
6. China Lake California Hub    - 100 Gbps, 320 clear sky days
7. NSA Fort Meade HQ            - 100 Gbps, 184 clear sky days
8. CENTCOM Tampa FL             - 95 Gbps, 245 clear sky days
9. Antofagasta Chile (Atacama)  - 80 Gbps, 340 clear sky days
10. Aswan Egypt (Desert)        - 75 Gbps, 350 clear sky days
```

### Satellites (4 MEO - HALO Constellation)
```typescript
HALO-1A, HALO-1B, HALO-2A, HALO-2B
- Altitude: 8,000 km
- Inclination: 55°
- Laser power: 5W
- QKD capable
```

### Network Links
```typescript
- Ground-to-Satellite
- Satellite-to-Satellite
- Ground-to-Ground (fiber)
- Bandwidth: 10-100 Gbps
- Latency: <50ms
- QKD encryption available
```

---

## 🏗️ What We'll Build

### Phase 1: Simple Dashboard (1-2 hours)

**Frontend (React + Tailwind)**
```
HFT Network Dashboard
├── Header (bg-slate-800)
├── Stats Cards (4 cards)
│   ├── Ground Stations: 10
│   ├── Satellites: 4
│   ├── Active Links: 24
│   └── Avg Latency: 15ms
├── Station List (bg-slate-800 cards)
│   └── Click to view details
└── Network Map (placeholder for Cesium)
```

**Backend (Rust - Simple)**
```rust
// Just serve the data from networkWorldData.ts
GET /api/hft/stations      → List ground stations
GET /api/hft/satellites    → List satellites
GET /api/hft/links         → List network links
GET /api/hft/stats         → Network statistics
```

---

## 📁 Project Structure

```
ctas7-hft-viewer/
├── backend/                    # Rust backend
│   ├── Cargo.toml
│   └── src/
│       ├── main.rs            # Axum server
│       ├── models.rs          # GroundStation, Satellite structs
│       ├── data.rs            # Load data from JSON
│       └── api.rs             # API routes
├── frontend/                   # React frontend
│   ├── package.json
│   ├── src/
│   │   ├── App.tsx            # Main app (use Main Ops styling)
│   │   ├── components/
│   │   │   ├── HFTDashboard.tsx
│   │   │   ├── StationList.tsx
│   │   │   ├── StatsCards.tsx
│   │   │   └── NetworkMap.tsx  # Placeholder
│   │   └── services/
│   │       └── api.ts         # Fetch from Rust backend
│   └── tailwind.config.js     # Same as Main Ops
└── data/
    ├── ground_stations.json   # Export from networkWorldData.ts
    ├── satellites.json
    └── network_links.json
```

---

## 🚀 Quick Start

### Step 1: Create Rust Backend (5 minutes)

```bash
cd /Users/cp5337/Developer
cargo new ctas7-hft-viewer --name ctas7-hft-backend
cd ctas7-hft-viewer
```

**Cargo.toml:**
```toml
[package]
name = "ctas7-hft-backend"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
tower-http = { version = "0.5", features = ["cors"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

**src/main.rs:**
```rust
use axum::{
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::CorsLayer;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct GroundStation {
    id: String,
    name: String,
    lat: f64,
    lon: f64,
    capacity_gbps: u32,
    status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct NetworkStats {
    total_stations: u32,
    total_satellites: u32,
    active_links: u32,
    avg_latency_ms: f64,
}

async fn get_stations() -> Json<Vec<GroundStation>> {
    // TODO: Load from JSON file
    let stations = vec![
        GroundStation {
            id: "gs-dubai-001".to_string(),
            name: "Dubai Strategic Hub".to_string(),
            lat: 25.2048,
            lon: 55.2708,
            capacity_gbps: 100,
            status: "active".to_string(),
        },
        // Add remaining 9 stations...
    ];
    Json(stations)
}

async fn get_stats() -> Json<NetworkStats> {
    Json(NetworkStats {
        total_stations: 10,
        total_satellites: 4,
        active_links: 24,
        avg_latency_ms: 15.2,
    })
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/api/hft/stations", get(get_stations))
        .route("/api/hft/stats", get(get_stats))
        .layer(CorsLayer::permissive());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:15190")
        .await
        .unwrap();
    
    println!("🚀 HFT Backend running on http://localhost:15190");
    axum::serve(listener, app).await.unwrap();
}
```

**Run it:**
```bash
cargo run
# Visit: http://localhost:15190/api/hft/stats
```

---

### Step 2: Create React Frontend (10 minutes)

```bash
cd /Users/cp5337/Developer/ctas7-hft-viewer
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Copy Tailwind config from Main Ops:**
```bash
cp /Users/cp5337/Developer/ctas7-command-center/tailwind.config.js .
```

**src/App.tsx:**
```tsx
import { useEffect, useState } from 'react';

interface NetworkStats {
  total_stations: number;
  total_satellites: number;
  active_links: number;
  avg_latency_ms: number;
}

function App() {
  const [stats, setStats] = useState<NetworkStats | null>(null);

  useEffect(() => {
    fetch('http://localhost:15190/api/hft/stats')
      .then(res => res.json())
      .then(setStats);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <h1 className="text-2xl font-bold">HFT Network Viewer</h1>
      </header>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Ground Stations</p>
            <p className="text-2xl font-bold">{stats?.total_stations || 0}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Satellites</p>
            <p className="text-2xl font-bold">{stats?.total_satellites || 0}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Active Links</p>
            <p className="text-2xl font-bold">{stats?.active_links || 0}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Avg Latency</p>
            <p className="text-2xl font-bold">{stats?.avg_latency_ms || 0}ms</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
```

**Run it:**
```bash
npm run dev
# Visit: http://localhost:5173
```

---

## 🎨 What It Looks Like

```
┌─────────────────────────────────────────────────────┐
│ HFT Network Viewer                                  │ ← bg-slate-800
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│  │ Ground   │ │ Satellites│ │ Active   │ │ Avg    ││
│  │ Stations │ │           │ │ Links    │ │ Latency││
│  │   10     │ │     4     │ │    24    │ │  15ms  ││
│  └──────────┘ └──────────┘ └──────────┘ └────────┘│
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Dubai Strategic Hub                         │   │
│  │ 100 Gbps • 310 clear sky days • Active     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ Johannesburg Strategic Hub                  │   │
│  │ 100 Gbps • 280 clear sky days • Active     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Exact same styling as Main Ops!** ✅

---

## 📈 Next Steps (When Ready)

### Phase 2: Add Station List
- Display all 10 stations
- Click to view details
- Show status indicators

### Phase 3: Add Cesium Map
- 3D globe with ground stations
- Satellite positions
- Network links as arcs

### Phase 4: Add Routing
- Calculate optimal route between stations
- Show latency/bandwidth
- QKD encryption status

---

## ✅ Why This Works

1. **Simple scope** - Just 4 API endpoints
2. **Real data** - Already exists in `networkWorldData.ts`
3. **Proven styling** - Copy from Main Ops
4. **Fast to build** - 1-2 hours for basic version
5. **Easy to extend** - Add features incrementally

---

## 🚀 Ready to Start?

Just say the word and I'll:
1. Create the Rust backend project
2. Set up the React frontend
3. Wire them together
4. Get you a working HFT dashboard in < 30 minutes

**This is the perfect starter project!** 🔥

