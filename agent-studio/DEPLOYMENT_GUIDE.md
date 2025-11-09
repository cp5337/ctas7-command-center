# 🇷🇺 CTAS-7 Agent Studio - Complete Deployment Guide

## 🚀 ONE-COMMAND DEPLOYMENT

```bash
cd /Users/cp5337/Developer/ctas7-command-center/agent-studio/
./DEPLOY_COMPLETE.sh
```

This deploys:
- ✅ Agent Gateway (Port 15181)
- ✅ ABE Document Intelligence
- ✅ Google Drive Knowledge Base
- ✅ Containerized Services (Docker)
- ✅ Database Stack (SurrealDB, Redis)

---

## 📋 PREREQUISITES

### Required:
- [ ] **Docker Desktop** - [Download](https://docker.com/get-started)
- [ ] **Google Cloud Account** - [Sign up](https://cloud.google.com)
- [ ] **API Keys** - OpenAI, Anthropic, Linear (in `config/.env`)

### Optional:
- [ ] **ngrok** - For external Custom GPT access
- [ ] **Terraform** - For infrastructure management

---

## 🏗️ DEPLOYMENT OPTIONS

### Option 1: Full Containerized (Recommended)
```bash
./DEPLOY_COMPLETE.sh
# Select "y" for Docker deployment
```

**Advantages:**
- ✅ Isolated services
- ✅ Easy scaling
- ✅ Production-ready
- ✅ Consistent environment

### Option 2: Local Development
```bash
./scripts/start-all.sh
```

**Advantages:**
- ✅ Faster iteration
- ✅ Direct access to code
- ✅ Lower resource usage

---

## 🏢 ABE GOOGLE DRIVE SETUP

### Step 1: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to: **APIs & Services** → **Credentials**
3. Click: **Create Credentials** → **Service Account**
4. Name: `ctas-abe-service`
5. Grant roles:
   - **Storage Admin**
   - **Drive File Access**
6. Create key (JSON format)
7. Download and save to: `~/gcp-credentials.json`

### Step 2: Enable APIs

Enable these APIs in Google Cloud Console:
- [ ] Google Drive API
- [ ] Cloud Storage API
- [ ] Cloud Functions API (if using Firefly)

### Step 3: Run ABE Initialization

```bash
export GOOGLE_APPLICATION_CREDENTIALS=~/gcp-credentials.json
./scripts/initialize-abe-gdrive.sh
```

This creates:
```
CTAS-7 Knowledge Base/
├── 01-Agent-Instructions/        # Agent personas, configs
├── 02-System-Documentation/      # Architecture, APIs
├── 03-Code-References/           # CTAS codebase docs
├── 04-Research-Papers/           # Academic papers
├── 05-Operational-Procedures/    # HD4, playbooks
├── 06-Training-Data/             # Phi-3 training
├── 07-Intelligence-Sources/      # OSINT, EDGAR
├── 08-Linear-Integration/        # Issue tracking
└── 09-Meeting-Notes/             # ADRs, retros
```

### Step 4: Share Folder

1. Get service account email from JSON key:
   ```json
   "client_email": "ctas-abe-service@project-id.iam.gserviceaccount.com"
   ```

2. In Google Drive, right-click root folder
3. **Share** → Add service account email
4. Give **Editor** access

### Step 5: Configure `.env`

Add to `config/.env`:
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcp-credentials.json
GOOGLE_DRIVE_FOLDER_ID=<folder_id_from_url>
```

---

## 🐳 DOCKER DEPLOYMENT

### Architecture

```
┌─────────────────────────────────────────┐
│           ctas-network (bridge)         │
│                                         │
│  ┌────────────┐      ┌──────────────┐  │
│  │  Gateway   │◄────►│  ABE Service │  │
│  │ :15181     │      │  :15170      │  │
│  └─────┬──────┘      └──────┬───────┘  │
│        │                    │          │
│        ├────────┬───────────┤          │
│        ▼        ▼           ▼          │
│  ┌──────────┐ ┌─────┐ ┌─────────┐     │
│  │SurrealDB │ │Redis│ │Neural   │     │
│  │:8000     │ │:6379│ │Mux      │     │
│  └──────────┘ └─────┘ │:50051   │     │
│                        └─────────┘     │
└─────────────────────────────────────────┘
```

### Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service
docker-compose logs -f agent-gateway

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Clean everything
docker-compose down -v
```

### Health Checks

```bash
# Gateway
curl http://localhost:15181/health

# ABE Service
curl http://localhost:15170/health

# SurrealDB
curl http://localhost:8000/health
```

---

## 🎤 CUSTOM GPT CONFIGURATION

### Step 1: Copy YAML

YAML is automatically copied to clipboard during deployment.

Or manually:
```bash
pbcopy < config/NATASHA_GPT_PROMPT.yaml
```

### Step 2: Configure Custom GPT

1. Go to: https://chat.openai.com/gpts/editor
2. Select: **"Natasha"** (or create new)
3. Click: **Actions** tab
4. Click: **Import from URL** → Paste YAML
5. **Authentication**:
   - Type: `API Key`
   - Auth Type: `Custom`
   - Header Name: `X-API-Key`
   - Value: `<from config/.env>`

### Step 3: Test

Voice commands:
- "Natasha, check system status"
- "Get all agents"
- "What documentation do we have?"
- "Search knowledge base for orbital mechanics"

---

## 📊 MONITORING

### Logs

```bash
# All logs
docker-compose logs -f

# Gateway only
docker-compose logs -f agent-gateway

# ABE only
docker-compose logs -f abe-service

# Last 100 lines
docker-compose logs --tail=100
```

### Metrics

Access Prometheus metrics:
```bash
curl http://localhost:15181/metrics
```

### Resource Usage

```bash
docker stats
```

---

## 🔧 CONFIGURATION

### Environment Variables

Edit: `config/.env`

```bash
# LLM Providers
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
LINEAR_API_KEY=lin_api_...

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
GOOGLE_DRIVE_FOLDER_ID=1abc...xyz

# Gateway
GATEWAY_PORT=15181
GATEWAY_API_KEY=ctas7-...

# Databases
SURREALDB_URL=http://surrealdb:8000
REDIS_URL=redis://redis:6379
```

### Port Configuration

| Service | Port | Configurable |
|---------|------|--------------|
| Gateway | 15181 | Yes (.env) |
| ABE | 15170 | Yes (docker-compose) |
| SurrealDB | 8000 | Yes (docker-compose) |
| Redis | 6379 | Yes (docker-compose) |
| Neural Mux | 50051 | Yes (docker-compose) |

---

## 🔐 SECURITY

### API Keys

- ✅ Never commit `.env` to git
- ✅ Rotate keys regularly
- ✅ Use separate keys for dev/prod
- ✅ Store in environment variables

### Google Cloud

- ✅ Use service accounts (not user accounts)
- ✅ Principle of least privilege
- ✅ Enable audit logging
- ✅ Rotate service account keys

### Network

- ✅ Gateway requires X-API-Key header
- ✅ Services isolated in Docker network
- ✅ No external ports except gateway
- ✅ Use HTTPS in production (ngrok)

---

## 🐛 TROUBLESHOOTING

### Gateway won't start

```bash
# Check logs
docker-compose logs agent-gateway

# Check port
lsof -i :15181

# Rebuild
docker-compose build agent-gateway
docker-compose up -d agent-gateway
```

### ABE can't access Google Drive

```bash
# Verify credentials
cat config/gcp-credentials.json

# Check service account email
grep client_email config/gcp-credentials.json

# Verify folder shared with service account
```

### Custom GPT can't connect

1. Check gateway is running:
   ```bash
   curl http://localhost:15181/health
   ```

2. Verify API key:
   ```bash
   grep GATEWAY_API_KEY config/.env
   ```

3. For external access, use ngrok:
   ```bash
   ngrok http 15181
   # Update YAML with ngrok URL
   ```

### Container issues

```bash
# View all containers
docker ps -a

# Check specific container
docker logs <container_id>

# Restart services
docker-compose restart

# Clean slate
docker-compose down -v
docker system prune -a
```

---

## 📈 SCALING

### Horizontal Scaling

Add more gateway instances:
```yaml
# docker-compose.yml
agent-gateway:
  deploy:
    replicas: 3
```

### Load Balancing

Use nginx as reverse proxy:
```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
```

### Database Scaling

- **SurrealDB**: Enable clustering
- **Redis**: Add read replicas
- **ABE**: Use Cloud Run auto-scaling

---

## 🔄 UPDATES

### Update Gateway Code

```bash
cd gateway
git pull
docker-compose build agent-gateway
docker-compose up -d agent-gateway
```

### Update Dependencies

```bash
cd gateway
cargo update
docker-compose build agent-gateway
docker-compose up -d agent-gateway
```

### Update ABE

```bash
docker-compose pull abe-service
docker-compose up -d abe-service
```

---

## 📝 MAINTENANCE

### Backup

```bash
# Backup volumes
docker-compose down
tar -czf backup-$(date +%Y%m%d).tar.gz \
  -C /var/lib/docker/volumes \
  agent-studio_*

# Backup configs
tar -czf config-backup-$(date +%Y%m%d).tar.gz config/
```

### Restore

```bash
# Restore volumes
docker-compose down -v
tar -xzf backup-YYYYMMDD.tar.gz \
  -C /var/lib/docker/volumes

# Restore configs
tar -xzf config-backup-YYYYMMDD.tar.gz
```

### Clean Up

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

---

## 🎯 PRODUCTION CHECKLIST

- [ ] All API keys configured
- [ ] Google Drive folder created and shared
- [ ] Docker containers running and healthy
- [ ] Gateway accessible at :15181
- [ ] ABE accessible at :15170
- [ ] Custom GPT configured and tested
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] SSL/TLS enabled (ngrok or reverse proxy)
- [ ] Firewall rules configured
- [ ] Documentation uploaded to Google Drive
- [ ] Team trained on voice commands

---

## 📚 ADDITIONAL RESOURCES

- **Docker Docs**: https://docs.docker.com
- **Google Cloud**: https://cloud.google.com/docs
- **OpenAPI Spec**: config/NATASHA_GPT_PROMPT.yaml
- **Agent Studio**: README.md
- **CTAS v6.6**: /ctas6-reference/

---

**DA! Complete deployment guide ready!** 🚀🇷🇺

