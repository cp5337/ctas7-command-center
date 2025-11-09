// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Canva API Adapter
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Automated design generation and slide creation using Canva API
//
// Capabilities:
// - Generate branded presentations and slides
// - Create social media assets
// - Export designs in multiple formats
// - Apply brand kits automatically
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use reqwest::Client;
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct CanvaAdapter {
    client: Client,
    api_key: String,
    brand_kit_id: Option<String>,
    template_folder: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CanvaDesignRequest {
    pub template_id: Option<String>,
    pub title: String,
    pub content: Vec<CanvaSlideContent>,
    pub brand_kit_id: Option<String>,
    pub export_format: Option<String>, // pdf, png, jpg, pptx
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CanvaSlideContent {
    pub slide_number: usize,
    pub title: Option<String>,
    pub body: Option<String>,
    pub image_url: Option<String>,
    pub layout: String, // title-only, title-body, image-title-body, etc.
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CanvaDesignResponse {
    pub design_id: String,
    pub edit_url: String,
    pub export_url: Option<String>,
    pub thumbnail_url: Option<String>,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CanvaExportRequest {
    pub design_id: String,
    pub format: String, // pdf, png, jpg, pptx
    pub quality: Option<String>, // high, medium, low
}

impl CanvaAdapter {
    pub fn new(api_key: String, brand_kit_id: Option<String>, template_folder: String) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(60))
            .build()
            .expect("Failed to create HTTP client");

        Self {
            client,
            api_key,
            brand_kit_id,
            template_folder,
        }
    }

    /// Create a new design from template
    pub async fn create_design(&self, request: CanvaDesignRequest) -> Result<CanvaDesignResponse> {
        let url = "https://api.canva.com/v1/designs";

        let mut body = serde_json::json!({
            "asset_type": "Presentation",
            "title": request.title,
        });

        if let Some(template_id) = request.template_id {
            body["design_type"] = serde_json::json!({"template_id": template_id});
        }

        if let Some(brand_kit_id) = request.brand_kit_id.or(self.brand_kit_id.clone()) {
            body["brand_template_id"] = serde_json::json!(brand_kit_id);
        }

        let response = self.client
            .post(url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .context("Failed to create Canva design")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Canva API error: {}", error_text);
        }

        let design_response: CanvaDesignResponse = response.json().await?;
        Ok(design_response)
    }

    /// Export design to specified format
    pub async fn export_design(&self, request: CanvaExportRequest) -> Result<String> {
        let url = format!("https://api.canva.com/v1/designs/{}/export", request.design_id);

        let body = serde_json::json!({
            "format": request.format,
            "quality": request.quality.unwrap_or("high".to_string()),
        });

        let response = self.client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .context("Failed to export Canva design")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Canva export error: {}", error_text);
        }

        let export_response: serde_json::Value = response.json().await?;
        let export_url = export_response["urls"][0]["url"]
            .as_str()
            .context("Failed to get export URL")?
            .to_string();

        Ok(export_url)
    }

    /// Get design status
    pub async fn get_design(&self, design_id: &str) -> Result<CanvaDesignResponse> {
        let url = format!("https://api.canva.com/v1/designs/{}", design_id);

        let response = self.client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .send()
            .await
            .context("Failed to get Canva design")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Canva API error: {}", error_text);
        }

        let design_response: CanvaDesignResponse = response.json().await?;
        Ok(design_response)
    }

    /// Generate presentation from Linear issue or commit
    pub async fn generate_presentation_from_context(
        &self,
        title: &str,
        context: &str,
    ) -> Result<CanvaDesignResponse> {
        // Parse context and create slides
        let slides = vec![
            CanvaSlideContent {
                slide_number: 1,
                title: Some(title.to_string()),
                body: None,
                image_url: None,
                layout: "title-only".to_string(),
            },
            CanvaSlideContent {
                slide_number: 2,
                title: Some("Overview".to_string()),
                body: Some(context.to_string()),
                image_url: None,
                layout: "title-body".to_string(),
            },
        ];

        let request = CanvaDesignRequest {
            template_id: None,
            title: title.to_string(),
            content: slides,
            brand_kit_id: self.brand_kit_id.clone(),
            export_format: Some("pdf".to_string()),
        };

        self.create_design(request).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_canva_adapter_creation() {
        let adapter = CanvaAdapter::new(
            "test_key".to_string(),
            Some("test_brand".to_string()),
            "CTAS Templates".to_string(),
        );
        assert_eq!(adapter.api_key, "test_key");
    }
}

