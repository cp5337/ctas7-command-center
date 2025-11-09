# Claude Build Prompt: Synaptix Plasma + Kali Purple Container
## Micro-to-Macro Tool Infrastructure for CTAS Main Ops

---

# 🎯 **MISSION**

Build a unified Docker container system that combines:
1. **Synaptix Plasma** - Full threat detection stack (Wazuh + AXON + Legion + Phi-3 LoRA)
2. **Kali Purple** - Complete offensive & defensive toolkit (Kali Linux + Purple team tools)
3. **Micro-to-Macro Service Infrastructure** - Script → WASM → Microkernel → Crate → System → IaC
4. **TTL Framework Integration** - Operational task list framework for tool generation
5. **Main Ops Tool Factory** - Hash-addressed, Unicode-invoked tool generation system

This container will serve as the **foundation for on-demand tool creation** that Main Ops will use to orchestrate operations from the TTL framework.

---

# 📚 **CONTEXT & REFERENCE MATERIALS**

## **You Have Access To:**

### **1. CTAS Architecture Documents**
Located in `/Users/cp5337/Developer/ctas7-command-center/`:
- `SYNAPTIX_PLASMA_ARCHITECTURE.md` - Full Plasma stack architecture
- `kali-jeetkune/security_architecture.md` - Kali JeetTek defense layers
- `OPTION_A_EXECUTION_PLAN.md` - Main Ops 6.6 → 7.1 plan
- `SERVICE_AUDIT_REPORT.md` - Current system inventory
- `FRONTEND_6.6_TO_7.1_PROMOTION_PLAN.md` - Integration strategy

### **2. TTL Framework**
Located in `/Users/cp5337/Desktop/📁_ORGANIZED_DESKTOP/03_Documents_Reports/`:
- `01 Terrorist IED Task List (TTL) no graphics_1.txt` - Full TTL document
- `Complete_CTAS_Task_List_Nodes_000-012_with_WMD.csv` - Hash-addressed tasks

Located in `/Users/cp5337/Developer/ctas7-command-center/`:
- `supabase/migrations/001_create_ctas_tasks.sql` - Database schema for tasks

### **3. Existing CTAS Systems**
- **CTAS v6.6**: `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas6-reference/`
- **CTAS 7.0 Main Ops**: `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas-7.0-main-ops-platform/`
- **Command Center**: `/Users/cp5337/Developer/ctas7-command-center/`

---

# 🏗️ **ARCHITECTURE OVERVIEW**

## **Container Stack Layers**

```
┌─────────────────────────────────────────────────────────────┐
│  Main Ops 7.1 Frontend (React + TypeScript + Vite)         │
│  Ports: 15174, 25174                                        │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP API Calls
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  SYNAPTIX PLASMA + KALI PURPLE UNIFIED CONTAINER            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Layer 1: Kali JeetTek (Perimeter Defense)          │  │
│  │  Port: 443 (TLS Ingress)                            │  │
│  │  - Request filtering, threat scoring                │  │
│  │  - Sub-millisecond decision making                  │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │  Layer 2: Synaptix Plasma (Threat Intelligence)     │  │
│  │  Port: 18150                                         │  │
│  │  ├─ Wazuh Manager (1514, 1515, 55000)              │  │
│  │  ├─ AXON Processing (18102)                         │  │
│  │  ├─ Legion ECS (18106)                              │  │
│  │  ├─ Phi-3 LoRA Farm (11434 - Ollama)               │  │
│  │  └─ HFT Ground Stations (18200)                     │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │  Layer 3: Kali Purple Toolkit                       │  │
│  │  Port: 18300 (Tool API)                             │  │
│  │  ├─ Offensive Tools (Nmap, Metasploit, etc.)       │  │
│  │  ├─ Defensive Tools (Snort, Suricata, etc.)        │  │
│  │  ├─ Purple Team (Caldera, Atomic Red Team)         │  │
│  │  └─ Tool Orchestrator (Microkernel launcher)       │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │  Layer 4: Micro-to-Macro Service Infrastructure     │  │
│  │  Port: 18350 (Escalation API)                       │  │
│  │  ├─ Script Executor (Bash/Python/Ruby)             │  │
│  │  ├─ WASM Runtime (Wasmtime - 289 nodes)            │  │
│  │  ├─ Microkernel Launcher (Alpine/Firefly)          │  │
│  │  ├─ Smart Crate Builder (Rust Cargo)               │  │
│  │  ├─ System Deployer (Docker/K8s)                   │  │
│  │  └─ IaC Generator (Terraform/Ansible)              │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │  Layer 5: TTL Framework Integration                 │  │
│  │  Port: 18400 (Framework API)                        │  │
│  │  ├─ Task Registry (Supabase/SurrealDB)             │  │
│  │  ├─ Unicode Assembly Language Mapper                │  │
│  │  ├─ Murmur3 Trivariate Hash Engine                 │  │
│  │  ├─ PTCC Decomposition Engine                       │  │
│  │  ├─ Tool Chain Generator                            │  │
│  │  └─ XSD Playbook Executor                           │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │  Layer 6: Main Ops Integration API                  │  │
│  │  Port: 18450 (Public API)                           │  │
│  │  ├─ Tool Invocation Endpoint                        │  │
│  │  ├─ Hash-to-Tool Resolver                           │  │
│  │  ├─ Unicode/Emoji Command Parser                    │  │
│  │  ├─ Real-time Tool Status                           │  │
│  │  └─ Result Streaming (WebSocket)                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼ Data Storage
         ┌───────────────────────────┐
         │  SurrealDB (8000)         │
         │  - TTL task registry      │
         │  - Tool execution history │
         │  - Threat intelligence    │
         │  - Entity tracking        │
         └───────────────────────────┘
```

---

# 🎯 **BUILD REQUIREMENTS**

## **Phase 1: Base Container Structure**

### **Create Multi-Stage Dockerfile**

```dockerfile
# File: /Users/cp5337/Developer/ctas7-shipyard-staging/ctas7-plasma-kali-purple/Dockerfile

# ============================================================
# Stage 1: Kali Purple Base
# ============================================================
FROM kalilinux/kali-rolling:latest AS kali-base

# Install Kali Purple metapackage
RUN apt-get update && apt-get install -y \
    kali-linux-purple \
    kali-tools-red-team \
    kali-tools-blue-team \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install offensive tools
RUN apt-get update && apt-get install -y \
    nmap \
    metasploit-framework \
    burpsuite \
    sqlmap \
    wireshark \
    aircrack-ng \
    john \
    hydra \
    nikto \
    dirbuster \
    && apt-get clean

# Install defensive tools
RUN apt-get update && apt-get install -y \
    snort \
    suricata \
    ossec-hids \
    aide \
    fail2ban \
    tripwire \
    && apt-get clean

# Install purple team tools
RUN apt-get update && apt-get install -y \
    atomic-red-team \
    caldera \
    && apt-get clean

# ============================================================
# Stage 2: Rust Toolchain
# ============================================================
FROM rust:1.76-slim-bookworm AS rust-builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y \
    protobuf-compiler \
    pkg-config \
    libssl-dev \
    clang \
    llvm \
    && rm -rf /var/lib/apt/lists/*

# Copy CTAS Rust components
COPY ctas7-foundation/ ./ctas7-foundation/
COPY ctas7-axon/ ./ctas7-axon/
COPY ctas7-legion-ecs/ ./ctas7-legion-ecs/
COPY ctas7-neural-mux/ ./ctas7-neural-mux/
COPY ctas7-hft-ground-stations/ ./ctas7-hft-ground-stations/

# Build all Rust binaries
RUN cargo build --release --workspace

# ============================================================
# Stage 3: Wazuh Manager
# ============================================================
FROM wazuh/wazuh-manager:4.7.0 AS wazuh-base

# Configure Wazuh to output to AXON
COPY wazuh-config/ossec.conf /var/ossec/etc/ossec.conf
COPY wazuh-config/axon-integration.sh /var/ossec/integrations/axon-integration

# ============================================================
# Stage 4: WASM Runtime
# ============================================================
FROM wasmtime/wasmtime:latest AS wasm-runtime

# Copy WASM ground station nodes (289 nodes)
COPY wasm-ground-stations/*.wasm /wasm/nodes/

# ============================================================
# Stage 5: Unified Runtime
# ============================================================
FROM ubuntu:22.04

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    python3 \
    python3-pip \
    nodejs \
    npm \
    docker.io \
    libssl3 \
    ca-certificates \
    supervisor \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Copy Kali tools from kali-base
COPY --from=kali-base /usr/bin/nmap /usr/bin/
COPY --from=kali-base /usr/bin/metasploit* /usr/bin/
# ... (copy all necessary Kali binaries)

# Copy Rust binaries from rust-builder
COPY --from=rust-builder /build/target/release/ctas7-axon /usr/local/bin/
COPY --from=rust-builder /build/target/release/ctas7-legion-ecs /usr/local/bin/
COPY --from=rust-builder /build/target/release/ctas7-neural-mux /usr/local/bin/
COPY --from=rust-builder /build/target/release/ctas7-hft-ground-stations /usr/local/bin/

# Copy Wazuh from wazuh-base
COPY --from=wazuh-base /var/ossec /var/ossec

# Copy WASM runtime
COPY --from=wasm-runtime /usr/local/bin/wasmtime /usr/local/bin/
COPY --from=wasm-runtime /wasm/nodes /wasm/nodes

# Install Ollama for Phi-3 LoRA
RUN curl -fsSL https://ollama.ai/install.sh | sh

# Pull Phi-3 models
RUN ollama pull phi3:mini
RUN ollama pull phi3:small

# Install Python dependencies for tool orchestration
COPY requirements.txt .
RUN pip3 install -r requirements.txt

# Copy application code
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY config/ ./config/

# Copy supervisor config for multi-service management
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose all necessary ports
EXPOSE \
    443 \        # Kali JeetTek ingress
    1514 \       # Wazuh agent communication
    1515 \       # Wazuh agent enrollment
    55000 \      # Wazuh API
    18102 \      # AXON processing
    18106 \      # Legion ECS
    18150 \      # Plasma main API
    18200 \      # HFT ground stations
    18300 \      # Kali tool API
    18350 \      # Micro-to-macro escalation API
    18400 \      # TTL framework API
    18450 \      # Main Ops integration API
    11434        # Ollama (Phi-3)

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:18450/health || exit 1

# Start supervisor (manages all services)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
```

---

## **Phase 2: Service Configuration**

### **Supervisor Configuration**

```ini
# File: /Users/cp5337/Developer/ctas7-shipyard-staging/ctas7-plasma-kali-purple/supervisord.conf

[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

# Wazuh Manager
[program:wazuh-manager]
command=/var/ossec/bin/wazuh-control start
autostart=true
autorestart=true
stdout_logfile=/var/log/wazuh/wazuh.log
stderr_logfile=/var/log/wazuh/wazuh.err

# AXON Processing Engine
[program:axon]
command=/usr/local/bin/ctas7-axon --config /app/config/axon.toml
autostart=true
autorestart=true
stdout_logfile=/var/log/axon/axon.log
stderr_logfile=/var/log/axon/axon.err

# Legion ECS Entity Tracker
[program:legion-ecs]
command=/usr/local/bin/ctas7-legion-ecs --config /app/config/legion.toml
autostart=true
autorestart=true
stdout_logfile=/var/log/legion/legion.log
stderr_logfile=/var/log/legion/legion.err

# Neural Mux CDN
[program:neural-mux]
command=/usr/local/bin/ctas7-neural-mux --config /app/config/neural-mux.toml
autostart=true
autorestart=true
stdout_logfile=/var/log/neural-mux/neural-mux.log
stderr_logfile=/var/log/neural-mux/neural-mux.err

# HFT Ground Stations
[program:hft-ground-stations]
command=/usr/local/bin/ctas7-hft-ground-stations --config /app/config/hft.toml
autostart=true
autorestart=true
stdout_logfile=/var/log/hft/hft.log
stderr_logfile=/var/log/hft/hft.err

# Ollama (Phi-3 LoRA)
[program:ollama]
command=ollama serve
autostart=true
autorestart=true
stdout_logfile=/var/log/ollama/ollama.log
stderr_logfile=/var/log/ollama/ollama.err

# Kali Tool Orchestrator
[program:kali-tools]
command=python3 /app/src/kali_tool_orchestrator.py
autostart=true
autorestart=true
stdout_logfile=/var/log/kali/tools.log
stderr_logfile=/var/log/kali/tools.err

# Micro-to-Macro Service Infrastructure
[program:micro-macro-service]
command=python3 /app/src/micro_macro_service.py
autostart=true
autorestart=true
stdout_logfile=/var/log/micro-macro/service.log
stderr_logfile=/var/log/micro-macro/service.err

# TTL Framework Integration
[program:ttl-framework]
command=python3 /app/src/ttl_framework_api.py
autostart=true
autorestart=true
stdout_logfile=/var/log/ttl/framework.log
stderr_logfile=/var/log/ttl/framework.err

# Main Ops Integration API
[program:main-ops-api]
command=python3 /app/src/main_ops_integration_api.py
autostart=true
autorestart=true
stdout_logfile=/var/log/main-ops/api.log
stderr_logfile=/var/log/main-ops/api.err

# Nginx (reverse proxy & load balancer)
[program:nginx]
command=nginx -g 'daemon off;'
autostart=true
autorestart=true
stdout_logfile=/var/log/nginx/access.log
stderr_logfile=/var/log/nginx/error.log
```

---

## **Phase 3: Python Service Implementation**

### **1. Kali Tool Orchestrator**

```python
# File: /Users/cp5337/Developer/ctas7-shipyard-staging/ctas7-plasma-kali-purple/src/kali_tool_orchestrator.py

"""
Kali Tool Orchestrator
Provides API for invoking Kali offensive, defensive, and purple team tools
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import asyncio
from typing import List, Dict, Optional
import json

app = FastAPI(title="Kali Tool Orchestrator", version="1.0.0")

class ToolRequest(BaseModel):
    tool: str  # e.g., "nmap", "metasploit", "snort"
    args: List[str]
    target: Optional[str] = None
    mode: str = "offensive"  # offensive, defensive, purple
    ttl_task_id: Optional[str] = None  # Link to TTL task
    unicode_hash: Optional[str] = None  # Unicode identifier

class ToolResponse(BaseModel):
    tool: str
    status: str
    output: str
    stderr: str
    exit_code: int
    execution_time: float

# Tool registry with safety checks
TOOLS = {
    "offensive": {
        "nmap": {
            "command": "nmap",
            "allowed_args": ["-sS", "-sV", "-O", "-A", "-p", "-Pn"],
            "requires_target": True,
        },
        "metasploit": {
            "command": "msfconsole",
            "allowed_args": ["-q", "-x", "-r"],
            "requires_target": False,
        },
        "sqlmap": {
            "command": "sqlmap",
            "allowed_args": ["-u", "--dbs", "--tables", "--dump"],
            "requires_target": True,
        },
    },
    "defensive": {
        "snort": {
            "command": "snort",
            "allowed_args": ["-A", "-c", "-i", "-l"],
            "requires_target": False,
        },
        "suricata": {
            "command": "suricata",
            "allowed_args": ["-c", "-i", "-D"],
            "requires_target": False,
        },
    },
    "purple": {
        "caldera": {
            "command": "caldera",
            "allowed_args": ["--operation", "--adversary"],
            "requires_target": False,
        },
    },
}

@app.post("/tools/execute", response_model=ToolResponse)
async def execute_tool(request: ToolRequest):
    """
    Execute a Kali tool with safety checks
    """
    # Validate tool exists
    if request.mode not in TOOLS:
        raise HTTPException(status_code=400, detail=f"Invalid mode: {request.mode}")

    if request.tool not in TOOLS[request.mode]:
        raise HTTPException(status_code=400, detail=f"Unknown tool: {request.tool}")

    tool_config = TOOLS[request.mode][request.tool]

    # Build command
    cmd = [tool_config["command"]]

    # Validate and add arguments
    for arg in request.args:
        arg_name = arg.split()[0]
        if arg_name not in tool_config["allowed_args"]:
            raise HTTPException(
                status_code=400,
                detail=f"Argument '{arg_name}' not allowed for {request.tool}"
            )
        cmd.append(arg)

    # Add target if required
    if tool_config["requires_target"]:
        if not request.target:
            raise HTTPException(
                status_code=400,
                detail=f"Tool {request.tool} requires a target"
            )
        cmd.append(request.target)

    # Execute tool in sandboxed environment
    try:
        import time
        start_time = time.time()

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,  # 5 minute timeout
        )

        execution_time = time.time() - start_time

        # Log to TTL framework if task_id provided
        if request.ttl_task_id:
            await log_to_ttl_framework(
                task_id=request.ttl_task_id,
                tool=request.tool,
                output=result.stdout,
                exit_code=result.returncode
            )

        return ToolResponse(
            tool=request.tool,
            status="completed",
            output=result.stdout,
            stderr=result.stderr,
            exit_code=result.returncode,
            execution_time=execution_time
        )

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Tool execution timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tools/list")
async def list_tools():
    """
    List all available tools
    """
    return {
        "offensive": list(TOOLS["offensive"].keys()),
        "defensive": list(TOOLS["defensive"].keys()),
        "purple": list(TOOLS["purple"].keys()),
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "kali-tool-orchestrator"}

async def log_to_ttl_framework(task_id: str, tool: str, output: str, exit_code: int):
    """
    Log tool execution to TTL framework
    """
    # Send to TTL framework API
    async with httpx.AsyncClient() as client:
        await client.post(
            "http://localhost:18400/ttl/log",
            json={
                "task_id": task_id,
                "tool": tool,
                "output": output,
                "exit_code": exit_code,
                "timestamp": time.time()
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=18300)
```

### **2. Micro-to-Macro Service Infrastructure**

```python
# File: /Users/cp5337/Developer/ctas7-shipyard-staging/ctas7-plasma-kali-purple/src/micro_macro_service.py

"""
Micro-to-Macro Service Infrastructure
Escalation ladder: Script → WASM → Microkernel → Crate → System → IaC
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from enum import Enum
import subprocess
import docker
import asyncio
from typing import Dict, Optional

app = FastAPI(title="Micro-to-Macro Service", version="1.0.0")

class ServiceLevel(str, Enum):
    SCRIPT = "script"
    WASM = "wasm"
    MICROKERNEL = "microkernel"
    CRATE = "crate"
    SYSTEM = "system"
    IAC = "iac"

class DeploymentRequest(BaseModel):
    level: ServiceLevel
    hash: str  # Murmur3 trivariate hash
    unicode: Optional[str] = None  # Unicode identifier
    payload: Dict  # Deployment configuration
    ttl_task_id: Optional[str] = None

class DeploymentResponse(BaseModel):
    level: ServiceLevel
    hash: str
    status: str
    endpoint: Optional[str] = None
    logs: str

@app.post("/deploy", response_model=DeploymentResponse)
async def deploy_service(request: DeploymentRequest):
    """
    Deploy a service at any level of the micro-to-macro ladder
    """
    if request.level == ServiceLevel.SCRIPT:
        return await deploy_script(request)
    elif request.level == ServiceLevel.WASM:
        return await deploy_wasm(request)
    elif request.level == ServiceLevel.MICROKERNEL:
        return await deploy_microkernel(request)
    elif request.level == ServiceLevel.CRATE:
        return await deploy_crate(request)
    elif request.level == ServiceLevel.SYSTEM:
        return await deploy_system(request)
    elif request.level == ServiceLevel.IAC:
        return await deploy_iac(request)

async def deploy_script(request: DeploymentRequest) -> DeploymentResponse:
    """
    Execute a simple bash/python/ruby script
    """
    script_type = request.payload.get("type", "bash")
    script_content = request.payload.get("content")

    if script_type == "bash":
        result = subprocess.run(
            ["bash", "-c", script_content],
            capture_output=True,
            text=True,
            timeout=60
        )
    elif script_type == "python":
        result = subprocess.run(
            ["python3", "-c", script_content],
            capture_output=True,
            text=True,
            timeout=60
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported script type: {script_type}")

    return DeploymentResponse(
        level=ServiceLevel.SCRIPT,
        hash=request.hash,
        status="completed",
        logs=result.stdout + result.stderr
    )

async def deploy_wasm(request: DeploymentRequest) -> DeploymentResponse:
    """
    Deploy a WASM node to one of the 289 ground stations
    """
    wasm_module = request.payload.get("wasm_module")
    node_id = request.payload.get("node_id", 0)  # Default to node 0

    # Copy WASM module to ground station directory
    wasm_path = f"/wasm/nodes/node-{node_id}/{request.hash}.wasm"

    # Use wasmtime to execute
    result = subprocess.run(
        ["wasmtime", wasm_path],
        capture_output=True,
        text=True,
        timeout=120
    )

    return DeploymentResponse(
        level=ServiceLevel.WASM,
        hash=request.hash,
        status="deployed",
        endpoint=f"wasm://node-{node_id}/{request.hash}",
        logs=result.stdout
    )

async def deploy_microkernel(request: DeploymentRequest) -> DeploymentResponse:
    """
    Deploy an Alpine/Firefly microkernel container
    """
    client = docker.from_env()

    # Create Alpine microkernel container
    container_name = f"microkernel-{request.hash[:8]}"

    container = client.containers.run(
        "alpine:latest",
        command=request.payload.get("command", "sh"),
        name=container_name,
        detach=True,
        remove=False,
        network_mode="ctas-network",
        mem_limit="50m",  # Microkernel = minimal resources
    )

    return DeploymentResponse(
        level=ServiceLevel.MICROKERNEL,
        hash=request.hash,
        status="running",
        endpoint=f"http://{container_name}:8080",
        logs=f"Container {container_name} started"
    )

async def deploy_crate(request: DeploymentRequest) -> DeploymentResponse:
    """
    Build and deploy a Rust Smart Crate
    """
    crate_name = request.payload.get("crate_name")
    cargo_config = request.payload.get("cargo_config")

    # Create Cargo.toml
    crate_dir = f"/tmp/crates/{request.hash}"
    subprocess.run(["mkdir", "-p", crate_dir])

    with open(f"{crate_dir}/Cargo.toml", "w") as f:
        f.write(cargo_config)

    # Copy source code
    # ... (implement source copying)

    # Build crate
    result = subprocess.run(
        ["cargo", "build", "--release"],
        cwd=crate_dir,
        capture_output=True,
        text=True,
        timeout=600
    )

    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=f"Crate build failed: {result.stderr}")

    # Run crate as service
    binary_path = f"{crate_dir}/target/release/{crate_name}"
    subprocess.Popen([binary_path], cwd=crate_dir)

    return DeploymentResponse(
        level=ServiceLevel.CRATE,
        hash=request.hash,
        status="deployed",
        endpoint=f"http://localhost:18500",  # Crate-specific port
        logs=result.stdout
    )

async def deploy_system(request: DeploymentRequest) -> DeploymentResponse:
    """
    Deploy a full Docker system (multiple containers)
    """
    client = docker.from_env()
    compose_config = request.payload.get("docker_compose")

    # Write docker-compose.yml
    compose_dir = f"/tmp/systems/{request.hash}"
    subprocess.run(["mkdir", "-p", compose_dir])

    with open(f"{compose_dir}/docker-compose.yml", "w") as f:
        f.write(compose_config)

    # Start system
    result = subprocess.run(
        ["docker-compose", "up", "-d"],
        cwd=compose_dir,
        capture_output=True,
        text=True
    )

    return DeploymentResponse(
        level=ServiceLevel.SYSTEM,
        hash=request.hash,
        status="deployed",
        endpoint=f"http://system-{request.hash[:8]}",
        logs=result.stdout
    )

async def deploy_iac(request: DeploymentRequest) -> DeploymentResponse:
    """
    Deploy Infrastructure as Code (Terraform/Ansible)
    """
    iac_type = request.payload.get("type", "terraform")
    config = request.payload.get("config")

    iac_dir = f"/tmp/iac/{request.hash}"
    subprocess.run(["mkdir", "-p", iac_dir])

    if iac_type == "terraform":
        with open(f"{iac_dir}/main.tf", "w") as f:
            f.write(config)

        # Terraform init, plan, apply
        subprocess.run(["terraform", "init"], cwd=iac_dir)
        subprocess.run(["terraform", "plan"], cwd=iac_dir)
        result = subprocess.run(
            ["terraform", "apply", "-auto-approve"],
            cwd=iac_dir,
            capture_output=True,
            text=True
        )
    elif iac_type == "ansible":
        with open(f"{iac_dir}/playbook.yml", "w") as f:
            f.write(config)

        result = subprocess.run(
            ["ansible-playbook", "playbook.yml"],
            cwd=iac_dir,
            capture_output=True,
            text=True
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported IaC type: {iac_type}")

    return DeploymentResponse(
        level=ServiceLevel.IAC,
        hash=request.hash,
        status="deployed",
        logs=result.stdout
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "micro-macro-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=18350)
```

### **3. TTL Framework Integration**

```python
# File: /Users/cp5337/Developer/ctas7-shipyard-staging/ctas7-plasma-kali-purple/src/ttl_framework_api.py

"""
TTL Framework Integration
Connects operational task list to tool generation
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import murmurhash
from typing import List, Dict, Optional
import json

app = FastAPI(title="TTL Framework API", version="1.0.0")

class TTLTask(BaseModel):
    task_id: str  # e.g., "uuid-000-000-001"
    task_name: str
    category: str
    hd4_phase: str
    trivariate_hash: str  # Murmur3 Base96
    unicode_id: str
    tools_required: List[str]
    ptcc_primitives: List[Dict]

class ToolChainRequest(BaseModel):
    ttl_task_id: str
    generate_tools: bool = True

class ToolChainResponse(BaseModel):
    task_id: str
    tools_generated: List[str]
    deployment_plan: Dict

@app.post("/ttl/generate_toolchain", response_model=ToolChainResponse)
async def generate_toolchain(request: ToolChainRequest):
    """
    Generate a tool chain from a TTL task
    """
    # Fetch TTL task from database
    async with httpx.AsyncClient() as client:
        response = await client.get(f"http://localhost:8000/ttl/tasks/{request.ttl_task_id}")
        task_data = response.json()

    task = TTLTask(**task_data)

    # Map TTL task to tools
    tools = []
    deployment_plan = {}

    # Example: For "Conduct Reconnaissance" task
    if "reconnaissance" in task.task_name.lower():
        tools.append({
            "tool": "nmap",
            "level": "script",
            "args": ["-sV", "-O", task_data.get("target")]
        })
        tools.append({
            "tool": "shodan",
            "level": "wasm",
            "node": 5
        })

    # Example: For "Acquire Materials" task
    if "acquire" in task.task_name.lower():
        tools.append({
            "tool": "osint-collector",
            "level": "microkernel",
            "config": {"sources": ["supplier_databases", "dark_web_markets"]}
        })

    # Generate tools if requested
    if request.generate_tools:
        for tool in tools:
            # Deploy tool via micro-macro service
            async with httpx.AsyncClient() as client:
                deploy_response = await client.post(
                    "http://localhost:18350/deploy",
                    json={
                        "level": tool["level"],
                        "hash": task.trivariate_hash,
                        "unicode": task.unicode_id,
                        "payload": tool,
                        "ttl_task_id": task.task_id
                    }
                )
                deployment_plan[tool["tool"]] = deploy_response.json()

    return ToolChainResponse(
        task_id=task.task_id,
        tools_generated=[t["tool"] for t in tools],
        deployment_plan=deployment_plan
    )

@app.get("/ttl/tasks")
async def list_tasks():
    """
    List all TTL tasks
    """
    async with httpx.AsyncClient() as client:
        response = await client.get("http://localhost:8000/ttl/tasks")
        return response.json()

@app.post("/ttl/unicode_to_toolchain")
async def unicode_to_toolchain(unicode_id: str):
    """
    Invoke tool chain via Unicode/emoji
    """
    # Lookup task by Unicode ID
    async with httpx.AsyncClient() as client:
        response = await client.get(f"http://localhost:8000/ttl/tasks/by_unicode/{unicode_id}")
        task_data = response.json()

    # Generate tool chain
    return await generate_toolchain(
        ToolChainRequest(ttl_task_id=task_data["task_id"], generate_tools=True)
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ttl-framework"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=18400)
```

### **4. Main Ops Integration API**

```python
# File: /Users/cp5337/Developer/ctas7-shipyard-staging/ctas7-plasma-kali-purple/src/main_ops_integration_api.py

"""
Main Ops Integration API
Public-facing API for CTAS Main Ops to invoke tools
"""

from fastapi import FastAPI, HTTPException, WebSocket
from pydantic import BaseModel
import httpx
from typing import Optional
import asyncio

app = FastAPI(title="Main Ops Integration API", version="1.0.0")

class ToolInvocationRequest(BaseModel):
    hash: Optional[str] = None
    unicode: Optional[str] = None
    ttl_task_id: Optional[str] = None
    mode: str = "auto"  # auto, manual, simulation

class ToolInvocationResponse(BaseModel):
    status: str
    tools_executed: list
    results: dict
    plasma_threat_score: Optional[float] = None

@app.post("/invoke", response_model=ToolInvocationResponse)
async def invoke_tools(request: ToolInvocationRequest):
    """
    Main entry point for tool invocation from Main Ops
    """
    # Determine invocation method
    if request.unicode:
        # Unicode/emoji invocation
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:18400/ttl/unicode_to_toolchain",
                params={"unicode_id": request.unicode}
            )
            toolchain = response.json()
    elif request.hash:
        # Hash-based invocation
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"http://localhost:8000/ttl/tasks/by_hash/{request.hash}"
            )
            task = response.json()

            toolchain_response = await client.post(
                "http://localhost:18400/ttl/generate_toolchain",
                json={"ttl_task_id": task["task_id"], "generate_tools": True}
            )
            toolchain = toolchain_response.json()
    elif request.ttl_task_id:
        # Direct task ID invocation
        async with httpx.AsyncClient() as client:
            toolchain_response = await client.post(
                "http://localhost:18400/ttl/generate_toolchain",
                json={"ttl_task_id": request.ttl_task_id, "generate_tools": True}
            )
            toolchain = toolchain_response.json()
    else:
        raise HTTPException(status_code=400, detail="Must provide hash, unicode, or ttl_task_id")

    # Execute tools
    results = {}
    for tool_name, deployment in toolchain["deployment_plan"].items():
        # Execute and collect results
        results[tool_name] = deployment

    # Get threat intelligence from Plasma
    async with httpx.AsyncClient() as client:
        plasma_response = await client.get("http://localhost:18150/threat/score")
        threat_score = plasma_response.json().get("score", 0.0)

    return ToolInvocationResponse(
        status="completed",
        tools_executed=toolchain["tools_generated"],
        results=results,
        plasma_threat_score=threat_score
    )

@app.websocket("/stream")
async def websocket_stream(websocket: WebSocket):
    """
    Real-time tool execution streaming
    """
    await websocket.accept()

    # Stream tool execution status
    while True:
        # Send status updates
        await websocket.send_json({
            "status": "running",
            "tools_active": 3,
            "threats_detected": 1,
        })
        await asyncio.sleep(1)

@app.get("/status")
async def get_status():
    """
    Get overall system status
    """
    status = {
        "plasma": await check_service("http://localhost:18150/health"),
        "kali_tools": await check_service("http://localhost:18300/health"),
        "micro_macro": await check_service("http://localhost:18350/health"),
        "ttl_framework": await check_service("http://localhost:18400/health"),
        "wazuh": await check_service("http://localhost:55000/"),
        "axon": await check_service("http://localhost:18102/health"),
        "legion": await check_service("http://localhost:18106/health"),
        "hft": await check_service("http://localhost:18200/health"),
        "ollama": await check_service("http://localhost:11434/"),
    }

    return status

async def check_service(url: str) -> str:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=5.0)
            return "healthy" if response.status_code == 200 else "unhealthy"
    except:
        return "unreachable"

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "main-ops-integration"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=18450)
```

---

## **Phase 4: Docker Compose Orchestration**

```yaml
# File: /Users/cp5337/Developer/ctas7-shipyard-staging/ctas7-plasma-kali-purple/docker-compose.yml

version: '3.8'

services:
  # ============================================================
  # Unified Plasma + Kali Purple Container
  # ============================================================
  plasma-kali-purple:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ctas7-plasma-kali-purple
    ports:
      - "443:443"       # Kali JeetTek ingress
      - "1514:1514"     # Wazuh agent
      - "1515:1515"     # Wazuh enrollment
      - "55000:55000"   # Wazuh API
      - "18102:18102"   # AXON
      - "18106:18106"   # Legion ECS
      - "18150:18150"   # Plasma API
      - "18200:18200"   # HFT ground stations
      - "18300:18300"   # Kali tools API
      - "18350:18350"   # Micro-macro service
      - "18400:18400"   # TTL framework
      - "18450:18450"   # Main Ops API
      - "11434:11434"   # Ollama (Phi-3)
    environment:
      - SURREALDB_URL=http://ctas7-surrealdb:8000
      - NEURAL_MUX_URL=http://ctas7-neural-mux:50051
      - MEMORY_MESH_URL=http://ctas7-sledis:19014
    volumes:
      - plasma-data:/var/lib/plasma
      - wazuh-logs:/var/ossec/logs
      - kali-tools:/opt/kali-tools
      - wasm-nodes:/wasm/nodes
    networks:
      - ctas-network
    depends_on:
      - ctas7-surrealdb
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:18450/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ============================================================
  # SurrealDB (Task Registry)
  # ============================================================
  ctas7-surrealdb:
    image: surrealdb/surrealdb:latest
    container_name: ctas7-surrealdb
    command: start --log info --user root --pass root
    ports:
      - "8000:8000"
    volumes:
      - surrealdb-data:/data
    networks:
      - ctas-network
    restart: unless-stopped

networks:
  ctas-network:
    driver: bridge

volumes:
  plasma-data:
  wazuh-logs:
  kali-tools:
  wasm-nodes:
  surrealdb-data:
```

---

## **Phase 5: Testing & Validation**

### **Test Script**

```bash
#!/bin/bash
# File: /Users/cp5337/Developer/ctas7-shipyard-staging/ctas7-plasma-kali-purple/test-container.sh

echo "🧪 Testing Synaptix Plasma + Kali Purple Container"
echo "=================================================="

# Build container
echo "Building container..."
docker-compose build

# Start services
echo "Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to initialize..."
sleep 30

# Test Main Ops Integration API
echo "Testing Main Ops API..."
curl -f http://localhost:18450/health || echo "❌ Main Ops API failed"

# Test TTL Framework API
echo "Testing TTL Framework..."
curl -f http://localhost:18400/health || echo "❌ TTL Framework failed"

# Test Kali Tools API
echo "Testing Kali Tools..."
curl -f http://localhost:18300/health || echo "❌ Kali Tools failed"

# Test Micro-Macro Service
echo "Testing Micro-Macro Service..."
curl -f http://localhost:18350/health || echo "❌ Micro-Macro Service failed"

# Test Plasma API
echo "Testing Plasma API..."
curl -f http://localhost:18150/health || echo "❌ Plasma API failed"

# Test AXON
echo "Testing AXON..."
curl -f http://localhost:18102/health || echo "❌ AXON failed"

# Test Legion ECS
echo "Testing Legion ECS..."
curl -f http://localhost:18106/health || echo "❌ Legion ECS failed"

# Test HFT Ground Stations
echo "Testing HFT..."
curl -f http://localhost:18200/health || echo "❌ HFT failed"

# Test Wazuh
echo "Testing Wazuh..."
curl -f http://localhost:55000/ || echo "❌ Wazuh failed"

# Test Ollama (Phi-3)
echo "Testing Ollama..."
curl -f http://localhost:11434/ || echo "❌ Ollama failed"

echo ""
echo "✅ All tests complete!"
echo ""
echo "🎯 Main Ops can now connect to: http://localhost:18450"
```

---

# 🎯 **DELIVERABLES**

## **Expected Outputs:**

1. **Docker Container** - Unified Plasma + Kali Purple system
2. **Docker Compose** - Full orchestration with SurrealDB
3. **API Endpoints:**
   - `http://localhost:18450` - Main Ops integration
   - `http://localhost:18400` - TTL framework
   - `http://localhost:18350` - Micro-macro service
   - `http://localhost:18300` - Kali tools
   - `http://localhost:18150` - Plasma threat intelligence
4. **Documentation:**
   - API reference (OpenAPI/Swagger)
   - Deployment guide
   - Tool invocation examples
5. **Test Suite** - Validation scripts

---

# 🚀 **EXECUTION**

## **Build Commands:**

```bash
cd /Users/cp5337/Developer/ctas7-shipyard-staging/ctas7-plasma-kali-purple

# Build container
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f plasma-kali-purple

# Test health
curl http://localhost:18450/health

# Invoke tool via Unicode
curl -X POST http://localhost:18450/invoke \
  -H "Content-Type: application/json" \
  -d '{"unicode": "🎯", "mode": "auto"}'
```

---

# 📊 **SUCCESS CRITERIA**

✅ **Container builds successfully**
✅ **All services start and report healthy**
✅ **Main Ops can invoke tools via API**
✅ **TTL tasks map to tool chains**
✅ **Micro-to-macro escalation works**
✅ **Plasma threat intelligence active**
✅ **Kali tools execute correctly**
✅ **WASM nodes respond**
✅ **Phi-3 models loaded**
✅ **All ports accessible**

---

# 🎯 **INTEGRATION WITH MAIN OPS 7.1**

## **Frontend Connection:**

```typescript
// File: ctas7-main-ops-7.1/src/services/plasma-kali-integration.ts

export const PlasmaKaliClient = {
  baseUrl: 'http://localhost:18450',

  // Invoke tools via Unicode emoji
  async invokeByEmoji(emoji: string) {
    const response = await fetch(`${this.baseUrl}/invoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unicode: emoji, mode: 'auto' })
    });
    return response.json();
  },

  // Invoke tools via hash
  async invokeByHash(hash: string) {
    const response = await fetch(`${this.baseUrl}/invoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash, mode: 'auto' })
    });
    return response.json();
  },

  // Get system status
  async getStatus() {
    const response = await fetch(`${this.baseUrl}/status`);
    return response.json();
  },

  // Stream real-time results
  streamResults(onMessage: (data: any) => void) {
    const ws = new WebSocket('ws://localhost:18450/stream');
    ws.onmessage = (event) => {
      onMessage(JSON.parse(event.data));
    };
    return ws;
  }
};
```

---

# 🔧 **CUSTOMIZATION & EXTENSION**

## **Adding New Tools:**

1. Update `kali_tool_orchestrator.py` TOOLS registry
2. Add tool-specific validation logic
3. Map TTL tasks to new tools in `ttl_framework_api.py`
4. Test via API

## **Adding New Service Levels:**

1. Extend `ServiceLevel` enum in `micro_macro_service.py`
2. Implement `deploy_<level>()` function
3. Add to escalation ladder

## **Customizing TTL Framework:**

1. Modify task schema in Supabase migration
2. Update TTL task mapping logic
3. Add new Unicode/emoji mappings

---

# 📝 **NOTES FOR IMPLEMENTATION**

1. **Start with Core Services First:**
   - Get Wazuh, AXON, Legion, Ollama running
   - Test individually before integration

2. **Build Incrementally:**
   - Start with script-level tools
   - Add WASM nodes
   - Progress through escalation ladder

3. **Test Thoroughly:**
   - Each API endpoint
   - Tool invocation paths
   - Threat detection pipeline

4. **Monitor Resource Usage:**
   - Container memory limits
   - CPU allocation
   - Disk space for logs

5. **Security Considerations:**
   - Sandbox all tool executions
   - Validate all inputs
   - Log all actions
   - Implement rate limiting

---

**END OF BUILD PROMPT**

**Ready for Execution:** ✅
**Estimated Build Time:** 6-8 hours
**Container Size:** ~15GB (Kali + Rust + WASM + Models)
**Resource Requirements:** 16GB RAM, 8 CPU cores recommended
