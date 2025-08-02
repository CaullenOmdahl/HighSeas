/**
 * Main export for Stremio Video Player
 * Based on stremio-video-reference/src/index.js
 */

import StremioVideo from './StremioVideo/StremioVideo';

// Export default matching reference implementation
export default StremioVideo;

// Additional exports for existing application integration
export { default as StremioVideoPlayer } from './StremioVideoPlayer';
export type { SubtitleTrack } from './withHTMLSubtitles/withHTMLSubtitles';