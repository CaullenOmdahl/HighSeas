# Video.js MKV/HEVC/H.265 Plugin Research

## Summary

**Current Status**: Video.js does not have native HEVC/H.265 support, but several WebAssembly-based solutions exist that could be integrated as custom Tech plugins.

## Key Findings

### 1. **Native Browser Support is Limited**
- HEVC/H.265 support varies significantly across browsers
- Chrome 105+ has some HEVC support, but it's inconsistent
- Most browsers only support H.264 MP4 natively
- MKV container support is virtually non-existent in browsers

### 2. **Video.js Official Plugin Ecosystem** ❌ **NO HEVC SUPPORT**

**Official Plugin Search Results** (from [videojs.com/plugins](https://videojs.com/plugins/)):
- **VERIFIED: Zero HEVC/H.265 plugins** in all 582 official plugins
- **VERIFIED: Zero MKV container plugins** available
- **VERIFIED: Zero WebAssembly codec plugins** listed  
- **VERIFIED: Zero transcoding plugins** in official directory
- **Direct search confirmed**: No mentions of "h265", "h.265", "hevc", "codec", "transcode", "wasm", or "webassembly"

**Available streaming plugins**:
- `@videojs/http-streaming`: HLS and DASH playback
- `videojs-contrib-dash`: MPEG-DASH support  
- `videojs-contrib-hls`: HLS playback (H.264 only)

**Conclusion**: Video.js ecosystem focuses on streaming protocols, not codec transformation

### 3. **Actual Working H.265 Plugins Found** 🎉 **BREAKTHROUGH**

#### **Option A: videojs-flvh265** ⭐ **MOST PROMISING**
- **Repository**: [videojs-flvh265](https://www.npmjs.com/package/videojs-flvh265)
- **Features**:
  - ✅ **Direct Video.js H.265 support** 
  - ✅ **FLV container with H.264/H.265 codecs**
  - ✅ **Live streaming support**
  - ✅ **Local file playback**
  - ✅ **Based on proven WXInlinePlayer decoder**

**Compatibility Matrix**:
| Format | H.264 | H.265 | Live | Local | Seek |
|--------|-------|-------|------|-------|------|
| FLV    | ✅    | ✅    | ✅   | ✅    | ❌   |
| MP4    | ❌    | ❌    | ❌   | ❌    | ❌   |

**Implementation**:
```html
<video id="player" class="video-js" controls ish265 islive>
  <source src="example.flv" type='video/x-flv'/>
</video>
```

**Pros**:
- ✅ Active Video.js plugin (GPL v2 license)
- ✅ Specifically designed for H.265/HEVC
- ✅ Supports live streaming use case
- ✅ Lightweight compared to full WASM solutions

**Cons**:
- ❌ **FLV container only** (not MKV)
- ❌ **No seeking support**
- ❌ Limited to FLV format
- ❌ Would require transcoding MKV → FLV

#### **Option B: react-video-h265**
- **Repository**: [react-video-h265](https://www.npmjs.com/package/react-video-h265)
- **Features**:
  - React wrapper for Video.js H.265 playback
  - 4.81MB package size
  - Depends on video.js ^7 and wx-inline-player-new

**Pros**:
- ✅ React-compatible
- ✅ Specialized for H.265

**Cons**:
- ❌ **No documentation available**
- ❌ **Very low usage** (near-zero downloads)
- ❌ **Published 2 years ago** (potentially outdated)
- ❌ **Single maintainer**
- ❌ Unknown format support

### 4. **WebAssembly-Based Solutions** ✅ **VIABLE OPTIONS**

#### **Option A: h265web.js-wasm-decoder** ⭐ **RECOMMENDED**
- **Repository**: [numberwolf/h265web.js-wasm-decoder](https://github.com/numberwolf/h265web.js-wasm-decoder)
- **Features**:
  - Pure WebAssembly H.265/HEVC decoder
  - Returns YUV420P frame data
  - Supports NALU parsing and frame extraction
  - Multi-window playback support
  - Video-on-demand streaming

**Pros**:
- ✅ Specifically designed for H.265/HEVC
- ✅ Active development and maintenance
- ✅ Performance-optimized WebAssembly
- ✅ Could integrate with Video.js as custom Tech

**Cons**:
- ❌ Requires custom Video.js Tech implementation
- ❌ Additional complexity and bundle size
- ❌ Canvas-based rendering (not native video element)

#### **Option B: FFmpeg.wasm** 
- **Repository**: [ffmpegwasm/ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)
- **Features**:
  - Full FFmpeg in WebAssembly
  - Supports all FFmpeg codecs including HEVC
  - Browser-based transcoding capabilities

**Pros**:
- ✅ Comprehensive codec support
- ✅ Could transcode HEVC to H.264 client-side
- ✅ Mature and well-maintained

**Cons**:
- ❌ Large bundle size (~25MB+)
- ❌ 2GB file size limit
- ❌ CPU-intensive client-side processing
- ❌ Real-time playback challenges

#### **Option C: MainConcept WebASM HEVC Decoder** 💰 **COMMERCIAL**
- **Provider**: MainConcept
- **Features**:
  - Professional-grade HEVC decoder
  - Optimized for web browsers
  - Mission-critical reliability

**Pros**:
- ✅ Professional support and optimization
- ✅ Proven performance in production
- ✅ Browser-specific optimizations

**Cons**:
- ❌ Commercial license required
- ❌ Cost implications
- ❌ Still requires custom Tech implementation

## Implementation Approaches

### **Approach 1: Video.js Custom Tech with WASM Decoder**

**Steps**:
1. Create custom Tech plugin following [Video.js Tech Guide](https://videojs.com/guides/tech/)
2. Integrate h265web.js-wasm-decoder for HEVC decoding
3. Implement canvas-based rendering for decoded YUV frames
4. Handle video controls and synchronization

**Required Video.js Tech Methods**:
```javascript
// Essential methods for custom Tech
canPlayType(type)     // Check HEVC/MKV support
play()               // Start playback
pause()              // Pause playback  
currentTime()        // Get/set playback position
volume()             // Audio control
duration()           // Video length
buffered()           // Buffer status
supportsFullScreen() // Fullscreen capability
```

**Integration Code Example**:
```javascript
// Custom HEVC Tech for Video.js
class HEVCTech extends videojs.getComponent('Tech') {
  constructor(options, ready) {
    super(options, ready);
    this.decoder = new H265Decoder();
    this.canvas = document.createElement('canvas');
    this.setupDecoder();
  }

  canPlayType(type) {
    // Check for HEVC/H.265 content
    return type.includes('hevc') || type.includes('h265') ? 'probably' : '';
  }

  // Implement other required methods...
}

// Register the tech
videojs.registerTech('HEVC', HEVCTech);
```

### **Approach 2: Client-Side Transcoding with FFmpeg.wasm**

**Concept**: Use FFmpeg.wasm to transcode HEVC to H.264 in the browser

**Pros**:
- ✅ Works with existing Video.js setup
- ✅ No custom Tech required
- ✅ Native video element playback

**Cons**:
- ❌ Significant processing delay
- ❌ Large memory/CPU usage
- ❌ Battery drain on mobile devices

### **Approach 3: Hybrid Server-Client Solution**

**Current HighSeas Implementation**: Server-side FFmpeg transcoding
**Enhancement**: Add client-side WASM decoder as fallback

**Benefits**:
- ✅ Server transcoding for performance
- ✅ Client fallback for compatibility
- ✅ Progressive enhancement approach

## Updated Recommendation for HighSeas

### **New Option: videojs-flvh265 Plugin** 🎯 **WORTH TESTING**

**For evaluation**: The `videojs-flvh265` plugin could provide **immediate H.265 support** if you modify your transcoding:

**Current**: MKV/HEVC → HLS segments  
**New**: MKV/HEVC → FLV/H.265 (direct playback)

**Implementation Plan**:
1. **Modify FFmpeg transcoding** to output FLV container with H.265:
```bash
ffmpeg -i input.mkv -c:v libx265 -c:a aac -f flv output.flv
```
2. **Add videojs-flvh265 plugin** to your Video.js setup
3. **Test direct H.265 FLV playback** (no HLS segmentation needed)

**Pros**:
- ✅ **No client-side WebAssembly overhead**
- ✅ **Direct H.265 support in browsers**
- ✅ **Simpler than HLS transcoding**
- ✅ **Proven technology** (based on WXInlinePlayer)

**Cons**:
- ❌ **No seeking support** (major limitation)
- ❌ **FLV format only** (container change required)
- ❌ **GPL v2 license** (compatibility check needed)

### **Primary Recommendation**: Stick with Server-Side Transcoding ⭐

**Reasoning**:
1. **Seeking functionality**: Critical for user experience
2. **HLS format**: Industry standard for streaming
3. **Proven solution**: Your current approach is battle-tested
4. **Container compatibility**: Works with all input formats

### **Secondary Option**: Test videojs-flvh265 for Specific Cases

**If server transcoding fails**, implement h265web.js-wasm-decoder as emergency fallback:

**Implementation Plan**:
1. **Detect transcoding failure** (current: shows error message)
2. **Offer client-side decoding option** (user choice due to performance impact)
3. **Implement WASM decoder** only when user explicitly chooses it
4. **Provide performance warnings** about battery usage

**Code Structure**:
```javascript
// Enhanced error handling with WASM fallback option
if (error.code === 'TRANSCODING_FAILED') {
  setError(`
    🚫 Server transcoding failed. 
    
    Options:
    1. Try different quality (MP4 format) - RECOMMENDED
    2. Use experimental browser decoder (slower, uses more battery)
  `);
  
  setShowWasmFallbackOption(true);
}
```

## Conclusion

**For HighSeas**: The current server-side FFmpeg transcoding approach is the optimal solution. Adding Video.js WASM-based HEVC plugins would:

- ❌ **Increase complexity** significantly
- ❌ **Worsen performance** for most users  
- ❌ **Add bundle size** and battery drain
- ✅ **Provide fallback** for edge cases

**Better approach**: Fix the existing FFmpeg transcoding issues rather than moving to client-side decoding.

**If transcoding must be replaced**: Consider dedicated HEVC-capable players like VLC.js or custom solutions rather than Video.js plugins.

---

**Research Date**: 2025-08-02  
**Status**: Complete - Server-side transcoding recommended over client-side WASM plugins