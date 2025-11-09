// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CTAS-7 PhD QA gRPC Service
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Embedded in every Docker container
// Invoked optionally via gRPC by Smart Crate Orchestrator
//
// Port: 50099 (default)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

use tonic::{transport::Server, Request, Response, Status};
use std::process::Command;
use std::path::PathBuf;

pub mod qa {
    tonic::include_proto!("ctas.qa");
}

use qa::qa_service_server::{QaService, QaServiceServer};
use qa::{
    QaInvokeRequest, QaInvokeResponse, QaStatusRequest, QaStatusResponse,
    QaResultsRequest, QaResultsResponse,
};

#[derive(Debug, Default)]
pub struct QaServiceImpl {}

#[tonic::async_trait]
impl QaService for QaServiceImpl {
    /// Invoke PhD QA analysis
    async fn invoke_qa(
        &self,
        request: Request<QaInvokeRequest>,
    ) -> Result<Response<QaInvokeResponse>, Status> {
        let req = request.into_inner();

        println!("📊 QA Invocation Requested:");
        println!("   Service: {}", req.service_name);
        println!("   Crate: {}", req.crate_path);
        println!("   Full Suite: {}", req.full_suite);

        // Run PhD QA
        let result = run_phd_qa(&req.crate_path, req.full_suite).await
            .map_err(|e| Status::internal(format!("PhD QA failed: {}", e)))?;

        Ok(Response::new(QaInvokeResponse {
            success: result.success,
            results_path: result.results_path,
            summary: result.summary,
            errors: result.errors,
            warnings: result.warnings,
        }))
    }

    /// Get QA status
    async fn get_status(
        &self,
        _request: Request<QaStatusRequest>,
    ) -> Result<Response<QaStatusResponse>, Status> {
        // Check if QA tools are available
        let clippy_available = Command::new("cargo")
            .args(&["clippy", "--version"])
            .output()
            .is_ok();

        let geiger_available = Command::new("cargo-geiger")
            .args(&["--version"])
            .output()
            .is_ok();

        Ok(Response::new(QaStatusResponse {
            qa_enabled: std::env::var("QA_ENABLED").unwrap_or("true".to_string()) == "true",
            tools_installed: clippy_available && geiger_available,
            last_run: "Never".to_string(), // TODO: Track last run
            version: env!("CARGO_PKG_VERSION").to_string(),
        }))
    }

    /// Get QA results
    async fn get_results(
        &self,
        request: Request<QaResultsRequest>,
    ) -> Result<Response<QaResultsResponse>, Status> {
        let req = request.into_inner();
        let results_path = PathBuf::from("/var/ctas/qa-results")
            .join(&req.service_name);

        if !results_path.exists() {
            return Err(Status::not_found("No QA results found"));
        }

        // Read results (simplified)
        let summary = std::fs::read_to_string(results_path.join("summary.txt"))
            .unwrap_or("No summary available".to_string());

        Ok(Response::new(QaResultsResponse {
            service_name: req.service_name,
            results: summary,
            timestamp: chrono::Utc::now().to_rfc3339(),
        }))
    }
}

#[derive(Debug)]
struct QaResult {
    success: bool,
    results_path: String,
    summary: String,
    errors: i32,
    warnings: i32,
}

async fn run_phd_qa(crate_path: &str, full_suite: bool) -> Result<QaResult, Box<dyn std::error::Error>> {
    let results_dir = PathBuf::from("/var/ctas/qa-results");
    std::fs::create_dir_all(&results_dir)?;

    // Run Clippy
    let clippy_output = Command::new("cargo")
        .args(&["clippy", "--", "-D", "warnings"])
        .current_dir(crate_path)
        .output()?;

    let mut errors = 0;
    let mut warnings = 0;

    if !clippy_output.status.success() {
        errors += 1;
    }

    if full_suite {
        // Run Geiger (unsafe code detection)
        let _geiger_output = Command::new("cargo-geiger")
            .current_dir(crate_path)
            .output()?;

        // Run cargo-audit (security)
        let audit_output = Command::new("cargo")
            .args(&["audit"])
            .current_dir(crate_path)
            .output()?;

        if !audit_output.status.success() {
            warnings += 1;
        }

        // Run tests with coverage
        let _coverage_output = Command::new("cargo")
            .args(&["tarpaulin", "--out", "Json"])
            .current_dir(crate_path)
            .output()?;
    }

    let summary = format!(
        "PhD QA Complete: {} errors, {} warnings",
        errors, warnings
    );

    Ok(QaResult {
        success: errors == 0,
        results_path: results_dir.to_string_lossy().to_string(),
        summary,
        errors,
        warnings,
    })
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let port = std::env::var("QA_GRPC_PORT")
        .unwrap_or("50099".to_string())
        .parse::<u16>()?;

    let addr = format!("0.0.0.0:{}", port).parse()?;
    let qa_service = QaServiceImpl::default();

    println!("🔬 CTAS-7 PhD QA gRPC Service");
    println!("   Port: {}", port);
    println!("   Status: Ready");
    println!("   Mode: Optional Invocation");

    Server::builder()
        .add_service(QaServiceServer::new(qa_service))
        .serve(addr)
        .await?;

    Ok(())
}
