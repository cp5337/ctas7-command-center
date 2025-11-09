// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CTAS-7 Statistical Output Reporter
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Embedded in every container
// Reports QA metrics, performance stats to Neural Mux CDN
//
// Outputs:
// - Neural Mux Smart CDN (primary)
// - SurrealDB (persistent storage)
// - Linear (issue tracking)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use reqwest::Client;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceStats {
    pub service_name: String,
    pub timestamp: u64,
    pub metrics: StatsMetrics,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StatsMetrics {
    // QA Metrics
    pub qa_last_run: Option<u64>,
    pub qa_pass_rate: f64,
    pub qa_errors: i32,
    pub qa_warnings: i32,
    pub qa_critical: i32,

    // Performance Metrics
    pub uptime_seconds: u64,
    pub requests_per_second: f64,
    pub avg_latency_ms: f64,
    pub p95_latency_ms: f64,
    pub p99_latency_ms: f64,

    // Security Metrics
    pub vulnerabilities: i32,
    pub unsafe_blocks: i32,
    pub audit_score: f64,

    // Coverage Metrics
    pub test_coverage: f64,
    pub lines_of_code: i32,
    pub clone_count: i32,
}

pub struct StatsReporter {
    client: Client,
    service_name: String,
    cdn_endpoint: String,
    surrealdb_endpoint: String,
    linear_api_key: Option<String>,
}

impl StatsReporter {
    pub fn new(service_name: String) -> Self {
        let cdn_endpoint = std::env::var("NEURAL_MUX_CDN_ENDPOINT")
            .unwrap_or("http://neural-mux-cdn:18100".to_string());

        let surrealdb_endpoint = std::env::var("SURREALDB_ENDPOINT")
            .unwrap_or("http://surrealdb:8000".to_string());

        let linear_api_key = std::env::var("LINEAR_API_KEY").ok();

        Self {
            client: Client::new(),
            service_name,
            cdn_endpoint,
            surrealdb_endpoint,
            linear_api_key,
        }
    }

    /// Report stats to Neural Mux Smart CDN
    pub async fn report_to_cdn(&self, stats: &ServiceStats) -> Result<(), Box<dyn std::error::Error>> {
        let url = format!("{}/api/stats/report", self.cdn_endpoint);

        let response = self.client
            .post(&url)
            .json(stats)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            eprintln!("CDN report failed: {}", error_text);
        } else {
            println!("✅ Stats reported to Neural Mux CDN");
        }

        Ok(())
    }

    /// Report stats to SurrealDB (persistent storage)
    pub async fn report_to_surrealdb(&self, stats: &ServiceStats) -> Result<(), Box<dyn std::error::Error>> {
        let url = format!("{}/sql", self.surrealdb_endpoint);

        let query = format!(
            "CREATE service_stats SET \
             service = '{}', \
             timestamp = {}, \
             qa_pass_rate = {}, \
             qa_errors = {}, \
             qa_warnings = {}, \
             uptime = {}, \
             requests_per_second = {}, \
             avg_latency_ms = {}, \
             test_coverage = {}, \
             vulnerabilities = {}",
            stats.service_name,
            stats.timestamp,
            stats.metrics.qa_pass_rate,
            stats.metrics.qa_errors,
            stats.metrics.qa_warnings,
            stats.metrics.uptime_seconds,
            stats.metrics.requests_per_second,
            stats.metrics.avg_latency_ms,
            stats.metrics.test_coverage,
            stats.metrics.vulnerabilities
        );

        let response = self.client
            .post(&url)
            .header("Accept", "application/json")
            .header("NS", "ctas")
            .header("DB", "metrics")
            .body(query)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            eprintln!("SurrealDB report failed: {}", error_text);
        } else {
            println!("✅ Stats stored in SurrealDB");
        }

        Ok(())
    }

    /// Report critical issues to Linear
    pub async fn report_to_linear(&self, stats: &ServiceStats) -> Result<(), Box<dyn std::error::Error>> {
        // Only create Linear issues for critical problems
        if stats.metrics.qa_critical > 0 || stats.metrics.vulnerabilities > 0 {
            if let Some(api_key) = &self.linear_api_key {
                let url = "https://api.linear.app/graphql";

                let title = format!(
                    "Critical QA Issues in {}",
                    stats.service_name
                );

                let description = format!(
                    "**Automated QA Report**\n\n\
                     - Critical Issues: {}\n\
                     - Vulnerabilities: {}\n\
                     - QA Pass Rate: {:.1}%\n\
                     - Test Coverage: {:.1}%\n\n\
                     Service requires immediate attention.",
                    stats.metrics.qa_critical,
                    stats.metrics.vulnerabilities,
                    stats.metrics.qa_pass_rate * 100.0,
                    stats.metrics.test_coverage * 100.0
                );

                let query = serde_json::json!({
                    "query": format!(
                        "mutation {{ issueCreate(input: {{ \
                         teamId: \"COG\", \
                         title: \"{}\", \
                         description: \"{}\", \
                         priority: 1 \
                        }}) {{ issue {{ id identifier }} }} }}",
                        title.replace("\"", "\\\""),
                        description.replace("\n", "\\n").replace("\"", "\\\"")
                    )
                });

                let response = self.client
                    .post(url)
                    .header("Authorization", api_key)
                    .header("Content-Type", "application/json")
                    .json(&query)
                    .send()
                    .await?;

                if response.status().is_success() {
                    println!("✅ Critical issue created in Linear");
                } else {
                    let error_text = response.text().await?;
                    eprintln!("Linear report failed: {}", error_text);
                }
            }
        }

        Ok(())
    }

    /// Report to all configured outputs
    pub async fn report_all(&self, stats: &ServiceStats) -> Result<(), Box<dyn std::error::Error>> {
        let outputs = std::env::var("STATS_OUTPUTS")
            .unwrap_or("cdn,surrealdb".to_string());

        if outputs.contains("cdn") {
            self.report_to_cdn(stats).await.ok();
        }

        if outputs.contains("surrealdb") {
            self.report_to_surrealdb(stats).await.ok();
        }

        if outputs.contains("linear") {
            self.report_to_linear(stats).await.ok();
        }

        Ok(())
    }

    /// Collect current service stats
    pub fn collect_stats(&self) -> ServiceStats {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        // Read QA results from /var/ctas/qa-results
        let qa_metrics = self.read_qa_results();

        // Collect performance metrics (would integrate with actual metrics)
        let performance = self.collect_performance_metrics();

        ServiceStats {
            service_name: self.service_name.clone(),
            timestamp,
            metrics: StatsMetrics {
                qa_last_run: qa_metrics.last_run,
                qa_pass_rate: qa_metrics.pass_rate,
                qa_errors: qa_metrics.errors,
                qa_warnings: qa_metrics.warnings,
                qa_critical: qa_metrics.critical,
                uptime_seconds: performance.uptime,
                requests_per_second: performance.rps,
                avg_latency_ms: performance.avg_latency,
                p95_latency_ms: performance.p95_latency,
                p99_latency_ms: performance.p99_latency,
                vulnerabilities: qa_metrics.vulnerabilities,
                unsafe_blocks: qa_metrics.unsafe_blocks,
                audit_score: qa_metrics.audit_score,
                test_coverage: qa_metrics.coverage,
                lines_of_code: qa_metrics.loc,
                clone_count: qa_metrics.clones,
            },
        }
    }

    fn read_qa_results(&self) -> QaMetrics {
        // Read from /var/ctas/qa-results/latest.json
        let qa_file = std::path::Path::new("/var/ctas/qa-results/latest.json");

        if let Ok(contents) = std::fs::read_to_string(qa_file) {
            if let Ok(metrics) = serde_json::from_str(&contents) {
                return metrics;
            }
        }

        // Default empty metrics
        QaMetrics::default()
    }

    fn collect_performance_metrics(&self) -> PerformanceMetrics {
        // Placeholder - would integrate with actual metrics collection
        PerformanceMetrics {
            uptime: 0,
            rps: 0.0,
            avg_latency: 0.0,
            p95_latency: 0.0,
            p99_latency: 0.0,
        }
    }
}

#[derive(Debug, Default, Serialize, Deserialize)]
struct QaMetrics {
    last_run: Option<u64>,
    pass_rate: f64,
    errors: i32,
    warnings: i32,
    critical: i32,
    vulnerabilities: i32,
    unsafe_blocks: i32,
    audit_score: f64,
    coverage: f64,
    loc: i32,
    clones: i32,
}

#[derive(Debug, Default)]
struct PerformanceMetrics {
    uptime: u64,
    rps: f64,
    avg_latency: f64,
    p95_latency: f64,
    p99_latency: f64,
}

/// Background stats reporter (runs in separate thread)
pub async fn start_stats_reporter(service_name: String) {
    let reporter = StatsReporter::new(service_name);
    let interval = std::env::var("STATS_REPORT_INTERVAL")
        .unwrap_or("60".to_string())
        .parse::<u64>()
        .unwrap_or(60);

    loop {
        tokio::time::sleep(tokio::time::Duration::from_secs(interval)).await;

        let stats = reporter.collect_stats();
        if let Err(e) = reporter.report_all(&stats).await {
            eprintln!("Stats reporting error: {}", e);
        }
    }
}
