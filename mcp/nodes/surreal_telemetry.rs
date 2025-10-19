// CTAS-7 SurrealDB Live Telemetry Core
// In-process SurrealDB event bus with world-aware telemetry streaming

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex, RwLock};
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::sync::{broadcast, mpsc};
use tokio::time::{interval, Duration};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SurrealEvent {
    pub world_type: String,
    pub event_type: String, // "node_update", "edge_created", "slot_update", "query_executed"
    pub table_name: String,
    pub record_id: String,
    pub operation: String, // "CREATE", "UPDATE", "DELETE", "SELECT"
    pub affected_count: u32,
    pub timestamp: u64,
    pub metadata: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TelemetrySnapshot {
    pub world: String,
    pub event: String,
    pub count: u32,
    pub timestamp: String,
    pub latency_ms: Option<f64>,
    pub active_connections: u32,
    pub query_performance: HashMap<String, f64>,
}

#[derive(Debug, Clone)]
pub struct WorldListener {
    pub world_type: String,
    pub listener_id: String,
    pub sender: broadcast::Sender<SurrealEvent>,
    pub is_active: bool,
    pub events_received: u64,
    pub last_activity: u64,
}

pub struct SurrealTelemetryCore {
    // Event bus and listeners
    global_sender: broadcast::Sender<SurrealEvent>,
    world_listeners: Arc<RwLock<HashMap<String, WorldListener>>>,
    dashboard_sender: mpsc::UnboundedSender<TelemetrySnapshot>,

    // Performance tracking
    event_counts: Arc<Mutex<HashMap<String, u64>>>,
    query_performance: Arc<Mutex<HashMap<String, Vec<f64>>>>,
    active_connections: Arc<Mutex<u32>>,

    // Configuration
    namespace: String,
    database: String,
    is_live: bool,
}

impl SurrealTelemetryCore {
    pub fn new(namespace: &str, database: &str) -> (Self, mpsc::UnboundedReceiver<TelemetrySnapshot>) {
        let (global_sender, _) = broadcast::channel(1000);
        let (dashboard_sender, dashboard_receiver) = mpsc::unbounded_channel();

        let core = Self {
            global_sender,
            world_listeners: Arc::new(RwLock::new(HashMap::new())),
            dashboard_sender,
            event_counts: Arc::new(Mutex::new(HashMap::new())),
            query_performance: Arc::new(Mutex::new(HashMap::new())),
            active_connections: Arc::new(Mutex::new(0)),
            namespace: namespace.to_string(),
            database: database.to_string(),
            is_live: false,
        };

        (core, dashboard_receiver)
    }

    // Register a listener for specific world type events
    pub fn register_listener(&mut self, world_type: &str) -> Result<String, Box<dyn std::error::Error>> {
        let listener_id = format!("listener_{}_{}", world_type,
            SystemTime::now().duration_since(UNIX_EPOCH)?.as_millis());

        let (sender, _) = broadcast::channel(100);

        let listener = WorldListener {
            world_type: world_type.to_string(),
            listener_id: listener_id.clone(),
            sender,
            is_active: true,
            events_received: 0,
            last_activity: SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs(),
        };

        {
            let mut listeners = self.world_listeners.write().unwrap();
            listeners.insert(listener_id.clone(), listener);
        }

        println!("[SURREAL_TELEMETRY] Registered listener for world: {} (ID: {})",
            world_type, listener_id);

        Ok(listener_id)
    }

    // Emit an update event to the telemetry bus
    pub fn emit_update(&self, event: SurrealEvent) -> Result<(), Box<dyn std::error::Error>> {
        println!("[SURREAL_TELEMETRY] Emitting event: {} in world: {} (table: {})",
            event.event_type, event.world_type, event.table_name);

        // Update event counts
        {
            let mut counts = self.event_counts.lock().unwrap();
            let key = format!("{}:{}", event.world_type, event.event_type);
            *counts.entry(key).or_insert(0) += 1;
        }

        // Record query performance if available
        if let Some(latency) = event.metadata.get("query_latency_ms") {
            if let Some(latency_val) = latency.as_f64() {
                let mut performance = self.query_performance.lock().unwrap();
                let key = format!("{}:{}", event.world_type, event.operation);
                performance.entry(key).or_insert_with(Vec::new).push(latency_val);

                // Keep only last 100 measurements
                if let Some(measurements) = performance.get_mut(&format!("{}:{}", event.world_type, event.operation)) {
                    if measurements.len() > 100 {
                        measurements.drain(0..measurements.len() - 100);
                    }
                }
            }
        }

        // Send to global event bus
        if let Err(_) = self.global_sender.send(event.clone()) {
            // No active receivers, which is fine
        }

        // Send to world-specific listeners
        {
            let mut listeners = self.world_listeners.write().unwrap();
            if let Some(listener) = listeners.get_mut(&event.world_type) {
                listener.events_received += 1;
                listener.last_activity = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs();

                if let Err(_) = listener.sender.send(event.clone()) {
                    // No active receivers for this world
                }
            }
        }

        // Create telemetry snapshot for dashboard
        let snapshot = self.create_telemetry_snapshot(&event)?;

        // Send to dashboard (non-blocking)
        if let Err(_) = self.dashboard_sender.send(snapshot) {
            // Dashboard not listening, which is fine
        }

        Ok(())
    }

    // Create a compact telemetry snapshot for the dashboard
    fn create_telemetry_snapshot(&self, event: &SurrealEvent) -> Result<TelemetrySnapshot, Box<dyn std::error::Error>> {
        let counts = self.event_counts.lock().unwrap();
        let performance = self.query_performance.lock().unwrap();
        let connections = self.active_connections.lock().unwrap();

        let event_count = counts.get(&format!("{}:{}", event.world_type, event.event_type))
            .unwrap_or(&0);

        let latency = event.metadata.get("query_latency_ms")
            .and_then(|v| v.as_f64());

        // Calculate average query performance for this world
        let mut query_performance_map = HashMap::new();
        for (key, measurements) in performance.iter() {
            if key.starts_with(&event.world_type) {
                let avg_latency = measurements.iter().sum::<f64>() / measurements.len() as f64;
                query_performance_map.insert(key.clone(), avg_latency);
            }
        }

        Ok(TelemetrySnapshot {
            world: event.world_type.clone(),
            event: event.event_type.clone(),
            count: *event_count as u32,
            timestamp: format_timestamp(event.timestamp),
            latency_ms: latency,
            active_connections: *connections,
            query_performance: query_performance_map,
        })
    }

    // Stream telemetry data to dashboard continuously
    pub async fn stream_to_dashboard(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        self.is_live = true;
        println!("[SURREAL_TELEMETRY] Starting dashboard telemetry stream...");

        let event_counts = Arc::clone(&self.event_counts);
        let query_performance = Arc::clone(&self.query_performance);
        let active_connections = Arc::clone(&self.active_connections);
        let dashboard_sender = self.dashboard_sender.clone();

        // Spawn background task for periodic telemetry snapshots
        tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(2));

            loop {
                interval.tick().await;

                // Generate periodic snapshots for each active world
                let worlds = vec!["space", "geographical", "cyber", "maritime", "network"];

                for world in &worlds {
                    // Simulate ongoing activity
                    let snapshot = generate_mock_telemetry_snapshot(
                        world,
                        &event_counts,
                        &query_performance,
                        &active_connections,
                    ).await;

                    if let Err(_) = dashboard_sender.send(snapshot) {
                        // Dashboard disconnected
                        break;
                    }
                }
            }
        });

        // Simulate database operations
        self.simulate_database_operations().await?;

        Ok(())
    }

    // Simulate realistic SurrealDB operations across different worlds
    async fn simulate_database_operations(&self) -> Result<(), Box<dyn std::error::Error>> {
        println!("[SURREAL_TELEMETRY] Starting simulated database operations...");

        let operations = vec![
            // Space World Operations
            ("space", "node_update", "satellites", "sat_001", "UPDATE"),
            ("space", "edge_created", "orbital_links", "link_001", "CREATE"),
            ("space", "slot_update", "space_slots", "slot_001", "UPDATE"),
            ("space", "query_executed", "ground_stations", "query_001", "SELECT"),

            // Geographical World Operations
            ("geographical", "node_update", "ground_nodes", "node_289", "UPDATE"),
            ("geographical", "edge_created", "network_links", "link_geo_001", "CREATE"),
            ("geographical", "slot_update", "geo_slots", "slot_geo_001", "UPDATE"),

            // Cyber World Operations
            ("cyber", "node_update", "threat_nodes", "threat_001", "CREATE"),
            ("cyber", "edge_created", "attack_vectors", "vector_001", "CREATE"),
            ("cyber", "query_executed", "security_logs", "query_sec_001", "SELECT"),

            // Maritime World Operations
            ("maritime", "node_update", "maritime_assets", "ship_001", "UPDATE"),
            ("maritime", "edge_created", "shipping_routes", "route_001", "CREATE"),

            // Network World Operations
            ("network", "node_update", "hft_nodes", "hft_001", "UPDATE"),
            ("network", "edge_created", "trading_links", "trade_001", "CREATE"),
            ("network", "slot_update", "network_slots", "slot_net_001", "UPDATE"),
        ];

        let mut interval = interval(Duration::from_millis(500));
        let mut operation_index = 0;

        loop {
            interval.tick().await;

            let (world, event_type, table, record_id, operation) = &operations[operation_index % operations.len()];
            operation_index += 1;

            // Create realistic event
            let mut metadata = HashMap::new();
            metadata.insert("query_latency_ms".to_string(),
                serde_json::Value::Number((15.0 + (operation_index as f64 * 3.7) % 45.0).into()));
            metadata.insert("affected_records".to_string(),
                serde_json::Value::Number((1 + operation_index % 5).into()));
            metadata.insert("connection_id".to_string(),
                serde_json::Value::String(format!("conn_{}", operation_index % 10)));

            let event = SurrealEvent {
                world_type: world.to_string(),
                event_type: event_type.to_string(),
                table_name: table.to_string(),
                record_id: record_id.to_string(),
                operation: operation.to_string(),
                affected_count: 1 + (operation_index % 3) as u32,
                timestamp: SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs(),
                metadata,
            };

            self.emit_update(event)?;

            // Update active connections count
            {
                let mut connections = self.active_connections.lock().unwrap();
                *connections = 8 + (operation_index % 15) as u32;
            }
        }
    }

    // Get current telemetry statistics
    pub fn get_telemetry_stats(&self) -> Result<HashMap<String, serde_json::Value>, Box<dyn std::error::Error>> {
        let mut stats = HashMap::new();

        let event_counts = self.event_counts.lock().unwrap();
        let query_performance = self.query_performance.lock().unwrap();
        let active_connections = self.active_connections.lock().unwrap();
        let listeners = self.world_listeners.read().unwrap();

        // Event counts by world and type
        let mut world_stats = HashMap::new();
        for (key, count) in event_counts.iter() {
            let parts: Vec<&str> = key.split(':').collect();
            if parts.len() == 2 {
                let world = parts[0];
                let event_type = parts[1];

                let world_entry = world_stats.entry(world.to_string())
                    .or_insert_with(HashMap::new);
                world_entry.insert(event_type.to_string(), *count);
            }
        }

        stats.insert("namespace".to_string(), serde_json::Value::String(self.namespace.clone()));
        stats.insert("database".to_string(), serde_json::Value::String(self.database.clone()));
        stats.insert("is_live".to_string(), serde_json::Value::Bool(self.is_live));
        stats.insert("active_connections".to_string(), serde_json::Value::Number((*active_connections).into()));
        stats.insert("registered_listeners".to_string(), serde_json::Value::Number(listeners.len().into()));
        stats.insert("world_event_counts".to_string(), serde_json::to_value(world_stats)?);

        // Query performance averages
        let mut perf_averages = HashMap::new();
        for (key, measurements) in query_performance.iter() {
            if !measurements.is_empty() {
                let avg = measurements.iter().sum::<f64>() / measurements.len() as f64;
                perf_averages.insert(key.clone(), avg);
            }
        }
        stats.insert("query_performance_ms".to_string(), serde_json::to_value(perf_averages)?);

        Ok(stats)
    }

    // Subscribe to world-specific events
    pub fn subscribe_to_world(&self, world_type: &str) -> Result<broadcast::Receiver<SurrealEvent>, Box<dyn std::error::Error>> {
        let listeners = self.world_listeners.read().unwrap();

        if let Some(listener) = listeners.get(world_type) {
            Ok(listener.sender.subscribe())
        } else {
            Err(format!("No listener registered for world: {}", world_type).into())
        }
    }

    // Get listener status
    pub fn get_listener_status(&self) -> HashMap<String, serde_json::Value> {
        let listeners = self.world_listeners.read().unwrap();
        let mut status = HashMap::new();

        for (world_type, listener) in listeners.iter() {
            let listener_info = serde_json::json!({
                "listener_id": listener.listener_id,
                "is_active": listener.is_active,
                "events_received": listener.events_received,
                "last_activity": format_timestamp(listener.last_activity)
            });
            status.insert(world_type.clone(), listener_info);
        }

        status
    }
}

// Helper function to generate mock telemetry snapshots
async fn generate_mock_telemetry_snapshot(
    world: &str,
    event_counts: &Arc<Mutex<HashMap<String, u64>>>,
    query_performance: &Arc<Mutex<HashMap<String, Vec<f64>>>>,
    active_connections: &Arc<Mutex<u32>>,
) -> TelemetrySnapshot {
    let counts = event_counts.lock().unwrap();
    let performance = query_performance.lock().unwrap();
    let connections = active_connections.lock().unwrap();

    let event_key = format!("{}:node_update", world);
    let count = counts.get(&event_key).unwrap_or(&0);

    let mut query_performance_map = HashMap::new();
    for (key, measurements) in performance.iter() {
        if key.starts_with(world) && !measurements.is_empty() {
            let avg_latency = measurements.iter().sum::<f64>() / measurements.len() as f64;
            query_performance_map.insert(key.clone(), avg_latency);
        }
    }

    TelemetrySnapshot {
        world: world.to_string(),
        event: "node_update".to_string(),
        count: *count as u32,
        timestamp: format_timestamp(SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs()),
        latency_ms: Some(18.5 + (world.len() as f64 * 2.3)),
        active_connections: *connections,
        query_performance: query_performance_map,
    }
}

// Helper function to format timestamps
fn format_timestamp(timestamp: u64) -> String {
    let datetime = std::time::UNIX_EPOCH + std::time::Duration::from_secs(timestamp);
    // In production, this would use proper datetime formatting
    // For simulation, we'll create ISO-like format
    format!("2025-10-18T{}:{}:{}Z",
        20 + (timestamp % 4),
        (timestamp % 60),
        (timestamp % 60)
    )
}

// CLI entry point for testing
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("CTAS-7 SurrealDB Telemetry Core v1.0.0");
    println!("======================================");

    let (mut telemetry_core, mut dashboard_receiver) = SurrealTelemetryCore::new("ctas7", "hft_network");

    // Register listeners for all CTAS-7 worlds
    let worlds = vec!["space", "geographical", "cyber", "maritime", "network"];
    for world in &worlds {
        telemetry_core.register_listener(world)?;
    }

    // Start dashboard stream in background
    let mut telemetry_clone = telemetry_core.clone();
    tokio::spawn(async move {
        if let Err(e) = telemetry_clone.stream_to_dashboard().await {
            eprintln!("Dashboard stream error: {}", e);
        }
    });

    // Monitor dashboard telemetry
    tokio::spawn(async move {
        while let Some(snapshot) = dashboard_receiver.recv().await {
            println!("📊 Dashboard Telemetry: {}", serde_json::to_string(&snapshot).unwrap_or_default());
        }
    });

    // Manual event emission for testing
    let test_event = SurrealEvent {
        world_type: "space".to_string(),
        event_type: "node_update".to_string(),
        table_name: "satellites".to_string(),
        record_id: "sat_test_001".to_string(),
        operation: "UPDATE".to_string(),
        affected_count: 32,
        timestamp: SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs(),
        metadata: {
            let mut metadata = HashMap::new();
            metadata.insert("query_latency_ms".to_string(), serde_json::Value::Number(23.7.into()));
            metadata.insert("orbital_period".to_string(), serde_json::Value::Number(90.5.into()));
            metadata
        },
    };

    telemetry_core.emit_update(test_event)?;

    // Display current stats
    let stats = telemetry_core.get_telemetry_stats()?;
    println!("\n📈 Telemetry Statistics:");
    println!("{}", serde_json::to_string_pretty(&stats)?);

    // Keep running for demonstration
    tokio::time::sleep(Duration::from_secs(10)).await;

    println!("\n✅ SurrealDB Telemetry Core demonstration complete");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_listener_registration() {
        let (mut core, _) = SurrealTelemetryCore::new("test", "test_db");
        let listener_id = core.register_listener("space").unwrap();
        assert!(!listener_id.is_empty());

        let status = core.get_listener_status();
        assert!(status.contains_key("space"));
    }

    #[tokio::test]
    async fn test_event_emission() {
        let (core, _) = SurrealTelemetryCore::new("test", "test_db");

        let event = SurrealEvent {
            world_type: "test".to_string(),
            event_type: "node_update".to_string(),
            table_name: "test_table".to_string(),
            record_id: "test_001".to_string(),
            operation: "UPDATE".to_string(),
            affected_count: 1,
            timestamp: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
            metadata: HashMap::new(),
        };

        assert!(core.emit_update(event).is_ok());
    }

    #[test]
    fn test_telemetry_stats() {
        let (core, _) = SurrealTelemetryCore::new("test", "test_db");
        let stats = core.get_telemetry_stats().unwrap();

        assert_eq!(stats.get("namespace").unwrap().as_str().unwrap(), "test");
        assert_eq!(stats.get("database").unwrap().as_str().unwrap(), "test_db");
    }
}