// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI Code Generation Routes - Cursor, Bolt.new, v0.dev
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Direct routes to best-in-class AI code generation services:
// - Cursor AI: IDE-integrated, context-aware code generation
// - Bolt.new: Instant full-stack web apps with preview
// - v0.dev: Vercel's AI UI designer (React + Tailwind)
//
// Note: bolt.diy is self-hosted fallback, but these are preferred
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

use anyhow::{Context, Result};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct AICodeGenRouter {
    client: Client,
    cursor_api_key: Option<String>,
    vercel_token: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CodeGenRequest {
    pub prompt: String,
    pub framework: Option<String>,
    pub style_system: Option<String>,
    pub context_files: Option<Vec<ContextFile>>,
    pub design_url: Option<String>, // Figma, etc.
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ContextFile {
    pub path: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CodeGenResponse {
    pub service: AICodeGenService,
    pub project_url: String,
    pub preview_url: Option<String>,
    pub files: Vec<GeneratedFile>,
    pub deployment_ready: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum AICodeGenService {
    CursorAI,
    BoltNew,
    V0Dev,
    BoltDIY, // Self-hosted fallback
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GeneratedFile {
    pub path: String,
    pub content: String,
    pub language: String,
}

impl AICodeGenRouter {
    pub fn new(cursor_api_key: Option<String>, vercel_token: Option<String>) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(300))
            .build()
            .expect("Failed to create HTTP client");

        Self {
            client,
            cursor_api_key,
            vercel_token,
        }
    }

    /// Route to best service based on request type
    pub async fn route_request(&self, request: CodeGenRequest) -> Result<CodeGenResponse> {
        // Decision logic for routing
        let service = self.select_service(&request);

        match service {
            AICodeGenService::CursorAI => self.use_cursor_ai(request).await,
            AICodeGenService::BoltNew => self.use_bolt_new(request).await,
            AICodeGenService::V0Dev => self.use_v0_dev(request).await,
            AICodeGenService::BoltDIY => self.use_bolt_diy(request).await,
        }
    }

    fn select_service(&self, request: &CodeGenRequest) -> AICodeGenService {
        // v0.dev for React + Tailwind UI components
        if request.framework.as_deref() == Some("react")
            && request.style_system.as_deref() == Some("tailwind")
            && request.design_url.is_some()
        {
            return AICodeGenService::V0Dev;
        }

        // Bolt.new for full-stack web apps with instant preview
        if request.framework.as_deref().map(|f| f.contains("next") || f.contains("remix") || f.contains("vite")).unwrap_or(false) {
            return AICodeGenService::BoltNew;
        }

        // Cursor AI for context-aware edits (if context files provided)
        if request.context_files.is_some() && self.cursor_api_key.is_some() {
            return AICodeGenService::CursorAI;
        }

        // Default to bolt.diy (self-hosted)
        AICodeGenService::BoltDIY
    }

    /// Cursor AI: IDE-integrated code generation
    async fn use_cursor_ai(&self, request: CodeGenRequest) -> Result<CodeGenResponse> {
        // Cursor AI doesn't have a public API yet, but we can:
        // 1. Generate cursor rules
        // 2. Create project structure
        // 3. Return instructions for opening in Cursor

        let cursor_rules = self.generate_cursor_rules(&request);

        Ok(CodeGenResponse {
            service: AICodeGenService::CursorAI,
            project_url: "cursor://open".to_string(),
            preview_url: None,
            files: vec![
                GeneratedFile {
                    path: ".cursorrules".to_string(),
                    content: cursor_rules,
                    language: "yaml".to_string(),
                },
            ],
            deployment_ready: false,
        })
    }

    fn generate_cursor_rules(&self, request: &CodeGenRequest) -> String {
        format!(
            r#"# CTAS-7 Generated Project Rules
# Prompt: {}

## Framework
{}

## Style System
{}

## Instructions
- Generate production-ready code
- Follow CTAS-7 design patterns
- Use TypeScript strict mode
- Include tests for all components
- Follow accessibility best practices
"#,
            request.prompt,
            request.framework.as_deref().unwrap_or("react"),
            request.style_system.as_deref().unwrap_or("tailwind"),
        )
    }

    /// Bolt.new: Instant full-stack web apps
    async fn use_bolt_new(&self, request: CodeGenRequest) -> Result<CodeGenResponse> {
        // bolt.new is a web interface - we generate a URL with encoded prompt
        let encoded_prompt = urlencoding::encode(&request.prompt);
        let bolt_url = format!("https://bolt.new/?prompt={}", encoded_prompt);

        Ok(CodeGenResponse {
            service: AICodeGenService::BoltNew,
            project_url: bolt_url.clone(),
            preview_url: Some(bolt_url),
            files: vec![],
            deployment_ready: true,
        })
    }

    /// v0.dev: Vercel's AI UI designer
    async fn use_v0_dev(&self, request: CodeGenRequest) -> Result<CodeGenResponse> {
        let url = "https://v0.dev/api/generate";

        let body = serde_json::json!({
            "prompt": request.prompt,
            "framework": request.framework.unwrap_or("react".to_string()),
            "styleSystem": request.style_system.unwrap_or("tailwind".to_string()),
        });

        let response = self
            .client
            .post(url)
            .header("Authorization", format!("Bearer {}", self.vercel_token.as_ref().unwrap_or(&String::new())))
            .json(&body)
            .send()
            .await
            .context("Failed to call v0.dev API")?;

        if !response.status().is_success() {
            // Fallback to web interface
            let encoded_prompt = urlencoding::encode(&request.prompt);
            let v0_url = format!("https://v0.dev/chat?prompt={}", encoded_prompt);

            return Ok(CodeGenResponse {
                service: AICodeGenService::V0Dev,
                project_url: v0_url.clone(),
                preview_url: Some(v0_url),
                files: vec![],
                deployment_ready: true,
            });
        }

        let result: serde_json::Value = response.json().await?;

        Ok(CodeGenResponse {
            service: AICodeGenService::V0Dev,
            project_url: result["url"].as_str().unwrap_or("https://v0.dev").to_string(),
            preview_url: result["preview_url"].as_str().map(|s| s.to_string()),
            files: vec![], // v0 provides live preview
            deployment_ready: true,
        })
    }

    /// bolt.diy: Self-hosted fallback
    async fn use_bolt_diy(&self, request: CodeGenRequest) -> Result<CodeGenResponse> {
        let url = "http://bolt-diy:5173/api/generate";

        let response = self
            .client
            .post(url)
            .json(&request)
            .send()
            .await
            .context("Failed to call bolt.diy")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("bolt.diy failed: {}", error_text);
        }

        let result: serde_json::Value = response.json().await?;

        Ok(CodeGenResponse {
            service: AICodeGenService::BoltDIY,
            project_url: result["project_url"].as_str().unwrap_or("").to_string(),
            preview_url: result["preview_url"].as_str().map(|s| s.to_string()),
            files: serde_json::from_value(result["files"].clone())?,
            deployment_ready: result["deployment_ready"].as_bool().unwrap_or(false),
        })
    }
}

/// Forge can call this router directly
pub async fn forge_code_generation(
    prompt: &str,
    framework: Option<&str>,
    context_files: Option<Vec<ContextFile>>,
) -> Result<CodeGenResponse> {
    let router = AICodeGenRouter::new(None, None);

    let request = CodeGenRequest {
        prompt: prompt.to_string(),
        framework: framework.map(|s| s.to_string()),
        style_system: Some("tailwind".to_string()),
        context_files,
        design_url: None,
    };

    router.route_request(request).await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_service_selection() {
        let router = AICodeGenRouter::new(None, None);

        let react_tailwind = CodeGenRequest {
            prompt: "Create a dashboard".to_string(),
            framework: Some("react".to_string()),
            style_system: Some("tailwind".to_string()),
            context_files: None,
            design_url: Some("https://figma.com/...".to_string()),
        };

        let service = router.select_service(&react_tailwind);
        assert!(matches!(service, AICodeGenService::V0Dev));
    }
}
