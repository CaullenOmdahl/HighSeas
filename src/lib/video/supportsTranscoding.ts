/**
 * Supports transcoding detection
 * Based on stremio-video-reference/src/supportsTranscoding.js
 */

import platform from './platform';

function supportsTranscoding(): Promise<boolean> {
    const platformName = platform.get();
    if (['Tizen', 'webOS', 'Titan', 'NetTV'].includes(platformName || '') || typeof (window as any).qt !== 'undefined') {
        return Promise.resolve(false);
    }
    return Promise.resolve(true);
}

export default supportsTranscoding;