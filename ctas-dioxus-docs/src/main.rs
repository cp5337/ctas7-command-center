#![allow(non_snake_case)]

use dioxus::prelude::*;

mod neural_mux_client;
mod components;
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



