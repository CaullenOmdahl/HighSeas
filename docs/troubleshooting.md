# Troubleshooting Guide

This comprehensive guide covers common issues, debugging techniques, and solutions for HighSeas streaming application.

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Common Issues](#common-issues)
3. [Video Player Issues](#video-player-issues)
4. [Real-Debrid Issues](#real-debrid-issues)
5. [HLS Transcoding Issues](#hls-transcoding-issues)
6. [Docker & Container Issues](#docker--container-issues)
7. [Network & Connectivity Issues](#network--connectivity-issues)
8. [Performance Issues](#performance-issues)
9. [Development Issues](#development-issues)
10. [Debugging Tools](#debugging-tools)

## Quick Diagnostics

### Health Check Commands

```bash
# Check application health
curl http://localhost:6969/api/health

# Check container status
docker ps --filter name=highseas

# View recent logs
docker logs highseas-streaming --tail 50

# Check Real-Debrid integration
curl http://localhost:6969/api/realdebrid
```

### System Requirements Verification

```bash
# Check Docker version
docker --version

# Check available memory
free -h

# Check GPU devices (for transcoding)
ls -la /dev/dri/

# Check network connectivity
curl -I https://api.real-debrid.com/rest/1.0/user
```

## Common Issues

### 1. Application Won't Start

**Symptoms:**
- Container exits immediately
- "Cannot start service" error
- Port binding errors

**Diagnosis:**
```bash
# Check if port is already in use
sudo lsof -i :6969

# Check Docker logs for specific error
docker logs highseas-streaming

# Verify container exists
docker ps -a | grep highseas
```

**Solutions:**

**Port Already in Use:**
```bash
# Option 1: Use different port
docker run -p 7070:6969 caullen/highseas-streaming:latest

# Option 2: Stop conflicting service
sudo kill $(sudo lsof -t -i:6969)

# Option 3: Identify and manage conflicting service
sudo systemctl stop service-using-port-6969
```

**Permission Issues:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Fix file permissions
sudo chown -R $USER:$USER /opt/highseas/
```

**Missing Environment Variables:**
```bash
# Create environment file
cat > .env << EOF
REAL_DEBRID_TOKEN=your_token_here
NODE_ENV=production
EOF

# Run with environment file
docker run --env-file .env caullen/highseas-streaming:latest
```

### 2. "Stream Expired" Error

**Symptoms:**
- "🔄 Stream link expired" message
- Video stops playing after some time
- Multiple retry attempts fail

**Diagnosis:**
```bash
# Check Real-Debrid token validity
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.real-debrid.com/rest/1.0/user

# Monitor application logs during streaming
docker logs -f highseas-streaming | grep -E "(STREAM|ERROR|Real-Debrid)"
```

**Solutions:**

**Real-Debrid Link Expiration (Normal):**
The enhanced retry system should handle this automatically with 6 attempts. If it fails:

```javascript
// Manual retry in browser console
window.location.reload(); // Reload player

// Or go back and select different quality
window.history.back();
```

**Token Issues:**
```bash
# Verify token in environment
docker exec highseas-streaming env | grep REAL_DEBRID_TOKEN

# Update token
docker stop highseas-streaming
docker rm highseas-streaming
docker run -d -e REAL_DEBRID_TOKEN=new_token_here caullen/highseas-streaming:latest
```

### 3. No Video Streams Found

**Symptoms:**
- "No streams available" message
- Empty stream list
- Loading indefinitely

**Diagnosis:**
```bash
# Test Torrentio addon directly
curl "https://torrentio.strem.fun/stream/movie/tt0111161.json"

# Check local addon proxy
curl "http://localhost:6969/api/addon/stream/movie/tt0111161.json"

# Monitor network requests in browser developer tools
```

**Solutions:**

**Addon Connectivity Issues:**
```bash
# Check internet connectivity
ping google.com

# Test DNS resolution
nslookup torrentio.strem.fun

# Check proxy endpoint
curl -I http://localhost:6969/api/addon/manifest.json
```

**Rate Limiting:**
```bash
# Check rate limit headers
curl -I http://localhost:6969/api/addon/stream/movie/tt0111161.json

# Wait and retry if rate limited
sleep 60 && curl http://localhost:6969/api/addon/stream/movie/tt0111161.json
```

### 4. Interface Loading Issues

**Symptoms:**
- Blank page
- JavaScript errors in console
- Infinite loading spinner

**Diagnosis:**
```bash
# Check if frontend is served correctly
curl -I http://localhost:6969/

# Check browser console for JavaScript errors
# Open Developer Tools > Console

# Verify build files exist
docker exec highseas-streaming ls -la /app/dist/
```

**Solutions:**

**Missing Build Files:**
```bash
# Rebuild container
docker build -t highseas-streaming:latest .
docker run -d --name highseas-streaming -p 6969:6969 highseas-streaming:latest
```

**Browser Cache Issues:**
```bash
# Clear browser cache
# Chrome: Ctrl+Shift+R (hard refresh)
# Firefox: Ctrl+F5

# Or open in incognito/private mode
```

**CORS Issues:**
```bash
# Check CORS headers
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -I http://localhost:6969/api/health
```

## Video Player Issues

### 1. Video Won't Play

**Symptoms:**
- Video player shows error
- Controls are unresponsive
- Black screen

**Diagnosis:**
```bash
# Check browser console for player errors
# Look for HLS.js errors or network failures

# Test video URL directly
curl -I "DIRECT_VIDEO_URL"

# Check if transcoding is being attempted
docker logs highseas-streaming | grep HLS
```

**Solutions:**

**Codec/Format Issues:**
- MKV files should automatically trigger HLS transcoding
- Check if FFmpeg is working:

```bash
# Test FFmpeg in container
docker exec highseas-streaming ffmpeg -version

# Check GPU access for transcoding
docker exec highseas-streaming ls -la /dev/dri/
```

**HLS.js Issues:**
```javascript
// Browser console debugging
if (window.Hls) {
  console.log('HLS.js version:', Hls.version);
  console.log('HLS supported:', Hls.isSupported());
} else {
  console.log('HLS.js not loaded');
}
```

**Network Issues:**
```bash
# Test direct video access
curl -r 0-1023 "VIDEO_URL" -o test_chunk.bin

# Check if range requests work
curl -H "Range: bytes=0-1023" "VIDEO_URL"
```

### 2. Subtitles Not Working

**Symptoms:**
- Subtitle tracks not showing
- Subtitles not displaying
- Encoding issues

**Diagnosis:**
```bash
# Test subtitle proxy endpoint
curl "http://localhost:6969/api/subtitles?url=SUBTITLE_URL"

# Check subtitle file format
curl "SUBTITLE_URL" | head -20
```

**Solutions:**

**CORS Issues:**
```bash
# Subtitle proxy should handle CORS
# Check if proxy is working:
curl -H "Origin: http://localhost:6969" \
     "http://localhost:6969/api/subtitles?url=SUBTITLE_URL"
```

**Encoding Issues:**
```javascript
// Browser console - check subtitle content
fetch('/api/subtitles?url=SUBTITLE_URL')
  .then(r => r.text())
  .then(text => console.log(text.substring(0, 500)));
```

**Format Issues:**
- Ensure subtitles are in SRT or WebVTT format
- Check file encoding (should be UTF-8)

### 3. Audio/Video Sync Issues

**Symptoms:**
- Audio and video out of sync
- Stuttering playback
- Buffer underruns

**Solutions:**

**Buffer Optimization:**
```javascript
// Browser console - adjust HLS buffer settings
if (player.hls) {
  player.hls.config.maxBufferLength = 60;
  player.hls.config.maxMaxBufferLength = 120;
}
```

**GPU Transcoding:**
```bash
# Enable GPU acceleration
docker run -e ENABLE_AMD_GPU=true --device /dev/dri:/dev/dri \
           caullen/highseas-streaming:latest
```

## Real-Debrid Issues

### 1. Authentication Failures

**Symptoms:**
- "REAL_DEBRID_TOKEN not set" error
- "Invalid token" messages
- 401 Unauthorized responses

**Diagnosis:**
```bash
# Test token directly
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.real-debrid.com/rest/1.0/user

# Check token in container
docker exec highseas-streaming env | grep REAL_DEBRID_TOKEN
```

**Solutions:**

**Token Missing or Invalid:**
```bash
# Get new token from https://real-debrid.com/apitoken
# Update environment
docker stop highseas-streaming
docker run -d -e REAL_DEBRID_TOKEN=new_token caullen/highseas-streaming:latest
```

**Token Expired:**
```bash
# Real-Debrid tokens don't expire, but check account status
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.real-debrid.com/rest/1.0/user | jq .
```

### 2. Magnet Conversion Failures

**Symptoms:**
- "Failed to add magnet" errors
- Conversion stuck in processing
- No download links generated

**Diagnosis:**
```bash
# Monitor Real-Debrid API calls
docker logs -f highseas-streaming | grep "Real-Debrid"

# Test magnet directly with Real-Debrid API
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
     -d "magnet=MAGNET_LINK" \
     https://api.real-debrid.com/rest/1.0/torrents/addMagnet
```

**Solutions:**

**Invalid Magnet Links:**
- Ensure magnet link is properly formatted
- Check if torrent has seeders
- Try different quality/source

**Real-Debrid Service Issues:**
```bash
# Check Real-Debrid status
curl https://api.real-debrid.com/rest/1.0/

# Check torrent status if added
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.real-debrid.com/rest/1.0/torrents
```

### 3. Download Limits Exceeded

**Symptoms:**
- "Download limit exceeded" messages
- 429 Too Many Requests
- Service temporarily unavailable

**Solutions:**
- Wait for limit reset (usually 24 hours)
- Upgrade Real-Debrid account
- Use different quality streams

## HLS Transcoding Issues

### 1. FFmpeg Not Found

**Symptoms:**
- "FFmpeg command failed" errors
- Transcoding not starting
- MKV files fail to play

**Diagnosis:**
```bash
# Check if FFmpeg is installed
docker exec highseas-streaming which ffmpeg

# Test FFmpeg functionality
docker exec highseas-streaming ffmpeg -version
```

**Solutions:**

**Missing FFmpeg:**
```bash
# Rebuild container (should include FFmpeg)
docker build -t highseas-streaming:latest .

# Or install manually (not recommended)
docker exec -u root highseas-streaming apk add ffmpeg
```

### 2. GPU Acceleration Issues

**Symptoms:**
- Slow transcoding performance
- High CPU usage
- "VAAPI not available" warnings

**Diagnosis:**
```bash
# Check GPU devices
ls -la /dev/dri/

# Verify container has GPU access
docker exec highseas-streaming ls -la /dev/dri/

# Test VAAPI
docker exec highseas-streaming vainfo
```

**Solutions:**

**Missing GPU Devices:**
```bash
# Run with GPU access
docker run --device /dev/dri:/dev/dri caullen/highseas-streaming:latest

# Add user to video group on host
sudo usermod -aG video $USER
```

**Driver Issues:**
```bash
# Install Mesa drivers on host
sudo apt install mesa-va-drivers

# For AMD GPUs
sudo apt install mesa-va-drivers-all
```

### 3. Transcoding Performance Issues

**Symptoms:**
- Slow transcoding startup
- Buffering during playback
- High memory usage

**Solutions:**

**Optimize FFmpeg Settings:**
```javascript
// Adjust transcoding parameters
const ffmpegArgs = [
  '-preset', 'ultrafast',
  '-crf', '28',  // Lower quality for speed
  '-maxrate', '1500k',
  '-hls_time', '6',  // Shorter segments
  '-hls_list_size', '4'
];
```

**Resource Allocation:**
```yaml
# docker-compose.yml
services:
  highseas:
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
```

## Docker & Container Issues

### 1. Container Build Failures

**Symptoms:**
- Docker build errors
- Missing dependencies
- Build context too large

**Solutions:**

**Build Context Issues:**
```bash
# Use .dockerignore to exclude large files
echo "node_modules
logs/
*.log
.git" > .dockerignore

# Build with limited context
docker build --no-cache -t highseas-streaming:latest .
```

**Dependency Issues:**
```bash
# Clear npm cache
docker build --build-arg NPM_CONFIG_CACHE=/tmp/.npm \
             -t highseas-streaming:latest .

# Use specific Node.js version
docker build --build-arg NODE_VERSION=20 \
             -t highseas-streaming:latest .
```

### 2. Container Startup Issues

**Symptoms:**
- Container exits immediately
- Health check failures
- Restart loops

**Diagnosis:**
```bash
# Check container exit code
docker ps -a | grep highseas

# View detailed logs
docker logs --details highseas-streaming

# Check resource usage
docker stats highseas-streaming
```

**Solutions:**

**Memory Issues:**
```bash
# Increase memory limit
docker run --memory=4g caullen/highseas-streaming:latest

# Check host memory
free -h
```

**Permission Issues:**
```bash
# Run with correct user
docker run --user 1001:1001 caullen/highseas-streaming:latest

# Fix volume permissions
sudo chown -R 1001:1001 /opt/highseas/logs
```

### 3. Volume Mount Issues

**Symptoms:**
- Files not persisting
- Permission denied errors
- Volume not accessible

**Solutions:**

**Permission Fixes:**
```bash
# Create directories with correct ownership
sudo mkdir -p /opt/highseas/{logs,data}
sudo chown -R 1001:1001 /opt/highseas/

# Use bind mounts with proper permissions
docker run -v /opt/highseas/logs:/app/logs:Z \
           caullen/highseas-streaming:latest
```

**SELinux Issues (CentOS/RHEL):**
```bash
# Set SELinux context
sudo setsebool -P container_manage_cgroup true
sudo semanage fcontext -a -t container_file_t "/opt/highseas(/.*)?"
sudo restorecon -R /opt/highseas
```

## Network & Connectivity Issues

### 1. DNS Resolution Issues

**Symptoms:**
- "Cannot resolve hostname" errors
- External API calls failing
- Addon connectivity issues

**Diagnosis:**
```bash
# Test DNS from container
docker exec highseas-streaming nslookup api.real-debrid.com

# Check container network
docker network ls
docker network inspect bridge
```

**Solutions:**

**DNS Configuration:**
```bash
# Use custom DNS
docker run --dns=8.8.8.8 --dns=1.1.1.1 \
           caullen/highseas-streaming:latest

# Or in docker-compose.yml
services:
  highseas:
    dns:
      - 8.8.8.8
      - 1.1.1.1
```

### 2. Firewall/Proxy Issues

**Symptoms:**
- External requests blocked
- Timeout errors
- Proxy authentication failures

**Solutions:**

**Corporate Proxy:**
```bash
# Set proxy environment variables
docker run -e HTTP_PROXY=http://proxy:8080 \
           -e HTTPS_PROXY=http://proxy:8080 \
           -e NO_PROXY=localhost,127.0.0.1 \
           caullen/highseas-streaming:latest
```

**Firewall Rules:**
```bash
# Allow outbound HTTPS
sudo ufw allow out 443/tcp

# Allow specific domains
sudo ufw allow out to api.real-debrid.com port 443
```

### 3. SSL/TLS Issues

**Symptoms:**
- Certificate verification failures
- "SSL handshake failed" errors
- HTTPS requests failing

**Solutions:**

**Certificate Issues:**
```bash
# Update certificates in container
docker exec -u root highseas-streaming apk update
docker exec -u root highseas-streaming apk add ca-certificates

# Skip SSL verification (not recommended for production)
docker run -e NODE_TLS_REJECT_UNAUTHORIZED=0 \
           caullen/highseas-streaming:latest
```

## Performance Issues

### 1. Slow Loading Times

**Symptoms:**
- Interface takes long to load
- Slow API responses
- Browser becomes unresponsive

**Diagnosis:**
```bash
# Monitor response times
curl -w "@curl-format.txt" http://localhost:6969/api/health

# Check browser network tab for slow requests
# Monitor container resource usage
docker stats highseas-streaming
```

**Solutions:**

**Resource Optimization:**
```yaml
# docker-compose.yml
services:
  highseas:
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
        reservations:
          cpus: '2.0'
          memory: 4G
```

**Caching:**
```bash
# Enable browser caching
# Check cache headers in network tab

# Clear application cache
docker exec highseas-streaming rm -rf /tmp/cache/*
```

### 2. High Memory Usage

**Symptoms:**
- Container using excessive memory
- System becomes slow
- Out of memory errors

**Diagnosis:**
```bash
# Check memory usage
docker stats --no-stream highseas-streaming

# Monitor memory over time
docker stats highseas-streaming

# Check for memory leaks
docker exec highseas-streaming cat /proc/meminfo
```

**Solutions:**

**Memory Limits:**
```bash
# Set memory limit
docker run --memory=4g --memory-swap=4g \
           caullen/highseas-streaming:latest
```

**Memory Optimization:**
```javascript
// Browser console - check for memory leaks
window.performance.memory && console.log(window.performance.memory);
```

### 3. CPU Usage Issues

**Symptoms:**
- High CPU usage
- System becomes unresponsive
- Slow transcoding

**Solutions:**

**CPU Limits:**
```bash
# Limit CPU usage
docker run --cpus="2.0" caullen/highseas-streaming:latest

# Use nice priority
docker run --cap-add SYS_NICE \
           caullen/highseas-streaming:latest nice -n 10 node server/index.js
```

**Transcoding Optimization:**
```bash
# Use hardware acceleration
docker run --device /dev/dri:/dev/dri \
           -e ENABLE_AMD_GPU=true \
           caullen/highseas-streaming:latest
```

## Development Issues

### 1. Build Errors

**Symptoms:**
- TypeScript compilation errors
- Vite build failures
- Missing dependencies

**Solutions:**

**Clean Build:**
```bash
# Clear caches and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Type Errors:**
```bash
# Run type checking
npm run type-check

# Update type definitions
npm update @types/*
```

### 2. Hot Reload Issues

**Symptoms:**
- Changes not reflecting
- Build process hanging
- File watcher errors

**Solutions:**

**File Watching:**
```bash
# Increase file watcher limits
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Use polling for file watching
npm run dev -- --force
```

### 3. ESLint/Prettier Issues

**Symptoms:**
- Linting errors
- Formatting inconsistencies
- Build failures due to lint errors

**Solutions:**

**Configuration:**
```bash
# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Update configurations
npm run lint -- --fix
```

## Debugging Tools

### Browser Developer Tools

**Console Commands:**
```javascript
// Check video player state
console.log(window.videoPlayer);

// Monitor network requests
console.log(performance.getEntriesByType('navigation'));

// Check HLS.js status
if (window.Hls) {
  console.log('HLS events:', window.Hls.Events);
}

// Memory usage
console.log(performance.memory);
```

**Network Tab:**
- Monitor API requests and responses
- Check for failed requests
- Verify response headers and timing

**Application Tab:**
- Check local storage and session storage
- Verify service worker status
- Inspect cache storage

### Docker Debugging

**Container Inspection:**
```bash
# Get detailed container info
docker inspect highseas-streaming

# Check container filesystem
docker exec -it highseas-streaming sh

# Monitor container logs in real-time
docker logs -f highseas-streaming

# Check container processes
docker exec highseas-streaming ps aux
```

**Network Debugging:**
```bash
# Test connectivity from container
docker exec highseas-streaming wget -qO- http://google.com

# Check container IP
docker inspect highseas-streaming | grep IPAddress

# Test port connectivity
docker exec highseas-streaming netstat -tlnp
```

### Application Debugging

**Log Analysis:**
```bash
# Search for specific errors
docker logs highseas-streaming 2>&1 | grep -i error

# Filter by log category
docker logs highseas-streaming 2>&1 | grep "STREAM"

# Check Real-Debrid interactions
docker logs highseas-streaming 2>&1 | grep "Real-Debrid"
```

**Performance Monitoring:**
```bash
# Monitor API response times
time curl http://localhost:6969/api/health

# Check disk usage
docker exec highseas-streaming df -h

# Monitor network usage
docker exec highseas-streaming netstat -i
```

### Health Check Script

Create a comprehensive health check:

```bash
#!/bin/bash
# health-check-detailed.sh

echo "=== HighSeas Health Check ==="

# Basic connectivity
echo "1. Testing basic connectivity..."
curl -s -w "Response time: %{time_total}s\n" \
     http://localhost:6969/api/health > /dev/null

# Real-Debrid integration
echo "2. Testing Real-Debrid integration..."
REALDEBRID_STATUS=$(curl -s http://localhost:6969/api/realdebrid | jq -r .status)
echo "Real-Debrid status: $REALDEBRID_STATUS"

# Container health
echo "3. Checking container health..."
CONTAINER_STATUS=$(docker ps --filter name=highseas-streaming --format "{{.Status}}")
echo "Container status: $CONTAINER_STATUS"

# Resource usage
echo "4. Checking resource usage..."
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" \
       highseas-streaming

# Recent errors
echo "5. Checking for recent errors..."
ERROR_COUNT=$(docker logs highseas-streaming --since="1h" 2>&1 | grep -i error | wc -l)
echo "Errors in last hour: $ERROR_COUNT"

if [ $ERROR_COUNT -gt 0 ]; then
    echo "Recent errors:"
    docker logs highseas-streaming --since="1h" 2>&1 | grep -i error | tail -5
fi

echo "=== Health Check Complete ==="
```

This troubleshooting guide provides comprehensive coverage of common issues and their solutions, along with debugging tools and techniques to diagnose problems effectively.