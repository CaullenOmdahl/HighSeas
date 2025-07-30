# HighSeas Streaming - Docker Deployment

This document explains how to deploy HighSeas using Docker.

## 🐳 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd stremio-netflix

# Start the application
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

The application will be available at: **http://localhost:6969**

### Option 2: Docker Commands

```bash
# Build the image
docker build -t highseas .

# Run the container
docker run -d \
  --name highseas-streaming \
  -p 6969:6969 \
  --restart unless-stopped \
  highseas

# Check logs
docker logs -f highseas-streaming
```

## 🚀 Production Deployment

For production deployment, consider these additional configurations:

### Environment Variables

```yaml
# docker-compose.override.yml
version: '3.8'
services:
  highseas:
    environment:
      - NODE_ENV=production
      - PORT=6969
      - BODY_SIZE_LIMIT=0
      # Add any additional environment variables here
```

### Reverse Proxy (Nginx)

```nginx
# /etc/nginx/sites-available/highseas
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:6969;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Health Monitoring

The application includes a health check endpoint:

```bash
# Check application health
curl http://localhost:6969/api/health

# Response example:
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "service": "HighSeas Streaming",
  "version": "1.0.0",
  "uptime": 3600.5,
  "memory": {
    "used": 45.2,
    "total": 67.8
  }
}
```

## 🔧 Management Commands

```bash
# NPM scripts for Docker management
npm run docker:build    # Build Docker image
npm run docker:run      # Run container
npm run docker:up       # Start with docker-compose
npm run docker:down     # Stop docker-compose

# Manual commands
docker-compose up -d          # Start in background
docker-compose down           # Stop and remove
docker-compose restart        # Restart services
docker-compose pull           # Update images
docker-compose logs -f        # Follow logs
```

## 🛠️ Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs highseas-streaming

# Check container status
docker ps -a

# Rebuild image
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Port Already in Use
```bash
# Check what's using port 6969
sudo lsof -i :6969
sudo netstat -tulpn | grep 6969

# Change port in docker-compose.yml
ports:
  - "7070:6969"  # Use port 7070 instead
```

### Memory Issues
```bash
# Check container resources
docker stats highseas-streaming

# Increase memory limits in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2G
```

## 🔐 Security Considerations

1. **Firewall**: Only expose port 6969 if needed externally
2. **Updates**: Regularly update the container image
3. **Logs**: Monitor logs for suspicious activity
4. **Network**: Use Docker networks for isolation
5. **User**: Container runs as non-root user by default

## 📈 Performance Tuning

### Resource Limits
```yaml
# docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

### Logging Configuration
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 🌐 Access Points

- **Main Application**: http://localhost:6969
- **Health Check**: http://localhost:6969/api/health
- **Stream Proxy**: http://localhost:6969/api/proxy

## 📝 Notes

- The container uses Node.js 18 Alpine for smaller size
- Includes proper signal handling with dumb-init
- Health checks are configured for monitoring
- Stream proxy works through the container
- All Real-Debrid traffic is routed through the server IP