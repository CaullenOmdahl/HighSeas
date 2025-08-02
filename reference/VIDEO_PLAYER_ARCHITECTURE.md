# Video Player Architecture Documentation

## Current Problem

**CRITICAL ISSUE**: CHUNK_DEMUXER_ERROR_APPEND_FAILED errors are occurring even with FFmpeg transcoding, indicating the transcoding is not working correctly or the fallback strategy is flawed.

### Error Flow Analysis

1. **Initial Request**: MKV/HEVC content detected → triggers FFmpeg transcoding
2. **Transcoding URL**: `http://localhost:6969/api/hls/{sessionId}/master.m3u8`
3. **HLS.js Failure**: Still getting `CHUNK_DEMUXER_ERROR_APPEND_FAILED: Parsed buffers not in DTS sequence`
4. **Fallback**: Falls back to direct playback of **original untranscoded stream**
5. **Result**: Same compatibility issues that transcoding was meant to solve

## Architecture Overview

### Components

#### 1. StremioVideoSystem.ts (Core Engine)
**Purpose**: Main video player with HLS support and transcoding logic
**Key Features**:
- HLS.js integration for adaptive streaming
- FFmpeg transcoding detection and routing
- Subtitle system with SRT parsing
- Audio track management
- Error handling and fallback strategies

**Critical Methods**:
```typescript
// Stream loading logic
async load(streamUrl: string): Promise<void>

// Transcoding detection  
private needsTranscoding(streamUrl: string, contentType?: string): boolean

// HLS error handling
private handleHLSError(event: string, data: any): void

// Fallback strategy (PROBLEMATIC)
private fallbackToDirectPlayback(streamUrl: string | null): void
```

#### 2. StremioVideoPlayer.tsx (React Wrapper)
**Purpose**: React component wrapper for the video system
**Features**:
- Props-based configuration
- Event forwarding to parent components
- React lifecycle management

#### 3. StremioPlayer.tsx (Full Player UI)
**Purpose**: Complete player interface with controls
**Features**:
- Video controls (play/pause, seek, volume)
- Subtitle management and styling
- Real-Debrid integration
- Error display and user feedback

### Current Transcoding Flow

```
1. MKV/HEVC Stream URL
   ↓ (detected by needsTranscoding())
2. Generate Transcoding URL: /api/hls/{sessionId}/master.m3u8
   ↓ (passed to HLS.js)
3. FFmpeg Server (server/index.js):
   - Receives HLS requests
   - Spawns FFmpeg process with GPU/CPU encoding
   - Streams transcoded segments
   ↓ (if successful)
4. HLS.js plays transcoded segments
   ↓ (if CHUNK_DEMUXER error occurs)
5. FALLBACK: Direct playback of ORIGINAL stream (broken!)
```

## Root Cause Analysis

### Problem 1: Faulty Fallback Strategy
**Current**: When HLS transcoding fails → fallback to original untranscoded stream
**Issue**: Original stream has same compatibility problems that required transcoding

**File**: `StremioVideoSystem.ts:596`
```typescript
// PROBLEMATIC: Falls back to original problematic stream
this.videoElement!.src = streamUrl; // streamUrl is original MKV/HEVC
```

### Problem 2: FFmpeg Transcoding Issues
**Evidence**: Logs show transcoding URL generation but still get DTS sequence errors
**Possible Causes**:
1. FFmpeg parameters not generating browser-compatible segments
2. Timing/synchronization issues in transcoded output
3. GPU transcoding (VAAPI) compatibility problems
4. HLS.js buffer management issues

### Problem 3: No Progressive Enhancement
**Issue**: All-or-nothing approach - either HLS works perfectly or complete failure
**Missing**: Progressive fallback strategies

## Immediate Action Plan

### Phase 1: Fix Fallback Strategy ✅ HIGH PRIORITY
Current fallback is fundamentally broken. Options:

**Option A**: Retry transcoding with different parameters
```typescript
private fallbackToDirectPlayback(streamUrl: string | null) {
  // Instead of direct playback, try CPU transcoding if GPU failed
  // Or try different FFmpeg parameters
}
```

**Option B**: User-facing error with actionable options
```typescript
private handleTranscodingFailure() {
  // Show user options:
  // 1. Try different quality/source
  // 2. Download locally (if applicable)
  // 3. Technical details for debugging
}
```

### Phase 2: Debug FFmpeg Transcoding ✅ HIGH PRIORITY
Investigate why transcoding still produces DTS errors:

1. **Check FFmpeg output**: Examine actual generated HLS segments
2. **Test parameters**: Validate FFmpeg flags are working correctly  
3. **Buffer analysis**: Check HLS.js buffer configuration
4. **Alternative approaches**: Consider different transcoding strategies

### Phase 3: Enhance Error Handling ✅ MEDIUM PRIORITY
- Detailed error messages for users
- Retry mechanisms with different parameters
- Fallback quality selection
- Technical troubleshooting information

## Testing Strategy

### Critical Test Cases
1. **HEVC/MKV Content**: How.to.Train.Your.Dragon.2025.2160p.HDR10
2. **Different Browsers**: Chrome, Firefox, Safari transcoding behavior
3. **GPU vs CPU**: VAAPI vs libx264 transcoding results
4. **HLS.js Versions**: Test with different HLS.js versions

### Debug Logging
Current logging categories:
- `STREAM`: Stream loading and transcoding decisions
- `PLAYER`: Playback events and errors  
- `SYSTEM`: Technical system information

**Add**: FFmpeg output logging and HLS segment analysis

## Files Requiring Immediate Attention

1. **StremioVideoSystem.ts:566** - Fix fallback strategy
2. **server/index.js:1348+** - Debug FFmpeg parameters
3. **StremioPlayer.tsx:109** - Enhance error handling for users
4. **HLS.js configuration** - Buffer settings and error recovery

## Success Metrics

✅ **Primary**: HEVC/MKV content plays without CHUNK_DEMUXER errors
✅ **Secondary**: Graceful fallback when transcoding unavailable
✅ **Tertiary**: Clear user feedback for unsupported content

---

**Status**: CRITICAL - Video player fundamentally broken for MKV/HEVC content
**Priority**: Highest - Core functionality of streaming application
**Owner**: Development team
**Last Updated**: 2025-08-02