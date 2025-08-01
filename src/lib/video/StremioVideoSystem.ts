// Complete Stremio Video Player System
// TypeScript implementation with all Stremio features

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
  commandArgs?: any[];
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

    console.log('StremioVideoSystem: Creating new video element');
    this.videoElement = document.createElement('video');
    this.videoElement.style.width = '100%';
    this.videoElement.style.height = '100%';
    this.videoElement.style.backgroundColor = 'transparent';
    this.videoElement.controls = false;
    this.videoElement.preload = 'auto'; // Changed from 'metadata' to 'auto' for better buffering
    this.videoElement.playsInline = true;
    // Don't set crossOrigin for Real-Debrid streams as they don't support CORS
    
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
      console.log('StremioVideoSystem: Video loadstart event');
      this.emitPropChanged('loaded', false);
      this.emitPropChanged('buffering', true);
    });

    this.videoElement.addEventListener('loadedmetadata', () => {
      if (!this.videoElement) return;
      console.log('StremioVideoSystem: Video loadedmetadata event, duration:', this.videoElement.duration);
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
        console.error('StremioVideoSystem: Video error:', error.code, error.message);
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
      
      console.log('Loading subtitles via proxy:', proxyUrl);
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Failed to load subtitles: ${response.status}`);
      }
      
      const text = await response.text();
      this.subtitlesData = this.parseSubtitles(text);
      this.currentSubtitleTrack = track;
      
      console.log(`Loaded ${this.subtitlesData.length} subtitle cues for ${track.language || track.id}`);
    } catch (error) {
      console.error('Subtitle loading error:', error);
      this.subtitlesData = [];
      this.currentSubtitleTrack = null;
      this.removeSubtitlesElement();
    }
  }

  private parseSubtitles(text: string): SubtitleCue[] {
    const cues: SubtitleCue[] = [];
    
    // Check if this is WebVTT format
    if (text.includes('WEBVTT')) {
      console.log('Parsing WebVTT subtitles');
      
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
      console.log('Parsing SRT subtitles');
      
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
    
    console.log(`Parsed ${cues.length} subtitle cues`);
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
        backBufferLength: 30,
        maxBufferLength: 50,
        maxMaxBufferLength: 80,
        maxFragLookUpTolerance: 0,
        maxBufferHole: 0,
        appendErrorMaxRetry: 20,
        nudgeMaxRetry: 20,
        manifestLoadingTimeOut: 30000,
        manifestLoadingMaxRetry: 10,
        fragLoadPolicy: {
          default: {
            maxTimeToFirstByteMs: 10000,
            maxLoadTimeMs: 120000,
            timeoutRetry: {
              maxNumRetry: 20,
              retryDelayMs: 0,
              maxRetryDelayMs: 15
            },
            errorRetry: {
              maxNumRetry: 6,
              retryDelayMs: 1000,
              maxRetryDelayMs: 15
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
      
      if (!this.videoElement) {
        this.createVideoElement();
      }
      
      console.log('StremioVideoSystem: Loading stream via load command:', this.currentStream);
      
      // Set video properties
      if (this.videoElement) {
        this.videoElement.autoplay = typeof commandArgs.autoplay === 'boolean' ? commandArgs.autoplay : true;
        
        if (commandArgs.time !== null && isFinite(commandArgs.time)) {
          this.videoElement.currentTime = parseInt(commandArgs.time, 10) / 1000;
        }
        
        // Check if HLS or direct video
        if (this.shouldUseHLS(this.currentStream)) {
          console.log('StremioVideoSystem: Setting up HLS for', this.currentStream);
          this.setupHLS(this.currentStream);
        } else {
          console.log('StremioVideoSystem: Setting direct video src for', this.currentStream);
          this.videoElement.src = this.currentStream;
          this.videoElement.load();
        }
        
        // Emit property changes
        this.emitPropChanged('stream', this.currentStream);
        this.emitPropChanged('loaded', false);
        this.emitPropChanged('buffering', true);
      }
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