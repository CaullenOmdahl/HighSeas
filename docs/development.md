# Development Guide

This guide covers local development setup, coding standards, testing procedures, and contribution guidelines for HighSeas.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Debugging](#debugging)
7. [Performance Optimization](#performance-optimization)
8. [Contributing](#contributing)

## Development Setup

### Prerequisites

- **Node.js 20+** - JavaScript runtime
- **npm 9+** - Package manager
- **Docker** - Container runtime (optional)
- **Git** - Version control
- **Real-Debrid Account** - Premium streaming (recommended)

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/CaullenOmdahl/HighSeas.git
   cd HighSeas
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers:**
   ```bash
   # Start both frontend and backend
   ./start.sh

   # Or start separately
   npm run dev    # Frontend (port 5173)
   npm start      # Backend (port 6969)
   ```

### Environment Variables

Create `.env` file:

```bash
# Real-Debrid Integration
REAL_DEBRID_TOKEN=your_token_here

# Application Configuration
NODE_ENV=development
PORT=6969
LOG_LEVEL=debug

# Development Features
VITE_DEV_MODE=true
VITE_API_URL=http://localhost:6969
```

### IDE Setup

**VS Code Extensions:**
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright"
  ]
}
```

**VS Code Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## Project Structure

```
├── src/                          # Frontend source code
│   ├── lib/                      # Core libraries
│   │   ├── components/           # Reusable UI components
│   │   │   ├── EpisodePicker.tsx
│   │   │   ├── VideosList.tsx
│   │   │   └── SafeImage.tsx
│   │   ├── services/             # API services
│   │   │   ├── stremio.ts        # Stremio addon integration
│   │   │   ├── realdebrid.ts     # Real-Debrid API client
│   │   │   └── cache.ts          # Caching utilities
│   │   ├── types/                # TypeScript type definitions
│   │   │   ├── index.ts          # Main types
│   │   │   ├── errors.ts         # Error types
│   │   │   └── streaming.ts      # Streaming types
│   │   ├── utils/                # Utility functions
│   │   │   ├── logger.ts         # Structured logging
│   │   │   ├── cache.ts          # Cache management
│   │   │   └── validation.ts     # Input validation
│   │   └── video/                # Video player system
│   │       ├── StremioVideoSystem.ts    # Core video engine
│   │       ├── StremioVideoPlayer.tsx   # React wrapper
│   │       └── README.md         # Video system docs
│   ├── routes/                   # Main application pages
│   │   ├── Board.tsx             # Main dashboard
│   │   ├── MetaDetails.tsx       # Content details page
│   │   ├── StremioPlayer.tsx     # Video player page
│   │   ├── Search.tsx            # Search interface
│   │   └── Settings.tsx          # Application settings
│   ├── stremio/                  # Stremio-style UI components
│   │   └── components/           # Stremio UI component library
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # Application entry point
│   └── index.less                # Global styles
├── server/                       # Backend server
│   └── index.js                  # Express.js server
├── docs/                         # Documentation
│   ├── api.md                    # API documentation
│   ├── architecture.md           # System architecture
│   ├── deployment.md             # Deployment guide
│   ├── troubleshooting.md        # Troubleshooting guide
│   └── development.md            # This file
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests
├── reference/                    # Reference files
│   └── manifest.json             # Local Torrentio manifest
├── public/                       # Static assets
├── docker-compose.yml            # Container orchestration
├── Dockerfile                    # Container definition
├── vite.config.ts               # Build configuration
├── vitest.config.ts             # Test configuration
├── tsconfig.json                # TypeScript configuration
├── eslint.config.js             # Linting configuration
└── package.json                 # Project dependencies
```

### Key Files and Their Purpose

**Frontend Core:**
- `src/App.tsx` - Main React application component
- `src/main.tsx` - Application entry point with routing
- `src/routes/` - Page-level components for different routes

**Video Player System:**
- `src/lib/video/StremioVideoSystem.ts` - Core video engine with HLS support
- `src/lib/video/StremioVideoPlayer.tsx` - React wrapper for video system
- `src/routes/StremioPlayer.tsx` - Complete player UI with controls

**Services:**
- `src/lib/services/stremio.ts` - Stremio addon communication
- `src/lib/services/realdebrid.ts` - Real-Debrid API integration
- `server/index.js` - Express.js backend server

**Configuration:**
- `vite.config.ts` - Build tool configuration
- `tsconfig.json` - TypeScript compiler settings
- `eslint.config.js` - Code quality rules

## Development Workflow

### Daily Development

1. **Start development environment:**
   ```bash
   ./start.sh
   ```

2. **Make changes to code**

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Check code quality:**
   ```bash
   npm run lint
   npm run type-check
   ```

5. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature-branch
   ```

### Available Scripts

```bash
# Development
npm run dev              # Start Vite dev server (port 5173)
npm start               # Start backend server (port 6969)
./start.sh              # Start both servers

# Building
npm run build           # Production build
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint + Prettier checks
npm run lint:fix        # Auto-fix linting issues
npm run format          # Format code with Prettier
npm run type-check      # TypeScript-only type checking

# Testing
npm test               # Unit tests (Vitest)
npm run test:watch     # Unit tests in watch mode
npm run test:coverage  # Unit tests with coverage report
npm run test:ui        # Interactive test UI
npm run test:integration  # Integration tests
npm run test:e2e       # End-to-end tests (Playwright)
npm run test:all       # Complete test suite

# Docker
npm run docker:build  # Build Docker image
npm run docker:run    # Run Docker container
```

### Git Workflow

**Branch Strategy:**
```bash
# Main development branch
main

# Feature branches
feature/video-player-enhancement
feature/real-debrid-retry-system
fix/subtitle-encoding-issue

# Release branches
release/v1.2.0
```

**Commit Message Format:**
```
type(scope): description

feat(player): add 6-attempt retry system for Real-Debrid
fix(subtitles): resolve encoding issues with SRT files
docs(api): update API documentation
test(player): add unit tests for video system
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

## Coding Standards

### TypeScript Guidelines

**Interface Definitions:**
```typescript
// Use PascalCase for interfaces
interface VideoPlayerProps {
  streamUrl?: string;
  autoplay?: boolean;
  onError?: (error: Error) => void;
}

// Use descriptive property names
interface StreamSource {
  url: string;
  quality: '4K' | '1080p' | '720p' | '480p';
  provider: string;
  size?: string;
}
```

**Function Definitions:**
```typescript
// Use arrow functions for components
const VideoPlayer: React.FC<VideoPlayerProps> = ({ streamUrl, autoplay }) => {
  // Component logic
};

// Use function declarations for utilities
function parseSubtitleTime(timeString: string): number {
  // Utility logic
}

// Use async/await for promises
async function fetchStreams(id: string): Promise<StreamSource[]> {
  const response = await fetch(`/api/streams/${id}`);
  return response.json();
}
```

**Error Handling:**
```typescript
// Use typed errors
class StreamingError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'low' | 'medium' | 'high' | 'critical'
  ) {
    super(message);
    this.name = 'StreamingError';
  }
}

// Use try-catch for async operations
try {
  const streams = await fetchStreams(id);
  return streams;
} catch (error) {
  if (error instanceof StreamingError) {
    logError(LogCategory.STREAM, error.message, { code: error.code });
  }
  throw error;
}
```

### React Guidelines

**Component Structure:**
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { StreamSource } from '../types';
import './VideoPlayer.module.less';

interface VideoPlayerProps {
  streamUrl?: string;
  onError?: (error: Error) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  streamUrl, 
  onError 
}) => {
  // State hooks
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect hooks
  useEffect(() => {
    // Side effects
  }, [streamUrl]);

  // Callback hooks
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  // Event handlers
  const handleError = (error: Error) => {
    setError(error.message);
    onError?.(error);
  };

  // Render
  return (
    <div className="video-player">
      {/* JSX content */}
    </div>
  );
};
```

**Custom Hooks:**
```typescript
// Custom hook for video state management
function useVideoPlayer(streamUrl?: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const play = useCallback(() => {
    // Play logic
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    // Pause logic
    setIsPlaying(false);
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    play,
    pause
  };
}
```

### CSS/Styling Guidelines

**CSS Modules:**
```less
// VideoPlayer.module.less
.videoPlayer {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;

  &.loading {
    .spinner {
      display: block;
    }
  }

  .controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    padding: 20px;
    transform: translateY(100%);
    transition: transform 0.3s ease;

    &.visible {
      transform: translateY(0);
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .videoPlayer {
    .controls {
      padding: 10px;
    }
  }
}
```

**Component Styling:**
```typescript
import styles from './VideoPlayer.module.less';

const VideoPlayer = () => {
  return (
    <div className={`${styles.videoPlayer} ${loading ? styles.loading : ''}`}>
      <div className={`${styles.controls} ${controlsVisible ? styles.visible : ''}`}>
        {/* Controls */}
      </div>
    </div>
  );
};
```

### Performance Guidelines

**Optimization Techniques:**

**1. Component Memoization:**
```typescript
// Memoize expensive components
const VideoPlayer = React.memo<VideoPlayerProps>(({ streamUrl, onError }) => {
  // Component logic
});

// Memoize callback functions
const handleError = useCallback((error: Error) => {
  onError?.(error);
}, [onError]);
```

**2. Lazy Loading:**
```typescript
// Route-based code splitting
const VideoPlayer = lazy(() => import('./components/VideoPlayer'));
const MetaDetails = lazy(() => import('./routes/MetaDetails'));

// Component lazy loading with suspense
<Suspense fallback={<LoadingSpinner />}>
  <VideoPlayer streamUrl={streamUrl} />
</Suspense>
```

**3. Efficient State Updates:**
```typescript
// Batch state updates
const [state, setState] = useState({ isPlaying: false, volume: 1.0 });

const updatePlayerState = useCallback((updates: Partial<typeof state>) => {
  setState(prev => ({ ...prev, ...updates }));
}, []);
```

**4. Memory Management:**
```typescript
// Clean up resources in useEffect
useEffect(() => {
  const videoSystem = new StremioVideoSystem();
  
  return () => {
    videoSystem.destroy(); // Clean up
  };
}, []);
```

## Testing

### Unit Testing

**Component Testing:**
```typescript
// tests/components/VideoPlayer.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoPlayer } from '../src/components/VideoPlayer';

describe('VideoPlayer', () => {
  test('renders video player component', () => {
    render(<VideoPlayer streamUrl="https://example.com/video.mp4" />);
    expect(screen.getByRole('video')).toBeInTheDocument();
  });

  test('handles play/pause interaction', () => {
    const onError = jest.fn();
    render(<VideoPlayer streamUrl="test.mp4" onError={onError} />);
    
    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);
    
    expect(playButton).toHaveTextContent('Pause');
  });
});
```

**Service Testing:**
```typescript
// tests/services/realdebrid.test.ts
import { RealDebridService } from '../src/lib/services/realdebrid';

describe('RealDebridService', () => {
  let service: RealDebridService;

  beforeEach(() => {
    service = new RealDebridService('test-token');
  });

  test('converts magnet link successfully', async () => {
    const mockResponse = {
      streamUrl: 'https://download.real-debrid.com/test.mp4',
      status: 'ready'
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await service.convertMagnetToStream('magnet:test');
    expect(result.status).toBe('ready');
  });
});
```

### Integration Testing

**API Testing:**
```typescript
// tests/integration/api.test.ts
import request from 'supertest';
import { app } from '../server/index.js';

describe('API Endpoints', () => {
  test('GET /api/health returns health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /api/addon/manifest.json returns manifest', async () => {
    const response = await request(app)
      .get('/api/addon/manifest.json')
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('resources');
  });
});
```

### End-to-End Testing

**Playwright E2E Tests:**
```typescript
// tests/e2e/streaming.spec.ts
import { test, expect } from '@playwright/test';

test('complete streaming workflow', async ({ page }) => {
  // Navigate to application
  await page.goto('/');

  // Search for content
  await page.click('[data-testid="search-button"]');
  await page.fill('[data-testid="search-input"]', 'The Matrix');
  await page.press('[data-testid="search-input"]', 'Enter');

  // Select first result
  await page.click('[data-testid="search-result"]:first-child');

  // Check content details page
  await expect(page.locator('h1')).toContainText('The Matrix');

  // Click play button
  await page.click('[data-testid="play-button"]');

  // Verify video player loads
  await expect(page.locator('video')).toBeVisible();
});
```

### Test Configuration

**Vitest Configuration:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
```

**Test Setup:**
```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.mock('../src/lib/server-config', () => ({
  serverConfig: {
    realDebridToken: 'test-token',
    nodeEnv: 'test'
  }
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));
```

## Debugging

### Frontend Debugging

**Browser DevTools:**
```javascript
// Console debugging commands
window.DEBUG = true;

// Video player debugging
console.log(window.videoPlayer);

// HLS.js debugging
if (window.Hls) {
  window.Hls.DefaultConfig.debug = true;
}

// Performance monitoring
console.log(performance.getEntriesByType('navigation'));
console.log(performance.memory);
```

**React Developer Tools:**
- Install React DevTools browser extension
- Use Profiler to identify performance issues
- Inspect component props and state

### Backend Debugging

**Server Logging:**
```javascript
// server/index.js
const debug = require('debug');
const log = debug('highseas:server');

app.use((req, res, next) => {
  log(`${req.method} ${req.path}`);
  next();
});
```

**Node.js Debugging:**
```bash
# Start server with debugging
node --inspect server/index.js

# Connect Chrome DevTools
# Open chrome://inspect in Chrome
```

### Video Player Debugging

**HLS.js Debugging:**
```javascript
// Enable HLS.js debugging
if (Hls.isSupported()) {
  const hls = new Hls({
    debug: true,
    enableWorker: false // Easier debugging
  });
  
  hls.on(Hls.Events.ERROR, (event, data) => {
    console.error('HLS Error:', data);
  });
}
```

**FFmpeg Debugging:**
```bash
# Enable verbose FFmpeg logging
docker exec highseas-streaming \
  ffmpeg -loglevel debug -i input.mkv output.m3u8
```

## Performance Optimization

### Bundle Size Optimization

**Analyze Bundle:**
```bash
# Build with bundle analysis
npm run build -- --analyze

# Check bundle sizes
npx vite-bundle-analyzer dist
```

**Code Splitting:**
```typescript
// Route-based splitting
const routes = [
  {
    path: '/',
    component: lazy(() => import('./routes/Board'))
  },
  {
    path: '/watch/:id',
    component: lazy(() => import('./routes/StremioPlayer'))
  }
];

// Component-based splitting
const VideoPlayer = lazy(() => 
  import('./components/VideoPlayer').then(module => ({
    default: module.VideoPlayer
  }))
);
```

### Memory Optimization

**Prevent Memory Leaks:**
```typescript
// Clean up event listeners
useEffect(() => {
  const handleResize = () => {
    // Handle resize
  };

  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// Clean up timers
useEffect(() => {
  const timer = setInterval(() => {
    // Timer logic
  }, 1000);

  return () => {
    clearInterval(timer);
  };
}, []);
```

### Network Optimization

**Request Optimization:**
```typescript
// Debounce search requests
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    fetchSearchResults(query);
  }, 300),
  []
);

// Cancel requests on unmount
useEffect(() => {
  const controller = new AbortController();

  fetch('/api/search', {
    signal: controller.signal
  });

  return () => {
    controller.abort();
  };
}, []);
```

## Contributing

### Getting Started

1. **Fork the repository**
2. **Create feature branch:**
   ```bash
   git checkout -b feature/my-new-feature
   ```
3. **Make changes and test:**
   ```bash
   npm run test:all
   npm run lint
   ```
4. **Commit changes:**
   ```bash
   git commit -m "feat: add my new feature"
   ```
5. **Push and create PR:**
   ```bash
   git push origin feature/my-new-feature
   ```

### Code Review Guidelines

**Before Submitting:**
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Performance impact considered
- [ ] Security implications reviewed

**PR Description Template:**
```markdown
## Changes
- Brief description of changes

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] E2E tests pass

## Performance
- Bundle size impact: +/- X KB
- Memory usage impact: minimal/moderate/high

## Security
- No sensitive data exposed
- Input validation added where needed
```

### Release Process

1. **Update version:**
   ```bash
   npm version patch|minor|major
   ```

2. **Update changelog:**
   ```markdown
   ## [1.2.0] - 2025-08-02
   ### Added
   - New feature X
   ### Fixed
   - Bug Y
   ### Changed
   - Improvement Z
   ```

3. **Create release:**
   ```bash
   git tag v1.2.0
   git push origin v1.2.0
   ```

4. **Deploy:**
   ```bash
   npm run docker:build
   npm run docker:publish
   ```

This development guide provides a comprehensive foundation for contributing to HighSeas with best practices for code quality, testing, and performance optimization.