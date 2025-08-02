# 🐳 Building HighSeas from GitHub Repository

This document provides multiple methods to build and deploy HighSeas directly from the GitHub repository instead of relying on pre-built Docker Hub images.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Git access to the repository
- Sufficient disk space (≥2GB for build process)

## 🚀 Method 1: GitHub Build Script (Recommended)

The automated build script clones the repository and builds the Docker image:

```bash
# Make script executable
chmod +x build-from-github.sh

# Build from master branch with default tag
./build-from-github.sh

# Build from specific branch with custom tag
./build-from-github.sh master v1.2.2-custom

# Build from development branch
./build-from-github.sh development dev-latest
```

### Running the Built Container

```bash
docker run -d --name highseas-github \
  -p 6969:6969 \
  -e NODE_ENV=production \
  -e PORT=6969 \
  -e BODY_SIZE_LIMIT=10mb \
  -e LOG_LEVEL=info \
  -e REAL_DEBRID_TOKEN="" \
  -e ENABLE_AMD_GPU=true \
  -v /tmp/highseas-logs:/app/logs \
  --restart unless-stopped \
  localhost/highseas-streaming:github-latest
```

## 🔄 Method 2: Docker Compose with Local Build

Uses the current directory's source code:

```bash
# Build and start with docker-compose
docker-compose -f docker-compose.github.yml up --build -d

# Build only (without starting)
docker-compose -f docker-compose.github.yml build

# Start with custom environment variables
REAL_DEBRID_TOKEN=your_token docker-compose -f docker-compose.github.yml up -d
```

## 🏭 Method 3: Production Docker Compose

Advanced production setup with metadata and resource limits:

```bash
# Set build metadata
export VERSION=v1.2.2
export BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
export VCS_REF=$(git rev-parse --short HEAD)

# Build production image
docker-compose -f docker-compose.production.yml build

# Deploy to production
docker-compose -f docker-compose.production.yml up -d
```

## 🛠️ Method 4: Direct Docker CLI Build

Build directly from the current directory:

```bash
# Build from current directory
docker build -t localhost/highseas-streaming:local-build .

# Build with build arguments
docker build \
  --build-arg NODE_ENV=production \
  --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  --build-arg VCS_REF=$(git rev-parse --short HEAD) \
  -t localhost/highseas-streaming:custom-build .
```

## 🔄 Method 5: Automated Deployment Script

Complete deployment automation:

```bash
# Create deployment script
cat > deploy-from-github.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Deploying HighSeas from GitHub..."

# Stop existing container
docker stop highseas-production 2>/dev/null || true
docker rm highseas-production 2>/dev/null || true

# Build new image
./build-from-github.sh master production

# Start new container
docker run -d --name highseas-production \
  -p 6969:6969 \
  -e NODE_ENV=production \
  -e PORT=6969 \
  -e BODY_SIZE_LIMIT=10mb \
  -e LOG_LEVEL=info \
  -e REAL_DEBRID_TOKEN="${REAL_DEBRID_TOKEN:-}" \
  -e ENABLE_AMD_GPU=true \
  -v /tmp/highseas-logs:/app/logs \
  -v /dev/dri:/dev/dri \
  --device /dev/dri/renderD128:/dev/dri/renderD128 \
  --restart unless-stopped \
  localhost/highseas-streaming:production

echo "✅ Deployment complete!"
docker logs highseas-production --tail 20
EOF

chmod +x deploy-from-github.sh
```

## 🎯 Environment Variables

All methods support these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Application environment |
| `PORT` | `6969` | Server port |
| `BODY_SIZE_LIMIT` | `10mb` | Request body size limit |
| `LOG_LEVEL` | `info` | Logging level |
| `REAL_DEBRID_TOKEN` | `""` | Real-Debrid API token |
| `ENABLE_AMD_GPU` | `true` | Enable AMD GPU acceleration |
| `CORS_ORIGINS` | `localhost:*` | CORS allowed origins |

## 🔧 GPU Acceleration Setup

For AMD GPU VAAPI transcoding:

```bash
# Ensure GPU device access
docker run ... \
  -v /dev/dri:/dev/dri \
  --device /dev/dri/renderD128:/dev/dri/renderD128 \
  --group-add video \
  localhost/highseas-streaming:your-tag
```

## 📊 Monitoring and Health Checks

All containers include health checks:

```bash
# Check container health
docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"

# View health check logs
docker inspect highseas-production | jq '.[0].State.Health'

# Test health endpoint directly
curl http://localhost:6969/api/health
```

## 🔄 Updates and Maintenance

### Updating to Latest Code

```bash
# Using build script
./build-from-github.sh master latest
docker stop highseas-current && docker rm highseas-current
docker run -d --name highseas-current ... localhost/highseas-streaming:latest

# Using docker-compose
docker-compose -f docker-compose.github.yml down
git pull origin master  # if using local repo
docker-compose -f docker-compose.github.yml up --build -d
```

### Rolling Back

```bash
# List available images
docker images localhost/highseas-streaming

# Run specific version
docker run -d --name highseas-rollback ... localhost/highseas-streaming:v1.2.1
```

## 🚨 Troubleshooting

### Build Failures

```bash
# Clean Docker cache
docker builder prune -a

# Check disk space
df -h

# Verbose build output
docker build --progress=plain --no-cache .
```

### Runtime Issues

```bash
# Check container logs
docker logs highseas-production

# Check FFmpeg availability
docker exec highseas-production ffmpeg -version

# Check GPU access
docker exec highseas-production ls -la /dev/dri/
```

## 🏷️ Tagging Strategy

Recommended image naming convention:

- `localhost/highseas-streaming:latest` - Latest master build
- `localhost/highseas-streaming:v1.2.2` - Specific version
- `localhost/highseas-streaming:production` - Production deployment
- `localhost/highseas-streaming:dev-YYYYMMDD` - Development builds
- `localhost/highseas-streaming:github-latest` - Latest GitHub build

## 📈 Performance Optimization

### Build Performance

```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1

# Multi-core builds
docker build --build-arg MAKEFLAGS="-j$(nproc)" .
```

### Runtime Performance

```bash
# Resource limits in docker-compose
deploy:
  resources:
    limits:
      cpus: '4.0'
      memory: 2G
    reservations:
      cpus: '1.0'
      memory: 1G
```

This approach ensures you always have the latest code changes and full control over your deployment pipeline without relying on external registries.