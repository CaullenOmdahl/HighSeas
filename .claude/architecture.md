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