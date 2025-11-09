/// Lazy-loading markdown page component
/// Loads markdown files on-demand, not bundled
use dioxus::prelude::*;
use crate::markdown_loader::MarkdownLoader;
use crate::components::markdown_renderer::MarkdownRenderer;

#[component]
pub fn LazyMarkdownPage(file_path: String) -> Element {
    let mut content = use_signal(|| String::new());
    let mut loading = use_signal(|| true);
    let mut error = use_signal(|| None::<String>);
    
    // Load markdown on mount
    use_effect(move || {
        let file_path = file_path.clone();
        spawn(async move {
            let mut loader = MarkdownLoader::new("/Users/cp5337/Developer/CTAS7-AI-Studio-Project-ONE/abe-drop-zone/CTAS-7-Documentation");
            
            match loader.load(&file_path).await {
                Ok(md_content) => {
                    content.set(md_content);
                    loading.set(false);
                }
                Err(e) => {
                    error.set(Some(e.to_string()));
                    loading.set(false);
                }
            }
        });
    });
    
    rsx! {
        div { class: "lazy-markdown-page",
            if loading() {
                div { class: "loading-spinner",
                    "⏳ Loading documentation..."
                }
            } else if let Some(err) = error() {
                div { class: "error-message",
                    h3 { "❌ Error Loading Document" }
                    p { "{err}" }
                }
            } else {
                MarkdownRenderer { content: content() }
            }
        }
    }
}

#[component]
pub fn LazyMarkdownPageHttp(url: String) -> Element {
    let mut content = use_signal(|| String::new());
    let mut loading = use_signal(|| true);
    let mut error = use_signal(|| None::<String>);
    
    // Load markdown from HTTP
    use_effect(move || {
        let url = url.clone();
        spawn(async move {
            let mut loader = MarkdownLoader::new(".");
            
            match loader.load_http(&url).await {
                Ok(md_content) => {
                    content.set(md_content);
                    loading.set(false);
                }
                Err(e) => {
                    error.set(Some(e.to_string()));
                    loading.set(false);
                }
            }
        });
    });
    
    rsx! {
        div { class: "lazy-markdown-page",
            if loading() {
                div { class: "loading-spinner",
                    "⏳ Loading documentation..."
                }
            } else if let Some(err) = error() {
                div { class: "error-message",
                    h3 { "❌ Error Loading Document" }
                    p { "{err}" }
                }
            } else {
                MarkdownRenderer { content: content() }
            }
        }
    }
}

/// Preload multiple pages in background
#[component]
pub fn PreloadMarkdown(files: Vec<String>) -> Element {
    use_effect(move || {
        let files = files.clone();
        spawn(async move {
            let mut loader = MarkdownLoader::new("/Users/cp5337/Developer/CTAS7-AI-Studio-Project-ONE/abe-drop-zone/CTAS-7-Documentation");
            
            if let Err(e) = loader.preload(files).await {
                log::warn!("Failed to preload markdown files: {}", e);
            } else {
                log::info!("Successfully preloaded markdown files");
            }
        });
    });
    
    rsx! { div {} }
}

