/// CTAS-7 Dioxus Documentation Site
/// 
/// Features:
/// - Lazy-loading markdown files (load on-demand, not bundled)
/// - Markdown table prettifier with alignment support
/// - Mermaid diagram rendering
/// - Figma export for diagrams and layouts
/// - VS Code markdown extension features
/// - Docusaurus-like UI with dark mode

pub mod markdown_loader;
pub mod markdown_table;
pub mod mermaid_renderer;
pub mod figma_export;
pub mod components;

pub use markdown_loader::{MarkdownLoader, LoadError};
pub use markdown_table::TablePrettifier;
pub use mermaid_renderer::{MermaidRenderer, MermaidTheme, MermaidDiagram, DiagramType};
pub use figma_export::{FigmaExporter, FigmaNode, NodeType, ExportError};

