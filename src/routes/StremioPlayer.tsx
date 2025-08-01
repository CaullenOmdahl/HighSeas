// Enhanced Player with Stremio Video Player
// Replaces the basic HTML5 video with full Stremio capabilities

import { memo, useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import classnames from 'classnames';
import Icon from '../stremio/components/Icon/Icon';
import StremioVideoPlayer, { 
  StremioVideoPlayerRef, 
  VideoProperties, 
  SubtitleTrack 
} from '../lib/video/StremioVideoPlayer';
import styles from './Player.module.less';

const StremioPlayer = memo(() => {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const playerRef = useRef<StremioVideoPlayerRef>(null);
  
  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subtitle state
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);
  const [selectedSubtitleTrack, setSelectedSubtitleTrack] = useState<SubtitleTrack | null>(null);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [subtitleSettings, setSubtitleSettings] = useState({
    size: 25,
    offset: 0,
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    outlineColor: '#000000',
    opacity: 100
  });

  // Advanced controls
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [muted, setMuted] = useState(false);

  const streamUrl = searchParams.get('stream');
  const quality = searchParams.get('quality');
  const season = searchParams.get('season');
  const episode = searchParams.get('episode');

  // Debug logging (only log when params change)
  useEffect(() => {
    console.log('StremioPlayer params:', { id, streamUrl, quality, season, episode });
  }, [id, streamUrl, quality, season, episode]);

  // Handle property changes from video player
  const handlePropChanged = useCallback((propName: keyof VideoProperties, propValue: any) => {
    switch (propName) {
      case 'loaded':
        if (propValue) {
          setLoading(false);
        }
        break;
      case 'paused':
        setIsPlaying(!propValue);
        break;
      case 'time':
        if (typeof propValue === 'number') {
          setCurrentTime(propValue / 1000); // Convert to seconds
        }
        break;
      case 'duration':
        if (typeof propValue === 'number') {
          setDuration(propValue / 1000); // Convert to seconds
        }
        break;
      case 'buffering':
        setBuffering(!!propValue);
        break;
      case 'volume':
        if (typeof propValue === 'number') {
          setVolume(propValue);
        }
        break;
      case 'muted':
        setMuted(!!propValue);
        break;
      case 'playbackSpeed':
        if (typeof propValue === 'number') {
          setPlaybackSpeed(propValue);
        }
        break;
      case 'subtitlesTracks':
        if (Array.isArray(propValue)) {
          setSubtitleTracks(propValue);
        }
        break;
    }
  }, []);

  // Handle video errors
  const handleVideoError = useCallback((error: any) => {
    console.error('Video error:', error);
    
    // Check if this is a Real-Debrid link that may have expired
    if (streamUrl?.includes('real-debrid.com') && (error.code === 4 || error.message?.includes('404') || error.message?.includes('Network error'))) {
      setError('🔄 Stream link expired, refreshing...');
      // Go back to the previous page to select a new stream
      setTimeout(() => {
        window.history.back();
      }, 2000);
      return;
    }
    
    setError(error.message || 'Video playback error');
    setLoading(false);
  }, [streamUrl]);

  // Handle video end
  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
    // Could implement next episode logic here
  }, []);

  // Load subtitles for the current content
  useEffect(() => {
    if (!id || !streamUrl) return;

    // In a real implementation, you would fetch subtitle tracks from your Stremio addons
    // For now, we'll create some demo subtitle tracks with working URLs
    const demoSubtitles: SubtitleTrack[] = [
      {
        id: 'en',
        name: 'English',
        language: 'en',
        url: 'https://raw.githubusercontent.com/brenopolanski/html5-video-webvtt-example/master/MIB2-subtitles-pt-BR.vtt'
      },
      {
        id: 'disabled',
        name: 'No Subtitles',
        language: 'none',
        url: ''
      }
    ];

    setSubtitleTracks(demoSubtitles);
  }, [id, streamUrl]);

  const convertMagnetToStream = useCallback(async (magnetLink: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/realdebrid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ magnetLink }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Real-Debrid API request failed');
      }
      
      const result = await response.json();
      
      if (result.status === 'ready' && result.streamUrl) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('stream', result.streamUrl);
        window.history.replaceState({}, '', newUrl.toString());
        window.location.reload();
        return;
      }
      
      if (result.status === 'processing') {
        setError(`⏳ ${result.message || 'Processing magnet link...'}`);
        setLoading(false);
        setTimeout(() => {
          if (streamUrl === magnetLink) {
            convertMagnetToStream(magnetLink);
          }
        }, 5000);
        return;
      }
      
      setError(`❌ ${result.message || 'Failed to process magnet link'}`);
      setLoading(false);
      
    } catch (error) {
      console.error('Magnet conversion error:', error);
      setError(`🚫 Real-Debrid Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  }, [streamUrl]);

  // Initialize player
  useEffect(() => {
    
    if (!streamUrl) {
      console.log('No stream URL provided, showing error');
      setError('No stream URL provided. Please select a stream from the episode details page.');
      setLoading(false);
      return;
    }

    // Check if this is a magnet link that needs conversion
    if (streamUrl.startsWith('magnet:')) {
      convertMagnetToStream(streamUrl);
      return;
    }

    // For valid HTTP streams, show the player after a brief delay
    const initTimeout = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(initTimeout);
  }, [streamUrl, convertMagnetToStream]);

  // Control handlers
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handleMuteToggle = () => {
    setMuted(!muted);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const handleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Subtitle controls
  const handleSubtitleToggle = () => {
    setSubtitlesEnabled(!subtitlesEnabled);
  };

  const handleSubtitleTrackChange = (track: SubtitleTrack | null) => {
    setSelectedSubtitleTrack(track);
    setSubtitlesEnabled(!!track);
  };

  const handleSubtitleSettingChange = (setting: string, value: any) => {
    setSubtitleSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  if (loading) {
    return (
      <div className={styles['player-container']}>
        <div className={styles['loading-screen']}>
          <div className={styles['loading-spinner']} />
          <p>Loading Stremio player...</p>
          <small style={{ marginTop: '10px', opacity: 0.7 }}>
            Stream: {streamUrl ? `${streamUrl.substring(0, 50)}...` : 'No URL'}
          </small>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['player-container']}>
        <div className={styles['error-screen']}>
          <div className={styles['error-content']}>
            <Icon icon="close" size="large" />
            <h2>Stream Not Available</h2>
            <p>{error}</p>
            
            <div className={styles['stream-info']}>
              <p><strong>Stream URL:</strong> {streamUrl}</p>
              {quality && <p><strong>Quality:</strong> {quality}</p>}
              {season && episode && (
                <p><strong>Episode:</strong> S{season}E{episode}</p>
              )}
            </div>
            
            <div className={styles['error-actions']}>
              <button onClick={handleBack} className={styles['back-button']}>
                <Icon icon="back" /> Back to Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classnames(styles['player-container'], {
      [styles['fullscreen']]: isFullscreen
    })}>
      {/* Stremio Video Player */}
      <StremioVideoPlayer
        ref={playerRef}
        stream={streamUrl}
        paused={!isPlaying}
        time={currentTime * 1000} // Convert to milliseconds
        volume={volume}
        muted={muted}
        playbackSpeed={playbackSpeed}
        subtitleTrack={subtitlesEnabled ? selectedSubtitleTrack : null}
        subtitlesSize={subtitleSettings.size}
        subtitlesOffset={subtitleSettings.offset}
        subtitlesTextColor={subtitleSettings.textColor}
        subtitlesBackgroundColor={subtitleSettings.backgroundColor}
        subtitlesOutlineColor={subtitleSettings.outlineColor}
        subtitlesOpacity={subtitleSettings.opacity}
        onPropChanged={handlePropChanged}
        onError={handleVideoError}
        onEnded={handleVideoEnded}
        className={styles['video-player']}
      />

      {/* Buffering Indicator */}
      {buffering && (
        <div className={styles['buffering-overlay']}>
          <div className={styles['loading-spinner']} />
        </div>
      )}

      {/* Controls Overlay */}
      <div className={classnames(styles['controls-overlay'], {
        [styles['visible']]: showControls
      })}>
        {/* Top Controls */}
        <div className={styles['top-controls']}>
          <button onClick={handleBack} className={styles['control-button']}>
            <Icon icon="back" />
          </button>
          <div className={styles['stream-info']}>
            <span className={styles['stream-title']}>
              {season && episode ? `S${season}E${episode} - ` : ''}Content {id}
            </span>
            {quality && (
              <span className={styles['stream-quality']}>{quality}</span>
            )}
          </div>
          
          {/* Subtitle Controls */}
          <div className={styles['subtitle-controls']}>
            <button 
              onClick={handleSubtitleToggle}
              className={classnames(styles['control-button'], {
                [styles['active']]: subtitlesEnabled
              })}
              title="Toggle Subtitles"
            >
              <Icon icon="subtitles" />
            </button>
            
            {subtitleTracks.length > 0 && (
              <select 
                value={selectedSubtitleTrack?.id || ''} 
                onChange={(e) => {
                  const track = subtitleTracks.find(t => t.id === e.target.value) || null;
                  handleSubtitleTrackChange(track);
                }}
                className={styles['subtitle-select']}
              >
                <option value="">No Subtitles</option>
                {subtitleTracks.map(track => (
                  <option key={track.id} value={track.id}>{track.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Center Play Button */}
        <div className={styles['center-controls']}>
          <button 
            onClick={handlePlayPause}
            className={classnames(styles['play-button'], styles['large'])}
          >
            <Icon icon={isPlaying ? 'pause' : 'play'} size="large" />
          </button>
        </div>

        {/* Bottom Controls */}
        <div className={styles['bottom-controls']}>
          <div className={styles['progress-section']}>
            <div className={styles['time-display']}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <div className={styles['progress-bar']}>
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={(e) => handleSeek(Number(e.target.value))}
                className={styles['progress-slider']}
              />
            </div>
          </div>

          <div className={styles['control-buttons']}>
            <button onClick={handlePlayPause} className={styles['control-button']}>
              <Icon icon={isPlaying ? 'pause' : 'play'} />
            </button>
            
            <div className={styles['volume-control']}>
              <button onClick={handleMuteToggle} className={styles['control-button']}>
                <Icon icon={muted ? 'volume-mute' : 'volume'} />
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={muted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className={styles['volume-slider']}
              />
            </div>

            {/* Speed Control */}
            <select 
              value={playbackSpeed} 
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
              className={styles['speed-select']}
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>

            <button onClick={handleFullscreen} className={styles['control-button']}>
              <Icon icon="fullscreen" />
            </button>
          </div>
        </div>
      </div>

      {/* Subtitle Settings Panel (could be expanded) */}
      {subtitlesEnabled && (
        <div className={styles['subtitle-settings']}>
          <h4>Subtitle Settings</h4>
          <div className={styles['setting-row']}>
            <label>Size:</label>
            <input
              type="range"
              min={10}
              max={50}
              value={subtitleSettings.size}
              onChange={(e) => handleSubtitleSettingChange('size', Number(e.target.value))}
            />
          </div>
          <div className={styles['setting-row']}>
            <label>Offset:</label>
            <input
              type="range"
              min={-20}
              max={20}
              value={subtitleSettings.offset}
              onChange={(e) => handleSubtitleSettingChange('offset', Number(e.target.value))}
            />
          </div>
        </div>
      )}
    </div>
  );
});

StremioPlayer.displayName = 'StremioPlayer';

export default StremioPlayer;