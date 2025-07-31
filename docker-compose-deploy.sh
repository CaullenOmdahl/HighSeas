#!/bin/bash

# HighSeas Docker Compose Deployment with Authentication
# This script handles Docker Hub login and deploys using docker-compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Load environment variables
if [ -f .env ]; then
    source .env
    log_success "Loaded environment variables from .env"
else
    log_error ".env file not found! Make sure it contains DOCKER_USERNAME and DOCKER_PASSWORD"
    exit 1
fi

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_success "Docker and Docker Compose are installed"
}

# Login to Docker Hub
docker_login() {
    log_info "Logging into Docker Hub..."
    
    if [ -z "$DOCKER_USERNAME" ] || [ -z "$DOCKER_PASSWORD" ]; then
        log_error "DOCKER_USERNAME and DOCKER_PASSWORD must be set in .env file"
        exit 1
    fi
    
    echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin
    
    if [ $? -eq 0 ]; then
        log_success "Successfully logged into Docker Hub"
    else
        log_error "Failed to login to Docker Hub"
        exit 1
    fi
}

# Deploy with docker-compose
deploy_compose() {
    log_info "Pulling latest image and deploying with Docker Compose..."
    
    # Pull latest image
    docker-compose pull
    
    # Stop existing containers
    docker-compose down
    
    # Start services
    docker-compose up -d
    
    log_success "HighSeas deployed successfully with Docker Compose!"
}

# Check container health
check_health() {
    log_info "Waiting for container to be healthy..."
    
    # Wait up to 60 seconds for the container to be healthy
    for i in {1..12}; do
        if docker inspect --format='{{.State.Health.Status}}' highseas-streaming 2>/dev/null | grep -q "healthy"; then
            log_success "Container is healthy!"
            return 0
        fi
        echo -n "."
        sleep 5
    done
    
    log_warning "Container health check timeout, but it might still be starting..."
}

# Show container status
show_status() {
    echo ""
    echo "=== Container Status ==="
    docker-compose ps
    
    echo ""
    echo "=== Access Information ==="
    log_info "🌎 Application: http://localhost:${PORT:-6969}"
    log_info "❤️  Health Check: http://localhost:${PORT:-6969}/api/health"
    log_info "📊 Container Logs: docker-compose logs -f"
    log_info "🛑 Stop Container: docker-compose down"
}

# Main execution
main() {
    echo "🏴‍☠️ HighSeas Docker Compose Deployment"
    echo "========================================"
    
    check_docker
    docker_login
    deploy_compose
    check_health
    show_status
    
    echo ""
    log_success "🎉 HighSeas is now running! Visit http://localhost:${PORT:-6969}"
}

# Run main function
main "$@"