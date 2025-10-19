#!/usr/bin/env rust-script
//! CTAS-7 Neural Mux iOS Product Scaffold Generator
//! 
//! Generates Tesla/SpaceX/NASA-grade iOS applications with:
//! - Automated Xcode project structure
//! - View/Logic separation (MVC-M architecture)
//! - Embedded Phi-3 CoreML integration
//! - Mathematical validation test suites
//! - Pre-commit quality gate enforcement
//! 
//! Version: 1.0.0
//! Date: October 13, 2025

use anyhow::{Context, Result};
use clap::{Parser, Subcommand};
use colored::*;
use std::path::PathBuf;
use tracing::{info, warn, error};

mod scaffold;
mod validators;
mod templates;
mod neural_mux;
mod swift_gen;
mod quality_gates;

use scaffold::ProductScaffold;
use validators::QualityValidator;

#[derive(Parser)]
#[command(name = "neural-mux-scaffold")]
#[command(author = "CTAS-7 Engineering Team")]
#[command(version = "1.0.0")]
#[command(about = "Neural Mux-powered iOS product scaffold generator", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Generate new iOS product from specification
    Generate {
        /// Path to product specification YAML file
        #[arg(short, long, value_name = "FILE")]
        spec: PathBuf,
        
        /// Output directory for generated project
        #[arg(short, long, value_name = "DIR", default_value = "./CTAS7-iOS")]
        output: PathBuf,
        
        /// Skip quality validation (not recommended)
        #[arg(long)]
        skip_validation: bool,
    },
    
    /// Validate existing iOS project against quality standards
    Validate {
        /// Path to iOS project directory
        #[arg(value_name = "PROJECT")]
        project: PathBuf,
        
        /// Generate detailed validation report
        #[arg(short, long)]
        report: bool,
    },
    
    /// Transition React component to iOS SwiftUI
    Transition {
        /// Path to React component file
        #[arg(short, long, value_name = "FILE")]
        component: PathBuf,
        
        /// Output directory for SwiftUI view
        #[arg(short, long, value_name = "DIR")]
        output: PathBuf,
    },
    
    /// Install quality gate pre-commit hooks
    InstallHooks {
        /// Path to iOS project directory
        #[arg(value_name = "PROJECT")]
        project: PathBuf,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive(tracing::Level::INFO.into()),
        )
        .init();

    let cli = Cli::parse();

    match cli.command {
        Commands::Generate { spec, output, skip_validation } => {
            generate_product(spec, output, skip_validation).await?;
        }
        Commands::Validate { project, report } => {
            validate_project(project, report).await?;
        }
        Commands::Transition { component, output } => {
            transition_component(component, output).await?;
        }
        Commands::InstallHooks { project } => {
            install_hooks(project).await?;
        }
    }

    Ok(())
}

async fn generate_product(spec_path: PathBuf, output_dir: PathBuf, skip_validation: bool) -> Result<()> {
    println!("{}", "🚀 CTAS-7 Neural Mux iOS Product Scaffold Generator".bright_cyan().bold());
    println!();

    // Load product specification
    info!("Loading product specification from {:?}", spec_path);
    let spec_content = std::fs::read_to_string(&spec_path)
        .context("Failed to read product specification")?;
    
    let spec: scaffold::ProductSpec = serde_yaml::from_str(&spec_content)
        .context("Failed to parse product specification")?;

    println!("📋 Product: {}", spec.display_name.bright_green().bold());
    println!("   Bundle ID: {}", spec.bundle_id);
    println!("   Category: {}", spec.category);
    println!("   Target Devices: {}", spec.target_devices.join(", "));
    println!();

    // Create scaffold generator
    let mut generator = ProductScaffold::new(output_dir.clone());

    // Generate project structure
    println!("{}", "⚙️  Generating project structure...".bright_yellow());
    generator.generate(&spec).await
        .context("Failed to generate project structure")?;

    println!("{}", "✅ Project structure generated successfully!".bright_green());
    println!();

    // Validate generated project (unless skipped)
    if !skip_validation {
        println!("{}", "🔍 Validating generated project...".bright_yellow());
        let project_path = output_dir.join(&spec.name);
        
        match validate_project_internal(&project_path, false).await {
            Ok(_) => {
                println!("{}", "✅ All quality gates passed!".bright_green());
            }
            Err(e) => {
                warn!("Quality validation failed: {}", e);
                println!("{}", "⚠️  Warning: Some quality gates failed".bright_yellow());
                println!("   Run 'scaffold validate {}' for details", project_path.display());
            }
        }
        println!();
    }

    // Print next steps
    println!("{}", "📚 Next Steps:".bright_cyan().bold());
    println!("   1. cd {}", output_dir.join(&spec.name).display());
    println!("   2. open {}.xcodeproj", spec.name);
    println!("   3. Implement TODOs in generated files");
    println!("   4. Run tests: xcodebuild test -scheme {}", spec.name);
    println!();
    println!("{}", "📖 Documentation: See README.md in project directory".bright_blue());

    Ok(())
}

async fn validate_project(project_path: PathBuf, generate_report: bool) -> Result<()> {
    validate_project_internal(&project_path, generate_report).await
}

async fn validate_project_internal(project_path: &PathBuf, generate_report: bool) -> Result<()> {
    println!("{}", "🔍 CTAS-7 Quality Validation".bright_cyan().bold());
    println!();

    let validator = QualityValidator::new(project_path.clone());

    // Run all validators
    println!("Running quality checks...");
    let results = validator.validate_all().await?;

    // Print summary
    let total_checks = results.len();
    let passed = results.iter().filter(|r| r.passed).count();
    let failed = total_checks - passed;

    println!();
    println!("{}", "═══════════════════════════════════".bright_blue());
    println!("{}", "Quality Validation Summary".bright_cyan().bold());
    println!("{}", "═══════════════════════════════════".bright_blue());
    println!("Total Checks: {}", total_checks);
    println!("Passed: {}", format!("{}", passed).bright_green());
    println!("Failed: {}", if failed > 0 { 
        format!("{}", failed).bright_red() 
    } else { 
        format!("{}", failed).bright_green() 
    });
    println!();

    // Print failed checks
    if failed > 0 {
        println!("{}", "Failed Checks:".bright_red().bold());
        for result in results.iter().filter(|r| !r.passed) {
            println!("  ❌ {}: {}", result.check_name.bright_red(), result.message);
            if let Some(details) = &result.details {
                for detail in details {
                    println!("     - {}", detail);
                }
            }
        }
        println!();
    }

    // Generate detailed report if requested
    if generate_report {
        let report_path = project_path.join("quality_report.md");
        validator.generate_report(&results, &report_path)?;
        println!("📄 Detailed report written to: {}", report_path.display());
    }

    if failed > 0 {
        anyhow::bail!("{} quality checks failed", failed);
    }

    Ok(())
}

async fn transition_component(component_path: PathBuf, output_dir: PathBuf) -> Result<()> {
    println!("{}", "🔄 React → SwiftUI Transition".bright_cyan().bold());
    println!();

    println!("Analyzing React component: {:?}", component_path);
    
    // Read React component
    let react_content = std::fs::read_to_string(&component_path)
        .context("Failed to read React component")?;

    // Use Neural Mux + Phi to analyze and convert
    let mux_client = neural_mux::NeuralMuxClient::new();
    
    let analysis = mux_client.analyze_react_component(&react_content).await
        .context("Failed to analyze React component with Neural Mux")?;

    println!("✅ Component analyzed successfully");
    println!("   - Data models: {}", analysis.data_models.len());
    println!("   - Views: {}", analysis.views.len());
    println!("   - Services: {}", analysis.services.len());
    println!();

    // Generate SwiftUI equivalent
    let swift_gen = swift_gen::SwiftGenerator::new();
    swift_gen.generate_from_analysis(&analysis, &output_dir)
        .context("Failed to generate SwiftUI code")?;

    println!("{}", "✅ SwiftUI view generated successfully!".bright_green());
    println!("   Output: {}", output_dir.display());

    Ok(())
}

async fn install_hooks(project_path: PathBuf) -> Result<()> {
    println!("{}", "🛡️  Installing Quality Gate Hooks".bright_cyan().bold());
    println!();

    let hooks_installer = quality_gates::HooksInstaller::new(project_path.clone());
    hooks_installer.install().await?;

    println!("{}", "✅ Pre-commit hooks installed successfully!".bright_green());
    println!();
    println!("Quality gates will now run automatically before each commit:");
    println!("  • File size validation (200 LOC limit)");
    println!("  • Mathematical function testing");
    println!("  • Naming honesty enforcement");
    println!("  • Cyclomatic complexity check");
    println!();
    println!("To skip hooks (not recommended): git commit --no-verify");

    Ok(())
}




