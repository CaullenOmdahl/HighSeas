# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm run dev                     # Start Vite development server (port 5173)
npm run build                   # Production build (TypeScript + Vite)
npm run preview                 # Preview production build (port 4173)
npm start                       # Start production server (port 6969)
```

### Code Quality & Security
```bash
npm run lint                    # Run ESLint + Prettier checks
npm run lint:fix                # Auto-fix linting issues
npm run format                  # Format code with Prettier
npm run type-check              # TypeScript-only type checking
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

### Technology Stack
This is a **React + TypeScript** streaming application with:
- **Frontend**: React 18 + TypeScript + Vite for fast development
- **Backend**: Express.js server for API endpoints and static file serving
- **UI Framework**: Ionic React components for mobile-first design
- **Styling**: CSS modules with Less preprocessing
- **Video Player**: Custom Stremio-compatible video system with advanced features
- **Build Tool**: Vite with optimized chunking and lazy loading

### Stremio Video Player Architecture (Critical)
Complete implementation of Stremio's proven video player system:
- **StremioVideoSystem** (`src/lib/video/StremioVideoSystem.ts`) - Core video player with HLS support
- **StremioVideoPlayer** (`src/lib/video/StremioVideoPlayer.tsx`) - React wrapper component
- **StremioPlayer** (`src/routes/StremioPlayer.tsx`) - Full-featured player with controls
- **Advanced Subtitles**: SRT/WebVTT parsing with real-time rendering and styling
- **HLS Streaming**: Adaptive streaming with hls.js integration and fallbacks
- **Event-Driven**: Property observation and action dispatch patterns from Stremio
- **Subtitle System**: Advanced subtitle rendering with SRT/WebVTT parsing, CORS proxy, and real-time styling

### Streaming Architecture (Critical)
This application implements **pure streaming without downloads**:
- Stremio video player streams content directly with memory-bounded buffering
- `/api/subtitles` proxy endpoint handles external subtitle files with CORS
- Range requests supported for video seeking functionality
- No temporary files created, no content stored locally
- Domain whitelist validates stream sources (Real-Debrid, Torrentio)

### Stream Selection Flow
Enhanced user experience with provider and quality selection:
- Users choose streaming source and quality before playback
- `VideosList` component in MetaDetails handles episode selection
- Real-Debrid integration converts magnet links to direct streams
- Professional video controls with speed, volume, and fullscreen options
- Mobile-optimized touch controls for Android TV and phone usage

### Security Architecture (Environment Variables)
- **NEVER** hardcode API tokens in client-side code
- All sensitive data handled server-side via Express.js endpoints
- Environment variables managed in `.env` file (server-side only)
- ESLint rules prevent hardcoded secrets (32+ character patterns detected)

### Key Service Layers

**StremioService** (`src/lib/services/stremio.ts`):
- Manages addon loading and catalog/metadata/stream fetching
- Implements caching, retry logic, and timeout handling
- Validates stream sources and filters by quality
- Uses structured logging for debugging addon interactions

**API Endpoints** (`server/index.js`):
- `/api/realdebrid` - Real-Debrid magnet link conversion and status checking
- `/api/subtitles` - CORS-compliant subtitle proxy for external files
- `/api/health` - Server health and status endpoint
- Static file serving with React Router history API fallback

**Caching System** (`src/lib/utils/cache.ts`):
- LRU cache with TTL for requests, metadata, and streams
- Memory management with automatic cleanup
- Cache key generation and invalidation strategies

### Component Architecture

**Video Player Components**:
- `StremioPlayer.tsx` - Main video player route with full Stremio features
- `StremioVideoPlayer.tsx` - React wrapper for Stremio video system
- `StremioVideoSystem.ts` - Core video player with HLS and subtitle support
- `Player.tsx` - Fallback basic HTML5 video player

**UI Components**:
- `VideosList.tsx` - Episode list with mobile touch optimization and pagination
- `EpisodePicker.tsx` - Season/episode selector with performance improvements
- `MetaDetails.tsx` - Movie/TV show detail pages with stream selection
- `SafeImage.tsx` - Optimized image loading with fallbacks

**Layout Components**:
- `MainNavBars.tsx` - Navigation wrapper with horizontal and vertical nav
- `HorizontalNavBar.tsx` - Top navigation with search and branding
- `VerticalNavBar.tsx` - Side navigation (desktop) / bottom navigation (mobile)
- Responsive design with mobile-first approach

**Performance Features**:
- React.memo() for component optimization
- useCallback() for event handler optimization
- Lazy loading with pagination for large episode lists
- CSS modules for scoped styling and better performance

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