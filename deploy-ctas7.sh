#!/bin/bash

# CTAS-7 Phased Deployment Script
# Usage: ./deploy-ctas7.sh [phase]
# Phases: backend, main-ops, command-center, agents, archive, all

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[CTAS-7]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Phase 1: Start Canonical Backend
deploy_backend() {
    print_status "Phase 1: Starting Canonical Backend Services..."
    
    if [ -f "./start-canonical-backend-docker.sh" ]; then
        chmod +x ./start-canonical-backend-docker.sh
        ./start-canonical-backend-docker.sh
        print_success "Canonical backend started"
    else
        print_error "start-canonical-backend-docker.sh not found"
        return 1
    fi
    
    # Wait for services to be ready
    print_status "Waiting for backend services..."
    sleep 10
    
    # Check if services are responding
    for port in 15173 15174 15175; do
        if curl -f http://localhost:$port/health > /dev/null 2>&1; then
            print_success "Service on port $port is healthy"
        else
            print_warning "Service on port $port may not be ready yet"
        fi
    done
}

# Phase 2: Start Main Ops Platform
deploy_main_ops() {
    print_status "Phase 2: Starting Main Ops Platform..."
    
    if [ -f "./docker-compose.main-ops.yml" ]; then
        docker-compose -f docker-compose.main-ops.yml up -d
        print_success "Main Ops Platform started on port 15173"
    else
        print_error "docker-compose.main-ops.yml not found"
        return 1
    fi
}

# Phase 3: Start Command Center
deploy_command_center() {
    print_status "Phase 3: Starting Command Center with Voice DevSecOps..."
    
    if [ -f "./docker-compose.command-center.yml" ]; then
        docker-compose -f docker-compose.command-center.yml up -d
        print_success "Command Center started on port 15180"
        print_success "Voice DevSecOps service started on port 15185"
    else
        print_error "docker-compose.command-center.yml not found"
        return 1
    fi
}

# Phase 4: Start Agents (placeholder)
deploy_agents() {
    print_status "Phase 4: Agent deployment planned for next iteration..."
    print_warning "Agent containerization will be implemented after core systems are stable"
}

# Phase 5: Start Archive Manager (placeholder)
deploy_archive() {
    print_status "Phase 5: Archive manager integration planned..."
    print_warning "Archive manager will be integrated after you run the archive from Desktop"
}

# Health check for all services
health_check() {
    print_status "Running health checks..."
    
    services=(
        "15173:Main Ops Platform"
        "15174:Synaptix Core API"
        "15175:Neural Mux"
        "15180:Command Center"
        "15185:Voice DevSecOps"
    )
    
    for service in "${services[@]}"; do
        port=$(echo $service | cut -d: -f1)
        name=$(echo $service | cut -d: -f2)
        
        if curl -f http://localhost:$port/health > /dev/null 2>&1; then
            print_success "$name (port $port) is healthy"
        else
            print_warning "$name (port $port) is not responding"
        fi
    done
}

# Show running containers
show_status() {
    print_status "Current Docker containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo
    
    print_status "Access URLs:"
    echo "  Main Ops Platform:    http://localhost:15173"
    echo "  Command Center:       http://localhost:15180"
    echo "  Voice DevSecOps:      http://localhost:15185"
    echo "  Synaptix Core API:    http://localhost:15174"
    echo "  Neural Mux:           http://localhost:15175"
}

# Main execution
case "${1:-all}" in
    "backend")
        check_docker
        deploy_backend
        ;;
    "main-ops")
        check_docker
        deploy_main_ops
        ;;
    "command-center")
        check_docker
        deploy_command_center
        ;;
    "agents")
        deploy_agents
        ;;
    "archive")
        deploy_archive
        ;;
    "all")
        check_docker
        deploy_backend
        sleep 5
        deploy_main_ops
        sleep 5
        deploy_command_center
        sleep 5
        deploy_agents
        deploy_archive
        ;;
    "health")
        health_check
        ;;
    "status")
        show_status
        ;;
    "stop")
        print_status "Stopping all CTAS-7 services..."
        docker-compose -f docker-compose.main-ops.yml down 2>/dev/null || true
        docker-compose -f docker-compose.command-center.yml down 2>/dev/null || true
        docker-compose -f docker-compose.canonical-backend.yml down 2>/dev/null || true
        print_success "All services stopped"
        ;;
    *)
        echo "Usage: $0 [backend|main-ops|command-center|agents|archive|all|health|status|stop]"
        echo
        echo "Phases:"
        echo "  backend        - Start canonical backend services"
        echo "  main-ops       - Start main operations platform"
        echo "  command-center - Start command center with voice DevSecOps"
        echo "  agents         - Deploy agent containers (placeholder)"
        echo "  archive        - Integrate archive manager (placeholder)"
        echo "  all            - Deploy all phases sequentially"
        echo "  health         - Check health of all services"
        echo "  status         - Show current container status"
        echo "  stop           - Stop all services"
        exit 1
        ;;
esac

if [ "$1" != "stop" ] && [ "$1" != "health" ] && [ "$1" != "status" ]; then
    echo
    print_status "Deployment phase completed. Run './deploy-ctas7.sh status' to see running services."
fi
