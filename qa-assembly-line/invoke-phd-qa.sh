#!/usr/bin/env bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CTAS-7 QA Assembly Line - PhD Analysis Invoker
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# Invokes the embedded PhD QA system and processes results
#
# Usage:
#   ./invoke-phd-qa.sh [--crate CRATE_NAME] [--commit] [--linear]
#
# Options:
#   --crate    : Analyze specific crate only
#   --commit   : Run as pre-commit check
#   --linear   : Post results to Linear
#   --ci       : CI/CD mode (fail on errors)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SHIPYARD_PATH="/Users/cp5337/Developer/ctas-7-shipyard-staging"
PHD_QA_SCRIPT="$SHIPYARD_PATH/run-qa.sh"
RESULTS_DIR="$SHIPYARD_PATH/qa-results"
ASSEMBLY_LINE_LOG="./qa-assembly-line.log"

# Google Sheets upload configuration (optional)
SHEETS_CREDS_PATH="${SHEETS_CREDS_PATH:-}"
SHEETS_NAME="${SHEETS_NAME:-CTAS7 QA Results}"
UPLOAD_TO_SHEETS="${UPLOAD_TO_SHEETS:-false}"
PYTHON_UPLOADER="./qa_results_to_sheets.py"

# Parse arguments
SPECIFIC_CRATE=""
COMMIT_MODE=false
LINEAR_MODE=false
CI_MODE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --crate)
      SPECIFIC_CRATE="$2"
      shift 2
      ;;
    --commit)
      COMMIT_MODE=true
      shift
      ;;
    --linear)
      LINEAR_MODE=true
      shift
      ;;
    --ci)
      CI_MODE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔬 CTAS-7 QA Assembly Line${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verify PhD QA system exists
if [ ! -f "$PHD_QA_SCRIPT" ]; then
    echo -e "${RED}❌ PhD QA system not found at: $PHD_QA_SCRIPT${NC}"
    echo -e "${YELLOW}Expected location: /Users/cp5337/Developer/ctas-7-shipyard-staging/run-qa.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PhD QA system found${NC}"
echo -e "   Location: $PHD_QA_SCRIPT"
echo ""

# Log start
echo "[$(date)] QA Assembly Line Started" >> "$ASSEMBLY_LINE_LOG"

# Run PhD QA System
echo -e "${BLUE}🚀 Invoking PhD Analysis System...${NC}"
echo ""

cd "$SHIPYARD_PATH"

if [ -n "$SPECIFIC_CRATE" ]; then
    echo -e "${YELLOW}📦 Analyzing specific crate: $SPECIFIC_CRATE${NC}"
    # Run PhD QA on specific crate (would need to modify run-qa.sh to support this)
    bash "$PHD_QA_SCRIPT"
else
    echo -e "${YELLOW}📦 Analyzing all crates...${NC}"
    bash "$PHD_QA_SCRIPT"
fi

QA_EXIT_CODE=$?

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Processing QA Results${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if results exist
if [ ! -d "$RESULTS_DIR" ]; then
    echo -e "${RED}❌ Results directory not found: $RESULTS_DIR${NC}"
    exit 1
fi

# Parse results
TOTAL_CRATES=0
PASS_COUNT=0
WARNING_COUNT=0
ERROR_COUNT=0
CRITICAL_COUNT=0

for json in "$RESULTS_DIR"/*-clone.json; do
    if [ -f "$json" ]; then
        TOTAL_CRATES=$((TOTAL_CRATES + 1))

        # Extract crate name
        crate=$(basename "$json" -clone.json)

        # Parse JSON (requires jq)
        if command -v jq &> /dev/null; then
            total_clones=$(jq -r '.total_clones' "$json" 2>/dev/null || echo "N/A")
            status=$(jq -r '.status' "$json" 2>/dev/null || echo "UNKNOWN")

            case $status in
                "PASS")
                    PASS_COUNT=$((PASS_COUNT + 1))
                    echo -e "${GREEN}✅ $crate: PASS ($total_clones clones)${NC}"
                    ;;
                "WARNING")
                    WARNING_COUNT=$((WARNING_COUNT + 1))
                    echo -e "${YELLOW}⚠️  $crate: WARNING ($total_clones clones)${NC}"
                    ;;
                "ERROR")
                    ERROR_COUNT=$((ERROR_COUNT + 1))
                    echo -e "${RED}❌ $crate: ERROR ($total_clones clones)${NC}"
                    ;;
                "CRITICAL")
                    CRITICAL_COUNT=$((CRITICAL_COUNT + 1))
                    echo -e "${RED}🔥 $crate: CRITICAL ($total_clones clones)${NC}"
                    ;;
                *)
                    echo -e "${YELLOW}❓ $crate: UNKNOWN${NC}"
                    ;;
            esac
        else
            echo -e "${YELLOW}⚠️  $crate (install jq for detailed analysis)${NC}"
        fi
    fi
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📈 Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Total Crates:    $TOTAL_CRATES"
echo -e "${GREEN}✅ Pass:         $PASS_COUNT${NC}"
echo -e "${YELLOW}⚠️  Warnings:     $WARNING_COUNT${NC}"
echo -e "${RED}❌ Errors:       $ERROR_COUNT${NC}"
echo -e "${RED}🔥 Critical:     $CRITICAL_COUNT${NC}"
echo ""

# Log results
echo "[$(date)] QA Complete - Pass:$PASS_COUNT Warn:$WARNING_COUNT Error:$ERROR_COUNT Critical:$CRITICAL_COUNT" >> "$ASSEMBLY_LINE_LOG"

# If requested, upload results to Google Sheets
if [ "$UPLOAD_TO_SHEETS" = "true" ]; then
    if [ -z "$SHEETS_CREDS_PATH" ]; then
        echo -e "${YELLOW}⚠️  SHEETS_CREDS_PATH not set. Skipping upload to Google Sheets.${NC}"
    else
        if [ -f "$PYTHON_UPLOADER" ]; then
            echo -e "${BLUE}📤 Uploading QA results to Google Sheets: $SHEETS_NAME${NC}"
            python3 "$PYTHON_UPLOADER" --creds "$SHEETS_CREDS_PATH" --sheet "$SHEETS_NAME" --results "$RESULTS_DIR"
        else
            echo -e "${YELLOW}⚠️  Python uploader not found at $PYTHON_UPLOADER${NC}"
        fi
    fi
fi

# Post to Linear if requested
if [ "$LINEAR_MODE" = true ]; then
    echo -e "${BLUE}📝 Posting results to Linear...${NC}"
    # Call Linear integration script
    if [ -f "./post-qa-to-linear.sh" ]; then
        bash ./post-qa-to-linear.sh "$RESULTS_DIR"
    else
        echo -e "${YELLOW}⚠️  Linear integration script not found${NC}"
    fi
fi

# Commit mode - fail if errors or critical
if [ "$COMMIT_MODE" = true ]; then
    if [ $ERROR_COUNT -gt 0 ] || [ $CRITICAL_COUNT -gt 0 ]; then
        echo ""
        echo -e "${RED}❌ COMMIT BLOCKED: QA checks failed${NC}"
        echo -e "${YELLOW}Fix errors before committing:${NC}"
        echo -e "   - $ERROR_COUNT error(s)"
        echo -e "   - $CRITICAL_COUNT critical issue(s)"
        exit 1
    else
        echo -e "${GREEN}✅ QA checks passed - commit allowed${NC}"
    fi
fi

# CI mode - strict failure on any non-pass
if [ "$CI_MODE" = true ]; then
    if [ $WARNING_COUNT -gt 0 ] || [ $ERROR_COUNT -gt 0 ] || [ $CRITICAL_COUNT -gt 0 ]; then
        echo ""
        echo -e "${RED}❌ CI FAILED: Quality standards not met${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}✅ QA Assembly Line Complete${NC}"
echo -e "   Results: $RESULTS_DIR"
echo -e "   Master Report: $RESULTS_DIR/MASTER_QA_REPORT.md"
echo ""

exit $QA_EXIT_CODE
