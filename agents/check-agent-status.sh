#!/bin/bash
#
# Check Agent Status Dashboard
# Shows PM2 services, ports, and Linear integration
#

echo "🤖 SYNAPTIX AGENT STATUS DASHBOARD"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# PM2 Services
echo "📊 PM2 SERVICES:"
pm2 jlist 2>/dev/null | jq -r '.[] | "  \(.name | .[0:20] | @text): \(.pm2_env.status | ascii_upcase) (PID: \(.pid))"' 2>/dev/null || echo "  ⚠️  PM2 not running or no services"
echo ""

# Port Status
echo "🔌 PORT STATUS:"
AGENT_PORTS=(50050 50051 50052 50053 50054 50058 18180 19015 50059 50060 50061 50064 50066)
AGENT_NAMES=("Claude-Meta" "Marcus" "Natasha" "Cove" "Elena" "ABE" "Sarah" "Lachlan" "BuildSync" "DesignAudit" "iOSValidator" "DocGen" "ThemeValidator")

for i in "${!AGENT_PORTS[@]}"; do
  port="${AGENT_PORTS[$i]}"
  name="${AGENT_NAMES[$i]}"
  if lsof -i :$port > /dev/null 2>&1; then
    echo "  ✅ Port $port ($name): LISTENING"
  else
    echo "  ○  Port $port ($name): CLOSED"
  fi
done
echo ""

# Linear Integration
echo "🔗 LINEAR INTEGRATION:"
if curl -s http://localhost:18180/health > /dev/null 2>&1; then
  echo "  ✅ Sarah (Linear agent): ONLINE"
else
  echo "  ❌ Sarah (Linear agent): OFFLINE"
fi
echo ""

# Voice Gateway
echo "🎤 VOICE GATEWAY:"
if curl -s http://localhost:19015/health > /dev/null 2>&1; then
  echo "  ✅ Lachlan (Voice): ONLINE"
else
  echo "  ❌ Lachlan (Voice): OFFLINE"
fi
echo ""

# Quick Actions
echo "⚡ QUICK ACTIONS:"
echo "  pm2 restart all         - Restart all services"
echo "  pm2 logs <agent>        - View agent logs"
echo "  pm2 monit               - Real-time monitoring"
echo "  pm2 stop all            - Stop all services"
echo ""

echo "═══════════════════════════════════════════════════════════════════════════════"

