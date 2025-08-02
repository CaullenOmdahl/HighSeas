#!/bin/bash

# Build HighSeas Docker container directly from GitHub
# Usage: ./build-from-github.sh [branch] [tag]

set -e

REPO_URL="https://github.com/CaullenOmdahl/HighSeas.git"
BRANCH="${1:-master}"
TAG="${2:-github-latest}"
BUILD_DIR="/tmp/highseas-github-build"

echo "🚀 Building HighSeas from GitHub repository"
echo "Repository: $REPO_URL"
echo "Branch: $BRANCH"
echo "Tag: $TAG"
echo ""

# Clean up any existing build directory
if [ -d "$BUILD_DIR" ]; then
    echo "🧹 Cleaning up existing build directory..."
    rm -rf "$BUILD_DIR"
fi

# Clone the repository
echo "📥 Cloning repository..."
git clone --branch "$BRANCH" --depth 1 "$REPO_URL" "$BUILD_DIR"

# Change to build directory
cd "$BUILD_DIR"

# Show current commit info
echo "📋 Building from commit:"
git log --oneline -1
echo ""

# Build Docker image
echo "🐳 Building Docker image: localhost/highseas-streaming:$TAG"
docker build -t "localhost/highseas-streaming:$TAG" .

# Show image info
echo ""
echo "✅ Build complete!"
docker images | grep "localhost/highseas-streaming" | grep "$TAG"

# Cleanup
echo ""
echo "🧹 Cleaning up build directory..."
rm -rf "$BUILD_DIR"

echo ""
echo "🎉 Docker image ready: localhost/highseas-streaming:$TAG"
echo ""
echo "To run the container:"
echo "docker run -d --name highseas-github \\"
echo "  -p 6969:6969 \\"
echo "  -e NODE_ENV=production \\"
echo "  -e PORT=6969 \\"
echo "  -e BODY_SIZE_LIMIT=10mb \\"
echo "  -e LOG_LEVEL=info \\"
echo "  -e REAL_DEBRID_TOKEN=\"\" \\"
echo "  -e ENABLE_AMD_GPU=true \\"
echo "  -v /tmp/highseas-logs:/app/logs \\"
echo "  --restart unless-stopped \\"
echo "  localhost/highseas-streaming:$TAG"