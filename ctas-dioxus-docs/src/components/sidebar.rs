use dioxus::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SidebarConfig {
    pub documentation: Vec<SidebarSection>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SidebarSection {
    pub title: String,
    pub icon: String,
    pub items: Vec<SidebarItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SidebarItem {
    pub title: String,
    pub path: String,
}

#[component]
pub fn Sidebar(current_path: String) -> Element {
    // Load sidebar configuration
    let sidebar_config = use_resource(|| async move {
        load_sidebar_config().await
    });

    rsx! {
        aside { class: "docs-sidebar",
            div { class: "sidebar-header",
                h2 { "Documentation" }
                input {
                    r#type: "search",
                    placeholder: "Search docs...",
                    class: "sidebar-search"
                }
            }
            
            nav { class: "sidebar-nav",
                match sidebar_config.read().as_ref() {
                    Some(Ok(config)) => rsx! {
                        for section in &config.documentation {
                            SidebarSection {
                                section: section.clone(),
                                current_path: current_path.clone()
                            }
                        }
                    },
                    Some(Err(e)) => rsx! {
                        div { class: "error",
                            "Error loading sidebar: {e}"
                        }
                    },
                    None => rsx! {
                        div { class: "loading",
                            "Loading..."
                        }
                    }
                }
            }
        }
    }
}

#[component]
fn SidebarSection(section: SidebarSection, current_path: String) -> Element {
    let mut is_open = use_signal(|| false);
    
    // Check if any item in this section is active
    let has_active = section.items.iter().any(|item| current_path.starts_with(&item.path));
    
    // Auto-open if section contains active page
    use_effect(move || {
        if has_active {
            is_open.set(true);
        }
    });

    rsx! {
        details {
            open: is_open(),
            class: if has_active { "sidebar-section active" } else { "sidebar-section" },
            
            summary {
                onclick: move |_| is_open.set(!is_open()),
                span { class: "section-icon", "{section.icon}" }
                span { class: "section-title", "{section.title}" }
                span { class: "section-arrow", if is_open() { "▼" } else { "▶" } }
            }
            
            ul { class: "sidebar-items",
                for item in &section.items {
                    li {
                        class: if current_path == item.path { "active" } else { "" },
                        a {
                            href: "{item.path}",
                            "{item.title}"
                        }
                    }
                }
            }
        }
    }
}

async fn load_sidebar_config() -> Result<SidebarConfig, String> {
    // In production, load from file or API
    // For now, return hardcoded config
    let json = include_str!("../../docs/sidebar.json");
    serde_json::from_str(json).map_err(|e| e.to_string())
}

#[component]
pub fn TableOfContents(headings: Vec<Heading>) -> Element {
    rsx! {
        aside { class: "toc",
            div { class: "toc-header",
                h3 { "On This Page" }
            }
            nav { class: "toc-nav",
                ul {
                    for heading in headings {
                        li {
                            class: "toc-item toc-level-{heading.level}",
                            a {
                                href: "#{heading.id}",
                                "{heading.text}"
                            }
                        }
                    }
                }
            }
        }
    }
}

#[derive(Debug, Clone)]
pub struct Heading {
    pub level: u8,
    pub id: String,
    pub text: String,
}

