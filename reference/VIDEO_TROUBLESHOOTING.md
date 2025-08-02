# Video Player Troubleshooting Guide

## Common Issues and Solutions

### 1. CHUNK_DEMUXER_ERROR_APPEND_FAILED

**Symptoms**: Video fails to play with error "Parsed buffers not in DTS sequence"
**Cause**: Browser cannot handle the video format or transcoding failed
**Solutions**:

#### For Users:
1. **Try different quality**: Select MP4 format instead of MKV
2. **Different source**: Choose another streaming provider (Torrentio, etc.)
3. **Browser compatibility**: Try Firefox or Safari instead of Chrome

#### For Developers:
1. **Check FFmpeg logs**: Look for transcoding errors in server logs
2. **Verify GPU support**: Ensure VAAPI/AMD GPU drivers are working
3. **Test CPU fallback**: Check if CPU transcoding works when GPU fails

### 2. "Video transcoding failed" Error

**What it means**: The server cannot convert the video format for browser playback
**User Actions**:
- Select a different quality (preferably MP4)
- Try a different episode or source
- Check if the issue persists across multiple titles

**Developer Actions**:
- Check server logs for FFmpeg errors
- Verify FFmpeg installation and GPU drivers
- Test transcoding parameters manually

### 3. Real-Debrid Link Expired

**Symptoms**: Video loads but immediately shows "Stream link expired"
**Solutions**:
- Wait for automatic retry (up to 6 attempts)
- Go back and select the stream again
- Check Real-Debrid account status

## Debugging Steps

### Step 1: Check Browser Console
```
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for errors containing:
   - CHUNK_DEMUXER
   - HLS_ERROR
   - TRANSCODING_FAILED
```

### Step 2: Check Server Logs
```bash
# Docker logs
docker logs highseas-streaming -f

# File logs (if available)
tail -f /DATA/AppData/highseas-streaming/logs/server-*.log
```

### Step 3: Test Stream Manually
```bash
# Test if FFmpeg can transcode the stream
ffmpeg -i "STREAM_URL" -t 10 -f mp4 test_output.mp4
```

### Step 4: Verify Browser Support
Test in different browsers:
- ✅ **Chrome**: Best HLS.js support
- ✅ **Firefox**: Good fallback for compatibility
- ✅ **Safari**: Native HLS support (Mac/iOS)
- ❌ **Edge**: Limited support

## Format Compatibility Matrix

| Format | Container | Chrome | Firefox | Safari | Notes |
|--------|-----------|--------|---------|--------|-------|
| H.264 | MP4 | ✅ | ✅ | ✅ | Best compatibility |
| H.264 | MKV | ⚙️ | ⚙️ | ⚙️ | Needs transcoding |
| HEVC | MP4 | ❌ | ❌ | ⚙️ | Very limited support |
| HEVC | MKV | ❌ | ❌ | ❌ | Requires transcoding |
| AV1 | MP4 | ⚙️ | ⚙️ | ❌ | Emerging support |

**Legend**:
- ✅ Native support
- ⚙️ Transcoding required  
- ❌ Not supported

## FFmpeg Transcoding Parameters

### Current GPU Settings (VAAPI)
```bash
ffmpeg -init_hw_device vaapi=va:/dev/dri/renderD128 \
       -hwaccel vaapi \
       -hwaccel_output_format vaapi \
       -i INPUT_URL \
       -vf scale_vaapi=format=nv12 \
       -vcodec h264_vaapi \
       -acodec aac \
       -avoid_negative_ts make_zero \
       -fflags +genpts+igndts \
       -f mpegts \
       OUTPUT
```

### CPU Fallback Settings
```bash
ffmpeg -i INPUT_URL \
       -vcodec libx264 \
       -acodec aac \
       -preset ultrafast \
       -tune zerolatency \
       -avoid_negative_ts make_zero \
       -fflags +genpts+igndts \
       -f mpegts \
       OUTPUT
```

## Performance Optimization

### Server Requirements
- **CPU**: Multi-core for transcoding (Intel i5+ or AMD Ryzen 5+)
- **GPU**: AMD GPU with VAAPI support (optional but recommended)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: Fast SSD for temporary transcoding files

### Network Requirements
- **Bandwidth**: 25+ Mbps for 4K transcoding
- **Latency**: Low latency to Real-Debrid servers
- **Stability**: Consistent connection for long transcoding sessions

## Advanced Troubleshooting

### Enable Debug Logging
```bash
# Add to environment variables
LOG_LEVEL=debug

# Or modify docker-compose.yml
environment:
  LOG_LEVEL: debug
```

### Manual FFmpeg Testing
```bash
# Test basic transcoding
ffmpeg -i "https://example.com/video.mkv" \
       -t 30 \
       -vcodec libx264 \
       -acodec aac \
       -f mp4 \
       test.mp4

# Test HLS transcoding
ffmpeg -i "https://example.com/video.mkv" \
       -t 30 \
       -vcodec libx264 \
       -acodec aac \
       -f hls \
       -hls_time 10 \
       test.m3u8
```

### Browser Debugging
```javascript
// Check MediaSource support
console.log('MSE Support:', !!window.MediaSource);

// Check codec support
const mse = new MediaSource();
console.log('H.264 Support:', MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E"'));
console.log('HEVC Support:', MediaSource.isTypeSupported('video/mp4; codecs="hev1.1.6.L93.B0"'));
```

## Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `TRANSCODING_FAILED` | FFmpeg transcoding failed | Try different quality/source |
| `HLS_ERROR` | HLS.js playback error | Check network/format compatibility |
| `MEDIA_ERR_DECODE` | Browser decode error | Format not supported natively |
| `MEDIA_ERR_NETWORK` | Network/loading error | Check Real-Debrid link validity |

## Getting Help

### Information to Provide
1. **Browser**: Chrome/Firefox/Safari version
2. **Video format**: MKV/MP4, HEVC/H.264
3. **Error message**: Exact error from console
4. **Server logs**: FFmpeg output and errors
5. **Stream URL**: Anonymized Real-Debrid or source URL

### Support Channels
- GitHub Issues: Technical bugs and feature requests
- Discord/Community: General help and user support
- Documentation: This guide and architecture docs

---

**Last Updated**: 2025-08-02
**Version**: Compatible with HighSeas v1.2.4+