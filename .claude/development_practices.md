## Important Development Practices

### Security Requirements
- All API tokens must be in environment variables, never in client code
- Use `serverConfig` from `src/lib/server-config.ts` for server-side secrets
- Domain whitelist validation for all streaming URLs
- Input sanitization for all user-provided data

### Testing Requirements  
- Unit tests required for all utilities and services
- Component tests for user interactions and accessibility
- Integration tests for API endpoints
- E2E tests for complete user workflows
- 80%+ code coverage required (configured in vitest.config.ts)
- All tests must run without external API dependencies (mocked)

### Development Logging and Debugging
- **File Logging**: All logs are automatically written to daily files in `/logs/` directory in development mode
- **Log Review Protocol**: After each testing session, check hard logs in `/logs/app-YYYY-MM-DD.log` for:
  - Error patterns and stack traces
  - Performance bottlenecks and buffer issues
  - Stream loading failures or unexpected behavior
  - UI component initialization problems
- **Log Cleanup**: After addressing issues found in logs, purge log files to maintain clean debugging state:
  ```bash
  rm logs/*.log  # Clear all log files after review
  ```
- **Log Categories**: Use structured logging categories (PLAYER, STREAM, ADDON, NETWORK, UI, PERFORMANCE, SYSTEM)
- **Testing Workflow**: Test → Check logs → Address issues → Purge logs → Repeat

### Performance Requirements
- Bundle size target: <500KB total (currently ~280KB achieved)
- Lazy loading for images and heavy components
- Virtual scrolling for large content lists
- Memory bounded streaming (50MB max buffer)
- Request deduplication and caching

### Streaming Verification
When modifying streaming functionality, verify:
- No files written to disk during streaming
- Memory usage remains bounded (no content accumulation)
- Range requests work for video seeking without full downloads
- Streaming starts immediately without download requirements
- Error handling maintains streaming-only approach

### Code Organization
- **Routes**: `src/routes/` (main application pages - Board, MetaDetails, StremioPlayer, etc.)
- **Video System**: `src/lib/video/` (complete Stremio video player implementation)
- **Components**: `src/lib/components/` (reusable UI components)  
- **Stremio Components**: `src/stremio/components/` (Stremio-style UI components)
- **Services**: `src/lib/services/` (stremio.ts, realdebrid.ts)
- **Types**: `src/lib/types.ts` (TypeScript interfaces and types)
- **Server**: `server/index.js` (Express.js API endpoints and static serving)
- **Styling**: Component-level CSS modules (`.module.less` files)

### Environment Variables
Required for production:
```bash
REAL_DEBRID_TOKEN=your_token_here    # Required for premium streaming
NODE_ENV=production                  # Production mode
BODY_SIZE_LIMIT=10mb                # Upload limit
LOG_LEVEL=info                      # Logging level
```

Optional:
```bash
PORT=6969                           # Server port (default: 6969)
STREMIO_API_URL=http://localhost:11470  # Local Stremio instance
```

### Common Debugging
- Use `npm run test:ui` for interactive test debugging
- Use `npm run test:e2e:ui` for E2E test debugging with browser
- Check network tab for streaming proxy requests to `/api/proxy`
- Use structured logging categories to trace addon/streaming issues
- Monitor memory usage during streaming operations

This is a production-ready Netflix-style streaming interface with enterprise-grade security, performance optimization, and comprehensive testing. The streaming architecture correctly proxies content without downloads, making it suitable for privacy-focused streaming applications.

## Available Tools and Resources

### 🛠️ Claude Code MCP Tools Available

**Filesystem Management:**
- `Read` - Direct file reading with line limits and offsets
- `Edit` - Precise string-based file editing
- `Write` - File creation and overwriting
- `MultiEdit` - Multiple edits to a single file in one operation
- `Glob` - Fast file pattern matching and search
- `LS` - Directory listing with filtering options

**GitHub Integration:**
- `mcp__smithery-ai-github__create_or_update_file` - Direct GitHub file management
- `mcp__smithery-ai-github__get_file_contents` - Read files from GitHub repositories  
- `mcp__smithery-ai-github__push_files` - Batch file commits to GitHub
- `mcp__smithery-ai-github__create_pull_request` - Create PRs with descriptions
- `mcp__smithery-ai-github__create_issue` - Create GitHub issues
- `mcp__smithery-ai-github__search_repositories` - Search GitHub repos
- `mcp__smithery-ai-github__create_branch` - Create feature branches

**Development Tools:**
- `Task` - Launch specialized agents for complex research/search tasks
- `Bash` - Execute shell commands with proper security measures
- `Grep` - Powerful text search with regex support (ripgrep-based)
- `WebFetch` - Fetch and analyze web content with AI processing
- `WebSearch` - Search the web for current information
- `TodoWrite` - Task management and progress tracking

### 📋 Development Guidelines

**File Management:**
- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary for achieving the goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested

**Code Quality:**
- Follow existing code patterns and conventions
- Maintain TypeScript type safety
- Use existing UI components and patterns
- Ensure mobile responsiveness
- Follow security best practices

**Production Safety:**
- ⚠️ **CRITICAL**: NEVER push to production unless explicitly requested by user
- Always ask for confirmation before any production-related actions
- Development changes on master branch are safe and encouraged
- Production deployments require explicit user approval

**Documentation Maintenance Protocol:**
- **Keep Documentation Up-to-Date:** Whenever a code change is made, it is crucial to update any and all relevant documentation to reflect the changes. This ensures that the documentation remains an accurate and effective resource for developers. This includes, but is not limited to, API documentation, architecture overviews, and setup guides.