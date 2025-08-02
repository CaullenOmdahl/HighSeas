# Architecture Guide

This document provides an in-depth overview of the HighSeas streaming application architecture, design patterns, and system components.

## System Overview

HighSeas is a modern, scalable streaming application built with a microservices-inspired architecture that separates concerns between the frontend user interface, backend API services, and external integrations.

```
┌─────────────────────────────────────────────────────────────────┐
│                           Client Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Ionic Components + Service Workers    │
│  • Netflix-style UI components                                 │
│  • Stremio Video Player System                                 │
│  • Mobile-optimized touch controls                             │
│  • Progressive Web App (PWA) features                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP/WebSocket
┌─────────────────────┴───────────────────────────────────────────┐
│                        API Gateway                             │
├─────────────────────────────────────────────────────────────────┤
│  Express.js Server with Middleware Stack                       │
│  • CORS handling                                               │
│  • Rate limiting                                               │
│  • Security headers                                            │
│  • Request validation                                          │
│  • Error handling                                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼────┐  ┌────────▼────────┐  ┌─────▼─────┐
│  Real  │  │ HLS Transcoding │  │   Local   │
│ Debrid │  │    Service      │  │ Manifest  │
│   API  │  │   (FFmpeg)      │  │  System   │
└────────┘  └─────────────────┘  └───────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App.tsx
├── Routes/
│   ├── Board.tsx (Main Dashboard)
│   ├── MetaDetails.tsx (Content Details)
│   ├── StremioPlayer.tsx (Video Player)
│   ├── Search.tsx (Search Interface)
│   └── Settings.tsx (Configuration)
├── Components/
│   ├── MainNavBars.tsx (Navigation)
│   ├── VideosList.tsx (Episode Lists)
│   ├── EpisodePicker.tsx (Season/Episode Selector)
│   └── SafeImage.tsx (Optimized Images)
├── Services/
│   ├── stremio.ts (Addon Communication)
│   ├── realdebrid.ts (Premium Streaming)
│   └── logger.ts (Structured Logging)
└── Video System/
    ├── StremioVideoSystem.ts (Core Player)
    ├── StremioVideoPlayer.tsx (React Wrapper)
    └── StremioPlayer.tsx (Full UI)
```

### State Management

The application uses React's built-in state management with strategic patterns:

#### Local State (useState/useReducer)
- Component-specific UI state
- Form inputs and validation
- Modal visibility and interactions

#### Context API
- User preferences and settings
- Theme and accessibility options
- Global error handling

#### Custom Hooks
- `useVideo()` - Video player state management
- `useStreams()` - Stream fetching and caching
- `useRealDebrid()` - Premium service integration

### Data Flow Architecture

```
User Interaction
       │
       ▼
   React Component
       │
       ▼
   Service Layer (stremio.ts, realdebrid.ts)
       │
       ▼
   API Middleware (Express.js)
       │
       ▼
   External Services (Real-Debrid, Torrentio)
       │
       ▼
   Response Processing
       │
       ▼
   State Update & UI Render
```

## Backend Architecture

### Express.js Server Structure

```javascript
// Server initialization
app.js
├── Middleware Stack
│   ├── CORS configuration
│   ├── Rate limiting
│   ├── Security headers
│   ├── Body parsing
│   └── Error handling
├── Route Handlers
│   ├── /api/health
│   ├── /api/realdebrid
│   ├── /api/addon/*
│   ├── /api/hls/*
│   └── /api/subtitles
├── Service Classes
│   ├── RealDebridService
│   ├── HLSTranscodingService
│   └── ManifestService
└── Static File Serving
    └── React build output
```

### Middleware Stack

#### 1. Security Middleware
```javascript
// CORS Configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // ... additional headers
});
```

#### 2. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

#### 3. Request Validation
```javascript
const validateMediaURL = (url) => {
  const allowedDomains = [
    'real-debrid.com',
    'download.real-debrid.com',
    '*.download.real-debrid.com'
  ];
  // Domain validation logic
};
```

## Video Player System

### Stremio Video Architecture

The application implements a complete Stremio-compatible video player system:

```javascript
StremioVideoSystem
├── Core Video Element Management
├── HLS.js Integration
├── Subtitle Rendering System
├── Event Management
├── Property Observation
└── Action Dispatch System
```

#### Core Components

**1. StremioVideoSystem.ts**
- Low-level video element management
- HLS stream handling with hls.js
- Subtitle parsing and rendering
- Event emission and handling
- Transcoding decision logic

**2. StremioVideoPlayer.tsx**
- React wrapper around StremioVideoSystem
- Props-to-actions bridge
- React lifecycle integration
- Error boundary implementation

**3. StremioPlayer.tsx**
- Complete player UI implementation
- Control bar and interactions
- Mobile touch controls
- Fullscreen management
- Retry logic with exponential backoff

### HLS Transcoding Pipeline

```
Input Video (MKV/MP4)
       │
       ▼
Codec Detection
       │
       ▼
Transcoding Decision
       │
    ┌──▼──┐
    │ Yes │ No
    ▼     │
FFmpeg    │
Pipeline  │
    │     │
    ▼     ▼
HLS Output Direct
Segments   Playback
    │     │
    └──┬──┘
       ▼
Video Player
```

#### Transcoding Logic

```javascript
shouldTranscode(streamUrl) {
  // Always transcode MKV files
  if (streamUrl.includes('.mkv')) {
    return true;
  }
  
  // Check browser codec support
  const video = document.createElement('video');
  const canPlayMKV = video.canPlayType('video/x-matroska');
  
  return canPlayMKV === ''; // Empty string means no support
}
```

#### FFmpeg Command Generation

```javascript
generateFFmpegCommand(inputURL, outputPath) {
  return [
    '-i', inputURL,
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-f', 'hls',
    '-hls_time', '10',
    '-hls_list_size', '6',
    '-hls_flags', 'delete_segments',
    outputPath
  ];
}
```

## Service Layer Architecture

### Real-Debrid Integration

```javascript
class RealDebridService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.real-debrid.com/rest/1.0';
    this.cache = new Map(); // 30-minute cache
  }

  async convertMagnetToStream(magnetLink) {
    // 1. Add magnet to Real-Debrid
    // 2. Wait for processing
    // 3. Select largest video file
    // 4. Generate direct download link
    // 5. Return streaming URL
  }
}
```

#### Retry Mechanism

The enhanced retry system provides robust error recovery:

```javascript
// Enhanced 6-attempt retry with exponential backoff
if (originalMagnet && linkRefreshCount < 6) {
  const currentAttempt = linkRefreshCount + 1;
  const retryDelay = Math.min(1000 * Math.pow(2, linkRefreshCount), 32000);
  
  setTimeout(() => {
    convertMagnetToStream(originalMagnet);
  }, retryDelay);
}
```

**Retry Schedule**:
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 second delay
- Attempt 4: 4 second delay
- Attempt 5: 8 second delay
- Attempt 6: 16 second delay
- Final failure: 32 second delay (max)

### Stremio Addon System

```javascript
class StremioService {
  private addons = [
    {
      transportUrl: 'https://v3-cinemeta.strem.io',
      manifest: { /* Cinemeta config */ }
    }
  ];

  async getCatalog(type, catalogId, skip, limit) {
    // Fetch catalog from addon
    // Cache results with TTL
    // Transform to internal format
  }

  async getStreams(type, id) {
    // Fetch streams from multiple addons
    // Deduplicate and rank by quality
    // Return sorted stream list
  }
}
```

### Local Manifest System

Instead of fetching external manifests, HighSeas uses a local configuration:

```javascript
// /api/addon/manifest.json endpoint
app.get('/api/addon/manifest.json', async (req, res) => {
  const manifestPath = path.join(__dirname, '..', 'reference', 'manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  res.json(manifest);
});

// Stream proxy endpoint
app.get('/api/addon/stream/:type/:id.json', async (req, res) => {
  const torrentioUrl = `https://torrentio.strem.fun/stream/${type}/${id}.json`;
  const response = await fetch(torrentioUrl);
  const streamData = await response.json();
  res.json(streamData);
});
```

## Security Architecture

### Input Validation

```javascript
const validateRequest = (req, res, next) => {
  // Sanitize all input parameters
  const cleanInput = (str) => {
    return str.replace(/[<>\"']/g, '');
  };
  
  // Validate required parameters
  if (req.method === 'POST' && !req.body.magnetLink) {
    return res.status(400).json({ error: 'Missing required parameter' });
  }
  
  next();
};
```

### Domain Whitelisting

```javascript
const validateMediaURL = (url) => {
  try {
    const urlObj = new URL(url);
    const allowedDomains = [
      'real-debrid.com',
      'download.real-debrid.com',
      'sgp1-4.download.real-debrid.com'
    ];
    
    return allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
};
```

### Security Headers

```javascript
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
};
```

## Performance Architecture

### Caching Strategy

#### Multi-Level Caching

```javascript
// Level 1: Browser Cache
Cache-Control: public, max-age=3600

// Level 2: Application Memory Cache
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Level 3: Service Worker Cache
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(caches.match(event.request));
  }
});
```

#### Cache Invalidation

```javascript
// Automatic cache cleanup
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, 10 * 60 * 1000); // Clean every 10 minutes
```

### Bundle Optimization

#### Code Splitting Strategy

```javascript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'ui-components': [
            './src/lib/components/VideosList.tsx',
            './src/lib/components/EpisodePicker.tsx'
          ],
          'stremio-service': [
            './src/lib/services/stremio.ts'
          ],
          'video-player': [
            './src/lib/video/StremioVideoSystem.ts',
            './src/lib/video/StremioVideoPlayer.tsx'
          ]
        }
      }
    }
  }
};
```

#### Lazy Loading Implementation

```javascript
// Dynamic imports for heavy components
const VideoPlayer = lazy(() => import('./components/VideoPlayer'));
const EpisodePicker = lazy(() => import('./components/EpisodePicker'));

// Route-based code splitting
const routes = [
  { path: '/', component: lazy(() => import('./routes/Board')) },
  { path: '/watch/:id', component: lazy(() => import('./routes/StremioPlayer')) }
];
```

## Logging & Monitoring Architecture

### Structured Logging

```javascript
class Logger {
  static log(level, category, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      ...data
    };
    
    // Console output
    console[level](logEntry);
    
    // File output
    fs.appendFile(`/app/logs/server-${today}.log`, 
      JSON.stringify(logEntry) + '\n'
    );
  }
}
```

#### Log Categories

- **SYSTEM**: Server startup, configuration
- **API**: HTTP requests and responses
- **PLAYER**: Video player events
- **STREAM**: Streaming and transcoding
- **ADDON**: Stremio addon interactions
- **NETWORK**: External API calls
- **ERROR**: Error conditions and recovery

### Health Monitoring

```javascript
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'HighSeas Development Server',
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    },
    features: {
      realDebridEnabled: !!process.env.REAL_DEBRID_TOKEN,
      hlsTranscodingEnabled: true,
      gpuAccelerationEnabled: process.env.ENABLE_AMD_GPU === 'true'
    }
  };
  
  res.json(healthData);
});
```

## Deployment Architecture

### Container Strategy

```dockerfile
# Multi-stage build for optimization
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --ignore-scripts
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
# Install FFmpeg and dependencies
RUN apk add --no-cache ffmpeg mesa-dri-gallium
# Copy built application
COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/server ./server/
COPY --from=builder /app/reference ./reference/
```

### Environment Configuration

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    image: caullen/highseas-streaming:latest
    ports:
      - "6969:6969"
    environment:
      NODE_ENV: production
      REAL_DEBRID_TOKEN: ${REAL_DEBRID_TOKEN}
      ENABLE_AMD_GPU: true
    devices:
      - /dev/dri:/dev/dri
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
```

### Scalability Considerations

#### Horizontal Scaling

```yaml
# Load balancer configuration
services:
  loadbalancer:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      
  app1:
    image: caullen/highseas-streaming:latest
    environment:
      INSTANCE_ID: "app1"
      
  app2:
    image: caullen/highseas-streaming:latest
    environment:
      INSTANCE_ID: "app2"
```

#### Resource Management

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 4G
    reservations:
      cpus: '1.0'
      memory: 2G
```

## Testing Architecture

### Test Pyramid Strategy

```
      ┌─────────────┐
      │     E2E     │ 10% - Full user workflows
      │   Tests     │
      └─────────────┘
     ┌─────────────────┐
     │  Integration    │ 20% - API endpoints
     │     Tests       │
     └─────────────────┘
    ┌───────────────────┐
    │   Unit Tests      │ 70% - Components & services
    └───────────────────┘
```

#### Unit Testing

```javascript
// Component testing with React Testing Library
describe('VideosList Component', () => {
  test('renders episode list correctly', () => {
    render(<VideosList episodes={mockEpisodes} />);
    expect(screen.getByText('Episode 1')).toBeInTheDocument();
  });
});

// Service testing with mocked dependencies
describe('RealDebridService', () => {
  test('converts magnet link successfully', async () => {
    const service = new RealDebridService('test-token');
    const result = await service.convertMagnetToStream('magnet:...');
    expect(result.status).toBe('ready');
  });
});
```

#### Integration Testing

```javascript
// API endpoint testing
describe('API Endpoints', () => {
  test('GET /api/health returns status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
```

#### E2E Testing

```javascript
// Playwright browser testing
test('complete streaming workflow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="search-button"]');
  await page.fill('[data-testid="search-input"]', 'The Matrix');
  await page.click('[data-testid="first-result"]');
  await page.click('[data-testid="play-button"]');
  
  await expect(page.locator('video')).toBeVisible();
});
```

This architecture provides a solid foundation for a scalable, maintainable, and performant streaming application with enterprise-grade security and monitoring capabilities.