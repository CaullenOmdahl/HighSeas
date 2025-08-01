# Stremio Video Player Integration

This directory contains a complete implementation of Stremio's video player architecture, adapted for our HighSeas React application.

## Components

### StremioVideoSystem.ts
Complete TypeScript implementation of Stremio's video player with:
- **HTML5 Video** with HLS.js support for adaptive streaming
- **Advanced Subtitle System** with SRT parsing and real-time rendering
- **Customizable Subtitle Styling** (size, color, position, opacity, outline)
- **Audio Track Management** via HLS streams
- **Event-Driven Architecture** compatible with Stremio's patterns
- **Platform Abstraction** ready for multiple implementations

### StremioVideoPlayer.tsx
React wrapper component that provides:
- **React Hooks Integration** for seamless state management
- **Prop-based Control** of all video properties
- **Event Forwarding** to parent components
- **Ref-based Imperative API** for advanced control

### StremioPlayer.tsx
Enhanced player component featuring:
- **Full Stremio Compatibility** using the video system
- **Advanced Controls** (play/pause, seek, volume, speed)
- **Subtitle Management** with track selection and styling
- **HLS Streaming Support** with fallback strategies
- **Mobile-Optimized UI** with touch controls
- **Real-Debrid Integration** for magnet link processing

## Features Implemented

✅ **Core Video Playback**
- HTML5 video with cross-browser compatibility
- HLS.js integration for adaptive streaming
- Error handling and fallback strategies
- Buffering management and seeking

✅ **Advanced Subtitles**
- SRT subtitle parsing and rendering
- Real-time subtitle display synchronized with video
- Customizable styling (size, color, background, outline, opacity)
- Position offset and timing delay controls
- Multiple subtitle track support

✅ **Audio Management**
- Multiple audio track detection via HLS
- Audio track selection and switching
- Volume and mute controls

✅ **Player Controls**
- Play/pause, seeking, volume control
- Playback speed adjustment (0.5x to 2x)
- Fullscreen support
- Mobile-optimized touch controls

✅ **Stremio Architecture Compatibility**
- Event-driven property observation system
- Action dispatch pattern for commands
- Platform abstraction for future extensions
- Memory management and cleanup

## Usage

```tsx
import StremioPlayer from './routes/StremioPlayer';

// In your App routing:
<Route path="/watch/:id" element={<StremioPlayer />} />
```

The player automatically handles:
- Stream URL processing (HTTP, HLS, magnet links via Real-Debrid)
- Subtitle loading and rendering
- Quality selection and adaptive streaming
- Mobile and desktop optimization

## Integration with HighSeas

The Stremio video player integrates seamlessly with:
- **MetaDetails**: Stream selection and quality choice
- **Real-Debrid API**: Magnet link conversion to direct streams
- **Stremio Addons**: Compatible with Cinemeta and Torrentio
- **Mobile App**: Touch controls and Android TV optimization

## Stremio Compatibility

This implementation maintains full compatibility with Stremio's standards:
- Uses identical property names and event structures
- Supports the same subtitle formats and styling options
- Compatible with Stremio's addon ecosystem
- Follows Stremio's architectural patterns for extensibility

## Performance Features

- **Lazy Loading**: Video elements created only when needed
- **Memory Management**: Proper cleanup of HLS instances and DOM elements
- **Event Optimization**: Property observation pattern reduces unnecessary updates
- **Mobile Optimization**: Touch-friendly controls and responsive design

This represents a production-ready video player with enterprise-grade features, fully adapted from Stremio's proven architecture.