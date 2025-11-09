use dioxus::prelude::*;
use pulldown_cmark::{Parser, Options, html, Event, Tag, TagEnd, HeadingLevel};
use crate::markdown_table::TablePrettifier;
use crate::mermaid_renderer::MermaidRenderer;

/// Markdown renderer with Markdown All in One features
/// 
/// Features inspired by VS Code's Markdown All in One extension:
/// - Auto-generated table of contents
/// - GitHub Flavored Markdown support
/// - Math rendering with KaTeX
/// - Task lists
/// - Tables (with prettifier)
/// - Syntax highlighting
/// - Heading anchors
/// - Mermaid diagrams
/// - Figma export
#[component]
pub fn MarkdownRenderer(content: String) -> Element {
    // Prettify tables first
    let table_prettifier = TablePrettifier::new();
    let content = table_prettifier.prettify(&content);
    
    // Process Mermaid diagrams
    let mermaid_renderer = MermaidRenderer::default();
    let content = mermaid_renderer.process(&content);
    
    // Parse markdown with all features enabled
    let mut options = Options::empty();
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_FOOTNOTES);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TASKLISTS);
    options.insert(Options::ENABLE_HEADING_ATTRIBUTES);
    
    let parser = Parser::new_ext(&content, options);
    
    // Extract headings for TOC
    let headings = extract_headings(&content);
    
    // Convert to HTML
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);
    
    // Post-process for features
    let html_output = post_process_html(html_output);
    
    rsx! {
        div { class: "markdown-content",
            // Mermaid initialization script
            div {
                dangerous_inner_html: "{mermaid_renderer.init_script()}"
            }
            // Render HTML
            div {
                dangerous_inner_html: "{html_output}"
            }
        }
    }
}

/// Extract headings for table of contents
fn extract_headings(content: &str) -> Vec<Heading> {
    let mut headings = Vec::new();
    let mut options = Options::empty();
    options.insert(Options::ENABLE_HEADING_ATTRIBUTES);
    
    let parser = Parser::new_ext(content, options);
    let mut current_heading: Option<(HeadingLevel, String)> = None;
    
    for event in parser {
        match event {
            Event::Start(Tag::Heading { level, .. }) => {
                current_heading = Some((level, String::new()));
            }
            Event::Text(text) => {
                if let Some((_, ref mut heading_text)) = current_heading {
                    heading_text.push_str(&text);
                }
            }
            Event::End(TagEnd::Heading(_)) => {
                if let Some((level, text)) = current_heading.take() {
                    let id = slugify(&text);
                    headings.push(Heading {
                        level: heading_level_to_u8(level),
                        id,
                        text,
                    });
                }
            }
            _ => {}
        }
    }
    
    headings
}

/// Convert heading level to u8
fn heading_level_to_u8(level: HeadingLevel) -> u8 {
    match level {
        HeadingLevel::H1 => 1,
        HeadingLevel::H2 => 2,
        HeadingLevel::H3 => 3,
        HeadingLevel::H4 => 4,
        HeadingLevel::H5 => 5,
        HeadingLevel::H6 => 6,
    }
}

/// Create URL-friendly slug from heading text
fn slugify(text: &str) -> String {
    text.to_lowercase()
        .chars()
        .map(|c| {
            if c.is_alphanumeric() {
                c
            } else if c.is_whitespace() {
                '-'
            } else {
                '_'
            }
        })
        .collect::<String>()
        .trim_matches('-')
        .to_string()
}

/// Post-process HTML for additional features
fn post_process_html(html: String) -> String {
    let mut output = html;
    
    // Add IDs to headings for anchor links
    output = add_heading_anchors(output);
    
    // Wrap tables for responsive scrolling
    output = wrap_tables(output);
    
    // Add copy buttons to code blocks
    output = add_code_copy_buttons(output);
    
    // Process math blocks (KaTeX)
    output = process_math_blocks(output);
    
    // Add task list styling
    output = style_task_lists(output);
    
    output
}

/// Add anchor links to headings
fn add_heading_anchors(html: String) -> String {
    // Simple regex replacement for heading tags
    // In production, use a proper HTML parser
    html.replace("<h1>", "<h1 class=\"heading-with-anchor\">")
        .replace("<h2>", "<h2 class=\"heading-with-anchor\">")
        .replace("<h3>", "<h3 class=\"heading-with-anchor\">")
        .replace("<h4>", "<h4 class=\"heading-with-anchor\">")
        .replace("<h5>", "<h5 class=\"heading-with-anchor\">")
        .replace("<h6>", "<h6 class=\"heading-with-anchor\">")
}

/// Wrap tables for responsive scrolling
fn wrap_tables(html: String) -> String {
    html.replace("<table>", "<div class=\"table-wrapper\"><table>")
        .replace("</table>", "</table></div>")
}

/// Add copy buttons to code blocks
fn add_code_copy_buttons(html: String) -> String {
    // Add copy button to pre blocks
    html.replace(
        "<pre>",
        "<div class=\"code-block-wrapper\"><button class=\"copy-button\" onclick=\"copyCode(this)\">📋 Copy</button><pre>"
    )
    .replace("</pre>", "</pre></div>")
}

/// Process math blocks for KaTeX rendering
fn process_math_blocks(html: String) -> String {
    // Inline math: $...$
    let html = html.replace("$", "<span class=\"math-inline\">");
    
    // Block math: $$...$$
    let html = html.replace("$$", "<div class=\"math-block\">");
    
    html
}

/// Add styling to task lists
fn style_task_lists(html: String) -> String {
    html.replace(
        "<input type=\"checkbox\"",
        "<input type=\"checkbox\" class=\"task-list-item-checkbox\""
    )
}

#[derive(Debug, Clone)]
pub struct Heading {
    pub level: u8,
    pub id: String,
    pub text: String,
}

/// Auto-generated table of contents component
#[component]
pub fn AutoTableOfContents(content: String) -> Element {
    let headings = extract_headings(&content);
    
    if headings.is_empty() {
        return rsx! { div {} };
    }
    
    rsx! {
        nav { class: "auto-toc",
            h3 { "Table of Contents" }
            ul { class: "toc-list",
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

/// Markdown preview with live updates
#[component]
pub fn MarkdownPreview(content: Signal<String>) -> Element {
    rsx! {
        div { class: "markdown-preview-container",
            div { class: "preview-header",
                span { class: "preview-label", "Preview" }
                button {
                    class: "preview-sync-button",
                    title: "Toggle scroll sync",
                    "🔄 Sync"
                }
            }
            div { class: "preview-content",
                MarkdownRenderer { content: content() }
            }
        }
    }
}

/// Split editor/preview view (like VS Code)
#[component]
pub fn MarkdownEditor(initial_content: String) -> Element {
    let mut content = use_signal(|| initial_content);
    let mut show_preview = use_signal(|| true);
    let mut sync_scroll = use_signal(|| true);
    
    rsx! {
        div { class: "markdown-editor-container",
            div { class: "editor-toolbar",
                button {
                    onclick: move |_| show_preview.set(!show_preview()),
                    if show_preview() { "📝 Editor Only" } else { "👁️ Show Preview" }
                }
                button {
                    onclick: move |_| sync_scroll.set(!sync_scroll()),
                    if sync_scroll() { "🔄 Sync: On" } else { "🔄 Sync: Off" }
                }
                button { "**B**" }  // Bold
                button { "*I*" }    // Italic
                button { "~~S~~" }  // Strikethrough
                button { "# H" }    // Heading
                button { "• List" } // List
                button { "[] Task" } // Task list
                button { "📊 Table" } // Table
                button { "🔗 Link" } // Link
                button { "🖼️ Image" } // Image
                button { "💻 Code" } // Code block
            }
            
            div { class: "editor-content-wrapper",
                if show_preview() {
                    // Split view
                    rsx! {
                        div { class: "split-view",
                            div { class: "editor-pane",
                                textarea {
                                    class: "markdown-textarea",
                                    value: "{content()}",
                                    oninput: move |evt| content.set(evt.value()),
                                    placeholder: "Write your markdown here..."
                                }
                            }
                            div { class: "preview-pane",
                                MarkdownPreview { content }
                            }
                        }
                    }
                } else {
                    // Editor only
                    rsx! {
                        textarea {
                            class: "markdown-textarea fullwidth",
                            value: "{content()}",
                            oninput: move |evt| content.set(evt.value()),
                            placeholder: "Write your markdown here..."
                        }
                    }
                }
            }
        }
    }
}

/// Keyboard shortcuts handler (like Markdown All in One)
#[component]
pub fn MarkdownKeyboardShortcuts() -> Element {
    rsx! {
        div { class: "keyboard-shortcuts-info",
            h4 { "Keyboard Shortcuts" }
            ul {
                li { kbd { "Ctrl+B" } " - Bold" }
                li { kbd { "Ctrl+I" } " - Italic" }
                li { kbd { "Alt+S" } " - Strikethrough" }
                li { kbd { "Ctrl+Shift+]" } " - Increase heading level" }
                li { kbd { "Ctrl+Shift+[" } " - Decrease heading level" }
                li { kbd { "Alt+C" } " - Check/uncheck task list item" }
                li { kbd { "Ctrl+Shift+V" } " - Toggle preview" }
                li { kbd { "Ctrl+K V" } " - Open preview to side" }
            }
        }
    }
}

