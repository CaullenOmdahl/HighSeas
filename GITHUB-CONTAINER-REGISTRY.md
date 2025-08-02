# 🐙 GitHub Container Registry Setup for HighSeas

This guide shows how to host your Docker containers on GitHub Container Registry (GHCR) instead of Docker Hub, providing better integration with your repository and access control.

## 🎯 Benefits of GHCR

- ✅ **Integrated with GitHub**: Same place as your code
- ✅ **Better Security**: Fine-grained access control with GitHub tokens
- ✅ **Free for Public Repos**: No rate limits like Docker Hub
- ✅ **Automatic Builds**: GitHub Actions integration
- ✅ **Multi-platform**: AMD64 and ARM64 support
- ✅ **Version Management**: Tied to your git tags and releases

## 🚀 Quick Start

### 1. Automated Builds (Recommended)

The GitHub Actions workflow automatically builds and pushes images when you:
- Push to `master` or `main` branch
- Create version tags (e.g., `v1.2.2`)
- Manually trigger the workflow

**Your images will be available at:**
```
ghcr.io/caullenomdahl/highseas:latest
ghcr.io/caullenomdahl/highseas:v1.2.2
ghcr.io/caullenomdahl/highseas:master
```

### 2. Pull and Run from GHCR

```bash
# Pull the latest image
docker pull ghcr.io/caullenomdahl/highseas:latest

# Run with docker-compose
docker-compose -f docker-compose.ghcr.yml up -d

# Run directly
docker run -d --name highseas-ghcr \
  -p 6969:6969 \
  -e NODE_ENV=production \
  -e REAL_DEBRID_TOKEN=your_token \
  -v /tmp/highseas-logs:/app/logs \
  --restart unless-stopped \
  ghcr.io/caullenomdahl/highseas:latest
```

## 🔧 Manual Setup

### 1. Create GitHub Personal Access Token

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `write:packages` (to push images)
   - `read:packages` (to pull images)
   - `delete:packages` (to delete images, optional)
4. Copy the token

### 2. Login to GHCR

```bash
# Login with your token
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Or set environment variable
export GITHUB_TOKEN=your_token_here
echo $GITHUB_TOKEN | docker login ghcr.io -u caullenomdahl --password-stdin
```

### 3. Manual Push

```bash
# Build your image locally first
docker build -t localhost/highseas-streaming:v1.2.2 .

# Push to GHCR using the script
./push-to-ghcr.sh v1.2.2

# Or manually
docker tag localhost/highseas-streaming:v1.2.2 ghcr.io/caullenomdahl/highseas:v1.2.2
docker push ghcr.io/caullenomdahl/highseas:v1.2.2
```

## 🔄 GitHub Actions Workflow

The workflow (`.github/workflows/docker-build.yml`) automatically:

### Triggers
- **Push to master/main**: Creates `latest` tag
- **Version tags** (v1.2.2): Creates version-specific tags
- **Pull requests**: Creates PR-specific tags for testing
- **Manual dispatch**: Custom tags via workflow_dispatch

### Generated Tags
| Event | Generated Tags |
|-------|----------------|
| `git push origin master` | `latest`, `master` |
| `git tag v1.2.2 && git push origin v1.2.2` | `v1.2.2`, `1.2`, `1` |
| PR #123 | `pr-123` |
| Manual with "test" | `test` |

### Build Features
- **Multi-platform**: Builds for AMD64 and ARM64
- **Build cache**: Faster subsequent builds
- **Metadata**: Includes build date, git commit, version
- **Summary**: Detailed build report in GitHub Actions

## 🐳 Docker Compose Configurations

### Production Deployment
```yaml
# docker-compose.ghcr.yml
services:
  highseas-streaming:
    image: ghcr.io/caullenomdahl/highseas:latest
    # ... rest of configuration
```

### Development with Specific Version
```yaml
services:
  highseas-streaming:
    image: ghcr.io/caullenomdahl/highseas:v1.2.2
```

### Testing PR Changes
```yaml
services:
  highseas-streaming:
    image: ghcr.io/caullenomdahl/highseas:pr-123
```

## 🔐 Access Control

### Public Images (Current Setup)
Anyone can pull your images:
```bash
docker pull ghcr.io/caullenomdahl/highseas:latest
```

### Private Images (Optional)
To make images private:
1. Go to your package page: `https://github.com/users/caullenomdahl/packages/container/highseas`
2. Click "Package settings"
3. Change visibility to "Private"

For private images, users need authentication:
```bash
echo YOUR_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
docker pull ghcr.io/caullenomdahl/highseas:latest
```

## 📊 Package Management

### View Your Packages
Visit: `https://github.com/caullenomdahl?tab=packages`

### Package Details
- **Usage stats**: Download counts, popular tags
- **Versions**: All available tags with metadata
- **Vulnerabilities**: Security scanning results
- **Settings**: Visibility, access control, deletion

### Cleanup Old Versions
```bash
# Delete specific version via GitHub web interface
# Or use GitHub CLI
gh api -X DELETE /user/packages/container/highseas/versions/VERSION_ID
```

## 🚀 Deployment Strategies

### Blue-Green Deployment
```bash
# Deploy new version alongside old
docker run -d --name highseas-green ghcr.io/caullenomdahl/highseas:v1.2.3
# Test new version...
# Switch traffic and remove old container
```

### Rolling Updates with Compose
```bash
# Update image tag in docker-compose.ghcr.yml
# Then rolling update
docker-compose -f docker-compose.ghcr.yml up -d
```

### Automated Deployment on Tag
Add to your workflow:
```yaml
- name: Deploy to production
  if: startsWith(github.ref, 'refs/tags/v')
  run: |
    # Your deployment script here
    ssh production-server "docker-compose pull && docker-compose up -d"
```

## 🔍 Monitoring and Observability

### Image Metrics
```bash
# Check image size
docker images ghcr.io/caullenomdahl/highseas

# Inspect image metadata
docker inspect ghcr.io/caullenomdahl/highseas:latest

# View build history on GitHub
# Go to Actions tab for build logs and summaries
```

### Runtime Monitoring
```bash
# Health check
curl http://localhost:6969/api/health

# Container stats
docker stats highseas-ghcr

# Logs
docker logs highseas-ghcr --tail 100 -f
```

## 🚨 Troubleshooting

### Authentication Issues
```bash
# Check login status
docker login ghcr.io

# Verify token permissions
# Token needs: write:packages, read:packages

# Test with curl
curl -H "Authorization: token YOUR_TOKEN" https://ghcr.io/v2/
```

### Build Failures
```bash
# Check GitHub Actions logs
# Go to: https://github.com/caullenomdahl/HighSeas/actions

# Common issues:
# - Token permissions
# - Dockerfile syntax
# - Build context size
# - Platform compatibility
```

### Pull Issues
```bash
# Check image exists
docker manifest inspect ghcr.io/caullenomdahl/highseas:latest

# Force refresh
docker pull --disable-content-trust ghcr.io/caullenomdahl/highseas:latest

# Clear local cache
docker system prune -a
```

## 📈 Best Practices

### Tagging Strategy
- Use semantic versioning for releases: `v1.2.3`
- Keep `latest` for stable releases
- Use branch names for development: `development`, `feature-xyz`
- Use descriptive tags for testing: `fix-chunk-demuxer`

### Security
- Regularly update base images
- Scan for vulnerabilities (GitHub does this automatically)
- Use minimal base images (Alpine Linux)
- Don't include secrets in images

### Performance
- Use multi-stage builds to reduce image size
- Leverage build cache with GitHub Actions
- Use appropriate platform targets (AMD64 for servers, ARM64 for Apple Silicon)

This setup provides a professional container hosting solution integrated directly with your GitHub repository!