#!/bin/bash

# Push HighSeas Docker image to GitHub Container Registry
# Usage: ./push-to-ghcr.sh [tag]

set -e

# Configuration
GITHUB_USERNAME="caullenomdahl"
REPO_NAME="highseas"
TAG="${1:-latest}"
LOCAL_IMAGE="localhost/highseas-streaming:${TAG}"
GHCR_IMAGE="ghcr.io/${GITHUB_USERNAME}/${REPO_NAME}:${TAG}"

echo "🐙 Pushing to GitHub Container Registry"
echo "Local image: $LOCAL_IMAGE"
echo "GHCR image: $GHCR_IMAGE"
echo ""

# Check if local image exists
if ! docker image inspect "$LOCAL_IMAGE" > /dev/null 2>&1; then
    echo "❌ Local image $LOCAL_IMAGE not found!"
    echo "Build it first with: docker build -t $LOCAL_IMAGE ."
    exit 1
fi

# Login to GHCR (requires GitHub token)
echo "🔐 Logging in to GitHub Container Registry..."
echo "Make sure you have a GitHub Personal Access Token with 'write:packages' permission"
echo "Create one at: https://github.com/settings/tokens"
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo "Please enter your GitHub Personal Access Token:"
    read -s GITHUB_TOKEN
    export GITHUB_TOKEN
fi

echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin

# Tag image for GHCR
echo "🏷️ Tagging image for GHCR..."
docker tag "$LOCAL_IMAGE" "$GHCR_IMAGE"

# Push to GHCR
echo "🚀 Pushing to GitHub Container Registry..."
docker push "$GHCR_IMAGE"

# Also push as latest if this is a version tag
if [[ "$TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    LATEST_IMAGE="ghcr.io/${GITHUB_USERNAME}/${REPO_NAME}:latest"
    echo "🏷️ Also tagging as latest..."
    docker tag "$LOCAL_IMAGE" "$LATEST_IMAGE"
    docker push "$LATEST_IMAGE"
fi

echo ""
echo "✅ Successfully pushed to GitHub Container Registry!"
echo ""
echo "📦 Your image is now available at:"
echo "   $GHCR_IMAGE"
echo ""
echo "🐳 To pull and run:"
echo "   docker pull $GHCR_IMAGE"
echo "   docker run -d --name highseas-ghcr \\"
echo "     -p 6969:6969 \\"
echo "     -e NODE_ENV=production \\"
echo "     -e REAL_DEBRID_TOKEN=your_token \\"
echo "     -v /tmp/highseas-logs:/app/logs \\"
echo "     --restart unless-stopped \\"
echo "     $GHCR_IMAGE"
echo ""
echo "🐙 View on GitHub:"
echo "   https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/pkgs/container/${REPO_NAME}"

# Cleanup local GHCR tags (optional)
read -p "🧹 Remove local GHCR tags? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker rmi "$GHCR_IMAGE" 2>/dev/null || true
    if [[ "$TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        docker rmi "$LATEST_IMAGE" 2>/dev/null || true
    fi
    echo "✅ Local GHCR tags removed"
fi