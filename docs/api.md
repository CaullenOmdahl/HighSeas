# API Reference

This document provides a comprehensive overview of all API endpoints available in the HighSeas streaming application.

## Base URL

All API endpoints are relative to your application's base URL:
```
http://localhost:6969/api
```

## Authentication

Most endpoints do not require authentication. Real-Debrid integration requires a valid `REAL_DEBRID_TOKEN` environment variable.

## Rate Limiting

All endpoints implement rate limiting with the following default limits:
- **Limit**: 100 requests per window
- **Window**: 15 minutes
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Health & Status

### GET `/api/health`

**Description**: Returns application health status and system information.

**Parameters**: None

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-08-02T08:38:55.162Z",
  "service": "HighSeas Development Server",
  "version": "1.1.9",
  "uptime": 3600.5,
  "memory": {
    "used": 58.2,
    "total": 128.0,
    "percentage": 45.5
  },
  "features": {
    "realDebridEnabled": true,
    "hlsTranscodingEnabled": true,
    "gpuAccelerationEnabled": true
  }
}
```

**Status Codes**:
- `200` - Application is healthy
- `503` - Application is unhealthy

## Real-Debrid Integration

### GET `/api/realdebrid`

**Description**: Check Real-Debrid API connection status and user information.

**Parameters**: None

**Response** (Success):
```json
{
  "status": "connected",
  "user": {
    "username": "YourUsername",
    "email": "user@example.com",
    "premium": 4417286,
    "expiration": "2025-09-22T13:40:36.000Z"
  }
}
```

**Response** (Error):
```json
{
  "status": "error",
  "message": "REAL_DEBRID_TOKEN environment variable not set"
}
```

**Status Codes**:
- `200` - Successfully connected to Real-Debrid
- `500` - Connection failed or token missing

### POST `/api/realdebrid`

**Description**: Convert magnet links to direct streaming URLs via Real-Debrid.

**Parameters**:
```json
{
  "magnetLink": "magnet:?xt=urn:btih:..."
}
```

**Response** (Processing):
```json
{
  "streamUrl": "",
  "filename": "Movie.Name.2024.mkv",
  "filesize": 0,
  "status": "processing",
  "message": "Converting magnet link, please wait..."
}
```

**Response** (Ready):
```json
{
  "streamUrl": "https://download.real-debrid.com/d/ABCD1234/Movie.Name.2024.mkv",
  "filename": "Movie.Name.2024.mkv",
  "filesize": 5368709120,
  "status": "ready"
}
```

**Response** (Error):
```json
{
  "streamUrl": "",
  "filename": "",
  "filesize": 0,
  "status": "error",
  "message": "Failed to add magnet to Real-Debrid"
}
```

**Status Codes**:
- `200` - Request processed successfully
- `400` - Invalid magnet link format
- `500` - Real-Debrid API error

## Addon System

### GET `/api/addon/manifest.json`

**Description**: Returns the local Torrentio addon manifest configuration.

**Parameters**: None

**Response**:
```json
{
  "id": "com.stremio.torrentio.addon",
  "version": "0.0.15",
  "name": "Torrentio RD",
  "description": "Provides torrent streams from scraped torrent providers...",
  "catalogs": [
    {
      "id": "torrentio-realdebrid",
      "name": "RealDebrid",
      "type": "other",
      "extra": [{"name": "skip"}]
    }
  ],
  "resources": [
    {
      "name": "stream",
      "types": ["movie", "series", "anime"],
      "idPrefixes": ["tt", "kitsu"]
    }
  ],
  "types": ["movie", "series", "anime", "other"],
  "behaviorHints": {
    "configurable": true,
    "configurationRequired": false
  }
}
```

**Headers**:
- `Content-Type`: `application/json`
- `Access-Control-Allow-Origin`: `*`
- `Cache-Control`: `no-cache`

**Status Codes**:
- `200` - Manifest loaded successfully
- `500` - Failed to load manifest file

### GET `/api/addon/stream/:type/:id.json`

**Description**: Proxy endpoint for fetching streams from Torrentio addon.

**Parameters**:
- `type` (path): Content type (`movie`, `series`, `anime`)
- `id` (path): Content ID (e.g., `tt0111161` for IMDB ID)

**Example**: `/api/addon/stream/movie/tt0111161.json`

**Response**:
```json
{
  "streams": [
    {
      "title": "🏆 Movie.Name.2024.2160p.WEB-DL.x265-GROUP",
      "infoHash": "abcd1234567890abcd1234567890abcd12345678",
      "fileIdx": 0,
      "sources": ["torrentio"],
      "url": "magnet:?xt=urn:btih:...",
      "quality": "4K",
      "size": "5.36 GB",
      "provider": "YTS"
    }
  ]
}
```

**Headers**:
- `Content-Type`: `application/json`
- `Access-Control-Allow-Origin`: `*`
- `Cache-Control`: `public, max-age=3600`

**Status Codes**:
- `200` - Streams fetched successfully
- `404` - No streams found for content
- `500` - Torrentio API error

## HLS Transcoding

### GET `/api/hls/:sessionId/master.m3u8`

**Description**: Generate HLS master playlist for video transcoding.

**Parameters**:
- `sessionId` (path): Unique transcoding session identifier
- `mediaURL` (query): Source video URL (must be from trusted domain)
- `videoCodecs` (query, optional): Video codec preference (`h264`, `h265`)
- `audioCodecs` (query, optional): Audio codec preference (`aac`, `mp3`)
- `format` (query, optional): Container format (`mp4`, `mkv`)

**Example**: `/api/hls/abc123/master.m3u8?mediaURL=https://download.real-debrid.com/...`

**Response** (HLS Playlist):
```
#EXTM3U
#EXT-X-VERSION:6
#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=1920x1080,CODECS="avc1.64001f,mp4a.40.2"
playlist.m3u8?mediaURL=https%3A%2F%2F...
```

**Headers**:
- `Content-Type`: `application/vnd.apple.mpegurl`
- `Access-Control-Allow-Origin`: `*`
- `Cache-Control`: `no-cache`

**Status Codes**:
- `200` - Playlist generated successfully
- `403` - Invalid or untrusted media URL
- `500` - FFmpeg transcoding error

### GET `/api/hls/:sessionId/playlist.m3u8`

**Description**: Generate HLS playlist with video segments.

**Parameters**:
- `sessionId` (path): Transcoding session identifier
- `mediaURL` (query): Source video URL
- Additional transcoding parameters

**Response** (HLS Segment Playlist):
```
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:10.0,
segment_0.ts?mediaURL=...
#EXTINF:10.0,
segment_1.ts?mediaURL=...
```

### GET `/api/hls/:sessionId/segment_:num.ts`

**Description**: Serve transcoded video segments.

**Parameters**:
- `sessionId` (path): Transcoding session identifier
- `num` (path): Segment number
- `mediaURL` (query): Source video URL

**Response**: Binary video segment data

**Headers**:
- `Content-Type`: `video/mp2t`
- `Accept-Ranges`: `bytes`
- `Cache-Control`: `public, max-age=86400`

## Subtitle System

### GET `/api/subtitles`

**Description**: CORS proxy for external subtitle files.

**Parameters**:
- `url` (query): Subtitle file URL

**Example**: `/api/subtitles?url=https://example.com/subtitles.srt`

**Response**: Raw subtitle file content (SRT, WebVTT, etc.)

**Headers**:
- `Content-Type`: `text/plain; charset=utf-8`
- `Access-Control-Allow-Origin`: `*`

**Status Codes**:
- `200` - Subtitle file fetched successfully
- `400` - Missing or invalid URL parameter
- `404` - Subtitle file not found
- `500` - Network or parsing error

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "error": "Error category",
  "message": "Human-readable error description",
  "code": "SPECIFIC_ERROR_CODE",
  "timestamp": "2025-08-02T08:38:55.162Z",
  "details": {
    "additionalInfo": "Optional additional context"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Malformed request parameters |
| `AUTHENTICATION_FAILED` | Real-Debrid token invalid |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `RESOURCE_NOT_FOUND` | Requested content not available |
| `EXTERNAL_SERVICE_ERROR` | Third-party service unavailable |
| `TRANSCODING_FAILED` | Video transcoding error |
| `INVALID_MEDIA_URL` | Untrusted or malformed media URL |

## Security Considerations

### Domain Validation

The following domains are whitelisted for media URLs:
- `real-debrid.com`
- `download.real-debrid.com`
- `*.download.real-debrid.com`

### Request Validation

All requests undergo:
- Input sanitization
- Parameter validation
- Rate limiting
- CORS enforcement
- Security header injection

### Response Headers

All responses include security headers:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Performance Optimizations

### Caching Strategy

- **Static Assets**: 1 year cache
- **API Responses**: 1 hour cache (streams)
- **Health Endpoint**: No cache
- **Manifests**: No cache (development), 1 day cache (production)

### Connection Pooling

HTTP requests use connection pooling with:
- **Keep-Alive**: 30 seconds
- **Max Connections**: 50 per host
- **Timeout**: 15 seconds

### Compression

All text responses are compressed with gzip when supported by the client.

## Usage Examples

### JavaScript/TypeScript

```typescript
// Check application health
const healthResponse = await fetch('/api/health');
const health = await healthResponse.json();

// Convert magnet link
const convertResponse = await fetch('/api/realdebrid', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ magnetLink: 'magnet:?xt=urn:btih:...' })
});
const result = await convertResponse.json();

// Fetch streams for content
const streamsResponse = await fetch('/api/addon/stream/movie/tt0111161.json');
const streams = await streamsResponse.json();
```

### cURL

```bash
# Health check
curl http://localhost:6969/api/health

# Real-Debrid status
curl http://localhost:6969/api/realdebrid

# Convert magnet link
curl -X POST -H "Content-Type: application/json" \
  -d '{"magnetLink":"magnet:?xt=urn:btih:..."}' \
  http://localhost:6969/api/realdebrid

# Get streams
curl http://localhost:6969/api/addon/stream/movie/tt0111161.json
```

## Monitoring & Logging

### Application Logs

Logs are written to `/app/logs/server-YYYY-MM-DD.log` with structured format:

```
[2025-08-02T08:38:55.162Z] INFO  SYSTEM    🚀 HighSeas development server running on http://localhost:6969
[2025-08-02T08:38:55.163Z] INFO  SYSTEM    ✅ Real-Debrid token found in environment
[2025-08-02T08:39:21.425Z] INFO  API       📋 Serving local Torrentio manifest
[2025-08-02T08:39:25.891Z] INFO  API       🎬 Proxying stream request: movie/tt0111161
```

### Log Categories

- `SYSTEM` - Server startup and configuration
- `API` - HTTP request/response logging
- `PLAYER` - Video player events
- `STREAM` - Streaming and transcoding events
- `ADDON` - Stremio addon interactions
- `NETWORK` - External API calls
- `ERROR` - Error conditions and recovery

### Metrics Collection

Available metrics:
- Request count by endpoint
- Response time percentiles
- Error rate by category
- Memory usage trends
- Active streaming sessions
- Cache hit/miss ratios