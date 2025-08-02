// Complete Stremio Video Player System
// TypeScript implementation with all Stremio features

import { LogCategory, logInfo, logError, logDebug, logWarn } from '../utils/logger';

export interface VideoProperties {
  stream?: string | null;
  loaded?: boolean;
  paused?: boolean;
  time?: number;
  duration?: number;
  buffering?: boolean;
  buffered?: TimeRanges | null;
  audioTracks?: AudioTrack[];
  selectedAudioTrackId?: string | null;
  subtitlesTracks?: SubtitleTrack[];
  selectedSubtitlesTrackId?: string | null;
  subtitlesOffset?: number;
  subtitlesSize?: number;
  subtitlesTextColor?: string;
  subtitlesBackgroundColor?: string;
  subtitlesOutlineColor?: string;
  subtitlesOpacity?: number;
  volume?: number;
  muted?: boolean;
  playbackSpeed?: number;
  // Enhanced subtitle properties
  extraSubtitlesSize?: number;
  extraSubtitlesOffset?: number;
  extraSubtitlesTextColor?: string;
  extraSubtitlesBackgroundColor?: string;
  extraSubtitlesOutlineColor?: string;
  extraSubtitlesOpacity?: number;
  extraSubtitlesDelay?: number;
}

export interface AudioTrack {
  id: string;
  name: string;
  language?: string;
}

export interface SubtitleTrack {
  id: string;
  name: string;
  language?: string;
  url?: string;
  embedded?: boolean;
}

export interface SubtitleCue {
  startTime: number;
  endTime: number;
  text: string;
}

export interface VideoAction {
  type: 'observeProp' | 'setProp' | 'command';
  propName?: keyof VideoProperties;
  propValue?: any;
  commandName?: string;
  commandArgs?: any;
}

export interface VideoOptions {
  containerElement: HTMLElement;
}

export class StremioVideoSystem {
  private containerElement: HTMLElement;
  private videoElement: HTMLVideoElement | null = null;
  private subtitlesContainer: HTMLElement | null = null;
  private subtitlesElement: HTMLElement | null = null;
  private hlsInstance: any = null;
  
  private observedProps: { [K in keyof VideoProperties]?: boolean } = {};
  private eventListeners: { [key: string]: Function[] } = {};
  
  // State
  private currentStream: string | null = null;
  private currentSubtitleTrack: SubtitleTrack | null = null;
  private subtitlesData: SubtitleCue[] = [];
  private destroyed = false;
  
  // Subtitle settings
  private extraSubtitlesSize = 25;
  private extraSubtitlesOffset = 0;
  private extraSubtitlesTextColor = '#FFFFFF';
  private extraSubtitlesBackgroundColor = 'rgba(0, 0, 0, 0.7)';
  private extraSubtitlesOutlineColor = '#000000';
  private extraSubtitlesOpacity = 100;
  private extraSubtitlesDelay = 0;

  constructor(options: VideoOptions) {
    this.containerElement = options.containerElement;
    this.initializeContainer();
  }

  private initializeContainer() {
    this.containerElement.style.position = 'relative';
    this.containerElement.style.width = '100%';
    this.containerElement.style.height = '100%';
    this.containerElement.style.backgroundColor = '#000';
  }

  private createVideoElement() {
    if (this.videoElement) return;

    logInfo(LogCategory.PLAYER, 'Creating new video element');
    this.videoElement = document.createElement('video');
    this.videoElement.style.width = '100%';
    this.videoElement.style.height = '100%';
    this.videoElement.style.backgroundColor = 'transparent';
    this.videoElement.controls = true; // TEMP: Enable controls for debugging
    this.videoElement.preload = 'auto'; // Changed from 'metadata' to 'auto' for better buffering
    this.videoElement.playsInline = true;
    // Don't set crossOrigin for Real-Debrid streams as they don't support CORS
    
    // Add more permissive attributes for codec compatibility
    this.videoElement.setAttribute('muted', 'true'); // Start muted to avoid autoplay issues
    this.videoElement.setAttribute('data-allow-hardware-decode', 'true');
    
    // Add buffer configuration for better streaming performance
    if ('bufferTime' in this.videoElement) {
      (this.videoElement as any).bufferTime = 10; // 10 seconds buffer
    }

    this.containerElement.appendChild(this.videoElement);
    this.setupVideoEventListeners();
  }

  private setupVideoEventListeners() {
    if (!this.videoElement) return;

    this.videoElement.addEventListener('loadstart', () => {
      logDebug(LogCategory.PLAYER, 'Video loadstart event');
      this.emitPropChanged('loaded', false);
      this.emitPropChanged('buffering', true);
    });

    this.videoElement.addEventListener('loadedmetadata', () => {
      if (!this.videoElement) return;
      logInfo(LogCategory.PLAYER, 'Video loadedmetadata event', { 
        duration: this.videoElement.duration,
        durationFormatted: `${Math.floor(this.videoElement.duration / 60)}:${Math.floor(this.videoElement.duration % 60).toString().padStart(2, '0')}`,
        readyState: this.videoElement.readyState,
        networkState: this.videoElement.networkState,
        preload: this.videoElement.preload
      });
      this.emitPropChanged('loaded', true);
      this.emitPropChanged('duration', this.videoElement.duration * 1000);
      this.emitPropChanged('buffering', false);
    });

    this.videoElement.addEventListener('timeupdate', () => {
      if (!this.videoElement) return;
      const time = this.videoElement.currentTime * 1000;
      this.emitPropChanged('time', time);
      this.renderSubtitles(time);
    });

    this.videoElement.addEventListener('play', () => {
      this.emitPropChanged('paused', false);
    });

    this.videoElement.addEventListener('pause', () => {
      this.emitPropChanged('paused', true);
    });

    this.videoElement.addEventListener('waiting', () => {
      if (!this.videoElement) return;
      logWarn(LogCategory.PERFORMANCE, 'Video waiting - network issue detected', {
        readyState: this.videoElement.readyState,
        networkState: this.videoElement.networkState,
        buffered: this.videoElement.buffered.length,
        currentSrc: this.videoElement.currentSrc ? this.videoElement.currentSrc.substring(0, 100) + '...' : 'none'
      });
      this.emitPropChanged('buffering', true);
    });

    this.videoElement.addEventListener('canplay', () => {
      this.emitPropChanged('buffering', false);
    });

    this.videoElement.addEventListener('progress', () => {
      if (!this.videoElement) return;
      this.emitPropChanged('buffered', this.videoElement.buffered);
    });

    this.videoElement.addEventListener('volumechange', () => {
      if (!this.videoElement) return;
      this.emitPropChanged('volume', Math.floor(this.videoElement.volume * 100));
      this.emitPropChanged('muted', this.videoElement.muted);
    });

    this.videoElement.addEventListener('ratechange', () => {
      if (!this.videoElement) return;
      this.emitPropChanged('playbackSpeed', this.videoElement.playbackRate);
    });

    this.videoElement.addEventListener('ended', () => {
      this.emit('ended');
    });

    this.videoElement.addEventListener('error', () => {
      if (!this.videoElement) return;
      const error = this.videoElement.error;
      if (error) {
        logError(LogCategory.PLAYER, 'Video playback error', {
          code: error.code,
          message: error.message,
          streamUrl: this.currentStream
        });
        this.emit('error', {
          critical: true,
          message: `Video error: ${error.message}`,
          code: error.code
        });
      }
    });
  }

  private createSubtitlesContainer() {
    if (this.subtitlesContainer) return;

    this.subtitlesContainer = document.createElement('div');
    this.subtitlesContainer.style.position = 'absolute';
    this.subtitlesContainer.style.left = '0';
    this.subtitlesContainer.style.top = '0';
    this.subtitlesContainer.style.width = '100%';
    this.subtitlesContainer.style.height = '100%';
    this.subtitlesContainer.style.pointerEvents = 'none';
    this.subtitlesContainer.style.zIndex = '1000';
    this.subtitlesContainer.style.display = 'flex';
    this.subtitlesContainer.style.flexDirection = 'column';
    this.subtitlesContainer.style.justifyContent = 'flex-end';
    this.subtitlesContainer.style.alignItems = 'center';
    this.subtitlesContainer.style.overflow = 'hidden';

    this.containerElement.appendChild(this.subtitlesContainer);
  }

  private renderSubtitles(currentTime: number) {
    if (!this.subtitlesData.length || !this.currentSubtitleTrack) {
      this.removeSubtitlesElement();
      return;
    }

    const adjustedTime = currentTime + this.extraSubtitlesDelay;
    const activeCues = this.subtitlesData.filter(cue => 
      adjustedTime >= cue.startTime && adjustedTime <= cue.endTime
    );

    if (activeCues.length === 0) {
      this.removeSubtitlesElement();
      return;
    }

    this.createSubtitlesContainer();
    
    if (!this.subtitlesElement) {
      this.subtitlesElement = document.createElement('div');
      this.subtitlesElement.style.position = 'relative';
      this.subtitlesElement.style.maxWidth = '90%';
      this.subtitlesElement.style.textAlign = 'center';
      this.subtitlesElement.style.fontFamily = 'Arial, sans-serif';
      this.subtitlesElement.style.fontWeight = 'bold';
      this.subtitlesElement.style.lineHeight = '1.2';
      this.subtitlesElement.style.wordWrap = 'break-word';
      this.subtitlesElement.style.whiteSpace = 'pre-wrap';
      this.subtitlesContainer!.appendChild(this.subtitlesElement);
    }

    // Clear existing content
    while (this.subtitlesElement.firstChild) {
      this.subtitlesElement.removeChild(this.subtitlesElement.firstChild);
    }

    // Render active cues
    activeCues.forEach(cue => {
      const cueElement = document.createElement('div');
      cueElement.textContent = cue.text;
      this.styleSubtitleElement(cueElement);
      this.subtitlesElement!.appendChild(cueElement);
    });
  }

  private styleSubtitleElement(element: HTMLElement) {
    const fontSize = Math.floor((this.extraSubtitlesSize / 25) * 3.5) + 'vmin';
    const opacity = this.extraSubtitlesOpacity / 100;

    element.style.fontSize = fontSize;
    element.style.opacity = opacity.toString();
    element.style.color = this.extraSubtitlesTextColor;
    element.style.backgroundColor = this.extraSubtitlesBackgroundColor;
    element.style.padding = '0.2em 0.4em';
    element.style.borderRadius = '0.2em';
    element.style.margin = '0.1em';
    element.style.display = 'inline-block';

    // Text shadow for outline effect
    const outlineWidth = '0.15rem';
    element.style.textShadow = [
      `-${outlineWidth} -${outlineWidth} 0 ${this.extraSubtitlesOutlineColor}`,
      `0 -${outlineWidth} 0 ${this.extraSubtitlesOutlineColor}`,
      `${outlineWidth} -${outlineWidth} 0 ${this.extraSubtitlesOutlineColor}`,
      `-${outlineWidth} 0 0 ${this.extraSubtitlesOutlineColor}`,
      `${outlineWidth} 0 0 ${this.extraSubtitlesOutlineColor}`,
      `-${outlineWidth} ${outlineWidth} 0 ${this.extraSubtitlesOutlineColor}`,
      `0 ${outlineWidth} 0 ${this.extraSubtitlesOutlineColor}`,
      `${outlineWidth} ${outlineWidth} 0 ${this.extraSubtitlesOutlineColor}`
    ].join(', ');

    // Position offset
    if (this.extraSubtitlesOffset !== 0) {
      const offsetPercent = this.extraSubtitlesOffset + '%';
      element.style.transform = `translateY(${offsetPercent})`;
    }
  }

  private removeSubtitlesElement() {
    if (this.subtitlesElement && this.subtitlesElement.parentNode) {
      this.subtitlesElement.parentNode.removeChild(this.subtitlesElement);
      this.subtitlesElement = null;
    }
  }

  private async loadSubtitles(track: SubtitleTrack | null) {
    if (!track || !track.url) {
      this.subtitlesData = [];
      this.currentSubtitleTrack = null;
      this.removeSubtitlesElement();
      return;
    }

    try {
      // Use our subtitle proxy to avoid CORS issues
      const proxyUrl = `/api/subtitles?url=${encodeURIComponent(track.url)}`;
      
      logInfo(LogCategory.STREAM, 'Loading subtitles via proxy', { url: proxyUrl });
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Failed to load subtitles: ${response.status}`);
      }
      
      const text = await response.text();
      this.subtitlesData = this.parseSubtitles(text);
      this.currentSubtitleTrack = track;
      
      logInfo(LogCategory.STREAM, 'Subtitles loaded successfully', {
        cuesTotal: this.subtitlesData.length,
        language: track.language || track.id
      });
    } catch (error) {
      logError(LogCategory.STREAM, 'Subtitle loading failed', {
        url: track.url,
        language: track.language || track.id
      }, error as Error);
      this.subtitlesData = [];
      this.currentSubtitleTrack = null;
      this.removeSubtitlesElement();
    }
  }

  private shouldTranscode(streamUrl: string | null): boolean {
    if (!streamUrl) return false;
    
    // Always transcode MKV files to ensure compatibility
    // MKV containers often have codec/subtitle compatibility issues across browsers
    if (streamUrl.includes('.mkv')) {
      return true; // Force transcoding for all MKV files
    }
    
    // Add other transcoding rules here (codec issues, etc.)
    return false;
  }

  private generateTranscodingUrl(originalUrl: string): string {
    // Generate unique session ID for this transcoding session
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    // Create HLS transcoding URL (similar to Stremio's approach)
    const params = new URLSearchParams();
    params.set('mediaURL', originalUrl);
    params.set('videoCodecs', 'h264'); // Force H264 for browser compatibility
    params.set('audioCodecs', 'aac');  // Force AAC for browser compatibility
    params.set('format', 'mp4');       // Force MP4 container
    
    return `http://localhost:6969/api/hls/${sessionId}/master.m3u8?${params.toString()}`;
  }

  private parseSubtitles(text: string): SubtitleCue[] {
    const cues: SubtitleCue[] = [];
    
    // Check if this is WebVTT format
    if (text.includes('WEBVTT')) {
      logDebug(LogCategory.STREAM, 'Parsing WebVTT subtitles');
      
      // Split by double newlines to get cue blocks
      const blocks = text.split(/\n\s*\n/);
      
      blocks.forEach(block => {
        const lines = block.trim().split('\n');
        if (lines.length >= 2) {
          // Find the timeline (contains -->)
          const timeLineIndex = lines.findIndex(line => line.includes('-->'));
          if (timeLineIndex >= 0) {
            const timeLine = lines[timeLineIndex];
            const textLines = lines.slice(timeLineIndex + 1);
            
            // WebVTT format: 00:00:00.000 --> 00:00:00.000
            const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
            if (timeMatch) {
              const startTime = parseInt(timeMatch[1]) * 3600000 + 
                               parseInt(timeMatch[2]) * 60000 + 
                               parseInt(timeMatch[3]) * 1000 + 
                               parseInt(timeMatch[4]);
              
              const endTime = parseInt(timeMatch[5]) * 3600000 + 
                             parseInt(timeMatch[6]) * 60000 + 
                             parseInt(timeMatch[7]) * 1000 + 
                             parseInt(timeMatch[8]);
              
              cues.push({
                startTime,
                endTime,
                text: textLines.join('\n').replace(/<[^>]*>/g, '') // Remove HTML tags
              });
            }
          }
        }
      });
    } 
    // SRT format parser
    else if (text.includes('-->')) {
      logDebug(LogCategory.STREAM, 'Parsing SRT subtitles');
      
      const blocks = text.trim().split(/\n\s*\n/);
      
      blocks.forEach(block => {
        const lines = block.trim().split('\n');
        if (lines.length >= 3) {
          const timeLine = lines[1];
          const textLines = lines.slice(2);
          
          // SRT format: 00:00:00,000 --> 00:00:00,000
          const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
          if (timeMatch) {
            const startTime = parseInt(timeMatch[1]) * 3600000 + 
                             parseInt(timeMatch[2]) * 60000 + 
                             parseInt(timeMatch[3]) * 1000 + 
                             parseInt(timeMatch[4]);
            
            const endTime = parseInt(timeMatch[5]) * 3600000 + 
                           parseInt(timeMatch[6]) * 60000 + 
                           parseInt(timeMatch[7]) * 1000 + 
                           parseInt(timeMatch[8]);
            
            cues.push({
              startTime,
              endTime,
              text: textLines.join('\n').replace(/<[^>]*>/g, '') // Remove HTML tags
            });
          }
        }
      });
    }
    
    logDebug(LogCategory.STREAM, 'Subtitle parsing completed', { cuesTotal: cues.length });
    return cues;
  }


  private shouldUseHLS(streamUrl: string): boolean {
    return streamUrl.includes('.m3u8') || 
           (typeof window !== 'undefined' && 
            (window as any).Hls?.isSupported() && 
            !this.videoElement!.canPlayType('application/vnd.apple.mpegurl'));
  }

  private setupHLS(streamUrl: string) {
    if (typeof window !== 'undefined' && (window as any).Hls?.isSupported()) {
      const Hls = (window as any).Hls;
      this.hlsInstance = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: false,
        // Optimized buffer settings for Real-Debrid streams
        backBufferLength: 20,        // Reduced to prevent memory issues
        maxBufferLength: 30,         // Reduced from 50 - smaller buffer window
        maxMaxBufferLength: 60,      // Reduced from 80
        maxFragLookUpTolerance: 0.2, // Slightly more tolerant
        maxBufferHole: 0.3,          // Allow small buffer holes
        // Retry settings optimized for slow connections
        appendErrorMaxRetry: 10,     // Reduced retries
        nudgeMaxRetry: 10,
        manifestLoadingTimeOut: 20000, // Reduced timeout
        manifestLoadingMaxRetry: 5,    // Fewer retries
        fragLoadPolicy: {
          default: {
            maxTimeToFirstByteMs: 15000,  // More time for slow connections
            maxLoadTimeMs: 60000,         // Reduced from 120s
            timeoutRetry: {
              maxNumRetry: 10,            // Reduced retries
              retryDelayMs: 500,          // Faster retry
              maxRetryDelayMs: 8000       // Shorter max delay
            },
            errorRetry: {
              maxNumRetry: 3,             // Much fewer error retries
              retryDelayMs: 1000,
              maxRetryDelayMs: 5000       // Shorter error retry delay
            }
          }
        }
      });

      this.hlsInstance.loadSource(streamUrl);
      this.hlsInstance.attachMedia(this.videoElement);

      this.hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        this.updateAudioTracks();
      });

      this.hlsInstance.on(Hls.Events.ERROR, (_event: any, data: any) => {
        if (data.fatal) {
          this.emit('error', {
            critical: true,
            message: `HLS Error: ${data.type} - ${data.details}`
          });
        }
      });
    } else {
      // Fallback for Safari and other browsers with native HLS support
      this.videoElement!.src = streamUrl;
    }
  }

  private updateAudioTracks() {
    if (this.hlsInstance && this.hlsInstance.audioTracks) {
      const tracks: AudioTrack[] = this.hlsInstance.audioTracks.map((track: any, index: number) => ({
        id: index.toString(),
        name: track.name || `Track ${index + 1}`,
        language: track.lang
      }));
      this.emitPropChanged('audioTracks', tracks);
    }
  }

  private emitPropChanged(propName: keyof VideoProperties, propValue: any) {
    if (this.observedProps[propName]) {
      this.emit('propChanged', propName, propValue);
    }
  }

  private emit(event: string, ...args: any[]) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(listener => listener(...args));
    }
  }

  // Public API
  on(event: string, listener: Function) {
    if (this.destroyed) {
      throw new Error('StremioVideoSystem instance is destroyed');
    }

    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(listener);
  }

  dispatch(action: VideoAction) {
    if (this.destroyed) {
      throw new Error('StremioVideoSystem instance is destroyed');
    }

    switch (action.type) {
      case 'observeProp':
        if (action.propName) {
          this.observedProps[action.propName] = true;
          this.emitCurrentProp(action.propName);
        }
        break;

      case 'setProp':
        if (action.propName && action.propValue !== undefined) {
          this.setProp(action.propName, action.propValue);
        }
        break;

      case 'command':
        if (action.commandName) {
          this.executeCommand(action.commandName, action.commandArgs);
        }
        break;
    }
  }

  private emitCurrentProp(propName: keyof VideoProperties) {
    switch (propName) {
      case 'loaded':
        this.emitPropChanged(propName, this.videoElement && this.videoElement.readyState >= 1);
        break;
      case 'paused':
        this.emitPropChanged(propName, !this.videoElement || this.videoElement.paused);
        break;
      case 'time':
        this.emitPropChanged(propName, this.videoElement ? this.videoElement.currentTime * 1000 : null);
        break;
      case 'duration':
        this.emitPropChanged(propName, this.videoElement && this.videoElement.duration ? this.videoElement.duration * 1000 : null);
        break;
      case 'buffering':
        this.emitPropChanged(propName, !this.videoElement || this.videoElement.readyState < 3);
        break;
      case 'buffered':
        this.emitPropChanged(propName, this.videoElement ? this.videoElement.buffered : null);
        break;
      case 'volume':
        this.emitPropChanged(propName, this.videoElement ? Math.floor(this.videoElement.volume * 100) : 100);
        break;
      case 'muted':
        this.emitPropChanged(propName, this.videoElement ? this.videoElement.muted : false);
        break;
      case 'playbackSpeed':
        this.emitPropChanged(propName, this.videoElement ? this.videoElement.playbackRate : 1);
        break;
    }
  }

  private setProp(propName: keyof VideoProperties, propValue: any) {
    switch (propName) {
      case 'stream':
        // Use Stremio's load command pattern instead of direct stream setting
        if (propValue) {
          this.dispatch({
            type: 'command',
            commandName: 'load',
            commandArgs: {
              stream: { url: propValue },
              autoplay: true
            }
          });
        } else {
          this.dispatch({
            type: 'command',
            commandName: 'unload'
          });
        }
        break;
      case 'paused':
        if (this.videoElement) {
          if (propValue) {
            this.videoElement.pause();
          } else {
            this.videoElement.play().catch(() => {});
          }
        }
        break;
      case 'time':
        if (this.videoElement && propValue !== null && isFinite(propValue)) {
          this.videoElement.currentTime = propValue / 1000;
        }
        break;
      case 'volume':
        if (this.videoElement && propValue !== null && isFinite(propValue)) {
          this.videoElement.muted = false;
          this.videoElement.volume = Math.max(0, Math.min(100, propValue)) / 100;
        }
        break;
      case 'muted':
        if (this.videoElement) {
          this.videoElement.muted = !!propValue;
        }
        break;
      case 'playbackSpeed':
        if (this.videoElement && propValue !== null && isFinite(propValue)) {
          this.videoElement.playbackRate = propValue;
        }
        break;
      case 'selectedSubtitlesTrackId':
        // This would need subtitle tracks to be provided
        // For now, just handle the subtitle track loading
        break;
      // Subtitle styling properties
      case 'extraSubtitlesSize':
        this.extraSubtitlesSize = Math.max(10, Math.min(50, propValue || 25));
        break;
      case 'extraSubtitlesOffset':
        this.extraSubtitlesOffset = Math.max(-20, Math.min(20, propValue || 0));
        break;
      case 'extraSubtitlesTextColor':
        this.extraSubtitlesTextColor = propValue || '#FFFFFF';
        break;
      case 'extraSubtitlesBackgroundColor':
        this.extraSubtitlesBackgroundColor = propValue || 'rgba(0, 0, 0, 0.7)';
        break;
      case 'extraSubtitlesOutlineColor':
        this.extraSubtitlesOutlineColor = propValue || '#000000';
        break;
      case 'extraSubtitlesOpacity':
        this.extraSubtitlesOpacity = Math.max(0, Math.min(100, propValue || 100));
        break;
      case 'extraSubtitlesDelay':
        this.extraSubtitlesDelay = propValue || 0;
        break;
    }
  }

  private executeCommand(commandName: string, commandArgs?: any) {
    switch (commandName) {
      case 'load':
        this.executeLoadCommand(commandArgs);
        break;
      case 'unload':
        this.executeUnloadCommand();
        break;
      case 'play':
        if (this.videoElement) {
          this.videoElement.play().catch(() => {});
        }
        break;
      case 'pause':
        if (this.videoElement) {
          this.videoElement.pause();
        }
        break;
      case 'stop':
        if (this.videoElement) {
          this.videoElement.pause();
          this.videoElement.currentTime = 0;
        }
        break;
      case 'seek':
        if (this.videoElement && commandArgs && commandArgs[0] !== undefined) {
          this.videoElement.currentTime = commandArgs[0] / 1000;
        }
        break;
    }
  }

  private executeLoadCommand(commandArgs: any) {
    this.executeUnloadCommand(); // Unload any existing stream first
    
    if (commandArgs && commandArgs.stream && typeof commandArgs.stream.url === 'string') {
      this.currentStream = commandArgs.stream.url;
      
      // Always create fresh video element for new streams
      if (this.videoElement) {
        this.videoElement.remove();
        this.videoElement = null;
      }
      this.createVideoElement();
      
      logInfo(LogCategory.STREAM, 'Loading stream via load command', { 
        url: this.currentStream,
        autoplay: typeof commandArgs.autoplay === 'boolean' ? commandArgs.autoplay : true
      });
      
      // Set video properties - using non-null assertion since we just created the element
      const videoEl = this.videoElement!;
      
      // Check container format compatibility
      let needsTranscoding = false;
      if (this.videoElement) {
        const canPlayMp4H264 = videoEl.canPlayType('video/mp4; codecs="avc1.42E01E"');
        const canPlayMp4H265 = videoEl.canPlayType('video/mp4; codecs="hev1.1.6.L93.B0"');
        const canPlayMkvH264 = videoEl.canPlayType('video/x-matroska; codecs="avc1.42E01E"');
        const canPlayMkvH265 = videoEl.canPlayType('video/x-matroska; codecs="hev1.1.6.L93.B0"');
        
        logInfo(LogCategory.STREAM, 'Browser codec support check', {
          'MP4 H264': canPlayMp4H264 || 'not supported',
          'MP4 H265': canPlayMp4H265 || 'not supported', 
          'MKV H264': canPlayMkvH264 || 'not supported',
          'MKV H265': canPlayMkvH265 || 'not supported'
        });
        
        // Check if this stream needs transcoding (Stremio approach)
        needsTranscoding = this.shouldTranscode(this.currentStream);
        
        if (needsTranscoding) {
          logInfo(LogCategory.STREAM, 'Stream needs transcoding to HLS', {
            streamUrl: this.currentStream,
            reason: 'Browser cannot play MKV container natively'
          });
        }
      }
      videoEl.autoplay = typeof commandArgs.autoplay === 'boolean' ? commandArgs.autoplay : true;
      
      if (commandArgs.time !== null && isFinite(commandArgs.time)) {
        videoEl.currentTime = parseInt(commandArgs.time, 10) / 1000;
      }
      
      // Check if HLS or direct video
      if (this.currentStream && this.shouldUseHLS(this.currentStream)) {
        logInfo(LogCategory.STREAM, 'Setting up HLS streaming', { url: this.currentStream });
        this.setupHLS(this.currentStream);
      } else {
        logInfo(LogCategory.STREAM, 'Setting direct video source', { url: this.currentStream });
        
        // CRITICAL: Use 'auto' for Real-Debrid streams to enable proper buffering
        videoEl.preload = 'auto'; // MUST be 'auto' to allow browser buffering
        
        // Use transcoding server if needed, otherwise direct stream
        if (needsTranscoding) {
          // Generate HLS transcoding URL (Stremio approach)
          const transcodingUrl = this.generateTranscodingUrl(this.currentStream!);
          logInfo(LogCategory.STREAM, 'Using HLS transcoding for unsupported format', { 
            originalUrl: this.currentStream,
            transcodingUrl 
          });
          videoEl.src = transcodingUrl;
        } else if (this.currentStream!.includes('real-debrid.com')) {
          // Use direct Real-Debrid connection for supported formats
          logInfo(LogCategory.STREAM, 'Using direct Real-Debrid stream (supported format)', { url: this.currentStream });
          videoEl.src = this.currentStream!;
          videoEl.crossOrigin = null;
        } else {
          videoEl.src = this.currentStream!;
        }
        
        // Configure video element for stable streaming
        videoEl.setAttribute('playsinline', 'true');
        videoEl.setAttribute('webkit-playsinline', 'true');
        
        // Remove aggressive buffering that can cause stalls
        videoEl.crossOrigin = null; // Remove CORS restrictions
        
        // Set reasonable buffer ahead target
        if ('bufferAheadSec' in videoEl) {
          (videoEl as any).bufferAheadSec = 10; // 10 second buffer target
        }
        
        // Add load strategy optimization
        videoEl.addEventListener('loadstart', () => {
          logInfo(LogCategory.PERFORMANCE, 'Starting optimized buffer loading');
        });
        
        // Improved buffer monitoring - NO automatic pausing
        videoEl.addEventListener('progress', () => {
          if (this.videoElement && this.videoElement.buffered.length > 0) {
            const buffered = this.videoElement.buffered.end(this.videoElement.buffered.length - 1);
            const current = this.videoElement.currentTime;
            const bufferAhead = buffered - current;
            
            logDebug(LogCategory.PERFORMANCE, 'Buffer status', {
              bufferAhead: `${bufferAhead.toFixed(1)}s`,
              currentTime: `${current.toFixed(1)}s`,
              bufferedEnd: `${buffered.toFixed(1)}s`,
              bufferHealth: bufferAhead < 5 ? 'LOW' : bufferAhead < 15 ? 'MEDIUM' : 'HIGH',
              readyState: this.videoElement.readyState,
              networkState: this.videoElement.networkState
            });
            
            // Only log warnings for very low buffer, but DON'T pause automatically
            if (bufferAhead < 2 && !this.videoElement.paused) {
              logWarn(LogCategory.PERFORMANCE, 'Very low buffer detected', {
                bufferAhead: `${bufferAhead.toFixed(1)}s`,
                readyState: this.videoElement.readyState,
                networkState: this.videoElement.networkState,
                action: 'monitoring only - no automatic pausing'
              });
            }
          }
        });
        
        // Improved stall detection - less aggressive recovery
        videoEl.addEventListener('stalled', () => {
          logWarn(LogCategory.PERFORMANCE, 'Video stalled detected', {
            readyState: this.videoElement?.readyState,
            networkState: this.videoElement?.networkState,
            currentTime: this.videoElement?.currentTime?.toFixed(1),
            buffered: this.videoElement && this.videoElement.buffered.length > 0 ? 
              this.videoElement.buffered.end(this.videoElement.buffered.length - 1).toFixed(1) : '0'
          });
          
          // Only force reload as last resort after significant stall
          setTimeout(() => {
            if (this.videoElement && this.videoElement.readyState < 2 && this.videoElement.networkState === 2) {
              logInfo(LogCategory.PERFORMANCE, 'Forcing reload due to persistent stall');
              const currentTime = this.videoElement.currentTime;
              this.videoElement.load();
              
              this.videoElement.addEventListener('loadedmetadata', () => {
                if (this.videoElement && currentTime > 0) {
                  this.videoElement.currentTime = currentTime;
                }
              }, { once: true });
            }
          }, 10000); // Much longer delay - only for truly stuck streams
        });
        
        // Add waiting event handling
        videoEl.addEventListener('waiting', () => {
          logDebug(LogCategory.PERFORMANCE, 'Video waiting for data');
        });
        
        // Add error handling to diagnose Real-Debrid issues
        videoEl.addEventListener('error', () => {
          logError(LogCategory.STREAM, 'Critical video load error', {
            error: videoEl.error,
            currentSrc: videoEl.currentSrc,
            readyState: videoEl.readyState,
            networkState: videoEl.networkState
          });
        }, { once: true });
        
        // Add load event to verify stream loading
        videoEl.addEventListener('loadstart', () => {
          logInfo(LogCategory.STREAM, 'Stream load started', {
            originalUrl: this.currentStream?.substring(0, 100) + '...',
            actualSrc: videoEl.src.substring(0, 100) + '...',
            networkState: videoEl.networkState,
            usingProxy: this.currentStream!.includes('real-debrid.com')
          });
        }, { once: true });
        
        videoEl.load();
      }
      
      // Emit property changes
      this.emitPropChanged('stream', this.currentStream);
      this.emitPropChanged('loaded', false);
      this.emitPropChanged('buffering', true);
    }
  }

  private executeUnloadCommand() {
    this.currentStream = null;
    
    if (this.hlsInstance) {
      this.hlsInstance.destroy();
      this.hlsInstance = null;
    }
    
    if (this.videoElement) {
      this.videoElement.removeAttribute('src');
      this.videoElement.load();
    }
    
    this.emitPropChanged('stream', null);
  }

  // Public method to load subtitles
  loadSubtitleTrack(track: SubtitleTrack | null) {
    return this.loadSubtitles(track);
  }

  destroy() {
    if (this.destroyed) return;

    (this as any).destroyed = true;

    if (this.hlsInstance) {
      this.hlsInstance.destroy();
      this.hlsInstance = null;
    }

    if (this.subtitlesContainer && this.subtitlesContainer.parentNode) {
      this.subtitlesContainer.parentNode.removeChild(this.subtitlesContainer);
    }

    if (this.videoElement && this.videoElement.parentNode) {
      this.videoElement.parentNode.removeChild(this.videoElement);
    }

    this.eventListeners = {};
    this.videoElement = null;
    this.subtitlesContainer = null;
    this.subtitlesElement = null;
  }

  get isDestroyed() {
    return this.destroyed;
  }
}