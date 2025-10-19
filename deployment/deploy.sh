#!/bin/bash

# CTAS-7 RepoAgent Service Deployment Script
# Supports both systemd (Linux) and launchd (macOS)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[CTAS-7]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Detect platform
detect_platform() {
    case "$(uname -s)" in
        Linux*)     PLATFORM=linux;;
        Darwin*)    PLATFORM=macos;;
        *)          PLATFORM=unknown;;
    esac
}

# Build release binary
build_release() {
    log "Building CTAS-7 RepoAgent release binary..."

    cd "$PROJECT_ROOT/../ctas-7-shipyard-staging"

    cargo build --release -p ctas7-repoagent --features "neural-mux unicode-assembly" --bin repoagent-server

    if [[ -f "target/release/repoagent-server" ]]; then
        success "Release binary built successfully"
    else
        error "Failed to build release binary"
        exit 1
    fi
}

# Deploy to systemd (Linux)
deploy_systemd() {
    log "Deploying to systemd..."

    # Create ctas user if it doesn't exist
    if ! id "ctas" &>/dev/null; then
        warn "Creating ctas user..."
        sudo useradd -r -s /bin/false -d /opt/ctas7-shipyard-staging ctas
    fi

    # Create directories
    sudo mkdir -p /opt/ctas7-shipyard-staging/logs
    sudo mkdir -p /opt/ctas7-shipyard-staging/target/release

    # Copy binary
    sudo cp "$PROJECT_ROOT/../ctas-7-shipyard-staging/target/release/repoagent-server" /opt/ctas7-shipyard-staging/target/release/
    sudo chmod +x /opt/ctas7-shipyard-staging/target/release/repoagent-server

    # Set ownership
    sudo chown -R ctas:ctas /opt/ctas7-shipyard-staging

    # Copy service file
    sudo cp "$SCRIPT_DIR/ctas7-repoagent.service" /etc/systemd/system/

    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable ctas7-repoagent.service

    success "systemd service installed and enabled"
    log "Start with: sudo systemctl start ctas7-repoagent"
    log "Check status: sudo systemctl status ctas7-repoagent"
    log "View logs: sudo journalctl -u ctas7-repoagent -f"
}

# Deploy to launchd (macOS)
deploy_launchd() {
    log "Deploying to launchd..."

    # Create logs directory
    mkdir -p "$PROJECT_ROOT/logs"

    # Stop existing service if running
    if launchctl list | grep -q "com.ctas7.repoagent"; then
        warn "Stopping existing service..."
        launchctl unload ~/Library/LaunchAgents/com.ctas7.repoagent.plist 2>/dev/null || true
    fi

    # Copy plist to LaunchAgents
    mkdir -p ~/Library/LaunchAgents
    cp "$SCRIPT_DIR/com.ctas7.repoagent.plist" ~/Library/LaunchAgents/

    # Load the service
    launchctl load ~/Library/LaunchAgents/com.ctas7.repoagent.plist

    success "launchd service installed and loaded"
    log "Check status: launchctl list | grep ctas7"
    log "View logs: tail -f $PROJECT_ROOT/logs/repoagent.log"
    log "Stop service: launchctl unload ~/Library/LaunchAgents/com.ctas7.repoagent.plist"
}

# Main deployment function
main() {
    log "🚀 CTAS-7 RepoAgent Service Deployment"
    log "======================================="

    detect_platform
    log "Detected platform: $PLATFORM"

    # Build release binary
    build_release

    case "$PLATFORM" in
        linux)
            deploy_systemd
            ;;
        macos)
            deploy_launchd
            ;;
        *)
            error "Unsupported platform: $PLATFORM"
            exit 1
            ;;
    esac

    success "🎯 CTAS-7 RepoAgent service deployment complete!"
    log "The multi-agent orchestration system is ready for production"
}

# Show usage
usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  --build-only   Only build the release binary"
    echo "  --status       Show service status"
    echo ""
    echo "Examples:"
    echo "  $0                # Full deployment"
    echo "  $0 --build-only   # Just build binary"
    echo "  $0 --status       # Check service status"
}

# Check service status
check_status() {
    detect_platform

    case "$PLATFORM" in
        linux)
            systemctl is-active ctas7-repoagent.service
            systemctl status ctas7-repoagent.service --no-pager
            ;;
        macos)
            if launchctl list | grep -q "com.ctas7.repoagent"; then
                success "Service is running"
                launchctl list | grep "com.ctas7.repoagent"
            else
                warn "Service is not running"
            fi
            ;;
    esac
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        usage
        exit 0
        ;;
    --build-only)
        build_release
        exit 0
        ;;
    --status)
        check_status
        exit 0
        ;;
    "")
        main
        ;;
    *)
        error "Unknown option: $1"
        usage
        exit 1
        ;;
esac