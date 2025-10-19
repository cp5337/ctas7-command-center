# CTAS-7 RepoAgent Service Deployment

This directory contains service deployment configurations for the CTAS-7 Multi-Agent Orchestration System.

## Quick Start

### Automatic Deployment (Recommended)
```bash
# Full deployment with auto-detection
./deploy.sh

# Build release binary only
./deploy.sh --build-only

# Check service status
./deploy.sh --status
```

### Manual Deployment

#### Linux (systemd)
```bash
# Build release binary
cd ../ctas-7-shipyard-staging
cargo build --release -p ctas7-repoagent --features "neural-mux unicode-assembly" --bin repoagent-server

# Copy service file
sudo cp deployment/ctas7-repoagent.service /etc/systemd/system/

# Create ctas user and directories
sudo useradd -r -s /bin/false -d /opt/ctas7-shipyard-staging ctas
sudo mkdir -p /opt/ctas7-shipyard-staging/{logs,target/release}
sudo cp target/release/repoagent-server /opt/ctas7-shipyard-staging/target/release/
sudo chown -R ctas:ctas /opt/ctas7-shipyard-staging

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable --now ctas7-repoagent
```

#### macOS (launchd)
```bash
# Build release binary
cd ../ctas-7-shipyard-staging
cargo build --release -p ctas7-repoagent --features "neural-mux unicode-assembly" --bin repoagent-server

# Create logs directory
mkdir -p ../ctas7-command-center/logs

# Install service
cp deployment/com.ctas7.repoagent.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.ctas7.repoagent.plist
```

## Service Management

### Linux (systemd)
```bash
# Start/stop/restart
sudo systemctl start ctas7-repoagent
sudo systemctl stop ctas7-repoagent
sudo systemctl restart ctas7-repoagent

# Check status
sudo systemctl status ctas7-repoagent

# View logs
sudo journalctl -u ctas7-repoagent -f

# Disable service
sudo systemctl disable ctas7-repoagent
```

### macOS (launchd)
```bash
# Check status
launchctl list | grep ctas7

# View logs
tail -f ../logs/repoagent.log
tail -f ../logs/repoagent.error.log

# Stop service
launchctl unload ~/Library/LaunchAgents/com.ctas7.repoagent.plist

# Start service
launchctl load ~/Library/LaunchAgents/com.ctas7.repoagent.plist
```

## Service Configuration

### systemd Features
- **Security**: Sandboxed with restricted filesystem access
- **Resource Limits**: 2GB memory, 200% CPU quota
- **Network Security**: Localhost-only access
- **Auto-restart**: Always restart on failure with 5s delay
- **Logging**: Integrated with systemd journal

### launchd Features
- **Auto-start**: Starts on boot and after crashes
- **Logging**: Separate stdout/stderr log files
- **Development**: Optimized for local development
- **Resource Management**: macOS-native resource handling

## Service Endpoints

Once deployed, the service provides:

- **HTTP Server**: `http://localhost:15180`
- **Health Check**: `GET /ping`
- **Repository APIs**: `/repo/status`, `/repo/tree`, `/repo/file`
- **Agent Dispatch**: `POST /agents/dispatch`
- **Playbook Mux**: `/mux/playbook`

## Multi-Agent System

The service initializes three agents on startup:

1. **🔍 Agent Cove** (RepoOps Inspector)
   - Commands: `inspect_repo`, `organize_repo`, `report_status`

2. **🛡️ Agent Natasha** (Cyber Intel Analyst)
   - Commands: `analyze_threats`, `intel_report`, `report_status`

3. **⚙️ Agent Hayes** (Ops Coordinator)
   - Commands: `coordinate_ops`, `status_briefing`, `report_status`

## CTAS-7 Foundation Integration

The service includes:
- 🔥 CTAS-7 Foundation Integration
- 💎 Gold Disk Retrofit
- 🧠 Neural Mux
- 🔗 Hash Engine Global Authority
- 📊 Statistical Engine
- 🎯 Smart Crate System (Tesla/SpaceX Grade)

## Testing Deployment

```bash
# Test health endpoint
curl http://localhost:15180/ping | jq

# Test agent dispatch
curl -X POST http://localhost:15180/agents/dispatch \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"agent-cove","command":"report_status"}' | jq

# Test repository status
curl http://localhost:15180/repo/status | jq
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port 15180
   lsof -i :15180

   # Kill process if needed
   kill -9 <PID>
   ```

2. **Permission denied (Linux)**
   ```bash
   # Check service user permissions
   sudo -u ctas ls /opt/ctas7-shipyard-staging

   # Fix ownership if needed
   sudo chown -R ctas:ctas /opt/ctas7-shipyard-staging
   ```

3. **Service won't start**
   ```bash
   # Linux: Check systemd logs
   sudo journalctl -u ctas7-repoagent --no-pager

   # macOS: Check log files
   cat ~/Developer/ctas7-command-center/logs/repoagent.error.log
   ```

### Build Issues

```bash
# Clean build
cd ../ctas-7-shipyard-staging
cargo clean
cargo build --release -p ctas7-repoagent --features "neural-mux unicode-assembly" --bin repoagent-server

# Check dependencies
cargo check -p ctas7-repoagent
```

## Security Notes

- The systemd service runs as a dedicated `ctas` user with minimal privileges
- Network access is restricted to localhost only
- Filesystem access is sandboxed using systemd security features
- Resource limits prevent runaway processes

## Updates

To update the service:

1. Pull latest code changes
2. Run `./deploy.sh` again (automatically rebuilds and restarts)
3. Or manually build and restart the service