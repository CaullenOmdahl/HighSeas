#!/bin/bash

# HighSeas Docker Deployment Script  
# This script pulls and runs the latest HighSeas container from Docker Hub

set -e

# Configuration
REGISTRY="docker.io"
# Replace 'username' with your Docker Hub username
DOCKERHUB_USER="caullen"
IMAGE_NAME="highseas-streaming"
CONTAINER_NAME="highseas-streaming"
PORT="6969"

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

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    log_success "Docker is installed"
}

# Stop and remove existing container
cleanup_existing() {
    if docker ps -a --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_info "Stopping existing container..."
        docker stop ${CONTAINER_NAME} || true
        log_info "Removing existing container..."
        docker rm ${CONTAINER_NAME} || true
        log_success "Cleaned up existing container"
    fi
}

# Pull latest image
pull_image() {
    log_info "Pulling latest HighSeas image..."
    if docker pull ${DOCKERHUB_USER}/${IMAGE_NAME}:latest; then
        log_success "Successfully pulled latest image"
    else
        log_error "Failed to pull image. Make sure:"
        echo "  1. You've replaced 'username' with your Docker Hub username in this script"
        echo "  2. The repository exists and has been built"
        echo "  3. The repository is private and you're logged in: docker login"
        exit 1
    fi
}

# Run the container
run_container() {
    log_info "Starting HighSeas container on port ${PORT}..."
    
    docker run -d \
        --name ${CONTAINER_NAME} \
        -p ${PORT}:${PORT} \
        --restart unless-stopped \
        --health-cmd="wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1" \
        --health-interval=30s \
        --health-timeout=10s \
        --health-retries=3 \
        ${DOCKERHUB_USER}/${IMAGE_NAME}:latest
    
    log_success "HighSeas container started successfully!"
}

# Check container health
check_health() {
    log_info "Waiting for container to be healthy..."
    
    # Wait up to 60 seconds for the container to be healthy
    for i in {1..12}; do
        if docker inspect --format='{{.State.Health.Status}}' ${CONTAINER_NAME} 2>/dev/null | grep -q "healthy"; then
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
    docker ps --filter name=${CONTAINER_NAME} --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo "=== Access Information ==="
    log_info "🌎 Application: http://localhost:${PORT}"
    log_info "❤️  Health Check: http://localhost:${PORT}/api/health"
    log_info "📊 Container Logs: docker logs -f ${CONTAINER_NAME}"
    log_info "🛑 Stop Container: docker stop ${CONTAINER_NAME}"
}

# Main execution
main() {
    echo "🏴‍☠️ HighSeas Docker Deployment"
    echo "================================"
    
    check_docker
    cleanup_existing
    pull_image
    run_container
    check_health
    show_status
    
    echo ""
    log_success "🎉 HighSeas is now running! Visit http://localhost:${PORT}"
}

# Run main function
main "$@"