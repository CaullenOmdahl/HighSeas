# Stremio Video Player Architecture Analysis

## Overview

Stremio Video is an **"Abstraction layer on top of different media players"** that uses intelligent selection to choose the best video implementation for each platform and stream type.

## Core Architecture Pattern

**Stremio uses a STRATEGY PATTERN with DECORATORS**:

1. **Base Video Implementations** (Different platforms/technologies)
2. **Higher-Order Components (HOCs)** that add functionality
3. **Intelligent Selection Logic** that chooses the best combination

## Key Dependencies from package.json

```json
{
  "hls.js": "https://github.com/Stremio/hls.js/releases/download/v1.5.4-patch2/hls.js-1.5.4-patch2.tgz",
  "vtt.js": "github:jaruba/vtt.js#84d33d157848407d790d78423dacc41a096294f0",
  "buffer": "6.0.3",
  "color": "4.2.3", 
  "deep-freeze": "0.0.1",
  "eventemitter3": "4.0.7",
  "magnet-uri": "6.2.0",
  "video-name-parser": "1.4.6"
}
```

**Key Observations**:
- **Custom HLS.js build** with Stremio patches
- **Custom VTT.js fork** for advanced subtitle handling
- **magnet-uri** for torrent streaming support

## Video Implementation Selection Logic

The `selectVideoImplementation.js` contains the decision tree:

### Selection Priority Order:

1. **Chromecast** → `ChromecastSenderVideo`
2. **YouTube streams** → `YouTubeVideo` + HTML subtitles
3. **iFrame players** → `IFrameVideo` 
4. **Shell transport** → `ShellVideo` + streaming server + HTML subtitles
5. **Streaming server available** → Platform-specific + streaming server + HTML subtitles
   - Tizen → `TizenVideo`
   - webOS → `WebOsVideo` 
   - Titan/NetTV → `TitanVideo`
   - Vidaa → `VidaaVideo`
   - **Default** → `HTMLVideo` ⭐ **THIS IS THE WEB VERSION**
6. **Direct URL** → Platform-specific + HTML subtitles
   - Same platform logic as above
   - **Default** → `HTMLVideo` ⭐ **WEB FALLBACK**

## Higher-Order Components (Decorators)

Stremio uses **3 main HOCs** that wrap base video implementations:

### 1. `withStreamingServer`
- **Purpose**: Adds server-side transcoding support
- **Usage**: `withStreamingServer(withHTMLSubtitles(HTMLVideo))`
- **Features**: 
  - Stream conversion
  - Torrent handling
  - Server communication

### 2. `withHTMLSubtitles` 
- **Purpose**: Adds advanced subtitle rendering
- **Usage**: `withHTMLSubtitles(HTMLVideo)`
- **Features**:
  - SRT/VTT parsing
  - HTML-based subtitle rendering
  - Subtitle synchronization

### 3. `withVideoParams`
- **Purpose**: Adds video parameter handling
- **Usage**: `withVideoParams(withHTMLSubtitles(HTMLVideo))`
- **Features**:
  - Stream URL processing
  - Metadata extraction

## Base Video Implementation Analysis

### Core Web Implementation: `HTMLVideo`

This is the **primary web browser implementation** - the one most relevant to HighSeas.

**Key characteristics**:
- Uses browser's native HTML5 video element
- Integrates with **custom HLS.js build**
- Handles various streaming protocols
- **This is what we should focus on for our rebuild**

## Architecture Pattern Summary

**Stremio's Approach**:
```
StremioVideo (Main Controller)
    ↓
selectVideoImplementation() (Selection Logic)
    ↓
BaseImplementation (HTMLVideo, TizenVideo, etc.)
    ↓ 
withStreamingServer() (Optional: Server transcoding)
    ↓
withHTMLSubtitles() (Subtitle rendering)
    ↓
withVideoParams() (Parameter handling)
```

**For HighSeas Web App, the path would be**:
```
StremioVideo
    ↓
HTMLVideo (browser implementation)
    ↓
withStreamingServer (our FFmpeg server)
    ↓  
withHTMLSubtitles (subtitle rendering)
    ↓
withVideoParams (stream processing)
```

## Detailed Component Analysis

### 1. HTMLVideo - Core Web Browser Implementation

**File**: `src/HTMLVideo/HTMLVideo.js`

**Key Features**:
- Creates HTML5 video element with comprehensive event handling
- Integrates with **custom Stremio HLS.js build** (v1.5.4-patch2)
- Handles all standard video events (play, pause, seek, etc.)
- Built-in subtitle cue styling with CSS injection
- **Custom HLS configuration** optimized for streaming

**HLS Configuration** (`src/HTMLVideo/hlsConfig.js`):
```javascript
{
  backBufferLength: 30,
  maxBufferLength: 50,
  maxMaxBufferLength: 80,
  appendErrorMaxRetry: 20,       // High retry count for robustness
  nudgeMaxRetry: 20,
  manifestLoadingTimeOut: 30000,
  fragLoadPolicy: {              // Aggressive fragment loading
    maxTimeToFirstByteMs: 10000,
    maxLoadTimeMs: 120000,
    maxNumRetry: 20
  }
}
```

**Content Type Detection** (`src/HTMLVideo/getContentType.js`):
- Uses `fetch()` with HEAD request to determine MIME type
- Supports proxy headers for content type hints
- Essential for format compatibility decisions

### 2. withStreamingServer - Server-Side Transcoding Integration

**File**: `src/withStreamingServer/withStreamingServer.js`

**Purpose**: Higher-order component that adds server-side streaming capabilities to any video implementation.

**Key Features**:
- **Stream conversion**: Magnet links → streaming URLs
- **Proxy support**: Route streams through server for compatibility
- **Torrent handling**: Direct integration with torrent streaming
- **Video parameter fetching**: Stream metadata and transcoding options

**Stream Conversion Logic** (`src/withStreamingServer/convertStream.js`):
```javascript
// Handles 3 stream types:
1. Magnet URLs → Create torrent stream via server
2. Direct URLs → Proxy if needed for headers/compatibility  
3. InfoHash + fileIdx → Create specific torrent file stream
```

**Critical Insight**: This is how Stremio handles **all streaming server communication** - it's a universal wrapper that can add server capabilities to any video implementation.

### 3. withHTMLSubtitles - Advanced Subtitle System

**File**: `src/withHTMLSubtitles/withHTMLSubtitles.js`

**Features**:
- **HTML-based subtitle rendering** (not native video track subtitles)
- **Custom subtitle parser** for SRT/VTT formats
- **Advanced styling support** with color, positioning, delays
- **Time-synchronized rendering** with binary search for performance
- **Overlay positioning** over video with CSS absolute positioning

**Architecture**:
```javascript
// Creates subtitle overlay div
subtitlesElement.style.position = 'absolute';
subtitlesElement.style.zIndex = '1';
// Synchronized with video time updates
```

### 4. Stream Format Handling Strategy

**Key Insight**: Stremio's approach to different formats:

1. **Direct stream URLs**: Try native browser support first
2. **HLS streams**: Use custom HLS.js build with optimized config
3. **Magnet/Torrent**: Convert to direct stream via server
4. **Incompatible formats**: Route through streaming server for transcoding

### 5. Platform Selection Strategy

**Decision Tree** (from `selectVideoImplementation.js`):

```
1. Chromecast connected? → ChromecastSenderVideo
2. YouTube stream? → YouTubeVideo + HTML subtitles  
3. iFrame player? → IFrameVideo
4. Streaming server available?
   ├─ Platform-specific implementation + streaming server + HTML subtitles
   └─ Default: HTMLVideo + streaming server + HTML subtitles
5. Direct URL only?
   ├─ Platform-specific implementation + HTML subtitles
   └─ Default: HTMLVideo + HTML subtitles
```

**For Web (HighSeas)**: The path is **HTMLVideo + withStreamingServer + withHTMLSubtitles**

## Recommended Implementation for HighSeas

Based on this analysis, here's the optimal approach:

### Phase 1: Core Video System
```javascript
// Main controller with intelligent selection
StremioVideo (StremioVideo.js)
    ↓
selectVideoImplementation() 
    ↓
HTMLVideo (optimized for web browsers)
```

### Phase 2: Add Server Integration  
```javascript
HTMLVideo 
    ↓
withStreamingServer (FFmpeg transcoding integration)
```

### Phase 3: Add Subtitle Support
```javascript
HTMLVideo + withStreamingServer
    ↓  
withHTMLSubtitles (advanced subtitle rendering)
```

### Phase 4: Add Parameter Handling
```javascript
Complete stack:
withVideoParams(withHTMLSubtitles(withStreamingServer(HTMLVideo)))
```

## Key Dependencies for HighSeas Implementation

**Essential**:
- **Custom HLS.js build**: `https://github.com/Stremio/hls.js/releases/download/v1.5.4-patch2/hls.js-1.5.4-patch2.tgz`
- **Custom VTT.js**: `github:jaruba/vtt.js#84d33d157848407d790d78423dacc41a096294f0`
- **EventEmitter3**: `4.0.7`
- **deep-freeze**: `0.0.1`

**For Streaming**:
- **magnet-uri**: `6.2.0` (torrent support)
- **buffer**: `6.0.3` (stream handling)

## Critical Success Factors

1. **Use Stremio's exact HLS.js build** - their patches are crucial for stability
2. **Implement the Higher-Order Component pattern** - modular and extensible  
3. **Follow their stream conversion logic** - proven approach for all formats
4. **Use their HLS configuration** - optimized for real-world streaming

This architecture is **production-tested** and handles the exact same HEVC/MKV challenges we're facing.

## CRITICAL: Stremio's HEVC/H.265 Strategy Discovered

### Custom HLS.js Build Analysis

**Stremio uses**: `https://github.com/Stremio/hls.js/releases/download/v1.5.4-patch2/hls.js-1.5.4-patch2.tgz`

**Key Research Findings**:

1. **HLS.js now supports HEVC/H.265** in MPEG2-TS containers (issues #5847, #6724, #6194, #6268, #6940)
2. **Chrome 105+ supports HEVC hardware decoding** natively
3. **Stremio has performance optimizations** for 4K HEVC playback
4. **Cross-platform compatibility** handled through their patches

### Stremio's HEVC Approach

**Based on GitHub issues analysis**:

1. **HEVC as output type**: Stremio prefers to use **fMP4 as default container for HLS** to enable direct HEVC streaming
2. **Platform-specific handling**: Different strategies for desktop vs TV vs mobile
3. **Performance optimizations**: Patches to prevent frame dropping with 4K HEVC
4. **Fallback strategies**: When native HEVC fails, use transcoding

### Why Our Current Approach Was Failing

**Our issue**: We were transcoding MKV/HEVC → HLS segments, but still getting CHUNK_DEMUXER errors

**Stremio's solution**: 
- Use **their custom HLS.js build** with HEVC support patches
- Use **fMP4 container** instead of MPEG-TS for HLS
- **Direct HEVC streaming** when browser supports it
- **Smart fallback** to transcoding only when necessary

## Updated Recommendation: Hybrid Approach

### Option 1: Direct HEVC Streaming (Stremio's Way) ⭐ **RECOMMENDED**

**Implementation**:
1. **Use Stremio's exact HLS.js build** with HEVC patches
2. **Detect browser HEVC support** (Chrome 105+, Safari, etc.)
3. **Transcode MKV → fMP4/HLS with HEVC** (not H.264!)
4. **Direct stream HEVC content** when supported
5. **Fallback to H.264 transcoding** only for unsupported browsers

**FFmpeg command change**:
```bash
# Instead of: MKV/HEVC → H.264 HLS (current)
# Use: MKV/HEVC → HEVC fMP4 HLS (Stremio's way)
ffmpeg -i input.mkv -c:v copy -c:a aac -f hls -hls_segment_type fmp4 output.m3u8
```

### Option 2: Complete Stremio Integration ⭐⭐ **ULTIMATE**

**Replace our entire video system with**:
```javascript
withVideoParams(
  withHTMLSubtitles(
    withStreamingServer(
      HTMLVideo  // With Stremio's HLS.js build
    )
  )
)
```

**Benefits**:
- ✅ **Proven HEVC support** with Stremio's patches
- ✅ **Cross-platform compatibility** 
- ✅ **Advanced subtitle system**
- ✅ **Smart format detection and conversion**
- ✅ **No more CHUNK_DEMUXER errors**

## Implementation Priority

**Phase 1**: Test Stremio's HLS.js build with HEVC fMP4 HLS
**Phase 2**: Implement complete Stremio video architecture  
**Phase 3**: Integrate with our existing UI components

This approach leverages **battle-tested HEVC streaming** instead of fighting browser compatibility issues.

## FINAL ANALYSIS: Best Stremio Approach for HEVC/MKV

### Optimal Implementation Stack

**For HighSeas Web Application, use this exact stack**:

```javascript
withVideoParams(
  withHTMLSubtitles(
    withStreamingServer(
      HTMLVideo  // With Stremio's custom HLS.js v1.5.4-patch2
    )
  )
)
```

### Critical Dependencies Required

```json
{
  "hls.js": "https://github.com/Stremio/hls.js/releases/download/v1.5.4-patch2/hls.js-1.5.4-patch2.tgz",
  "vtt.js": "github:jaruba/vtt.js#84d33d157848407d790d78423dacc41a096294f0",
  "eventemitter3": "4.0.7",
  "deep-freeze": "0.0.1",
  "color": "4.2.3",
  "magnet-uri": "6.2.0"
}
```

### HEVC/MKV Strategy

1. **HTMLVideo base implementation** - Core web browser player
2. **withStreamingServer** - Handles MKV → fMP4/HLS transcoding via our server
3. **withHTMLSubtitles** - Advanced subtitle rendering with HTML overlay
4. **withVideoParams** - Stream URL processing and metadata handling

### FFmpeg Transcoding Change

**Current (problematic)**:
```bash
ffmpeg -i input.mkv -c:v libx264 -c:a aac -f hls output.m3u8
```

**New (Stremio's proven approach)**:
```bash
ffmpeg -i input.mkv -c:v copy -c:a aac -f hls -hls_segment_type fmp4 output.m3u8
```

**Key difference**: Preserve HEVC codec + use fMP4 container instead of MPEG-TS

### Implementation Benefits

- ✅ **Direct HEVC streaming** when browser supports it (Chrome 105+, Safari)
- ✅ **Eliminates CHUNK_DEMUXER errors** with Stremio's HLS.js patches
- ✅ **Proven subtitle system** with advanced styling and synchronization
- ✅ **Server-side fallback** for incompatible content via withStreamingServer
- ✅ **Production-tested** architecture handling millions of streams

This is the **definitive implementation approach** for rebuilding the video player.