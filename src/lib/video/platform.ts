/**
 * Platform management for Stremio video system
 * Based on stremio-video-reference/src/platform.js
 */

let platform: string | null = null;

export default {
    set: (val: string | null) => { 
        platform = val; 
    },
    get: () => platform
};