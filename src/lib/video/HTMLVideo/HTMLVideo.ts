import EventEmitter from 'eventemitter3';
import deepFreeze from 'deep-freeze';
import cloneDeep from 'lodash.clonedeep';
import { ERROR } from '../error';
import getContentType from './getContentType';
import hlsConfig from './hlsConfig';

// Import Stremio's custom HLS.js build
import Hls from 'hls.js';

export interface HTMLVideoOptions {
  containerElement: HTMLElement;
}

export interface VideoStream {
  url?: string;
  infoHash?: string;
  fileIdx?: number;
  behaviorHints?: {
    proxyHeaders?: {
      request?: Record<string, string>;
      response?: Record<string, string>;
    };
  };
}

/**
 * HTMLVideo - Core web browser video implementation
 * 
 * Based on Stremio's HTMLVideo implementation with:
 * - Custom HLS.js build with HEVC patches
 * - Comprehensive event handling
 * - HEVC/H.265 support via fMP4 containers
 * - Advanced buffering and seeking
 */
export default class HTMLVideo extends EventEmitter {
  private containerElement: HTMLElement;
  private videoElement: HTMLVideoElement | null = null;
  private hls: any = null;
  private destroyed = false;
  private observedProps: Record<string, boolean> = {};
  
  // Video state
  private currentTime = 0;
  private duration = 0;
  private paused = true;
  private volume = 1;
  private muted = false;
  private buffering = false;

  constructor(options: HTMLVideoOptions) {
    super();

    if (!(options.containerElement instanceof HTMLElement)) {
      throw new Error('Container element required to be instance of HTMLElement');
    }

    this.containerElement = options.containerElement;
    this.createVideoElement();
  }

  /**
   * Create and configure the HTML5 video element
   */
  private createVideoElement() {
    this.videoElement = document.createElement('video');
    this.videoElement.style.width = '100%';
    this.videoElement.style.height = '100%';
    this.videoElement.style.objectFit = 'contain';
    this.videoElement.preload = 'metadata';
    this.videoElement.playsInline = true;

    // Add video element to container
    this.containerElement.appendChild(this.videoElement);

    // Set up event listeners
    this.setupVideoEventListeners();
  }

  /**
   * Set up comprehensive event listeners for the video element
   */
  private setupVideoEventListeners() {
    if (!this.videoElement) return;

    // Playback events
    this.videoElement.addEventListener('loadstart', () => this.emit('loadstart'));
    this.videoElement.addEventListener('loadedmetadata', () => {
      this.duration = this.videoElement?.duration || 0;
      this.emit('loadedmetadata');
      this.emitPropValue('duration', this.duration);
    });
    this.videoElement.addEventListener('loadeddata', () => this.emit('loadeddata'));
    this.videoElement.addEventListener('canplay', () => this.emit('canplay'));
    this.videoElement.addEventListener('canplaythrough', () => this.emit('canplaythrough'));

    // Time and progress events
    this.videoElement.addEventListener('timeupdate', () => {
      this.currentTime = this.videoElement?.currentTime || 0;
      this.emitPropValue('time', this.currentTime);
      this.emit('timeupdate');
    });
    this.videoElement.addEventListener('progress', () => this.emit('progress'));
    this.videoElement.addEventListener('seeking', () => this.emit('seeking'));
    this.videoElement.addEventListener('seeked', () => this.emit('seeked'));

    // Playback state events
    this.videoElement.addEventListener('play', () => {
      this.paused = false;
      this.emitPropValue('paused', this.paused);
      this.emit('play');
    });
    this.videoElement.addEventListener('pause', () => {
      this.paused = true;
      this.emitPropValue('paused', this.paused);
      this.emit('pause');
    });
    this.videoElement.addEventListener('ended', () => this.emit('ended'));
    this.videoElement.addEventListener('waiting', () => {
      this.buffering = true;
      this.emitPropValue('buffering', this.buffering);
      this.emit('waiting');
    });
    this.videoElement.addEventListener('playing', () => {
      this.buffering = false;
      this.emitPropValue('buffering', this.buffering);
      this.emit('playing');
    });

    // Volume events
    this.videoElement.addEventListener('volumechange', () => {
      this.volume = this.videoElement?.volume || 0;
      this.muted = this.videoElement?.muted || false;
      this.emitPropValue('volume', this.volume);
      this.emitPropValue('muted', this.muted);
      this.emit('volumechange');
    });

    // Error handling
    this.videoElement.addEventListener('error', (event) => {
      const error = this.videoElement?.error;
      this.handleVideoError(error);
    });

    // Resize events
    this.videoElement.addEventListener('resize', () => this.emit('resize'));
  }

  /**
   * Handle video element errors
   */
  private handleVideoError(error: MediaError | null) {
    if (!error) return;

    let stremioError;
    switch (error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        stremioError = { ...ERROR.HTML_VIDEO.LOAD_FAILED, message: 'Media loading aborted' };
        break;
      case MediaError.MEDIA_ERR_NETWORK:
        stremioError = { ...ERROR.HTML_VIDEO.LOAD_FAILED, message: 'Network error loading media' };
        break;
      case MediaError.MEDIA_ERR_DECODE:
        stremioError = { ...ERROR.HTML_VIDEO.LOAD_FAILED, message: 'Media decode error' };
        break;
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        stremioError = { ...ERROR.HTML_VIDEO.LOAD_FAILED, message: 'Media format not supported' };
        break;
      default:
        stremioError = ERROR.GENERAL.UNKNOWN;
    }

    this.emit('error', { ...stremioError, originalError: error });
  }

  /**
   * Load a video stream
   */
  private async loadStream(stream: VideoStream) {
    if (!this.videoElement || !stream.url) {
      throw new Error('No video element or stream URL');
    }

    try {
      // Determine content type
      const contentType = await getContentType(stream);

      // Check if this is an HLS stream
      if (this.isHLSStream(contentType, stream.url)) {
        await this.loadHLSStream(stream);
      } else {
        // Direct video loading
        this.videoElement.src = stream.url;
      }
    } catch (error) {
      this.emit('error', {
        ...ERROR.HTML_VIDEO.LOAD_FAILED,
        error,
        critical: true
      });
    }
  }

  /**
   * Check if the stream is HLS
   */
  private isHLSStream(contentType: string, url: string): boolean {
    return contentType.includes('application/x-mpegURL') || 
           contentType.includes('application/vnd.apple.mpegurl') ||
           url.includes('.m3u8');
  }

  /**
   * Load HLS stream using Stremio's custom HLS.js build
   */
  private async loadHLSStream(stream: VideoStream) {
    if (!this.videoElement || !stream.url) return;

    // Clean up existing HLS instance
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    if (Hls.isSupported()) {
      // Use HLS.js with Stremio's configuration
      this.hls = new Hls(hlsConfig);
      
      // Set up HLS event listeners
      this.setupHLSEventListeners();
      
      // Attach to video element and load source
      this.hls.attachMedia(this.videoElement);
      this.hls.loadSource(stream.url);
    } else if (this.videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      this.videoElement.src = stream.url;
    } else {
      throw new Error('HLS not supported');
    }
  }

  /**
   * Set up HLS.js event listeners
   */
  private setupHLSEventListeners() {
    if (!this.hls) return;

    this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      console.log('HLS: Media attached');
    });

    this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log('HLS: Manifest parsed');
    });

    this.hls.on(Hls.Events.ERROR, (event: any, data: any) => {
      console.error('HLS Error:', data);
      
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            this.emit('error', {
              ...ERROR.HTML_VIDEO.HLS_LOAD_FAILED,
              message: 'HLS network error',
              error: data
            });
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            // Try to recover from media errors
            this.hls.recoverMediaError();
            break;
          default:
            this.emit('error', {
              ...ERROR.HTML_VIDEO.HLS_LOAD_FAILED,
              message: 'Fatal HLS error',
              error: data
            });
            break;
        }
      }
    });
  }

  /**
   * Emit property value changes
   */
  private emitPropValue(propName: string, propValue: any) {
    if (this.observedProps[propName]) {
      this.emit('propValue', propName, propValue);
    }
  }

  /**
   * Emit property changes
   */
  private emitPropChanged(propName: string, propValue: any) {
    if (this.observedProps[propName]) {
      this.emit('propChanged', propName, propValue);
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
        this.observeProp(frozenAction.propName);
        break;
      case 'setProp':
        this.setProp(frozenAction.propName, frozenAction.propValue);
        break;
      case 'command':
        this.command(frozenAction.commandName, frozenAction.commandArgs);
        break;
    }
  }

  /**
   * Start observing a property
   */
  private observeProp(propName: string) {
    switch (propName) {
      case 'time':
      case 'duration':
      case 'paused':
      case 'volume':
      case 'muted':
      case 'buffering':
        this.observedProps[propName] = true;
        // Emit current value
        this.emitPropValue(propName, this.getPropValue(propName));
        break;
    }
  }

  /**
   * Set a property value
   */
  private setProp(propName: string, propValue: any) {
    if (!this.videoElement) return;

    switch (propName) {
      case 'time':
        if (typeof propValue === 'number' && isFinite(propValue)) {
          this.videoElement.currentTime = propValue;
        }
        break;
      case 'paused':
        if (typeof propValue === 'boolean') {
          if (propValue) {
            this.videoElement.pause();
          } else {
            this.videoElement.play().catch(e => console.warn('Play failed:', e));
          }
        }
        break;
      case 'volume':
        if (typeof propValue === 'number' && propValue >= 0 && propValue <= 1) {
          this.videoElement.volume = propValue;
        }
        break;
      case 'muted':
        if (typeof propValue === 'boolean') {
          this.videoElement.muted = propValue;
        }
        break;
    }
  }

  /**
   * Get current property value
   */
  private getPropValue(propName: string): any {
    switch (propName) {
      case 'time': return this.currentTime;
      case 'duration': return this.duration;
      case 'paused': return this.paused;
      case 'volume': return this.volume;
      case 'muted': return this.muted;
      case 'buffering': return this.buffering;
      default: return null;
    }
  }

  /**
   * Execute commands
   */
  private command(commandName: string, commandArgs?: any) {
    switch (commandName) {
      case 'load':
        if (commandArgs?.stream) {
          this.loadStream(commandArgs.stream);
        }
        break;
      case 'unload':
        this.unload();
        break;
      case 'destroy':
        this.destroy();
        break;
    }
  }

  /**
   * Unload current stream
   */
  private unload() {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.removeAttribute('src');
      this.videoElement.load();
    }

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    // Reset state
    this.currentTime = 0;
    this.duration = 0;
    this.paused = true;
    this.buffering = false;
  }

  /**
   * Destroy the video player
   */
  private destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    this.unload();

    if (this.videoElement && this.containerElement.contains(this.videoElement)) {
      this.containerElement.removeChild(this.videoElement);
    }

    this.videoElement = null;
    this.removeAllListeners();
  }

  /**
   * Check if this implementation can play a stream
   */
  public static canPlayStream(stream: VideoStream): boolean {
    if (!stream?.url) return false;

    // Can play HTTP/HTTPS URLs
    if (stream.url.startsWith('http://') || stream.url.startsWith('https://')) {
      return true;
    }

    return false;
  }

  /**
   * Component manifest
   */
  public static manifest = {
    name: 'HTMLVideo',
    external: false,
    props: ['time', 'duration', 'paused', 'volume', 'muted', 'buffering'],
    commands: ['load', 'unload', 'destroy'],
    events: [
      'loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough',
      'timeupdate', 'progress', 'seeking', 'seeked', 'play', 'pause', 'ended',
      'waiting', 'playing', 'volumechange', 'error', 'resize', 'propValue', 'propChanged'
    ]
  };
}