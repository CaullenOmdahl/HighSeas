// Enhanced Player with Stremio Video Player
// Replaces the basic HTML5 video with full Stremio capabilities

import { memo, useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import classnames from 'classnames';
import Icon from '../stremio/components/Icon/Icon';
import StremioVideoPlayer from '../lib/video/StremioVideoPlayer';
import { SubtitleTrack } from '../lib/video';
import styles from './Player.module.less';

const StremioPlayer = memo(() => {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [buffering] = useState(false);
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
  
  // Real-Debrid link management
  const [originalMagnet, setOriginalMagnet] = useState<string | null>(null);
  const [linkRefreshCount, setLinkRefreshCount] = useState(0);

  const streamUrl = searchParams.get('stream');
  const quality = searchParams.get('quality');
  const season = searchParams.get('season');
  const episode = searchParams.get('episode');

  // Debug logging (only log when params change)
  useEffect(() => {
    console.log('StremioPlayer params:', { id, streamUrl, quality, season, episode });
  }, [id, streamUrl, quality, season, episode]);

  // Handle time updates from video player
  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  // Handle duration changes from video player
  const handleDurationChange = useCallback((duration: number) => {
    setDuration(duration);
  }, []);

  // Handle play/pause events
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Handle subtitle track loaded
  const handleSubtitleTrackLoaded = useCallback((track: SubtitleTrack) => {
    console.log('Subtitle track loaded:', track);
  }, []);

  // Handle video errors
  const handleVideoError = useCallback((error: any) => {
    console.error('Video error:', error);
    
    // Handle transcoding failure specifically
    if (error.code === 'TRANSCODING_FAILED') {
      console.error('CRITICAL: Video transcoding failed for incompatible format');
      setError(`🚫 ${error.message}\n\n💡 Try selecting a different quality (MP4 formats work best) or use a different streaming source.`);
      setLoading(false);
      return;
    }
    
    // Check if this is an HLS transcoding error (don't redirect for these)
    if (streamUrl?.includes('/api/hls/')) {
      console.warn('HLS transcoding error detected:', error);
      setError('⚙️ Video transcoding failed. This video format is not compatible with your browser. Please select a different quality or source.');
      setLoading(false);
      return;
    }
    
    // Check if this is a Real-Debrid link that may have expired
    if (streamUrl?.includes('real-debrid.com') && (error.code === 4 || error.message?.includes('404') || error.message?.includes('Network error'))) {
      // If we have the original magnet and haven't exceeded retry limit, refresh the link
      if (originalMagnet && linkRefreshCount < 6) {
        const currentAttempt = linkRefreshCount + 1;
        setError(`🔄 Stream link expired, refreshing... (attempt ${currentAttempt}/6)`);
        setLinkRefreshCount(prev => prev + 1);
        setLoading(true);
        
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 32s
        const retryDelay = Math.min(1000 * Math.pow(2, linkRefreshCount), 32000);
        
        console.log(`🔄 Retrying Real-Debrid link refresh (attempt ${currentAttempt}/6) with ${retryDelay}ms delay`);
        
        // Convert the original magnet link again to get a fresh Real-Debrid URL
        setTimeout(() => {
          convertMagnetToStream(originalMagnet);
        }, retryDelay);
        return;
      } else if (linkRefreshCount >= 6) {
        setError('❌ Unable to refresh stream link after 6 attempts. The Real-Debrid service may be experiencing issues. Please try selecting a different quality or source.');
        setLoading(false);
        return;
      } else {
        setError('🔄 Stream link expired, please go back and select a new stream');
        // Go back to the previous page to select a new stream
        setTimeout(() => {
          window.history.back();
        }, 3000);
        return;
      }
    }
    
    setError(error.message || 'Video playback error');
    setLoading(false);
  }, [streamUrl, originalMagnet, linkRefreshCount]);

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
      
      // Store the original magnet link for potential refreshes
      if (!originalMagnet) {
        setOriginalMagnet(magnetLink);
      }
      
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
        // Reset refresh count on successful conversion
        setLinkRefreshCount(0);
        
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
  }, [streamUrl, originalMagnet]);

  // Proactive Real-Debrid link refresh to prevent expiration
  useEffect(() => {
    if (!streamUrl?.includes('real-debrid.com') || !originalMagnet) return;

    // Set up a timer to refresh the link before it expires (typically 6 hours for Real-Debrid)
    // We'll refresh after 5.5 hours (19800 seconds) to be safe
    const refreshTimer = setTimeout(() => {
      console.log('🔄 Proactively refreshing Real-Debrid link before expiration...');
      setError('🔄 Refreshing stream link...');
      convertMagnetToStream(originalMagnet);
    }, 19800000); // 5.5 hours in milliseconds

    return () => clearTimeout(refreshTimer);
  }, [streamUrl, originalMagnet, convertMagnetToStream]);

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
        stream={streamUrl ? { url: streamUrl } : undefined}
        streamingServerURL="/api/streaming"
        autoPlay={false}
        onError={handleVideoError}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleVideoEnded}
        onSubtitleTrackLoaded={handleSubtitleTrackLoaded}
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