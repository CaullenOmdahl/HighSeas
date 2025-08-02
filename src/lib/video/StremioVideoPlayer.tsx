import React, { useEffect, useRef, useCallback } from 'react';
import StremioVideo from './StremioVideo';
import type { StreamProps, StremioVideoOptions, StremioVideoInstance } from './StremioVideo/StremioVideo';

export interface StremioVideoPlayerProps {
  stream?: StreamProps;
  seriesInfo?: any;
  streamingServerURL?: string;
  streamingServerSettings?: {
    proxyStreamsEnabled?: boolean;
  };
  onError?: (error: any) => void;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onLoadedMetadata?: () => void;
  onLoadStart?: () => void;
  onSubtitleTrackLoaded?: (track: any) => void;
  className?: string;
  style?: React.CSSProperties;
  autoPlay?: boolean;
  controls?: boolean;
}

/**
 * StremioVideoPlayer - React wrapper for Stremio video system
 * 
 * This component provides a React interface to the Stremio video player
 * with full support for HEVC/H.265 streaming, advanced subtitles,
 * and server-side transcoding integration.
 */
export const StremioVideoPlayer: React.FC<StremioVideoPlayerProps> = ({
  stream,
  seriesInfo,
  streamingServerURL,
  streamingServerSettings,
  onError,
  onTimeUpdate,
  onDurationChange,
  onPlay,
  onPause,
  onEnded,
  onLoadedMetadata,
  onLoadStart,
  onSubtitleTrackLoaded,
  className,
  style,
  autoPlay = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoPlayerRef = useRef<StremioVideoInstance | null>(null);

  /**
   * Initialize the Stremio video player
   */
  const initializePlayer = useCallback(() => {
    if (!containerRef.current || videoPlayerRef.current) {
      return;
    }

    try {
      const options: StremioVideoOptions = {
        containerElement: containerRef.current,
        streamingServerURL,
        streamingServerSettings
      };

      videoPlayerRef.current = new StremioVideo(options);

      // Set up event listeners
      setupEventListeners();

      // Load stream if provided
      if (stream) {
        videoPlayerRef.current.load({ 
          stream, 
          seriesInfo,
          streamingServerURL,
          streamingServerSettings
        });
      }
    } catch (error) {
      console.error('Failed to initialize Stremio video player:', error);
      onError?.(error);
    }
  }, [streamingServerURL, streamingServerSettings, stream, seriesInfo, onError]);

  /**
   * Set up event listeners for the video player
   */
  const setupEventListeners = useCallback(() => {
    if (!videoPlayerRef.current) return;

    const player = videoPlayerRef.current;

    // Error handling
    player.on('error', (error) => {
      console.error('Stremio video error:', error);
      onError?.(error);
    });

    // Property value updates
    player.on('propValue', (propName: string, propValue: any) => {
      switch (propName) {
        case 'time':
          onTimeUpdate?.(propValue);
          break;
        case 'duration':
          onDurationChange?.(propValue);
          break;
      }
    });

    // Property change events
    player.on('propChanged', (propName: string, propValue: any) => {
      switch (propName) {
        case 'paused':
          if (propValue) {
            onPause?.();
          } else {
            onPlay?.();
          }
          break;
      }
    });

    // Video events
    if (onLoadStart) player.on('loadstart', onLoadStart);
    if (onLoadedMetadata) player.on('loadedmetadata', onLoadedMetadata);
    if (onEnded) player.on('ended', onEnded);

    // Subtitle events
    if (onSubtitleTrackLoaded) player.on('extraSubtitlesTrackLoaded', onSubtitleTrackLoaded);

    // Observe important properties
    player.observeProp('time');
    player.observeProp('duration');
    player.observeProp('paused');
    player.observeProp('volume');
    player.observeProp('buffering');
  }, [
    onError,
    onTimeUpdate,
    onDurationChange,
    onPlay,
    onPause,
    onEnded,
    onLoadedMetadata,
    onLoadStart,
    onSubtitleTrackLoaded
  ]);

  /**
   * Load a new stream
   */
  const loadStream = useCallback((newStream: StreamProps, newSeriesInfo?: any) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.load({
        stream: newStream, 
        seriesInfo: newSeriesInfo,
        streamingServerURL,
        streamingServerSettings
      });
    }
  }, [streamingServerURL, streamingServerSettings]);

  /**
   * Play the video
   */
  const play = useCallback(() => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.setProp('paused', false);
    }
  }, []);

  /**
   * Pause the video
   */
  const pause = useCallback(() => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.setProp('paused', true);
    }
  }, []);

  /**
   * Seek to a specific time
   */
  const seek = useCallback((time: number) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.setProp('time', time);
    }
  }, []);

  /**
   * Set volume
   */
  const setVolume = useCallback((volume: number) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.setProp('volume', Math.max(0, Math.min(1, volume)));
    }
  }, []);

  /**
   * Set muted state
   */
  const setMuted = useCallback((muted: boolean) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.setProp('muted', muted);
    }
  }, []);

  /**
   * Add subtitle tracks
   */
  const addSubtitleTracks = useCallback((tracks: any[]) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.command('addExtraSubtitlesTracks', { tracks });
    }
  }, []);

  /**
   * Select subtitle track
   */
  const selectSubtitleTrack = useCallback((trackId: string | null) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.setProp('selectedExtraSubtitlesTrackId', trackId);
    }
  }, []);

  /**
   * Set subtitle delay
   */
  const setSubtitleDelay = useCallback((delay: number) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.setProp('extraSubtitlesDelay', delay);
    }
  }, []);

  // Initialize player on mount
  useEffect(() => {
    initializePlayer();

    return () => {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.destroy();
        videoPlayerRef.current = null;
      }
    };
  }, [initializePlayer]);

  // Handle stream changes
  useEffect(() => {
    if (stream && videoPlayerRef.current) {
      loadStream(stream, seriesInfo);
    }
  }, [stream, seriesInfo, loadStream]);

  // Auto-play handling
  useEffect(() => {
    if (autoPlay && videoPlayerRef.current) {
      // Delay auto-play to ensure video is loaded
      const timer = setTimeout(() => {
        play();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [autoPlay, play]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#000',
        ...style
      }}
    />
  );
};

export default StremioVideoPlayer;