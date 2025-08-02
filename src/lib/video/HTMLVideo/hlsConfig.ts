/**
 * HLS.js configuration optimized for Stremio streaming
 * Based on Stremio's proven HLS configuration for robust streaming
 */
export default {
  // Buffer management
  backBufferLength: 30,          // Keep 30 seconds of back buffer
  maxBufferLength: 50,           // Buffer up to 50 seconds ahead
  maxMaxBufferLength: 80,        // Maximum buffer length in seconds
  
  // Error recovery
  appendErrorMaxRetry: 20,       // High retry count for robustness
  nudgeMaxRetry: 20,             // Max retries for nudge operations
  
  // Timeouts
  manifestLoadingTimeOut: 30000, // 30 second timeout for manifest loading
  
  // Fragment loading policy - aggressive for better streaming
  fragLoadPolicy: {
    default: {
      maxTimeToFirstByteMs: 10000,  // 10 seconds max to first byte
      maxLoadTimeMs: 120000,        // 2 minutes max load time
      maxNumRetry: 20,              // 20 retries for fragment loading
      timeoutRetry: {
        maxNumRetry: 2,
        retryDelayMs: 0,
        maxRetryDelayMs: 0
      },
      errorRetry: {
        maxNumRetry: 1,
        retryDelayMs: 1000,
        maxRetryDelayMs: 8000
      }
    }
  },
  
  // Playback quality
  startLevel: -1,                // Auto-select start quality
  capLevelToPlayerSize: true,    // Cap quality to player size
  
  // HEVC/H.265 specific optimizations
  enableWorker: true,            // Use web workers for better performance
  lowLatencyMode: false,         // Standard latency for VOD content
  
  // Debugging (disable in production)
  debug: false,
  
  // Advanced options for better compatibility
  liveSyncDurationCount: 3,      // For live streams
  liveMaxLatencyDurationCount: 10,
  
  // Network optimizations
  maxFragLookUpTolerance: 0.25,  // Tolerance for fragment lookup
  manifestLoadingMaxRetry: 3,    // Manifest loading retries
  
  // Audio/Video synchronization
  abrEwmaDefaultEstimate: 500000, // Conservative bandwidth estimate
  abrBandWidthFactor: 0.95,       // Bandwidth factor for ABR
  abrBandWidthUpFactor: 0.7,      // Bandwidth up factor
  
  // fMP4 container support (crucial for HEVC)
  forceKeyFrameOnDiscontinuity: true,
  
  // Error handling
  errorController: undefined,     // Use default error controller
  
  // Experimental HEVC support options
  enableSoftwareAES: true,        // Enable software AES decryption
  enableCEA708Captions: true,     // Enable CEA-708 captions
  
  // Performance optimizations
  progressive: false,             // Disable progressive mode for streaming
  enableDateRangeMetadataCues: false, // Disable for performance
  
  // CORS and security
  xhrSetup: undefined,            // Custom XHR setup if needed
  
  // Video element configuration
  autoStartLoad: true,            // Auto start loading
  startFragPrefetch: true,        // Prefetch start fragment
  
  // Quality switching
  maxStarvationDelay: 4,          // Max starvation delay in seconds
  maxLoadingDelay: 4,             // Max loading delay
  
  // Buffer state thresholds  
  highBufferWatchdogPeriod: 2,    // High buffer watchdog period
  nudgeOffset: 0.1,               // Nudge offset for seeking
  
  // Fragment retry logic
  fragLoadingMaxRetry: 6,         // Fragment loading max retries
  fragLoadingMaxRetryTimeout: 64000, // Fragment loading timeout
  
  // Level loading
  levelLoadingMaxRetry: 4,        // Level loading max retries
  levelLoadingMaxRetryTimeout: 64000, // Level loading timeout
  
  // Manifest loading
  manifestLoadingMaxRetryTimeout: 64000, // Manifest loading timeout
  
  // Key loading
  keyLoadingMaxRetry: 6,          // Key loading max retries
  keyLoadingMaxRetryTimeout: 64000, // Key loading timeout
  
  // Subtitle loading
  subtitleTrackController: undefined, // Use default subtitle controller
  cueHandler: undefined,          // Custom cue handler
  
  // Advanced streaming options
  liveDurationInfinity: false,    // Don't use infinity for live duration
  liveBackBufferLength: 30,       // Live back buffer length
  
  // Bandwidth measurement
  abrEwmaFastLive: 3.0,          // Fast EWM for live
  abrEwmaSlowLive: 9.0,          // Slow EWM for live
  abrEwmaFastVoD: 3.0,           // Fast EWM for VoD
  abrEwmaSlowVoD: 9.0,           // Slow EWM for VoD
  
  // Maximum bandwidth allowed
  maxBandwidth: undefined,        // No bandwidth limit
  maxSizeKb: undefined,           // No size limit
};