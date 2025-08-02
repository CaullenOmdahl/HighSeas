import EventEmitter from 'eventemitter3';
import cloneDeep from 'lodash.clonedeep';
import deepFreeze from 'deep-freeze';
import { ERROR } from '../error';
import convertStream from './convertStream';

export interface StreamingServerOptions {
  containerElement: HTMLElement;
  streamingServerURL?: string;
  streamingServerSettings?: {
    proxyStreamsEnabled?: boolean;
  };
}

/**
 * withStreamingServer - Higher-Order Component for server-side streaming support
 * 
 * This HOC adds streaming server capabilities to any video implementation:
 * - Magnet link conversion to direct streams
 * - Proxy support for CORS and headers
 * - Torrent streaming integration
 * - Server-side transcoding coordination
 */
export default function withStreamingServer(Video: any) {
  class VideoWithStreamingServer extends EventEmitter {
    private video: any;
    private streamingServerURL?: string;
    private streamingServerSettings?: any;
    private destroyed = false;

    constructor(options: StreamingServerOptions) {
      super();

      if (!(options.containerElement instanceof HTMLElement)) {
        throw new Error('Container element required to be instance of HTMLElement');
      }

      this.streamingServerURL = options.streamingServerURL;
      this.streamingServerSettings = options.streamingServerSettings;

      // Create the base video implementation
      this.video = new Video(options);

      // Forward all events from base video
      this.setupEventForwarding();
    }

    /**
     * Set up event forwarding from base video implementation
     */
    private setupEventForwarding() {
      this.video.on('error', (error: any) => {
        this.emit('error', error);
      });

      this.video.on('propValue', (propName: string, propValue: any) => {
        this.emit('propValue', propName, propValue);
      });

      this.video.on('propChanged', (propName: string, propValue: any) => {
        this.emit('propChanged', propName, propValue);
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
     * Handle dispatched actions
     */
    public dispatch(action: any) {
      if (this.destroyed || !action) return;

      const frozenAction = deepFreeze(cloneDeep(action));

      switch (frozenAction.type) {
        case 'command':
          if (frozenAction.commandName === 'load') {
            this.handleLoadCommand(frozenAction.commandArgs);
            return;
          }
          break;
      }

      // Forward other actions to base video
      this.video.dispatch(frozenAction);
    }

    /**
     * Handle load command with streaming server conversion
     */
    private async handleLoadCommand(commandArgs: any) {
      if (!commandArgs?.stream) {
        this.video.dispatch({
          type: 'command',
          commandName: 'load',
          commandArgs
        });
        return;
      }

      try {
        // Convert stream if streaming server is available
        const convertedStream = await this.convertStreamIfNeeded(
          commandArgs.stream,
          commandArgs.seriesInfo
        );

        // Load with converted stream
        this.video.dispatch({
          type: 'command',
          commandName: 'load',
          commandArgs: {
            ...commandArgs,
            stream: convertedStream
          }
        });
      } catch (error) {
        this.emit('error', {
          ...ERROR.WITH_STREAMING_SERVER.CONVERT_FAILED,
          error,
          critical: true
        });
      }
    }

    /**
     * Convert stream via streaming server if needed
     */
    private async convertStreamIfNeeded(stream: any, seriesInfo?: any): Promise<any> {
      // If no streaming server URL, return original stream
      if (!this.streamingServerURL) {
        return stream;
      }

      try {
        const convertedStream = await convertStream(
          this.streamingServerURL,
          stream,
          seriesInfo,
          this.streamingServerSettings
        );

        return convertedStream;
      } catch (error) {
        console.warn('Stream conversion failed, using original stream:', error);
        return stream;
      }
    }

    /**
     * Destroy the video player
     */
    public destroy() {
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
     * Enhanced manifest with streaming server capabilities
     */
    public static manifest = {
      name: Video.manifest.name + 'WithStreamingServer',
      external: Video.manifest.external,
      props: Video.manifest.props,
      commands: Video.manifest.commands,
      events: Video.manifest.events.concat(['streamConvertStart', 'streamConvertEnd'])
        .filter((value: string, index: number, array: string[]) => array.indexOf(value) === index)
    };
  }

  return VideoWithStreamingServer;
}