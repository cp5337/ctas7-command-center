use dioxus::prelude::*;

#[derive(Clone, Routable, Debug, PartialEq)]
#[rustfmt::skip]
pub enum Route {
    #[layout(MainLayout)]
        #[route("/")]
        Home {},
        
        #[route("/dev-center")]
        DevCenter {},
        
        #[route("/dev-center/:section")]
        DevCenterSection { section: String },
        
        #[route("/apps")]
        Apps {},
        
        #[route("/apps/:app")]
        AppDetail { app: String },
        
        #[route("/system")]
        SystemInfo {},
        
        #[route("/system/:component")]
        SystemComponent { component: String },
        
        #[route("/live")]
        LiveTopology {},
}

#[component]
fn MainLayout() -> Element {
    rsx! {
        div { class: "min-h-screen bg-[var(--color-bg)]",
            // Header Navigation
            header { class: "sticky top-0 z-50 material-thick border-b border-white/10",
                div { class: "max-w-7xl mx-auto px-6 py-4",
                    div { class: "flex items-center justify-between",
                        // Logo & Title
                        div { class: "flex items-center gap-4",
                            div { class: "w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center",
                                span { class: "text-2xl", "🧠" }
                            }
                            div {
                                h1 { class: "text-title2 text-white", "CTAS-7 Documentation" }
                                p { class: "text-caption1 text-[var(--color-text-secondary)]", "Live Neural Mux Query System" }
                            }
                        }
                        
                        // Connection Status
                        div { class: "flex items-center gap-2 px-3 py-2 rounded-full material-regular",
                            div { class: "w-2 h-2 rounded-full bg-green-400 animate-pulse" }
                            span { class: "text-footnote text-[var(--color-text-secondary)]", "Neural Mux Connected" }
                        }
                    }
                    
                    // Navigation Tabs
                    nav { class: "nav mt-4",
                        Link { to: Route::Home {}, class: "nav-item", "Overview" }
                        Link { to: Route::DevCenter {}, class: "nav-item", "Dev Center" }
                        Link { to: Route::Apps {}, class: "nav-item", "Apps" }
                        Link { to: Route::SystemInfo {}, class: "nav-item", "System" }
                        Link { to: Route::LiveTopology {}, class: "nav-item", "Live Topology" }
                    }
                }
            }
            
            // Main Content
            main { class: "max-w-7xl mx-auto px-6 py-8",
                Outlet::<Route> {}
            }
            
            // Footer
            footer { class: "mt-16 border-t border-white/10 py-8",
                div { class: "max-w-7xl mx-auto px-6 text-center",
                    p { class: "text-footnote text-[var(--color-text-secondary)]",
                        "CTAS-7 Development Center • Neural Mux-Powered Documentation"
                    }
                }
            }
        }
    }
}

#[component]
fn Home() -> Element {
    rsx! {
        div { class: "animate-in",
            div { class: "card-elevated mb-8",
                h2 { class: "text-largeTitle mb-4", "Convergent Threat Solutions" }
                p { class: "text-body text-[var(--color-text-secondary)]",
                    "Next-generation, agentic programming environment for macOS and iPadOS, powered by Neural Mux routing and live system discovery."
                }
            }
            
            div { class: "grid grid-cols-1 md:grid-cols-3 gap-6",
                Link { to: Route::DevCenter {},
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer",
                        span { class: "text-4xl mb-3 block", "💻" }
                        h3 { class: "text-title3 mb-2", "Development Center" }
                        p { class: "text-callout text-[var(--color-text-secondary)]",
                            "SwiftUI app with IaC Studio, Simulations, Agent Control, and more"
                        }
                    }
                }
                
                Link { to: Route::Apps {},
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer",
                        span { class: "text-4xl mb-3 block", "📱" }
                        h3 { class: "text-title3 mb-2", "App Ecosystem" }
                        p { class: "text-callout text-[var(--color-text-secondary)]",
                            "Cognigraph, PTCC, Satellite Network, and specialized tools"
                        }
                    }
                }
                
                Link { to: Route::SystemInfo {},
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer",
                        span { class: "text-4xl mb-3 block", "⚡" }
                        h3 { class: "text-title3 mb-2", "System Architecture" }
                        p { class: "text-callout text-[var(--color-text-secondary)]",
                            "Neural Mux, Memory layers, Legion ECS, and backend services"
                        }
                    }
                }
            }
        }
    }
}

#[component]
fn DevCenter() -> Element {
    rsx! {
        div { class: "animate-in",
            h1 { class: "text-largeTitle mb-6", "Development Center" }
            p { class: "text-body text-[var(--color-text-secondary)] mb-8",
                "React/Vite application running at localhost:25175 • 9 navigation tabs • 26+ components"
            }
            
            // 9 Main Tabs Grid
            div { class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8",
                // 1. Overview
                Link { to: Route::DevCenterSection { section: "overview".to_string() },
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer",
                        div { class: "flex items-center justify-between mb-2",
                            h3 { class: "text-headline", "1. Overview" }
                            span { class: "text-2xl", "📊" }
                        }
                        p { class: "text-caption1 text-[var(--color-text-secondary)]",
                            "Landing dashboard • Team Personas • System Metrics • Kanban Board"
                        }
                    }
                }
                
                // 2. Chat
                Link { to: Route::DevCenterSection { section: "chat".to_string() },
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer border-2 border-cyan-400/30",
                        div { class: "flex items-center justify-between mb-2",
                            h3 { class: "text-headline", "2. Chat ⭐" }
                            span { class: "text-2xl", "💬" }
                        }
                        p { class: "text-caption1 text-[var(--color-text-secondary)]",
                            "Full messaging • Voice recording • WebSocket • AI agents"
                        }
                    }
                }
                
                // 3. DevOps
                Link { to: Route::DevCenterSection { section: "devops".to_string() },
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer",
                        div { class: "flex items-center justify-between mb-2",
                            h3 { class: "text-headline", "3. DevOps" }
                            span { class: "text-2xl", "🚀" }
                        }
                        p { class: "text-caption1 text-[var(--color-text-secondary)]",
                            "Tesla/SpaceX/NASA grade • Linear-style PM • Mission critical"
                        }
                    }
                }
                
                // 4. Metrics
                Link { to: Route::DevCenterSection { section: "metrics".to_string() },
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer",
                        div { class: "flex items-center justify-between mb-2",
                            h3 { class: "text-headline", "4. Metrics" }
                            span { class: "text-2xl", "📈" }
                        }
                        p { class: "text-caption1 text-[var(--color-text-secondary)]",
                            "System performance • API endpoints • Hash cache 94.7% hit rate"
                        }
                    }
                }
                
                // 5. Enterprise
                Link { to: Route::DevCenterSection { section: "enterprise".to_string() },
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer",
                        div { class: "flex items-center justify-between mb-2",
                            h3 { class: "text-headline", "5. Enterprise" }
                            span { class: "text-2xl", "🏢" }
                        }
                        p { class: "text-caption1 text-[var(--color-text-secondary)]",
                            "Linear integration • XSD schema • Multi-LLM onboarding"
                        }
                    }
                }
                
                // 6. CyberOps
                Link { to: Route::DevCenterSection { section: "cyberops".to_string() },
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer",
                        div { class: "flex items-center justify-between mb-2",
                            h3 { class: "text-headline", "6. CyberOps" }
                            span { class: "text-2xl", "🛡️" }
                        }
                        p { class: "text-caption1 text-[var(--color-text-secondary)]",
                            "Operational workspace • Advanced security operations"
                        }
                    }
                }
                
                // 7. Ontology
                Link { to: Route::DevCenterSection { section: "ontology".to_string() },
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer",
                        div { class: "flex items-center justify-between mb-2",
                            h3 { class: "text-headline", "7. Ontology" }
                            span { class: "text-2xl", "🧬" }
                        }
                        p { class: "text-caption1 text-[var(--color-text-secondary)]",
                            "MITRE ATT&CK • Threat profiling • Attack patterns"
                        }
                    }
                }
                
                // 8. Crates
                Link { to: Route::DevCenterSection { section: "crates".to_string() },
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer border-2 border-cyan-400/30",
                        div { class: "flex items-center justify-between mb-2",
                            h3 { class: "text-headline", "8. Crates ⭐" }
                            span { class: "text-2xl", "📦" }
                        }
                        p { class: "text-caption1 text-[var(--color-text-secondary)]",
                            "Smart Crate System • Cannon Plug API (18100) • Shipyard"
                        }
                    }
                }
                
                // 9. Tools
                Link { to: Route::DevCenterSection { section: "tools".to_string() },
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer",
                        div { class: "flex items-center justify-between mb-2",
                            h3 { class: "text-headline", "9. Tools" }
                            span { class: "text-2xl", "⚡" }
                        }
                        p { class: "text-caption1 text-[var(--color-text-secondary)]",
                            "ToolForge • Development toolchain management"
                        }
                    }
                }
            }
            
            // Tech Stack
            div { class: "card-elevated",
                h2 { class: "text-title2 mb-4", "Technical Stack" }
                div { class: "grid grid-cols-1 md:grid-cols-2 gap-6",
                    div {
                        h3 { class: "text-headline mb-3", "Frontend" }
                        ul { class: "space-y-2 text-callout text-[var(--color-text-secondary)]",
                            li { "• React 18 + TypeScript" }
                            li { "• Vite (1.06s build time)" }
                            li { "• Tailwind CSS" }
                            li { "• Lucide React icons" }
                            li { "• Bundle: 106.41 kB gzipped" }
                        }
                    }
                    div {
                        h3 { class: "text-headline mb-3", "Backend Integration" }
                        ul { class: "space-y-2 text-callout text-[var(--color-text-secondary)]",
                            li { "• Cannon Plug API (18100)" }
                            li { "• Voice System (18765)" }
                            li { "• WebSocket real-time" }
                            li { "• Smart CDN Gateway" }
                            li { "• XSD validation" }
                        }
                    }
                }
            }
        }
    }
}

#[component]
fn DevCenterSection(section: String) -> Element {
    rsx! {
        div { "Dev Center Section: {section}" }
    }
}

#[component]
fn Apps() -> Element {
    rsx! {
        div { class: "animate-in",
            h1 { class: "text-largeTitle mb-6", "App Ecosystem" }
            p { class: "text-body text-[var(--color-text-secondary)] mb-8",
                "CTAS-7 application suite for multi-domain operations."
            }
            
            div { class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
                // Universal Cognigraph
                Link { to: Route::AppDetail { app: "cognigraph".to_string() },
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer",
                        span { class: "text-4xl mb-3 block", "🧠" }
                        h3 { class: "text-title3 mb-2", "Universal Cognigraph" }
                        p { class: "text-callout text-[var(--color-text-secondary)] mb-3",
                            "GIS-aware cognitive planning tool for multi-domain operations"
                        }
                        div { class: "text-caption2 text-cyan-400", "Standalone iPad App • L* • HMM • Matroids" }
                    }
                }
                
                // PTCC
                Link { to: Route::AppDetail { app: "ptcc".to_string() },
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer",
                        span { class: "text-4xl mb-3 block", "🎯" }
                        h3 { class: "text-title3 mb-2", "PTCC" }
                        p { class: "text-callout text-[var(--color-text-secondary)] mb-3",
                            "Persona Threat Configuration Component for adversary emulation"
                        }
                        div { class: "text-caption2 text-purple-400", "iTunes-style UI • Monte Carlo • 32 Primitives" }
                    }
                }
                
                // ABE.ai - Document Intelligence
                a { 
                    href: "https://github.com/cognetix-abe", 
                    target: "_blank",
                    class: "card hover:scale-[1.02] transition-transform cursor-pointer border-2 border-cyan-400/30",
                    span { class: "text-4xl mb-3 block", "📚" }
                    h3 { class: "text-title3 mb-2 flex items-center gap-2",
                        "ABE.ai"
                        span { class: "text-caption1 text-cyan-400", "🔗" }
                    }
                    p { class: "text-callout text-[var(--color-text-secondary)] mb-3",
                        "Automated Business Environment - MARC 21 document intelligence platform"
                    }
                    div { class: "space-y-1",
                        div { class: "text-caption2 text-cyan-400", "Firefly Serverless • Auto-scales to 1000+" }
                        div { class: "text-caption2 text-green-400", "MARC 21 Compliant • SDVOB" }
                    }
                    button { 
                        class: "button button-primary mt-3 w-full",
                        "Launch ABE.ai →"
                    }
                }
                
                // Satellite Network
                Link { to: Route::AppDetail { app: "satellite-network".to_string() },
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer",
                        span { class: "text-4xl mb-3 block", "🛰️" }
                        h3 { class: "text-title3 mb-2", "Satellite Network" }
                        p { class: "text-callout text-[var(--color-text-secondary)] mb-3",
                            "12-satellite Van Allen Belt constellation with 257 ground stations"
                        }
                        div { class: "text-caption2 text-green-400", "Quantum Key Distribution • Industrial Automation" }
                    }
                }
                
                // PLC Control System
                Link { to: Route::AppDetail { app: "plc-control".to_string() },
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer",
                        span { class: "text-4xl mb-3 block", "⚙️" }
                        h3 { class: "text-title3 mb-2", "PLC Control System" }
                        p { class: "text-callout text-[var(--color-text-secondary)] mb-3",
                            "HomeKit-based industrial controller using refurbished iPhones/iPads"
                        }
                        div { class: "text-caption2 text-yellow-400", "HomeKit Integration • Real-time Monitoring" }
                    }
                }
                
                // Voice System
                Link { to: Route::AppDetail { app: "voice-system".to_string() },
                    div { class: "card hover:scale-[1.02] transition-transform cursor-pointer",
                        span { class: "text-4xl mb-3 block", "🎤" }
                        h3 { class: "text-title3 mb-2", "Full-Duplex Voice AI" }
                        p { class: "text-callout text-[var(--color-text-secondary)] mb-3",
                            "Real-time voice conversation system with ElevenLabs integration"
                        }
                        div { class: "text-caption2 text-purple-400", "Port 18765 • Agent Personas • Live Transcription" }
                    }
                }
            }
        }
    }
}

#[component]
fn AppDetail(app: String) -> Element {
    rsx! {
        div { "App: {app}" }
    }
}

#[component]
fn SystemInfo() -> Element {
    rsx! {
        div { class: "animate-in",
            h1 { class: "text-largeTitle mb-6", "System Architecture" }
            p { class: "text-body text-[var(--color-text-secondary)] mb-8",
                "Backend services, memory layers, and execution runtimes."
            }
        }
    }
}

#[component]
fn SystemComponent(component: String) -> Element {
    rsx! {
        div { "System Component: {component}" }
    }
}

#[component]
fn LiveTopology() -> Element {
    rsx! {
        div { class: "animate-in",
            h1 { class: "text-largeTitle mb-6", "Live System Topology" }
            p { class: "text-body text-[var(--color-text-secondary)] mb-8",
                "Real-time system status queried from Neural Mux."
            }
            
            div { class: "card",
                p { class: "text-footnote text-[var(--color-text-secondary)]", "Querying Neural Mux..." }
            }
        }
    }
}

