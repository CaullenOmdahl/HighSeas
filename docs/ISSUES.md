# HighSeas Streaming Issues Documentation

This document tracks known issues, their root causes, debugging steps, and resolution status for the HighSeas streaming application.

## Table of Contents
1. [Critical Issues](#critical-issues)
2. [Resolved Issues](#resolved-issues)
3. [Known Limitations](#known-limitations)
4. [Debugging Guide](#debugging-guide)

---

## Critical Issues

### 1. Video Player Redirects on MKV Playback Failure
**Status**: 🔧 **FIXED in v1.1.9**  
**Severity**: Critical  
**Affects**: All MKV file playback through transcoding

#### Problem Description
When users attempt to play MKV files, the video player would:
1. Correctly trigger FFmpeg transcoding (confirmed by server logs)
2. Generate HLS transcoding URLs (`/api/hls/{sessionId}/master.m3u8`)
3. **BUT** the video player would fail to load the transcoded stream
4. Automatically redirect users back to the video info screen after 3 seconds
5. Display unhelpful error messages that didn't indicate transcoding was working

#### Root Cause Analysis
The issue was in the video player error handling chain in `src/routes/StremioPlayer.tsx`:

```typescript
// PROBLEMATIC CODE (lines 113-136)
if (streamUrl?.includes('real-debrid.com') && (error.code === 4 || error.message?.includes('404') || error.message?.includes('Network error'))) {
  // ... error handling logic ...
  setError('🔄 Stream link expired, please go back and select a new stream');
  // Go back to the previous page to select a new stream
  setTimeout(() => {
    window.history.back(); // ❌ This was redirecting ALL errors, including HLS ones
  }, 3000);
}
```

**Technical Details:**
- MKV transcoding WAS working correctly on the backend (FFmpeg with AMD GPU acceleration)
- HLS endpoints were functional and accessible
- The video player was incorrectly treating HLS transcoding errors as Real-Debrid link expiration
- No distinction between Real-Debrid stream failures vs transcoding failures

#### Resolution (v1.1.9)
1. **Enhanced Error Detection**: Added specific detection for HLS transcoding URLs
```typescript
// NEW CODE: Check if this is an HLS transcoding error (don't redirect for these)
if (streamUrl?.includes('/api/hls/')) {
  console.warn('HLS transcoding error detected:', error);
  setError('⚙️ Video transcoding is having issues. This may resolve automatically as the stream processes.');
  setLoading(false);
  return; // ✅ No more auto-redirect for transcoding issues
}
```

2. **Improved Error Logging**: Enhanced video system error reporting
3. **Better UX**: Users now see helpful transcoding messages instead of being redirected

---

## Resolved Issues

### 2. Docker Logging Not Working in CasaOS
**Status**: ✅ **RESOLVED in v1.1.5**  
**Severity**: High  
**Affects**: Debugging and troubleshooting capabilities

#### Problem Description
- Docker containers deployed via CasaOS were not writing application logs to mounted volumes
- `/app/logs` directory was empty despite application running
- Made debugging streaming issues nearly impossible

#### Root Cause
Permission issues with Docker volume mounts in CasaOS environment:
- Container process (user `highseas:nodejs`) couldn't write to host-mounted directory
- Host filesystem permissions didn't match container user

#### Resolution
1. **Docker Entrypoint Script**: Added proper permission handling
2. **Volume Mount Configuration**: Fixed permissions in docker-compose.yml
3. **Automatic Logging**: Implemented server-side console.log redirection

```dockerfile
# Fixed in Dockerfile
RUN mkdir -p /app/logs && chown -R highseas:nodejs /app/logs
```

### 3. MKV Files Not Triggering Transcoding
**Status**: ✅ **RESOLVED in v1.1.6**  
**Severity**: High  
**Affects**: MKV file playback compatibility

#### Problem Description
- MKV files were being served directly to browser instead of being transcoded
- Browser codec detection was incorrectly allowing direct MKV playback
- Users experienced "format not supported" errors

#### Root Cause
Faulty browser codec detection in `src/lib/video/StremioVideoSystem.ts`:
```typescript
// PROBLEMATIC CODE
private shouldTranscode(streamUrl: string | null): boolean {
  // Browser codec detection was unreliable for MKV containers
  const canPlayMkv = this.videoElement?.canPlayType('video/x-matroska');
  return !canPlayMkv; // ❌ This often returned false positives
}
```

#### Resolution
Force transcoding for all MKV files regardless of browser reporting:
```typescript
// FIXED CODE
private shouldTranscode(streamUrl: string | null): boolean {
  if (!streamUrl) return false;
  
  // Always transcode MKV files to ensure compatibility
  if (streamUrl.includes('.mkv')) {
    return true; // ✅ Force transcoding for all MKV files
  }
  
  return false;
}
```

### 4. Content Security Policy Blocking HLS Endpoints
**Status**: ✅ **RESOLVED in v1.1.7-v1.1.8**  
**Severity**: High  
**Affects**: HLS transcoding functionality

#### Problem Description
Browser console showed CSP violations:
```
Refused to load media from 'http://localhost:6969/api/hls/...' because it violates the following Content Security Policy directive: "media-src 'self' *.real-debrid.com https:"
```

#### Root Cause
Restrictive Content Security Policy in `server/index.js`:
```javascript
// PROBLEMATIC CSP
'Content-Security-Policy': 'media-src \'self\' *.real-debrid.com https:;'
// ❌ Didn't include localhost HLS endpoints
```

#### Resolution
Temporarily disabled CSP entirely for this personal use application:
```javascript
// FIXED: Commented out CSP for personal use
// res.setHeader('Content-Security-Policy', ...);
```

### 5. Docker Versioning and Release Issues
**Status**: ✅ **RESOLVED with GitHub Actions**  
**Severity**: Medium  
**Affects**: Deployment and version management

#### Problem Description
- Docker images weren't being versioned properly
- No semantic versioning for releases
- Manual Docker builds were inconsistent

#### Resolution
Implemented proper Git tag-based versioning:
1. **Version Workflow**: `npm version patch/minor/major`
2. **Git Tags**: `git tag v1.x.x` triggers automated Docker builds
3. **Multi-tag Strategy**: Creates `latest`, `v1.1.x`, and `1.1` tags automatically

---

## Known Limitations

### 1. HLS Transcoding Startup Delay
**Status**: 🔍 **MONITORING**  
**Impact**: 3-5 second delay before playback starts

#### Description
FFmpeg transcoding requires initialization time:
- Container analysis: ~1-2 seconds
- First segment generation: ~2-3 seconds
- HLS playlist creation: ~0.5 seconds

#### Mitigation
- Pre-buffering strategies being evaluated
- Consider segment pre-generation for popular content

### 2. Real-Debrid Link Expiration
**Status**: 🔄 **ONGOING**  
**Impact**: Links expire every ~6 hours

#### Description
Real-Debrid generates temporary direct download links that expire periodically.

#### Current Handling
- Automatic link refresh before expiration (5.5 hours)
- Retry logic with exponential backoff
- Fallback to original magnet conversion

### 3. AMD GPU Transcoding Compatibility
**Status**: ⚠️ **ENVIRONMENT DEPENDENT**  
**Impact**: Transcoding performance varies by hardware

#### Description
VAAPI hardware acceleration depends on:
- AMD GPU driver compatibility
- Docker device access (`/dev/dri`)
- Kernel version and permissions

#### Fallback Strategy
Automatic fallback to CPU transcoding if GPU fails.

---

## Debugging Guide

### Video Player Issues

#### 1. Check Browser Console
```javascript
// Look for these error patterns:
// - CSP violations
// - Network errors
// - Video codec errors
// - HLS loading failures
```

#### 2. Server Logs Analysis
```bash
# Check Docker logs
docker logs highseas-streaming --tail 100

# Look for:
# - FFmpeg transcoding starts
# - HLS session creation
# - File access errors
# - GPU acceleration status
```

#### 3. HLS Endpoint Testing
```bash
# Test master playlist
curl -I "http://localhost:6969/api/hls/test123/master.m3u8?mediaURL=https://real-debrid.com/example.mkv"

# Expected: 200 OK with Content-Type: application/vnd.apple.mpegurl
# If 403: Check URL validation in validateMediaURL()
```

### Transcoding Issues

#### 1. FFmpeg Process Monitoring
```bash
# Inside container
ps aux | grep ffmpeg

# Check for:
# - Process running with correct parameters
# - AMD GPU acceleration flags (-vaapi_device /dev/dri/renderD128)
# - HLS output parameters
```

#### 2. GPU Acceleration Verification
```bash
# Check GPU access
ls -la /dev/dri/

# Verify container has access
docker exec highseas-streaming ls -la /dev/dri/
```

### Real-Debrid Integration

#### 1. API Token Validation
```bash
# Test API connectivity
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.real-debrid.com/rest/1.0/user
```

#### 2. Stream URL Analysis
```bash
# Check stream URL accessibility
curl -I "https://download.real-debrid.com/path/to/file.mkv"

# Look for:
# - 200 OK status
# - Content-Length header
# - Accept-Ranges: bytes (for seeking)
```

### Performance Diagnostics

#### 1. Memory Usage Monitoring
```bash
# Container memory usage
docker stats highseas-streaming

# Critical thresholds:
# - Memory usage > 80% of limit
# - CPU usage consistently > 90%
```

#### 2. Network Performance
```bash
# Test Real-Debrid connection speed
curl -w "@curl-format.txt" -o /dev/null -s "https://download.real-debrid.com/test"

# Where curl-format.txt contains:
#     time_namelookup:  %{time_namelookup}s
#     time_connect:     %{time_connect}s
#     time_starttransfer: %{time_starttransfer}s
#     time_total:       %{time_total}s
#     speed_download:   %{speed_download} bytes/sec
```

---

## Issue Reporting Template

When reporting new issues, please include:

### Environment Information
- HighSeas version: `docker image inspect highseas-streaming | grep version`
- Container platform: (Docker, CasaOS, etc.)
- Host OS: (Ubuntu, Debian, etc.)
- Browser: (Chrome, Firefox, Safari + version)

### Reproduction Steps
1. Specific content being played
2. User actions taken
3. Expected vs actual behavior

### Log Information
```bash
# Server logs (last 50 lines)
docker logs highseas-streaming --tail 50

# Browser console errors (F12 > Console)
# Copy any red error messages

# Network tab (F12 > Network)
# Check for failed requests to /api/ endpoints
```

### Additional Context
- Real-Debrid account status
- Network connectivity (speed, VPN, etc.)
- Hardware specifications (for transcoding issues)

---

## Maintenance Checklist

### Weekly
- [ ] Review application logs for errors
- [ ] Check Real-Debrid API quota usage
- [ ] Monitor Docker container resource usage

### Monthly  
- [ ] Update dependencies if security patches available
- [ ] Review and cleanup old Docker images
- [ ] Test transcoding with various file formats

### Version Updates
- [ ] Test transcoding functionality
- [ ] Verify Real-Debrid integration
- [ ] Check mobile/TV compatibility
- [ ] Update documentation

---

*Last Updated: 2025-08-02*  
*Document Version: 1.0*  
*Application Version: 1.1.9*