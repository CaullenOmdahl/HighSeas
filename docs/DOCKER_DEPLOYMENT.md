# Docker Deployment Guide - HighSeas

This guide provides multiple ways to deploy HighSeas using Docker.

## 🚀 Quick Start Options

### Option 1: Docker Compose (Recommended)

#### Development Build (Local)
```bash
# Clone the repository
git clone https://github.com/CaullenOmdahl/HighSeas.git
cd HighSeas

# Configure environment
cp .env.example .env
# Edit .env and add your Real-Debrid token

# Build and run with Docker Compose (builds locally)
docker-compose up -d
# or: npm run docker:up
```

#### Production (Pre-built Image from Docker Hub)
```bash
# Use pre-built image from Docker Hub
docker-compose up -d
# or: npm run docker:up
# or: docker-compose -f docker-compose.production.yml up -d
```

### Option 2: Manual Docker Build
```bash
# Build the image
npm run docker:build
# or: docker build -t highseas-streaming:latest .

# Run the container
npm run docker:run
# or: docker run -d --name highseas-streaming -p 6969:6969 --restart unless-stopped highseas-streaming:latest
```

### Option 3: Pre-built Image (Docker Hub)
```bash
# Pull and run pre-built image
docker pull caullen/highseas-streaming:latest
docker run -d --name highseas-streaming \
  -p 6969:6969 \
  -e REAL_DEBRID_TOKEN=your_token_here \
  --restart unless-stopped \
  caullen/highseas-streaming:latest
```

## 🔧 Configuration

### Required Environment Variables
```bash
REAL_DEBRID_TOKEN=your_real_debrid_token_here
```

### Optional Environment Variables
```bash
NODE_ENV=production
PORT=6969
BODY_SIZE_LIMIT=10mb
LOG_LEVEL=info
ENABLE_AMD_GPU=true
```

## 🎮 Advanced Configuration

### With AMD GPU Support (Transcoding)
```bash
docker run -d --name highseas-streaming \
  -p 6969:6969 \
  -e REAL_DEBRID_TOKEN=your_token_here \
  -e ENABLE_AMD_GPU=true \
  --device /dev/dri:/dev/dri \
  --group-add video \
  --restart unless-stopped \
  highseas-streaming:latest
```

### With Persistent Data
```bash
docker run -d --name highseas-streaming \
  -p 6969:6969 \
  -e REAL_DEBRID_TOKEN=your_token_here \
  -v ./data:/app/data \
  -v ./logs:/app/logs \
  --restart unless-stopped \
  highseas-streaming:latest
```

### Resource Limits
```bash
docker run -d --name highseas-streaming \
  -p 6969:6969 \
  -e REAL_DEBRID_TOKEN=your_token_here \
  --memory="1g" \
  --cpus="2.0" \
  --restart unless-stopped \
  highseas-streaming:latest
```

## 🩺 Health Checks

The container includes built-in health checks:
```bash
# Check container health
docker ps --filter name=highseas-streaming

# View health check logs
docker inspect highseas-streaming | grep Health -A 10

# Manual health check
curl http://localhost:6969/api/health
```

## 📊 Monitoring

### View Logs
```bash
# Real-time logs
docker logs -f highseas-streaming

# Recent logs
docker logs --tail 100 highseas-streaming
```

### Container Stats
```bash
# Resource usage
docker stats highseas-streaming

# Container info
docker inspect highseas-streaming
```

## 🛠 Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Find what's using port 6969
sudo lsof -i :6969

# Use different port
docker run -p 6970:6969 ...
```

**2. Real-Debrid Token Issues**
```bash
# Check environment variables
docker exec highseas-streaming env | grep REAL_DEBRID

# Test token manually
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.real-debrid.com/rest/1.0/user
```

**3. GPU Transcoding Not Working**
```bash
# Check GPU devices
ls -la /dev/dri/

# Verify container has GPU access
docker exec highseas-streaming ls -la /dev/dri/
```

**4. Container Won't Start**
```bash
# Check container logs
docker logs highseas-streaming

# Run interactive shell for debugging
docker run -it --entrypoint /bin/sh highseas-streaming:latest
```

## 🔄 Updates

### Update Container
```bash
# Stop current container
docker stop highseas-streaming
docker rm highseas-streaming

# Pull latest changes and rebuild
git pull origin master
docker-compose up -d --build

# Or rebuild manually
npm run docker:build
npm run docker:run
```

### Backup Data
```bash
# Backup volumes
docker run --rm -v highseas_data:/data -v $(pwd):/backup alpine tar czf /backup/highseas-backup.tar.gz -C /data .

# Restore backup
docker run --rm -v highseas_data:/data -v $(pwd):/backup alpine tar xzf /backup/highseas-backup.tar.gz -C /data
```

## 🔒 Security Considerations

1. **Never expose Real-Debrid tokens** in docker run commands on shared systems
2. **Use environment files** for sensitive configuration
3. **Keep containers updated** regularly
4. **Monitor resource usage** to prevent abuse
5. **Use reverse proxy** (Traefik/Nginx) for HTTPS in production

## 📱 CasaOS Integration

For CasaOS users, the docker-compose.yml includes CasaOS metadata:
1. Import the docker-compose.yml into CasaOS
2. Configure environment variables through CasaOS UI
3. Deploy directly from CasaOS dashboard

---

**Access your HighSeas instance at:** http://localhost:6969

**Need help?** Check the [GitHub Issues](https://github.com/CaullenOmdahl/HighSeas/issues)