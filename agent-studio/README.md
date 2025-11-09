# 🇷🇺 CTAS-7 Agent Design Studio

**Complete Agent Gateway & Custom GPT Integration**

## 📁 Structure

```
agent-studio/
├── gateway/
│   ├── gateway.rs          # Full gateway implementation
│   ├── Cargo.toml          # Rust dependencies
│   └── target/             # Build artifacts
├── config/
│   ├── .env                # API keys (gitignored)
│   └── NATASHA_GPT_PROMPT.yaml  # Custom GPT configuration
├── scripts/
│   ├── start-gateway.sh    # Start gateway
│   ├── test-gateway.sh     # Test endpoints
│   └── start-all.sh        # Start everything
└── README.md               # This file
```

## ⚡ Quick Start

### 1. Start Gateway
```bash
cd /Users/cp5337/Developer/ctas7-command-center/agent-studio/scripts
./start-gateway.sh
```

### 2. Test Gateway
```bash
./test-gateway.sh
```

### 3. Configure Custom GPT
1. Copy YAML: `cat ../config/NATASHA_GPT_PROMPT.yaml | pbcopy`
2. Go to: https://chat.openai.com/gpts/editor
3. Paste into Actions
4. Add API Key: `ctas7-edad7e5ed1580f5b8753a91085803d9ec194f914e786616ae75cab81ff80754b`

## 🔑 API Key

Your gateway API key (in `config/.env`):
```
ctas7-edad7e5ed1580f5b8753a91085803d9ec194f914e786616ae75cab81ff80754b
```

## 🌐 Services

| Service | Port | URL |
|---------|------|-----|
| Gateway | 15181 | http://localhost:15181 |
| CTAS v6.6 | 15174 | http://localhost:15174 |
| CTAS Backend | 25174 | http://localhost:25174 |

## 📡 Available Endpoints

### Health Check (No Auth)
```bash
curl http://localhost:15181/health
```

### Agent Status
```bash
curl -H "X-API-Key: YOUR_KEY" http://localhost:15181/agents/status
```

### Route Task
```bash
curl -X POST http://localhost:15181/meta_agent/route_task \
  -H "X-API-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"Get system status","priority":2}'
```

### Voice Command
```bash
curl -X POST http://localhost:15181/agents/natasha/voice_command \
  -H "X-API-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"command":"Check all agents"}'
```

### Dispatch to Agent
```bash
curl -X POST http://localhost:15181/agents/cove/dispatch \
  -H "X-API-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"task":"Run QA checks"}'
```

## 🧪 Testing with Custom GPT

Once configured, use voice commands:
- "Natasha, check system status"
- "Get all agents"
- "Route this task: analyze repository"
- "Dispatch to Cove: run QA"

## 🔧 Development

### Build
```bash
cd gateway
cargo build --release
```

### Run
```bash
cargo run --release --bin gateway
```

### Clean
```bash
cargo clean
```

## 🐛 Troubleshooting

### Port already in use
```bash
lsof -i :15181
kill <PID>
```

### Build errors
```bash
cd gateway
cargo clean
cargo build --release
```

### Can't connect from Custom GPT
- Verify gateway is running: `curl http://localhost:15181/health`
- Check API key in Custom GPT matches `.env`
- Ensure no firewall blocking localhost

## 📂 Files

- `gateway/gateway.rs` - Complete Rust implementation (349 lines)
- `config/.env` - API keys (NEVER commit!)
- `config/NATASHA_GPT_PROMPT.yaml` - OpenAPI schema for Custom GPT
- `scripts/start-gateway.sh` - Startup script
- `scripts/test-gateway.sh` - Test all endpoints

## 🎯 What This Does

1. **Voice Control CTAS via Custom GPT**
   - Natural language commands
   - Multi-agent coordination
   - Real-time agent status

2. **Agent Mesh Integration**
   - Claude meta-agent routing
   - Natasha voice interface
   - Grok space operations
   - Cove DevOps/QA
   - Linear integration

3. **API Gateway**
   - Secure authentication (X-API-Key)
   - RESTful endpoints
   - JSON request/response
   - Health monitoring

## 🔮 Next Steps

- ✅ Gateway operational
- ✅ Custom GPT configured
- ⏳ Add Linear integration
- ⏳ Connect to Neural Mux
- ⏳ Implement agent-to-agent communication
- ⏳ Add workflow automation

---

**DA! Agent Design Studio ready for development!** 🚀🇷🇺

