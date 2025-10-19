// CTAS-7 Dioxus Dashboard Module
// Renders EA/QA dashboards with SmartCrate-linked DB routes

use dioxus::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

// Telemetry integration module
pub mod telemetry;

// SurrealDB live telemetry panel
pub mod surreal_live_panel;

// MCP Event interfaces for telemetry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct McpEvent {
    pub event_type: String,
    pub timestamp: u64,
    pub payload: HashMap<String, serde_json::Value>,
    pub source_node: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TelemetryEvent {
    pub event_id: String,
    pub event_type: String,
    pub target_system: String,
    pub payload: serde_json::Value,
    pub timestamp: u64,
    pub routing_metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SchemaStatus {
    pub current_hash: Option<String>,
    pub last_updated: u64,
    pub schema_path: String,
    pub table_count: Option<u32>,
    pub status: String, // "synced", "updating", "error"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LiveTelemetryData {
    pub schema_status: SchemaStatus,
    pub recent_events: Vec<TelemetryEvent>,
    pub legion_status: HashMap<String, serde_json::Value>,
    pub playwright_results: Option<HashMap<String, serde_json::Value>>,
    pub neural_mux_metrics: HashMap<String, f64>,
}

impl Default for LiveTelemetryData {
    fn default() -> Self {
        Self {
            schema_status: SchemaStatus {
                current_hash: None,
                last_updated: 0,
                schema_path: "./database/supabase_schema.ts".to_string(),
                table_count: None,
                status: "unknown".to_string(),
            },
            recent_events: Vec::new(),
            legion_status: HashMap::new(),
            playwright_results: None,
            neural_mux_metrics: HashMap::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionElement {
    pub id: String,
    pub role: String,
    pub db_route: Option<String>,
    pub trigger_type: String,
    pub expected_response: String,
    pub latency_ms: Option<u32>,
    pub dependencies: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CTASConfig {
    pub neural_mux_endpoint: String,
    pub supabase_url: String,
    pub surrealdb_endpoint: String,
    pub enable_gis: bool,
    pub enable_telemetry: bool,
}

impl Default for CTASConfig {
    fn default() -> Self {
        Self {
            neural_mux_endpoint: "ws://localhost:18100".to_string(),
            supabase_url: "https://ctas-core.supabase.co".to_string(),
            surrealdb_endpoint: "ws://localhost:8000".to_string(),
            enable_gis: false,
            enable_telemetry: true,
        }
    }
}

#[component]
pub fn CTASDashboard(cx: Scope) -> Element {
    let config = use_state(cx, CTASConfig::default);
    let action_elements = use_state(cx, HashMap::<String, ActionElement>::new);
    let telemetry_data = use_state(cx, LiveTelemetryData::default);
    let telemetry_connected = use_state(cx, || false);

    // Initialize telemetry connection
    use_effect(cx, (), |_| {
        // Simulate telemetry connection
        telemetry::spawn_telemetry_listener(cx, telemetry_data.setter(), telemetry_connected.setter());
        async move {}
    });

    render! {
        div {
            class: "container",
            "data-page-requires": "telemetry,db",
            "data-component": "ctas-dashboard",
            "data-telemetry-connected": "{telemetry_connected}",

            // Telemetry Status Bar
            div {
                class: "telemetry-status-bar",
                "data-component": "telemetry-status",
                "data-route": "mcp://telemetry/status",

                div { class: "status-indicator",
                    span { class: if **telemetry_connected { "status-connected" } else { "status-disconnected" },
                        if **telemetry_connected { "🟢 MCP Connected" } else { "🔴 MCP Disconnected" }
                    }
                }

                div { class: "schema-status",
                    "data-component": "schema-indicator",
                    "data-action": "show-schema-details",
                    span { class: "schema-hash",
                        "Schema: ",
                        match &telemetry_data.schema_status.current_hash {
                            Some(hash) => &hash[..8.min(hash.len())],
                            None => "unknown"
                        }
                    }
                    span { class: "schema-status-badge",
                        match telemetry_data.schema_status.status.as_str() {
                            "synced" => "✅",
                            "updating" => "🔄",
                            "error" => "❌",
                            _ => "❓"
                        }
                    }
                }

                div { class: "legion-status",
                    "data-component": "legion-indicator",
                    span { class: "legion-tasks",
                        "Legion: ",
                        telemetry_data.legion_status.get("running_tasks")
                            .and_then(|v| v.as_u64())
                            .unwrap_or(0),
                        " tasks"
                    }
                }
            }

            // Live Event Stream
            div {
                class: "telemetry-events-panel",
                "data-component": "event-stream",
                "data-route": "mcp://telemetry/events",

                h3 { "Live Event Stream" }

                div { class: "event-list",
                    for event in telemetry_data.recent_events.iter().take(10) {
                        div {
                            class: "event-item",
                            "data-component": "telemetry-event",
                            "data-event-type": "{event.event_type}",
                            "data-event-id": "{event.event_id}",

                            div { class: "event-header",
                                span { class: "event-type", "{event.event_type}" }
                                span { class: "event-target", "→ {event.target_system}" }
                                span { class: "event-timestamp",
                                    telemetry::format_timestamp(event.timestamp)
                                }
                            }

                            div { class: "event-payload",
                                format!("{}", event.payload)
                            }
                        }
                    }
                }
            }

            // Schema Details Panel
            div {
                class: "schema-details-panel",
                "data-component": "schema-details",
                "data-route": "supabase://schema/status",

                h3 { "Database Schema Status" }

                div { class: "schema-info",
                    div { class: "schema-item",
                        strong { "Current Hash: " }
                        span { class: "hash-display",
                            telemetry_data.schema_status.current_hash.as_deref().unwrap_or("none")
                        }
                    }

                    div { class: "schema-item",
                        strong { "Table Count: " }
                        span { class: "table-count",
                            telemetry_data.schema_status.table_count.unwrap_or(0)
                        }
                    }

                    div { class: "schema-item",
                        strong { "Last Updated: " }
                        span { class: "last-updated",
                            if telemetry_data.schema_status.last_updated > 0 {
                                telemetry::format_timestamp(telemetry_data.schema_status.last_updated)
                            } else {
                                "Never".to_string()
                            }
                        }
                    }

                    div { class: "schema-item",
                        strong { "Schema Path: " }
                        span { class: "schema-path",
                            "{telemetry_data.schema_status.schema_path}"
                        }
                    }
                }
            }

            // Playwright Test Results Panel
            if let Some(playwright_results) = &telemetry_data.playwright_results {
                div {
                    class: "playwright-results-panel",
                    "data-component": "playwright-results",
                    "data-route": "playwright://test/results",

                    h3 { "Playwright Test Results" }

                    div { class: "test-summary",
                        div { class: "test-stat",
                            strong { "Passed: " }
                            span { class: "passed-count",
                                playwright_results.get("passed")
                                    .and_then(|v| v.as_u64())
                                    .unwrap_or(0)
                            }
                        }

                        div { class: "test-stat",
                            strong { "Failed: " }
                            span { class: "failed-count",
                                playwright_results.get("failed")
                                    .and_then(|v| v.as_u64())
                                    .unwrap_or(0)
                            }
                        }

                        div { class: "test-stat",
                            strong { "Avg Latency: " }
                            span { class: "avg-latency",
                                playwright_results.get("avg_latency")
                                    .and_then(|v| v.as_f64())
                                    .unwrap_or(0.0),
                                "ms"
                            }
                        }
                    }
                }
            }

            // Neural Mux Metrics Panel
            div {
                class: "neural-mux-panel",
                "data-component": "neural-mux-metrics",
                "data-route": "neural-mux://metrics/live",

                h3 { "Neural Mux Telemetry" }

                div { class: "metrics-grid",
                    for (metric_name, metric_value) in &telemetry_data.neural_mux_metrics {
                        div {
                            class: "metric-item",
                            "data-component": "kpi-tile",
                            "data-kpi": "{metric_name}",
                            "data-action": "refresh-kpi",

                            div { class: "metric-name", "{metric_name}" }
                            div { class: "metric-value", format!("{:.2}", metric_value) }
                        }
                    }
                }
            }

            // SurrealDB Live Telemetry Panel
            surreal_live_panel::SurrealLivePanel {}

            // Sidebar Navigation
            aside {
                class: "sidebar",
                "data-component": "sidebar",

                DoDAFDrawer { action_elements: action_elements.clone() }
                BNEDrawer { action_elements: action_elements.clone() }
                QA5Drawer { action_elements: action_elements.clone() }
            }

            // Top Navigation
            header {
                class: "topnav",
                "data-component": "topnav",

                TopNavButtons { action_elements: action_elements.clone() }
            }

            // Main Content
            main {
                class: "main",
                "data-component": "main-content",

                EAContentPanel {
                    config: config.clone(),
                    action_elements: action_elements.clone()
                }
            }
        }
    }
}

#[component]
fn DoDAFDrawer(cx: Scope, action_elements: UseState<HashMap<String, ActionElement>>) -> Element {
    render! {
        div {
            class: "drawer open",
            "data-drawer": "dodaf",
            "data-component": "drawer",

            div {
                class: "drawer__head",
                "data-action": "toggle-drawer",
                onclick: |_| {
                    // Register action element
                    let mut elements = action_elements.get().clone();
                    elements.insert("dodaf-drawer-toggle".to_string(), ActionElement {
                        id: "dodaf-drawer-toggle".to_string(),
                        role: "drawer-toggle".to_string(),
                        db_route: None,
                        trigger_type: "click".to_string(),
                        expected_response: "drawer-animation".to_string(),
                        latency_ms: Some(300),
                        dependencies: vec!["css-animations".to_string()],
                    });
                    action_elements.set(elements);
                },

                div { class: "drawer__title", "DoDAF 2.02 Framework" }
                svg { class: "drawer__chev", viewBox: "0 0 24 24",
                    path { d: "M9 6l6 6-6 6" }
                }
            }

            div {
                class: "drawer__content",

                div {
                    class: "navlist__item active",
                    "data-section": "ov",
                    "data-route": "surrealdb://ctas/docgraph/ov",
                    "data-action": "load-operational-views",
                    onclick: |_| {
                        let mut elements = action_elements.get().clone();
                        elements.insert("ov-nav".to_string(), ActionElement {
                            id: "ov-nav".to_string(),
                            role: "navigation".to_string(),
                            db_route: Some("surrealdb://ctas/docgraph/ov".to_string()),
                            trigger_type: "click".to_string(),
                            expected_response: "operational-views-data".to_string(),
                            latency_ms: Some(150),
                            dependencies: vec!["surrealdb".to_string()],
                        });
                        action_elements.set(elements);
                    },
                    "Operational Views (OV)"
                }

                div {
                    class: "navlist__item",
                    "data-section": "sv",
                    "data-route": "surrealdb://ctas/docgraph/sv",
                    "data-action": "load-systems-views",
                    "Systems Views (SV)"
                }

                div {
                    class: "navlist__item",
                    "data-section": "tv",
                    "data-route": "supabase://ctas-core/standards",
                    "data-action": "load-technical-standards",
                    "Technical Standards (TV)"
                }
            }
        }
    }
}

#[component]
fn BNEDrawer(cx: Scope, action_elements: UseState<HashMap<String, ActionElement>>) -> Element {
    render! {
        div {
            class: "drawer",
            "data-drawer": "bne",
            "data-component": "drawer",

            div {
                class: "drawer__head",
                "data-action": "toggle-drawer",

                div { class: "drawer__title", "BNE Methodology" }
                svg { class: "drawer__chev", viewBox: "0 0 24 24",
                    path { d: "M9 6l6 6-6 6" }
                }
            }

            div {
                class: "drawer__content",

                div {
                    class: "navlist__item",
                    "data-section": "archaeology",
                    "data-route": "surrealdb://ctas/docgraph/bne_cases",
                    "data-action": "load-archaeological-cases",
                    "data-neural-mux": "kpi.recycling",
                    onclick: |_| {
                        let mut elements = action_elements.get().clone();
                        elements.insert("archaeology-nav".to_string(), ActionElement {
                            id: "archaeology-nav".to_string(),
                            role: "navigation".to_string(),
                            db_route: Some("surrealdb://ctas/docgraph/bne_cases".to_string()),
                            trigger_type: "click".to_string(),
                            expected_response: "archaeological-cases-data".to_string(),
                            latency_ms: Some(100),
                            dependencies: vec!["surrealdb".to_string(), "neural-mux".to_string()],
                        });
                        action_elements.set(elements);
                    },
                    "Archaeological Recycling"
                }

                div {
                    class: "navlist__item",
                    "data-section": "validation",
                    "data-route": "redis://edge-cache/kpi:recycling",
                    "data-action": "load-validation-metrics",
                    "Validation Results"
                }
            }
        }
    }
}

#[component]
fn QA5Drawer(cx: Scope, action_elements: UseState<HashMap<String, ActionElement>>) -> Element {
    render! {
        div {
            class: "drawer",
            "data-drawer": "qa5",
            "data-component": "drawer",

            div {
                class: "drawer__head",
                "data-action": "toggle-drawer",

                div { class: "drawer__title", "QA5 Validation" }
                svg { class: "drawer__chev", viewBox: "0 0 24 24",
                    path { d: "M9 6l6 6-6 6" }
                }
            }

            div {
                class: "drawer__content",

                div {
                    class: "navlist__item",
                    "data-section": "source-matrix",
                    "data-route": "supabase://ctas-core/qa5_sources",
                    "data-action": "load-source-reliability",
                    "Source Reliability Matrix"
                }

                div {
                    class: "navlist__item",
                    "data-section": "info-credibility",
                    "data-route": "supabase://ctas-core/qa5_sources",
                    "data-action": "load-info-credibility",
                    "Information Credibility"
                }
            }
        }
    }
}

#[component]
fn TopNavButtons(cx: Scope, action_elements: UseState<HashMap<String, ActionElement>>) -> Element {
    render! {
        button {
            class: "btn primary",
            "data-mode": "documentation",
            "data-action": "switch-mode",
            "data-component": "nav-button",
            onclick: |_| {
                let mut elements = action_elements.get().clone();
                elements.insert("nav-docs".to_string(), ActionElement {
                    id: "nav-docs".to_string(),
                    role: "mode-switch".to_string(),
                    db_route: None,
                    trigger_type: "click".to_string(),
                    expected_response: "mode-switch-animation".to_string(),
                    latency_ms: Some(50),
                    dependencies: vec!["ui-state".to_string()],
                });
                action_elements.set(elements);
            },
            "📄 Documentation"
        }

        button {
            class: "btn",
            "data-mode": "validation",
            "data-action": "switch-mode",
            "data-component": "nav-button",
            "🔍 Validation"
        }

        button {
            class: "btn",
            "data-mode": "metrics",
            "data-action": "switch-mode",
            "data-component": "nav-button",
            "data-neural-mux": "ops.trackers",
            "📊 Metrics"
        }
    }
}

#[component]
fn EAContentPanel(cx: Scope,
    config: UseState<CTASConfig>,
    action_elements: UseState<HashMap<String, ActionElement>>
) -> Element {
    render! {
        div {
            class: "content-panel",
            "data-component": "content-panel",

            // KPI Section
            div {
                class: "kpi",
                "data-component": "kpi-grid",

                KPITile {
                    title: "Recycling Success",
                    value: "86.0%",
                    kpi_id: "recycling-success",
                    db_route: "redis://edge-cache/kpi:recycling",
                    action_elements: action_elements.clone(),
                }

                KPITile {
                    title: "Primitives Ready",
                    value: "32 / 32",
                    kpi_id: "primitives-ready",
                    db_route: "surrealdb://ctas/docgraph/metrics",
                    action_elements: action_elements.clone(),
                }

                KPITile {
                    title: "DoD Compliance",
                    value: "98.2%",
                    kpi_id: "dod-compliance",
                    db_route: "supabase://ctas-core/standards",
                    action_elements: action_elements.clone(),
                }
            }

            // Action Cards
            div {
                class: "cards-section",
                "data-component": "action-cards",

                ActionCard {
                    title: "Sync Operational Views",
                    action: "sync-ov",
                    db_route: "surrealdb://ctas/docgraph/ov",
                    action_elements: action_elements.clone(),
                }

                ActionCard {
                    title: "Validate Architecture",
                    action: "validate-arch",
                    db_route: "supabase://ctas-core/standards",
                    action_elements: action_elements.clone(),
                }
            }
        }
    }
}

#[component]
fn KPITile(cx: Scope,
    title: &'static str,
    value: &'static str,
    kpi_id: &'static str,
    db_route: &'static str,
    action_elements: UseState<HashMap<String, ActionElement>>
) -> Element {
    render! {
        div {
            class: "kpi__tile",
            "data-component": "kpi-tile",
            "data-kpi": "{kpi_id}",
            "data-route": "{db_route}",
            "data-action": "refresh-kpi",
            onclick: |_| {
                let mut elements = action_elements.get().clone();
                elements.insert(format!("kpi-{}", kpi_id), ActionElement {
                    id: format!("kpi-{}", kpi_id),
                    role: "kpi-display".to_string(),
                    db_route: Some(db_route.to_string()),
                    trigger_type: "click".to_string(),
                    expected_response: "kpi-refresh".to_string(),
                    latency_ms: Some(200),
                    dependencies: vec!["database".to_string()],
                });
                action_elements.set(elements);
            },

            div { class: "kpi__label", "{title}" }
            div { class: "kpi__value", "{value}" }
        }
    }
}

#[component]
fn ActionCard(cx: Scope,
    title: &'static str,
    action: &'static str,
    db_route: &'static str,
    action_elements: UseState<HashMap<String, ActionElement>>
) -> Element {
    render! {
        div {
            class: "card",
            "data-component": "action-card",
            "data-action": "{action}",
            "data-route": "{db_route}",

            div { class: "card__title", "{title}" }
            button {
                class: "btn primary",
                "data-action": "execute-{action}",
                onclick: |_| {
                    let mut elements = action_elements.get().clone();
                    elements.insert(format!("action-{}", action), ActionElement {
                        id: format!("action-{}", action),
                        role: "action-trigger".to_string(),
                        db_route: Some(db_route.to_string()),
                        trigger_type: "click".to_string(),
                        expected_response: "database-operation".to_string(),
                        latency_ms: Some(250),
                        dependencies: vec!["database".to_string(), "neural-mux".to_string()],
                    });
                    action_elements.set(elements);
                },
                "Execute"
            }
        }
    }
}