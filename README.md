# 🏴‍☠️ HighSeas - Netflix-Style Streaming Interface

A premium Netflix-style streaming interface powered by Stremio addons with Real-Debrid integration, keyboard navigation, and stream proxying for complete IP privacy.

## ✨ Features

- **🎬 Netflix-Style UI**: Professional interface with hero carousel and content rows
- **🎮 Keyboard Navigation**: Full directional navigation through content grids
- **🔒 Stream Proxying**: Hide your IP from streaming services through server proxy
- **🔍 Real-Time Search**: Search across multiple Stremio addon catalogs
- **⚡ Quality Filtering**: Automatically exclude low-quality streams (CAM, SCR, 480p)
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🎯 Real-Debrid Integration**: Premium streaming with high-quality sources

## 🚀 Quick Deploy with Docker

### One-Line Deployment:

```bash
docker run -d --name highseas-streaming -p 6969:6969 --restart unless-stopped caullen/highseas-streaming:latest
```

### Or use the deployment script:

```bash
# Download and run the deployment script
curl -sSL https://raw.githubusercontent.com/CaullenOmdahl/HighSeas/master/deploy.sh | bash
```

**Access the application at: http://localhost:6969**

## 🐳 Docker Deployment Options

### Option 1: Direct Docker Command
```bash
# Pull and run the latest image
docker pull caullen/highseas-streaming:latest
docker run -d \
  --name highseas-streaming \
  -p 6969:6969 \
  --restart unless-stopped \
  --health-cmd="wget --no-verbose --tries=1 --spider http://localhost:6969/api/health || exit 1" \
  --health-interval=30s \
  caullen/highseas-streaming:latest
```

### Option 2: Docker Compose
```bash
# Clone repository and use docker-compose
git clone https://github.com/CaullenOmdahl/HighSeas.git
cd HighSeas
docker-compose up -d
```

### Option 3: Automated Script
```bash
# Download deployment script
wget https://raw.githubusercontent.com/CaullenOmdahl/HighSeas/master/deploy.sh
chmod +x deploy.sh

# Edit the script to set your Docker Hub username
sed -i 's/DOCKERHUB_USER="username"/DOCKERHUB_USER="caullen"/' deploy.sh

# Run deployment
./deploy.sh
```

## 🎮 How to Use

### Navigation
- **Mouse**: Click and hover for Netflix-style interactions
- **Keyboard**: Use arrow keys to navigate content grids
  - `↑/↓` - Navigate between content rows
  - `←/→` - Navigate within current row
  - `Enter` - Select content
  - `Escape` - Exit navigation

### Search
- Use the search icon in the header
- Search across all Stremio addon catalogs
- Results update in real-time

### Streaming
- All streams are proxied through the server
- Your IP remains hidden from Real-Debrid
- High-quality streams are automatically prioritized

## 📊 Container Management

```bash
# Check container status
docker ps --filter name=highseas-streaming

# View logs
docker logs -f highseas-streaming

# Stop container
docker stop highseas-streaming

# Update to latest version
docker pull caullen/highseas-streaming:latest
docker stop highseas-streaming
docker rm highseas-streaming
# Run the deployment command again
```

## 🔧 Configuration

The application uses environment variables for configuration:

```bash
# Custom port (default: 6969)
docker run -d --name highseas-streaming -p 8080:8080 -e PORT=8080 caullen/highseas-streaming:latest

# Custom body size limit
docker run -d --name highseas-streaming -p 6969:6969 -e BODY_SIZE_LIMIT=10mb caullen/highseas-streaming:latest
```

## 🛡️ Privacy & Security

- **IP Masking**: All Real-Debrid requests go through the server IP
- **No User Tracking**: No analytics or user data collection
- **Secure Container**: Runs as non-root user with minimal permissions
- **Quality Control**: Automatic filtering of unsafe/low-quality streams

## 📡 API Endpoints

- `GET /` - Main application
- `GET /api/health` - Health check endpoint
- `GET /api/proxy?url=<stream_url>` - Stream proxy endpoint
- `GET /search` - Search interface

## 🔍 Health Monitoring

```bash
# Check application health
curl http://localhost:6969/api/health

# Example response:
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "service": "HighSeas Streaming",
  "version": "1.0.0",
  "uptime": 3600.5,
  "memory": { "used": 45.2, "total": 67.8 }
}
```

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Check what's using port 6969
sudo lsof -i :6969

# Use different port
docker run -d --name highseas-streaming -p 7070:6969 ghcr.io/caullen/stremio-netflix:latest
```

### Container Won't Start
```bash
# Check logs
docker logs highseas-streaming

# Restart container
docker restart highseas-streaming
```

### No Streams Found
- Check that Real-Debrid token is valid
- Verify network connectivity
- Check browser console for API errors

## 🏗️ Development

To build and run locally:

```bash
# Clone repository
git clone https://github.com/CaullenOmdahl/HighSeas.git
cd HighSeas

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Build Docker image
docker build -t highseas .
```

## Tech Stack

- **Framework**: SvelteKit with Svelte 5
- **Language**: TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **Video Player**: Video.js with custom buffering
- **Icons**: Lucide Svelte
- **Content Source**: Stremio Addons
- **Deployment**: Docker with Node.js

## 📝 License

This project is for educational purposes. Ensure compliance with your local laws and the terms of service of streaming providers.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**🏴‍☠️ Set sail with HighSeas - Premium streaming without the premium prices!**