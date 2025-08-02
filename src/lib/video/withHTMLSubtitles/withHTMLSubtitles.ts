import EventEmitter from 'eventemitter3';
import cloneDeep from 'lodash.clonedeep';
import deepFreeze from 'deep-freeze';
import Color from 'color';
import { ERROR } from '../error';
import subtitlesParser from './subtitlesParser';
import subtitlesRenderer from './subtitlesRenderer';
import subtitlesConverter from './subtitlesConverter';

export interface HTMLSubtitlesOptions {
  containerElement: HTMLElement;
  streamingServerURL?: string;
  streamingServerSettings?: any;
}

export interface SubtitleTrack {
  id: string;
  url?: string;
  buffer?: ArrayBuffer;
  fallbackUrl?: string;
  lang?: string;
  language?: string;
  label?: string;
  name?: string;
  origin?: string;
  local?: boolean;
  embedded?: boolean;
  exclusive?: boolean;
}

/**
 * withHTMLSubtitles - Higher-Order Component for advanced subtitle support
 * 
 * Based on Stremio's withHTMLSubtitles implementation:
 * - HTML-based subtitle rendering (not native video tracks)
 * - Advanced styling and positioning
 * - SRT/VTT parsing and conversion
 * - Time-synchronized rendering with performance optimization
 */
export default function withHTMLSubtitles(Video: any) {
  class VideoWithHTMLSubtitles extends EventEmitter {
    private video: any;
    private containerElement: HTMLElement;
    private subtitlesElement!: HTMLElement;
    private destroyed = false;
    
    // Subtitle state
    private tracks: SubtitleTrack[] = [];
    private selectedTrackId: string | null = null;
    private cuesByTime: any = null;
    private delay = 0;
    private size = 100;
    private offset = 0;
    private textColor = 'rgb(255, 255, 255)';
    private backgroundColor = 'rgba(0, 0, 0, 0)';
    private outlineColor = 'rgb(34, 34, 34)';
    private opacity = 1;
    
    // Video state
    private videoTime: number | null = null;
    
    // Observed properties
    private observedProps: Record<string, boolean> = {
      extraSubtitlesTracks: false,
      selectedExtraSubtitlesTrackId: false,
      extraSubtitlesDelay: false,
      extraSubtitlesSize: false,
      extraSubtitlesOffset: false,
      extraSubtitlesTextColor: false,
      extraSubtitlesBackgroundColor: false,
      extraSubtitlesOutlineColor: false,
      extraSubtitlesOpacity: false
    };

    constructor(options: HTMLSubtitlesOptions) {
      super();

      if (!(options.containerElement instanceof HTMLElement)) {
        throw new Error('Container element required to be instance of HTMLElement');
      }

      this.containerElement = options.containerElement;
      this.createSubtitlesElement();
      
      // Create base video implementation
      this.video = new Video(options);
      this.setupEventForwarding();
    }

    /**
     * Create subtitle overlay element
     */
    private createSubtitlesElement() {
      this.subtitlesElement = document.createElement('div');
      this.subtitlesElement.style.position = 'absolute';
      this.subtitlesElement.style.right = '0';
      this.subtitlesElement.style.bottom = '0';
      this.subtitlesElement.style.left = '0';
      this.subtitlesElement.style.zIndex = '1';
      this.subtitlesElement.style.textAlign = 'center';
      this.subtitlesElement.style.pointerEvents = 'none'; // Don't block video controls
      
      this.containerElement.style.position = 'relative';
      this.containerElement.style.zIndex = '0';
      this.containerElement.appendChild(this.subtitlesElement);
    }

    /**
     * Set up event forwarding from base video
     */
    private setupEventForwarding() {
      this.video.on('error', (error: any) => {
        this.emit('error', error);
      });

      this.video.on('propValue', (propName: string, propValue: any) => {
        this.handleVideoPropEvent('propValue', propName, propValue);
      });

      this.video.on('propChanged', (propName: string, propValue: any) => {
        this.handleVideoPropEvent('propChanged', propName, propValue);
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
     * Handle video property events
     */
    private handleVideoPropEvent(eventName: string, propName: string, propValue: any) {
      switch (propName) {
        case 'time':
          this.videoTime = propValue;
          this.renderSubtitles();
          break;
      }

      this.emit(eventName, propName, this.getProp(propName, propValue));
    }

    /**
     * Render current subtitles based on video time
     */
    private renderSubtitles() {
      // Clear existing subtitles
      while (this.subtitlesElement.hasChildNodes()) {
        this.subtitlesElement.removeChild(this.subtitlesElement.lastChild!);
      }

      if (this.cuesByTime === null || this.videoTime === null || !isFinite(this.videoTime)) {
        return;
      }

      // Update subtitle positioning and opacity
      this.subtitlesElement.style.bottom = this.offset + '%';
      this.subtitlesElement.style.opacity = this.opacity.toString();

      // Get current cues and render them
      const adjustedTime = this.videoTime - (this.delay / 1000); // delay is in milliseconds
      const cueNodes = subtitlesRenderer.render(this.cuesByTime, adjustedTime);
      
      cueNodes.forEach((cueNode) => {
        this.styleCueNode(cueNode);
        this.subtitlesElement.appendChild(cueNode);
        this.subtitlesElement.appendChild(document.createElement('br'));
      });
    }

    /**
     * Apply styling to subtitle cue node
     */
    private styleCueNode(cueNode: Node) {
      if (!(cueNode instanceof HTMLElement)) return;
      cueNode.style.display = 'inline-block';
      cueNode.style.padding = '0.2em';
      cueNode.style.whiteSpace = 'pre-wrap';
      
      // Calculate font size with responsive scaling
      const fontSizeMultiplier = (window as any).screen720p ? 1.538 : 1;
      cueNode.style.fontSize = Math.floor((this.size / 25) * fontSizeMultiplier) + 'vmin';
      
      // Apply colors
      cueNode.style.color = this.textColor;
      cueNode.style.backgroundColor = this.backgroundColor;
      
      // Apply text outline/shadow for better readability
      const shadowOffsets = [
        '-0.15rem -0.15rem 0.15rem',
        '0px -0.15rem 0.15rem',
        '0.15rem -0.15rem 0.15rem',
        '-0.15rem 0px 0.15rem',
        '0.15rem 0px 0.15rem',
        '-0.15rem 0.15rem 0.15rem',
        '0px 0.15rem 0.15rem',
        '0.15rem 0.15rem 0.15rem'
      ];
      
      const textShadow = shadowOffsets
        .map(offset => `${offset} ${this.outlineColor}`)
        .join(', ');
      
      cueNode.style.textShadow = textShadow;
    }

    /**
     * Load subtitle track
     */
    private async loadSubtitleTrack(track: SubtitleTrack, isFallback = false) {
      try {
        const subtitleData = await this.getSubtitleData(track, isFallback);
        const convertedText = await subtitlesConverter.convert(subtitleData);
        const parsedCues = await subtitlesParser.parse(convertedText);
        
        // Only apply if this track is still selected
        if (this.selectedTrackId === track.id) {
          this.cuesByTime = parsedCues;
          this.renderSubtitles();
          this.emit('extraSubtitlesTrackLoaded', track);
        }
      } catch (error) {
        if (this.selectedTrackId !== track.id) {
          return; // Track was changed while loading
        }

        if (!isFallback && track.fallbackUrl) {
          // Try fallback URL
          this.loadSubtitleTrack(track, true);
          return;
        }

        this.emit('error', {
          ...ERROR.WITH_HTML_SUBTITLES.LOAD_FAILED,
          error,
          track,
          critical: false
        });
      }
    }

    /**
     * Get subtitle data from track
     */
    private async getSubtitleData(track: SubtitleTrack, isFallback = false): Promise<string> {
      const url = isFallback ? track.fallbackUrl : track.url;

      if (typeof url === 'string') {
        const response = await fetch(url);
        if (response.ok) {
          return response.text();
        }
        throw new Error(`${response.status} (${response.statusText})`);
      }

      if (track.buffer instanceof ArrayBuffer) {
        const uint8Array = new Uint8Array(track.buffer);
        return new TextDecoder().decode(uint8Array);
      }

      throw new Error('No `url` or `buffer` field available for this track');
    }

    /**
     * Get property value
     */
    private getProp(propName: string, videoPropValue?: any): any {
      switch (propName) {
        case 'extraSubtitlesTracks':
          return this.destroyed ? [] : this.tracks.slice();
        case 'selectedExtraSubtitlesTrackId':
          return this.destroyed ? null : this.selectedTrackId;
        case 'extraSubtitlesDelay':
          return this.destroyed ? null : this.delay;
        case 'extraSubtitlesSize':
          return this.destroyed ? null : this.size;
        case 'extraSubtitlesOffset':
          return this.destroyed ? null : this.offset;
        case 'extraSubtitlesTextColor':
          return this.destroyed ? null : this.textColor;
        case 'extraSubtitlesBackgroundColor':
          return this.destroyed ? null : this.backgroundColor;
        case 'extraSubtitlesOutlineColor':
          return this.destroyed ? null : this.outlineColor;
        case 'extraSubtitlesOpacity':
          return this.destroyed ? null : this.opacity;
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
        case 'setProp':
          if (this.setProp(frozenAction.propName, frozenAction.propValue)) {
            return;
          }
          break;
        case 'command':
          if (this.command(frozenAction.commandName, frozenAction.commandArgs)) {
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
      const subtitleProps = [
        'extraSubtitlesTracks',
        'selectedExtraSubtitlesTrackId',
        'extraSubtitlesDelay',
        'extraSubtitlesSize',
        'extraSubtitlesOffset',
        'extraSubtitlesTextColor',
        'extraSubtitlesBackgroundColor',
        'extraSubtitlesOutlineColor',
        'extraSubtitlesOpacity'
      ];

      if (subtitleProps.includes(propName)) {
        this.emit('propValue', propName, this.getProp(propName, null));
        this.observedProps[propName] = true;
        return true;
      }

      return false;
    }

    /**
     * Set property
     */
    private setProp(propName: string, propValue: any): boolean {
      switch (propName) {
        case 'selectedExtraSubtitlesTrackId':
          this.setSelectedTrack(propValue);
          return true;
        case 'extraSubtitlesDelay':
          if (this.selectedTrackId !== null && propValue !== null && isFinite(propValue)) {
            this.delay = parseInt(propValue, 10);
            this.renderSubtitles();
            this.emitPropChanged('extraSubtitlesDelay');
          }
          return true;
        case 'extraSubtitlesSize':
          if (propValue !== null && isFinite(propValue)) {
            this.size = Math.max(0, parseInt(propValue, 10));
            this.renderSubtitles();
            this.emitPropChanged('extraSubtitlesSize');
          }
          return true;
        case 'extraSubtitlesOffset':
          if (propValue !== null && isFinite(propValue)) {
            this.offset = Math.max(0, Math.min(100, parseInt(propValue, 10)));
            this.renderSubtitles();
            this.emitPropChanged('extraSubtitlesOffset');
          }
          return true;
        case 'extraSubtitlesTextColor':
          if (typeof propValue === 'string') {
            try {
              this.textColor = Color(propValue).rgb().string();
              this.renderSubtitles();
              this.emitPropChanged('extraSubtitlesTextColor');
            } catch (error) {
              console.error('withHTMLSubtitles', error);
            }
          }
          return true;
        case 'extraSubtitlesBackgroundColor':
          if (typeof propValue === 'string') {
            try {
              this.backgroundColor = Color(propValue).rgb().string();
              this.renderSubtitles();
              this.emitPropChanged('extraSubtitlesBackgroundColor');
            } catch (error) {
              console.error('withHTMLSubtitles', error);
            }
          }
          return true;
        case 'extraSubtitlesOutlineColor':
          if (typeof propValue === 'string') {
            try {
              this.outlineColor = Color(propValue).rgb().string();
              this.renderSubtitles();
              this.emitPropChanged('extraSubtitlesOutlineColor');
            } catch (error) {
              console.error('withHTMLSubtitles', error);
            }
          }
          return true;
        case 'extraSubtitlesOpacity':
          if (typeof propValue === 'number') {
            try {
              this.opacity = Math.min(Math.max(propValue / 100, 0), 1);
              this.renderSubtitles();
              this.emitPropChanged('extraSubtitlesOpacity');
            } catch (error) {
              console.error('withHTMLSubtitles', error);
            }
          }
          return true;
      }

      return false;
    }

    /**
     * Set selected subtitle track
     */
    private setSelectedTrack(trackId: string | null) {
      this.cuesByTime = null;
      this.selectedTrackId = null;
      this.delay = 0;

      const selectedTrack = this.tracks.find(track => track.id === trackId);
      if (selectedTrack) {
        this.selectedTrackId = selectedTrack.id;
        this.delay = 0;
        this.loadSubtitleTrack(selectedTrack);
      }

      this.renderSubtitles();
      this.emitPropChanged('selectedExtraSubtitlesTrackId');
      this.emitPropChanged('extraSubtitlesDelay');
    }

    /**
     * Handle commands
     */
    private command(commandName: string, commandArgs?: any): boolean {
      switch (commandName) {
        case 'addExtraSubtitlesTracks':
          if (commandArgs?.tracks && Array.isArray(commandArgs.tracks)) {
            this.addSubtitleTracks(commandArgs.tracks);
          }
          return true;
        case 'addLocalSubtitles':
          if (commandArgs?.filename && commandArgs?.buffer instanceof ArrayBuffer) {
            this.addLocalSubtitles(commandArgs.filename, commandArgs.buffer);
          }
          return true;
        case 'load':
          this.handleLoadCommand(commandArgs);
          return false; // Let base video handle it too
        case 'unload':
          this.unload();
          return false; // Let base video handle it too
        case 'destroy':
          this.destroy();
          return true;
      }

      return false;
    }

    /**
     * Add subtitle tracks
     */
    private addSubtitleTracks(newTracks: SubtitleTrack[]) {
      const validTracks = newTracks.filter((track, index, tracks) => {
        return track &&
               typeof track.id === 'string' &&
               typeof track.lang === 'string' &&
               typeof track.label === 'string' &&
               typeof track.origin === 'string' &&
               !track.embedded &&
               index === tracks.findIndex(t => t.id === track.id);
      });

      this.tracks = this.tracks.concat(validTracks);
      this.emitPropChanged('extraSubtitlesTracks');
    }

    /**
     * Add local subtitle file
     */
    private addLocalSubtitles(filename: string, buffer: ArrayBuffer) {
      const id = 'LOCAL_' + this.tracks.filter(track => track.local).length;
      
      const track: SubtitleTrack = {
        id,
        buffer,
        lang: 'local',
        label: filename,
        origin: 'LOCAL',
        local: true,
        embedded: false
      };

      this.tracks.push(track);
      this.emitPropChanged('extraSubtitlesTracks');
      this.emit('extraSubtitlesTrackAdded', track);
    }

    /**
     * Handle load command
     */
    private handleLoadCommand(commandArgs: any) {
      this.unload();
      if (commandArgs?.stream?.subtitles && Array.isArray(commandArgs.stream.subtitles)) {
        const exclusiveSubtitles = commandArgs.stream.subtitles.map((track: any) => ({
          ...track,
          origin: 'EXCLUSIVE',
          exclusive: true,
          embedded: false
        }));
        this.addSubtitleTracks(exclusiveSubtitles);
      }
    }

    /**
     * Unload subtitles
     */
    private unload() {
      this.cuesByTime = null;
      this.tracks = [];
      this.selectedTrackId = null;
      this.delay = 0;
      this.renderSubtitles();
      this.emitPropChanged('extraSubtitlesTracks');
      this.emitPropChanged('selectedExtraSubtitlesTrackId');
      this.emitPropChanged('extraSubtitlesDelay');
    }

    /**
     * Emit property changed event
     */
    private emitPropChanged(propName: string) {
      if (this.observedProps[propName]) {
        this.emit('propChanged', propName, this.getProp(propName, null));
      }
    }

    /**
     * Destroy the component
     */
    private destroy() {
      if (this.destroyed) return;
      this.destroyed = true;

      this.unload();
      
      // Emit prop changed events for cleanup
      Object.keys(this.observedProps).forEach(propName => {
        this.emitPropChanged(propName);
      });

      if (this.video) {
        this.video.dispatch({ type: 'command', commandName: 'destroy' });
      }

      if (this.subtitlesElement && this.containerElement.contains(this.subtitlesElement)) {
        this.containerElement.removeChild(this.subtitlesElement);
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
     * Enhanced manifest with subtitle capabilities
     */
    public static manifest = {
      name: Video.manifest.name + 'WithHTMLSubtitles',
      external: Video.manifest.external,
      props: Video.manifest.props.concat([
        'extraSubtitlesTracks',
        'selectedExtraSubtitlesTrackId',
        'extraSubtitlesDelay',
        'extraSubtitlesSize',
        'extraSubtitlesOffset',
        'extraSubtitlesTextColor',
        'extraSubtitlesBackgroundColor',
        'extraSubtitlesOutlineColor',
        'extraSubtitlesOpacity'
      ]).filter((value: string, index: number, array: string[]) => array.indexOf(value) === index),
      commands: Video.manifest.commands.concat([
        'addExtraSubtitlesTracks',
        'addLocalSubtitles'
      ]).filter((value: string, index: number, array: string[]) => array.indexOf(value) === index),
      events: Video.manifest.events.concat([
        'extraSubtitlesTrackLoaded',
        'extraSubtitlesTrackAdded'
      ]).filter((value: string, index: number, array: string[]) => array.indexOf(value) === index)
    };
  }

  return VideoWithHTMLSubtitles;
}