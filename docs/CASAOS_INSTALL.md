# HighSeas CasaOS Installation Guide

Complete guide for deploying HighSeas streaming application on CasaOS systems.

## Overview

HighSeas is a Netflix-style streaming interface for Stremio that provides:
- Premium streaming with Real-Debrid integration
- HLS transcoding for MKV file support
- Advanced subtitle system with SRT/WebVTT parsing
- Mobile-optimized responsive design
- Android TV compatibility

## Prerequisites

### System Requirements
- **CasaOS**: Version 0.4.0 or higher
- **Docker**: Installed and running
- **Memory**: Minimum 512MB, recommended 1GB+
- **CPU**: 1+ cores (2+ recommended for transcoding)
- **Storage**: 2GB+ available space
- **Network**: High-speed internet connection
- **GPU (Optional)**: AMD graphics card with VAAPI support for hardware transcoding

### Required Account
- **Real-Debrid Premium Account**: Required for streaming functionality
  - Sign up at: https://real-debrid.com
  - Generate API token at: https://real-debrid.com/apitoken

## Installation Methods

### Method 1: Docker Compose (Recommended)

This is the most straightforward installation method.

#### Step 1: Clone Repository
```bash
# SSH into your CasaOS system
ssh username@your-casaos-ip

# Clone the HighSeas repository
git clone https://github.com/highseas-dev/highseas.git
cd highseas
```

#### Step 2: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit configuration file
nano .env
```

**Required configuration in `.env`:**
```bash
# Real-Debrid API Token (REQUIRED)
REAL_DEBRID_TOKEN=your_real_debrid_token_here

# Server configuration
NODE_ENV=production
PORT=6969
BODY_SIZE_LIMIT=10mb
LOG_LEVEL=info

# AMD GPU acceleration (optional)
ENABLE_AMD_GPU=true
```

#### Step 3: Deploy Application
```bash
# Start the application
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Step 4: Access Application
- Open browser to: `http://your-casaos-ip:6969`
- The HighSeas interface should load
- If Real-Debrid token is invalid, you'll see an error message

### Method 2: CasaOS Custom App

Install through CasaOS dashboard interface.

#### Step 1: Prepare Files
```bash
# Create app directory
mkdir -p /etc/casaos/apps/highseas
cd /etc/casaos/apps/highseas

# Copy configuration files
cp /path/to/highseas/docker-compose.yml .
cp /path/to/highseas/.env.example .env
```

#### Step 2: Configure Through CasaOS UI
1. Open CasaOS dashboard
2. Go to **App Store** > **Custom Install**
3. Upload or reference the `docker-compose.yml`
4. Configure environment variables:
   - `REAL_DEBRID_TOKEN`: Your API token
   - `PORT`: 6969 (default)
   - Other variables as needed

#### Step 3: Deploy
1. Click **Install** in CasaOS interface
2. Wait for deployment to complete
3. Check app status in dashboard

### Method 3: Manual Docker Installation

For advanced users who prefer manual Docker commands.

#### Step 1: Pull Image
```bash
docker pull highseas/highseas:latest
```

#### Step 2: Create Volumes
```bash
# Create data directories
mkdir -p /opt/highseas/data
mkdir -p /opt/highseas/logs
```

#### Step 3: Run Container
```bash
docker run -d \\
  --name highseas \\
  --restart unless-stopped \\
  -p 6969:6969 \\
  -e NODE_ENV=production \\
  -e PORT=6969 \\
  -e REAL_DEBRID_TOKEN=your_token_here \\
  -e BODY_SIZE_LIMIT=10mb \\
  -e LOG_LEVEL=info \\
  -v /opt/highseas/data:/app/data \\
  -v /opt/highseas/logs:/app/logs \\
  highseas/highseas:latest
```

## Post-Installation Configuration

### Verify Installation

1. **Health Check**
   ```bash
   curl http://localhost:6969/api/health
   ```
   Should return: `{"status":"ok","timestamp":"...","service":"HighSeas Development Server"}`

2. **Real-Debrid Connection**
   ```bash
   curl http://localhost:6969/api/realdebrid
   ```
   Should return user information if token is valid

3. **Web Interface**
   - Navigate to `http://your-casaos-ip:6969`
   - Should see HighSeas dashboard
   - No errors in browser console

### Configure Stremio Addons

1. Access Settings page in HighSeas
2. Add Stremio addon URLs:
   - **Torrentio**: `https://torrentio.strem.fun/manifest.json`
   - **Cinemeta**: `https://v3-cinemeta.strem.io/manifest.json`
   - **OpenSubtitles**: `https://opensubtitles.strem.io/manifest.json`

### AMD GPU Hardware Acceleration Setup

HighSeas supports AMD GPU hardware acceleration for transcoding, providing significantly better performance than CPU-only transcoding.

#### Prerequisites
- AMD graphics card with VAAPI support (most modern AMD GPUs)
- Mesa drivers installed on the host system
- `/dev/dri` device accessible to Docker

#### Verify GPU Support
```bash
# Check if AMD GPU is detected
lspci | grep -i amd

# Check VAAPI devices
ls -la /dev/dri/

# Test VAAPI functionality (if vainfo is installed)
vainfo
```

#### Enable GPU Acceleration
1. **Set environment variable in `.env`:**
   ```bash
   ENABLE_AMD_GPU=true
   ```

2. **Ensure docker-compose.yml has GPU access:**
   ```yaml
   devices:
     - /dev/dri:/dev/dri  # AMD GPU device access
   group_add:
     - video  # Video group for GPU access
   ```

3. **Deploy with GPU support:**
   ```bash
   docker-compose up -d
   ```

#### Troubleshooting GPU Issues
- **Permission denied errors**: Ensure Docker has access to `/dev/dri`
- **VAAPI initialization failed**: Check Mesa drivers are installed
- **Automatic fallback**: If GPU fails, transcoding automatically falls back to CPU

#### Performance Comparison
- **CPU Transcoding**: ~0.5-1x real-time speed, high CPU usage
- **AMD GPU Transcoding**: ~3-5x real-time speed, low CPU usage

### Network Configuration

#### Port Forwarding (if needed)
- Forward port 6969 from your router to CasaOS IP
- Only required for external access

#### Reverse Proxy (optional)
If using Traefik or other reverse proxy:

```yaml
# Add to docker-compose.yml labels
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.highseas.rule=Host(\`highseas.yourdomain.com\`)"
  - "traefik.http.services.highseas.loadbalancer.server.port=6969"
```

## Usage Guide

### Browsing Content
1. **Dashboard**: Browse curated content from Stremio addons
2. **Search**: Use the search bar to find specific titles
3. **Discover**: Explore content by genre, year, rating

### Streaming Content
1. Click on any movie/show to open details
2. Select episode (for TV shows)
3. Choose streaming quality/source
4. Real-Debrid will convert magnet links to direct streams
5. Video player loads with HLS transcoding for MKV files

### Player Features
- **Quality Selection**: Auto or manual quality selection
- **Subtitles**: Automatic subtitle loading with styling options
- **Playback Controls**: Speed, volume, fullscreen, seeking
- **Mobile Controls**: Touch-optimized for phones/tablets

## Troubleshooting

### Common Issues

#### Real-Debrid Token Issues
**Problem**: "Real-Debrid service not configured" error

**Solutions**:
1. Verify token is correct from https://real-debrid.com/apitoken
2. Check token hasn't expired
3. Ensure environment variable is set correctly:
   ```bash
   docker exec highseas env | grep REAL_DEBRID_TOKEN
   ```

#### Video Playback Issues
**Problem**: Videos won't play or buffer indefinitely

**Solutions**:
1. Check FFmpeg installation in container:
   ```bash
   docker exec highseas ffmpeg -version
   ```
2. Monitor transcoding logs:
   ```bash
   docker logs highseas | grep FFmpeg
   ```
3. Test stream URL manually:
   ```bash
   curl -I "http://localhost:6969/api/proxy?url=STREAM_URL"
   ```

#### Performance Issues
**Problem**: Slow loading or high CPU usage

**Solutions**:
1. Increase memory limits in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         memory: 2G
   ```
2. Check available system resources:
   ```bash
   docker stats highseas
   ```
3. Monitor transcoding sessions:
   ```bash
   docker exec highseas ps aux | grep ffmpeg
   ```

#### Network Connectivity Issues
**Problem**: Cannot access from other devices

**Solutions**:
1. Check CasaOS firewall settings
2. Verify port 6969 is accessible:
   ```bash
   netstat -tlnp | grep 6969
   ```
3. Test from another device:
   ```bash
   curl http://casaos-ip:6969/api/health
   ```

### Log Analysis

#### Application Logs
```bash
# Real-time logs
docker logs -f highseas

# Specific time range
docker logs --since "1h" highseas

# File-based logs (if mounted)
tail -f /opt/highseas/logs/app-$(date +%Y-%m-%d).log
```

#### Log Categories to Monitor
- **PLAYER**: Video player issues
- **STREAM**: Streaming and proxy issues  
- **ADDON**: Stremio addon connectivity
- **NETWORK**: Network requests and timeouts
- **SYSTEM**: Container and process issues

### Performance Monitoring

#### Resource Usage
```bash
# Container stats
docker stats highseas

# System resources
htop
df -h
```

#### Network Monitoring
```bash
# Network connections
netstat -tulpn | grep highseas

# Bandwidth usage
iftop
```

## Maintenance

### Updates

#### Update Application
```bash
cd /path/to/highseas
docker-compose pull
docker-compose up -d
```

#### Update CasaOS
Follow CasaOS update procedures, then verify HighSeas still works

### Backup

#### Backup Configuration
```bash
# Backup essential files
tar -czf highseas-backup.tar.gz \\
  docker-compose.yml \\
  .env \\
  data/ \\
  logs/
```

#### Restore Configuration
```bash
# Restore from backup
tar -xzf highseas-backup.tar.gz
docker-compose up -d
```

### Cleanup

#### Remove Old Logs
```bash
# Keep last 7 days of logs
find logs/ -name "*.log" -mtime +7 -delete
```

#### Prune Docker Resources
```bash
# Remove unused images
docker image prune -f

# Remove unused containers
docker container prune -f
```

## Security Considerations

### Network Security
- Don't expose port 6969 to the internet without authentication
- Use VPN or reverse proxy with authentication for remote access
- Keep CasaOS and Docker updated

### API Token Security
- Never commit Real-Debrid tokens to version control
- Use environment variables only
- Rotate tokens periodically

### Container Security
- Run containers as non-root user (already configured)
- Limit container resources to prevent DoS
- Monitor for unusual network activity

## Support & Community

### Getting Help
- **GitHub Issues**: https://github.com/highseas-dev/highseas/issues
- **CasaOS Community**: https://community.casaos.io
- **Documentation**: https://github.com/highseas-dev/highseas/wiki

### Contributing
- Report bugs and feature requests on GitHub
- Submit pull requests for improvements
- Share configuration tips in discussions

### Version Information
This guide is for HighSeas v1.0.0 with CasaOS v0.4.0+

Last updated: $(date)