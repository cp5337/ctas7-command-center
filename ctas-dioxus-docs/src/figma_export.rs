/// Figma Export System
/// Export diagrams, layouts, and UI components to Figma format
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FigmaExporter {
    api_key: Option<String>,
    file_key: Option<String>,
}

impl FigmaExporter {
    pub fn new() -> Self {
        Self {
            api_key: std::env::var("FIGMA_API_KEY").ok(),
            file_key: std::env::var("FIGMA_FILE_KEY").ok(),
        }
    }
    
    pub fn with_credentials(api_key: String, file_key: String) -> Self {
        Self {
            api_key: Some(api_key),
            file_key: Some(file_key),
        }
    }
    
    /// Export Mermaid diagram to Figma
    pub async fn export_mermaid(&self, diagram: &crate::mermaid_renderer::MermaidDiagram) -> Result<FigmaNode, ExportError> {
        // Convert Mermaid to Figma nodes
        let nodes = self.parse_mermaid_to_figma(&diagram.code)?;
        
        Ok(FigmaNode {
            id: uuid::Uuid::new_v4().to_string(),
            name: "Mermaid Diagram".to_string(),
            node_type: NodeType::Frame,
            children: nodes,
            properties: HashMap::new(),
        })
    }
    
    /// Export markdown table to Figma
    pub async fn export_table(&self, table_html: &str) -> Result<FigmaNode, ExportError> {
        // Parse HTML table and convert to Figma frame with auto-layout
        let rows = self.parse_table_html(table_html)?;
        
        let mut children = Vec::new();
        for (row_idx, row) in rows.iter().enumerate() {
            let row_node = FigmaNode {
                id: format!("row-{}", row_idx),
                name: format!("Row {}", row_idx + 1),
                node_type: NodeType::Frame,
                children: row.iter().enumerate().map(|(col_idx, cell)| {
                    FigmaNode {
                        id: format!("cell-{}-{}", row_idx, col_idx),
                        name: format!("Cell {}-{}", row_idx + 1, col_idx + 1),
                        node_type: NodeType::Text,
                        children: vec![],
                        properties: {
                            let mut props = HashMap::new();
                            props.insert("characters".to_string(), serde_json::json!(cell));
                            props
                        },
                    }
                }).collect(),
                properties: {
                    let mut props = HashMap::new();
                    props.insert("layoutMode".to_string(), serde_json::json!("HORIZONTAL"));
                    props.insert("itemSpacing".to_string(), serde_json::json!(16));
                    props
                },
            };
            children.push(row_node);
        }
        
        Ok(FigmaNode {
            id: uuid::Uuid::new_v4().to_string(),
            name: "Table".to_string(),
            node_type: NodeType::Frame,
            children,
            properties: {
                let mut props = HashMap::new();
                props.insert("layoutMode".to_string(), serde_json::json!("VERTICAL"));
                props.insert("itemSpacing".to_string(), serde_json::json!(8));
                props
            },
        })
    }
    
    /// Export entire documentation page layout to Figma
    pub async fn export_layout(&self, page_html: &str) -> Result<FigmaNode, ExportError> {
        // Parse HTML and create Figma frame structure
        let sections = self.parse_page_sections(page_html)?;
        
        let children: Vec<FigmaNode> = sections.into_iter().enumerate().map(|(idx, section)| {
            FigmaNode {
                id: format!("section-{}", idx),
                name: section.title,
                node_type: NodeType::Frame,
                children: vec![],
                properties: HashMap::new(),
            }
        }).collect();
        
        Ok(FigmaNode {
            id: uuid::Uuid::new_v4().to_string(),
            name: "Documentation Page".to_string(),
            node_type: NodeType::Frame,
            children,
            properties: {
                let mut props = HashMap::new();
                props.insert("layoutMode".to_string(), serde_json::json!("VERTICAL"));
                props.insert("itemSpacing".to_string(), serde_json::json!(32));
                props.insert("paddingLeft".to_string(), serde_json::json!(64));
                props.insert("paddingRight".to_string(), serde_json::json!(64));
                props.insert("paddingTop".to_string(), serde_json::json!(64));
                props.insert("paddingBottom".to_string(), serde_json::json!(64));
                props
            },
        })
    }
    
    /// Push to Figma API
    pub async fn push_to_figma(&self, node: &FigmaNode) -> Result<String, ExportError> {
        let api_key = self.api_key.as_ref()
            .ok_or(ExportError::MissingCredentials("FIGMA_API_KEY not set".to_string()))?;
        
        let file_key = self.file_key.as_ref()
            .ok_or(ExportError::MissingCredentials("FIGMA_FILE_KEY not set".to_string()))?;
        
        let client = reqwest::Client::new();
        let url = format!("https://api.figma.com/v1/files/{}/nodes", file_key);
        
        let response = client
            .post(&url)
            .header("X-Figma-Token", api_key)
            .json(&node)
            .send()
            .await
            .map_err(|e| ExportError::ApiError(e.to_string()))?;
        
        if !response.status().is_success() {
            return Err(ExportError::ApiError(format!(
                "Figma API error: {}",
                response.status()
            )));
        }
        
        let result: FigmaApiResponse = response.json().await
            .map_err(|e| ExportError::ApiError(e.to_string()))?;
        
        Ok(result.node_id)
    }
    
    /// Parse Mermaid code to Figma nodes
    fn parse_mermaid_to_figma(&self, code: &str) -> Result<Vec<FigmaNode>, ExportError> {
        // Simplified parser - in production, use a proper Mermaid parser
        let lines: Vec<&str> = code.lines().collect();
        let mut nodes = Vec::new();
        
        for (idx, line) in lines.iter().enumerate() {
            let trimmed = line.trim();
            if trimmed.is_empty() || trimmed.starts_with("graph") || trimmed.starts_with("sequenceDiagram") {
                continue;
            }
            
            // Parse node definition (e.g., "A[Label]" or "A-->B")
            if let Some(label) = self.extract_node_label(trimmed) {
                nodes.push(FigmaNode {
                    id: format!("node-{}", idx),
                    name: label.clone(),
                    node_type: NodeType::Rectangle,
                    children: vec![
                        FigmaNode {
                            id: format!("text-{}", idx),
                            name: "Label".to_string(),
                            node_type: NodeType::Text,
                            children: vec![],
                            properties: {
                                let mut props = HashMap::new();
                                props.insert("characters".to_string(), serde_json::json!(label));
                                props
                            },
                        }
                    ],
                    properties: {
                        let mut props = HashMap::new();
                        props.insert("fills".to_string(), serde_json::json!([{
                            "type": "SOLID",
                            "color": {"r": 0.2, "g": 0.6, "b": 0.9, "a": 1.0}
                        }]));
                        props
                    },
                });
            }
        }
        
        Ok(nodes)
    }
    
    /// Extract node label from Mermaid syntax
    fn extract_node_label(&self, line: &str) -> Option<String> {
        // Simple regex for [Label] or (Label) or {Label}
        if let Some(start) = line.find('[') {
            if let Some(end) = line.find(']') {
                return Some(line[start + 1..end].to_string());
            }
        }
        if let Some(start) = line.find('(') {
            if let Some(end) = line.find(')') {
                return Some(line[start + 1..end].to_string());
            }
        }
        if let Some(start) = line.find('{') {
            if let Some(end) = line.find('}') {
                return Some(line[start + 1..end].to_string());
            }
        }
        None
    }
    
    /// Parse HTML table to rows/cells
    fn parse_table_html(&self, html: &str) -> Result<Vec<Vec<String>>, ExportError> {
        // Simplified HTML parser - in production, use a proper HTML parser
        let mut rows = Vec::new();
        let mut current_row = Vec::new();
        
        for line in html.lines() {
            if line.contains("<td>") || line.contains("<th>") {
                if let Some(start) = line.find('>') {
                    if let Some(end) = line.rfind('<') {
                        let cell_content = line[start + 1..end].trim().to_string();
                        current_row.push(cell_content);
                    }
                }
            }
            if line.contains("</tr>") && !current_row.is_empty() {
                rows.push(current_row.clone());
                current_row.clear();
            }
        }
        
        Ok(rows)
    }
    
    /// Parse page sections
    fn parse_page_sections(&self, html: &str) -> Result<Vec<PageSection>, ExportError> {
        let mut sections = Vec::new();
        let mut current_section = None;
        
        for line in html.lines() {
            if line.contains("<h1>") || line.contains("<h2>") {
                if let Some(section) = current_section.take() {
                    sections.push(section);
                }
                
                let title = line
                    .replace("<h1>", "")
                    .replace("</h1>", "")
                    .replace("<h2>", "")
                    .replace("</h2>", "")
                    .trim()
                    .to_string();
                
                current_section = Some(PageSection {
                    title,
                    content: String::new(),
                });
            } else if let Some(ref mut section) = current_section {
                section.content.push_str(line);
                section.content.push('\n');
            }
        }
        
        if let Some(section) = current_section {
            sections.push(section);
        }
        
        Ok(sections)
    }
}

impl Default for FigmaExporter {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FigmaNode {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub node_type: NodeType,
    pub children: Vec<FigmaNode>,
    #[serde(flatten)]
    pub properties: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum NodeType {
    Frame,
    Group,
    Rectangle,
    Text,
    Vector,
    Component,
    Instance,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct FigmaApiResponse {
    node_id: String,
}

#[derive(Debug, Clone)]
struct PageSection {
    title: String,
    content: String,
}

#[derive(Debug)]
pub enum ExportError {
    MissingCredentials(String),
    ApiError(String),
    ParseError(String),
}

impl std::fmt::Display for ExportError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ExportError::MissingCredentials(msg) => write!(f, "Missing credentials: {}", msg),
            ExportError::ApiError(msg) => write!(f, "API error: {}", msg),
            ExportError::ParseError(msg) => write!(f, "Parse error: {}", msg),
        }
    }
}

impl std::error::Error for ExportError {}

use uuid::Uuid;

