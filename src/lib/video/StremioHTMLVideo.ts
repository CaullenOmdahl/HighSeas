// Official Stremio HTMLVideo implementation adapted for TypeScript/React
// Based on stremio-video-reference/src/HTMLVideo/HTMLVideo.js

import { LogCategory, logInfo, logError } from '../utils/logger';

interface StremioVideoOptions {
  containerElement: HTMLElement;
}

interface VideoStream {
  url: string;
  behaviorHints?: {
    notWebReady?: boolean;
    proxyHeaders?: {
      response?: { [key: string]: string };
    };
  };
}

export interface AudioTrack {
  id: string;
  name: string;
  language?: string;
  origin: string;
  embedded: boolean;
}

export interface SubtitleTrack {
  id: string;
  name: string;
  language?: string;
  origin: string;
  embedded: boolean;
}

interface VideoAction {
  type: 'observeProp' | 'setProp' | 'command';
  propName?: string;
  propValue?: any;
  commandName?: string;
  commandArgs?: any;
}

class EventEmitter {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, listener: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(...args));
    }
  }

  removeAllListeners() {
    this.listeners = {};
  }
}

// Official HLS Configuration from stremio-video-reference
const HLS_CONFIG = {
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
};

// Content type detection (adapted from stremio-video-reference)
function getContentType(stream: VideoStream): Promise<string> {
  if (!stream || typeof stream.url !== 'string') {
    return Promise.reject(new Error('Invalid stream parameter!'));
  }

  if (stream.behaviorHints && 
      stream.behaviorHints.proxyHeaders && 
      stream.behaviorHints.proxyHeaders.response && 
      typeof stream.behaviorHints.proxyHeaders.response['content-type'] === 'string') {
    return Promise.resolve(stream.behaviorHints.proxyHeaders.response['content-type']);
  }

  return fetch(stream.url, { method: 'HEAD' })
    .then(function(resp) {
      if (resp.ok) {
        return resp.headers.get('content-type') || 'video/mp4';
      }
      throw new Error(resp.status + ' (' + resp.statusText + ')');
    })
    .catch(() => 'video/mp4'); // Default fallback
}

export class StremioHTMLVideo {
  private containerElement: HTMLElement;
  private styleElement!: HTMLStyleElement;
  private videoElement!: HTMLVideoElement;
  private hls: any = null;
  private events = new EventEmitter();
  private destroyed = false;
  private stream: VideoStream | null = null;
  private subtitlesOffset = 0;
  private subtitlesOpacity = 1;

  private observedProps = {
    stream: false,
    loaded: false,
    paused: false,
    time: false,
    duration: false,
    buffering: false,
    buffered: false,
    subtitlesTracks: false,
    selectedSubtitlesTrackId: false,
    subtitlesOffset: false,
    subtitlesSize: false,
    subtitlesTextColor: false,
    subtitlesBackgroundColor: false,
    subtitlesOutlineColor: false,
    audioTracks: false,
    selectedAudioTrackId: false,
    volume: false,
    muted: false,
    playbackSpeed: false
  };

  constructor(options: StremioVideoOptions) {
    if (!(options.containerElement instanceof HTMLElement)) {
      throw new Error('Container element required to be instance of HTMLElement');
    }

    this.containerElement = options.containerElement;
    this.createElements();
    this.setupEventListeners();
  }

  private createElements() {
    // Create style element for subtitle styling (from reference)
    this.styleElement = document.createElement('style');
    this.containerElement.appendChild(this.styleElement);
    this.styleElement.sheet!.insertRule(
      'video::cue { font-size: 4vmin; color: rgb(255, 255, 255); background-color: rgba(0, 0, 0, 0); ' +
      'text-shadow: -0.15rem -0.15rem 0.15rem rgb(34, 34, 34), 0px -0.15rem 0.15rem rgb(34, 34, 34), ' +
      '0.15rem -0.15rem 0.15rem rgb(34, 34, 34), -0.15rem 0px 0.15rem rgb(34, 34, 34), ' +
      '0.15rem 0px 0.15rem rgb(34, 34, 34), -0.15rem 0.15rem 0.15rem rgb(34, 34, 34), ' +
      '0px 0.15rem 0.15rem rgb(34, 34, 34), 0.15rem 0.15rem 0.15rem rgb(34, 34, 34); }'
    );

    // Create video element (from reference)
    this.videoElement = document.createElement('video');
    this.videoElement.style.width = '100%';
    this.videoElement.style.height = '100%';
    this.videoElement.style.backgroundColor = 'black';
    this.videoElement.controls = false;
    this.videoElement.playsInline = true;
    this.containerElement.appendChild(this.videoElement);
  }

  private setupEventListeners() {
    // Event listeners from stremio-video-reference/HTMLVideo.js
    this.videoElement.onerror = () => this.onVideoError();
    this.videoElement.onended = () => this.onEnded();
    this.videoElement.onpause = () => this.onPropChanged('paused');
    this.videoElement.onplay = () => this.onPropChanged('paused');
    this.videoElement.ontimeupdate = () => {
      this.onPropChanged('time');
      this.onPropChanged('buffered');
    };
    this.videoElement.ondurationchange = () => this.onPropChanged('duration');
    this.videoElement.onwaiting = () => {
      this.onPropChanged('buffering');
      this.onPropChanged('buffered');
    };
    this.videoElement.onseeking = () => {
      this.onPropChanged('time');
      this.onPropChanged('buffering');
      this.onPropChanged('buffered');
    };
    this.videoElement.onseeked = () => {
      this.onPropChanged('time');
      this.onPropChanged('buffering');
      this.onPropChanged('buffered');
    };
    this.videoElement.onstalled = () => {
      this.onPropChanged('buffering');
      this.onPropChanged('buffered');
    };
    this.videoElement.onplaying = () => {
      this.onPropChanged('time');
      this.onPropChanged('buffering');
      this.onPropChanged('buffered');
    };
    this.videoElement.oncanplay = () => {
      this.onPropChanged('buffering');
      this.onPropChanged('buffered');
    };
    this.videoElement.onloadedmetadata = () => this.onPropChanged('loaded');
    this.videoElement.onloadeddata = () => {
      this.onPropChanged('buffering');
      this.onPropChanged('buffered');
    };
    this.videoElement.onvolumechange = () => {
      this.onPropChanged('volume');
      this.onPropChanged('muted');
    };
    this.videoElement.onratechange = () => this.onPropChanged('playbackSpeed');
    
    // Text tracks handling
    this.videoElement.textTracks.onchange = () => {
      this.onPropChanged('subtitlesTracks');
      this.onPropChanged('selectedSubtitlesTrackId');
      this.onCueChange();
      Array.from(this.videoElement.textTracks).forEach(track => {
        track.oncuechange = () => this.onCueChange();
      });
    };
  }

  private getProp(propName: string): any {
    switch (propName) {
      case 'stream':
        return this.stream;
      case 'loaded':
        if (this.stream === null) return null;
        return this.videoElement.readyState >= this.videoElement.HAVE_METADATA;
      case 'paused':
        if (this.stream === null) return null;
        return !!this.videoElement.paused;
      case 'time':
        if (this.stream === null || this.videoElement.currentTime === null || !isFinite(this.videoElement.currentTime)) {
          return null;
        }
        return Math.floor(this.videoElement.currentTime * 1000);
      case 'duration':
        if (this.stream === null || this.videoElement.duration === null || !isFinite(this.videoElement.duration)) {
          return null;
        }
        return Math.floor(this.videoElement.duration * 1000);
      case 'buffering':
        if (this.stream === null) return null;
        return this.videoElement.readyState < this.videoElement.HAVE_FUTURE_DATA;
      case 'buffered':
        if (this.stream === null) return null;
        const time = this.videoElement.currentTime !== null && isFinite(this.videoElement.currentTime) 
          ? this.videoElement.currentTime : 0;
        for (let i = 0; i < this.videoElement.buffered.length; i++) {
          if (this.videoElement.buffered.start(i) <= time && time <= this.videoElement.buffered.end(i)) {
            return Math.floor(this.videoElement.buffered.end(i) * 1000);
          }
        }
        return Math.floor(time * 1000);
      case 'subtitlesTracks':
        if (this.stream === null) return [];
        return Array.from(this.videoElement.textTracks).map((track, index) => ({
          id: 'EMBEDDED_' + String(index),
          lang: track.language,
          label: track.label || null,
          origin: 'EMBEDDED',
          embedded: true
        }));
      case 'selectedSubtitlesTrackId':
        if (this.stream === null) return null;
        return Array.from(this.videoElement.textTracks).reduce((result, track, index) => {
          if (result === null && track.mode === 'showing') {
            return 'EMBEDDED_' + String(index);
          }
          return result;
        }, null as string | null);
      case 'subtitlesOffset':
        if (this.destroyed) return null;
        return this.subtitlesOffset;
      case 'subtitlesSize':
        if (this.destroyed) return null;
        return parseInt((this.styleElement.sheet!.cssRules[0] as CSSStyleRule).style.fontSize, 10) * 25;
      case 'subtitlesTextColor':
        if (this.destroyed) return null;
        return (this.styleElement.sheet!.cssRules[0] as CSSStyleRule).style.color;
      case 'subtitlesBackgroundColor':
        if (this.destroyed) return null;
        return (this.styleElement.sheet!.cssRules[0] as CSSStyleRule).style.backgroundColor;
      case 'subtitlesOutlineColor':
        if (this.destroyed) return null;
        const textShadow = (this.styleElement.sheet!.cssRules[0] as CSSStyleRule).style.textShadow;
        return textShadow.slice(0, textShadow.indexOf(')') + 1);
      case 'subtitlesOpacity':
        if (this.destroyed) return null;
        return Math.round(this.subtitlesOpacity * 100);
      case 'audioTracks':
        if (this.hls === null || !Array.isArray(this.hls.audioTracks)) return [];
        return this.hls.audioTracks.map((track: any) => ({
          id: 'EMBEDDED_' + String(track.id),
          lang: typeof track.lang === 'string' && track.lang.length > 0 ? track.lang :
                typeof track.name === 'string' && track.name.length > 0 ? track.name :
                String(track.id),
          label: typeof track.name === 'string' && track.name.length > 0 ? track.name :
                 typeof track.lang === 'string' && track.lang.length > 0 ? track.lang :
                 String(track.id),
          origin: 'EMBEDDED',
          embedded: true
        }));
      case 'selectedAudioTrackId':
        if (this.hls === null || this.hls.audioTrack === null || !isFinite(this.hls.audioTrack) || this.hls.audioTrack === -1) {
          return null;
        }
        return 'EMBEDDED_' + String(this.hls.audioTrack);
      case 'volume':
        if (this.destroyed || this.videoElement.volume === null || !isFinite(this.videoElement.volume)) {
          return null;
        }
        return Math.floor(this.videoElement.volume * 100);
      case 'muted':
        if (this.destroyed) return null;
        return !!this.videoElement.muted;
      case 'playbackSpeed':
        if (this.destroyed || this.videoElement.playbackRate === null || !isFinite(this.videoElement.playbackRate)) {
          return null;
        }
        return this.videoElement.playbackRate;
      default:
        return null;
    }
  }

  private onCueChange() {
    Array.from(this.videoElement.textTracks).forEach(track => {
      Array.from(track.cues || []).forEach((cue: any) => {
        cue.snapToLines = false;
        cue.line = 100 - this.subtitlesOffset;
      });
    });
  }

  private onVideoError() {
    if (this.destroyed) return;

    let errorType;
    switch (this.videoElement.error!.code) {
      case 1: errorType = 'MEDIA_ERR_ABORTED'; break;
      case 2: errorType = 'MEDIA_ERR_NETWORK'; break;
      case 3: errorType = 'MEDIA_ERR_DECODE'; break;
      case 4: errorType = 'MEDIA_ERR_SRC_NOT_SUPPORTED'; break;
      default: errorType = 'UNKNOWN_ERROR';
    }

    logError(LogCategory.PLAYER, `Video error: ${errorType}`, {
      code: this.videoElement.error!.code,
      message: this.videoElement.error!.message
    });

    this.onError({
      critical: true,
      error: this.videoElement.error,
      type: errorType
    });
  }

  private onError(error: any) {
    this.events.emit('error', error);
    if (error.critical) {
      this.command('unload');
    }
  }

  private onEnded() {
    this.events.emit('ended');
  }

  private onPropChanged(propName: string) {
    if ((this.observedProps as any)[propName]) {
      this.events.emit('propChanged', propName, this.getProp(propName));
    }
  }

  private observeProp(propName: string) {
    if (this.observedProps.hasOwnProperty(propName)) {
      this.events.emit('propValue', propName, this.getProp(propName));
      (this.observedProps as any)[propName] = true;
    }
  }

  private setProp(propName: string, propValue: any) {
    switch (propName) {
      case 'paused':
        if (this.stream !== null) {
          propValue ? this.videoElement.pause() : this.videoElement.play();
          this.onPropChanged('paused');
        }
        break;
      case 'time':
        if (this.stream !== null && propValue !== null && isFinite(propValue)) {
          this.videoElement.currentTime = parseInt(propValue, 10) / 1000;
          this.onPropChanged('time');
        }
        break;
      case 'volume':
        if (propValue !== null && isFinite(propValue)) {
          this.videoElement.muted = false;
          this.videoElement.volume = Math.max(0, Math.min(100, parseInt(propValue, 10))) / 100;
          this.onPropChanged('muted');
          this.onPropChanged('volume');
        }
        break;
      case 'muted':
        this.videoElement.muted = !!propValue;
        this.onPropChanged('muted');
        break;
      case 'playbackSpeed':
        if (propValue !== null && isFinite(propValue)) {
          this.videoElement.playbackRate = parseFloat(propValue);
          this.onPropChanged('playbackSpeed');
        }
        break;
    }
  }

  private command(commandName: string, commandArgs?: any) {
    switch (commandName) {
      case 'load':
        this.command('unload');
        if (commandArgs && commandArgs.stream && typeof commandArgs.stream.url === 'string') {
          this.stream = commandArgs.stream;
          this.onPropChanged('stream');
          this.onPropChanged('loaded');
          this.videoElement.autoplay = typeof commandArgs.autoplay === 'boolean' ? commandArgs.autoplay : true;
          this.videoElement.currentTime = commandArgs.time !== null && isFinite(commandArgs.time) 
            ? parseInt(commandArgs.time, 10) / 1000 : 0;
          
          this.onPropChanged('paused');
          this.onPropChanged('time');
          this.onPropChanged('duration');
          this.onPropChanged('buffering');
          this.onPropChanged('buffered');
          this.onPropChanged('subtitlesTracks');
          this.onPropChanged('selectedSubtitlesTrackId');
          this.onPropChanged('audioTracks');
          this.onPropChanged('selectedAudioTrackId');

          getContentType(this.stream!)
            .then(contentType => {
              if (this.stream !== commandArgs.stream) return;

              if (this.stream) {
                logInfo(LogCategory.STREAM, 'Loading stream with content type', { 
                  contentType, 
                  url: this.stream.url.substring(0, 100) + '...'
                });

                // Check if transcoding is needed for unsupported formats
                const needsTranscoding = this.shouldTranscode(this.stream.url, contentType);
                
                if (needsTranscoding) {
                  logInfo(LogCategory.STREAM, 'Stream needs FFmpeg transcoding to HLS', {
                    contentType,
                    reason: 'Unsupported format or codec for browser playback'
                  });
                  
                  // Generate transcoding URL and use HLS.js
                  const transcodingUrl = this.generateTranscodingUrl(this.stream.url);
                  logInfo(LogCategory.STREAM, 'Using FFmpeg HLS transcoding', {
                    originalUrl: this.stream.url.substring(0, 100) + '...',
                    transcodingUrl: transcodingUrl.substring(0, 100) + '...',
                    sessionId: transcodingUrl.match(/\/api\/hls\/([^/]+)\//)?.[1] || 'unknown'
                  });
                  
                  // Use HLS.js for transcoded streams
                  if ((window as any).Hls?.isSupported()) {
                    const Hls = (window as any).Hls;
                    this.hls = new Hls(HLS_CONFIG);
                    
                    this.hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
                      this.onPropChanged('audioTracks');
                      this.onPropChanged('selectedAudioTrackId');
                    });
                    
                    this.hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, () => {
                      this.onPropChanged('audioTracks');
                      this.onPropChanged('selectedAudioTrackId');
                    });

                    this.hls.loadSource(transcodingUrl);
                    this.hls.attachMedia(this.videoElement);
                  } else {
                    // Fallback for browsers with native HLS support
                    this.videoElement.src = transcodingUrl;
                  }
                  return; // Don't continue with direct playback
                }
              }

              if (contentType === 'application/vnd.apple.mpegurl' && (window as any).Hls?.isSupported()) {
                const Hls = (window as any).Hls;
                this.hls = new Hls(HLS_CONFIG);
                
                this.hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
                  this.onPropChanged('audioTracks');
                  this.onPropChanged('selectedAudioTrackId');
                });
                
                this.hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, () => {
                  this.onPropChanged('audioTracks');
                  this.onPropChanged('selectedAudioTrackId');
                });

                this.hls.loadSource(this.stream!.url);
                this.hls.attachMedia(this.videoElement);
              } else {
                this.videoElement.src = this.stream!.url;
              }
            })
            .catch(() => {
              if (this.stream !== commandArgs.stream) return;
              this.videoElement.src = this.stream!.url;
            });
        } else {
          this.onError({
            critical: true,
            stream: commandArgs ? commandArgs.stream : null,
            type: 'UNSUPPORTED_STREAM'
          });
        }
        break;

      case 'unload':
        this.stream = null;
        Array.from(this.videoElement.textTracks).forEach(track => {
          track.oncuechange = null;
        });
        if (this.hls !== null) {
          this.hls.removeAllListeners();
          this.hls.detachMedia(this.videoElement);
          this.hls.destroy();
          this.hls = null;
        }
        this.videoElement.removeAttribute('src');
        this.videoElement.load();
        this.videoElement.currentTime = 0;
        this.onPropChanged('stream');
        this.onPropChanged('loaded');
        this.onPropChanged('paused');
        this.onPropChanged('time');
        this.onPropChanged('duration');
        this.onPropChanged('buffering');
        this.onPropChanged('buffered');
        this.onPropChanged('subtitlesTracks');
        this.onPropChanged('selectedSubtitlesTrackId');
        this.onPropChanged('audioTracks');
        this.onPropChanged('selectedAudioTrackId');
        break;

      case 'destroy':
        this.command('unload');
        this.destroyed = true;
        this.onPropChanged('subtitlesOffset');
        this.onPropChanged('subtitlesSize');
        this.onPropChanged('subtitlesTextColor');
        this.onPropChanged('subtitlesBackgroundColor');
        this.onPropChanged('subtitlesOutlineColor');
        this.onPropChanged('subtitlesOpacity');
        this.onPropChanged('volume');
        this.onPropChanged('muted');
        this.onPropChanged('playbackSpeed');
        this.events.removeAllListeners();
        this.containerElement.removeChild(this.videoElement);
        this.containerElement.removeChild(this.styleElement);
        break;
    }
  }

  // Public API (matches stremio-video-reference)
  on(eventName: string, listener: Function) {
    if (this.destroyed) {
      throw new Error('Video is destroyed');
    }
    this.events.on(eventName, listener);
  }

  dispatch(action: VideoAction) {
    if (this.destroyed) {
      throw new Error('Video is destroyed');
    }

    if (!action) {
      throw new Error('Invalid action dispatched: ' + JSON.stringify(action));
    }

    switch (action.type) {
      case 'observeProp':
        if (action.propName) {
          this.observeProp(action.propName);
        }
        break;
      case 'setProp':
        if (action.propName) {
          this.setProp(action.propName, action.propValue);
        }
        break;
      case 'command':
        if (action.commandName) {
          this.command(action.commandName, action.commandArgs);
        }
        break;
      default:
        throw new Error('Invalid action dispatched: ' + JSON.stringify(action));
    }
  }

  // Transcoding helper methods
  private shouldTranscode(streamUrl: string, contentType?: string): boolean {
    // Always transcode MKV files - browser compatibility issues
    if (streamUrl.includes('.mkv') || contentType === 'video/x-matroska') {
      return true;
    }
    
    // Transcode unsupported codecs
    if (contentType && (
      contentType.includes('x265') || 
      contentType.includes('hevc') ||
      contentType.includes('av01') ||
      contentType.includes('x-matroska')
    )) {
      return true;
    }
    
    return false;
  }

  private generateTranscodingUrl(originalUrl: string): string {
    // Generate unique session ID for this transcoding session
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    // Create HLS transcoding URL pointing to backend FFmpeg service
    const params = new URLSearchParams();
    params.set('mediaURL', originalUrl);
    params.set('videoCodecs', 'h264'); // Force H264 for browser compatibility
    params.set('audioCodecs', 'aac');  // Force AAC for browser compatibility
    params.set('format', 'mp4');       // Force MP4 container
    
    return `http://localhost:6969/api/hls/${sessionId}/master.m3u8?${params.toString()}`;
  }

  // Static methods (matches stremio-video-reference)
  static canPlayStream(stream: VideoStream): Promise<boolean> {
    if (!stream || (stream.behaviorHints && stream.behaviorHints.notWebReady)) {
      return Promise.resolve(false);
    }

    return getContentType(stream)
      .then(contentType => {
        const video = document.createElement('video');
        return !!video.canPlayType(contentType) || 
               (contentType === 'application/vnd.apple.mpegurl' && (window as any).Hls?.isSupported());
      })
      .catch(() => false);
  }

  static manifest = {
    name: 'HTMLVideo',
    external: false,
    props: ['stream', 'loaded', 'paused', 'time', 'duration', 'buffering', 'buffered', 'audioTracks', 
            'selectedAudioTrackId', 'subtitlesTracks', 'selectedSubtitlesTrackId', 'subtitlesOffset', 
            'subtitlesSize', 'subtitlesTextColor', 'subtitlesBackgroundColor', 'subtitlesOutlineColor', 
            'subtitlesOpacity', 'volume', 'muted', 'playbackSpeed'],
    commands: ['load', 'unload', 'destroy'],
    events: ['propValue', 'propChanged', 'ended', 'error', 'subtitlesTrackLoaded', 'audioTrackLoaded']
  };
}