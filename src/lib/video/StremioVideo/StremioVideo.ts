import EventEmitter from 'eventemitter3';
import deepFreeze from 'deep-freeze';
import cloneDeep from 'lodash.clonedeep';
import selectVideoImplementation from './selectVideoImplementation';
import platform from '../platform';
import { ERROR } from '../error';

export interface StreamProps {
  url?: string;
  infoHash?: string;
  fileIdx?: number;
  externalUrl?: string;
  ytId?: string;
  playerFrameUrl?: string;
  subtitles?: Array<{
    id: string;
    url: string;
    lang: string;
    label: string;
    origin: string;
  }>;
  behaviorHints?: {
    proxyHeaders?: {
      request?: Record<string, string>;
      response?: Record<string, string>;
    };
    videoHash?: string;
    videoSize?: number;
    filename?: string;
  };
}

export interface CommandArgs {
  stream?: StreamProps;
  platform?: string;
  streamingServerURL?: string;
  [key: string]: any;
}

export interface ActionProps {
  type: 'observeProp' | 'setProp' | 'command';
  propName?: string;
  propValue?: any;
  commandName?: string;
  commandArgs?: CommandArgs;
}

export interface StremioVideoOptions {
  [key: string]: any;
}

export interface StremioVideoInstance {
  on(eventName: string, listener: (...args: any[]) => void): void;
  dispatch(action: ActionProps, options?: StremioVideoOptions): void;
  destroy(): void;
  
  // Convenience methods that internally use dispatch
  load(commandArgs: CommandArgs): void;
  setProp(propName: string, propValue: any): void;
  observeProp(propName: string): void;
  command(commandName: string, commandArgs?: CommandArgs): void;
}

export interface StremioVideoConstructor {
  new (options?: StremioVideoOptions): StremioVideoInstance;
  ERROR: typeof ERROR;
}

/**
 * StremioVideo - Main controller for Stremio video player
 * 
 * Exact 1:1 implementation of stremio-video-reference/src/StremioVideo/StremioVideo.js
 */
function StremioVideo(this: any, options?: StremioVideoOptions) {
    let video: any = null;
    const events = new EventEmitter();
    let destroyed = false;

    // Public methods
    this.on = function(eventName: string, listener: (...args: any[]) => void) {
        if (destroyed) {
            throw new Error('Video is destroyed');
        }
        events.on(eventName, listener);
    };

    this.dispatch = function(action: ActionProps, options: StremioVideoOptions = {}) {
        if (destroyed) {
            throw new Error('Video is destroyed');
        }

        if (action) {
            const frozenAction = deepFreeze(cloneDeep(action));
            
            if (frozenAction.type === 'command' && frozenAction.commandName === 'load' && frozenAction.commandArgs) {
                if (frozenAction.commandArgs.platform) {
                    platform.set(frozenAction.commandArgs.platform);
                }
                
                const Video = selectVideoImplementation(frozenAction.commandArgs, options);
                
                if (video !== null && video.constructor !== Video) {
                    video.dispatch({ type: 'command', commandName: 'destroy' });
                    video = null;
                }
                
                if (video === null) {
                    if (Video === null) {
                        events.emit('error', {
                            ...ERROR.GENERAL.NO_IMPLEMENTATION,
                            error: new Error('No video implementation was selected'),
                            critical: true,
                            stream: frozenAction.commandArgs.stream
                        });
                        return;
                    }

                    video = new Video(options);
                    
                    // Forward all events from video implementation
                    video.on('ended', function() {
                        events.emit('ended');
                    });
                    video.on('error', function(args: any) {
                        events.emit('error', args);
                    });
                    video.on('propValue', function(propName: string, propValue: any) {
                        events.emit('propValue', propName, propValue);
                    });
                    video.on('propChanged', function(propName: string, propValue: any) {
                        events.emit('propChanged', propName, propValue);
                    });
                    video.on('subtitlesTrackLoaded', function(track: any) {
                        events.emit('subtitlesTrackLoaded', track);
                    });
                    video.on('audioTrackLoaded', function(track: any) {
                        events.emit('audioTrackLoaded', track);
                    });
                    video.on('extraSubtitlesTrackLoaded', function(track: any) {
                        events.emit('extraSubtitlesTrackLoaded', track);
                    });
                    video.on('extraSubtitlesTrackAdded', function(track: any) {
                        events.emit('extraSubtitlesTrackAdded', track);
                    });
                    
                    if (Video.manifest.external) {
                        video.on('implementationChanged', function(manifest: any) {
                            events.emit('implementationChanged', manifest);
                        });
                    } else {
                        events.emit('implementationChanged', Video.manifest);
                    }
                }
            }

            if (video !== null) {
                try {
                    video.dispatch(frozenAction);
                } catch (error) {
                    console.error(video.constructor.manifest.name, error);
                }
            }

            if (frozenAction.type === 'command' && frozenAction.commandName === 'destroy') {
                video = null;
            }

            return;
        }

        throw new Error('Invalid action dispatched: ' + JSON.stringify(action));
    };

    this.destroy = function() {
        destroyed = true;
        if (video !== null) {
            video.dispatch({ type: 'command', commandName: 'destroy' });
            video = null;
        }
        events.removeAllListeners();
    };

    // Convenience methods
    this.load = function(commandArgs: CommandArgs) {
        this.dispatch({ type: 'command', commandName: 'load', commandArgs });
    };

    this.setProp = function(propName: string, propValue: any) {
        this.dispatch({ type: 'setProp', propName, propValue });
    };

    this.observeProp = function(propName: string) {
        this.dispatch({ type: 'observeProp', propName });
    };

    this.command = function(commandName: string, commandArgs?: CommandArgs) {
        this.dispatch({ type: 'command', commandName, commandArgs });
    };
}

// Static property
(StremioVideo as any).ERROR = ERROR;

export { StremioVideo };
export default StremioVideo as unknown as StremioVideoConstructor;