#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CTAS-7 Service Startup Script
# Start all services via PM2 with organized display
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 CTAS-7 Service Manager"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 not found. Installing..."
    npm install -g pm2
fi

echo "✅ PM2 installed: $(pm2 --version)"
echo ""

# Check environment variables
echo "🔑 Checking environment variables..."
MISSING_VARS=()

[ -z "$LINEAR_API_KEY" ] && MISSING_VARS+=("LINEAR_API_KEY")
[ -z "$CLAUDE_API_KEY" ] && MISSING_VARS+=("CLAUDE_API_KEY")
[ -z "$ANTHROPIC_API_KEY" ] && MISSING_VARS+=("ANTHROPIC_API_KEY")
[ -z "$GITHUB_TOKEN" ] && MISSING_VARS+=("GITHUB_TOKEN")

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "⚠️  Missing environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "💡 Set them in ~/.zshrc or ~/.bashrc:"
    echo "   export LINEAR_API_KEY='lin_api_...'"
    echo "   export CLAUDE_API_KEY='sk-ant-...'"
    echo "   export ANTHROPIC_API_KEY='sk-ant-...'"
    echo "   export GITHUB_TOKEN='ghp_...'"
    echo ""
fi

# Navigate to command center
cd /Users/cp5337/Developer/ctas7-command-center

# Create Linear Integration Server if it doesn't exist
if [ ! -f "linear-integration-server/server.js" ]; then
    echo "📝 Creating Linear Integration Server..."
    mkdir -p linear-integration-server
    cat > linear-integration-server/server.js << 'EOF'
const express = require('express');
const { LinearClient } = require('@linear/sdk');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 15182;
const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });

// ASCII Banner
console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     CTAS-7 Linear Integration Server v7.1.1              ║
║     GraphQL Wrapper for Linear API                       ║
║                                                           ║
║     Port: ${PORT}                                         ║
║     Status: ONLINE                                       ║
║     Team: CognetixALPHA (COG)                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

app.get('/health', (req, res) => {
  res.json({ status: 'online', service: 'linear-integration', port: PORT });
});

app.post('/issues/create', async (req, res) => {
  try {
    const issue = await linear.issueCreate({
      teamId: process.env.LINEAR_TEAM_ID || '979acadf-8301-459e-9e51-bf3c1f60e496',
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      estimate: req.body.estimate
    });
    res.json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/webhooks/linear', async (req, res) => {
  console.log('📥 Linear webhook:', req.body.action);
  // Route to RepoAgent Gateway or Linear Agent
  res.json({ status: 'processed' });
});

app.listen(PORT, () => {
  console.log(`✅ Linear Integration Server listening on port ${PORT}`);
});
EOF

    cd linear-integration-server
    npm init -y
    npm install express @linear/sdk dotenv
    cd ..
    echo "✅ Linear Integration Server created"
fi

# Start services via PM2
echo ""
echo "🚀 Starting services..."
echo ""

pm2 start ecosystem.config.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All services started!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Service Dashboard:"
pm2 status
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 Useful Commands:"
echo "   pm2 status            # View all services"
echo "   pm2 logs              # View all logs"
echo "   pm2 logs <service>    # View specific service logs"
echo "   pm2 restart <service> # Restart a service"
echo "   pm2 stop <service>    # Stop a service"
echo "   pm2 monit             # Real-time monitoring"
echo "   pm2 save              # Save current process list"
echo "   pm2 startup           # Enable auto-start on boot"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
