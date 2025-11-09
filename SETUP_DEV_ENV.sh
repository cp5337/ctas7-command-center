#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CTAS-7 Command Center - Development Environment Setup
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛠️  CTAS-7 Command Center - Dev Environment Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if conda is installed
if ! command -v conda &> /dev/null; then
    echo "❌ Conda is not installed. Please install Anaconda or Miniconda first."
    exit 1
fi

echo "✅ Conda found: $(conda --version)"
echo ""

# Check if environment already exists
if conda env list | grep -q "ctas7-command-center-dev"; then
    echo "⚠️  Environment 'ctas7-command-center-dev' already exists"
    echo ""
    read -p "Update existing environment? [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📥 Updating environment..."
        conda env update -f environment-dev.yml --prune
    else
        echo "Skipping environment update."
    fi
else
    echo "📥 Creating new environment..."
    conda env create -f environment-dev.yml
fi

echo ""
echo "✅ Environment ready!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Activate with:"
echo "   conda activate ctas7-command-center-dev"
echo ""
echo "🧪 Test services:"
echo "   # RepoAgent"
echo "   cd /Users/cp5337/Developer/ctas7-command-center/agent-studio"
echo "   python -m agent_studio.gateway"
echo ""
echo "   # Or run tests"
echo "   pytest tests/"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
