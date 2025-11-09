// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Vercel API Adapter
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Automated frontend deployment on commit
//
// Capabilities:
// - Deploy frontends on git push
// - Create preview deployments for PRs
// - Manage environment variables
// - Domain and SSL management
// - Deployment rollback
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use reqwest::Client;
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct VercelAdapter {
    client: Client,
    token: String,
    team_id: Option<String>,
    default_project: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VercelDeploymentRequest {
    pub name: String,
    pub git_source: Option<VercelGitSource>,
    pub env: Option<std::collections::HashMap<String, String>>,
    pub build_command: Option<String>,
    pub output_directory: Option<String>,
    pub target: Option<String>, // production, preview
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VercelGitSource {
    #[serde(rename = "type")]
    pub source_type: String, // github, gitlab, bitbucket
    pub repo: String,
    pub ref_: String, // branch or tag
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VercelDeploymentResponse {
    pub id: String,
    pub url: String,
    pub name: String,
    pub state: String, // BUILDING, READY, ERROR, CANCELED
    pub created_at: i64,
    pub ready_state: String,
    pub alias: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VercelProject {
    pub id: String,
    pub name: String,
    pub framework: Option<String>,
    pub live: bool,
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VercelEnvironmentVariable {
    pub key: String,
    pub value: String,
    pub target: Vec<String>, // production, preview, development
    #[serde(rename = "type")]
    pub var_type: String, // plain, secret, system
}

impl VercelAdapter {
    pub fn new(token: String, team_id: Option<String>, default_project: Option<String>) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(120))
            .build()
            .expect("Failed to create HTTP client");

        Self {
            client,
            token,
            team_id,
            default_project,
        }
    }

    /// Get base URL with optional team parameter
    fn base_url(&self) -> String {
        if let Some(team_id) = &self.team_id {
            format!("https://api.vercel.com?teamId={}", team_id)
        } else {
            "https://api.vercel.com".to_string()
        }
    }

    /// Create a new deployment
    pub async fn create_deployment(
        &self,
        request: VercelDeploymentRequest,
    ) -> Result<VercelDeploymentResponse> {
        let url = format!("{}/v13/deployments", self.base_url());

        let response = self.client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await
            .context("Failed to create Vercel deployment")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Vercel API error: {}", error_text);
        }

        let deployment: VercelDeploymentResponse = response.json().await?;
        Ok(deployment)
    }

    /// Get deployment status
    pub async fn get_deployment(&self, deployment_id: &str) -> Result<VercelDeploymentResponse> {
        let url = format!("{}/v13/deployments/{}", self.base_url(), deployment_id);

        let response = self.client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .send()
            .await
            .context("Failed to get Vercel deployment")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Vercel API error: {}", error_text);
        }

        let deployment: VercelDeploymentResponse = response.json().await?;
        Ok(deployment)
    }

    /// List all projects
    pub async fn list_projects(&self) -> Result<Vec<VercelProject>> {
        let url = format!("{}/v9/projects", self.base_url());

        let response = self.client
            .get(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .send()
            .await
            .context("Failed to list Vercel projects")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Vercel API error: {}", error_text);
        }

        let projects_response: serde_json::Value = response.json().await?;
        let projects: Vec<VercelProject> = serde_json::from_value(
            projects_response["projects"].clone()
        )?;

        Ok(projects)
    }

    /// Add environment variable to project
    pub async fn add_env_variable(
        &self,
        project_id: &str,
        env_var: VercelEnvironmentVariable,
    ) -> Result<()> {
        let url = format!("{}/v10/projects/{}/env", self.base_url(), project_id);

        let response = self.client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .header("Content-Type", "application/json")
            .json(&env_var)
            .send()
            .await
            .context("Failed to add environment variable")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Vercel env var error: {}", error_text);
        }

        Ok(())
    }

    /// Deploy from git commit (triggered by webhook)
    pub async fn deploy_from_commit(
        &self,
        repo: &str,
        branch: &str,
        commit_sha: &str,
    ) -> Result<VercelDeploymentResponse> {
        let project_name = self.default_project
            .as_ref()
            .context("No default project configured")?;

        let request = VercelDeploymentRequest {
            name: project_name.clone(),
            git_source: Some(VercelGitSource {
                source_type: "github".to_string(),
                repo: repo.to_string(),
                ref_: commit_sha.to_string(),
            }),
            env: None,
            build_command: None,
            output_directory: None,
            target: Some(if branch == "main" || branch == "master" {
                "production".to_string()
            } else {
                "preview".to_string()
            }),
        };

        self.create_deployment(request).await
    }

    /// Rollback to previous deployment
    pub async fn rollback_deployment(
        &self,
        project_id: &str,
        deployment_id: &str,
    ) -> Result<VercelDeploymentResponse> {
        let url = format!(
            "{}/v13/deployments/{}/promote",
            self.base_url(),
            deployment_id
        );

        let response = self.client
            .post(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "projectId": project_id,
            }))
            .send()
            .await
            .context("Failed to rollback deployment")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Vercel rollback error: {}", error_text);
        }

        let deployment: VercelDeploymentResponse = response.json().await?;
        Ok(deployment)
    }

    /// Cancel a deployment
    pub async fn cancel_deployment(&self, deployment_id: &str) -> Result<()> {
        let url = format!("{}/v12/deployments/{}/cancel", self.base_url(), deployment_id);

        let response = self.client
            .patch(&url)
            .header("Authorization", format!("Bearer {}", self.token))
            .send()
            .await
            .context("Failed to cancel deployment")?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Vercel cancel error: {}", error_text);
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vercel_adapter_creation() {
        let adapter = VercelAdapter::new(
            "test_token".to_string(),
            Some("test_team".to_string()),
            Some("ctas-frontend".to_string()),
        );
        assert_eq!(adapter.token, "test_token");
    }
}
