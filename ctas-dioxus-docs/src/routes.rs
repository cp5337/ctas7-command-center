use dioxus::prelude::*;

#[derive(Clone, Routable, Debug, PartialEq)]
#[rustfmt::skip]
pub enum Route {
    #[layout(NavBar)]
        #[route("/")]
        Home {},
        
        // Documentation Routes
        #[route("/docs")]
        Docs {},
        
        #[nest("/docs")]
            #[route("/architecture")]
            DocsArchitecture {},
            #[route("/architecture/plasma-prism-ptcc")]
            DocsPlasma {},
            #[route("/architecture/kali-synaptix")]
            DocsKaliSynaptix {},
            #[route("/architecture/legion")]
            DocsLegion {},
            #[route("/architecture/gis")]
            DocsGIS {},
            
            #[route("/agents")]
            DocsAgents {},
            #[route("/agents/profiles")]
            DocsAgentProfiles {},
            #[route("/agents/deployment")]
            DocsAgentDeployment {},
            
            #[route("/foundation")]
            DocsFoundation {},
            #[route("/foundation/usim")]
            DocsUSIM {},
            #[route("/foundation/ptcc")]
            DocsPTCC {},
            #[route("/foundation/hashing")]
            DocsHashing {},
            
            #[route("/products")]
            DocsProducts {},
            #[route("/products/abe")]
            DocsABE {},
            #[route("/products/plasma")]
            DocsPlasmaProduct {},
            #[route("/products/laserlight")]
            DocsLaserLight {},
            
            #[route("/development")]
            DocsDevelopment {},
            #[route("/development/quickstart")]
            DocsQuickStart {},
            #[route("/development/git")]
            DocsGit {},
            
            #[route("/research")]
            DocsResearch {},
        #[end_nest]
        
        // Product Pages
        #[route("/products")]
        Products {},
        #[route("/products/laser-light")]
        ProductLaserLight {},
        
        // System Status
        #[route("/status")]
        SystemStatus {},
        
        // Neural Mux Dashboard
        #[route("/neural-mux")]
        NeuralMux {},
    #[end_layout]
    
    #[route("/:..route")]
    PageNotFound { route: Vec<String> },
}

#[component]
fn NavBar() -> Element {
    rsx! {
        div { class: "nav-container",
            nav { class: "navbar",
                div { class: "nav-brand",
                    Link { to: Route::Home {}, 
                        img { src: "/assets/ctas-logo.svg", alt: "CTAS-7" }
                        span { "CTAS-7 Documentation" }
                    }
                }
                div { class: "nav-links",
                    Link { to: Route::Docs {}, "Docs" }
                    Link { to: Route::Products {}, "Products" }
                    Link { to: Route::SystemStatus {}, "Status" }
                    Link { to: Route::NeuralMux {}, "Neural Mux" }
                }
                div { class: "nav-search",
                    input { 
                        r#type: "search",
                        placeholder: "Search docs...",
                        class: "search-input"
                    }
                }
            }
        }
        div { class: "content-container",
            Outlet::<Route> {}
        }
        footer { class: "footer",
            p { "CTAS-7 & Synaptix © 2025" }
        }
    }
}

// Documentation Pages

#[component]
fn Home() -> Element {
    rsx! {
        div { class: "home-page",
            section { class: "hero",
                h1 { "CTAS-7 & Synaptix" }
                p { class: "hero-subtitle", 
                    "Complete Threat Analysis System & Intelligence Platform" 
                }
                div { class: "hero-buttons",
                    Link { 
                        to: Route::DocsQuickStart {},
                        class: "btn btn-primary",
                        "Get Started"
                    }
                    Link { 
                        to: Route::Docs {},
                        class: "btn btn-secondary",
                        "Documentation"
                    }
                }
            }
            
            section { class: "features",
                h2 { "Key Features" }
                div { class: "feature-grid",
                    div { class: "feature-card",
                        h3 { "🔥 PLASMA Orchestration" }
                        p { "Core threat intelligence orchestration with Wazuh, AXON, and Legion ECS" }
                    }
                    div { class: "feature-card",
                        h3 { "🔍 PRISM Monitoring" }
                        p { "Real-time tool execution monitoring with cognitive state tracking" }
                    }
                    div { class: "feature-card",
                        h3 { "🧮 PTCC Validation" }
                        p { "Mathematical validation framework with TETH, L*, and HMM analysis" }
                    }
                    div { class: "feature-card",
                        h3 { "🤖 AI Agent Mesh" }
                        p { "Dual-LLM agent architecture with geopolitical APT personas" }
                    }
                    div { class: "feature-card",
                        h3 { "🗺️ Universal GIS" }
                        p { "Mapbox, Cesium, and Google Earth Engine integration" }
                    }
                    div { class: "feature-card",
                        h3 { "🔐 DoD Compliant" }
                        p { "NIST 800-53, FIPS 140-3, and NSA CNSA security standards" }
                    }
                }
            }
            
            section { class: "quick-links",
                h2 { "Quick Links" }
                div { class: "link-grid",
                    Link { to: Route::DocsPlasma {}, 
                        div { class: "quick-link-card",
                            h4 { "PLASMA-PRISM-PTCC" }
                            p { "Complete architecture overview" }
                        }
                    }
                    Link { to: Route::DocsKaliSynaptix {}, 
                        div { class: "quick-link-card",
                            h4 { "Kali Synaptix" }
                            p { "Pure Rust threat emulation" }
                        }
                    }
                    Link { to: Route::DocsUSIM {}, 
                        div { class: "quick-link-card",
                            h4 { "USIM System" }
                            p { "Universal Symbolic Message" }
                        }
                    }
                    Link { to: Route::DocsABE {}, 
                        div { class: "quick-link-card",
                            h4 { "ABE Platform" }
                            p { "Automated Business Environment" }
                        }
                    }
                }
            }
        }
    }
}

#[component]
fn Docs() -> Element {
    rsx! {
        div { class: "docs-layout",
            aside { class: "docs-sidebar",
                nav { class: "docs-nav",
                    h3 { "Documentation" }
                    
                    details { open: true,
                        summary { "Architecture" }
                        ul {
                            li { Link { to: Route::DocsPlasma {}, "PLASMA-PRISM-PTCC" } }
                            li { Link { to: Route::DocsKaliSynaptix {}, "Kali Synaptix" } }
                            li { Link { to: Route::DocsLegion {}, "Legion Multi-World" } }
                            li { Link { to: Route::DocsGIS {}, "Universal GIS" } }
                        }
                    }
                    
                    details { open: true,
                        summary { "Agent Systems" }
                        ul {
                            li { Link { to: Route::DocsAgentProfiles {}, "Agent Profiles" } }
                            li { Link { to: Route::DocsAgentDeployment {}, "Deployment" } }
                        }
                    }
                    
                    details { open: true,
                        summary { "Foundation" }
                        ul {
                            li { Link { to: Route::DocsUSIM {}, "USIM System" } }
                            li { Link { to: Route::DocsPTCC {}, "PTCC 7.0" } }
                            li { Link { to: Route::DocsHashing {}, "Trivariate Hashing" } }
                        }
                    }
                    
                    details { open: true,
                        summary { "Products" }
                        ul {
                            li { Link { to: Route::DocsABE {}, "ABE" } }
                            li { Link { to: Route::DocsPlasmaProduct {}, "Synaptix Plasma" } }
                            li { Link { to: Route::DocsLaserLight {}, "LaserLight" } }
                        }
                    }
                    
                    details { open: true,
                        summary { "Development" }
                        ul {
                            li { Link { to: Route::DocsQuickStart {}, "Quick Start" } }
                            li { Link { to: Route::DocsGit {}, "Git Workflow" } }
                        }
                    }
                    
                    details {
                        summary { "Research" }
                        ul {
                            li { Link { to: Route::DocsResearch {}, "White Papers" } }
                        }
                    }
                }
            }
            
            main { class: "docs-content",
                h1 { "CTAS-7 Documentation" }
                p { "Welcome to the complete CTAS-7 and Synaptix documentation." }
                
                div { class: "doc-cards",
                    div { class: "doc-card",
                        h3 { "🏗️ Architecture" }
                        p { "System architecture, integration patterns, and security compliance" }
                        Link { to: Route::DocsArchitecture {}, "Explore →" }
                    }
                    
                    div { class: "doc-card",
                        h3 { "🤖 Agent Systems" }
                        p { "AI agent mesh, dual-LLM architecture, and deployment guides" }
                        Link { to: Route::DocsAgents {}, "Explore →" }
                    }
                    
                    div { class: "doc-card",
                        h3 { "🔧 Foundation" }
                        p { "Core systems: USIM, PTCC 7.0, and trivariate hashing" }
                        Link { to: Route::DocsFoundation {}, "Explore →" }
                    }
                    
                    div { class: "doc-card",
                        h3 { "📦 Products" }
                        p { "ABE, Synaptix Plasma, and LaserLight communications" }
                        Link { to: Route::DocsProducts {}, "Explore →" }
                    }
                    
                    div { class: "doc-card",
                        h3 { "🛠️ Development" }
                        p { "Quick start guides, setup instructions, and Git workflows" }
                        Link { to: Route::DocsDevelopment {}, "Explore →" }
                    }
                    
                    div { class: "doc-card",
                        h3 { "📚 Research" }
                        p { "White papers, experiments, and academic references" }
                        Link { to: Route::DocsResearch {}, "Explore →" }
                    }
                }
            }
        }
    }
}

#[component]
fn DocsArchitecture() -> Element {
    rsx! {
        div { class: "docs-layout",
            aside { class: "docs-sidebar",
                // Sidebar navigation (same as Docs component)
            }
            main { class: "docs-content",
                h1 { "Architecture Overview" }
                p { "CTAS-7 system architecture and design patterns" }
                
                h2 { "Core Systems" }
                ul {
                    li { Link { to: Route::DocsPlasma {}, "PLASMA-PRISM-PTCC Complete Architecture" } }
                    li { Link { to: Route::DocsKaliSynaptix {}, "Kali Synaptix Pure Rust" } }
                    li { Link { to: Route::DocsLegion {}, "Legion Multi-World ECS" } }
                    li { Link { to: Route::DocsGIS {}, "Universal GIS Layering" } }
                }
            }
        }
    }
}

#[component]
fn DocsPlasma() -> Element {
    rsx! {
        div { class: "docs-layout",
            aside { class: "docs-sidebar",
                // Sidebar
            }
            main { class: "docs-content markdown-body",
                h1 { "PLASMA-PRISM-PTCC Complete Architecture" }
                
                div { class: "doc-info",
                    span { class: "badge", "v7.3.1" }
                    span { class: "doc-date", "Updated: 2025-11-09" }
                }
                
                p { class: "lead", 
                    "The unified threat intelligence, orchestration, and mathematical validation system." 
                }
                
                h2 { "Overview" }
                p { 
                    "PLASMA-PRISM-PTCC integrates three critical systems:"
                }
                ul {
                    li { strong { "PLASMA" } " - Core orchestration engine (Wazuh + AXON + Legion + Phi-3 + HFT)" }
                    li { strong { "PRISM" } " - Tool monitoring and cognitive state tracking" }
                    li { strong { "PTCC 7.0" } " - Mathematical validation framework (TETH + L* + HMM + Matroids)" }
                }
                
                h2 { "Architecture Diagram" }
                pre { class: "diagram",
                    "┌─────────────────────────────────────────────────────────────────┐\n"
                    "│           CTAS-7 UNIFIED INTELLIGENCE STACK                      │\n"
                    "├─────────────────────────────────────────────────────────────────┤\n"
                    "│                                                                   │\n"
                    "│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐     │\n"
                    "│  │   PLASMA    │─────▶│    PRISM    │─────▶│   PTCC 7.0  │     │\n"
                    "│  │ Orchestrator│      │  Monitor    │      │  Validator  │     │\n"
                    "│  └─────────────┘      └─────────────┘      └─────────────┘     │\n"
                    "│                                                                   │\n"
                    "└─────────────────────────────────────────────────────────────────┘"
                }
                
                h2 { "Key Features" }
                div { class: "feature-list",
                    div { class: "feature-item",
                        h4 { "🔥 PLASMA Orchestration" }
                        p { "Receives threat intelligence, fires Kali tools, coordinates Wazuh agents" }
                    }
                    div { class: "feature-item",
                        h4 { "🔍 PRISM Monitoring" }
                        p { "Real-time telemetry, cognitive state tracking, security posture evaluation" }
                    }
                    div { class: "feature-item",
                        h4 { "🧮 PTCC Validation" }
                        p { "Mathematical proof via TETH entropy, L* learning, HMM patterns, Matroid constraints" }
                    }
                }
                
                h2 { "Getting Started" }
                p { "To deploy the complete PLASMA-PRISM-PTCC stack:" }
                pre { class: "code-block",
                    "cd ctas6-reference\n"
                    "docker-compose -f docker-compose.ctas-v7.3.1.yml up -d"
                }
                
                h2 { "Next Steps" }
                ul {
                    li { Link { to: Route::DocsKaliSynaptix {}, "Kali Synaptix Integration" } }
                    li { Link { to: Route::DocsLegion {}, "Legion ECS Configuration" } }
                    li { Link { to: Route::DocsQuickStart {}, "Quick Start Guide" } }
                }
            }
        }
    }
}

// Stub components for other routes
#[component]
fn DocsKaliSynaptix() -> Element {
    rsx! { div { "Kali Synaptix Documentation (Coming Soon)" } }
}

#[component]
fn DocsLegion() -> Element {
    rsx! { div { "Legion Documentation (Coming Soon)" } }
}

#[component]
fn DocsGIS() -> Element {
    rsx! { div { "GIS Documentation (Coming Soon)" } }
}

#[component]
fn DocsAgents() -> Element {
    rsx! { div { "Agent Systems Documentation (Coming Soon)" } }
}

#[component]
fn DocsAgentProfiles() -> Element {
    rsx! { div { "Agent Profiles (Coming Soon)" } }
}

#[component]
fn DocsAgentDeployment() -> Element {
    rsx! { div { "Agent Deployment (Coming Soon)" } }
}

#[component]
fn DocsFoundation() -> Element {
    rsx! { div { "Foundation Documentation (Coming Soon)" } }
}

#[component]
fn DocsUSIM() -> Element {
    rsx! { div { "USIM Documentation (Coming Soon)" } }
}

#[component]
fn DocsPTCC() -> Element {
    rsx! { div { "PTCC 7.0 Documentation (Coming Soon)" } }
}

#[component]
fn DocsHashing() -> Element {
    rsx! { div { "Hashing Documentation (Coming Soon)" } }
}

#[component]
fn DocsProducts() -> Element {
    rsx! { div { "Products Documentation (Coming Soon)" } }
}

#[component]
fn DocsABE() -> Element {
    rsx! { div { "ABE Documentation (Coming Soon)" } }
}

#[component]
fn DocsPlasmaProduct() -> Element {
    rsx! { div { "Synaptix Plasma Product (Coming Soon)" } }
}

#[component]
fn DocsLaserLight() -> Element {
    rsx! { div { "LaserLight Documentation (Coming Soon)" } }
}

#[component]
fn DocsDevelopment() -> Element {
    rsx! { div { "Development Documentation (Coming Soon)" } }
}

#[component]
fn DocsQuickStart() -> Element {
    rsx! { div { "Quick Start Guide (Coming Soon)" } }
}

#[component]
fn DocsGit() -> Element {
    rsx! { div { "Git Workflow (Coming Soon)" } }
}

#[component]
fn DocsResearch() -> Element {
    rsx! { div { "Research Documentation (Coming Soon)" } }
}

#[component]
fn Products() -> Element {
    rsx! { div { "Products Page (Coming Soon)" } }
}

#[component]
fn ProductLaserLight() -> Element {
    rsx! { div { "LaserLight Product Page (Coming Soon)" } }
}

#[component]
fn SystemStatus() -> Element {
    rsx! { div { "System Status (Coming Soon)" } }
}

#[component]
fn NeuralMux() -> Element {
    rsx! { div { "Neural Mux Dashboard (Coming Soon)" } }
}

#[component]
fn PageNotFound(route: Vec<String>) -> Element {
    rsx! {
        div { class: "error-page",
            h1 { "404 - Page Not Found" }
            p { "The page {route:?} does not exist." }
            Link { to: Route::Home {}, "Go Home" }
        }
    }
}
