# CTAS-7 PM2 Service Manager

**Status:** ✅ READY TO USE
**Manager:** PM2 (Node.js Process Manager)
**Services:** 8 CTAS services organized by port

---

## 🎯 **WHAT IS PM2?**

**PM2** is a production-grade process manager for Node.js applications with:
- ✅ **Beautiful ASCII dashboard** - Organized display of all services
- ✅ **Auto-restart** - Services restart if they crash
- ✅ **Log management** - Centralized logging for all services
- ✅ **Resource monitoring** - CPU, memory, uptime tracking
- ✅ **Cluster mode** - Run multiple instances
- ✅ **Startup scripts** - Auto-start services on system boot

---

## 🚀 **QUICK START**

### **Start All Services:**
```bash
cd /Users/cp5337/Developer/ctas7-command-center
./START_ALL_SERVICES.sh
```

### **View Service Dashboard:**
```bash
pm2 status
```

**You'll see:**
```
┌────┬──────────────────────┬─────────┬─────────┬──────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name                 │ mode    │ ↺      │ status│ cpu      │ mem    │ user │ watching  │ port     │ uptime   │
├────┼──────────────────────┼─────────┼─────────┼──────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ repoagent-gateway    │ fork    │ 0      │ online│ 0%       │ 45 MB  │ cp   │ disabled  │ 15180    │ 2h       │
│ 1  │ linear-integration   │ fork    │ 0      │ online│ 0.1%     │ 32 MB  │ cp   │ disabled  │ 15182    │ 2h       │
│ 2  │ agent-mesh           │ fork    │ 0      │ online│ 1%       │ 128 MB │ cp   │ disabled  │ 50055    │ 2h       │
│ 3  │ linear-agent         │ fork    │ 0      │ online│ 0.5%     │ 67 MB  │ cp   │ disabled  │ 18180    │ 2h       │
│ 4  │ osint-engine         │ fork    │ 0      │ online│ 0.2%     │ 89 MB  │ cp   │ disabled  │ 18200    │ 2h       │
│ 5  │ corporate-analyzer   │ fork    │ 0      │ online│ 0.1%     │ 54 MB  │ cp   │ disabled  │ 18201    │ 2h       │
│ 6  │ tool-server          │ fork    │ 0      │ online│ 0%       │ 28 MB  │ cp   │ disabled  │ 18295    │ 2h       │
└────┴──────────────────────┴─────────┴─────────┴──────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┘
```

---

## 📋 **SERVICE ORGANIZATION**

### **Foundation Layer (15180-15199)**
```
15180  repoagent-gateway       HTTP/gRPC    Entry point for all requests
15182  linear-integration      HTTP/REST    GraphQL wrapper for Linear
```

### **Agent Mesh (50051-50057)**
```
50051  Grok Agent              gRPC         Space engineering
50052  Natasha Agent           gRPC         Voice/AI/RedTeam
50053  Cove Agent              gRPC         DevOps/QA
50054  Altair Agent            gRPC         Space analysis
50055  Claude Meta-Agent       gRPC         Task routing (part of agent-mesh)
50056  GPT Agent               gRPC         Tactical operations
50057  Gemini Agent            gRPC         Enterprise architecture
```

### **Service Layer (18100-18399)**
```
18180  linear-agent            HTTP/REST    Linear workflow orchestration
18200  osint-engine            HTTP         OSINT intelligence gathering
18201  corporate-analyzer      HTTP         Corporate entity analysis
18295  tool-server             HTTP         Development tools
```

---

## 💻 **PM2 COMMANDS**

### **Status & Monitoring:**
```bash
pm2 status                    # View all services
pm2 monit                     # Real-time monitoring dashboard
pm2 logs                      # View all logs (live tail)
pm2 logs <service-name>       # View specific service logs
pm2 show <service-name>       # Detailed service information
```

### **Service Control:**
```bash
pm2 start ecosystem.config.js # Start all services
pm2 restart <service-name>    # Restart specific service
pm2 restart all               # Restart all services
pm2 stop <service-name>       # Stop specific service
pm2 stop all                  # Stop all services
pm2 delete <service-name>     # Remove service from PM2
pm2 delete all                # Remove all services
```

### **Advanced Features:**
```bash
pm2 save                      # Save current process list
pm2 resurrect                 # Restore saved processes
pm2 startup                   # Enable auto-start on boot
pm2 unstartup                 # Disable auto-start
pm2 update                    # Update PM2 daemon
```

### **Logging:**
```bash
pm2 logs --lines 100          # View last 100 lines
pm2 logs --err                # Show only errors
pm2 flush                     # Clear all logs
pm2 reloadLogs                # Reload logs
```

---

## 🔧 **CONFIGURATION**

### **Ecosystem Config:**
Location: `/Users/cp5337/Developer/ctas7-command-center/ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: 'service-name',
      script: './server.js',
      env: {
        PORT: '15180',
        NODE_ENV: 'production'
      },
      max_memory_restart: '1G',
      time: true
    }
  ]
};
```

### **Environment Variables:**
Set in `~/.zshrc` or `~/.bashrc`:
```bash
export LINEAR_API_KEY='lin_api_...'
export CLAUDE_API_KEY='sk-ant-...'
export ANTHROPIC_API_KEY='sk-ant-...'
export OPENAI_API_KEY='sk-...'
export GEMINI_API_KEY='AIza...'
export GITHUB_TOKEN='ghp_...'
```

---

## 🔍 **TROUBLESHOOTING**

### **Service Won't Start:**
```bash
# Check logs
pm2 logs <service-name> --err

# Check if port is in use
lsof -i :<port>

# Try manual start
cd /path/to/service
node server.js  # or cargo run
```

### **Service Keeps Restarting:**
```bash
# Check memory usage
pm2 monit

# Increase memory limit in ecosystem.config.js
max_memory_restart: '2G'

# Check error logs
pm2 logs <service-name> --err --lines 50
```

### **PM2 Not Found:**
```bash
# Install PM2 globally
npm install -g pm2

# Or use npx
npx pm2 status
```

---

## 📊 **MONITORING & METRICS**

### **Real-time Dashboard:**
```bash
pm2 monit
```

Shows:
- CPU usage per process
- Memory usage per process
- Network traffic
- Event loop latency
- Logs in real-time

### **Web Dashboard (Optional):**
```bash
pm2 plus
```

Sign up for PM2 Plus for:
- Web-based monitoring
- Email alerts
- Performance metrics
- Custom dashboards

---

## 🚀 **AUTO-START ON BOOT**

### **Enable:**
```bash
pm2 startup
# Follow the displayed command
pm2 save
```

### **Disable:**
```bash
pm2 unstartup
```

### **Test:**
```bash
# Restart system
# After reboot, check:
pm2 status
```

---

## 📝 **ADDING NEW SERVICES**

### **1. Add to ecosystem.config.js:**
```javascript
{
  name: 'my-new-service',
  script: './my-service.js',
  cwd: '/path/to/service',
  env: {
    PORT: '18300',
    NODE_ENV: 'production'
  },
  max_memory_restart: '500M',
  time: true
}
```

### **2. Reload PM2:**
```bash
pm2 reload ecosystem.config.js
```

### **3. Save Configuration:**
```bash
pm2 save
```

---

## 🎯 **BEST PRACTICES**

### **DO:**
- ✅ Use `pm2 save` after making changes
- ✅ Enable `pm2 startup` for production
- ✅ Set appropriate `max_memory_restart`
- ✅ Use `pm2 logs` for debugging
- ✅ Monitor with `pm2 monit` regularly

### **DON'T:**
- ❌ Run services as root unnecessarily
- ❌ Ignore memory limits
- ❌ Forget to save after changes
- ❌ Use PM2 for one-off scripts

---

## 📖 **RELATED DOCUMENTATION**

- **Ecosystem Config:** `ecosystem.config.js`
- **Startup Script:** `START_ALL_SERVICES.sh`
- **Agent Architecture:** `CTAS_REPOAGENT_LINEAR_COMPLETE_ARCHITECTURE.md`
- **Service Status:** Run `pm2 status`

---

## 🆘 **QUICK REFERENCE**

```bash
# Start everything
./START_ALL_SERVICES.sh

# View dashboard
pm2 status

# Real-time monitor
pm2 monit

# View logs
pm2 logs

# Restart a service
pm2 restart linear-integration

# Stop everything
pm2 stop all

# Enable auto-start
pm2 startup && pm2 save
```

---

**Classification:** UNCLASSIFIED // CTAS INTERNAL
**Date:** November 5, 2025
**Version:** 7.1.1
**Manager:** PM2 v5.x
