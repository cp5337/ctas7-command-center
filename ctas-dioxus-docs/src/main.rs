#![allow(non_snake_case)]

use dioxus::prelude::*;

mod components;
mod figma_export;
mod markdown_loader;
mod markdown_table;
mod mermaid_renderer;
mod neural_mux_client;
mod routes;

use routes::Route;

fn main() {
    launch(App);
}

#[component]
fn App() -> Element {
    rsx! {
        document::Link { rel: "stylesheet", href: asset!("/assets/styles.css") }
        Router::<Route> {}
    }
}
