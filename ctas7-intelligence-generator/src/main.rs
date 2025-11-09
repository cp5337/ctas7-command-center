//! CTAS-7 Interview Generator v7.3.1
//! 
//! Smart Crate for generating node and crate interviews from TOML schemas.
//! 
//! Features:
//! - Load TOML schema templates
//! - Generate 165 node interviews from IED TTL
//! - Generate ~40 crate interviews from active crates
//! - Store in SurrealDB, Supabase, Sled
//! - Export to JSON, LISP, Unicode LISP
//! - Compress to hash references
//! 
//! Usage:
//!   generate-interviews --mode nodes --count 165 --output ./interviews/nodes
//!   generate-interviews --mode crates --scan ../../ctas-7-shipyard-staging --output ./interviews/crates
//!   generate-interviews --mode all --gemini-api-key $GEMINI_API_KEY

use anyhow::{Context, Result};
use clap::{Parser, Subcommand};
use colored::*;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tracing::{info, warn, error};

mod schema;
mod generator;
mod storage;
mod compression;
mod templates;

use schema::{NodeInterviewSchema, CrateInterviewSchema};
use generator::{NodeInterviewGenerator, CrateInterviewGenerator};
use storage::{StorageBackend, SledStorage, SurrealStorage, SupabaseStorage};
use compression::{CompressionFormat, compress_interview};

#[derive(Parser)]
#[command(name = "ctas7-interview-generator")]
#[command(about = "Generate node and crate interviews from TOML schemas", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
    
    /// Enable verbose logging
    #[arg(short, long)]
    verbose: bool,
    
    /// Dry run (don't write to databases)
    #[arg(short = 'n', long)]
    dry_run: bool,
}

#[derive(Subcommand)]
enum Commands {
    /// Generate node interviews
    Nodes {
        /// Number of node interviews to generate
        #[arg(short, long, default_value = "165")]
        count: usize,
        
        /// Input TOML schema file
        #[arg(short, long, default_value = "../NODE_INTERVIEW_SCHEMA_V7.3.1.toml")]
        schema: PathBuf,
        
        /// IED TTL source document
        #[arg(short, long)]
        ttl_source: Option<PathBuf>,
        
        /// Output directory
        #[arg(short, long, default_value = "./interviews/nodes")]
        output: PathBuf,
        
        /// Use Gemini 2M for generation
        #[arg(short, long)]
        gemini: bool,
        
        /// Gemini API key
        #[arg(long, env = "GEMINI_API_KEY")]
        gemini_api_key: Option<String>,
    },
    
    /// Generate crate interviews
    Crates {
        /// Scan directory for crates
        #[arg(short, long, default_value = "../../ctas-7-shipyard-staging")]
        scan: PathBuf,
        
        /// Input TOML schema file
        #[arg(short = 't', long, default_value = "../CRATE_INTERVIEW_SCHEMA_V7.3.1.toml")]
        schema: PathBuf,
        
        /// Output directory
        #[arg(short, long, default_value = "./interviews/crates")]
        output: PathBuf,
        
        /// Use Gemini 2M for generation
        #[arg(short, long)]
        gemini: bool,
        
        /// Gemini API key
        #[arg(long, env = "GEMINI_API_KEY")]
        gemini_api_key: Option<String>,
    },
    
    /// Generate both nodes and crates
    All {
        /// Use Gemini 2M for generation
        #[arg(short, long)]
        gemini: bool,
        
        /// Gemini API key
        #[arg(long, env = "GEMINI_API_KEY")]
        gemini_api_key: Option<String>,
        
        /// Output directory
        #[arg(short, long, default_value = "./interviews")]
        output: PathBuf,
    },
    
    /// Compress interviews to various formats
    Compress {
        /// Input directory with TOML interviews
        #[arg(short, long)]
        input: PathBuf,
        
        /// Output format
        #[arg(short, long, value_enum, default_value = "unicode-lisp")]
        format: CompressionFormat,
        
        /// Output directory
        #[arg(short, long, default_value = "./interviews/compressed")]
        output: PathBuf,
    },
    
    /// Store interviews in databases
    Store {
        /// Input directory with interviews
        #[arg(short, long)]
        input: PathBuf,
        
        /// Storage backends (comma-separated: sled,surreal,supabase)
        #[arg(short, long, default_value = "sled,surreal,supabase")]
        backends: String,
        
        /// SurrealDB connection string
        #[arg(long, env = "SURREAL_URL")]
        surreal_url: Option<String>,
        
        /// Supabase connection string
        #[arg(long, env = "SUPABASE_URL")]
        supabase_url: Option<String>,
    },
    
    /// Export interviews to various formats
    Export {
        /// Input directory with interviews
        #[arg(short, long)]
        input: PathBuf,
        
        /// Export format (json, lisp, unicode-lisp, hash-only)
        #[arg(short, long, value_enum)]
        format: CompressionFormat,
        
        /// Output file
        #[arg(short, long)]
        output: PathBuf,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    
    // Initialize logging
    let log_level = if cli.verbose { "debug" } else { "info" };
    tracing_subscriber::fmt()
        .with_env_filter(log_level)
        .init();
    
    info!("{}", "CTAS-7 Interview Generator v7.3.1".bright_cyan().bold());
    info!("{}", "Smart Crate for Node and Crate Interview Generation".cyan());
    
    if cli.dry_run {
        warn!("{}", "DRY RUN MODE - No writes to databases".yellow().bold());
    }
    
    match cli.command {
        Commands::Nodes { count, schema, ttl_source, output, gemini, gemini_api_key } => {
            generate_nodes(count, schema, ttl_source, output, gemini, gemini_api_key, cli.dry_run).await?;
        }
        Commands::Crates { scan, schema, output, gemini, gemini_api_key } => {
            generate_crates(scan, schema, output, gemini, gemini_api_key, cli.dry_run).await?;
        }
        Commands::All { gemini, gemini_api_key, output } => {
            generate_all(gemini, gemini_api_key, output, cli.dry_run).await?;
        }
        Commands::Compress { input, format, output } => {
            compress_interviews_cmd(input, format, output).await?;
        }
        Commands::Store { input, backends, surreal_url, supabase_url } => {
            store_interviews(input, backends, surreal_url, supabase_url, cli.dry_run).await?;
        }
        Commands::Export { input, format, output } => {
            export_interviews(input, format, output).await?;
        }
    }
    
    info!("{}", "✅ Complete!".green().bold());
    Ok(())
}

async fn generate_nodes(
    count: usize,
    schema_path: PathBuf,
    ttl_source: Option<PathBuf>,
    output: PathBuf,
    use_gemini: bool,
    gemini_api_key: Option<String>,
    dry_run: bool,
) -> Result<()> {
    info!("📋 Generating {} node interviews...", count);
    
    // Load schema
    let schema = NodeInterviewSchema::from_file(&schema_path)
        .context("Failed to load node interview schema")?;
    
    info!("✅ Loaded schema: {}", schema_path.display());
    
    // Initialize generator
    let mut generator = if use_gemini {
        let api_key = gemini_api_key
            .context("Gemini API key required for AI generation")?;
        NodeInterviewGenerator::with_gemini(&schema, &api_key)?
    } else {
        NodeInterviewGenerator::new(&schema)?
    };
    
    // Load TTL source if provided
    if let Some(ttl_path) = ttl_source {
        generator.load_ttl_source(&ttl_path)?;
        info!("✅ Loaded IED TTL source: {}", ttl_path.display());
    }
    
    // Generate interviews
    std::fs::create_dir_all(&output)?;
    
    for i in 1..=count {
        info!("  Generating node interview {}/{}...", i, count);
        
        let interview = generator.generate(i).await?;
        
        if !dry_run {
            let output_file = output.join(format!("node_{:03}.toml", i));
            interview.save_to_file(&output_file)?;
        }
        
        if i % 10 == 0 {
            info!("  ✅ Generated {} interviews", i);
        }
    }
    
    info!("✅ Generated {} node interviews to {}", count, output.display());
    Ok(())
}

async fn generate_crates(
    scan_path: PathBuf,
    schema_path: PathBuf,
    output: PathBuf,
    use_gemini: bool,
    gemini_api_key: Option<String>,
    dry_run: bool,
) -> Result<()> {
    info!("📦 Scanning for crates in {}...", scan_path.display());
    
    // Load schema
    let schema = CrateInterviewSchema::from_file(&schema_path)
        .context("Failed to load crate interview schema")?;
    
    info!("✅ Loaded schema: {}", schema_path.display());
    
    // Initialize generator
    let mut generator = if use_gemini {
        let api_key = gemini_api_key
            .context("Gemini API key required for AI generation")?;
        CrateInterviewGenerator::with_gemini(&schema, &api_key)?
    } else {
        CrateInterviewGenerator::new(&schema)?
    };
    
    // Scan for crates
    let crates = generator.scan_for_crates(&scan_path)?;
    info!("✅ Found {} crates", crates.len());
    
    // Generate interviews
    std::fs::create_dir_all(&output)?;
    
    for (i, crate_name) in crates.iter().enumerate() {
        info!("  Generating crate interview {}/{}: {}...", i + 1, crates.len(), crate_name);
        
        let interview = generator.generate(crate_name).await?;
        
        if !dry_run {
            let output_file = output.join(format!("{}.toml", crate_name));
            interview.save_to_file(&output_file)?;
        }
    }
    
    info!("✅ Generated {} crate interviews to {}", crates.len(), output.display());
    Ok(())
}

async fn generate_all(
    use_gemini: bool,
    gemini_api_key: Option<String>,
    output: PathBuf,
    dry_run: bool,
) -> Result<()> {
    info!("🚀 Generating ALL interviews (nodes + crates)...");
    
    // Generate nodes
    let node_output = output.join("nodes");
    generate_nodes(
        165,
        PathBuf::from("../NODE_INTERVIEW_SCHEMA_V7.3.1.toml"),
        None,
        node_output,
        use_gemini,
        gemini_api_key.clone(),
        dry_run,
    ).await?;
    
    // Generate crates
    let crate_output = output.join("crates");
    generate_crates(
        PathBuf::from("../../ctas-7-shipyard-staging"),
        PathBuf::from("../CRATE_INTERVIEW_SCHEMA_V7.3.1.toml"),
        crate_output,
        use_gemini,
        gemini_api_key,
        dry_run,
    ).await?;
    
    info!("✅ Generated all interviews to {}", output.display());
    Ok(())
}

async fn compress_interviews_cmd(
    input: PathBuf,
    format: CompressionFormat,
    output: PathBuf,
) -> Result<()> {
    info!("🗜️  Compressing interviews from {} to {:?}...", input.display(), format);
    
    std::fs::create_dir_all(&output)?;
    
    // Read all TOML files
    let entries = std::fs::read_dir(&input)?;
    let mut count = 0;
    
    for entry in entries {
        let entry = entry?;
        let path = entry.path();
        
        if path.extension().and_then(|s| s.to_str()) == Some("toml") {
            let content = std::fs::read_to_string(&path)?;
            let compressed = compress_interview(&content, format)?;
            
            let output_file = output.join(path.file_stem().unwrap())
                .with_extension(format.extension());
            std::fs::write(&output_file, compressed)?;
            
            count += 1;
        }
    }
    
    info!("✅ Compressed {} interviews to {}", count, output.display());
    Ok(())
}

async fn store_interviews(
    input: PathBuf,
    backends: String,
    surreal_url: Option<String>,
    supabase_url: Option<String>,
    dry_run: bool,
) -> Result<()> {
    info!("💾 Storing interviews from {}...", input.display());
    
    let backends: Vec<&str> = backends.split(',').collect();
    
    for backend_name in backends {
        match backend_name.trim() {
            "sled" => {
                info!("  Storing to Sled KVS...");
                if !dry_run {
                    let storage = SledStorage::new("./data/interviews.sled")?;
                    storage.store_from_directory(&input).await?;
                }
            }
            "surreal" => {
                info!("  Storing to SurrealDB...");
                if !dry_run {
                    let url = surreal_url.as_ref()
                        .context("SurrealDB URL required")?;
                    let storage = SurrealStorage::new(url).await?;
                    storage.store_from_directory(&input).await?;
                }
            }
            "supabase" => {
                info!("  Storing to Supabase...");
                if !dry_run {
                    let url = supabase_url.as_ref()
                        .context("Supabase URL required")?;
                    let storage = SupabaseStorage::new(url).await?;
                    storage.store_from_directory(&input).await?;
                }
            }
            _ => {
                warn!("Unknown backend: {}", backend_name);
            }
        }
    }
    
    info!("✅ Stored interviews to all backends");
    Ok(())
}

async fn export_interviews(
    input: PathBuf,
    format: CompressionFormat,
    output: PathBuf,
) -> Result<()> {
    info!("📤 Exporting interviews from {} to {:?}...", input.display(), format);
    
    // Read all interviews
    let entries = std::fs::read_dir(&input)?;
    let mut interviews = Vec::new();
    
    for entry in entries {
        let entry = entry?;
        let path = entry.path();
        
        if path.extension().and_then(|s| s.to_str()) == Some("toml") {
            let content = std::fs::read_to_string(&path)?;
            interviews.push(content);
        }
    }
    
    // Export based on format
    let exported = match format {
        CompressionFormat::Json => {
            // Convert all to JSON array
            serde_json::to_string_pretty(&interviews)?
        }
        CompressionFormat::Lisp => {
            // Convert all to LISP list
            format!("(interviews\n{})", 
                interviews.iter()
                    .map(|i| format!("  {}", compress_interview(i, CompressionFormat::Lisp).unwrap()))
                    .collect::<Vec<_>>()
                    .join("\n"))
        }
        CompressionFormat::UnicodeLisp => {
            // Convert all to Unicode LISP
            interviews.iter()
                .map(|i| compress_interview(i, CompressionFormat::UnicodeLisp))
                .collect::<Result<Vec<_>>>()?
                .join("\n")
        }
        CompressionFormat::HashOnly => {
            // Extract only hashes
            interviews.iter()
                .filter_map(|i| extract_hash(i))
                .collect::<Vec<_>>()
                .join("\n")
        }
    };
    
    std::fs::write(&output, exported)?;
    
    info!("✅ Exported {} interviews to {}", interviews.len(), output.display());
    Ok(())
}

fn extract_hash(toml_content: &str) -> Option<String> {
    // Parse TOML and extract hash_48 field
    toml::from_str::<toml::Value>(toml_content)
        .ok()?
        .get("hash_48")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
}

