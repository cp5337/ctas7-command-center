use dioxus::prelude::*;
use pulldown_cmark::{Parser, Event, Tag};

/// Spec Renderer - Parses and displays markdown documentation
#[component]
pub fn SpecRenderer(markdown: String) -> Element {
    let html = markdown_to_html(&markdown);
    
    rsx! {
        div { 
            class: "prose prose-invert max-w-none",
            dangerous_inner_html: "{html}"
        }
    }
}

fn markdown_to_html(markdown: &str) -> String {
    let parser = Parser::new(markdown);
    let mut html = String::new();
    
    for event in parser {
        match event {
            Event::Start(Tag::Heading { level, .. }) => {
                let tag = format!("h{}", level);
                let class = match level {
                    pulldown_cmark::HeadingLevel::H1 => "text-largeTitle mb-4 mt-8",
                    pulldown_cmark::HeadingLevel::H2 => "text-title1 mb-3 mt-6",
                    pulldown_cmark::HeadingLevel::H3 => "text-title2 mb-2 mt-4",
                    _ => "text-headline mb-2 mt-3",
                };
                html.push_str(&format!("<{} class=\"{}\">", tag, class));
            }
            Event::End(pulldown_cmark::TagEnd::Heading(level)) => {
                let level_num = match level {
                    pulldown_cmark::HeadingLevel::H1 => 1,
                    pulldown_cmark::HeadingLevel::H2 => 2,
                    pulldown_cmark::HeadingLevel::H3 => 3,
                    pulldown_cmark::HeadingLevel::H4 => 4,
                    pulldown_cmark::HeadingLevel::H5 => 5,
                    pulldown_cmark::HeadingLevel::H6 => 6,
                };
                html.push_str(&format!("</h{}>", level_num));
            }
            Event::Start(Tag::Paragraph) => {
                html.push_str("<p class=\"text-body mb-4\">");
            }
            Event::End(pulldown_cmark::TagEnd::Paragraph) => {
                html.push_str("</p>");
            }
            Event::Start(Tag::CodeBlock(_)) => {
                html.push_str("<pre class=\"card p-4 overflow-x-auto\"><code class=\"text-mono\">");
            }
            Event::End(pulldown_cmark::TagEnd::CodeBlock) => {
                html.push_str("</code></pre>");
            }
            Event::Code(code) => {
                html.push_str(&format!("<code class=\"text-mono bg-[var(--color-surface-elevated)] px-2 py-1 rounded\">{}</code>", code));
            }
            Event::Text(text) => {
                html.push_str(&text);
            }
            _ => {}
        }
    }
    
    html
}




