# CTAS-7 Universal PhD QA Base Image
## Build Once, Use Everywhere

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every Docker Container Inherits PhD QA Infrastructure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Philosophy

**PhD QA is ALWAYS present, invocation is OPTIONAL**

Like having a fire extinguisher in every room - you don't use it constantly, but it's there when you need it.

## Build Base Image

```bash
cd /Users/cp5337/Developer/ctas7-command-center/docker-base-images

# Build QA gRPC service first
cd qa-grpc-service
cargo build --release
cd ..

# Build universal base image
docker build -f Dockerfile.qa-base -t ctas7/qa-base:latest .

# Tag for versioning
docker tag ctas7/qa-base:latest ctas7/qa-base:7.1.0
```

## Use in Your Services

### Example: Agent Gateway with PhD QA
```dockerfile
FROM ctas7/qa-base:latest

# Your service code
COPY . /app
WORKDIR /app

# Build your service
RUN cargo build --release

# PhD QA available via:
#   - gRPC: localhost:50099
#   - CLI: qa-invoke --service gateway
#   - Smart Crate: via SCO orchestration

# Start both service and QA gRPC server
CMD ["sh", "-c", "qa-grpc-service & ./target/release/gateway"]
```

### Example: Forge with PhD QA
```dockerfile
FROM ctas7/qa-base:latest

COPY . /app
WORKDIR /app

RUN cargo build --release

EXPOSE 18220 50099

CMD ["sh", "-c", "qa-grpc-service & ./target/release/forge"]
```

### Example: Neural Mux with PhD QA
```dockerfile
FROM ctas7/qa-base:latest

COPY . /app
WORKDIR /app

RUN cargo build --release

EXPOSE 50051 50099

CMD ["sh", "-c", "qa-grpc-service & ./target/release/neural-mux"]
```

## Smart Crate Orchestrator Integration

### SCO Can Invoke QA on Any Container

```rust
// From Smart Crate Orchestrator
use tonic::Request;
use qa::qa_service_client::QaServiceClient;
use qa::QaInvokeRequest;

#[tokio::main]
async fn sco_invoke_qa_on_service(service_name: &str) -> Result<()> {
    // Connect to service's embedded QA
    let qa_endpoint = format!("http://{}:50099", service_name);
    let mut client = QaServiceClient::connect(qa_endpoint).await?;

    // Invoke PhD QA
    let request = Request::new(QaInvokeRequest {
        service_name: service_name.to_string(),
        crate_path: "/app".to_string(),
        full_suite: true,
        tools: vec![],
    });

    let response = client.invoke_qa(request).await?;

    println!("QA Result: {:?}", response.into_inner());
    Ok(())
}
```

### Docker Compose Example

```yaml
version: '3.8'

services:
  agent-gateway:
    build:
      context: ./gateway
      dockerfile: Dockerfile
    # Inherits from ctas7/qa-base
    # PhD QA available on port 50099
    ports:
      - "15181:15181"
      - "50099:50099"  # QA gRPC
    environment:
      - QA_ENABLED=true
      - QA_AUTO_RUN=false  # Manual invocation only
      - SCO_GRPC_ENDPOINT=http://sco:18200

  forge:
    build:
      context: ./forge
      dockerfile: Dockerfile
    ports:
      - "18220:18220"
      - "50100:50099"  # QA gRPC on different external port
    environment:
      - QA_ENABLED=true

  neural-mux:
    build:
      context: ./neural-mux
      dockerfile: Dockerfile
    ports:
      - "50051:50051"
      - "50101:50099"  # QA gRPC
    environment:
      - QA_ENABLED=true

  # Smart Crate Orchestrator
  sco:
    image: ctas7/sco:latest
    ports:
      - "18200:18200"
    # SCO can invoke QA on any service via gRPC
    environment:
      - SERVICES=agent-gateway:50099,forge:50100,neural-mux:50101
```

## Invocation Methods

### 1. CLI (Inside Container)
```bash
# Quick check
docker exec ctas-agent-gateway qa-invoke --service gateway

# Full PhD suite
docker exec ctas-agent-gateway qa-invoke --service gateway --full

# Specific tools
docker exec ctas-agent-gateway phd-suite --clippy --geiger
```

### 2. gRPC (From SCO or External)
```bash
# Using grpcurl
grpcurl -plaintext -d '{"service_name": "gateway", "crate_path": "/app", "full_suite": true}' \
  localhost:50099 ctas.qa.QaService/InvokeQa
```

### 3. Smart Crate System
```rust
// SCO automatically invokes QA based on events:
// - On deployment
// - On schedule (hourly, daily)
// - On-demand from Linear/Raycast
// - Pre-commit via Git hooks
```

### 4. Linear Integration
```bash
# Create Linear issue that triggers QA
linear create "Run QA on gateway service" --label qa-request

# SCO watches Linear, invokes QA, posts results
```

## Configuration

### Environment Variables

```bash
# Enable/disable QA
QA_ENABLED=true

# Auto-run on startup (default: false)
QA_AUTO_RUN=false

# gRPC port (default: 50099)
QA_GRPC_PORT=50099

# Smart Crate Orchestrator endpoint
SCO_GRPC_ENDPOINT=http://sco:18200

# Results directory
QA_RESULTS_DIR=/var/ctas/qa-results
```

## What's Included in Base Image

### ✅ Rust QA Tools
- cargo clippy (linting)
- cargo fmt (formatting)
- cargo audit (security)
- cargo geiger (unsafe code)
- cargo tarpaulin (coverage)
- cargo outdated (dependencies)
- cargo deny (licenses)

### ✅ PhD QA Binaries
- phd-analyzer (comprehensive analysis)
- clone-checker (excessive clones)
- post-stats (metrics)

### ✅ gRPC Service
- qa-grpc-service (port 50099)
- Proto definitions
- Smart Crate integration

### ✅ Scripts
- phd-suite.sh (run all tools)
- qa-invoke.sh (convenient CLI)

## Benefits

1. **Consistency**: Every service has same QA capabilities
2. **No Duplication**: Build tools once, use everywhere
3. **Optional**: QA doesn't run unless invoked
4. **Discoverable**: gRPC makes QA programmable
5. **Integrated**: Works with Smart Crate system
6. **Fortune 10**: Professional quality gates

## Updating All Services

When you update the base image, rebuild all services:

```bash
# Update base
docker build -f Dockerfile.qa-base -t ctas7/qa-base:latest .

# Rebuild all services
docker-compose build

# Or rebuild specific service
docker-compose build agent-gateway
```

## Example: Invoke QA from Raycast

```bash
#!/bin/bash
# Raycast script: Run QA on Service

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Run PhD QA
# @raycast.mode fullOutput
# @raycast.argument1 { "type": "text", "placeholder": "Service name" }

SERVICE=$1

# Invoke QA via gRPC
grpcurl -plaintext \
  -d "{\"service_name\": \"$SERVICE\", \"crate_path\": \"/app\", \"full_suite\": true}" \
  localhost:50099 ctas.qa.QaService/InvokeQa
```

---

**Status**: ✅ Universal base image architecture designed
**PhD QA**: Embedded in every container
**Invocation**: Optional via gRPC/CLI/SCO
**Integration**: Smart Crate Orchestrator ready
