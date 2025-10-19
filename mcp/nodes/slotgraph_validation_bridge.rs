// CTAS-7 SlotGraph Validation Bridge
// Validates SlotGraph operations and coordinates with SurrealDB telemetry

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::sync::{broadcast, mpsc};
use tokio::time::{interval, Duration};

use super::surreal_telemetry::{SurrealEvent, SurrealTelemetryCore, TelemetrySnapshot};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlotGraphNode {
    pub id: String,
    pub node_type: String, // "ground_station", "satellite", "trade_order", "threat_node"
    pub world_context: String,
    pub capabilities: HashMap<String, serde_json::Value>,
    pub time_series_data: Vec<TimeSeriesSlot>,
    pub status: String, // "active", "inactive", "degraded"
    pub last_updated: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlotGraphEdge {
    pub id: String,
    pub source_node: String,
    pub target_node: String,
    pub edge_type: String, // "network_link", "trade_route", "weather_impact", "attack_vector"
    pub weight: f64,
    pub metadata: HashMap<String, serde_json::Value>,
    pub world_context: String,
    pub is_bidirectional: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeSeriesSlot {
    pub slot_id: String,
    pub timestamp: u64,
    pub value: f64,
    pub metric_type: String, // "latency", "bandwidth", "threat_level", "trade_volume"
    pub confidence_score: f64, // QA5 confidence rating
    pub source_reliability: String, // QA5 source reliability (A-F)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub validation_id: String,
    pub world_type: String,
    pub operation_type: String, // "node_create", "edge_update", "slot_insert", "graph_query"
    pub is_valid: bool,
    pub validation_errors: Vec<String>,
    pub performance_metrics: HashMap<String, f64>,
    pub qa5_assessment: QA5Assessment,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QA5Assessment {
    pub source_reliability: String, // A-F scale
    pub information_credibility: u8, // 1-6 scale
    pub assessment_reason: String,
    pub confidence_score: f64,
}

pub struct SlotGraphValidationBridge {
    // Core components
    telemetry_core: Arc<Mutex<SurrealTelemetryCore>>,
    validation_sender: broadcast::Sender<ValidationResult>,

    // SlotGraph state tracking
    active_nodes: Arc<Mutex<HashMap<String, SlotGraphNode>>>,
    active_edges: Arc<Mutex<HashMap<String, SlotGraphEdge>>>,
    time_series_slots: Arc<Mutex<HashMap<String, Vec<TimeSeriesSlot>>>>,

    // Validation state
    validation_rules: Arc<Mutex<HashMap<String, ValidationRule>>>,
    validation_history: Arc<Mutex<Vec<ValidationResult>>>,

    // Performance tracking
    validation_metrics: Arc<Mutex<HashMap<String, f64>>>,
    world_performance: Arc<Mutex<HashMap<String, WorldPerformanceMetrics>>>,
}

#[derive(Debug, Clone)]
pub struct ValidationRule {
    pub rule_id: String,
    pub world_types: Vec<String>,
    pub operation_types: Vec<String>,
    pub validation_function: String, // In production, this would be a function pointer
    pub is_active: bool,
    pub priority: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorldPerformanceMetrics {
    pub world_type: String,
    pub avg_validation_time_ms: f64,
    pub success_rate: f64,
    pub total_operations: u64,
    pub failed_operations: u64,
    pub last_update: u64,
}

impl SlotGraphValidationBridge {
    pub fn new(telemetry_core: SurrealTelemetryCore) -> (Self, broadcast::Receiver<ValidationResult>) {
        let (validation_sender, validation_receiver) = broadcast::channel(500);

        let bridge = Self {
            telemetry_core: Arc::new(Mutex::new(telemetry_core)),
            validation_sender,
            active_nodes: Arc::new(Mutex::new(HashMap::new())),
            active_edges: Arc::new(Mutex::new(HashMap::new())),
            time_series_slots: Arc::new(Mutex::new(HashMap::new())),
            validation_rules: Arc::new(Mutex::new(HashMap::new())),
            validation_history: Arc::new(Mutex::new(Vec::new())),
            validation_metrics: Arc::new(Mutex::new(HashMap::new())),
            world_performance: Arc::new(Mutex::new(HashMap::new())),
        };

        bridge.initialize_validation_rules();

        (bridge, validation_receiver)
    }

    // Initialize default validation rules for CTAS-7 worlds
    fn initialize_validation_rules(&self) {
        let mut rules = self.validation_rules.lock().unwrap();

        // Space World validation rules
        rules.insert("space_node_validation".to_string(), ValidationRule {
            rule_id: "space_node_validation".to_string(),
            world_types: vec!["space".to_string()],
            operation_types: vec!["node_create".to_string(), "node_update".to_string()],
            validation_function: "validate_space_node".to_string(),
            is_active: true,
            priority: 1,
        });

        // Network World validation rules
        rules.insert("network_topology_validation".to_string(), ValidationRule {
            rule_id: "network_topology_validation".to_string(),
            world_types: vec!["network".to_string()],
            operation_types: vec!["edge_create".to_string(), "edge_update".to_string()],
            validation_function: "validate_network_topology".to_string(),
            is_active: true,
            priority: 1,
        });

        // Cyber World validation rules
        rules.insert("threat_analysis_validation".to_string(), ValidationRule {
            rule_id: "threat_analysis_validation".to_string(),
            world_types: vec!["cyber".to_string()],
            operation_types: vec!["node_create".to_string(), "edge_create".to_string()],
            validation_function: "validate_threat_analysis".to_string(),
            is_active: true,
            priority: 2,
        });

        // QA5 validation rules (all worlds)
        rules.insert("qa5_source_validation".to_string(), ValidationRule {
            rule_id: "qa5_source_validation".to_string(),
            world_types: vec!["space".to_string(), "geographical".to_string(), "cyber".to_string(), "maritime".to_string(), "network".to_string()],
            operation_types: vec!["slot_insert".to_string(), "slot_update".to_string()],
            validation_function: "validate_qa5_source".to_string(),
            is_active: true,
            priority: 3,
        });

        println!("[SLOTGRAPH_BRIDGE] Initialized {} validation rules", rules.len());
    }

    // Validate SlotGraph node operations
    pub async fn validate_node_operation(
        &self,
        node: &SlotGraphNode,
        operation: &str,
    ) -> Result<ValidationResult, Box<dyn std::error::Error>> {
        let start_time = SystemTime::now();
        let validation_id = format!("val_{}_{}", node.world_context,
            start_time.duration_since(UNIX_EPOCH)?.as_millis());

        println!("[SLOTGRAPH_BRIDGE] Validating {} operation for node {} in world {}",
            operation, node.id, node.world_context);

        let mut validation_errors = Vec::new();
        let mut performance_metrics = HashMap::new();

        // Apply validation rules
        let validation_rules = self.validation_rules.lock().unwrap();
        for rule in validation_rules.values() {
            if rule.is_active &&
               rule.world_types.contains(&node.world_context) &&
               rule.operation_types.contains(&operation.to_string()) {

                let rule_result = self.apply_validation_rule(rule, node, operation).await?;
                if !rule_result.is_empty() {
                    validation_errors.extend(rule_result);
                }
            }
        }

        // QA5 Assessment
        let qa5_assessment = self.assess_qa5_quality(node, operation).await?;

        // Performance metrics
        let validation_time = start_time.elapsed()?.as_millis() as f64;
        performance_metrics.insert("validation_time_ms".to_string(), validation_time);
        performance_metrics.insert("node_capability_count".to_string(), node.capabilities.len() as f64);
        performance_metrics.insert("time_series_slots".to_string(), node.time_series_data.len() as f64);

        let is_valid = validation_errors.is_empty() && qa5_assessment.confidence_score >= 0.7;

        let result = ValidationResult {
            validation_id: validation_id.clone(),
            world_type: node.world_context.clone(),
            operation_type: operation.to_string(),
            is_valid,
            validation_errors,
            performance_metrics: performance_metrics.clone(),
            qa5_assessment,
            timestamp: start_time.duration_since(UNIX_EPOCH)?.as_secs(),
        };

        // Update performance tracking
        self.update_performance_metrics(&node.world_context, &result).await?;

        // Send to validation event bus
        if let Err(_) = self.validation_sender.send(result.clone()) {
            // No active receivers
        }

        // Emit SurrealDB telemetry event
        self.emit_validation_telemetry(&result).await?;

        // Store in validation history
        {
            let mut history = self.validation_history.lock().unwrap();
            history.push(result.clone());
            if history.len() > 1000 {
                history.drain(0..history.len() - 1000); // Keep last 1000 validations
            }
        }

        println!("[SLOTGRAPH_BRIDGE] Validation {} complete: {} (errors: {})",
            validation_id, if is_valid { "PASS" } else { "FAIL" }, result.validation_errors.len());

        Ok(result)
    }

    // Apply specific validation rule
    async fn apply_validation_rule(
        &self,
        rule: &ValidationRule,
        node: &SlotGraphNode,
        operation: &str,
    ) -> Result<Vec<String>, Box<dyn std::error::Error>> {
        let mut errors = Vec::new();

        match rule.validation_function.as_str() {
            "validate_space_node" => {
                // Space-specific validations
                if !node.capabilities.contains_key("orbital_period") {
                    errors.push("Space nodes must have orbital_period capability".to_string());
                }
                if !node.capabilities.contains_key("altitude_km") {
                    errors.push("Space nodes must have altitude_km capability".to_string());
                }
                if node.time_series_data.iter().any(|slot| slot.metric_type == "latency" && slot.value > 1000.0) {
                    errors.push("Space node latency exceeds acceptable threshold (1000ms)".to_string());
                }
            }
            "validate_network_topology" => {
                // Network topology validations
                if !node.capabilities.contains_key("bandwidth_mbps") {
                    errors.push("Network nodes must have bandwidth_mbps capability".to_string());
                }
                if node.status == "active" && node.time_series_data.is_empty() {
                    errors.push("Active network nodes must have time series data".to_string());
                }
            }
            "validate_threat_analysis" => {
                // Cyber threat validations
                if !node.capabilities.contains_key("threat_level") {
                    errors.push("Cyber nodes must have threat_level capability".to_string());
                }
                if let Some(threat_level) = node.capabilities.get("threat_level") {
                    if let Some(level) = threat_level.as_f64() {
                        if level > 0.8 && operation == "node_create" {
                            errors.push("High threat level nodes require additional authorization".to_string());
                        }
                    }
                }
            }
            "validate_qa5_source" => {
                // QA5 source reliability validations
                for slot in &node.time_series_data {
                    if slot.confidence_score < 0.5 {
                        errors.push(format!("Time series slot {} has low confidence score: {}",
                            slot.slot_id, slot.confidence_score));
                    }
                    if matches!(slot.source_reliability.as_str(), "E" | "F") {
                        errors.push(format!("Time series slot {} has unreliable source: {}",
                            slot.slot_id, slot.source_reliability));
                    }
                }
            }
            _ => {
                // Unknown validation function
                errors.push(format!("Unknown validation function: {}", rule.validation_function));
            }
        }

        Ok(errors)
    }

    // Assess QA5 quality metrics
    async fn assess_qa5_quality(
        &self,
        node: &SlotGraphNode,
        operation: &str,
    ) -> Result<QA5Assessment, Box<dyn std::error::Error>> {
        // Calculate overall confidence based on time series data
        let mut total_confidence = 0.0;
        let mut reliability_scores = Vec::new();

        for slot in &node.time_series_data {
            total_confidence += slot.confidence_score;

            let reliability_score = match slot.source_reliability.as_str() {
                "A" => 5.0,
                "B" => 4.0,
                "C" => 3.0,
                "D" => 2.0,
                "E" => 1.0,
                "F" => 0.0,
                _ => 2.5, // Default
            };
            reliability_scores.push(reliability_score);
        }

        let avg_confidence = if !node.time_series_data.is_empty() {
            total_confidence / node.time_series_data.len() as f64
        } else {
            0.5 // Default confidence for nodes without time series data
        };

        let avg_reliability_score = if !reliability_scores.is_empty() {
            reliability_scores.iter().sum::<f64>() / reliability_scores.len() as f64
        } else {
            3.0 // Default reliability
        };

        // Determine overall source reliability
        let source_reliability = match avg_reliability_score {
            x if x >= 4.5 => "A",
            x if x >= 3.5 => "B",
            x if x >= 2.5 => "C",
            x if x >= 1.5 => "D",
            x if x >= 0.5 => "E",
            _ => "F",
        }.to_string();

        // Determine information credibility (1-6 scale)
        let information_credibility = match avg_confidence {
            x if x >= 0.9 => 6,
            x if x >= 0.8 => 5,
            x if x >= 0.7 => 4,
            x if x >= 0.6 => 3,
            x if x >= 0.5 => 2,
            _ => 1,
        };

        let assessment_reason = format!(
            "QA5 assessment for {} operation: {} time series slots, avg confidence {:.2}, avg reliability {:.1}",
            operation, node.time_series_data.len(), avg_confidence, avg_reliability_score
        );

        Ok(QA5Assessment {
            source_reliability,
            information_credibility,
            assessment_reason,
            confidence_score: avg_confidence,
        })
    }

    // Update performance metrics for world
    async fn update_performance_metrics(
        &self,
        world_type: &str,
        result: &ValidationResult,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let mut world_performance = self.world_performance.lock().unwrap();

        let metrics = world_performance.entry(world_type.to_string())
            .or_insert_with(|| WorldPerformanceMetrics {
                world_type: world_type.to_string(),
                avg_validation_time_ms: 0.0,
                success_rate: 0.0,
                total_operations: 0,
                failed_operations: 0,
                last_update: 0,
            });

        metrics.total_operations += 1;
        if !result.is_valid {
            metrics.failed_operations += 1;
        }

        metrics.success_rate = (metrics.total_operations - metrics.failed_operations) as f64 / metrics.total_operations as f64;

        if let Some(validation_time) = result.performance_metrics.get("validation_time_ms") {
            metrics.avg_validation_time_ms = (metrics.avg_validation_time_ms * (metrics.total_operations - 1) as f64 + validation_time) / metrics.total_operations as f64;
        }

        metrics.last_update = SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs();

        Ok(())
    }

    // Emit telemetry event to SurrealDB core
    async fn emit_validation_telemetry(
        &self,
        result: &ValidationResult,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let mut metadata = HashMap::new();
        metadata.insert("validation_id".to_string(), serde_json::Value::String(result.validation_id.clone()));
        metadata.insert("is_valid".to_string(), serde_json::Value::Bool(result.is_valid));
        metadata.insert("error_count".to_string(), serde_json::Value::Number(result.validation_errors.len().into()));
        metadata.insert("qa5_source_reliability".to_string(), serde_json::Value::String(result.qa5_assessment.source_reliability.clone()));
        metadata.insert("qa5_information_credibility".to_string(), serde_json::Value::Number(result.qa5_assessment.information_credibility.into()));
        metadata.insert("qa5_confidence_score".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(result.qa5_assessment.confidence_score).unwrap_or_default()));

        for (key, value) in &result.performance_metrics {
            metadata.insert(format!("perf_{}", key), serde_json::Value::Number(serde_json::Number::from_f64(*value).unwrap_or_default()));
        }

        let surreal_event = SurrealEvent {
            world_type: result.world_type.clone(),
            event_type: "validation_completed".to_string(),
            table_name: "slot_graph_validations".to_string(),
            record_id: result.validation_id.clone(),
            operation: "CREATE".to_string(),
            affected_count: 1,
            timestamp: result.timestamp,
            metadata,
        };

        let telemetry_core = self.telemetry_core.lock().unwrap();
        telemetry_core.emit_update(surreal_event)?;

        Ok(())
    }

    // Start continuous validation monitoring
    pub async fn start_monitoring(&self) -> Result<(), Box<dyn std::error::Error>> {
        println!("[SLOTGRAPH_BRIDGE] Starting continuous SlotGraph validation monitoring...");

        // Simulate periodic validation operations
        let active_nodes = Arc::clone(&self.active_nodes);
        let bridge_clone = self.clone();

        tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(3));

            loop {
                interval.tick().await;

                // Generate mock SlotGraph operations for validation
                let mock_operations = bridge_clone.generate_mock_operations().await;

                for (node, operation) in mock_operations {
                    if let Err(e) = bridge_clone.validate_node_operation(&node, &operation).await {
                        eprintln!("[SLOTGRAPH_BRIDGE] Validation error: {}", e);
                    }
                }
            }
        });

        Ok(())
    }

    // Generate mock SlotGraph operations for testing
    async fn generate_mock_operations(&self) -> Vec<(SlotGraphNode, String)> {
        let mut operations = Vec::new();
        let worlds = vec!["space", "geographical", "cyber", "maritime", "network"];

        for (i, world) in worlds.iter().enumerate() {
            let node = SlotGraphNode {
                id: format!("node_{}_{}", world, i),
                node_type: match *world {
                    "space" => "satellite",
                    "geographical" => "ground_station",
                    "cyber" => "threat_node",
                    "maritime" => "ship",
                    "network" => "hft_node",
                    _ => "unknown",
                }.to_string(),
                world_context: world.to_string(),
                capabilities: {
                    let mut caps = HashMap::new();
                    match *world {
                        "space" => {
                            caps.insert("orbital_period".to_string(), serde_json::Value::Number(90.into()));
                            caps.insert("altitude_km".to_string(), serde_json::Value::Number(400.into()));
                        }
                        "network" => {
                            caps.insert("bandwidth_mbps".to_string(), serde_json::Value::Number(1000.into()));
                        }
                        "cyber" => {
                            caps.insert("threat_level".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(0.3).unwrap()));
                        }
                        _ => {}
                    }
                    caps
                },
                time_series_data: vec![
                    TimeSeriesSlot {
                        slot_id: format!("slot_{}_{}", world, i),
                        timestamp: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
                        value: 25.0 + (i as f64 * 5.0),
                        metric_type: "latency".to_string(),
                        confidence_score: 0.8 + (i as f64 * 0.05),
                        source_reliability: match i % 6 {
                            0 => "A",
                            1 => "B",
                            2 => "C",
                            3 => "D",
                            4 => "E",
                            _ => "F",
                        }.to_string(),
                    }
                ],
                status: "active".to_string(),
                last_updated: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
            };

            let operation = match i % 3 {
                0 => "node_create",
                1 => "node_update",
                _ => "slot_insert",
            }.to_string();

            operations.push((node, operation));
        }

        operations
    }

    // Get validation statistics
    pub fn get_validation_stats(&self) -> HashMap<String, serde_json::Value> {
        let mut stats = HashMap::new();

        let history = self.validation_history.lock().unwrap();
        let world_performance = self.world_performance.lock().unwrap();
        let validation_rules = self.validation_rules.lock().unwrap();

        stats.insert("total_validations".to_string(), serde_json::Value::Number(history.len().into()));
        stats.insert("active_rules".to_string(), serde_json::Value::Number(validation_rules.len().into()));

        let successful_validations = history.iter().filter(|v| v.is_valid).count();
        let success_rate = if !history.is_empty() {
            successful_validations as f64 / history.len() as f64
        } else {
            0.0
        };
        stats.insert("overall_success_rate".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(success_rate).unwrap_or_default()));

        let world_stats: HashMap<String, serde_json::Value> = world_performance.iter()
            .map(|(world, metrics)| (world.clone(), serde_json::to_value(metrics).unwrap_or_default()))
            .collect();
        stats.insert("world_performance".to_string(), serde_json::Value::Object(serde_json::Map::from_iter(world_stats)));

        stats
    }
}

// Implement Clone for SlotGraphValidationBridge
impl Clone for SlotGraphValidationBridge {
    fn clone(&self) -> Self {
        Self {
            telemetry_core: Arc::clone(&self.telemetry_core),
            validation_sender: self.validation_sender.clone(),
            active_nodes: Arc::clone(&self.active_nodes),
            active_edges: Arc::clone(&self.active_edges),
            time_series_slots: Arc::clone(&self.time_series_slots),
            validation_rules: Arc::clone(&self.validation_rules),
            validation_history: Arc::clone(&self.validation_history),
            validation_metrics: Arc::clone(&self.validation_metrics),
            world_performance: Arc::clone(&self.world_performance),
        }
    }
}

// CLI entry point for testing
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("CTAS-7 SlotGraph Validation Bridge v1.0.0");
    println!("==========================================");

    // Initialize SurrealDB telemetry core
    let (mut telemetry_core, mut dashboard_receiver) = SurrealTelemetryCore::new("ctas7", "hft_network");

    // Register world listeners
    let worlds = vec!["space", "geographical", "cyber", "maritime", "network"];
    for world in &worlds {
        telemetry_core.register_listener(world)?;
    }

    // Initialize validation bridge
    let (validation_bridge, mut validation_receiver) = SlotGraphValidationBridge::new(telemetry_core);

    // Start telemetry streaming
    tokio::spawn(async move {
        while let Some(snapshot) = dashboard_receiver.recv().await {
            println!("📊 SurrealDB Telemetry: {}",
                serde_json::to_string(&snapshot).unwrap_or_default());
        }
    });

    // Start validation monitoring
    tokio::spawn(async move {
        while let Ok(validation_result) = validation_receiver.recv().await {
            println!("✅ Validation Result: {} - {} (QA5: {}/{})",
                validation_result.validation_id,
                if validation_result.is_valid { "PASS" } else { "FAIL" },
                validation_result.qa5_assessment.source_reliability,
                validation_result.qa5_assessment.information_credibility
            );
        }
    });

    // Start continuous validation monitoring
    validation_bridge.start_monitoring().await?;

    // Run for demonstration
    tokio::time::sleep(Duration::from_secs(15)).await;

    // Display final statistics
    let stats = validation_bridge.get_validation_stats();
    println!("\n📈 Validation Statistics:");
    println!("{}", serde_json::to_string_pretty(&stats)?);

    println!("\n✅ SlotGraph Validation Bridge demonstration complete");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_qa5_assessment() {
        let (telemetry_core, _) = SurrealTelemetryCore::new("test", "test_db");
        let (bridge, _) = SlotGraphValidationBridge::new(telemetry_core);

        let node = SlotGraphNode {
            id: "test_node".to_string(),
            node_type: "satellite".to_string(),
            world_context: "space".to_string(),
            capabilities: HashMap::new(),
            time_series_data: vec![
                TimeSeriesSlot {
                    slot_id: "slot_1".to_string(),
                    timestamp: 0,
                    value: 10.0,
                    metric_type: "latency".to_string(),
                    confidence_score: 0.9,
                    source_reliability: "A".to_string(),
                }
            ],
            status: "active".to_string(),
            last_updated: 0,
        };

        let assessment = bridge.assess_qa5_quality(&node, "node_create").await.unwrap();
        assert_eq!(assessment.source_reliability, "A");
        assert_eq!(assessment.information_credibility, 6);
        assert!(assessment.confidence_score >= 0.8);
    }

    #[tokio::test]
    async fn test_node_validation() {
        let (telemetry_core, _) = SurrealTelemetryCore::new("test", "test_db");
        let (bridge, _) = SlotGraphValidationBridge::new(telemetry_core);

        let mut capabilities = HashMap::new();
        capabilities.insert("orbital_period".to_string(), serde_json::Value::Number(90.into()));
        capabilities.insert("altitude_km".to_string(), serde_json::Value::Number(400.into()));

        let node = SlotGraphNode {
            id: "test_space_node".to_string(),
            node_type: "satellite".to_string(),
            world_context: "space".to_string(),
            capabilities,
            time_series_data: vec![],
            status: "active".to_string(),
            last_updated: 0,
        };

        let result = bridge.validate_node_operation(&node, "node_create").await.unwrap();
        assert!(result.is_valid);
        assert_eq!(result.world_type, "space");
    }
}