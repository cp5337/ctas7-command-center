// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CTAS-7 Statistics Dashboard (Dioxus)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Real-time QA metrics and system statistics
// Integrates with:
// - Neural Mux Smart CDN (stats aggregation)
// - Synaptix Plasma (threat detection - Wazuh + AXON + Legion)
// - SurrealDB (historical data)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

use dioxus::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Props, PartialEq, Clone)]
pub struct StatsDashboardProps {
    #[props(default = "http://localhost:18100".to_string())]
    cdn_endpoint: String,

    #[props(default = "http://localhost:15601".to_string())]
    plasma_endpoint: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ServiceStats {
    pub service_name: String,
    pub qa_pass_rate: f64,
    pub qa_errors: i32,
    pub qa_warnings: i32,
    pub qa_critical: i32,
    pub uptime_seconds: u64,
    pub requests_per_second: f64,
    pub avg_latency_ms: f64,
    pub vulnerabilities: i32,
    pub test_coverage: f64,
}

#[component]
pub fn StatsDashboard(props: StatsDashboardProps) -> Element {
    let mut services = use_signal(|| Vec::<ServiceStats>::new());
    let mut loading = use_signal(|| true);
    let cdn_endpoint = props.cdn_endpoint.clone();

    // Fetch stats from Neural Mux CDN
    use_effect(move || {
        let endpoint = cdn_endpoint.clone();
        spawn(async move {
            if let Ok(response) = reqwest::get(format!("{}/api/stats/services", endpoint)).await {
                if let Ok(data) = response.json::<Vec<ServiceStats>>().await {
                    services.set(data);
                    loading.set(false);
                }
            }
        });
    });

    rsx! {
        div { class: "stats-dashboard",
            // Header
            header { class: "dashboard-header",
                h1 { "🔬 CTAS-7 System Statistics" }
                div { class: "header-links",
                    a {
                        href: props.plasma_endpoint.clone(),
                        target: "_blank",
                        class: "plasma-link",
                        "🛡️ Synaptix Plasma →"
                    }
                }
            }

            if loading() {
                div { class: "loading",
                    "Loading statistics..."
                }
            } else {
                // System Overview
                SystemOverview { services: services() }

                // Service Cards
                div { class: "services-grid",
                    for service in services().iter() {
                        ServiceCard { service: service.clone() }
                    }
                }

                // Real-time Metrics Charts
                MetricsCharts { services: services() }
            }
        }
    }
}

#[component]
fn SystemOverview(services: Vec<ServiceStats>) -> Element {
    let total_services = services.len();
    let healthy_services = services.iter().filter(|s| s.qa_pass_rate > 0.9).count();
    let total_vulnerabilities: i32 = services.iter().map(|s| s.vulnerabilities).sum();
    let avg_coverage: f64 = if !services.is_empty() {
        services.iter().map(|s| s.test_coverage).sum::<f64>() / services.len() as f64
    } else {
        0.0
    };

    rsx! {
        div { class: "system-overview",
            div { class: "metric-card",
                h3 { "Services" }
                div { class: "metric-value", "{healthy_services}/{total_services}" }
                div { class: "metric-label", "Healthy" }
            }

            div { class: "metric-card",
                h3 { "Vulnerabilities" }
                div {
                    class: if total_vulnerabilities > 0 { "metric-value danger" } else { "metric-value success" },
                    "{total_vulnerabilities}"
                }
                div { class: "metric-label", "Total" }
            }

            div { class: "metric-card",
                h3: { "Coverage" }
                div {
                    class: if avg_coverage > 0.7 { "metric-value success" } else { "metric-value warning" },
                    "{avg_coverage * 100.0:.1}%"
                }
                div { class: "metric-label", "Average" }
            }
        }
    }
}

#[component]
fn ServiceCard(service: ServiceStats) -> Element {
    let status_class = if service.qa_critical > 0 {
        "service-card critical"
    } else if service.qa_errors > 0 {
        "service-card error"
    } else if service.qa_warnings > 0 {
        "service-card warning"
    } else {
        "service-card success"
    };

    rsx! {
        div { class: status_class,
            div { class: "service-header",
                h3 { "{service.service_name}" }
                div { class: "service-status",
                    if service.qa_critical > 0 {
                        "🔥 CRITICAL"
                    } else if service.qa_errors > 0 {
                        "❌ ERRORS"
                    } else if service.qa_warnings > 0 {
                        "⚠️ WARNINGS"
                    } else {
                        "✅ PASS"
                    }
                }
            }

            div { class: "service-metrics",
                div { class: "metric-row",
                    span { class: "metric-label", "QA Pass Rate:" }
                    span { class: "metric-value", "{service.qa_pass_rate * 100.0:.1}%" }
                }
                div { class: "metric-row",
                    span { class: "metric-label", "Errors:" }
                    span { class: "metric-value", "{service.qa_errors}" }
                }
                div { class: "metric-row",
                    span { class: "metric-label", "Coverage:" }
                    span { class: "metric-value", "{service.test_coverage * 100.0:.1}%" }
                }
                div { class: "metric-row",
                    span { class: "metric-label", "Latency:" }
                    span { class: "metric-value", "{service.avg_latency_ms:.2}ms" }
                }
                div { class: "metric-row",
                    span { class: "metric-label", "RPS:" }
                    span { class: "metric-value", "{service.requests_per_second:.1}" }
                }
                if service.vulnerabilities > 0 {
                    div { class: "metric-row danger",
                        span { class: "metric-label", "Vulnerabilities:" }
                        span { class: "metric-value", "{service.vulnerabilities}" }
                    }
                }
            }
        }
    }
}

#[component]
fn MetricsCharts(services: Vec<ServiceStats>) -> Element {
    rsx! {
        div { class: "metrics-charts",
            h2 { "Real-Time Metrics" }

            div { class: "charts-grid",
                // QA Pass Rate Chart
                div { class: "chart-card",
                    h3 { "QA Pass Rate by Service" }
                    div { class: "chart-bars",
                        for service in services.iter() {
                            div { class: "bar-container",
                                div { class: "bar-label", "{service.service_name}" }
                                div {
                                    class: "bar",
                                    style: "width: {service.qa_pass_rate * 100.0}%",
                                    "{service.qa_pass_rate * 100.0:.0}%"
                                }
                            }
                        }
                    }
                }

                // Test Coverage Chart
                div { class: "chart-card",
                    h3 { "Test Coverage" }
                    div { class: "chart-bars",
                        for service in services.iter() {
                            div { class: "bar-container",
                                div { class: "bar-label", "{service.service_name}" }
                                div {
                                    class: if service.test_coverage > 0.7 { "bar success" } else { "bar warning" },
                                    style: "width: {service.test_coverage * 100.0}%",
                                    "{service.test_coverage * 100.0:.0}%"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// CSS Styles
pub const DASHBOARD_STYLES: &str = r#"
.stats-dashboard {
    padding: 2rem;
    background: #0f172a;
    color: #e2e8f0;
    min-height: 100vh;
    font-family: system-ui, -apple-system, sans-serif;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #1e293b;
}

.dashboard-header h1 {
    font-size: 2rem;
    color: #38bdf8;
}

.plasma-link {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
    color: white;
    text-decoration: none;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: transform 0.2s, box-shadow 0.2s;
}

.plasma-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(220, 38, 38, 0.3);
}

.system-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.metric-card {
    background: #1e293b;
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 1px solid #334155;
}

.metric-card h3 {
    font-size: 0.875rem;
    color: #94a3b8;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
}

.metric-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: #38bdf8;
}

.metric-value.success {
    color: #22c55e;
}

.metric-value.warning {
    color: #f59e0b;
}

.metric-value.danger {
    color: #ef4444;
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.service-card {
    background: #1e293b;
    border-radius: 0.75rem;
    padding: 1.5rem;
    border-left: 4px solid #38bdf8;
    transition: transform 0.2s;
}

.service-card:hover {
    transform: translateY(-4px);
}

.service-card.success {
    border-left-color: #22c55e;
}

.service-card.warning {
    border-left-color: #f59e0b;
}

.service-card.error {
    border-left-color: #ef4444;
}

.service-card.critical {
    border-left-color: #dc2626;
    background: linear-gradient(135deg, #1e293b 0%, #450a0a 100%);
}

.service-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.service-status {
    font-size: 0.875rem;
    font-weight: 600;
}

.service-metrics {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.metric-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #334155;
}

.metrics-charts {
    margin-top: 2rem;
}

.charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
}

.chart-card {
    background: #1e293b;
    border-radius: 0.75rem;
    padding: 1.5rem;
    border: 1px solid #334155;
}

.chart-bars {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
}

.bar-container {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.bar-label {
    width: 150px;
    font-size: 0.875rem;
    color: #94a3b8;
}

.bar {
    height: 2rem;
    background: linear-gradient(90deg, #38bdf8 0%, #0284c7 100%);
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    padding: 0 0.75rem;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    min-width: 50px;
}

.bar.success {
    background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
}

.bar.warning {
    background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.loading {
    text-align: center;
    padding: 4rem;
    font-size: 1.25rem;
    color: #64748b;
}
"#;
