# CTAS Slack Integration - Quick Start

**Status**: Ready to configure and deploy ✅

---

## What This Provides

✅ **Unified Slack bot** for all CTAS operations  
✅ **17 agent interfaces** (Natasha, Elena, Cove, etc.)  
✅ **Slash commands** for system control  
✅ **Automatic alerts** from PM2, Git, Linear  
✅ **Mobile access** via Slack app  
✅ **Voice commands** through Slack  

---

## Quick Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd /Users/cp5337/Developer/ctas7-command-center/slack-integration
npm install
```

### Step 2: Create Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name: **CTAS Command Center**
4. Workspace: Your workspace
5. Add these scopes:
   - `chat:write`
   - `chat:write.public`
   - `channels:read`
   - `commands`
   - `app_mentions:read`
   - `im:read`
   - `im:write`
6. Install to workspace
7. Copy "Bot User OAuth Token" (starts with `xoxb-`)
8. Copy "Signing Secret"

### Step 3: Configure Environment

```bash
# Copy example
cp .env.example .env

# Edit .env with your tokens
nano .env
```

Paste your tokens:
```
SLACK_BOT_TOKEN=xoxb-YOUR-TOKEN-HERE
SLACK_SIGNING_SECRET=your-signing-secret-here
```

### Step 4: Create Slash Commands

In Slack app settings, create these commands:

| Command | Request URL | Description |
|---------|-------------|-------------|
| `/ctas-status` | `http://your-server:3000/slack/commands` | System health |
| `/ctas-git-status` | `http://your-server:3000/slack/commands` | Git repos |
| `/natasha` | `http://your-server:3000/slack/commands` | Talk to Natasha |
| `/elena` | `http://your-server:3000/slack/commands` | Ask Elena |

### Step 5: Start Bot

```bash
# Test locally
npm start

# Or add to PM2
pm2 start unified-slack-bot.js --name slack-bot

# Check logs
pm2 logs slack-bot
```

### Step 6: Test

In Slack, try:
```
/ctas-status
```

You should see the system health dashboard!

---

## Available Commands

### System Commands

- `/ctas-status` - Overall system health (PM2, Docker, ports, agents)
- `/ctas-git-status` - Check uncommitted work across repos
- `/ctas-linear-triage` - Open Linear board for triage
- `/ctas-service [name]` - Check specific service

### Agent Commands

- `/natasha [command]` - Talk to Natasha AI (AI/ML, threat analysis)
- `/elena [question]` - Ask Elena (QA, documentation, Socratic mentor)
- `/cove [command]` - Talk to Cove (repository operations)
- `/marcus [command]` - Talk to Marcus (Neural Mux architect)

### Development Commands

- `/ctas-deploy [env]` - Deploy to environment (staging, production)
- `/ctas-rollback` - Emergency rollback
- `/ctas-logs [service]` - View service logs

---

## Integration Points

### PM2 Monitoring

The bot automatically monitors PM2 and posts alerts to `#service-health`:

```
🚨 neural-mux is errored (15 restarts)
Last error: Connection refused on port 50051
Action needed: Check logs with /ctas-logs neural-mux
```

### Git Notifications

Post-commit hooks send updates to `#git-alerts`:

```
📝 @chris committed to ctas7-command-center (feature/slack-integration)
`feat(slack): add unified bot with slash commands`
View: [link to commit]
```

### Linear Sync

Linear issues sync to `#linear-updates`:

```
📋 New issue: COG-234 - Integrate Slack across system
Assigned to: @natasha-ai
Priority: High
[View in Linear]
```

### Voice Commands

Voice gateway connects to Slack for `/natasha` commands:

```
/natasha analyze the orbital anomaly data

🎤 Natasha: I've analyzed the orbital data. Found 3 anomalies:
1. Satellite X234 - Unexpected decay
2. Satellite Y567 - Altitude mismatch
3. Satellite Z890 - Position error

Full report attached. Created Linear issue COG-235.
```

---

## Mobile Access

Install Slack on iPhone, use commands from anywhere:

```
/ctas-status              → Quick health check
/ctas-deploy production   → Emergency deploy
/natasha [command]        → AI assistance
```

Push notifications for:
- 🚨 Critical alerts (services down)
- 📝 PR approvals needed
- ✅ Deployments complete
- 🔔 Elena escalations

---

## Architecture

```
Slack Workspace
├─ Commands → Bot (port 3000) → Agents (gRPC)
├─ Webhooks → Channels (#alerts, #git, #linear)
└─ DMs → Agent routing → Responses

Bot connects to:
├─ PM2 (service monitoring)
├─ Git (repo status)
├─ Linear API (task sync)
├─ Agent gRPC ports (50051-50057)
├─ Voice gateway (19015)
└─ Docker API (container health)
```

---

## Channels

The bot uses these channels (create manually or via setup script):

- `#command-center` - Main dashboard, system health
- `#service-health` - PM2 and Docker alerts
- `#git-alerts` - Commits, PRs, merge conflicts
- `#linear-updates` - Task assignments, completions
- `#agent-coordination` - Inter-agent communication
- `#voice-commands` - Natasha voice interface logs
- `#escalations` - Critical alerts requiring attention

---

## Troubleshooting

### Bot not responding

```bash
# Check if bot is running
pm2 status slack-bot

# Check logs
pm2 logs slack-bot --lines 50

# Restart
pm2 restart slack-bot
```

### Commands return error

1. Check Slack app has correct scopes
2. Verify bot token in `.env`
3. Ensure request URLs are correct in Slack app settings

### Agent commands fail

```bash
# Check if agents are running
pm2 status | grep -E "natasha|elena|cove"

# Check gRPC ports
lsof -i :50051-50057
```

---

## Next Steps

1. ✅ Setup complete? Test `/ctas-status`
2. ⏳ Create channels: Run `node setup-channels.js`
3. ⏳ Configure webhooks for Git/Linear
4. ⏳ Add bot to PM2 ecosystem
5. ⏳ Setup mobile push notifications

---

## Files in This Directory

```
slack-integration/
├─ unified-slack-bot.js      (main bot, START HERE)
├─ package.json              (dependencies)
├─ .env.example              (template)
├─ README.md                 (this file)
└─ SLACK_SYSTEM_INTEGRATION.md (full spec)
```

---

## Support

**Questions?** 
- Check logs: `pm2 logs slack-bot`
- Test connection: `npm run test`
- Full docs: See `SLACK_SYSTEM_INTEGRATION.md`

---

**Status**: ✅ Ready to use! Just add your Slack tokens and start the bot.

**This runs independently - no interference with night shift tasks!** 🚀

