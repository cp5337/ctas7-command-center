use dioxus::prelude::*;
use crate::neural_mux_client::NeuralMuxClient;

/// Neural Mux Status Badge - Shows connection state
#[component]
pub fn NeuralMuxStatus() -> Element {
    let mut is_connected = use_signal(|| false);
    
    use_effect(move || {
        spawn(async move {
            let client = NeuralMuxClient::new();
            let connected = client.is_connected().await;
            is_connected.set(connected);
        });
    });
    
    rsx! {
        div { class: "flex items-center gap-2 px-3 py-2 rounded-full material-regular",
            div { 
                class: if is_connected() {
                    "w-2 h-2 rounded-full bg-green-400 animate-pulse"
                } else {
                    "w-2 h-2 rounded-full bg-red-400"
                }
            }
            span { class: "text-footnote text-[var(--color-text-secondary)]",
                if is_connected() {
                    "Neural Mux Connected"
                } else {
                    "Neural Mux Offline"
                }
            }
        }
    }
}




