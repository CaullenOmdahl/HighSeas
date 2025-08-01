#!/bin/bash

# HighSeas Docker Image Publishing Script
# Builds and publishes to GitHub Container Registry

set -e  # Exit on any error

echo "🚀 HighSeas Docker Publishing"
echo "============================"

# Configuration
IMAGE_NAME="highseas-streaming"
REGISTRY="ghcr.io/caullenom"
VERSION=${1:-latest}
FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}:${VERSION}"

echo "📋 Build Configuration:"
echo "  - Image: ${FULL_IMAGE_NAME}"
echo "  - Architecture: linux/amd64"
echo "  - Context: ."

# Check if logged into GitHub Container Registry
echo ""
echo "🔐 Checking GitHub Container Registry authentication..."
if ! docker info | grep -q "ghcr.io"; then
    echo "⚠️  Please login to GitHub Container Registry first:"
    echo "   docker login ghcr.io -u your-username"
    echo "   Use a Personal Access Token with write:packages scope"
    exit 1
fi

# Build the image
echo ""
echo "🔨 Building Docker image..."
docker build -t "${IMAGE_NAME}:${VERSION}" .
docker tag "${IMAGE_NAME}:${VERSION}" "${FULL_IMAGE_NAME}"

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Test the image
echo ""
echo "🧪 Testing built image..."
docker run --rm --name highseas-test -d -p 6970:6969 "${IMAGE_NAME}:${VERSION}"

# Wait for container to start
sleep 10

# Test health endpoint
if curl -f http://localhost:6970/api/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    docker stop highseas-test 2>/dev/null || true
    exit 1
fi

# Stop test container
docker stop highseas-test

# Push to registry
echo ""
echo "📤 Publishing to GitHub Container Registry..."
docker push "${FULL_IMAGE_NAME}"

if [ $? -eq 0 ]; then
    echo "✅ Published successfully"
else
    echo "❌ Publishing failed"
    exit 1
fi

# Cleanup local test image
docker rmi "${IMAGE_NAME}:${VERSION}" 2>/dev/null || true

echo ""
echo "🎉 Publishing completed!"
echo "📋 Published Image:"
echo "  - Registry: ${REGISTRY}"
echo "  - Image: ${IMAGE_NAME}"
echo "  - Tag: ${VERSION}"
echo "  - Full Name: ${FULL_IMAGE_NAME}"

echo ""
echo "🚀 Usage Instructions:"
echo "  docker pull ${FULL_IMAGE_NAME}"
echo "  docker run -d --name highseas-streaming -p 6969:6969 -e REAL_DEBRID_TOKEN=your_token ${FULL_IMAGE_NAME}"

echo ""
echo "📖 Documentation:"
echo "  - Docker Deployment: ./DOCKER_DEPLOYMENT.md"
echo "  - GitHub Repository: https://github.com/CaullenOmdahl/HighSeas"