//! Neural Mux Client
//! 
//! Communicates with Neural Mux for intelligent code generation

use anyhow::Result;
use serde::{Deserialize, Serialize};
use reqwest::Client;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReactComponentAnalysis {
    pub data_models: Vec<ComponentDataModel>,
    pub views: Vec<ComponentView>,
    pub services: Vec<ComponentService>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentDataModel {
    pub name: String,
    pub fields: Vec<ComponentField>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentField {
    pub name: String,
    pub type_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentView {
    pub name: String,
    pub subcomponents: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentService {
    pub name: String,
    pub methods: Vec<String>,
}

pub struct NeuralMuxClient {
    base_url: String,
    client: Client,
}

impl NeuralMuxClient {
    pub fn new() -> Self {
        Self {
            base_url: "http://localhost:18113".to_string(),
            client: Client::new(),
        }
    }

    pub async fn analyze_react_component(&self, source_code: &str) -> Result<ReactComponentAnalysis> {
        let url = format!("{}/phi/analyze", self.base_url);
        
        let payload = serde_json::json!({
            "prompt": format!(r#"Analyze this React/TypeScript component and extract:
1. Data models (TypeScript interfaces)
2. View hierarchy
3. Service methods (API calls, state management)

Return as JSON.

Component:
```
{}
```
"#, source_code),
            "max_tokens": 2000
        });

        let response = self.client.post(&url)
            .json(&payload)
            .send()
            .await?;

        let response_text = response.text().await?;
        
        // Parse Phi response as ReactComponentAnalysis
        let analysis: ReactComponentAnalysis = serde_json::from_str(&response_text)
            .unwrap_or(ReactComponentAnalysis {
                data_models: Vec::new(),
                views: Vec::new(),
                services: Vec::new(),
            });

        Ok(analysis)
    }
}
"#



