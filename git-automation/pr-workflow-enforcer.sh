#!/bin/bash
###############################################################################
# CTAS 7.3 - PR Workflow Enforcer (Pre-Push Hook)
# Purpose: Block direct commits to main/master, enforce PR workflow
# Usage: Install as Git pre-push hook (see setup instructions at bottom)
###############################################################################

set -euo pipefail

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Protected branches (no direct push)
PROTECTED_BRANCHES=("main" "master" "production" "staging")

# PhD QA thresholds
MIN_PRIMITIVE_DENSITY=500.0  # 500% minimum (656.8% is Tesla-grade)

echo "=========================================="
echo "CTAS PR Workflow Enforcer"
echo "Branch: $CURRENT_BRANCH"
echo "=========================================="

# Function: Check if branch is protected
is_protected_branch() {
    local branch=$1
    for protected in "${PROTECTED_BRANCHES[@]}"; do
        if [[ "$branch" == "$protected" ]]; then
            return 0  # True
        fi
    done
    return 1  # False
}

# Function: Run PhD QA validation (if available)
run_phd_qa() {
    local phd_qa_path="/Users/cp5337/Developer/ctas-7-shipyard-staging/ctas7-qa-analyzer"
    
    if [ ! -d "$phd_qa_path" ]; then
        echo -e "${YELLOW}⚠️  PhD QA not found at $phd_qa_path${NC}"
        echo "Skipping primitive density check"
        return 0  # Allow push if PhD QA not available
    fi
    
    echo "Running PhD QA validation..."
    
    # Find Rust files in current changeset
    RUST_FILES=$(git diff --name-only origin/"$CURRENT_BRANCH".."$CURRENT_BRANCH" 2>/dev/null | grep '\.rs$' || echo "")
    
    if [ -z "$RUST_FILES" ]; then
        echo -e "${GREEN}✓  No Rust files changed, skipping PhD QA${NC}"
        return 0
    fi
    
    echo "Analyzing Rust files:"
    echo "$RUST_FILES" | while read -r file; do echo "  - $file"; done
    
    # Run PhD QA (mock for now - replace with actual command)
    # TODO: Integrate actual PhD QA analyzer
    PRIMITIVE_DENSITY=0.0  # Placeholder
    
    echo -e "${YELLOW}⚠️  PhD QA integration pending${NC}"
    echo "Primitive density check: SKIPPED (not implemented)"
    
    # If PhD QA were integrated:
    # if (( $(echo "$PRIMITIVE_DENSITY < $MIN_PRIMITIVE_DENSITY" | bc -l) )); then
    #     echo -e "${RED}❌ PhD QA FAILED${NC}"
    #     echo "Primitive density: ${PRIMITIVE_DENSITY}% (minimum: ${MIN_PRIMITIVE_DENSITY}%)"
    #     return 1
    # fi
    
    return 0
}

# Function: Check commit message format
check_commit_messages() {
    echo "Checking commit message format..."
    
    # Get commits being pushed
    COMMITS=$(git log origin/"$CURRENT_BRANCH".."$CURRENT_BRANCH" --format="%H %s" 2>/dev/null || echo "")
    
    if [ -z "$COMMITS" ]; then
        echo -e "${GREEN}✓  No new commits${NC}"
        return 0
    fi
    
    BAD_MESSAGES=0
    while IFS= read -r line; do
        COMMIT_HASH=$(echo "$line" | cut -d' ' -f1)
        COMMIT_MSG=$(echo "$line" | cut -d' ' -f2-)
        
        # Check conventional commit format: type(scope): message
        if ! echo "$COMMIT_MSG" | grep -qE '^(feat|fix|chore|docs|refactor|test|style|perf|ci|build)\(.+\):.+'; then
            # Allow auto-commit messages
            if ! echo "$COMMIT_MSG" | grep -q 'chore(auto): hourly auto-commit'; then
                echo -e "${YELLOW}⚠️  Non-standard commit message:${NC}"
                echo "   $COMMIT_HASH: $COMMIT_MSG"
                ((BAD_MESSAGES++))
            fi
        fi
    done <<< "$COMMITS"
    
    if [ "$BAD_MESSAGES" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $BAD_MESSAGES commit(s) with non-standard messages${NC}"
        echo "Expected format: type(scope): message"
        echo "Types: feat, fix, chore, docs, refactor, test, style, perf, ci, build"
        echo ""
        echo "This is a warning, not a blocker. Consider rebasing with proper messages."
    fi
    
    return 0  # Don't block on bad messages, just warn
}

# Function: Check for sensitive data
check_sensitive_data() {
    echo "Checking for sensitive data..."
    
    # Patterns to detect
    PATTERNS=(
        "api_key"
        "apikey"
        "password"
        "secret"
        "token"
        "private_key"
        "-----BEGIN RSA PRIVATE KEY-----"
        "-----BEGIN OPENSSH PRIVATE KEY-----"
    )
    
    FOUND_SENSITIVE=0
    for pattern in "${PATTERNS[@]}"; do
        if git diff --cached | grep -qi "$pattern"; then
            echo -e "${RED}❌ Potential sensitive data detected: $pattern${NC}"
            ((FOUND_SENSITIVE++))
        fi
    done
    
    if [ "$FOUND_SENSITIVE" -gt 0 ]; then
        echo -e "${RED}❌ BLOCKED: Sensitive data detected in commit${NC}"
        echo "Remove sensitive data and use environment variables or secret managers"
        return 1
    fi
    
    echo -e "${GREEN}✓  No sensitive data detected${NC}"
    return 0
}

# MAIN LOGIC

# 1. Check if pushing to protected branch
if is_protected_branch "$CURRENT_BRANCH"; then
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}❌ PUSH BLOCKED${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo "You are attempting to push directly to a protected branch: $CURRENT_BRANCH"
    echo ""
    echo "CTAS requires PR-based workflow for code review and quality assurance."
    echo ""
    echo "Required workflow:"
    echo "  1. Create a feature branch:"
    echo "     git checkout -b feature/your-feature-name"
    echo ""
    echo "  2. Make your changes and commit:"
    echo "     git add ."
    echo "     git commit -m 'feat(component): description'"
    echo ""
    echo "  3. Push your feature branch:"
    echo "     git push -u origin feature/your-feature-name"
    echo ""
    echo "  4. Create a Pull Request on GitHub"
    echo ""
    echo "  5. After review and approval, merge via GitHub"
    echo ""
    echo -e "${YELLOW}Exception: Auto-commit branches (auto-commit/*) are allowed${NC}"
    echo ""
    exit 1
fi

# 2. Run validations for feature branches
echo ""
echo "Running pre-push validations..."
echo ""

# Check commit messages (warning only)
check_commit_messages

# Check for sensitive data (blocking)
if ! check_sensitive_data; then
    exit 1
fi

# Run PhD QA (if available)
if ! run_phd_qa; then
    exit 1
fi

# All checks passed
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓  All validations passed${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Pushing to $CURRENT_BRANCH..."
echo "Remember to create a PR for code review!"
echo ""

exit 0

###############################################################################
# INSTALLATION INSTRUCTIONS
###############################################################################
#
# To install this pre-push hook in a repository:
#
# 1. Make executable:
#    chmod +x /Users/cp5337/Developer/ctas7-command-center/git-automation/pr-workflow-enforcer.sh
#
# 2. For a single repository:
#    cd /path/to/repo
#    ln -s /Users/cp5337/Developer/ctas7-command-center/git-automation/pr-workflow-enforcer.sh .git/hooks/pre-push
#
# 3. For all CTAS repositories (run from command-center):
#    ./git-automation/install-hooks.sh
#
# 4. Test the hook:
#    git checkout main
#    echo "test" >> test.txt
#    git add test.txt
#    git commit -m "test"
#    git push  # Should be blocked!
#
# 5. Bypass in emergency (NOT RECOMMENDED):
#    git push --no-verify
#
###############################################################################

