# Video Player System Documentation

This document provides comprehensive documentation for the HighSeas video player system, which implements a complete Stremio-compatible video player with HLS transcoding capabilities.

## Overview

The HighSeas video player system is built on three core components that work together to provide a seamless streaming experience:

1. **StremioVideoSystem** - Core video engine with HLS and subtitle support
2. **StremioVideoPlayer** - React wrapper component 
3. **StremioPlayer** - Complete player UI with controls and error handling

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    StremioPlayer.tsx                            │
│  Complete Player UI with Controls, Mobile Support & Error      │
│  Handling with 6-Attempt Retry System                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │ React Props & Callbacks
┌─────────────────────▼───────────────────────────────────────────┐
│                StremioVideoPlayer.tsx                          │
│  React Wrapper Component - Props to Actions Bridge             │
└─────────────────────┬───────────────────────────────────────────┘
                      │ Actions & Events
┌─────────────────────▼───────────────────────────────────────────┐
│                StremioVideoSystem.ts                           │
│  Core Video Engine with HLS.js Integration                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │HTML5 Video  │ │   HLS.js    │ │  Subtitles  │ │   Event   │ │
│  │   Element   │ │Integration  │ │   System    │ │  System   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────┬───────────────────────────────────────────┘
                      │ Media Streams
┌─────────────────────▼───────────────────────────────────────────┐
│                 HLS Transcoding Service                        │
│  FFmpeg Pipeline for MKV → HLS Conversion                      │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. StremioVideoSystem.ts

The heart of the video player system, `StremioVideoSystem` provides:

#### Key Features
- **Direct Video Playback** - Native HTML5 video for supported formats
- **HLS Transcoding** - Automatic MKV conversion using FFmpeg
- **Advanced Subtitles** - SRT/WebVTT parsing with real-time rendering
- **Event-Driven Architecture** - Property observation and action dispatch
- **Error Recovery** - Intelligent fallback and retry mechanisms

#### Core Methods

```typescript
class StremioVideoSystem extends EventEmitter {
  // Primary control methods
  load(stream: { url: string; autoplay?: boolean }): void
  play(): void
  pause(): void
  seek(time: number): void
  setVolume(volume: number): void
  
  // Subtitle management
  addSubtitleTrack(track: SubtitleTrack): void
  selectSubtitleTrack(trackId: string | null): void
  
  // Property observation (Stremio pattern)
  observeProperty(property: string, callback: Function): void
  setProp(property: string, value: any): void
  
  // Cleanup
  destroy(): void
}
```

#### Stream Loading Logic

```typescript
load(stream: { url: string; autoplay?: boolean }) {
  logInfo(LogCategory.STREAM, 'Loading stream via load command', {
    url: stream.url,
    autoplay: stream.autoplay
  });

  this.currentStream = stream.url;
  this.autoplay = stream.autoplay || false;

  // Check if transcoding is needed
  if (this.shouldTranscode(stream.url)) {
    const transcodingUrl = this.generateTranscodingUrl(stream.url);
    this.setupHLS(transcodingUrl);
  } else {
    this.setDirectSource(stream.url);
  }
}
```

#### Transcoding Decision Logic

```typescript
private shouldTranscode(streamUrl: string | null): boolean {
  if (!streamUrl) return false;
  
  // Always transcode MKV files to ensure compatibility
  // MKV containers often have codec/subtitle compatibility issues
  if (streamUrl.includes('.mkv')) {
    return true; // Force transcoding for all MKV files
  }
  
  // Add other transcoding rules here (codec issues, etc.)
  return false;
}
```

#### HLS Integration

```typescript
private setupHLS(hlsUrl: string) {
  if (Hls.isSupported()) {
    this.hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 60
    });

    this.hls.loadSource(hlsUrl);
    this.hls.attachMedia(this.videoElement!);
    
    // HLS event handling
    this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
      logInfo(LogCategory.STREAM, 'HLS manifest parsed successfully');
      if (this.autoplay) {
        this.play();
      }
    });

    this.hls.on(Hls.Events.ERROR, (event, data) => {
      logError(LogCategory.STREAM, 'HLS playback error', { event, data });
      this.handleHLSError(data);
    });
  }
}
```

### 2. StremioVideoPlayer.tsx

React wrapper component that bridges React props to StremioVideoSystem actions.

#### Component Interface

```typescript
interface StremioVideoPlayerProps {
  streamUrl?: string;
  autoplay?: boolean;
  muted?: boolean;
  volume?: number;
  time?: number;
  paused?: boolean;
  subtitleTracks?: SubtitleTrack[];
  selectedSubtitleTrack?: string | null;
  onPropChanged?: (prop: string, value: any) => void;
  onAction?: (action: string, args?: any) => void;
}
```

#### Props to Actions Bridge

```typescript
useEffect(() => {
  if (!videoSystem) return;

  // Convert React props to video system actions
  if (streamUrl && streamUrl !== lastStreamUrl.current) {
    videoSystem.load({ url: streamUrl, autoplay });
    lastStreamUrl.current = streamUrl;
  }

  if (typeof paused === 'boolean') {
    if (paused) {
      videoSystem.pause();
    } else {
      videoSystem.play();
    }
  }

  if (typeof volume === 'number') {
    videoSystem.setVolume(volume);
  }

  if (typeof time === 'number') {
    videoSystem.seek(time);
  }
}, [streamUrl, autoplay, paused, volume, time]);
```

#### Event Handling

```typescript
useEffect(() => {
  if (!videoSystem) return;

  const handlePropChanged = (prop: string, value: any) => {
    onPropChanged?.(prop, value);
  };

  const handleAction = (action: string, args?: any) => {
    onAction?.(action, args);
  };

  // Subscribe to video system events
  videoSystem.observeProperty('paused', handlePropChanged);
  videoSystem.observeProperty('time', handlePropChanged);
  videoSystem.observeProperty('duration', handlePropChanged);
  videoSystem.observeProperty('volume', handlePropChanged);
  videoSystem.observeProperty('buffering', handlePropChanged);

  videoSystem.on('action', handleAction);
  videoSystem.on('error', handleAction);

  return () => {
    // Cleanup subscriptions
    videoSystem.destroy();
  };
}, [videoSystem]);
```

### 3. StremioPlayer.tsx

Complete player UI implementation with mobile controls and enhanced error handling.

#### Enhanced Retry System

The key improvement in HighSeas is the enhanced retry mechanism for Real-Debrid link expiration:

```typescript
const handleVideoError = useCallback((error: any) => {
  console.error('Video error:', error);
  
  // Check if this is an HLS transcoding error (don't redirect for these)
  if (streamUrl?.includes('/api/hls/')) {
    console.warn('HLS transcoding error detected:', error);
    setError('⚙️ Video transcoding is having issues. This may resolve automatically as the stream processes.');
    setLoading(false);
    return;
  }
  
  // Check if this is a Real-Debrid link that may have expired
  if (streamUrl?.includes('real-debrid.com') && 
      (error.code === 4 || error.message?.includes('404') || error.message?.includes('Network error'))) {
    
    // Enhanced 6-attempt retry with exponential backoff
    if (originalMagnet && linkRefreshCount < 6) {
      const currentAttempt = linkRefreshCount + 1;
      setError(`🔄 Stream link expired, refreshing... (attempt ${currentAttempt}/6)`);
      setLinkRefreshCount(prev => prev + 1);
      setLoading(true);
      
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s
      const retryDelay = Math.min(1000 * Math.pow(2, linkRefreshCount), 32000);
      
      console.log(`🔄 Retrying Real-Debrid link refresh (attempt ${currentAttempt}/6) with ${retryDelay}ms delay`);
      
      setTimeout(() => {
        convertMagnetToStream(originalMagnet);
      }, retryDelay);
      return;
    } else if (linkRefreshCount >= 6) {
      setError('❌ Unable to refresh stream link after 6 attempts. The Real-Debrid service may be experiencing issues. Please try selecting a different quality or source.');
      setLoading(false);
      return;
    }
  }
  
  setError(error.message || 'Video playback error');
  setLoading(false);
}, [streamUrl, originalMagnet, linkRefreshCount]);
```

#### Mobile Touch Controls

```typescript
const handleTouchStart = (e: React.TouchEvent) => {
  if (e.touches.length === 1) {
    setLastTap({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }
};

const handleTouchEnd = (e: React.TouchEvent) => {
  if (e.changedTouches.length === 1 && lastTap) {
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - lastTap.x);
    const deltaY = Math.abs(touch.clientY - lastTap.y);
    
    // Simple tap detection (no significant movement)
    if (deltaX < 10 && deltaY < 10) {
      handlePlayPause();
    }
  }
  setLastTap(null);
};
```

## HLS Transcoding System

### FFmpeg Pipeline

The HLS transcoding service converts MKV files to browser-compatible HLS streams:

#### Master Playlist Generation

```typescript
// /api/hls/:sessionId/master.m3u8
app.get('/api/hls/:sessionId/master.m3u8', async (req, res) => {
  const { sessionId } = req.params;
  const { mediaURL } = req.query;
  
  // Validate media URL for security
  if (!validateMediaURL(mediaURL)) {
    return res.status(403).json({ 
      error: 'Invalid or untrusted media URL',
      message: 'Media URL must be from a trusted streaming domain'
    });
  }
  
  // Generate HLS master playlist
  const masterPlaylist = `#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=1920x1080,CODECS="avc1.64001f,mp4a.40.2"
playlist.m3u8?mediaURL=${encodeURIComponent(mediaURL)}`;

  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  res.send(masterPlaylist);
});
```

#### Segment Generation

```typescript
// /api/hls/:sessionId/playlist.m3u8
app.get('/api/hls/:sessionId/playlist.m3u8', async (req, res) => {
  const { sessionId } = req.params;
  const { mediaURL } = req.query;
  
  // Generate segment playlist
  let playlist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0\n`;

  // Add segments (simplified - real implementation would be dynamic)
  for (let i = 0; i < 6; i++) {
    playlist += `#EXTINF:10.0,\n`;
    playlist += `segment_${i}.ts?mediaURL=${encodeURIComponent(mediaURL)}\n`;
  }

  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.send(playlist);
});
```

#### FFmpeg Command Generation

```javascript
function generateFFmpegCommand(inputURL, outputDir, sessionId) {
  return [
    '-i', inputURL,
    '-c:v', 'libx264',        // H.264 video codec
    '-c:a', 'aac',            // AAC audio codec
    '-preset', 'ultrafast',    // Fast encoding
    '-crf', '23',             // Good quality/size balance
    '-maxrate', '2000k',      // Max bitrate
    '-bufsize', '4000k',      // Buffer size
    '-g', '50',               // GOP size
    '-hls_time', '10',        // 10-second segments
    '-hls_list_size', '6',    // Keep 6 segments
    '-hls_flags', 'delete_segments+append_list',
    '-f', 'hls',
    `${outputDir}/${sessionId}/playlist.m3u8`
  ];
}
```

#### Hardware Acceleration

```javascript
// AMD GPU acceleration (VAAPI)
if (process.env.ENABLE_AMD_GPU === 'true') {
  ffmpegArgs.unshift(
    '-vaapi_device', '/dev/dri/renderD128',
    '-hwaccel', 'vaapi',
    '-hwaccel_output_format', 'vaapi'
  );
  
  // Use hardware encoder
  videoCodec = 'h264_vaapi';
}
```

## Subtitle System

### Subtitle Parsing

The video player supports multiple subtitle formats:

#### SRT Parser

```typescript
function parseSRT(srtContent: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const blocks = srtContent.split(/\n\s*\n/);
  
  blocks.forEach(block => {
    const lines = block.trim().split('\n');
    if (lines.length >= 3) {
      const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);
      
      if (timeMatch) {
        const startTime = parseTime(timeMatch.slice(1, 5));
        const endTime = parseTime(timeMatch.slice(5, 9));
        const text = lines.slice(2).join('\n');
        
        cues.push({
          startTime,
          endTime,
          text: cleanSubtitleText(text)
        });
      }
    }
  });
  
  return cues.sort((a, b) => a.startTime - b.startTime);
}
```

#### WebVTT Parser

```typescript
function parseWebVTT(vttContent: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const lines = vttContent.split('\n');
  
  let currentCue: Partial<SubtitleCue> = {};
  let inCue = false;
  
  lines.forEach(line => {
    line = line.trim();
    
    if (line.includes(' --> ')) {
      const [start, end] = line.split(' --> ');
      currentCue.startTime = parseWebVTTTime(start);
      currentCue.endTime = parseWebVTTTime(end);
      inCue = true;
    } else if (inCue && line === '') {
      if (currentCue.text) {
        cues.push(currentCue as SubtitleCue);
      }
      currentCue = {};
      inCue = false;
    } else if (inCue && line !== '') {
      currentCue.text = (currentCue.text || '') + line + '\n';
    }
  });
  
  return cues;
}
```

#### Subtitle Rendering

```typescript
private renderSubtitles() {
  if (!this.subtitlesContainer || !this.currentSubtitleTrack) return;
  
  const currentTime = this.videoElement?.currentTime || 0;
  const activeCue = this.currentSubtitleTrack.cues.find(cue => 
    currentTime >= cue.startTime && currentTime <= cue.endTime
  );
  
  if (activeCue && activeCue !== this.lastRenderedCue) {
    this.subtitlesContainer.innerHTML = `
      <div class="subtitle-text" style="
        position: absolute;
        bottom: 10%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: ${this.subtitleFontSize}px;
        text-align: center;
        max-width: 80%;
        word-wrap: break-word;
      ">
        ${activeCue.text}
      </div>
    `;
    this.lastRenderedCue = activeCue;
  } else if (!activeCue && this.lastRenderedCue) {
    this.subtitlesContainer.innerHTML = '';
    this.lastRenderedCue = null;
  }
}
```

### CORS Subtitle Proxy

```typescript
// /api/subtitles endpoint for external subtitle files
app.get('/api/subtitles', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid URL parameter' });
    }
    
    console.log('🎬 Fetching subtitle file:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HighSeas/1.1.9'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const subtitleContent = await response.text();
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(subtitleContent);
    
  } catch (error) {
    console.error('❌ Subtitle proxy error:', error);
    res.status(500).json({
      error: 'Failed to fetch subtitle file',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
```

## Performance Optimizations

### Memory Management

```typescript
destroy() {
  // Clean up HLS
  if (this.hls) {
    this.hls.destroy();
    this.hls = null;
  }
  
  // Clean up video element
  if (this.videoElement) {
    this.videoElement.pause();
    this.videoElement.src = '';
    this.videoElement.load();
    this.videoElement = null;
  }
  
  // Clear subtitle references
  this.subtitleTracks = [];
  this.currentSubtitleTrack = null;
  
  // Stop render loop
  if (this.subtitleRenderInterval) {
    clearInterval(this.subtitleRenderInterval);
  }
  
  // Clear all event listeners
  this.removeAllListeners();
}
```

### Buffer Management

```typescript
// Optimized HLS configuration
const hlsConfig = {
  enableWorker: true,
  lowLatencyMode: false,
  backBufferLength: 90,      // Keep 90s of back buffer
  maxBufferLength: 30,       // Forward buffer target
  maxMaxBufferLength: 60,    // Maximum forward buffer
  maxBufferSize: 60 * 1000 * 1000, // 60MB max buffer
  maxBufferHole: 0.5,        // Max gap before seeking
  highBufferWatchdogPeriod: 2, // Buffer monitoring
  nudgeOffset: 0.1,          // Fine-tune seeking
  nudgeMaxRetry: 3           // Retry attempts
};
```

### Request Optimization

```typescript
// Connection pooling for HLS segments
const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 6,
  maxFreeSockets: 2,
  timeout: 15000
});

// Request deduplication
const requestCache = new Map();
function dedupedFetch(url: string) {
  if (requestCache.has(url)) {
    return requestCache.get(url);
  }
  
  const promise = fetch(url).finally(() => {
    requestCache.delete(url);
  });
  
  requestCache.set(url, promise);
  return promise;
}
```

## Error Handling & Recovery

### Error Categories

The video player handles several categories of errors:

1. **Network Errors** - Connection timeouts, DNS failures
2. **Stream Errors** - Invalid URLs, expired links
3. **Transcoding Errors** - FFmpeg failures, codec issues
4. **Player Errors** - HTML5 video element errors
5. **Subtitle Errors** - Parsing failures, missing files

### Recovery Strategies

#### Automatic Retry

```typescript
private async retryWithBackoff(operation: () => Promise<any>, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      logInfo(LogCategory.STREAM, `Retry attempt ${attempt}/${maxRetries} in ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

#### Fallback Mechanisms

```typescript
private handleStreamError(error: any) {
  // Try direct playback if HLS fails
  if (this.hls && this.currentStream) {
    logInfo(LogCategory.STREAM, 'HLS failed, attempting direct playback');
    this.hls.destroy();
    this.hls = null;
    this.setDirectSource(this.currentStream);
    return;
  }
  
  // Emit error for upper-level handling
  this.emit('error', {
    critical: true,
    message: error.message || 'Stream playback failed',
    code: error.code || 'UNKNOWN_ERROR'
  });
}
```

## Integration Examples

### Basic Usage

```typescript
import { StremioVideoPlayer } from './lib/video/StremioVideoPlayer';

function VideoApp() {
  const [streamUrl, setStreamUrl] = useState('');
  const [paused, setPaused] = useState(true);
  
  return (
    <StremioVideoPlayer
      streamUrl={streamUrl}
      paused={paused}
      onPropChanged={(prop, value) => {
        if (prop === 'paused') setPaused(value);
      }}
    />
  );
}
```

### Advanced Integration

```typescript
function AdvancedPlayer() {
  const [playerState, setPlayerState] = useState({
    streamUrl: '',
    paused: true,
    volume: 1.0,
    time: 0,
    duration: 0,
    subtitleTracks: [],
    selectedSubtitleTrack: null
  });
  
  const handlePropChanged = (prop: string, value: any) => {
    setPlayerState(prev => ({ ...prev, [prop]: value }));
  };
  
  const handleAction = (action: string, args?: any) => {
    switch (action) {
      case 'error':
        console.error('Player error:', args);
        break;
      case 'ended':
        console.log('Playback ended');
        break;
    }
  };
  
  return (
    <div className="player-container">
      <StremioVideoPlayer
        {...playerState}
        onPropChanged={handlePropChanged}
        onAction={handleAction}
      />
      
      <div className="player-controls">
        <button onClick={() => setPlayerState(prev => ({ 
          ...prev, 
          paused: !prev.paused 
        }))}>
          {playerState.paused ? 'Play' : 'Pause'}
        </button>
        
        <input
          type="range"
          min="0"
          max={playerState.duration}
          value={playerState.time}
          onChange={(e) => setPlayerState(prev => ({ 
            ...prev, 
            time: Number(e.target.value) 
          }))}
        />
      </div>
    </div>
  );
}
```

This comprehensive video player system provides a robust, feature-rich foundation for streaming applications with enterprise-grade error handling, performance optimizations, and extensibility.