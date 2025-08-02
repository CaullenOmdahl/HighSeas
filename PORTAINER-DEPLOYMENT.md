# 🐳 HighSeas Portainer Stack Deployment

This guide shows how to deploy HighSeas using Portainer stacks for easy container management through a web interface.

## 📋 Prerequisites

- Portainer installed and running
- Real-Debrid premium account and API token
- Docker host with sufficient resources (2GB RAM recommended)
- AMD GPU (optional, for hardware transcoding)

## 🚀 Quick Deployment

### Step 1: Get Your Real-Debrid Token

1. Go to [Real-Debrid API Token](https://real-debrid.com/apitoken)
2. Copy your API token (keep it secure!)

### Step 2: Deploy Stack in Portainer

1. **Login to Portainer** web interface
2. **Navigate to Stacks** → **+ Add stack**
3. **Name your stack**: `highseas-streaming`
4. **Choose deployment method**:

#### Option A: Upload Stack File (Recommended)
1. Download [`portainer-stack.yml`](./portainer-stack.yml) or [`portainer-stack-simple.yml`](./portainer-stack-simple.yml)
2. Click **Upload** and select the file
3. Configure environment variables (see below)

#### Option B: Web Editor
1. Click **Web editor**
2. Copy and paste the stack configuration from below
3. Configure environment variables

### Step 3: Configure Environment Variables

In the **Environment variables** section, add:

| Variable | Value | Required | Description |
|----------|-------|----------|-------------|
| `REAL_DEBRID_TOKEN` | `your_token_here` | ✅ Yes | Your Real-Debrid API token |
| `HIGHSEAS_PORT` | `6969` | No | Port to expose (default: 6969) |
| `LOG_LEVEL` | `info` | No | Logging level (error/warn/info/debug) |
| `ENABLE_AMD_GPU` | `true` | No | Enable AMD GPU transcoding |
| `HIGHSEAS_DOMAIN` | `highseas.local` | No | Domain for Traefik (if using) |

### Step 4: Deploy

1. **Click "Deploy the stack"**
2. **Wait for deployment** (may take 1-2 minutes to pull image)
3. **Access HighSeas** at `http://your-server-ip:6969`

## 📦 Stack Configurations

### Full Configuration (`portainer-stack.yml`)

Features:
- ✅ Complete environment variable support
- ✅ Resource limits and reservations
- ✅ Advanced logging configuration
- ✅ Traefik reverse proxy support
- ✅ Comprehensive labels and metadata
- ✅ Health checks and monitoring
- ✅ GPU acceleration setup

```yaml
version: '3.8'

services:
  highseas:
    image: ghcr.io/caullenomdahl/highseas:latest
    container_name: highseas-streaming
    restart: unless-stopped
    
    ports:
      - "${HIGHSEAS_PORT:-6969}:6969"
    
    environment:
      - REAL_DEBRID_TOKEN=${REAL_DEBRID_TOKEN}
      - NODE_ENV=production
      - LOG_LEVEL=${LOG_LEVEL:-info}
      - ENABLE_AMD_GPU=${ENABLE_AMD_GPU:-true}
    
    volumes:
      - highseas_data:/app/data
      - highseas_logs:/app/logs
      - /dev/dri:/dev/dri
    
    devices:
      - /dev/dri/renderD128:/dev/dri/renderD128
    
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:6969/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 512M

volumes:
  highseas_data:
  highseas_logs:
```

### Simple Configuration (`portainer-stack-simple.yml`)

Features:
- ✅ Minimal configuration for quick setup
- ✅ Essential environment variables only
- ✅ Basic health checking
- ✅ Perfect for beginners

```yaml
version: '3.8'

services:
  highseas:
    image: ghcr.io/caullenomdahl/highseas:latest
    container_name: highseas-streaming
    restart: unless-stopped
    
    ports:
      - "6969:6969"
    
    environment:
      - REAL_DEBRID_TOKEN=${REAL_DEBRID_TOKEN}
      - NODE_ENV=production
      - ENABLE_AMD_GPU=true
    
    volumes:
      - highseas_data:/app/data
      - highseas_logs:/app/logs
      - /dev/dri:/dev/dri
    
    devices:
      - /dev/dri/renderD128:/dev/dri/renderD128

volumes:
  highseas_data:
  highseas_logs:
```

## 🔧 GPU Setup (Optional)

### AMD GPU Transcoding

If you have an AMD GPU and want hardware-accelerated transcoding:

1. **Verify GPU access** on your Docker host:
   ```bash
   ls -la /dev/dri/
   # Should show renderD128 or similar
   ```

2. **Add user to video group** (if needed):
   ```bash
   sudo usermod -a -G video $USER
   ```

3. **Keep GPU settings** in the stack configuration

### No GPU Setup

If you don't have a GPU or want CPU-only transcoding:

1. **Remove these lines** from the stack:
   ```yaml
   volumes:
     - /dev/dri:/dev/dri  # Remove this line
   
   devices:
     - /dev/dri/renderD128:/dev/dri/renderD128  # Remove this line
   ```

2. **Set environment variable**:
   ```yaml
   environment:
     - ENABLE_AMD_GPU=false
   ```

## 🌐 Reverse Proxy Setup (Optional)

### Traefik Integration

To use HighSeas with Traefik reverse proxy:

1. **Create external Traefik network** (if not exists):
   ```bash
   docker network create traefik_network
   ```

2. **Update environment variables**:
   ```
   HIGHSEAS_DOMAIN=highseas.yourdomain.com
   ```

3. **Enable Traefik labels** in the stack:
   ```yaml
   labels:
     - "traefik.enable=true"
     - "traefik.http.routers.highseas.rule=Host(`${HIGHSEAS_DOMAIN}`)"
     - "traefik.http.routers.highseas.tls=true"
   ```

### Nginx Proxy Manager

For Nginx Proxy Manager:

1. **Note the container IP** after deployment
2. **Create proxy host** pointing to `container-ip:6969`
3. **Enable SSL** if desired

## 📊 Monitoring and Management

### Portainer Container View

After deployment, you can:
- ✅ **View logs** in real-time
- ✅ **Monitor resource usage** (CPU, RAM, Network)
- ✅ **Restart containers** if needed
- ✅ **Update images** when new versions are released
- ✅ **Inspect configuration** and environment variables

### Health Monitoring

The stack includes health checks that monitor:
- ✅ HTTP endpoint responsiveness (`/api/health`)
- ✅ Container startup health
- ✅ Automatic restart on failure

### Log Management

Logs are automatically:
- ✅ **Rotated** (50MB max, 3 files)
- ✅ **Stored** in named volumes (`highseas_logs`)
- ✅ **Accessible** through Portainer logs viewer

## 🔄 Updates and Maintenance

### Updating HighSeas

1. **Go to your stack** in Portainer
2. **Click "Editor"**
3. **Don't change anything** (just to refresh)
4. **Click "Update the stack"**
5. **Enable "Re-pull image"**
6. **Deploy**

This will pull the latest image from GHCR and restart with your existing configuration.

### Backing Up Configuration

Your stack configuration and volumes are persistent. To backup:

1. **Export stack definition** from Portainer
2. **Backup volumes** if needed:
   ```bash
   docker run --rm -v highseas-streaming_highseas_data:/data -v $(pwd):/backup alpine tar czf /backup/highseas-data.tar.gz -C /data .
   ```

## 🚨 Troubleshooting

### Stack Deployment Fails

**Check:**
- ✅ REAL_DEBRID_TOKEN is set correctly
- ✅ Port 6969 is not already in use
- ✅ Docker host has sufficient resources
- ✅ Image can be pulled from GHCR

**Fix:**
```bash
# Test image pull manually
docker pull ghcr.io/caullenomdahl/highseas:latest

# Check port availability
netstat -tulpn | grep 6969
```

### Container Won't Start

**Check logs in Portainer:**
1. Go to **Containers** → **highseas-streaming**
2. Click **Logs**
3. Look for error messages

**Common issues:**
- Missing Real-Debrid token
- GPU device permissions
- Insufficient memory

### Performance Issues

**Increase resources in stack:**
```yaml
deploy:
  resources:
    limits:
      cpus: '6.0'      # Increase CPU limit
      memory: 4G       # Increase memory limit
```

### GPU Transcoding Not Working

**Verify GPU access:**
```bash
# On Docker host
docker exec highseas-streaming ls -la /dev/dri/
docker exec highseas-streaming groups
```

**Check FFmpeg GPU support:**
```bash
docker exec highseas-streaming ffmpeg -hwaccels
# Should show "vaapi" in the list
```

## 🎯 Best Practices

### Security
- ✅ Use strong Real-Debrid token
- ✅ Don't expose to public internet without reverse proxy
- ✅ Regular updates through Portainer
- ✅ Monitor logs for unusual activity

### Performance
- ✅ Allocate sufficient resources (2GB+ RAM)
- ✅ Use AMD GPU if available for transcoding
- ✅ Monitor container resource usage
- ✅ Use SSD storage for better I/O performance

### Maintenance
- ✅ Regular image updates (weekly/monthly)
- ✅ Log monitoring and cleanup
- ✅ Volume backup strategy
- ✅ Network connectivity monitoring

This Portainer stack configuration provides a professional, easy-to-manage HighSeas deployment with all the features needed for premium streaming!