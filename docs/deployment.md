# Deployment Guide

This guide covers all deployment options for HighSeas, from development to production environments.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Docker Deployment](#docker-deployment)
3. [Production Deployment](#production-deployment)
4. [CasaOS Integration](#casaos-integration)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring & Logging](#monitoring--logging)
7. [Security Considerations](#security-considerations)
8. [Scaling & Performance](#scaling--performance)

## Quick Start

### One-Command Deployment

The fastest way to get HighSeas running:

```bash
docker run -d \
  --name highseas-streaming \
  -p 6969:6969 \
  --device /dev/dri:/dev/dri \
  --restart unless-stopped \
  caullen/highseas-streaming:latest
```

Access at: `http://localhost:6969`

### With Real-Debrid Integration

For premium streaming capabilities:

```bash
docker run -d \
  --name highseas-streaming \
  -p 6969:6969 \
  --device /dev/dri:/dev/dri \
  -e REAL_DEBRID_TOKEN=your_token_here \
  -e NODE_ENV=production \
  --restart unless-stopped \
  caullen/highseas-streaming:latest
```

## Docker Deployment

### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  highseas:
    image: caullen/highseas-streaming:latest
    container_name: highseas-streaming
    ports:
      - "6969:6969"
    environment:
      NODE_ENV: production
      REAL_DEBRID_TOKEN: ${REAL_DEBRID_TOKEN:-}
      LOG_LEVEL: info
      ENABLE_AMD_GPU: true
    devices:
      - /dev/dri:/dev/dri
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "http.get('http://localhost:6969/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    logging:
      driver: json-file
      options:
        max-size: 10m
        max-file: '3'

networks:
  default:
    name: highseas-network
```

Deploy:

```bash
# Create environment file
echo "REAL_DEBRID_TOKEN=your_token_here" > .env

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Manual Docker Build

Build from source:

```bash
# Clone repository
git clone https://github.com/CaullenOmdahl/HighSeas.git
cd HighSeas

# Build image
docker build -t highseas-streaming:local .

# Run container
docker run -d \
  --name highseas-local \
  -p 6969:6969 \
  --device /dev/dri:/dev/dri \
  --env-file .env \
  highseas-streaming:local
```

## Production Deployment

### Production Docker Compose

For production environments with enhanced security and monitoring:

```yaml
version: '3.8'

services:
  highseas:
    image: caullen/highseas-streaming:latest
    container_name: highseas-streaming
    ports:
      - "6969:6969"
    environment:
      NODE_ENV: production
      REAL_DEBRID_TOKEN: ${REAL_DEBRID_TOKEN}
      LOG_LEVEL: warn
      BODY_SIZE_LIMIT: 10mb
      ENABLE_AMD_GPU: true
      LOGS_DIR: /app/logs
    devices:
      - /dev/dri:/dev/dri
    volumes:
      - /opt/highseas/logs:/app/logs
      - /opt/highseas/data:/app/data
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    user: "1001:1001"
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
    healthcheck:
      test: ["CMD", "node", "-e", "http.get('http://localhost:6969/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    logging:
      driver: json-file
      options:
        max-size: 25m
        max-file: '5'
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G

  nginx:
    image: nginx:alpine
    container_name: highseas-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
    depends_on:
      - highseas
    restart: unless-stopped

networks:
  default:
    name: highseas-network
    driver: bridge
```

### Nginx Reverse Proxy

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream highseas {
        server highseas:6969;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=streaming:10m rate=5r/s;

    server {
        listen 80;
        server_name your-domain.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/ssl/certs/fullchain.pem;
        ssl_certificate_key /etc/ssl/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Main application
        location / {
            proxy_pass http://highseas;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API endpoints with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://highseas;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # HLS streaming endpoints
        location /api/hls/ {
            limit_req zone=streaming burst=10 nodelay;
            proxy_pass http://highseas;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Optimize for streaming
            proxy_buffering off;
            proxy_cache off;
        }
    }
}
```

### SSL/TLS Configuration

Generate SSL certificates using Let's Encrypt:

```bash
# Install certbot
sudo apt update
sudo apt install certbot

# Generate certificates
sudo certbot certonly --standalone -d your-domain.com

# Copy to deployment directory
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/

# Set permissions
sudo chown 1001:1001 ./ssl/*.pem
sudo chmod 644 ./ssl/fullchain.pem
sudo chmod 600 ./ssl/privkey.pem
```

Auto-renewal setup:

```bash
# Add to crontab
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## CasaOS Integration

HighSeas includes native CasaOS support for easy home server deployment.

### App Store Installation

1. Open CasaOS dashboard
2. Navigate to App Store
3. Search for "HighSeas"
4. Click Install
5. Configure Real-Debrid token during setup

### Manual CasaOS Configuration

Create app configuration file:

```yaml
# casaos-app.yml
version: "3.8"

x-casaos:
  architectures:
    - amd64
  main: app
  description:
    en_us: 'HighSeas - A Netflix-style streaming interface for Stremio addons with Real-Debrid integration'
  tagline:
    en_us: Premium streaming interface for Stremio
  developer: HighSeas Team
  category: Media
  port_map: '6969'
  tips:
    before_install:
      en_us: |
        ⚠️ **Real-Debrid API Token Required**
        
        1. Sign up at https://real-debrid.com
        2. Generate API token at https://real-debrid.com/apitoken
        3. Enter token during installation
    after_install:
      en_us: |
        ✅ **Installation Complete**
        
        Access your HighSeas interface at: http://your-casaos-ip:6969

services:
  app:
    image: caullen/highseas-streaming:latest
    container_name: highseas-streaming
    restart: unless-stopped
    ports:
      - "6969:6969"
    environment:
      NODE_ENV: production
      REAL_DEBRID_TOKEN: ${REAL_DEBRID_TOKEN:-}
      ENABLE_AMD_GPU: true
    devices:
      - /dev/dri:/dev/dri
    volumes:
      - /DATA/AppData/highseas-streaming/data:/app/data
      - /DATA/AppData/highseas-streaming/logs:/app/logs
    labels:
      - "casaos.name=HighSeas"
      - "casaos.category=Media"
      - "casaos.description=Netflix-style streaming interface"
```

## Environment Configuration

### Required Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REAL_DEBRID_TOKEN` | ✅ | - | Real-Debrid API token |
| `NODE_ENV` | ❌ | `development` | Environment mode |

### Optional Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `6969` | Server port |
| `LOG_LEVEL` | `info` | Logging level (error, warn, info, debug) |
| `BODY_SIZE_LIMIT` | `10mb` | Request body size limit |
| `ENABLE_AMD_GPU` | `true` | Enable AMD GPU transcoding |
| `LOGS_DIR` | `/app/logs` | Log file directory |

### Environment File Template

Create `.env` file:

```bash
# Real-Debrid Integration
REAL_DEBRID_TOKEN=your_real_debrid_token_here

# Application Configuration
NODE_ENV=production
PORT=6969
LOG_LEVEL=info
BODY_SIZE_LIMIT=10mb

# GPU Acceleration
ENABLE_AMD_GPU=true

# Logging
LOGS_DIR=/app/logs

# Optional: External Service URLs
STREMIO_API_URL=http://localhost:11470
TORRENTIO_URL=https://torrentio.strem.fun
```

### Security Environment Variables

For production deployments:

```bash
# Security Headers
SECURITY_HEADERS=true
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW=900000  # 15 minutes
RATE_LIMIT_MAX=100        # 100 requests per window

# Session Security
SESSION_SECRET=your_long_random_session_secret_here
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
```

## Monitoring & Logging

### Health Monitoring

Setup health checks:

```bash
# Docker health check
docker run --health-cmd="curl -f http://localhost:6969/api/health || exit 1" \
           --health-interval=30s \
           --health-timeout=10s \
           --health-retries=3 \
           caullen/highseas-streaming:latest

# External monitoring script
#!/bin/bash
# health-check.sh
HEALTH_URL="http://localhost:6969/api/health"
RESPONSE=$(curl -s -w "%{http_code}" $HEALTH_URL -o /dev/null)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ HighSeas is healthy"
    exit 0
else
    echo "❌ HighSeas health check failed (HTTP $RESPONSE)"
    exit 1
fi
```

### Log Management

Configure log rotation:

```bash
# logrotate configuration
# /etc/logrotate.d/highseas
/opt/highseas/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 1001 1001
    postrotate
        docker kill -s USR1 highseas-streaming
    endscript
}
```

### Monitoring Dashboard

Example Prometheus configuration:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'highseas'
    static_configs:
      - targets: ['localhost:6969']
    metrics_path: '/api/metrics'
    scrape_interval: 30s
```

## Security Considerations

### Firewall Configuration

```bash
# UFW rules for Ubuntu/Debian
sudo ufw allow 6969/tcp comment 'HighSeas streaming'
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw enable

# iptables rules
sudo iptables -A INPUT -p tcp --dport 6969 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -j DROP
```

### Container Security

Run with minimal privileges:

```yaml
# docker-compose security settings
services:
  highseas:
    image: caullen/highseas-streaming:latest
    security_opt:
      - no-new-privileges:true
    user: "1001:1001"
    read_only: true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
      - /var/tmp:noexec,nosuid,size=50m
```

### Network Security

Restrict network access:

```yaml
networks:
  highseas-internal:
    driver: bridge
    internal: true
  highseas-external:
    driver: bridge

services:
  highseas:
    networks:
      - highseas-internal
      - highseas-external
```

### Secret Management

Use Docker secrets for sensitive data:

```yaml
services:
  highseas:
    image: caullen/highseas-streaming:latest
    secrets:
      - real_debrid_token
    environment:
      REAL_DEBRID_TOKEN_FILE: /run/secrets/real_debrid_token

secrets:
  real_debrid_token:
    file: ./secrets/real_debrid_token.txt
```

## Scaling & Performance

### Horizontal Scaling

Load balancer configuration:

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  loadbalancer:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    depends_on:
      - app1
      - app2

  app1:
    image: caullen/highseas-streaming:latest
    environment:
      INSTANCE_ID: "app1"
      
  app2:
    image: caullen/highseas-streaming:latest
    environment:
      INSTANCE_ID: "app2"
```

Load balancer configuration:

```nginx
# nginx-lb.conf
upstream highseas_backend {
    least_conn;
    server app1:6969 weight=1 max_fails=3 fail_timeout=30s;
    server app2:6969 weight=1 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://highseas_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Resource Optimization

Optimize Docker resources:

```yaml
services:
  highseas:
    image: caullen/highseas-streaming:latest
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
          pids: 100
        reservations:
          cpus: '1.0'
          memory: 2G
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
```

### Performance Tuning

System-level optimizations:

```bash
# Increase file descriptor limits
echo "fs.file-max = 65536" >> /etc/sysctl.conf

# Optimize network settings
echo "net.core.rmem_max = 16777216" >> /etc/sysctl.conf
echo "net.core.wmem_max = 16777216" >> /etc/sysctl.conf
echo "net.ipv4.tcp_rmem = 4096 87380 16777216" >> /etc/sysctl.conf
echo "net.ipv4.tcp_wmem = 4096 65536 16777216" >> /etc/sysctl.conf

# Apply settings
sysctl -p
```

### Database Scaling

For high-traffic deployments, consider adding Redis for caching:

```yaml
services:
  redis:
    image: redis:alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    
  highseas:
    image: caullen/highseas-streaming:latest
    environment:
      REDIS_URL: redis://redis:6379
    depends_on:
      - redis

volumes:
  redis_data:
```

## Backup & Recovery

### Backup Strategy

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/opt/backups/highseas"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup configuration
cp -r /opt/highseas/.env $BACKUP_DIR/env_$DATE
cp -r /opt/highseas/docker-compose.yml $BACKUP_DIR/compose_$DATE.yml

# Backup logs (last 7 days)
find /opt/highseas/logs -name "*.log" -mtime -7 -exec cp {} $BACKUP_DIR/ \;

# Backup application data
tar -czf $BACKUP_DIR/data_$DATE.tar.gz /opt/highseas/data

# Clean old backups (keep 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR"
```

### Recovery Procedure

```bash
#!/bin/bash
# restore.sh
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Stop services
docker-compose down

# Restore data
tar -xzf $BACKUP_FILE -C /

# Restart services
docker-compose up -d

echo "Recovery completed from: $BACKUP_FILE"
```

## Troubleshooting Deployment Issues

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   sudo lsof -i :6969
   
   # Use different port
   docker run -p 7070:6969 caullen/highseas-streaming:latest
   ```

2. **Permission Denied**
   ```bash
   # Fix Docker permissions
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **GPU Access Issues**
   ```bash
   # Check GPU devices
   ls -la /dev/dri/
   
   # Add user to video group
   sudo usermod -aG video $USER
   ```

4. **Memory Issues**
   ```bash
   # Increase container memory limit
   docker run --memory=4g caullen/highseas-streaming:latest
   ```

### Diagnostic Commands

```bash
# Check container status
docker ps -a

# View container logs
docker logs highseas-streaming --tail 50

# Check container resource usage
docker stats highseas-streaming

# Execute commands in container
docker exec -it highseas-streaming sh

# Check application health
curl http://localhost:6969/api/health
```

This deployment guide provides comprehensive coverage for deploying HighSeas in various environments, from development to enterprise production setups.