use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::net::TcpListener;
use tower_http::trace::TraceLayer;

#[derive(Clone)]
struct AppState {
    api_key: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct CTASTaskRequest {
    query: String,
    context: Option<String>,
    priority: Option<u8>,
}

#[derive(Debug, Serialize, Deserialize)]
struct MetaAgentResponse {
    result: String,
    responder: String,
    cuid: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct VoiceCommandRequest {
    command: String,
    context: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct VoiceResponse {
    response: String,
    agent: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct AgentDispatchRequest {
    task: String,
    context: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct AgentDispatchResponse {
    result: String,
    agent: String,
    status: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct SystemHealthResponse {
    status: String,
    version: String,
    timestamp: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct AgentMeshStatusResponse {
    status: String,
    agents: Vec<AgentStatus>,
    total_agents: usize,
}

#[derive(Debug, Serialize, Deserialize)]
struct AgentStatus {
    name: String,
    port: u16,
    status: String,
    capabilities: Vec<String>,
}

// Middleware to check API key
async fn check_api_key(headers: &HeaderMap, state: &AppState) -> Result<(), StatusCode> {
    let api_key = headers
        .get("X-API-Key")
        .and_then(|v| v.to_str().ok())
        .ok_or(StatusCode::UNAUTHORIZED)?;

    if api_key != state.api_key {
        return Err(StatusCode::UNAUTHORIZED);
    }

    Ok(())
}

// Route task through Claude meta-agent
async fn route_task(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<CTASTaskRequest>,
) -> Result<Json<MetaAgentResponse>, StatusCode> {
    check_api_key(&headers, &state).await?;

    println!("🤖 Routing task: {}", payload.query);
    
    // Simulate meta-agent routing
    let response = MetaAgentResponse {
        result: format!("Task '{}' routed through Claude meta-agent and processed", payload.query),
        responder: "claude-meta-agent".to_string(),
        cuid: format!("ctas-{}", uuid::Uuid::new_v4().to_string()[..8].to_string()),
    };

    Ok(Json(response))
}

// Voice command to Natasha
async fn voice_command(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<VoiceCommandRequest>,
) -> Result<Json<VoiceResponse>, StatusCode> {
    check_api_key(&headers, &state).await?;

    println!("🎤 Voice command: {}", payload.command);
    
    let response = VoiceResponse {
        response: format!("DA! Processing command: {}", payload.command),
        agent: "natasha".to_string(),
    };

    Ok(Json(response))
}

// Dispatch to specific agent
async fn dispatch_agent(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Path(agent_name): Path<String>,
    Json(payload): Json<AgentDispatchRequest>,
) -> Result<Json<AgentDispatchResponse>, StatusCode> {
    check_api_key(&headers, &state).await?;

    println!("📡 Dispatching to {}: {}", agent_name, payload.task);
    
    let response = AgentDispatchResponse {
        result: format!("Task dispatched to {} successfully", agent_name),
        agent: agent_name,
        status: "completed".to_string(),
    };

    Ok(Json(response))
}

// Get all agent status
async fn get_agent_status(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<AgentMeshStatusResponse>, StatusCode> {
    check_api_key(&headers, &state).await?;

    println!("📊 Getting agent mesh status");
    
    let agents = vec![
        AgentStatus {
            name: "repoagent".to_string(),
            port: 15180,
            status: "ONLINE".to_string(),
            capabilities: vec!["repository_management".to_string(), "file_operations".to_string()],
        },
        AgentStatus {
            name: "natasha".to_string(),
            port: 15181,
            status: "ONLINE".to_string(),
            capabilities: vec!["voice_interface".to_string(), "red_team".to_string()],
        },
        AgentStatus {
            name: "grok".to_string(),
            port: 50052,
            status: "ONLINE".to_string(),
            capabilities: vec!["space_engineering".to_string(), "orbital_ops".to_string()],
        },
        AgentStatus {
            name: "cove".to_string(),
            port: 50053,
            status: "ONLINE".to_string(),
            capabilities: vec!["devops".to_string(), "qa".to_string()],
        },
        AgentStatus {
            name: "linear_agent".to_string(),
            port: 18180,
            status: "STAGING".to_string(),
            capabilities: vec!["linear_integration".to_string()],
        },
    ];

    let response = AgentMeshStatusResponse {
        status: "operational".to_string(),
        agents: agents.clone(),
        total_agents: agents.len(),
    };

    Ok(Json(response))
}

// System health endpoint
async fn health() -> Json<SystemHealthResponse> {
    Json(SystemHealthResponse {
        status: "healthy".to_string(),
        version: "7.1.1".to_string(),
        timestamp: chrono::Utc::now().to_rfc3339(),
    })
}

// Agent mesh status (legacy endpoint)
async fn agent_mesh_status(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<AgentMeshStatusResponse>, StatusCode> {
    get_agent_status(State(state), headers).await
}

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    // Load API key from environment or use default
    let api_key = std::env::var("GATEWAY_API_KEY")
        .unwrap_or_else(|_| "ctas7-edad7e5ed1580f5b8753a91085803d9ec194f914e786616ae75cab81ff80754b".to_string());

    let state = Arc::new(AppState { api_key });

    // Build router
    let app = Router::new()
        // Meta-agent routing
        .route("/meta_agent/route_task", post(route_task))
        // Voice interface
        .route("/agents/natasha/voice_command", post(voice_command))
        // Agent dispatch
        .route("/agents/:agent_name/dispatch", post(dispatch_agent))
        // Status endpoints
        .route("/agents/status", get(get_agent_status))
        .route("/system/agent_mesh_status", get(agent_mesh_status))
        // Health
        .route("/health", get(health))
        // Add tracing
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    // Start server
    let addr = "0.0.0.0:15181";
    let listener = TcpListener::bind(addr).await.unwrap();
    
    println!("\n🇷🇺 ========================================");
    println!("🚀 CTAS Synaptix Gateway v7.1.1");
    println!("🌐 HTTP: http://{}", addr);
    println!("🔐 Auth: X-API-Key required");
    println!("⚡ Ready for Custom GPT integration");
    println!("========================================\n");

    axum::serve(listener, app).await.unwrap();
}

