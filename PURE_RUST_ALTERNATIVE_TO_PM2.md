# Pure Rust Alternative to PM2/Node.js

**Your Situation:**
- ✅ Stayed pure Rust (RepoAgent, Agent Mesh, Linear Agent, Forge)
- ⚠️ PM2 brings in Node.js dependency
- 🎯 Want pure Rust alternative for the future

---

## 🦀 **RUST ALTERNATIVES TO PM2**

### **Option 1: systemd (Native OS-Level) - RECOMMENDED**
**Best for:** Production Linux deployments

**What it is:**
- Built into most Linux distros
- Native process manager
- No Node.js, No Rust - Pure OS
- Industry standard

**Setup:**
```bash
# Create systemd service for each CTAS service
sudo nano /etc/systemd/system/ctas-repoagent.service
```

```ini
[Unit]
Description=CTAS RepoAgent Gateway
After=network.target

[Service]
Type=simple
User=ctas7
WorkingDirectory=/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent
ExecStart=/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent/target/release/gateway
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="CTAS_API_KEY=your-key"
Environment="RUST_LOG=info"

[Install]
WantedBy=multi-user.target
```

**Commands:**
```bash
# Start service
sudo systemctl start ctas-repoagent

# Enable on boot
sudo systemctl enable ctas-repoagent

# View status
sudo systemctl status ctas-repoagent

# View logs
sudo journalctl -u ctas-repoagent -f

# View all CTAS services
systemctl list-units 'ctas-*'
```

**Pros:**
- ✅ Pure Rust services, no Node.js
- ✅ Industry standard
- ✅ OS-level integration
- ✅ Excellent logging (journald)
- ✅ Dependency management
- ✅ Auto-restart on crash
- ✅ Resource limits

**Cons:**
- ❌ Linux only (not macOS native)
- ❌ Less "dashboard-y" than PM2
- ❌ Requires sudo/root access

---

### **Option 2: Build Your Own Rust Service Manager** 🦀
**Best for:** Complete control, CTAS-native solution

**Architecture:**
```rust
// ctas7-service-orchestrator/src/main.rs

use tokio::process::Command;
use tokio::task::JoinHandle;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ServiceConfig {
    name: String,
    command: String,
    args: Vec<String>,
    cwd: String,
    env: HashMap<String, String>,
    port: u16,
    auto_restart: bool,
    max_restarts: usize,
}

struct ServiceManager {
    services: HashMap<String, Service>,
}

struct Service {
    config: ServiceConfig,
    handle: Option<JoinHandle<()>>,
    restarts: usize,
    status: ServiceStatus,
}

#[derive(Debug, Clone)]
enum ServiceStatus {
    Running,
    Stopped,
    Crashed,
    Restarting,
}

impl ServiceManager {
    pub async fn new(config_path: &str) -> anyhow::Result<Self> {
        // Load services from TOML config
        let config: Vec<ServiceConfig> = toml::from_str(&std::fs::read_to_string(config_path)?)?;

        let mut services = HashMap::new();
        for cfg in config {
            services.insert(cfg.name.clone(), Service {
                config: cfg,
                handle: None,
                restarts: 0,
                status: ServiceStatus::Stopped,
            });
        }

        Ok(Self { services })
    }

    pub async fn start_all(&mut self) -> anyhow::Result<()> {
        for (name, service) in &mut self.services {
            self.start_service(name).await?;
        }
        Ok(())
    }

    pub async fn start_service(&mut self, name: &str) -> anyhow::Result<()> {
        let service = self.services.get_mut(name).ok_or(anyhow::anyhow!("Service not found"))?;

        let config = service.config.clone();
        let handle = tokio::spawn(async move {
            loop {
                let mut cmd = Command::new(&config.command);
                cmd.args(&config.args)
                   .current_dir(&config.cwd);

                for (k, v) in &config.env {
                    cmd.env(k, v);
                }

                println!("🚀 Starting service: {}", config.name);

                match cmd.spawn() {
                    Ok(mut child) => {
                        match child.wait().await {
                            Ok(status) => {
                                println!("⚠️  Service {} exited: {:?}", config.name, status);
                            }
                            Err(e) => {
                                println!("❌ Service {} error: {}", config.name, e);
                            }
                        }
                    }
                    Err(e) => {
                        println!("❌ Failed to start {}: {}", config.name, e);
                    }
                }

                if !config.auto_restart {
                    break;
                }

                println!("🔄 Restarting {} in 5s...", config.name);
                tokio::time::sleep(tokio::time::Duration::from_secs(5)).await;
            }
        });

        service.handle = Some(handle);
        service.status = ServiceStatus::Running;

        Ok(())
    }

    pub async fn stop_service(&mut self, name: &str) -> anyhow::Result<()> {
        if let Some(service) = self.services.get_mut(name) {
            if let Some(handle) = service.handle.take() {
                handle.abort();
                service.status = ServiceStatus::Stopped;
            }
        }
        Ok(())
    }

    pub fn status(&self) -> Vec<ServiceInfo> {
        self.services.iter().map(|(name, service)| {
            ServiceInfo {
                name: name.clone(),
                status: format!("{:?}", service.status),
                restarts: service.restarts,
                port: service.config.port,
            }
        }).collect()
    }
}

#[derive(Debug, Serialize)]
struct ServiceInfo {
    name: String,
    status: String,
    restarts: usize,
    port: u16,
}

// REST API for monitoring (like pm2 status)
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let mut manager = ServiceManager::new("services.toml").await?;

    // Start all services
    manager.start_all().await?;

    // HTTP API for status
    use axum::{Router, routing::get, Json};

    let app = Router::new()
        .route("/status", get(|| async {
            // Return service status
            Json(manager.status())
        }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:19000").await?;
    axum::serve(listener, app).await?;

    Ok(())
}
```

**Config File (services.toml):**
```toml
[[service]]
name = "repoagent-gateway"
command = "cargo"
args = ["run", "--release", "--bin", "gateway"]
cwd = "/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-repoagent"
port = 15180
auto_restart = true
max_restarts = 10

[service.env]
CTAS_API_KEY = "your-key"
RUST_LOG = "info"

[[service]]
name = "linear-agent"
command = "cargo"
args = ["run", "--release"]
cwd = "/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-linear-agent-rust"
port = 18180
auto_restart = true
max_restarts = 10

[service.env]
LINEAR_API_KEY = "your-key"
RUST_LOG = "info"
```

**Pros:**
- ✅ Pure Rust, no Node.js
- ✅ Complete control
- ✅ CTAS-native
- ✅ Can add CTAS-specific features
- ✅ Integrates with Foundation Core
- ✅ Cross-platform (macOS, Linux, Windows)

**Cons:**
- ⚠️ Need to build and maintain it
- ⚠️ Less mature than PM2/systemd

---

### **Option 3: Single Binary with Tokio** 🦀
**Best for:** Simplicity, fewer moving parts

**Concept:**
Run all services in **ONE Rust binary** using tokio tasks:

```rust
// ctas7-unified-runtime/src/main.rs

use tokio::task::JoinSet;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let mut set = JoinSet::new();

    // Start RepoAgent Gateway
    set.spawn(async {
        ctas7_repoagent::gateway::run().await
    });

    // Start Agent Mesh
    set.spawn(async {
        ctas7_repoagent::agent_mesh::run_all().await
    });

    // Start Linear Agent
    set.spawn(async {
        ctas7_linear_agent::run().await
    });

    // Start Forge
    set.spawn(async {
        ctas7_forge::run().await
    });

    // Wait for all services
    while let Some(res) = set.join_next().await {
        if let Err(e) = res {
            eprintln!("Service error: {:?}", e);
        }
    }

    Ok(())
}
```

**Pros:**
- ✅ Pure Rust, no Node.js
- ✅ Single binary
- ✅ Shared memory between services
- ✅ Tokio handles async
- ✅ Simple deployment

**Cons:**
- ⚠️ All services crash together
- ⚠️ No isolation
- ⚠️ Harder to restart individual services

---

### **Option 4: Use Existing Rust Tools**

#### **A. cargo-watch (Development)**
```bash
# Auto-restart on file changes
cargo watch -x 'run --release --bin gateway'
```

#### **B. systemfd + listenfd (Socket activation)**
```bash
# Zero-downtime restarts
systemfd --no-pid -s http::15180 -- cargo watch -x run
```

#### **C. Custom Smart Crate Orchestrator**
You already have Smart Crate system! Extend it:

```rust
// ctas7-smart-crate-orchestrator
// Manages multiple crates as services
```

---

## 📊 **COMPARISON**

| Solution | Pure Rust | Cross-Platform | Maturity | Control | Complexity |
|----------|-----------|----------------|----------|---------|------------|
| **systemd** | ✅ (services) | ❌ Linux only | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Custom Manager** | ✅✅✅ | ✅ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Single Binary** | ✅✅✅ | ✅ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **PM2** | ❌ (Node.js) | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |

---

## 🎯 **RECOMMENDATION FOR CTAS**

### **Phase 1: Use PM2 Now** ✅
You already have it configured:
```bash
cd /Users/cp5337/Developer/ctas7-command-center
./START_ALL_SERVICES.sh
```

**Why:** Get everything running TODAY

---

### **Phase 2: Build CTAS Service Orchestrator** 🦀
Create: `ctas7-service-orchestrator`

**Features:**
- Pure Rust
- TOML config
- HTTP API for status
- Foundation Core integration
- Trivariate hash for service IDs
- Smart Crate aware
- Neural Mux integration

**Location:**
```
/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-service-orchestrator/
├── Cargo.toml
├── services.toml (config)
└── src/
    ├── main.rs (orchestrator)
    ├── service.rs (service management)
    ├── monitor.rs (health checks)
    └── api.rs (HTTP status API)
```

---

### **Phase 3: Production with systemd** 🐧
For Linux production deployments:
```bash
# Generate systemd units from your Rust orchestrator
ctas7-service-orchestrator generate-systemd
```

---

## 🚀 **IMMEDIATE ACTION PLAN**

### **Today: Use PM2**
```bash
# You're not "breaking" pure Rust
# PM2 just manages the processes
# Your code is still pure Rust!
./START_ALL_SERVICES.sh
```

### **This Week: Design CTAS Orchestrator**
```bash
# Create new crate
cd /Users/cp5337/Developer/ctas-7-shipyard-staging
cargo new ctas7-service-orchestrator
```

### **Next Week: Build CTAS Orchestrator**
Implement the Rust service manager shown above

### **Future: Replace PM2**
```bash
# Pure Rust orchestrator
ctas7-service-orchestrator start-all

# View status (like pm2 status)
ctas7-service-orchestrator status

# Beautiful TUI dashboard
ctas7-service-orchestrator monitor
```

---

## 💡 **THE VISION**

### **CTAS Native Service Orchestrator:**
```
┌─────────────────────────────────────────────┐
│  CTAS-7 Service Orchestrator (Pure Rust)   │
│  Port: 19000                                │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ RepoAgent    │  │ Linear Agent │       │
│  │ Status: ✅   │  │ Status: ✅   │       │
│  │ Port: 15180  │  │ Port: 18180  │       │
│  │ Uptime: 2h   │  │ Uptime: 2h   │       │
│  │ Restarts: 0  │  │ Restarts: 0  │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ Agent Mesh   │  │ Forge        │       │
│  │ Status: ✅   │  │ Status: ✅   │       │
│  │ Port: 50055  │  │ Port: 18220  │       │
│  │ Agents: 7/7  │  │ Tasks: 12    │       │
│  └──────────────┘  └──────────────┘       │
│                                             │
│  Foundation Core: ✅                       │
│  Neural Mux: ✅                            │
│  Trivariate Hashing: ✅                    │
│  Smart Crate System: ✅                    │
└─────────────────────────────────────────────┘
```

---

## 📝 **SUMMARY**

**You're right to want pure Rust!** Options:

1. **Now:** Use PM2 (pragmatic, get running today)
2. **Soon:** Build `ctas7-service-orchestrator` (pure Rust)
3. **Production:** systemd on Linux
4. **Ultimate:** CTAS Native Orchestrator with TUI

**All your services are ALREADY pure Rust** - PM2 just manages them. You haven't "broken" your purity - you're just using a practical tool for process management.

**Want me to scaffold `ctas7-service-orchestrator` now?** 🦀
