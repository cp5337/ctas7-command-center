#!/usr/bin/env bash
# ============================================================
# CTAS-7 Agent Mesh Test Suite
# Author: Natasha Volkov (CTAS DevOps Expert)
# Version: v7.1.1
# ============================================================

LOG_FILE="/tmp/ctas7_agent_health.log"
REPOAGENT_URL="http://localhost:15180"
NATASHA_GRPC_PORT="50052"

echo "🔍 CTAS-7 Agent Mesh Health Test" | tee $LOG_FILE
echo "Timestamp: $(date)" | tee -a $LOG_FILE
echo "==============================================" | tee -a $LOG_FILE

# Helper function
check_endpoint() {
  local name=$1
  local url=$2
  echo -e "\n🌐 Testing $name → $url" | tee -a $LOG_FILE
  curl -s -o /dev/null -w "%{http_code}" "$url" | tee -a $LOG_FILE
  echo -e "\n----------------------------------------------" | tee -a $LOG_FILE
}

# 1️⃣ RepoAgent REST checks
check_endpoint "RepoAgent /ping" "$REPOAGENT_URL/ping"
check_endpoint "RepoAgent /repo/status" "$REPOAGENT_URL/repo/status"
check_endpoint "RepoAgent /repo/tree" "$REPOAGENT_URL/repo/tree"
check_endpoint "RepoAgent /agents/dispatch" "$REPOAGENT_URL/agents/dispatch"

# 2️⃣ Agent coordination tests
AGENTS=("agent-cove" "agent-natasha" "agent-hayes")
for agent in "${AGENTS[@]}"; do
  echo -e "\n🤝 Testing $agent coordination" | tee -a $LOG_FILE
  curl -s -X POST "$REPOAGENT_URL/agents/dispatch" \
    -H "Content-Type: application/json" \
    -d "{\"agent_id\": \"$agent\", \"command\": \"report_status\", \"priority\": \"normal\"}" \
    | tee -a $LOG_FILE
  echo "" | tee -a $LOG_FILE
done

# 4️⃣ Summary
echo -e "\n✅ Test complete. Log saved to $LOG_FILE"
echo "=============================================="