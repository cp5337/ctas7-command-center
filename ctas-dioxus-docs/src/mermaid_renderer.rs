/// Mermaid Diagram Renderer
/// Renders Mermaid diagrams in markdown preview
use regex::Regex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone)]
pub struct MermaidRenderer {
    theme: MermaidTheme,
}

#[derive(Debug, Clone, Copy)]
pub enum MermaidTheme {
    Default,
    Dark,
    Forest,
    Neutral,
}

impl Default for MermaidRenderer {
    fn default() -> Self {
        Self {
            theme: MermaidTheme::Dark,
        }
    }
}

impl MermaidRenderer {
    pub fn new(theme: MermaidTheme) -> Self {
        Self { theme }
    }
    
    /// Process markdown content and render Mermaid diagrams
    pub fn process(&self, content: &str) -> String {
        let re = Regex::new(r"```mermaid\n([\s\S]*?)```").unwrap();
        
        let mut result = content.to_string();
        let mut offset = 0;
        
        for cap in re.captures_iter(content) {
            let full_match = cap.get(0).unwrap();
            let diagram_code = cap.get(1).unwrap().as_str();
            
            let html = self.render_diagram(diagram_code);
            
            let start = full_match.start() + offset;
            let end = full_match.end() + offset;
            
            result.replace_range(start..end, &html);
            
            offset += html.len() - (end - start);
        }
        
        result
    }
    
    /// Render a single Mermaid diagram to HTML
    fn render_diagram(&self, code: &str) -> String {
        let diagram_id = format!("mermaid-{}", uuid::Uuid::new_v4().simple());
        let theme_class = match self.theme {
            MermaidTheme::Default => "default",
            MermaidTheme::Dark => "dark",
            MermaidTheme::Forest => "forest",
            MermaidTheme::Neutral => "neutral",
        };
        
        format!(
            r#"<div class="mermaid-diagram" data-theme="{}">
  <div id="{}" class="mermaid">
{}
  </div>
</div>"#,
            theme_class, diagram_id, code
        )
    }
    
    /// Extract all Mermaid diagrams from content
    pub fn extract_diagrams(&self, content: &str) -> Vec<MermaidDiagram> {
        let re = Regex::new(r"```mermaid\n([\s\S]*?)```").unwrap();
        
        re.captures_iter(content)
            .map(|cap| {
                let code = cap.get(1).unwrap().as_str().to_string();
                let diagram_type = self.detect_diagram_type(&code);
                
                MermaidDiagram {
                    code,
                    diagram_type,
                }
            })
            .collect()
    }
    
    /// Detect Mermaid diagram type
    fn detect_diagram_type(&self, code: &str) -> DiagramType {
        let first_line = code.lines().next().unwrap_or("").trim();
        
        match first_line {
            s if s.starts_with("graph") => DiagramType::Flowchart,
            s if s.starts_with("sequenceDiagram") => DiagramType::Sequence,
            s if s.starts_with("classDiagram") => DiagramType::Class,
            s if s.starts_with("stateDiagram") => DiagramType::State,
            s if s.starts_with("erDiagram") => DiagramType::EntityRelationship,
            s if s.starts_with("gantt") => DiagramType::Gantt,
            s if s.starts_with("pie") => DiagramType::Pie,
            s if s.starts_with("journey") => DiagramType::Journey,
            s if s.starts_with("gitGraph") => DiagramType::GitGraph,
            _ => DiagramType::Unknown,
        }
    }
    
    /// Generate Mermaid initialization script
    pub fn init_script(&self) -> String {
        let theme = match self.theme {
            MermaidTheme::Default => "default",
            MermaidTheme::Dark => "dark",
            MermaidTheme::Forest => "forest",
            MermaidTheme::Neutral => "neutral",
        };
        
        format!(
            r#"<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
  mermaid.initialize({{ 
    startOnLoad: true,
    theme: '{}',
    securityLevel: 'loose',
    fontFamily: 'monospace'
  }});
</script>"#,
            theme
        )
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MermaidDiagram {
    pub code: String,
    pub diagram_type: DiagramType,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum DiagramType {
    Flowchart,
    Sequence,
    Class,
    State,
    EntityRelationship,
    Gantt,
    Pie,
    Journey,
    GitGraph,
    Unknown,
}

/// Mermaid diagram component for Dioxus
#[cfg(feature = "dioxus")]
pub mod dioxus_component {
    use dioxus::prelude::*;
    use super::*;
    
    #[component]
    pub fn MermaidDiagram(code: String, theme: Option<MermaidTheme>) -> Element {
        let renderer = MermaidRenderer::new(theme.unwrap_or(MermaidTheme::Dark));
        let html = renderer.render_diagram(&code);
        
        rsx! {
            div {
                class: "mermaid-container",
                dangerous_inner_html: "{html}"
            }
        }
    }
    
    #[component]
    pub fn MermaidInit(theme: Option<MermaidTheme>) -> Element {
        let renderer = MermaidRenderer::new(theme.unwrap_or(MermaidTheme::Dark));
        let script = renderer.init_script();
        
        rsx! {
            div {
                dangerous_inner_html: "{script}"
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_detect_flowchart() {
        let renderer = MermaidRenderer::default();
        let code = "graph TD\n  A-->B";
        let diagram_type = renderer.detect_diagram_type(code);
        
        assert!(matches!(diagram_type, DiagramType::Flowchart));
    }
    
    #[test]
    fn test_extract_diagrams() {
        let renderer = MermaidRenderer::default();
        let content = "# Test\n```mermaid\ngraph TD\n  A-->B\n```\nSome text\n```mermaid\nsequenceDiagram\n  A->>B: Hello\n```";
        
        let diagrams = renderer.extract_diagrams(content);
        assert_eq!(diagrams.len(), 2);
    }
}

// Add uuid dependency
use uuid::Uuid;

