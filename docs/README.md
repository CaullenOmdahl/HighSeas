# HighSeas Documentation

Welcome to the comprehensive documentation for HighSeas, a Netflix-style streaming interface for Stremio addons with Real-Debrid integration.

## 📚 Documentation Index

### Core Documentation

- **[API Reference](api.md)** - Complete API endpoint documentation
  - Health & status endpoints
  - Real-Debrid integration APIs  
  - HLS transcoding endpoints
  - Subtitle proxy system
  - Error handling & responses

- **[Architecture Guide](architecture.md)** - System design and components
  - Frontend architecture (React + TypeScript)
  - Backend architecture (Express.js)
  - Video player system design
  - Service layer architecture
  - Security & performance architecture

- **[Video Player System](video-player.md)** - Stremio player implementation
  - StremioVideoSystem core engine
  - HLS transcoding pipeline
  - Subtitle system
  - Enhanced retry mechanism
  - Performance optimizations

### Setup & Deployment

- **[Deployment Guide](deployment.md)** - Production deployment instructions
  - Docker deployment options
  - Production configuration
  - CasaOS integration
  - Security considerations
  - Scaling & performance tuning

- **[Development Guide](development.md)** - Local development setup
  - Development environment setup
  - Project structure overview
  - Coding standards & guidelines
  - Testing procedures
  - Debugging techniques

### Support & Maintenance

- **[Troubleshooting Guide](troubleshooting.md)** - Common issues and solutions
  - Quick diagnostics
  - Video player troubleshooting
  - Real-Debrid integration issues
  - Docker & container problems
  - Performance optimization

## 🚀 Quick Start

### For Users
1. **Docker Deployment**: See [Deployment Guide](deployment.md#quick-start)
2. **Configuration**: Review [Environment Configuration](deployment.md#environment-configuration)
3. **Troubleshooting**: Check [Common Issues](troubleshooting.md#common-issues)

### For Developers
1. **Setup**: Follow [Development Setup](development.md#development-setup)
2. **Architecture**: Review [System Overview](architecture.md#system-overview)
3. **Contributing**: See [Contributing Guidelines](development.md#contributing)

## 🎯 Key Features Documented

### Streaming Infrastructure
- **Enhanced Retry System** - 6-attempt retry with exponential backoff for Real-Debrid links
- **HLS Transcoding** - Automatic MKV file conversion using FFmpeg with GPU acceleration
- **Local Manifest System** - Uses local Torrentio configuration instead of external fetching
- **Advanced Subtitles** - SRT/WebVTT parsing with real-time rendering and CORS proxy

### Technical Excellence
- **Enterprise Security** - Input validation, rate limiting, domain whitelisting
- **Performance Optimized** - Bundle splitting, lazy loading, memory management
- **Mobile Optimized** - Touch controls, responsive design, PWA support
- **Production Ready** - Docker containerization, health monitoring, structured logging

## 🔧 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                           Client Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Ionic Components + Service Workers    │
│  • Netflix-style UI components                                 │
│  • Stremio Video Player System                                 │
│  • Mobile-optimized touch controls                             │
│  • Progressive Web App (PWA) features                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP/WebSocket
┌─────────────────────┴───────────────────────────────────────────┐
│                        API Gateway                             │
├─────────────────────────────────────────────────────────────────┤
│  Express.js Server with Middleware Stack                       │
│  • CORS handling & rate limiting                               │
│  • Security headers & input validation                         │
│  • Request/response logging                                    │
│  • Error handling & health monitoring                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼────┐  ┌────────▼────────┐  ┌─────▼─────┐
│  Real  │  │ HLS Transcoding │  │   Local   │
│ Debrid │  │    Service      │  │ Manifest  │
│   API  │  │   (FFmpeg)      │  │  System   │
└────────┘  └─────────────────┘  └───────────┘
```

## 📖 Documentation Standards

### Writing Guidelines
- **Clear Structure** - Use consistent headings and organization
- **Code Examples** - Include practical, working examples
- **Error Scenarios** - Document common problems and solutions
- **Cross-References** - Link to related documentation sections

### Maintenance
- **Keep Updated** - Documentation reflects current codebase
- **Version Control** - Track changes with meaningful commit messages
- **User Feedback** - Incorporate feedback from users and contributors

## 🤝 Contributing to Documentation

### Improving Documentation
1. **Identify Gaps** - Areas needing better documentation
2. **Submit Updates** - Create pull requests with improvements
3. **Review Process** - Follow code review guidelines
4. **Testing** - Verify examples and procedures work correctly

### Documentation Issues
- **Report Problems** - File issues for outdated or incorrect documentation
- **Suggest Improvements** - Propose new sections or reorganization
- **Community Input** - Share experiences and solutions

## 📋 Documentation Checklist

Before releasing new features, ensure documentation includes:

- [ ] **API Changes** - Updated [API Reference](api.md)
- [ ] **Architecture Updates** - Modified [Architecture Guide](architecture.md)
- [ ] **Deployment Changes** - Updated [Deployment Guide](deployment.md)
- [ ] **New Troubleshooting** - Added to [Troubleshooting Guide](troubleshooting.md)
- [ ] **Development Impact** - Updated [Development Guide](development.md)

## 🔗 External Resources

### Real-Debrid
- [Real-Debrid API Documentation](https://api.real-debrid.com/)
- [Account Management](https://real-debrid.com/account)
- [API Token Generation](https://real-debrid.com/apitoken)

### Stremio
- [Stremio Addon SDK](https://github.com/Stremio/stremio-addon-sdk)
- [Video Player Documentation](https://github.com/Stremio/stremio-video)
- [Addon Development Guide](https://stremio.github.io/stremio-addon-guide/)

### Technologies
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [Docker Documentation](https://docs.docker.com/)
- [Vite Build Tool](https://vitejs.dev/guide/)

## 📞 Support

### Getting Help
- **GitHub Issues** - Report bugs and feature requests
- **GitHub Discussions** - Community support and questions
- **Documentation Issues** - Improvements and corrections

### Community
- **Contributions Welcome** - See [Contributing Guidelines](development.md#contributing)
- **Code of Conduct** - Maintain respectful and inclusive environment
- **License** - MIT License for open source collaboration

---

**📋 Last Updated**: August 2025  
**🎯 Version**: 1.1.9  
**👥 Maintainers**: HighSeas Development Team