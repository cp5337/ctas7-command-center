#!/bin/bash
###############################################################################
# CTAS 7.3 - Hourly Git Auto-Commit
# Purpose: Never lose work again - auto-commits uncommitted changes every hour
# Usage: Run via cron (see setup instructions at bottom)
###############################################################################

set -euo pipefail

# Configuration
REPOS=(
    "/Users/cp5337/Developer/ctas7-command-center"
    "/Users/cp5337/Developer/ctas-7-shipyard-staging"
    "/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas-7.0-main-ops-platform"
    "/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-enterprise-mcp-cyrus"
    "/Users/cp5337/Developer/ctas7-EEI-staging"
    "/Users/cp5337/Developer/ctas7-shipyard-system"
    "/Users/cp5337/Developer/ctas7-crate-analyzer-system"
    "/Users/cp5337/Developer/orbital-gis-platform"
    "/Users/cp5337/Developer/usim-system"
    "/Users/cp5337/Developer/agent_os-Claude"
)

LOG_FILE="/Users/cp5337/Developer/ctas7-command-center/logs/hourly-commit.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
BRANCH_PREFIX="auto-commit"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[${TIMESTAMP}] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "Starting hourly auto-commit cycle"
log "=========================================="

for REPO in "${REPOS[@]}"; do
    if [ ! -d "$REPO" ]; then
        log "⚠️  Skipping $REPO (not found)"
        continue
    fi
    
    cd "$REPO" || continue
    REPO_NAME=$(basename "$REPO")
    
    log "Checking $REPO_NAME..."
    
    # Check if Git repo
    if [ ! -d ".git" ]; then
        log "⚠️  Skipping $REPO_NAME (not a Git repository)"
        continue
    fi
    
    # Get current branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
    
    # Check for uncommitted changes
    if git diff --quiet && git diff --cached --quiet; then
        log "✓  $REPO_NAME - No uncommitted changes"
        continue
    fi
    
    # Check if we're on main/master (should use a feature branch)
    if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
        # Create auto-commit branch
        AUTO_BRANCH="${BRANCH_PREFIX}/$(date '+%Y%m%d-%H%M')"
        log "⚠️  On $CURRENT_BRANCH - creating branch $AUTO_BRANCH"
        
        # Create and switch to auto-commit branch
        if git checkout -b "$AUTO_BRANCH" 2>/dev/null; then
            log "✓  Created branch $AUTO_BRANCH"
        else
            log "❌  Failed to create branch in $REPO_NAME"
            continue
        fi
    fi
    
    # Stage all changes (including untracked files, excluding ignored)
    git add -A
    
    # Commit with timestamp
    COMMIT_MSG="chore(auto): hourly auto-commit - ${TIMESTAMP}

This is an automatic hourly commit to prevent work loss.
Changes have been staged but may need cleanup and proper commit messages.

Branch: $CURRENT_BRANCH
Timestamp: $TIMESTAMP
Machine: $(hostname)"
    
    if git commit -m "$COMMIT_MSG" 2>&1 | tee -a "$LOG_FILE"; then
        log "✓  $REPO_NAME - Committed changes on ${CURRENT_BRANCH}"
        
        # Push to remote (if configured)
        if git remote get-url origin &>/dev/null; then
            if git push -u origin "$CURRENT_BRANCH" 2>&1 | tee -a "$LOG_FILE"; then
                log "✓  $REPO_NAME - Pushed to origin/${CURRENT_BRANCH}"
            else
                log "⚠️  $REPO_NAME - Failed to push (may need auth)"
            fi
        fi
    else
        log "⚠️  $REPO_NAME - Commit failed (see log)"
    fi
done

log "=========================================="
log "Hourly auto-commit cycle complete"
log "=========================================="

###############################################################################
# CRON SETUP INSTRUCTIONS
###############################################################################
# 
# To enable hourly auto-commits:
#
# 1. Make this script executable:
#    chmod +x /Users/cp5337/Developer/ctas7-command-center/git-automation/hourly-commit.sh
#
# 2. Edit crontab:
#    crontab -e
#
# 3. Add this line (runs at minute 0 of every hour):
#    0 * * * * /Users/cp5337/Developer/ctas7-command-center/git-automation/hourly-commit.sh
#
# 4. For testing (runs every 5 minutes):
#    */5 * * * * /Users/cp5337/Developer/ctas7-command-center/git-automation/hourly-commit.sh
#
# 5. Verify cron job:
#    crontab -l
#
# 6. Check logs:
#    tail -f /Users/cp5337/Developer/ctas7-command-center/logs/hourly-commit.log
#
###############################################################################

