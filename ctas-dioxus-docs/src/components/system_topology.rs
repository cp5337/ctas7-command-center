use dioxus::prelude::*;
use crate::neural_mux_client::{NeuralMuxClient, SystemTopology as SystemTopologyData};

/// System Topology Viewer - Live Neural Mux query display
#[component]
pub fn SystemTopology() -> Element {
    let mut topology = use_signal(|| None::<SystemTopologyData>);
    let mut is_loading = use_signal(|| false);
    let mut error = use_signal(|| None::<String>);
    
    let fetch_topology = move |_evt: Event<MouseData>| {
        spawn(async move {
            is_loading.set(true);
            error.set(None);
            
            let client = NeuralMuxClient::new();
            match client.get_system_status().await {
                Ok(data) => {
                    topology.set(Some(data));
                    is_loading.set(false);
                }
                Err(e) => {
                    error.set(Some(format!("Failed to connect: {}", e)));
                    is_loading.set(false);
                }
            }
        });
    };
    
    use_effect(move || {
        spawn(async move {
            is_loading.set(true);
            error.set(None);
            
            let client = NeuralMuxClient::new();
            match client.get_system_status().await {
                Ok(data) => {
                    topology.set(Some(data));
                    is_loading.set(false);
                }
                Err(e) => {
                    error.set(Some(format!("Failed to connect: {}", e)));
                    is_loading.set(false);
                }
            }
        });
    });
    
    rsx! {
        div { class: "card-elevated",
            div { class: "flex items-center justify-between mb-6",
                h2 { class: "text-title2", "Live System Topology" }
                button {
                    onclick: fetch_topology,
                    class: "button button-secondary text-footnote",
                    disabled: is_loading(),
                    if is_loading() { "Refreshing..." } else { "Refresh" }
                }
            }
            
            if let Some(err) = error() {
                div { class: "p-4 bg-red-500/10 border border-red-500/20 rounded-lg",
                    p { class: "text-body text-red-400", "⚠️ {err}" }
                    p { class: "text-caption1 text-[var(--color-text-secondary)] mt-2",
                        "Make sure Neural Mux is running on port 18100"
                    }
                }
            }
            
            if let Some(topo) = topology() {
                div { class: "space-y-6",
                    // Status Overview
                    div { class: "grid grid-cols-3 gap-4",
                        div { class: "card text-center",
                            div { class: "text-largeTitle text-cyan-400", "{topo.total_services}" }
                            div { class: "text-caption1 text-[var(--color-text-secondary)]", "Total Services" }
                        }
                        div { class: "card text-center",
                            div { class: "text-largeTitle text-green-400", "{topo.healthy_services}" }
                            div { class: "text-caption1 text-[var(--color-text-secondary)]", "Healthy" }
                        }
                        div { class: "card text-center",
                            div { class: "text-body text-[var(--color-text-secondary)]", "{topo.timestamp}" }
                            div { class: "text-caption1 text-[var(--color-text-secondary)]", "Last Updated" }
                        }
                    }
                    
                    // Service List
                    div { class: "space-y-3",
                        h3 { class: "text-headline mb-3", "Active Services" }
                        for service in &topo.services {
                            div { class: "card flex items-center justify-between",
                                div { class: "flex items-center gap-3",
                                    div { class: "w-2 h-2 rounded-full bg-green-400 animate-pulse" }
                                    div {
                                        div { class: "text-body text-white", "{service.name}" }
                                        div { class: "text-caption2 text-[var(--color-text-secondary)]", "Port {service.port}" }
                                    }
                                }
                                span { class: "text-caption1 text-green-400", "{service.status}" }
                            }
                        }
                    }
                }
            } else if is_loading() {
                div { class: "text-center py-12",
                    div { class: "text-body text-[var(--color-text-secondary)]", "Loading system topology..." }
                }
            }
        }
    }
}




