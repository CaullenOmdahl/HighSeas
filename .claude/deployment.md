### Git Workflow & Production Safety
```bash
# Development workflow - safe for regular commits
git add .
git commit -m "your changes"
git push origin master          # Safe for development

# ⚠️ CRITICAL: Production deployment safety
# NEVER push to production unless explicitly requested by user
# Always ask for confirmation before any production-related actions
```

### Docker Operations (GHCR)
```bash
npm run docker:pull            # Pull latest image from GitHub Container Registry
npm run docker:up              # Docker Compose up (uses GHCR image)
npm run docker:up:prod         # Production Docker Compose up
npm run docker:down            # Docker Compose down
npm run docker:update          # Pull latest and restart containers
```

### Docker Versioning & Release Workflow
For proper Docker image versioning and releases:

```bash
# 1. Update version in package.json
npm version patch              # Increment patch version (1.1.0 -> 1.1.1)
npm version minor              # Increment minor version (1.1.0 -> 1.2.0)
npm version major              # Increment major version (1.1.0 -> 2.0.0)

# 2. Commit changes
git add package.json
git commit -m "chore: bump version to $(node -p "require('./package.json').version")"

# 3. Create and push git tag (triggers versioned Docker build)
VERSION=$(node -p "require('./package.json').version")
git tag "v$VERSION"
git push origin master
git push origin "v$VERSION"
```

**Automated Docker Build Results (GHCR):**
- `ghcr.io/caullenomdahl/highseas:v1.2.2` (exact version)
- `ghcr.io/caullenomdahl/highseas:1.2` (major.minor)
- `ghcr.io/caullenomdahl/highseas:latest` (latest release)
- `ghcr.io/caullenomdahl/highseas:master` (latest master branch)

**GitHub Actions Workflow:**
- Triggers on push to master, tags matching `v*`, and PRs
- Builds multi-platform images (AMD64, ARM64)
- Uses GitHub Container Registry (GHCR) for hosting
- Automatic tagging and metadata injection
- No external registry dependencies