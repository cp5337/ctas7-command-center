use serde::{Deserialize, Serialize};
use anyhow::Result;

/// Neural Mux Query Client
/// Discovers services, routes, and system topology
pub struct NeuralMuxClient {
    base_url: String,
    client: reqwest::Client,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceInfo {
    pub id: String,
    pub name: String,
    pub port: u16,
    pub status: String,
    pub health: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemTopology {
    pub services: Vec<ServiceInfo>,
    pub total_services: usize,
    pub healthy_services: usize,
    pub timestamp: String,
}

impl NeuralMuxClient {
    pub fn new() -> Self {
        Self {
            base_url: "http://localhost:18100".to_string(),
            client: reqwest::Client::new(),
        }
    }
    
    /// Query Neural Mux for system status
    pub async fn get_system_status(&self) -> Result<SystemTopology> {
        let response = self
            .client
            .get(format!("{}/status", self.base_url))
            .send()
            .await?;
        
        let topology: SystemTopology = response.json().await?;
        Ok(topology)
    }
    
    /// Query specific service info
    pub async fn get_service(&self, service_id: &str) -> Result<ServiceInfo> {
        let response = self
            .client
            .get(format!("{}/services/{}", self.base_url, service_id))
            .send()
            .await?;
        
        let service: ServiceInfo = response.json().await?;
        Ok(service)
    }
    
    /// Check if Neural Mux is reachable
    pub async fn is_connected(&self) -> bool {
        self.client
            .get(format!("{}/health", self.base_url))
            .send()
            .await
            .is_ok()
    }
}




