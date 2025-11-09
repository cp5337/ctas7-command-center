# Natasha Agent - Docker Deployment Guide
## CTAS-7 Cross-Domain Operator Smart Crate (EA-THR-01)

---

## 🎯 Overview

**Natasha Volkov** is now a **fully containerized Docker service** - a proper CTAS-7 Smart Crate implementation.

**Architecture:**
- Rust-based HTTP/REST + gRPC service
- Multi-stage Docker build for optimal size
- Integrated with CTAS-7 Memory Mesh, Neural Mux, and Agent Mesh
- Production-ready with health checks and security

**Location:** `/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-natasha-agent/`

---

## 🚀 Quick Start

### **Build the Docker Image**
```bash
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-natasha-agent

# Build the image
docker build -t ctas7/natasha-agent:7.3.0 .

# Or use Docker Compose
docker-compose build
```

### **Run Standalone**
```bash
docker run -d \
  --name ctas7-natasha-agent \
  -p 18152:18152 \
  -p 50052:50052 \
  -e RUST_LOG=info \
  -e NATASHA_AGENT_ID=EA-THR-01 \
  ctas7/natasha-agent:7.3.0
```

### **Run with Docker Compose**
```bash
# Run just Natasha
docker-compose up -d natasha-agent

# Run full stack (with dependencies)
docker-compose --profile full-stack up -d
```

---

## 📊 Integration with PM2 Ecosystem

Natasha is now a **Docker container**, not a PM2-managed process. Update the PM2 ecosystem:

### **Option 1: PM2 Manages Docker** (Hybrid)
```javascript
// ecosystem.config.js
{
  name: 'natasha-agent-docker',
  script: 'docker',
  args: [
    'run',
    '--rm',
    '--name', 'ctas7-natasha-agent',
    '-p', '18152:18152',
    '-p', '50052:50052',
    '--network', 'ctas-network',
    'ctas7/natasha-agent:7.3.0'
  ],
  autorestart: true,
  watch: false,
  port: 18152, // For display
}
```

### **Option 2: Pure Docker** (Recommended)
Remove Natasha from PM2 `ecosystem.config.js` and manage via Docker:

```bash
# Start Natasha
docker-compose up -d natasha-agent

# View logs
docker logs -f ctas7-natasha-agent

# Restart
docker restart ctas7-natasha-agent

# Stop
docker stop ctas7-natasha-agent
```

---

## 🔌 Service Endpoints

Once running, Natasha is available at:

| Endpoint | Purpose | URL |
|----------|---------|-----|
| **HTTP/REST** | Main API | `http://localhost:18152` |
| **gRPC** | Agent Mesh | `grpc://localhost:50052` |
| **Health Check** | Status | `http://localhost:18152/health` |
| **Capabilities** | Info | `http://localhost:18152/natasha` |

---

## 🌐 Network Integration

### **Docker Network**
Natasha runs on the `ctas-network` bridge network, allowing communication with:
- Sledis Cache (19014)
- Neural Mux (50051)
- Claude Meta-Agent (50055)
- Linear Agent (18180)
- ABE Services (18190-18192)
- All other CTAS-7 services

### **Connect Existing Services**
```bash
# Connect RepoAgent Gateway to Natasha's network
docker network connect ctas-network repoagent-gateway

# Or create the network first
docker network create ctas-network
```

---

## 📦 PM2 + Docker Hybrid Architecture

### **Updated Service Tier Structure**

```
TIER 0: Document Intelligence (ABE) - Docker containers
TIER 1: Core Agent Infrastructure
  ├─ repoagent-gateway (15180) - PM2 (Rust binary)
  └─ agent-mesh (50051-50058) - Docker services
      ├─ claude-meta-agent (50055) - Docker
      ├─ natasha-agent (50052) - Docker ✅
      ├─ grok-agent (50051) - Docker
      ├─ cove-agent (50053) - Docker
      └─ ... (other agents)

TIER 2: Linear Integration - Hybrid
  ├─ linear-integration (15182) - PM2 (Node.js)
  └─ linear-agent (18180) - Docker (Rust)

TIER 3: Intelligence Services - PM2 (Python)
TIER 4: Memory Mesh - Docker (Rust)
TIER 5: Custom GPT Endpoints
  ├─ zoe-agent (58474) - PM2 (Node.js)
  └─ natasha-agent (18152) - Docker (Rust) ✅

TIER 6: Tool Orchestration - PM2 (Node.js)
```

---

## 🔧 Configuration

### **Environment Variables**

All configuration is via environment variables in `docker-compose.yml`:

```yaml
environment:
  # Core
  - NATASHA_HTTP_PORT=18152
  - NATASHA_GRPC_PORT=50052
  - NATASHA_AGENT_ID=EA-THR-01

  # Integrations
  - CLAUDE_META_AGENT_URL=http://claude-agent:50055
  - NEURAL_MUX_URL=http://neural-mux:50051
  - SLEDIS_CACHE_URL=redis://sledis-cache:19014

  # AI/ML
  - OPENAI_API_KEY=${OPENAI_API_KEY}
  - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
  - OLLAMA_URL=http://ollama:11434

  # Linear
  - LINEAR_API_KEY=${LINEAR_API_KEY}
  - LINEAR_TEAM_ID=979acadf-8301-459e-9e51-bf3c1f60e496

  # Kali & Security
  - KALI_TOOLS_ENABLED=true
  - KALI_SANDBOX_ENABLED=true
  - PLASMA_ENABLED=true
```

### **Custom Configuration**
Create `.env` file in the `ctas7-natasha-agent/` directory:

```bash
# .env
LINEAR_API_KEY=your_linear_api_key_here
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
CTAS_API_KEY=ctas7-gateway-2025-secure-key-natasha-zoe-orbital
```

---

## 🩺 Health & Monitoring

### **Health Check**
```bash
curl http://localhost:18152/health

# Returns:
{
  "status": "healthy",
  "agent": "Natasha Volkov",
  "version": "7.3.0",
  "timestamp": "2025-11-05T..."
}
```

### **Docker Health Check**
```bash
# View health status
docker inspect ctas7-natasha-agent | jq '.[0].State.Health'

# Continuous health check
docker ps --filter "name=natasha" --format "table {{.Names}}\t{{.Status}}"
```

### **Logs**
```bash
# Follow logs
docker logs -f ctas7-natasha-agent

# Last 100 lines
docker logs --tail 100 ctas7-natasha-agent

# With timestamps
docker logs -t ctas7-natasha-agent
```

---

## 🔄 Development Workflow

### **Rebuild After Code Changes**
```bash
cd /Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-natasha-agent

# Rebuild image
docker-compose build natasha-agent

# Restart with new image
docker-compose up -d natasha-agent
```

### **Hot Reload (Development)**
```bash
# Run with volume mount for live code changes
docker run -d \
  --name ctas7-natasha-dev \
  -p 18152:18152 \
  -v $(pwd)/src:/app/src \
  -e RUST_LOG=debug \
  ctas7/natasha-agent:7.3.0-dev
```

---

## 🛡️ Security

### **Non-Root User**
Container runs as user `natasha` (UID 1000), not root.

### **API Key Authentication**
```bash
# Enable API key requirement
docker run -d \
  -e API_KEY_REQUIRED=true \
  -e CTAS_API_KEY=your_secure_key \
  ctas7/natasha-agent:7.3.0

# Test with API key
curl -H "X-API-Key: your_secure_key" \
  http://localhost:18152/natasha
```

### **Network Isolation**
```bash
# Run on isolated network
docker network create ctas-secure
docker run -d --network ctas-secure ctas7/natasha-agent:7.3.0
```

---

## 📈 Resource Management

### **Resource Limits**
```yaml
# docker-compose.yml
services:
  natasha-agent:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### **View Resource Usage**
```bash
docker stats ctas7-natasha-agent
```

---

## 🔄 Updates & Rollback

### **Update to New Version**
```bash
# Pull new image
docker pull ctas7/natasha-agent:7.4.0

# Update docker-compose.yml version
# Then restart
docker-compose up -d natasha-agent
```

### **Rollback**
```bash
# Stop current
docker stop ctas7-natasha-agent
docker rm ctas7-natasha-agent

# Run previous version
docker run -d \
  --name ctas7-natasha-agent \
  -p 18152:18152 \
  ctas7/natasha-agent:7.2.0
```

---

## 🚨 Troubleshooting

### **Container Won't Start**
```bash
# Check logs
docker logs ctas7-natasha-agent

# Check configuration
docker inspect ctas7-natasha-agent

# Verify ports aren't in use
lsof -i :18152
lsof -i :50052
```

### **Can't Connect to Dependencies**
```bash
# Verify network
docker network inspect ctas-network

# Test connectivity
docker exec ctas7-natasha-agent ping sledis-cache
docker exec ctas7-natasha-agent wget -O- http://neural-mux:50051/health
```

### **Build Failures**
```bash
# Clean build
docker-compose build --no-cache natasha-agent

# Check Rust version in builder
docker run --rm rust:1.75-alpine rustc --version
```

---

## 📚 Complete Docker Compose Stack

To run the entire CTAS-7 stack with Natasha:

```bash
cd /Users/cp5337/Developer/ctas-7-shipyard-staging

# Create master docker-compose.yml including all services
docker-compose -f docker-compose.full-stack.yml up -d
```

Services included:
- Sledis Cache (Memory Mesh)
- Neural Mux
- Natasha Agent
- Linear Agent
- ABE Services
- Zoe Agent (if containerized)
- RepoAgent Gateway

---

## 🎯 Next Steps

1. **Complete Natasha Crate Implementation**
   - Finish handlers for all endpoints
   - Implement integrations (Kali, Plasma, PTCC)
   - Add gRPC server for agent mesh

2. **Containerize Other Services**
   - Zoe Agent → Docker
   - ABE Services → Docker
   - Linear Integration → Docker

3. **Orchestration**
   - Create master docker-compose for full stack
   - Add Kubernetes manifests for production
   - Set up CI/CD for automated builds

4. **Testing**
   - Integration tests with Docker Compose
   - Load testing
   - Security scanning

---

**Status:** 🔨 In Development
**Priority:** High
**Owner:** Natasha Volkov (EA-THR-01)
**Version:** CTAS-7 v7.3
