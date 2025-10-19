# CTAS-7 Intranet: Full Rust Backend Architecture

## 🎯 Goal
Use the **exact Tailwind/React components** from Main Ops & Command Center for the frontend, but replace **all backend logic with Rust**.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Keep As-Is)                    │
│  - React + Tailwind CSS                                      │
│  - Existing components from Main Ops & Command Center       │
│  - bg-slate-900, border-cyan-400/20, etc.                   │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                   RUST API GATEWAY (NEW)                     │
│  - Axum or Actix-Web                                         │
│  - Port: 15180 (Command Center API)                         │
│  - WebSocket: 15181                                          │
│  - Routes: /api/crates, /api/ports, /api/metrics            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    RUST SERVICES (NEW)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Smart Crate Discovery Service                         │  │
│  │ - Scan filesystem for smart-crate.toml               │  │
│  │ - Parse TOML, validate schema                        │  │
│  │ - Build in-memory registry                           │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Port Management Service                               │  │
│  │ - Track port allocations                             │  │
│  │ - Detect conflicts                                    │  │
│  │ - Calculate sister ports                             │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Neural Mux Integration Service                        │  │
│  │ - Connect to Neural Mux (port 18100)                 │  │
│  │ - System topology queries                            │  │
│  │ - Health metrics                                      │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Real-time Event Service                               │  │
│  │ - WebSocket server                                    │  │
│  │ - Broadcast crate updates                            │  │
│  │ - System events                                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  - Sled: Fast KV cache (Rust-native)                        │
│  - SurrealDB: Graph queries (Slot Graph)                    │
│  - Supabase: External data (if needed)                      │
│  - Filesystem: smart-crate.toml files                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Rust Backend Structure

```
ctas7-intranet-backend/
├── Cargo.toml
├── src/
│   ├── main.rs                    # Axum server entry point
│   ├── api/
│   │   ├── mod.rs
│   │   ├── crates.rs              # GET /api/crates, POST /api/crates/:id/deploy
│   │   ├── ports.rs               # GET /api/ports, GET /api/ports/conflicts
│   │   ├── metrics.rs             # GET /api/metrics
│   │   └── neural_mux.rs          # GET /api/mux/status, GET /api/mux/topology
│   ├── services/
│   │   ├── mod.rs
│   │   ├── crate_discovery.rs     # Scan filesystem, parse TOML
│   │   ├── port_manager.rs        # Port allocation, conflict detection
│   │   ├── neural_mux_client.rs   # Connect to Neural Mux
│   │   └── realtime.rs            # WebSocket broadcast service
│   ├── models/
│   │   ├── mod.rs
│   │   ├── smart_crate.rs         # SmartCrate struct
│   │   ├── port_registry.rs       # PortRegistry struct
│   │   └── system_metrics.rs      # SystemMetrics struct
│   ├── db/
│   │   ├── mod.rs
│   │   ├── sled_store.rs          # Sled KV operations
│   │   └── surreal_client.rs      # SurrealDB graph queries
│   └── utils/
│       ├── mod.rs
│       └── config.rs              # Load config from env
└── tests/
    ├── integration_tests.rs
    └── api_tests.rs
```

---

## 🔧 Key Rust Crates

```toml
[dependencies]
# Web Framework
axum = "0.7"
tokio = { version = "1", features = ["full"] }
tower = "0.4"
tower-http = { version = "0.5", features = ["cors", "trace"] }

# WebSocket
axum-tungstenite = "0.3"

# Serialization
serde = { version = "1", features = ["derive"] }
serde_json = "1"
toml = "0.8"

# Database
sled = "0.34"
surrealdb = "1.0"

# HTTP Client (for Neural Mux)
reqwest = { version = "0.11", features = ["json"] }

# Filesystem
walkdir = "2"
notify = "6"  # Watch for file changes

# Logging
tracing = "0.1"
tracing-subscriber = "0.3"

# Error Handling
anyhow = "1"
thiserror = "1"

# Async
futures = "0.3"
```

---

## 🚀 API Endpoints (Rust Implementation)

### 1. Smart Crate Registry

```rust
// GET /api/crates
async fn list_crates(
    State(app_state): State<AppState>,
) -> Json<Vec<SmartCrate>> {
    let registry = app_state.crate_registry.lock().await;
    Json(registry.list_all())
}

// GET /api/crates/:name
async fn get_crate(
    Path(name): Path<String>,
    State(app_state): State<AppState>,
) -> Result<Json<SmartCrate>, StatusCode> {
    let registry = app_state.crate_registry.lock().await;
    registry.get(&name)
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

// POST /api/crates/:name/deploy
async fn deploy_crate(
    Path(name): Path<String>,
    State(app_state): State<AppState>,
) -> Result<Json<DeploymentStatus>, StatusCode> {
    // Trigger deployment workflow
    let status = app_state.deploy_service.deploy(&name).await?;
    Ok(Json(status))
}
```

### 2. Port Management

```rust
// GET /api/ports
async fn list_ports(
    State(app_state): State<AppState>,
) -> Json<PortRegistry> {
    let registry = app_state.port_registry.lock().await;
    Json(registry.clone())
}

// GET /api/ports/conflicts
async fn check_conflicts(
    State(app_state): State<AppState>,
) -> Json<Vec<PortConflict>> {
    let registry = app_state.port_registry.lock().await;
    Json(registry.detect_conflicts())
}

// POST /api/ports/assign
async fn assign_port(
    State(app_state): State<AppState>,
    Json(request): Json<PortAssignmentRequest>,
) -> Result<Json<PortAssignment>, StatusCode> {
    let mut registry = app_state.port_registry.lock().await;
    let assignment = registry.assign_port(&request.crate_name)?;
    Ok(Json(assignment))
}
```

### 3. Neural Mux Integration

```rust
// GET /api/mux/status
async fn neural_mux_status(
    State(app_state): State<AppState>,
) -> Result<Json<NeuralMuxStatus>, StatusCode> {
    let client = &app_state.neural_mux_client;
    let status = client.get_status().await
        .map_err(|_| StatusCode::SERVICE_UNAVAILABLE)?;
    Ok(Json(status))
}

// GET /api/mux/topology
async fn neural_mux_topology(
    State(app_state): State<AppState>,
) -> Result<Json<SystemTopology>, StatusCode> {
    let client = &app_state.neural_mux_client;
    let topology = client.get_topology().await
        .map_err(|_| StatusCode::SERVICE_UNAVAILABLE)?;
    Ok(Json(topology))
}
```

### 4. WebSocket Real-time Updates

```rust
// WebSocket handler
async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(app_state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_socket(socket, app_state))
}

async fn handle_socket(socket: WebSocket, app_state: AppState) {
    let (mut sender, mut receiver) = socket.split();
    
    // Subscribe to events
    let mut event_rx = app_state.event_bus.subscribe();
    
    // Send events to client
    tokio::spawn(async move {
        while let Ok(event) = event_rx.recv().await {
            let msg = serde_json::to_string(&event).unwrap();
            if sender.send(Message::Text(msg)).await.is_err() {
                break;
            }
        }
    });
    
    // Handle incoming messages
    while let Some(Ok(msg)) = receiver.next().await {
        // Handle client messages
    }
}
```

---

## 🔍 Smart Crate Discovery Service (Rust)

```rust
use walkdir::WalkDir;
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SmartCrate {
    pub name: String,
    pub version: String,
    pub classification: String,
    pub tesla_grade: bool,
    pub ports: HashMap<String, u16>,
    pub qa_metrics: QAMetrics,
    pub path: PathBuf,
}

pub struct CrateDiscoveryService {
    root_paths: Vec<PathBuf>,
    cache: Arc<Mutex<HashMap<String, SmartCrate>>>,
}

impl CrateDiscoveryService {
    pub async fn scan(&self) -> Result<Vec<SmartCrate>> {
        let mut crates = Vec::new();
        
        for root in &self.root_paths {
            for entry in WalkDir::new(root) {
                let entry = entry?;
                if entry.file_name() == "smart-crate.toml" {
                    let crate_data = self.parse_crate(entry.path()).await?;
                    crates.push(crate_data);
                }
            }
        }
        
        // Update cache
        let mut cache = self.cache.lock().await;
        for crate_data in &crates {
            cache.insert(crate_data.name.clone(), crate_data.clone());
        }
        
        Ok(crates)
    }
    
    async fn parse_crate(&self, path: &Path) -> Result<SmartCrate> {
        let content = tokio::fs::read_to_string(path).await?;
        let crate_data: SmartCrate = toml::from_str(&content)?;
        Ok(crate_data)
    }
}
```

---

## 🗄️ Data Storage Strategy

### Sled (Fast KV Cache)
```rust
use sled::Db;

pub struct SledStore {
    db: Db,
}

impl SledStore {
    pub fn new(path: &str) -> Result<Self> {
        let db = sled::open(path)?;
        Ok(Self { db })
    }
    
    pub fn cache_crate(&self, crate_data: &SmartCrate) -> Result<()> {
        let key = format!("crate:{}", crate_data.name);
        let value = serde_json::to_vec(crate_data)?;
        self.db.insert(key, value)?;
        Ok(())
    }
    
    pub fn get_crate(&self, name: &str) -> Result<Option<SmartCrate>> {
        let key = format!("crate:{}", name);
        if let Some(value) = self.db.get(key)? {
            let crate_data = serde_json::from_slice(&value)?;
            Ok(Some(crate_data))
        } else {
            Ok(None)
        }
    }
}
```

### SurrealDB (Slot Graph)
```rust
use surrealdb::{Surreal, engine::remote::ws::Client};

pub struct SlotGraphClient {
    db: Surreal<Client>,
}

impl SlotGraphClient {
    pub async fn new(url: &str) -> Result<Self> {
        let db = Surreal::new::<Ws>(url).await?;
        db.signin(Root {
            username: "root",
            password: "root",
        }).await?;
        db.use_ns("ctas7").use_db("slot_graph").await?;
        
        Ok(Self { db })
    }
    
    pub async fn upsert_crate(&self, crate_data: &SmartCrate) -> Result<()> {
        let _: Option<SmartCrate> = self.db
            .create(("crate", &crate_data.name))
            .content(crate_data)
            .await?;
        Ok(())
    }
}
```

---

## 🔄 Frontend Integration (Keep Existing React)

### Update API calls to point to Rust backend:

```typescript
// Before (Node.js backend)
const response = await fetch('http://localhost:15180/api/crates');

// After (Rust backend - same URL!)
const response = await fetch('http://localhost:15180/api/crates');
```

**No frontend changes needed!** The Rust backend implements the **exact same API contract**.

---

## 🚀 Deployment

### Development
```bash
# Terminal 1: Start Rust backend
cd ctas7-intranet-backend
cargo run

# Terminal 2: Start React frontend
cd ctas7-command-center
npm run dev
```

### Production
```bash
# Build Rust backend
cargo build --release

# Run
./target/release/ctas7-intranet-backend
```

---

## ✅ Benefits

1. **Keep existing UI** - No need to rewrite Tailwind components
2. **Rust performance** - Fast, memory-safe backend
3. **Type safety** - Rust's type system prevents bugs
4. **Native integrations** - Direct Sled/SurrealDB access
5. **Easy deployment** - Single binary
6. **WebSocket built-in** - Tokio async runtime
7. **Smart crate native** - Rust understands Rust crates

---

## 📝 Next Steps

1. **Create Rust backend project** (`cargo new ctas7-intranet-backend`)
2. **Implement core services** (crate discovery, port management)
3. **Set up Axum routes** (match existing API)
4. **Add WebSocket support** (real-time updates)
5. **Integrate Sled + SurrealDB** (data layer)
6. **Test with existing frontend** (no changes needed)
7. **Deploy** (single Rust binary)

---

**Result**: Beautiful Tailwind UI (from Main Ops) + Blazing fast Rust backend! 🔥

