// CTAS-7 Dioxus Telemetry Integration
// Handles MCP events and live telemetry display in the Dioxus dashboard

use super::{McpEvent, TelemetryEvent, LiveTelemetryData, SchemaStatus};
use dioxus::prelude::*;
use serde_json;
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

// Telemetry connection and event handling functions
pub fn spawn_telemetry_listener(
    cx: &ScopeState,
    telemetry_setter: &UseStateSetter<LiveTelemetryData>,
    connected_setter: &UseStateSetter<bool>,
) {
    // Simulate MCP telemetry connection
    println!("[DIOXUS] Initializing telemetry connection...");

    // Set connected state
    connected_setter.set(true);

    // Simulate receiving telemetry data
    let telemetry_clone = telemetry_setter.clone();
    spawn(async move {
        loop {
            // Simulate periodic telemetry updates
            let mock_data = generate_mock_telemetry_data().await;
            telemetry_clone.set(mock_data);

            // Update every 2 seconds
            gloo_timers::future::TimeoutFuture::new(2000).await;
        }
    });
}

pub async fn generate_mock_telemetry_data() -> LiveTelemetryData {
    let current_time = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();

    // Generate mock schema status
    let schema_status = SchemaStatus {
        current_hash: Some("a1b2c3d4e5f6g7h8".to_string()),
        last_updated: current_time - 300, // 5 minutes ago
        schema_path: "./database/supabase_schema.ts".to_string(),
        table_count: Some(7),
        status: "synced".to_string(),
    };

    // Generate mock recent events
    let recent_events = vec![
        TelemetryEvent {
            event_id: format!("evt_{}", current_time),
            event_type: "schema_updated".to_string(),
            target_system: "legion".to_string(),
            payload: serde_json::json!({
                "action": "reload_database_types",
                "new_hash": "a1b2c3d4",
                "affected_systems": ["LegionExecutionEngine", "SlotGraphQueryEngine"]
            }),
            timestamp: current_time - 120,
            routing_metadata: {
                let mut metadata = HashMap::new();
                metadata.insert("source".to_string(), "schema_sync".to_string());
                metadata.insert("routing_timestamp".to_string(), current_time.to_string());
                metadata
            },
        },
        TelemetryEvent {
            event_id: format!("evt_{}", current_time - 1),
            event_type: "playwright_test_completed".to_string(),
            target_system: "dioxus".to_string(),
            payload: serde_json::json!({
                "ui_action": "update_test_dashboard",
                "test_results": {
                    "passed": 11,
                    "failed": 1,
                    "avg_latency": 185.2
                }
            }),
            timestamp: current_time - 60,
            routing_metadata: {
                let mut metadata = HashMap::new();
                metadata.insert("source".to_string(), "playwright_harness".to_string());
                metadata.insert("routing_timestamp".to_string(), current_time.to_string());
                metadata
            },
        },
        TelemetryEvent {
            event_id: format!("evt_{}", current_time - 2),
            event_type: "legion_task_completed".to_string(),
            target_system: "neural_mux".to_string(),
            payload: serde_json::json!({
                "topic": "ctas7.task.completion",
                "data": {
                    "task_id": "legion_task_001",
                    "world_type": "space",
                    "hd4_phase": "detect",
                    "execution_time_ms": 1250,
                    "success": true
                }
            }),
            timestamp: current_time - 30,
            routing_metadata: {
                let mut metadata = HashMap::new();
                metadata.insert("source".to_string(), "legion_execution_engine".to_string());
                metadata.insert("routing_timestamp".to_string(), current_time.to_string());
                metadata
            },
        },
    ];

    // Generate mock Legion status
    let mut legion_status = HashMap::new();
    legion_status.insert("running_tasks".to_string(), serde_json::Value::Number(3.into()));
    legion_status.insert("current_hash".to_string(), serde_json::Value::String("a1b2c3d4".to_string()));
    legion_status.insert("last_update".to_string(), serde_json::Value::Number(current_time.into()));
    legion_status.insert("listeners_count".to_string(), serde_json::Value::Number(2.into()));
    legion_status.insert("is_watching".to_string(), serde_json::Value::Bool(true));

    // Generate mock Playwright results
    let mut playwright_results = HashMap::new();
    playwright_results.insert("passed".to_string(), serde_json::Value::Number(11.into()));
    playwright_results.insert("failed".to_string(), serde_json::Value::Number(1.into()));
    playwright_results.insert("avg_latency".to_string(), serde_json::Value::Number(185.into()));
    playwright_results.insert("last_run".to_string(), serde_json::Value::String(format_timestamp(current_time - 180)));

    // Generate mock Neural Mux metrics
    let mut neural_mux_metrics = HashMap::new();
    neural_mux_metrics.insert("kpi.recycling.success_rate".to_string(), 86.2);
    neural_mux_metrics.insert("ops.trackers.active_count".to_string(), 42.0);
    neural_mux_metrics.insert("qa5.validation.credibility_avg".to_string(), 4.3);
    neural_mux_metrics.insert("schema.sync.latency_ms".to_string(), 23.7);
    neural_mux_metrics.insert("legion.tasks.completion_rate".to_string(), 94.8);

    LiveTelemetryData {
        schema_status,
        recent_events,
        legion_status,
        playwright_results: Some(playwright_results),
        neural_mux_metrics,
    }
}

pub fn format_timestamp(timestamp: u64) -> String {
    let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    let diff = now.saturating_sub(timestamp);

    if diff < 60 {
        format!("{}s ago", diff)
    } else if diff < 3600 {
        format!("{}m ago", diff / 60)
    } else if diff < 86400 {
        format!("{}h ago", diff / 3600)
    } else {
        format!("{}d ago", diff / 86400)
    }
}

// MCP Event handling functions for Dioxus
pub fn handle_mcp_event(
    event: McpEvent,
    telemetry_data: &UseState<LiveTelemetryData>,
) {
    println!("[DIOXUS] Received MCP event: {}", event.event_type);

    match event.event_type.as_str() {
        "schema_updated" => {
            handle_schema_update_event(event, telemetry_data);
        }
        "schema_nochange" => {
            handle_schema_nochange_event(event, telemetry_data);
        }
        "legion_schema_telemetry" => {
            handle_legion_telemetry_event(event, telemetry_data);
        }
        "playwright_test_completed" => {
            handle_playwright_results_event(event, telemetry_data);
        }
        _ => {
            // Handle generic events
            println!("[DIOXUS] Unhandled event type: {}", event.event_type);
        }
    }
}

fn handle_schema_update_event(
    event: McpEvent,
    telemetry_data: &UseState<LiveTelemetryData>,
) {
    println!("[DIOXUS] Processing schema update event");

    let mut data = telemetry_data.get().clone();

    // Update schema status
    if let Some(new_hash) = event.payload.get("new_hash") {
        if let Some(hash_str) = new_hash.as_str() {
            data.schema_status.current_hash = Some(hash_str.to_string());
        }
    }

    if let Some(table_count) = event.payload.get("table_count") {
        if let Some(count) = table_count.as_u64() {
            data.schema_status.table_count = Some(count as u32);
        }
    }

    data.schema_status.last_updated = event.timestamp;
    data.schema_status.status = "synced".to_string();

    // Add to recent events
    let telemetry_event = TelemetryEvent {
        event_id: format!("dioxus_{}", event.timestamp),
        event_type: "schema_update_notification".to_string(),
        target_system: "dioxus".to_string(),
        payload: serde_json::json!({
            "ui_action": "display_schema_update_notification",
            "notification_type": "success",
            "message": "Database schema updated successfully"
        }),
        timestamp: event.timestamp,
        routing_metadata: HashMap::new(),
    };

    data.recent_events.insert(0, telemetry_event);

    // Keep only the last 20 events
    data.recent_events.truncate(20);

    telemetry_data.set(data);

    println!("[DIOXUS] Schema status updated in UI");
}

fn handle_schema_nochange_event(
    event: McpEvent,
    telemetry_data: &UseState<LiveTelemetryData>,
) {
    println!("[DIOXUS] Schema verified - no changes");

    let mut data = telemetry_data.get().clone();
    data.schema_status.status = "synced".to_string();

    telemetry_data.set(data);
}

fn handle_legion_telemetry_event(
    event: McpEvent,
    telemetry_data: &UseState<LiveTelemetryData>,
) {
    println!("[DIOXUS] Processing Legion telemetry event");

    let mut data = telemetry_data.get().clone();

    // Update Legion status from telemetry
    if let Some(running_tasks) = event.payload.get("running_tasks") {
        data.legion_status.insert("running_tasks".to_string(), running_tasks.clone());
    }

    if let Some(schema_hash) = event.payload.get("schema_hash") {
        data.legion_status.insert("current_hash".to_string(), schema_hash.clone());
    }

    if let Some(update_status) = event.payload.get("update_status") {
        data.legion_status.insert("last_status".to_string(), update_status.clone());
    }

    telemetry_data.set(data);

    println!("[DIOXUS] Legion status updated in UI");
}

fn handle_playwright_results_event(
    event: McpEvent,
    telemetry_data: &UseState<LiveTelemetryData>,
) {
    println!("[DIOXUS] Processing Playwright test results");

    let mut data = telemetry_data.get().clone();

    // Extract test results from payload
    if let Some(test_results) = event.payload.get("test_results") {
        if let Some(results_obj) = test_results.as_object() {
            let mut playwright_results = HashMap::new();

            for (key, value) in results_obj {
                playwright_results.insert(key.clone(), value.clone());
            }

            playwright_results.insert(
                "last_run".to_string(),
                serde_json::Value::String(format_timestamp(event.timestamp))
            );

            data.playwright_results = Some(playwright_results);
        }
    }

    telemetry_data.set(data);

    println!("[DIOXUS] Playwright results updated in UI");
}

// Export the telemetry handler for external MCP systems
pub fn create_dioxus_mcp_handler(
    telemetry_data: UseState<LiveTelemetryData>,
) -> impl Fn(McpEvent) {
    move |event: McpEvent| {
        handle_mcp_event(event, &telemetry_data);
    }
}

// WebSocket connection handler for production MCP integration
pub async fn connect_to_mcp_telemetry_bridge(
    endpoint: &str,
    telemetry_handler: impl Fn(McpEvent) + Send + 'static,
) -> Result<(), Box<dyn std::error::Error>> {
    println!("[DIOXUS] Connecting to MCP Telemetry Bridge at: {}", endpoint);

    // In production, this would establish a WebSocket connection to the telemetry bridge
    // For simulation, we'll just log the connection attempt

    println!("[DIOXUS] ✅ Connected to MCP Telemetry Bridge");
    println!("[DIOXUS] 📡 Listening for schema updates, Legion events, and Playwright results");

    // Simulate receiving periodic events
    tokio::spawn(async move {
        loop {
            // Simulate various MCP events
            let mock_events = vec![
                McpEvent {
                    event_type: "schema_updated".to_string(),
                    timestamp: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
                    payload: {
                        let mut payload = HashMap::new();
                        payload.insert("new_hash".to_string(), serde_json::Value::String("abc123def456".to_string()));
                        payload.insert("table_count".to_string(), serde_json::Value::Number(7.into()));
                        payload
                    },
                    source_node: "schema_sync".to_string(),
                },
                McpEvent {
                    event_type: "legion_schema_telemetry".to_string(),
                    timestamp: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
                    payload: {
                        let mut payload = HashMap::new();
                        payload.insert("running_tasks".to_string(), serde_json::Value::Number(2.into()));
                        payload.insert("update_status".to_string(), serde_json::Value::String("success".to_string()));
                        payload
                    },
                    source_node: "legion_execution_engine".to_string(),
                },
            ];

            for event in mock_events {
                telemetry_handler(event);
            }

            // Wait 30 seconds before next batch
            tokio::time::sleep(tokio::time::Duration::from_secs(30)).await;
        }
    });

    Ok(())
}