// React Wrapper for Stremio Video Player
// Integrates Stremio's video architecture with React

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { StremioVideoSystem } from './StremioVideoSystem';

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
  // Additional subtitle properties
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

export interface StremioVideoPlayerProps {
  stream?: string | null;
  paused?: boolean;
  time?: number;
  volume?: number;
  muted?: boolean;
  playbackSpeed?: number;
  subtitleTrack?: SubtitleTrack | null;
  subtitlesSize?: number;
  subtitlesOffset?: number;
  subtitlesTextColor?: string;
  subtitlesBackgroundColor?: string;
  subtitlesOutlineColor?: string;
  subtitlesOpacity?: number;
  onPropChanged?: (propName: keyof VideoProperties, propValue: any) => void;
  onError?: (error: any) => void;
  onEnded?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export interface StremioVideoPlayerRef {
  dispatch: (action: any) => void;
  destroy: () => void;
}

const StremioVideoPlayer = forwardRef<StremioVideoPlayerRef, StremioVideoPlayerProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoInstanceRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    dispatch: (action: any) => {
      if (videoInstanceRef.current) {
        videoInstanceRef.current.dispatch(action);
      }
    },
    destroy: () => {
      if (videoInstanceRef.current) {
        videoInstanceRef.current.destroy();
        videoInstanceRef.current = null;
      }
    }
  }));

  useEffect(() => {
    if (!containerRef.current) {
      console.warn('StremioVideoPlayer: Container element not ready');
      return;
    }

    console.log('StremioVideoPlayer: Initializing video system');
    
    // Create Stremio video system instance
    videoInstanceRef.current = new StremioVideoSystem({
      containerElement: containerRef.current
    });

    // Set up event listeners
    if (props.onPropChanged) {
      videoInstanceRef.current.on('propChanged', props.onPropChanged);
    }

    if (props.onError) {
      videoInstanceRef.current.on('error', props.onError);
    }

    if (props.onEnded) {
      videoInstanceRef.current.on('ended', props.onEnded);
    }

    // Observe all properties we care about
    const propsToObserve: (keyof VideoProperties)[] = [
      'loaded', 'paused', 'time', 'duration', 'buffering', 'buffered',
      'volume', 'muted', 'playbackSpeed', 'audioTracks', 'subtitlesTracks'
    ];

    propsToObserve.forEach(propName => {
      videoInstanceRef.current.dispatch({
        type: 'observeProp',
        propName
      });
    });

    return () => {
      if (videoInstanceRef.current) {
        videoInstanceRef.current.destroy();
        videoInstanceRef.current = null;
      }
    };
  }, [props.onPropChanged, props.onError, props.onEnded]);

  // Handle subtitle track changes
  useEffect(() => {
    if (!videoInstanceRef.current) return;

    if (props.subtitleTrack) {
      videoInstanceRef.current.loadSubtitleTrack(props.subtitleTrack);
    } else {
      videoInstanceRef.current.loadSubtitleTrack(null);
    }
  }, [props.subtitleTrack]);

  // Update video properties when props change
  useEffect(() => {
    if (!videoInstanceRef.current) return;

    if (props.stream !== undefined) {
      videoInstanceRef.current.dispatch({
        type: 'setProp',
        propName: 'stream',
        propValue: props.stream
      });
    }
  }, [props.stream]);

  useEffect(() => {
    if (!videoInstanceRef.current) return;

    if (props.paused !== undefined) {
      videoInstanceRef.current.dispatch({
        type: 'setProp',
        propName: 'paused',
        propValue: props.paused
      });
    }
  }, [props.paused]);

  useEffect(() => {
    if (!videoInstanceRef.current) return;

    if (props.time !== undefined) {
      videoInstanceRef.current.dispatch({
        type: 'setProp',
        propName: 'time',
        propValue: props.time
      });
    }
  }, [props.time]);

  useEffect(() => {
    if (!videoInstanceRef.current) return;

    if (props.volume !== undefined) {
      videoInstanceRef.current.dispatch({
        type: 'setProp',
        propName: 'volume',
        propValue: props.volume
      });
    }
  }, [props.volume]);

  useEffect(() => {
    if (!videoInstanceRef.current) return;

    if (props.muted !== undefined) {
      videoInstanceRef.current.dispatch({
        type: 'setProp',
        propName: 'muted',
        propValue: props.muted
      });
    }
  }, [props.muted]);

  useEffect(() => {
    if (!videoInstanceRef.current) return;

    if (props.playbackSpeed !== undefined) {
      videoInstanceRef.current.dispatch({
        type: 'setProp',
        propName: 'playbackSpeed',
        propValue: props.playbackSpeed
      });
    }
  }, [props.playbackSpeed]);

  // Subtitle styling properties
  useEffect(() => {
    if (!videoInstanceRef.current) return;

    if (props.subtitlesSize !== undefined) {
      videoInstanceRef.current.dispatch({
        type: 'setProp',
        propName: 'extraSubtitlesSize',
        propValue: props.subtitlesSize
      });
    }
  }, [props.subtitlesSize]);

  useEffect(() => {
    if (!videoInstanceRef.current) return;

    if (props.subtitlesOffset !== undefined) {
      videoInstanceRef.current.dispatch({
        type: 'setProp',
        propName: 'extraSubtitlesOffset',
        propValue: props.subtitlesOffset
      });
    }
  }, [props.subtitlesOffset]);

  useEffect(() => {
    if (!videoInstanceRef.current) return;

    if (props.subtitlesTextColor !== undefined) {
      videoInstanceRef.current.dispatch({
        type: 'setProp',
        propName: 'extraSubtitlesTextColor',
        propValue: props.subtitlesTextColor
      });
    }
  }, [props.subtitlesTextColor]);

  useEffect(() => {
    if (!videoInstanceRef.current) return;

    if (props.subtitlesBackgroundColor !== undefined) {
      videoInstanceRef.current.dispatch({
        type: 'setProp',
        propName: 'extraSubtitlesBackgroundColor',
        propValue: props.subtitlesBackgroundColor
      });
    }
  }, [props.subtitlesBackgroundColor]);

  useEffect(() => {
    if (!videoInstanceRef.current) return;

    if (props.subtitlesOutlineColor !== undefined) {
      videoInstanceRef.current.dispatch({
        type: 'setProp',
        propName: 'extraSubtitlesOutlineColor',
        propValue: props.subtitlesOutlineColor
      });
    }
  }, [props.subtitlesOutlineColor]);

  useEffect(() => {
    if (!videoInstanceRef.current) return;

    if (props.subtitlesOpacity !== undefined) {
      videoInstanceRef.current.dispatch({
        type: 'setProp',
        propName: 'extraSubtitlesOpacity',
        propValue: props.subtitlesOpacity
      });
    }
  }, [props.subtitlesOpacity]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        ...props.style
      }}
      className={props.className}
    />
  );
});

StremioVideoPlayer.displayName = 'StremioVideoPlayer';

export default StremioVideoPlayer;