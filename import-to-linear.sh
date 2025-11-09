#!/bin/bash

# Import Cognitive Foundation Performance Validation Initiative to Linear
# This creates a hierarchical structure: Initiative → Projects → Issues

set -e

# Colors
GREEN='\033[0[32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  CTAS-7 Cognitive Foundation Linear Import${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Check for Linear CLI
if ! command -v linear &> /dev/null; then
    echo -e "${YELLOW}⚠️  Linear CLI not installed. Install with: npm install -g @linear/cli${NC}"
    echo -e "${YELLOW}   Then run: linear login${NC}\n"
    exit 1
fi

# Check if already logged in
if ! linear whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged into Linear. Run: linear login${NC}\n"
    exit 1
fi

echo -e "${GREEN}✓${NC} Linear CLI ready\n"

# Get team ID (CognetixALPHA / COG)
TEAM_ID="979acadf-8301-459e-9e51-bf3c1f60e496"
echo -e "${BLUE}Team:${NC} CognetixALPHA (COG) - ${TEAM_ID}\n"

# Step 1: Create labels
echo -e "${BLUE}Step 1: Creating labels...${NC}"

labels=(
    "performance:Benchmark and performance testing"
    "benchmark:Performance benchmarking"
    "test:Testing and validation"
    "stage-1:Stage 1 deterministic execution"
    "stage-2:Stage 2 LLM microkernel"
    "stage-3:Stage 3 full reasoning"
    "compression:Compression systems"
    "unicode:Unicode Assembly Language"
    "t-line:T-line shorthand protocol"
    "base96:Base96 encoding"
    "cache:Cache systems"
    "database:Database operations"
    "routing:Query routing"
    "slotgraph:SlotGraph operations"
    "ecs:Entity Component System"
    "e2e:End-to-end testing"
    "workflow:Workflow testing"
    "integration:Integration testing"
    "agent:marcus:Agent Marcus Chen"
    "agent:sarah:Agent Sarah Kim"
    "agent:natasha:Agent Natasha Volkov"
)

for label_def in "${labels[@]}"; do
    IFS=':' read -r name description <<< "$label_def"
    echo -e "  Creating label: ${GREEN}${name}${NC}"
    linear label create "$name" --description "$description" --team "$TEAM_ID" 2>/dev/null || echo "    (already exists)"
done

echo -e "\n${GREEN}✓${NC} Labels created\n"

# Step 2: Create Initiative
echo -e "${BLUE}Step 2: Creating Initiative...${NC}"

INITIATIVE_TITLE="Cognitive Foundation Performance Validation"
INITIATIVE_DESC="Comprehensive validation of CTAS-7's 3-stage cognitive escalation architecture, measuring computational complexity, time expense, compression efficiency, data source integration, and ECS performance against scholarly CS foundations (Knuth, Shannon, Cormen, et al.)."

echo -e "  ${GREEN}Initiative:${NC} ${INITIATIVE_TITLE}"

# Note: Linear CLI may not support initiatives directly
# This creates a project as a top-level initiative
INITIATIVE_ID=$(linear project create \
    --name "$INITIATIVE_TITLE" \
    --description "$INITIATIVE_DESC" \
    --team "$TEAM_ID" \
    --state "planned" \
    --format id)

echo -e "  ${GREEN}✓${NC} Initiative created: ${INITIATIVE_ID}\n"

# Step 3: Create Projects under Initiative
echo -e "${BLUE}Step 3: Creating Projects...${NC}"

declare -A PROJECT_IDS

projects=(
    "Computational Complexity Analysis & Benchmarking:marcus:Measure and validate time complexity for all stages against Big-O theoretical bounds."
    "Compression Systems Validation:marcus:Validate compression systems achieve >90% reduction and speedups."
    "Data Source Integration Testing:sarah:Validate multi-database integration with >80% cache hit rate."
    "Bevy ECS (Legion) Performance Benchmarking:marcus:Validate ECS achieves >200K entities/second with cache locality."
    "End-to-End System Validation:natasha:Validate full system meets all performance targets with 95%+ accuracy."
)

project_number=1
for project_def in "${projects[@]}"; do
    IFS=':' read -r name owner description <<< "$project_def"
    echo -e "  ${GREEN}Project ${project_number}:${NC} ${name}"
    
    PROJECT_ID=$(linear project create \
        --name "$name" \
        --description "$description" \
        --team "$TEAM_ID" \
        --state "planned" \
        --lead "@${owner}" \
        --format id)
    
    PROJECT_IDS["P${project_number}"]="$PROJECT_ID"
    echo -e "    ${GREEN}✓${NC} Created: ${PROJECT_ID}"
    ((project_number++))
done

echo -e "\n${GREEN}✓${NC} Projects created\n"

# Step 4: Create Issues under Projects
echo -e "${BLUE}Step 4: Creating Issues...${NC}"

# Project 1 Issues
echo -e "\n  ${BLUE}Project 1 Issues:${NC}"

linear issue create \
    --title "Stage 1 Deterministic Performance Validation" \
    --description "Validate Stage 1 (deterministic execution) meets < 10ms target with O(1) complexity. Scholarly Reference: Cormen et al., 2009; Fredman et al., 1984." \
    --project "${PROJECT_IDS[P1]}" \
    --priority 1 \
    --estimate 8 \
    --label performance \
    --label stage-1 \
    --label benchmark \
    --label "agent:marcus" \
    --assignee "@marcus"

echo -e "    ${GREEN}✓${NC} Issue 1.1 created"

linear issue create \
    --title "Stage 2 LLM Microkernel Benchmarking" \
    --description "Validate Stage 2 (Phi-3 local inference) meets < 500ms target with O(n²) transformer complexity. Scholarly Reference: Sanh et al., 2019; Abdin et al., 2024." \
    --project "${PROJECT_IDS[P1]}" \
    --priority 1 \
    --estimate 12 \
    --label performance \
    --label stage-2 \
    --label phi-3 \
    --label thalamic-filter \
    --label "agent:marcus" \
    --assignee "@marcus"

echo -e "    ${GREEN}✓${NC} Issue 1.2 created"

linear issue create \
    --title "Stage 3 Full Reasoning Performance" \
    --description "Measure Stage 3 (Claude + context) against < 5s target with O(n²) attention complexity. Scholarly Reference: Anthropic, 2024; Shannon, 1948." \
    --project "${PROJECT_IDS[P1]}" \
    --priority 2 \
    --estimate 8 \
    --label performance \
    --label stage-3 \
    --label claude \
    --label context-prep \
    --label "agent:marcus" \
    --assignee "@marcus"

echo -e "    ${GREEN}✓${NC} Issue 1.3 created"

# Project 2 Issues
echo -e "\n  ${BLUE}Project 2 Issues:${NC}"

linear issue create \
    --title "Unicode Assembly Language Compression" \
    --description "Validate Unicode compression achieves 92% reduction (48 bytes → 4 bytes) with 12x lookup speedup. Scholarly Reference: Fredman et al., 1984; Shannon, 1948." \
    --project "${PROJECT_IDS[P2]}" \
    --priority 1 \
    --estimate 6 \
    --label compression \
    --label unicode \
    --label performance \
    --label "agent:marcus" \
    --assignee "@marcus"

echo -e "    ${GREEN}✓${NC} Issue 2.1 created"

linear issue create \
    --title "T-Line Shorthand Protocol Validation" \
    --description "Validate T-line compression achieves 94% reduction (64KB → 4KB) with 7x handoff speedup. Scholarly Reference: McCarthy, 1960; Steele, 1990." \
    --project "${PROJECT_IDS[P2]}" \
    --priority 1 \
    --estimate 8 \
    --label compression \
    --label t-line \
    --label atomic-clipboard \
    --label "agent:marcus" \
    --assignee "@marcus"

echo -e "    ${GREEN}✓${NC} Issue 2.2 created"

linear issue create \
    --title "Base96 Encoding Efficiency" \
    --description "Validate Base96 encoding achieves 2.75x decode speedup vs Base64. Scholarly Reference: Josefsson, 2003; Shannon, 1948." \
    --project "${PROJECT_IDS[P2]}" \
    --priority 2 \
    --estimate 4 \
    --label compression \
    --label base96 \
    --label encoding \
    --label "agent:marcus" \
    --assignee "@marcus"

echo -e "    ${GREEN}✓${NC} Issue 2.3 created"

# Project 3 Issues
echo -e "\n  ${BLUE}Project 3 Issues:${NC}"

linear issue create \
    --title "Cache-First Strategy with Sledis" \
    --description "Validate Sledis cache-first strategy achieves >80% hit rate with 50x speedup. Scholarly Reference: Belady, 1966; Shannon, 1948." \
    --project "${PROJECT_IDS[P3]}" \
    --priority 1 \
    --estimate 10 \
    --label cache \
    --label sledis \
    --label performance \
    --label "agent:sarah" \
    --assignee "@sarah"

echo -e "    ${GREEN}✓${NC} Issue 3.1 created"

linear issue create \
    --title "Multi-Database Query Routing" \
    --description "Validate Database Mux Connector routes queries with correct complexity bounds. Scholarly Reference: Selinger et al., 1979; Bayer & McCreight, 1972." \
    --project "${PROJECT_IDS[P3]}" \
    --priority 1 \
    --estimate 12 \
    --label database \
    --label routing \
    --label integration \
    --label "agent:sarah" \
    --assignee "@sarah"

echo -e "    ${GREEN}✓${NC} Issue 3.2 created"

linear issue create \
    --title "SlotGraph Hash-Optimized Traversal" \
    --description "Validate hash-optimized graph traversal achieves 2x speedup (O(V+E) → O(V) amortized). Scholarly Reference: Karger et al., 1997; Cormen et al., 2009." \
    --project "${PROJECT_IDS[P3]}" \
    --priority 2 \
    --estimate 8 \
    --label slotgraph \
    --label graph \
    --label optimization \
    --label "agent:sarah" \
    --assignee "@sarah"

echo -e "    ${GREEN}✓${NC} Issue 3.3 created"

# Project 4 Issues
echo -e "\n  ${BLUE}Project 4 Issues:${NC}"

linear issue create \
    --title "ECS vs OOP Performance Comparison" \
    --description "Validate Bevy ECS achieves 10x speedup vs traditional OOP due to cache locality. Scholarly Reference: West, 2007; Acton, 2014; Frigo et al., 1999." \
    --project "${PROJECT_IDS[P4]}" \
    --priority 1 \
    --estimate 10 \
    --label ecs \
    --label performance \
    --label cache-locality \
    --label "agent:marcus" \
    --assignee "@marcus"

echo -e "    ${GREEN}✓${NC} Issue 4.1 created"

linear issue create \
    --title "Legion Integration with Memory Fabric" \
    --description "Validate Legion entities integrate with Memory Fabric with 5µs per entity lookup. Scholarly Reference: West, 2007; Belady, 1966." \
    --project "${PROJECT_IDS[P4]}" \
    --priority 2 \
    --estimate 8 \
    --label ecs \
    --label legion \
    --label memory-fabric \
    --label "agent:marcus" \
    --assignee "@marcus"

echo -e "    ${GREEN}✓${NC} Issue 4.2 created"

# Project 5 Issues
echo -e "\n  ${BLUE}Project 5 Issues:${NC}"

linear issue create \
    --title "Learning Migration Validation" \
    --description "Validate 80% of Stage 3 queries migrate to Stage 1 after 100 iterations. Novel CTAS-7 contribution." \
    --project "${PROJECT_IDS[P5]}" \
    --priority 1 \
    --estimate 12 \
    --label learning \
    --label escalation \
    --label migration \
    --label "agent:natasha" \
    --assignee "@natasha"

echo -e "    ${GREEN}✓${NC} Issue 5.1 created"

linear issue create \
    --title "End-to-End Workflow Testing" \
    --description "Validate end-to-end workflows for Stage 1, 2, and 3 meet all targets. Scholarly Reference: Jain, 1991; Myers et al., 2011." \
    --project "${PROJECT_IDS[P5]}" \
    --priority 1 \
    --estimate 16 \
    --label e2e \
    --label workflow \
    --label integration \
    --label "agent:natasha" \
    --assignee "@natasha"

echo -e "    ${GREEN}✓${NC} Issue 5.2 created"

linear issue create \
    --title "Compression Impact on Overall Performance" \
    --description "Validate aggregate compression impact achieves 37.9x speedup for Stage 1. Scholarly Reference: Müller-Hannemann & Schirra, 2010; Goodrich & Tamassia, 2014." \
    --project "${PROJECT_IDS[P5]}" \
    --priority 2 \
    --estimate 8 \
    --label compression \
    --label optimization \
    --label aggregate \
    --label "agent:natasha" \
    --assignee "@natasha"

echo -e "    ${GREEN}✓${NC} Issue 5.3 created"

echo -e "\n${GREEN}✓${NC} All issues created\n"

# Summary
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Import Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

echo -e "${GREEN}Summary:${NC}"
echo -e "  • Initiative: 1 (Cognitive Foundation Performance Validation)"
echo -e "  • Projects: 5"
echo -e "  • Issues: 13"
echo -e "  • Labels: 21"
echo -e "  • Total Estimate: ~130 hours (~3 person-weeks)"
echo -e "\n${GREEN}Agents Assigned:${NC}"
echo -e "  • Marcus Chen: 7 issues (complexity, compression, ECS)"
echo -e "  • Sarah Kim: 3 issues (data sources, routing, cache)"
echo -e "  • Natasha Volkov: 3 issues (end-to-end, learning, validation)"
echo -e "\n${BLUE}View in Linear:${NC} https://linear.app/cognetixalpha/team/COG\n"

