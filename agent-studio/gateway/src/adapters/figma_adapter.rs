// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Figma API Adapter
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Automated EA document generation and design system management
//
// Capabilities:
// - Generate EA (Enterprise Architecture) documents from templates
// - Export design system tokens
// - Automated diagram generation
// - Component library synchronization
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use reqwest::Client;
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct FigmaAdapter {
    client: Client,
    access_token: String,
    team_id: Option<String>,
    ea_template_file: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FigmaEADocumentRequest {
    pub title: String,
    pub document_type: String, // system-context, container, component, deployment
    pub content: FigmaEAContent,
    pub export_formats: Vec<String>, // pdf, png, svg
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FigmaEAContent {
    pub systems: Vec<FigmaSystem>,
    pub connections: Vec<FigmaConnection>,
    pub metadata: FigmaMetadata,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FigmaSystem {
    pub name: String,
    pub system_type: String, // service, database, api, frontend, etc.
    pub description: Option<String>,
    pub technology: Option<String>,
    pub ports: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FigmaConnection {
    pub from: String,
    pub to: String,
    pub connection_type: String, // http, grpc, websocket, database, etc.
    pub label: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FigmaMetadata {
    pub project_name: String,
    pub version: String,
    pub author: String,
    pub date: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FigmaFileResponse {
    pub file_key: String,
    pub name: String,
    pub thumbnail_url: Option<String>,
    pub last_modified: String,
    pub version: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FigmaExportResponse {
    pub images: std::collections::HashMap<String, String>,
}

impl FigmaAdapter {
    pub fn new(access_token: String, team_id: Option<String>, ea_template_file: Option<String>) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(60))
            .build()
            .expect("Failed to create HTTP client");

        Self {
            client,
            access_token,
            team_id,
            ea_template_file,
        }
    }

    /// Get file information
    pub async fn get_file(&self, file_key: &str) -> Result<FigmaFileResponse> {
        let url = format!("https://api.figma.com/v1/files/{}", file_key);

        let response = self.client
            .get(&url)
            .header("X-Figma-Token", &self.access_token)
            .send()
            .await
            .context("Failed to get Figma file")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Figma API error: {}", error_text);
        }

        let file_data: serde_json::Value = response.json().await?;

        Ok(FigmaFileResponse {
            file_key: file_key.to_string(),
            name: file_data["name"].as_str().unwrap_or("Unknown").to_string(),
            thumbnail_url: file_data["thumbnailUrl"].as_str().map(|s| s.to_string()),
            last_modified: file_data["lastModified"].as_str().unwrap_or("").to_string(),
            version: file_data["version"].as_str().unwrap_or("1").to_string(),
        })
    }

    /// Export file as image
    pub async fn export_file(
        &self,
        file_key: &str,
        format: &str,
        scale: f32,
    ) -> Result<FigmaExportResponse> {
        let url = format!(
            "https://api.figma.com/v1/images/{}?format={}&scale={}",
            file_key, format, scale
        );

        let response = self.client
            .get(&url)
            .header("X-Figma-Token", &self.access_token)
            .send()
            .await
            .context("Failed to export Figma file")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Figma export error: {}", error_text);
        }

        let export_response: FigmaExportResponse = response.json().await?;
        Ok(export_response)
    }

    /// Generate EA document from CTAS system
    pub async fn generate_ea_document(
        &self,
        request: FigmaEADocumentRequest,
    ) -> Result<FigmaFileResponse> {
        // In a real implementation, this would:
        // 1. Duplicate the EA template file
        // 2. Use Figma API to update text layers with system info
        // 3. Programmatically add/update diagram nodes
        // 4. Export to requested formats

        if let Some(template_file) = &self.ea_template_file {
            let file_info = self.get_file(template_file).await?;

            // TODO: Implement actual diagram generation
            // For now, return template info
            Ok(file_info)
        } else {
            anyhow::bail!("No EA template file configured");
        }
    }

    /// Generate C4 architecture diagram
    pub async fn generate_c4_diagram(
        &self,
        level: &str, // context, container, component, code
        systems: Vec<FigmaSystem>,
        connections: Vec<FigmaConnection>,
    ) -> Result<FigmaFileResponse> {
        let request = FigmaEADocumentRequest {
            title: format!("CTAS {} Diagram", level),
            document_type: level.to_string(),
            content: FigmaEAContent {
                systems,
                connections,
                metadata: FigmaMetadata {
                    project_name: "CTAS-7".to_string(),
                    version: "7.1".to_string(),
                    author: "CTAS Agent Studio".to_string(),
                    date: chrono::Utc::now().format("%Y-%m-%d").to_string(),
                },
            },
            export_formats: vec!["pdf".to_string(), "svg".to_string()],
        };

        self.generate_ea_document(request).await
    }

    /// Export design tokens for frontend
    pub async fn export_design_tokens(&self, file_key: &str) -> Result<serde_json::Value> {
        let url = format!("https://api.figma.com/v1/files/{}/styles", file_key);

        let response = self.client
            .get(&url)
            .header("X-Figma-Token", &self.access_token)
            .send()
            .await
            .context("Failed to get Figma styles")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Figma styles API error: {}", error_text);
        }

        let styles: serde_json::Value = response.json().await?;
        Ok(styles)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_figma_adapter_creation() {
        let adapter = FigmaAdapter::new(
            "test_token".to_string(),
            Some("test_team".to_string()),
            Some("test_template".to_string()),
        );
        assert_eq!(adapter.access_token, "test_token");
    }
}
