// ============================================================
// CTAS-7 SurrealDB Live Telemetry Core
// Version: 2.3.7
// ============================================================

use surrealdb::Surreal;
use surrealdb::engine::remote::ws::{Client, Ws};
use surrealdb::opt::auth::Root;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio::time::sleep;
use once_cell::sync::OnceCell;

static DB: OnceCell<Surreal<Client>> = OnceCell::new();

// ====== ⬇ INIT FUNCTION =======================
pub async fn init_surreal_connection() -> surrealdb::Result<()> {
    if DB.get().is_none() {
        let db = Surreal::new::<Ws>("127.0.0.1:8000").await?;
        db.signin(Root { username: "root", password: "root" }).await?;
        db.use_ns("ctas7").use_db("hft_network").await?;
        DB.set(db).ok();
        println!("✅ Connected to SurrealDB (ctas7/hft_network)");
    }
    Ok(())
}

// ====== ⬇ UTILITY WRAPPER ======================
pub async fn surreal_query(q: &str) -> surrealdb::Result<surrealdb::Response> {
    if let Some(db) = DB.get() {
        db.query(q).await
    } else {
        Err(surrealdb::Error::Db(surrealdb::error::Db::Unknown("No connection initialized".to_string())))
    }
}

// ====== ⬇ TELEMETRY HELPER ====================
pub async fn push_telemetry_event(id: &str, status: &str, metric: f64) -> surrealdb::Result<()> {
    if let Some(db) = DB.get() {
        let _: Option<serde_json::Value> = db.create(("telemetry_events", id))
            .content(serde_json::json!({
                "status": status,
                "metric": metric,
                "timestamp": chrono::Utc::now(),
            }))
            .await?;
    }
    Ok(())
}

// --------------------------------------------
// Data Structures
// --------------------------------------------
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TelemetryRecord {
    pub id: Option<String>,
    pub world_type: Option<String>,
    pub name: Option<String>,
    pub status: Option<String>,
    pub metric: Option<f64>,
    pub timestamp: Option<String>,
    pub world_domain: Option<String>,
    // Additional fields to match our seed data
    pub orbital_altitude: Option<f64>,
    pub velocity: Option<f64>,
    pub signal_strength: Option<f64>,
    pub battery_level: Option<f64>,
    pub threat_level: Option<String>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
}

// --------------------------------------------
// Core Telemetry Client
// --------------------------------------------
pub struct SurrealTelemetry {
    db: Surreal<Client>,
}

impl SurrealTelemetry {
    pub async fn new() -> surrealdb::Result<Self> {
        let db = Surreal::new::<Ws>("127.0.0.1:8000").await?;
        db.signin(Root {
            username: "root",
            password: "root",
        })
        .await?;
        db.use_ns("ctas7").use_db("hft_network").await?;
        Ok(Self { db })
    }

    // Fetch all ground nodes
    pub async fn get_ground_nodes(&self) -> surrealdb::Result<Vec<TelemetryRecord>> {
        let mut res = self.db.query("SELECT * FROM ground_nodes;").await?;
        Ok(res.take(0)?)
    }

    // Fetch all satellites
    pub async fn get_satellites(&self) -> surrealdb::Result<Vec<TelemetryRecord>> {
        let mut res = self.db.query("SELECT * FROM satellite;").await?;
        Ok(res.take(0)?)
    }

    // Fetch cyber events
    pub async fn get_cyber_events(&self) -> surrealdb::Result<Vec<TelemetryRecord>> {
        let mut res = self.db.query("SELECT * FROM cyber_event;").await?;
        Ok(res.take(0)?)
    }

    // Fetch vessels
    pub async fn get_vessels(&self) -> surrealdb::Result<Vec<TelemetryRecord>> {
        let mut res = self.db.query("SELECT * FROM vessel;").await?;
        Ok(res.take(0)?)
    }

    // Fetch network nodes
    pub async fn get_network_nodes(&self) -> surrealdb::Result<Vec<TelemetryRecord>> {
        let mut res = self.db.query("SELECT * FROM network_node;").await?;
        Ok(res.take(0)?)
    }

    // Fetch geographical points
    pub async fn get_geo_points(&self) -> surrealdb::Result<Vec<TelemetryRecord>> {
        let mut res = self.db.query("SELECT * FROM geo_point;").await?;
        Ok(res.take(0)?)
    }

    // Live feed from any table (simplified for demo)
    pub async fn subscribe_live(&self, table: &str) -> surrealdb::Result<()> {
        println!("📡 Live monitoring would be enabled for table: {}", table);
        // Note: Live queries require special handling in SurrealDB 2.3
        // For now, we'll just log that monitoring would be active
        Ok(())
    }

    // Insert telemetry update
    pub async fn insert_metric(&self, record: &TelemetryRecord) -> surrealdb::Result<()> {
        let _: Option<TelemetryRecord> = self.db
            .create(("telemetry_events", &record.id))
            .content(record.clone())
            .await?;
        Ok(())
    }

    // Get comprehensive telemetry status across all worlds
    pub async fn get_world_status(&self) -> surrealdb::Result<()> {
        println!("🌍 === CTAS-7 World Domain Status ===");

        // Space Domain
        let satellites = self.get_satellites().await?;
        println!("🛰️  Space Domain: {} satellites active", satellites.len());
        for sat in satellites.iter().take(2) {
            let name = sat.name.as_ref().unwrap_or(&"Unknown".to_string());
            let status = sat.status.as_ref().unwrap_or(&"Unknown".to_string());
            println!("   └─ {}: {}", name, status);
        }

        // Cyber Domain
        let cyber_events = self.get_cyber_events().await?;
        println!("🔒 Cyber Domain: {} security events tracked", cyber_events.len());
        for event in cyber_events.iter().take(2) {
            let name = event.name.as_ref().unwrap_or(&"Unknown".to_string());
            let status = event.status.as_ref().unwrap_or(&"Unknown".to_string());
            println!("   └─ {}: {}", name, status);
        }

        // Maritime Domain
        let vessels = self.get_vessels().await?;
        println!("🚢 Maritime Domain: {} vessels tracked", vessels.len());
        for vessel in vessels.iter().take(2) {
            let name = vessel.name.as_ref().unwrap_or(&"Unknown".to_string());
            let status = vessel.status.as_ref().unwrap_or(&"Unknown".to_string());
            println!("   └─ {}: {}", name, status);
        }

        // Network Domain
        let network_nodes = self.get_network_nodes().await?;
        println!("🌐 Network Domain: {} nodes online", network_nodes.len());
        for node in network_nodes.iter().take(2) {
            let name = node.name.as_ref().unwrap_or(&"Unknown".to_string());
            let status = node.status.as_ref().unwrap_or(&"Unknown".to_string());
            println!("   └─ {}: {}", name, status);
        }

        // Geographical Domain
        let geo_points = self.get_geo_points().await?;
        println!("🗺️  Geographical Domain: {} monitoring stations", geo_points.len());
        for point in geo_points.iter().take(2) {
            let name = point.name.as_ref().unwrap_or(&"Unknown".to_string());
            let status = point.status.as_ref().unwrap_or(&"Unknown".to_string());
            println!("   └─ {}: {}", name, status);
        }

        Ok(())
    }
}

// --------------------------------------------
// World Domain Status Display
// --------------------------------------------
pub async fn display_world_status() -> surrealdb::Result<()> {
    println!("🌍 === CTAS-7 World Domain Status ===");

    // Space Domain
    let mut satellites_res = surreal_query("SELECT * FROM satellite").await?;
    let satellites: Vec<serde_json::Value> = satellites_res.take(0)?;
    println!("🛰️  Space Domain: {} satellites active", satellites.len());
    for sat in satellites.iter().take(2) {
        let name = sat.get("name").and_then(|v| v.as_str()).unwrap_or("Unknown");
        let status = sat.get("status").and_then(|v| v.as_str()).unwrap_or("Unknown");
        println!("   └─ {}: {}", name, status);
    }

    // Cyber Domain
    let mut cyber_res = surreal_query("SELECT * FROM cyber_event").await?;
    let cyber_events: Vec<serde_json::Value> = cyber_res.take(0)?;
    println!("🔒 Cyber Domain: {} security events tracked", cyber_events.len());
    for event in cyber_events.iter().take(2) {
        let event_type = event.get("event_type").and_then(|v| v.as_str()).unwrap_or("Unknown");
        let status = event.get("status").and_then(|v| v.as_str()).unwrap_or("Unknown");
        println!("   └─ {}: {}", event_type, status);
    }

    // Maritime Domain
    let mut vessel_res = surreal_query("SELECT * FROM vessel").await?;
    let vessels: Vec<serde_json::Value> = vessel_res.take(0)?;
    println!("🚢 Maritime Domain: {} vessels tracked", vessels.len());
    for vessel in vessels.iter().take(2) {
        let name = vessel.get("name").and_then(|v| v.as_str()).unwrap_or("Unknown");
        let status = vessel.get("status").and_then(|v| v.as_str()).unwrap_or("Unknown");
        println!("   └─ {}: {}", name, status);
    }

    // Network Domain
    let mut network_res = surreal_query("SELECT * FROM network_node").await?;
    let network_nodes: Vec<serde_json::Value> = network_res.take(0)?;
    println!("🌐 Network Domain: {} nodes online", network_nodes.len());
    for node in network_nodes.iter().take(2) {
        let name = node.get("name").and_then(|v| v.as_str()).unwrap_or("Unknown");
        let status = node.get("status").and_then(|v| v.as_str()).unwrap_or("Unknown");
        println!("   └─ {}: {}", name, status);
    }

    // Geographical Domain
    let mut geo_res = surreal_query("SELECT * FROM geo_point").await?;
    let geo_points: Vec<serde_json::Value> = geo_res.take(0)?;
    println!("🗺️  Geographical Domain: {} monitoring stations", geo_points.len());
    for point in geo_points.iter().take(2) {
        let name = point.get("name").and_then(|v| v.as_str()).unwrap_or("Unknown");
        let status = point.get("status").and_then(|v| v.as_str()).unwrap_or("Unknown");
        println!("   └─ {}: {}", name, status);
    }

    Ok(())
}

// --------------------------------------------
// Runtime
// --------------------------------------------
#[tokio::main]
async fn main() -> surrealdb::Result<()> {
    println!("🚀 CTAS-7 Surreal Telemetry System Initializing...");

    // Initialize connection
    init_surreal_connection().await?;

    loop {
        // Display comprehensive status
        display_world_status().await?;

        // Insert synthetic telemetry every loop
        let heartbeat_id = format!("heartbeat_{}", chrono::Utc::now().timestamp());
        let metric = rand::random::<f64>() * 100.0;
        push_telemetry_event(&heartbeat_id, "operational", metric).await?;
        println!("💓 Heartbeat inserted: {} (metric: {:.2})", heartbeat_id, metric);

        println!("{}", "─".repeat(60));
        sleep(Duration::from_secs(10)).await;
    }
}