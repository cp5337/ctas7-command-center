// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Forge → bolt.diy Direct Integration (No Gateway)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Direct HTTP communication between Forge and bolt.diy
// No bottlenecks, no filters, peer-to-peer service calls
//
// Architecture:
//   Forge (18220) ──HTTP──> bolt.diy (5173)
//                └──HTTP──> Figma API
//                └──HTTP──> Vercel API
//                └──gRPC──> Neural Mux (50051)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

use anyhow::{Context, Result};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct BoltDiyDirect {
    client: Client,
    base_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CodeGenRequest {
    pub prompt: String,
    pub framework: String, // react, react-native, dioxus, next.js
    pub style_system: Option<String>, // tailwind, styled-components
    pub typescript: bool,
    pub figma_design_url: Option<String>,
    pub design_tokens: Option<serde_json::Value>,
    pub target_platform: Vec<String>, // web, mobile, ios
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CodeGenResponse {
    pub project_id: String,
    pub files: Vec<GeneratedFile>,
    pub preview_url: String,
    pub git_repo: Option<String>,
    pub deployment_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GeneratedFile {
    pub path: String,
    pub content: String,
    pub language: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TranspilerRequest {
    pub project_id: String,
    pub source_framework: String, // react, react-native
    pub target_platform: String, // ios, android, macos
    pub optimization_level: String, // dev, production
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TranspilerResponse {
    pub transpiled_files: Vec<GeneratedFile>,
    pub build_script: String,
    pub deployment_instructions: String,
}

impl BoltDiyDirect {
    pub fn new(base_url: String) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(300)) // 5 min for large code gen
            .build()
            .expect("Failed to create HTTP client");

        Self { client, base_url }
    }

    /// Generate code from natural language or Figma design
    pub async fn generate_code(&self, request: CodeGenRequest) -> Result<CodeGenResponse> {
        let url = format!("{}/api/generate", self.base_url);

        let response = self
            .client
            .post(&url)
            .json(&request)
            .send()
            .await
            .context("Failed to call bolt.diy generate API")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("bolt.diy generation failed: {}", error_text);
        }

        let code_gen_response: CodeGenResponse = response.json().await?;
        Ok(code_gen_response)
    }

    /// Import Figma design and generate code
    pub async fn from_figma(&self, figma_url: &str, framework: &str) -> Result<CodeGenResponse> {
        let request = CodeGenRequest {
            prompt: format!("Convert Figma design to {}", framework),
            framework: framework.to_string(),
            style_system: Some("tailwind".to_string()),
            typescript: true,
            figma_design_url: Some(figma_url.to_string()),
            design_tokens: None,
            target_platform: vec!["web".to_string(), "mobile".to_string()],
        };

        self.generate_code(request).await
    }

    /// Generate code and prepare for iOS transpilation
    pub async fn generate_for_transpiler(
        &self,
        prompt: &str,
        design_tokens: Option<serde_json::Value>,
    ) -> Result<CodeGenResponse> {
        let request = CodeGenRequest {
            prompt: prompt.to_string(),
            framework: "react-native".to_string(),
            style_system: Some("tailwind".to_string()),
            typescript: true,
            figma_design_url: None,
            design_tokens,
            target_platform: vec!["mobile".to_string(), "ios".to_string()],
        };

        self.generate_code(request).await
    }

    /// Trigger transpilation to native iOS
    pub async fn transpile_to_ios(&self, project_id: &str) -> Result<TranspilerResponse> {
        let url = format!("{}/api/transpile", self.base_url);

        let request = TranspilerRequest {
            project_id: project_id.to_string(),
            source_framework: "react-native".to_string(),
            target_platform: "ios".to_string(),
            optimization_level: "production".to_string(),
        };

        let response = self
            .client
            .post(&url)
            .json(&request)
            .send()
            .await
            .context("Failed to call transpiler API")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Transpilation failed: {}", error_text);
        }

        let transpiler_response: TranspilerResponse = response.json().await?;
        Ok(transpiler_response)
    }

    /// Complete pipeline: Figma → Code → iOS
    pub async fn figma_to_ios_pipeline(&self, figma_url: &str) -> Result<TranspilerResponse> {
        // Step 1: Generate React Native from Figma
        let code_gen = self.from_figma(figma_url, "react-native").await?;

        // Step 2: Transpile to native iOS
        let transpiled = self.transpile_to_ios(&code_gen.project_id).await?;

        Ok(transpiled)
    }

    /// Deploy generated code to Vercel
    pub async fn deploy_to_vercel(&self, project_id: &str) -> Result<String> {
        let url = format!("{}/api/deploy/vercel", self.base_url);

        let response = self
            .client
            .post(&url)
            .json(&serde_json::json!({
                "project_id": project_id,
            }))
            .send()
            .await
            .context("Failed to deploy to Vercel")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Vercel deployment failed: {}", error_text);
        }

        let deployment: serde_json::Value = response.json().await?;
        let url = deployment["url"]
            .as_str()
            .context("No deployment URL returned")?
            .to_string();

        Ok(url)
    }

    /// Get project status
    pub async fn get_project(&self, project_id: &str) -> Result<CodeGenResponse> {
        let url = format!("{}/api/projects/{}", self.base_url, project_id);

        let response = self
            .client
            .get(&url)
            .send()
            .await
            .context("Failed to get project")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Failed to get project: {}", error_text);
        }

        let project: CodeGenResponse = response.json().await?;
        Ok(project)
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Forge Integration Layer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/// Forge can call bolt.diy directly for code generation tasks
pub async fn forge_codegen_task(
    bolt_url: &str,
    task_description: &str,
    framework: &str,
) -> Result<CodeGenResponse> {
    let bolt = BoltDiyDirect::new(bolt_url.to_string());

    let request = CodeGenRequest {
        prompt: task_description.to_string(),
        framework: framework.to_string(),
        style_system: Some("tailwind".to_string()),
        typescript: true,
        figma_design_url: None,
        design_tokens: None,
        target_platform: vec!["web".to_string()],
    };

    bolt.generate_code(request).await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bolt_diy_direct_creation() {
        let bolt = BoltDiyDirect::new("http://localhost:5173".to_string());
        assert_eq!(bolt.base_url, "http://localhost:5173");
    }
}

