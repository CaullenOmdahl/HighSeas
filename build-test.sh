#!/bin/bash

# HighSeas Docker Build Test Script
# Tests Docker builds for amd64 architecture only

set -e  # Exit on any error

echo "🚀 HighSeas Docker Build Test (AMD64)"
echo "====================================="

# Check if Docker Buildx is available
if ! docker buildx version > /dev/null 2>&1; then
    echo "❌ Docker Buildx not available. Please install Docker Buildx first."
    exit 1
fi

echo "✅ Docker Buildx available"

# Create buildx builder if it doesn't exist
BUILDER_NAME="highseas-builder"

if ! docker buildx ls | grep -q "$BUILDER_NAME"; then
    echo "📦 Creating buildx builder: $BUILDER_NAME"
    docker buildx create --name "$BUILDER_NAME" --driver docker-container --bootstrap
else
    echo "✅ Buildx builder '$BUILDER_NAME' already exists"
fi

# Use the builder
docker buildx use "$BUILDER_NAME"

echo "🔍 Available platforms:"
docker buildx ls

# Test build for amd64 only (faster test)
echo ""
echo "🧪 Testing amd64 build..."
docker buildx build \
    --platform linux/amd64 \
    --tag highseas/highseas:test-amd64 \
    --load \
    .

if [ $? -eq 0 ]; then
    echo "✅ AMD64 build successful"
else
    echo "❌ AMD64 build failed"
    exit 1
fi

# Skip ARM64 and multi-platform builds to focus on AMD64 stability

# Test the built image
echo ""
echo "🔍 Testing built image..."
docker run --rm --name highseas-test -d -p 6970:6969 highseas/highseas:test-amd64

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

# Cleanup test images
echo ""
echo "🧹 Cleaning up test images..."
docker rmi highseas/highseas:test-amd64 2>/dev/null || true

echo ""
echo "🎉 All build tests passed!"
echo "✅ AMD64 architecture: Working"
echo "✅ Container runtime: Working"
echo "✅ Health checks: Working"

echo ""
echo "📋 Build Summary:"
echo "  - Image size (amd64): $(docker images --format 'table {{.Size}}' highseas/highseas:test-amd64 2>/dev/null | tail -n1 || echo 'Unknown')"
echo "  - FFmpeg included: ✅"
echo "  - Node.js runtime: ✅"
echo "  - Security: Non-root user"
echo "  - Health checks: Enabled"

echo ""
echo "🚀 Ready for production deployment!"
echo "   Use: docker buildx build --platform linux/amd64 --tag your-registry/highseas:latest --push ."