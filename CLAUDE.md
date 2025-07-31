# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm run dev                     # Start development server (port 5173)
npm run build                   # Production build
npm run preview                 # Preview production build (port 4173)
npm start                       # Start production server from build/
```

### Code Quality & Security
```bash
npm run lint                    # Run ESLint + Prettier checks
npm run lint:fix                # Auto-fix linting issues
npm run format                  # Format code with Prettier
npm run check                   # SvelteKit + TypeScript checks
npm run type-check              # TypeScript-only type checking
npm run security:check          # Security audit + lint + type check
```

### Testing
```bash
npm test                        # Unit tests (Vitest)
npm run test:watch              # Unit tests in watch mode
npm run test:coverage           # Unit tests with coverage report
npm run test:ui                 # Interactive test UI
npm run test:integration        # Integration tests (API endpoints)
npm run test:e2e                # End-to-end tests (Playwright)
npm run test:e2e:ui             # E2E tests with debugging UI
npm run test:all                # Complete test suite
```

### Docker Operations
```bash
npm run docker:build           # Build Docker image
npm run docker:run             # Run Docker container (port 6969)
npm run docker:up              # Docker Compose up
npm run docker:down            # Docker Compose down
```

## Architecture Overview

### Streaming Architecture (Critical)
This application implements **pure streaming without downloads**:
- `/api/proxy` endpoint streams video content using `Response(response.body)` 
- No temporary files created, no content stored locally
- Range requests forwarded for video seeking functionality
- Memory bounded with 50MB max buffer limit
- Domain whitelist validates stream sources (Real-Debrid, Torrentio)

### Stream Selection Flow
Enhanced user experience with provider and quality selection:
- Users choose streaming source and quality before playback
- `StreamSelector.svelte` component parses stream information
- Extracts provider (Real-Debrid, Torrentio, etc.) and quality (4K, 1080p, etc.)
- Groups streams by provider for organized selection
- "Change Stream Quality" button allows switching during playback

### Security Architecture (Environment Variables)
- **NEVER** hardcode API tokens in client-side code - use `src/lib/server-config.ts`
- Client config (`src/lib/config.ts`) contains only public configuration
- Server config (`src/lib/server-config.ts`) handles sensitive environment variables
- ESLint rules prevent hardcoded secrets (32+ character patterns detected)

### Key Service Layers

**StremioService** (`src/lib/services/stremio.ts`):
- Manages addon loading and catalog/metadata/stream fetching
- Implements caching, retry logic, and timeout handling
- Validates stream sources and filters by quality
- Uses structured logging for debugging addon interactions

**Stream Proxy** (`src/routes/api/proxy/+server.ts`):
- Validates stream URLs against domain whitelist
- Forwards range requests for video seeking
- Sets proper CORS headers for client access
- Implements streaming without local storage

**Caching System** (`src/lib/utils/cache.ts`):
- LRU cache with TTL for requests, metadata, and streams
- Memory management with automatic cleanup
- Cache key generation and invalidation strategies

### Component Architecture

**Player Components**:
- `BufferedPlayer.svelte` - Main video player with buffering management
- `Player.svelte` - Base video player wrapper
- Both integrate with Video.js and handle streaming URLs via proxy

**Performance Components**:
- `LazyImage.svelte` - Intersection observer-based image lazy loading
- `VirtualScroll.svelte` - Efficient rendering for large content lists
- `LazyComponent.svelte` - Dynamic component loading

**Navigation**:
- Full keyboard navigation support via `KeyboardNavigation.svelte`
- Arrow key navigation between content rows and within rows
- WCAG 2.1 AA accessibility compliance

### Error Handling System

**StreamingError** (`src/lib/types/errors.ts`):
- Categorized errors: NETWORK, STREAM, PLAYER, ADDON, PERMISSION, VALIDATION
- Severity levels: LOW, MEDIUM, HIGH, CRITICAL
- Built-in retry mechanisms with exponential backoff
- Error context tracking and recovery suggestions

**Logging** (`src/lib/utils/logger.ts`):
- Structured logging with categories: PLAYER, STREAM, ADDON, NETWORK, UI, PERFORMANCE
- Remote logging support with buffering
- Automatic console.log cleanup in production
- Performance timing helpers

### Bundle Optimization
- Manual chunk splitting in `vite.config.ts` (UI components, Stremio service)
- Dynamic imports for heavy components (Video.js player loaded on-demand)
- Service Worker with cache-first strategy for static assets
- WebP image optimization with fallbacks

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
- Client config: `src/lib/config.ts` (public settings only)
- Server config: `src/lib/server-config.ts` (sensitive environment variables)
- Types: `src/lib/types/` (api.ts, errors.ts)
- Utils: `src/lib/utils/` (logger.ts, cache.ts, etc.)
- Services: `src/lib/services/` (stremio.ts, streamProxy.ts)
- Components: `src/lib/components/` (organized by feature)

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