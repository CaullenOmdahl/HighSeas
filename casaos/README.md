# CasaOS App Bundle for HighSeas

This directory contains the CasaOS application bundle for deploying HighSeas on CasaOS systems.

## Bundle Contents

### Core Files
- `app.yml` - CasaOS application configuration
- `docker-compose.yml` - Docker Compose configuration (symlinked from root)
- `.env.example` - Environment variables template (symlinked from root)

### Asset Files (Referenced)
- `assets/icon.png` - 512x512 application icon
- `assets/thumbnail.png` - 300x200 preview thumbnail
- `assets/screenshot1.png` - Dashboard interface screenshot
- `assets/screenshot2.png` - Video player interface screenshot

## Installation Methods

### Method 1: Direct Docker Compose (Recommended)
```bash
# Clone repository
git clone https://github.com/highseas-dev/highseas.git
cd highseas

# Copy environment template
cp .env.example .env

# Edit .env and add your Real-Debrid token
nano .env

# Deploy with Docker Compose
docker-compose up -d
```

### Method 2: CasaOS App Store (Future)
When available in the CasaOS App Store:
1. Open CasaOS dashboard
2. Go to App Store
3. Search for "HighSeas" 
4. Click Install
5. Configure Real-Debrid token during installation

### Method 3: Custom App Installation
```bash
# Add custom app in CasaOS
1. Copy app.yml to your CasaOS apps directory
2. Configure environment variables through CasaOS UI
3. Deploy through CasaOS interface
```

## Configuration Requirements

### Required Environment Variables
- `REAL_DEBRID_TOKEN` - Your Real-Debrid API token (get from https://real-debrid.com/apitoken)

### Optional Environment Variables
- `NODE_ENV=production` - Production environment
- `PORT=6969` - Server port (default)
- `BODY_SIZE_LIMIT=10mb` - Request size limit
- `LOG_LEVEL=info` - Logging verbosity

## System Requirements

### Minimum Requirements
- **CPU**: 1 core (0.5 reserved)
- **RAM**: 512MB (1GB limit)
- **Storage**: 1GB available space
- **Network**: Internet access for streaming
- **Architectures**: amd64

### Recommended Requirements
- **CPU**: 2+ cores for transcoding
- **RAM**: 1GB+ for better performance
- **Storage**: 2GB+ for logs and cache
- **Network**: High-speed internet for 4K streaming

## Features Included

### Core Streaming Features
- Netflix-style interface with content discovery
- Real-Debrid integration for premium streaming
- Support for movies and TV shows
- Mobile-optimized responsive design
- Android TV compatibility

### Advanced Video Features
- HLS transcoding for MKV files (FFmpeg included)
- Advanced subtitle support (SRT/WebVTT)
- Multiple quality selection
- Seek/skip functionality
- Volume and playback speed controls

### Security & Performance
- Pure streaming architecture (no downloads)
- Memory-bounded buffering
- CORS proxy for external content
- Structured logging and monitoring
- Health checks and auto-restart

## Troubleshooting

### Common Issues

**1. Real-Debrid Authentication Failed**
- Verify token is correct from https://real-debrid.com/apitoken
- Check token has not expired
- Ensure network connectivity to Real-Debrid API

**2. Video Won't Play**
- Check if MKV files need transcoding (FFmpeg)
- Verify stream URL is accessible
- Check browser console for JavaScript errors

**3. CasaOS Installation Issues**
- Ensure CasaOS version 0.4.0+
- Check Docker permissions and resources
- Verify port 6969 is not in use

**4. Performance Issues**
- Increase memory limits in docker-compose.yml
- Check CPU usage during transcoding
- Monitor network bandwidth usage

### Log Files
- Application logs: `./logs/app-YYYY-MM-DD.log`
- Docker logs: `docker logs highseas`
- CasaOS logs: Check CasaOS dashboard

### Support Resources
- **GitHub Issues**: https://github.com/highseas-dev/highseas/issues
- **Documentation**: https://github.com/highseas-dev/highseas/wiki
- **CasaOS Community**: https://community.casaos.io

## Development & Contribution

To modify or extend this CasaOS bundle:

1. Fork the repository
2. Make changes to `app.yml` or other bundle files
3. Test installation on a CasaOS instance
4. Submit pull request with detailed description

### Testing Checklist
- [ ] Installation completes without errors
- [ ] Environment variables are properly configured
- [ ] Health checks pass
- [ ] Web interface is accessible
- [ ] Real-Debrid integration works
- [ ] Video playback functions correctly
- [ ] Logging and monitoring operational

## Version History

- **v1.0.0** - Initial CasaOS bundle release
  - Docker Compose configuration
  - Environment variable templates
  - Health checks and monitoring
  - Asset placeholders and documentation