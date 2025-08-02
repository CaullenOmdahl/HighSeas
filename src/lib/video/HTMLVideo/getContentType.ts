import { VideoStream } from './HTMLVideo';

/**
 * Get content type for a video stream
 * Based on Stremio's getContentType implementation
 */
export default function getContentType(stream: VideoStream): Promise<string> {
  if (!stream || typeof stream.url !== 'string') {
    return Promise.reject(new Error('Invalid stream parameter!'));
  }

  // Check for proxy headers first (if stream provides content-type hint)
  if (stream.behaviorHints?.proxyHeaders?.response?.['content-type']) {
    return Promise.resolve(stream.behaviorHints.proxyHeaders.response['content-type']);
  }

  // Make HEAD request to determine content type
  return fetch(stream.url, { method: 'HEAD' })
    .then(function(response) {
      if (response.ok) {
        return response.headers.get('content-type') || 'video/mp4';
      }
      throw new Error(`${response.status} (${response.statusText})`);
    })
    .catch(function(error) {
      // Fallback: guess from URL extension
      const url = stream.url!;
      if (url.includes('.m3u8')) {
        return 'application/x-mpegURL';
      } else if (url.includes('.mp4')) {
        return 'video/mp4';
      } else if (url.includes('.webm')) {
        return 'video/webm';
      } else if (url.includes('.mkv')) {
        return 'video/x-matroska';
      }
      
      // Default fallback
      return 'video/mp4';
    });
}