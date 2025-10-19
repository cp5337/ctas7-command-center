use dioxus::prelude::*;

/// Hash Visualizer - Displays 48-position Base96 trivariate hashes
/// Implements Hash-IS-UI from Ground Truth Spec
#[component]
pub fn HashVisualizer(hash: String) -> Element {
    let sch = &hash[0..16.min(hash.len())];
    let cuid = if hash.len() >= 32 { &hash[16..32] } else { "" };
    let uuid = if hash.len() >= 48 { &hash[32..48] } else { "" };
    
    rsx! {
        div { class: "card p-4",
            h3 { class: "text-title3 mb-4", "Trivariate Hash Structure" }
            
            div { class: "space-y-4",
                // SCH - Positions 1-16
                div { class: "p-3 bg-[var(--color-surface-elevated)] rounded-lg",
                    div { class: "flex items-center justify-between mb-2",
                        span { class: "text-caption1 text-[var(--color-text-secondary)]", "SCH (1-16)" }
                        span { class: "text-caption1 text-cyan-400", "Semantic Envelope" }
                    }
                    code { class: "text-mono text-lg text-cyan-400", "{sch}" }
                }
                
                // CUID - Positions 17-32
                if !cuid.is_empty() {
                    div { class: "p-3 bg-[var(--color-surface-elevated)] rounded-lg",
                        div { class: "flex items-center justify-between mb-2",
                            span { class: "text-caption1 text-[var(--color-text-secondary)]", "CUID (17-32)" }
                            span { class: "text-caption1 text-purple-400", "Spatio-Temporal Context" }
                        }
                        code { class: "text-mono text-lg text-purple-400", "{cuid}" }
                    }
                }
                
                // UUID - Positions 33-48
                if !uuid.is_empty() {
                    div { class: "p-3 bg-[var(--color-surface-elevated)] rounded-lg",
                        div { class: "flex items-center justify-between mb-2",
                            span { class: "text-caption1 text-[var(--color-text-secondary)]", "UUID (33-48)" }
                            span { class: "text-caption1 text-green-400", "Persistence & Audit" }
                        }
                        code { class: "text-mono text-lg text-green-400", "{uuid}" }
                    }
                }
            }
            
            // Hash metadata
            div { class: "mt-4 pt-4 border-t border-white/10",
                div { class: "grid grid-cols-2 gap-3 text-caption2",
                    div {
                        span { class: "text-[var(--color-text-secondary)]", "Length: " }
                        span { class: "text-cyan-400", "{hash.len()}/48" }
                    }
                    div {
                        span { class: "text-[var(--color-text-secondary)]", "Format: " }
                        span { class: "text-cyan-400", "Base96" }
                    }
                    div {
                        span { class: "text-[var(--color-text-secondary)]", "Algorithm: " }
                        span { class: "text-cyan-400", "Murmur3" }
                    }
                    div {
                        span { class: "text-[var(--color-text-secondary)]", "Entropy: " }
                        span { class: "text-green-400", "≥0.8" }
                    }
                }
            }
        }
    }
}




