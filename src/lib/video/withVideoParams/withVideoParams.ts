import EventEmitter from 'eventemitter3';
import cloneDeep from 'lodash.clonedeep';
import deepFreeze from 'deep-freeze';

export interface VideoParamsOptions {
  containerElement: HTMLElement;
  streamingServerURL?: string;
  streamingServerSettings?: any;
}

/**
 * withVideoParams - Higher-Order Component for video parameter handling
 * 
 * This HOC adds video parameter processing capabilities:
 * - Stream URL processing and validation
 * - Metadata extraction and handling
 * - Video format detection and optimization
 * - Parameter normalization
 */
export default function withVideoParams(Video: any) {
  class VideoWithVideoParams extends EventEmitter {
    private video: any;
    private destroyed = false;
    private observedProps: Record<string, boolean> = {};
    
    // Stream parameters
    private streamURL: string | null = null;
    private streamFormat: string | null = null;
    private streamMetadata: any = null;

    constructor(options: VideoParamsOptions) {
      super();

      if (!(options.containerElement instanceof HTMLElement)) {
        throw new Error('Container element required to be instance of HTMLElement');
      }

      // Create base video implementation
      this.video = new Video(options);
      this.setupEventForwarding();
    }

    /**
     * Set up event forwarding from base video
     */
    private setupEventForwarding() {
      this.video.on('error', (error: any) => {
        this.emit('error', error);
      });

      this.video.on('propValue', (propName: string, propValue: any) => {
        this.emit('propValue', propName, this.getProp(propName, propValue));
      });

      this.video.on('propChanged', (propName: string, propValue: any) => {
        this.emit('propChanged', propName, this.getProp(propName, propValue));
      });

      // Forward other events
      if (Video.manifest && Video.manifest.events) {
        Video.manifest.events
          .filter((eventName: string) => !['error', 'propValue', 'propChanged'].includes(eventName))
          .forEach((eventName: string) => {
            this.video.on(eventName, (...args: any[]) => {
              this.emit(eventName, ...args);
            });
          });
      }
    }

    /**
     * Process and enhance stream parameters
     */
    private processStreamParams(stream: any): any {
      if (!stream) return stream;

      const processedStream = { ...stream };

      // Extract and validate URL
      if (processedStream.url) {
        this.streamURL = processedStream.url;
        this.streamFormat = this.detectStreamFormat(processedStream.url);
        
        // Add format hints if not present
        if (this.streamFormat && !processedStream.behaviorHints) {
          processedStream.behaviorHints = {};
        }
        
        if (this.streamFormat === 'hls' && processedStream.behaviorHints) {
          processedStream.behaviorHints.forceTranscoding = false;
          processedStream.behaviorHints.hlsOptimized = true;
        }
      }

      // Process video metadata
      this.streamMetadata = this.extractStreamMetadata(processedStream);

      // Add quality hints based on stream analysis
      this.addQualityHints(processedStream);

      // Optimize for specific formats
      this.optimizeForFormat(processedStream);

      return processedStream;
    }

    /**
     * Detect stream format from URL
     */
    private detectStreamFormat(url: string): string | null {
      if (!url) return null;

      const urlLower = url.toLowerCase();
      
      if (urlLower.includes('.m3u8')) {
        return 'hls';
      } else if (urlLower.includes('.mpd')) {
        return 'dash';
      } else if (urlLower.includes('.mp4')) {
        return 'mp4';
      } else if (urlLower.includes('.webm')) {
        return 'webm';
      } else if (urlLower.includes('.mkv')) {
        return 'mkv';
      } else if (urlLower.includes('.avi')) {
        return 'avi';
      } else if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
        return 'youtube';
      } else if (urlLower.startsWith('magnet:')) {
        return 'magnet';
      }

      return 'unknown';
    }

    /**
     * Extract metadata from stream object
     */
    private extractStreamMetadata(stream: any): any {
      const metadata: any = {
        title: stream.title || null,
        description: stream.description || null,
        duration: stream.duration || null,
        thumbnail: stream.thumbnail || null,
        quality: stream.quality || null,
        codec: stream.codec || null,
        bitrate: stream.bitrate || null,
        resolution: stream.resolution || null,
        fps: stream.fps || null,
        audioCodec: stream.audioCodec || null,
        subtitles: stream.subtitles || []
      };

      // Extract quality from URL or title
      if (!metadata.quality) {
        metadata.quality = this.extractQualityFromString(stream.url || stream.title || '');
      }

      // Extract resolution from metadata
      if (!metadata.resolution && metadata.quality) {
        metadata.resolution = this.qualityToResolution(metadata.quality);
      }

      return metadata;
    }

    /**
     * Extract quality information from string
     */
    private extractQualityFromString(str: string): string | null {
      if (!str) return null;

      const qualityPatterns = [
        /\b2160p?\b/i,   // 4K
        /\b1440p?\b/i,   // 1440p
        /\b1080p?\b/i,   // 1080p
        /\b720p?\b/i,    // 720p
        /\b480p?\b/i,    // 480p
        /\b360p?\b/i,    // 360p
        /\b240p?\b/i,    // 240p
        /\b4k\b/i,       // 4K alternative
        /\bhd\b/i,       // HD
        /\bsd\b/i        // SD
      ];

      for (const pattern of qualityPatterns) {
        const match = str.match(pattern);
        if (match) {
          return match[0].toLowerCase().replace('p', '');
        }
      }

      return null;
    }

    /**
     * Convert quality to resolution
     */
    private qualityToResolution(quality: string): string | null {
      const qualityMap: Record<string, string> = {
        '2160': '3840x2160',
        '1440': '2560x1440', 
        '1080': '1920x1080',
        '720': '1280x720',
        '480': '854x480',
        '360': '640x360',
        '240': '426x240',
        '4k': '3840x2160',
        'hd': '1280x720',
        'sd': '854x480'
      };

      return qualityMap[quality.toLowerCase()] || null;
    }

    /**
     * Add quality hints to stream
     */
    private addQualityHints(stream: any) {
      if (!stream.behaviorHints) {
        stream.behaviorHints = {};
      }

      // Add bandwidth hints based on quality
      if (this.streamMetadata?.quality) {
        const quality = this.streamMetadata.quality;
        stream.behaviorHints.expectedBandwidth = this.estimateBandwidth(quality);
      }

      // Add HEVC detection
      if (stream.url && (stream.url.includes('hevc') || stream.url.includes('h265'))) {
        stream.behaviorHints.videoCodec = 'hevc';
        stream.behaviorHints.requiresTranscoding = !this.supportsHEVC();
      }
    }

    /**
     * Estimate bandwidth requirements
     */
    private estimateBandwidth(quality: string): number {
      const bandwidthMap: Record<string, number> = {
        '2160': 25000000,  // 25 Mbps for 4K
        '1440': 16000000,  // 16 Mbps for 1440p
        '1080': 8000000,   // 8 Mbps for 1080p
        '720': 5000000,    // 5 Mbps for 720p
        '480': 2500000,    // 2.5 Mbps for 480p
        '360': 1000000,    // 1 Mbps for 360p
        '240': 500000,     // 0.5 Mbps for 240p
      };

      return bandwidthMap[quality.toLowerCase()] || 5000000;
    }

    /**
     * Check HEVC support
     */
    private supportsHEVC(): boolean {
      if (typeof window === 'undefined') return false;
      
      const video = document.createElement('video');
      return video.canPlayType('video/mp4; codecs="hev1.1.6.L93.B0"') !== '' ||
             video.canPlayType('video/mp4; codecs="hvc1.1.6.L93.B0"') !== '';
    }

    /**
     * Optimize stream for specific formats
     */
    private optimizeForFormat(stream: any) {
      if (!this.streamFormat) return;

      switch (this.streamFormat) {
        case 'hls':
          this.optimizeForHLS(stream);
          break;
        case 'mp4':
          this.optimizeForMP4(stream);
          break;
        case 'mkv':
          this.optimizeForMKV(stream);
          break;
      }
    }

    /**
     * Optimize for HLS streams
     */
    private optimizeForHLS(stream: any) {
      if (!stream.behaviorHints) stream.behaviorHints = {};
      
      stream.behaviorHints.hlsOptimizations = {
        enableLowLatency: false,
        preferNativeHLS: this.preferNativeHLS(),
        segmentPrefetch: true,
        adaptiveBitrate: true
      };
    }

    /**
     * Optimize for MP4 streams
     */
    private optimizeForMP4(stream: any) {
      if (!stream.behaviorHints) stream.behaviorHints = {};
      
      stream.behaviorHints.mp4Optimizations = {
        enableRangeRequests: true,
        preferProgressiveDownload: false,
        enableFastStart: true
      };
    }

    /**
     * Optimize for MKV streams
     */
    private optimizeForMKV(stream: any) {
      if (!stream.behaviorHints) stream.behaviorHints = {};
      
      stream.behaviorHints.mkvOptimizations = {
        requiresTranscoding: true,
        preferredTranscodingFormat: 'hls',
        preserveAudioTracks: true,
        preserveSubtitles: true
      };
    }

    /**
     * Check if native HLS is preferred
     */
    private preferNativeHLS(): boolean {
      // Safari supports native HLS
      return /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
    }

    /**
     * Get property value with parameter enhancements
     */
    private getProp(propName: string, videoPropValue?: any): any {
      switch (propName) {
        case 'streamURL':
          return this.destroyed ? null : this.streamURL;
        case 'streamFormat':
          return this.destroyed ? null : this.streamFormat;
        case 'streamMetadata':
          return this.destroyed ? null : this.streamMetadata;
        default:
          return videoPropValue;
      }
    }

    /**
     * Handle dispatched actions
     */
    public dispatch(action: any) {
      if (this.destroyed || !action) return;

      const frozenAction = deepFreeze(cloneDeep(action));

      switch (frozenAction.type) {
        case 'observeProp':
          if (this.observeProp(frozenAction.propName)) {
            return;
          }
          break;
        case 'command':
          if (frozenAction.commandName === 'load') {
            this.handleLoadCommand(frozenAction.commandArgs);
            return;
          }
          break;
      }

      // Forward to base video
      this.video.dispatch(frozenAction);
    }

    /**
     * Observe property
     */
    private observeProp(propName: string): boolean {
      const videoParamProps = ['streamURL', 'streamFormat', 'streamMetadata'];
      
      if (videoParamProps.includes(propName)) {
        this.emit('propValue', propName, this.getProp(propName));
        this.observedProps[propName] = true;
        return true;
      }

      return false;
    }

    /**
     * Handle load command with parameter processing
     */
    private handleLoadCommand(commandArgs: any) {
      if (commandArgs?.stream) {
        const processedStream = this.processStreamParams(commandArgs.stream);
        
        // Update observed properties
        Object.keys(this.observedProps).forEach(propName => {
          if (this.observedProps[propName]) {
            this.emit('propChanged', propName, this.getProp(propName));
          }
        });

        // Forward to base video with processed stream
        this.video.dispatch({
          type: 'command',
          commandName: 'load',
          commandArgs: {
            ...commandArgs,
            stream: processedStream
          }
        });
      } else {
        // Forward unchanged
        this.video.dispatch({
          type: 'command',
          commandName: 'load',
          commandArgs
        });
      }
    }

    /**
     * Destroy the component
     */
    private destroy() {
      if (this.destroyed) return;
      this.destroyed = true;

      if (this.video) {
        this.video.dispatch({ type: 'command', commandName: 'destroy' });
      }

      this.removeAllListeners();
    }

    /**
     * Check if this implementation can play a stream
     */
    public static canPlayStream(stream: any): boolean {
      return Video.canPlayStream(stream);
    }

    /**
     * Enhanced manifest with video parameter capabilities
     */
    public static manifest = {
      name: Video.manifest.name + 'WithVideoParams',
      external: Video.manifest.external,
      props: Video.manifest.props.concat(['streamURL', 'streamFormat', 'streamMetadata'])
        .filter((value: string, index: number, array: string[]) => array.indexOf(value) === index),
      commands: Video.manifest.commands,
      events: Video.manifest.events.concat(['streamParametersProcessed'])
        .filter((value: string, index: number, array: string[]) => array.indexOf(value) === index)
    };
  }

  return VideoWithVideoParams;
}