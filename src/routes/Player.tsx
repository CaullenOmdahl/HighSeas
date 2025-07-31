// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import { memo, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import classnames from 'classnames';
import Icon from '../stremio/components/Icon/Icon';
import styles from './Player.module.less';

const Player = memo(() => {
    const { id } = useParams<{ id?: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const streamUrl = searchParams.get('stream');
    const quality = searchParams.get('quality');

    useEffect(() => {
        if (!streamUrl) {
            setError('No stream URL provided');
            setLoading(false);
            return;
        }

        // Check if this is a demo magnet URL
        if (streamUrl.startsWith('magnet:?demo=')) {
            setTimeout(() => {
                setError('This is a demo stream. In a real deployment, magnet links would be processed by Real-Debrid to provide direct HTTP video streams.');
                setLoading(false);
            }, 1000);
            return;
        }

        // Check if this is a real magnet URL - convert via Real-Debrid
        if (streamUrl.startsWith('magnet:')) {
            convertMagnetToStream(streamUrl);
            return;
        }

        // For HTTP/HTTPS URLs, attempt to load the video
        if (streamUrl.startsWith('http')) {
            setLoading(false);
            // Video element will handle loading the stream
            return;
        }

        // Unknown URL format
        setError('Unsupported stream URL format');
        setLoading(false);
    }, [streamUrl]);

    const convertMagnetToStream = async (magnetLink: string) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔄 Converting magnet link via Real-Debrid...');
            
            const response = await fetch('/api/realdebrid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ magnetLink }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Real-Debrid API request failed');
            }
            
            const result = await response.json();
            
            console.log('📊 Real-Debrid result:', result.status);
            
            if (result.status === 'ready' && result.streamUrl) {
                console.log('✅ Stream ready, redirecting to video...');
                // Replace the current URL with the direct stream URL
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('stream', result.streamUrl);
                window.history.replaceState({}, '', newUrl.toString());
                
                // Reload to start playing the direct stream
                window.location.reload();
                return;
            }
            
            if (result.status === 'processing') {
                setError(`⏳ ${result.message || 'Processing magnet link...'}`);
                setLoading(false);
                
                // Poll for completion every 5 seconds
                setTimeout(() => {
                    if (streamUrl === magnetLink) { // Only retry if we're still on the same magnet
                        convertMagnetToStream(magnetLink);
                    }
                }, 5000);
                return;
            }
            
            if (result.status === 'error') {
                setError(`❌ ${result.message || 'Failed to process magnet link'}`);
                setLoading(false);
                return;
            }
            
            setError('❓ Unknown response from Real-Debrid service');
            setLoading(false);
            
        } catch (error) {
            console.error('❌ Magnet conversion error:', error);
            setError(`🚫 Real-Debrid Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setLoading(false);
        }
    };

    const handlePlayPause = () => {
        if (!videoRef.current) return;
        
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;
        setDuration(videoRef.current.duration);
        setLoading(false);
    };

    const handleVolumeChange = (newVolume: number) => {
        if (!videoRef.current) return;
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
    };

    const handleSeek = (time: number) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = time;
        setCurrentTime(time);
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

    if (loading) {
        return (
            <div className={styles['player-container']}>
                <div className={styles['loading-screen']}>
                    <div className={styles['loading-spinner']} />
                    <p>Loading player...</p>
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
                        
                        {streamUrl?.startsWith('magnet:') && (
                            <div className={styles['info-box']}>
                                <h3>💡 How to Enable Streaming</h3>
                                <p>To watch content using magnet links, you need:</p>
                                <ul>
                                    <li>A premium service like Real-Debrid or Premiumize</li>
                                    <li>Configure Torrentio addon with your premium credentials</li>
                                    <li>The service will convert torrents to direct video streams</li>
                                </ul>
                            </div>
                        )}
                        
                        <div className={styles['stream-info']}>
                            <p><strong>Stream URL:</strong> {streamUrl}</p>
                            {quality && <p><strong>Quality:</strong> {quality}</p>}
                        </div>
                        
                        <div className={styles['error-actions']}>
                            <button onClick={handleBack} className={styles['back-button']}>
                                <Icon icon="back" /> Back to Movie Details
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
            {/* Video Element */}
            <video
                ref={videoRef}
                className={styles['video-element']}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                poster=""
            >
                {streamUrl && <source src={streamUrl} type="video/mp4" />}
                Your browser does not support the video tag.
            </video>

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
                        <span className={styles['stream-title']}>Content {id}</span>
                        {quality && (
                            <span className={styles['stream-quality']}>{quality}</span>
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
                            <Icon icon="volume" />
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.1}
                                value={volume}
                                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                className={styles['volume-slider']}
                            />
                        </div>

                        <button onClick={handleFullscreen} className={styles['control-button']}>
                            <Icon icon="fullscreen" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

Player.displayName = 'Player';

export default Player;