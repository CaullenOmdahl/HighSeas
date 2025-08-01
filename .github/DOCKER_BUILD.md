# Docker Build Configuration

## Current Setup

### GitHub Actions Workflow: `docker.yml`
- **Name**: "Build and Push Docker Image (AMD64)"
- **Registry**: Docker Hub (`docker.io`)
- **Image**: `caullen/highseas-streaming:latest`
- **Architecture**: AMD64 only (optimized for stability)
- **Triggers**: Push to master/main, tags, PRs

### Why AMD64 Only?

1. **Build Stability**: ARM64 builds were causing cache key computation errors
2. **Target Platform**: Most users run on x86_64 systems
3. **Deployment Focus**: CasaOS and Docker deployments primarily on AMD64
4. **Resource Efficiency**: Faster builds, less resource usage

## Removed Workflows

### `docker-build.yml` (Removed)
- **Issue**: Tried to push to non-existent `highseas/highseas` registry
- **Conflict**: Duplicate multi-arch builds causing failures
- **Solution**: Removed redundant workflow

## Build Process

1. **Trigger**: Push to master branch
2. **Setup**: Docker Buildx with AMD64 platform
3. **Authentication**: Docker Hub via secrets
4. **Build**: Single architecture for reliability
5. **Push**: To `caullen/highseas-streaming:latest`
6. **Output**: Deployment snippet in GitHub Actions summary

## Secrets Required

- `DOCKERHUB_USERNAME`: Docker Hub username (`caullen`)
- `DOCKERHUB_TOKEN`: Docker Hub access token

## Usage

After successful build:
```bash
docker pull caullen/highseas-streaming:latest
docker run -d --name highseas-streaming -p 6969:6969 --restart unless-stopped caullen/highseas-streaming:latest
```

## Future Considerations

If ARM64 support is needed:
1. Fix Dockerfile build issues for ARM64
2. Add ARM64 platform back to workflow
3. Test thoroughly on ARM64 hardware
4. Monitor build stability

Currently prioritizing AMD64 stability over multi-arch complexity.