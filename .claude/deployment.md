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

### Docker Operations
```bash
npm run docker:build           # Build Docker image
npm run docker:run             # Run Docker container (port 6969)
npm run docker:up              # Docker Compose up
npm run docker:down            # Docker Compose down
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

**Automated Docker Build Results:**
- `caullen/highseas-streaming:v1.1.0` (exact version)
- `caullen/highseas-streaming:1.1` (major.minor)
- `caullen/highseas-streaming:latest` (latest release)

**GitHub Actions Workflow:**
- Triggers on tags matching `v*` pattern
- Builds AMD64-only images for stability
- Uses semver tag extraction for proper versioning
- Pushes to Docker Hub with multiple tag formats