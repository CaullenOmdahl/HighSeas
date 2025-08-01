// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import { memo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import MainNavBars from '../stremio/components/MainNavBars/MainNavBars';
import Icon from '../stremio/components/Icon/Icon';
import EpisodePicker from '../lib/components/EpisodePicker';
import VideosList from '../lib/components/VideosList';
import { MetaItemPreview } from '../lib/types';
// import stremioService from '../lib/services/stremio'; // TODO: Use real service later
import styles from './MetaDetails.module.less';

interface StreamSource {
    url: string;
    title: string;
    quality?: string;
    provider?: string;
    seeds?: number;
    size?: string;
    fileIdx?: number;
    bingeGroup?: string;
}

interface Video {
    id: string;
    title: string;
    season: number;
    episode: number;
    released?: Date;
    thumbnail?: string;
    description?: string;
    watched?: boolean;
    progress?: number;
    upcoming?: boolean;
    rating?: number;
    tvdbId?: number;
}

const MetaDetails = memo(() => {
    const { type, id } = useParams<{ type?: string; id?: string }>();
    const navigate = useNavigate();
    const [meta, setMeta] = useState<MetaItemPreview | null>(null);
    const [streams, setStreams] = useState<StreamSource[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [selectedSeason, setSelectedSeason] = useState<number>(1);
    const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
    const [loading, setLoading] = useState(true);
    const [streamLoading, setStreamLoading] = useState(false);
    const [episodeLoadingId, setEpisodeLoadingId] = useState<string | null>(null);
    const [, setSelectedStream] = useState<StreamSource | null>(null);

    useEffect(() => {
        const loadMetaDetails = async () => {
            if (!id) return;
            
            try {
                setLoading(true);
                
                // Fetch real movie/series data from Stremio metadata API
                const response = await fetch(`https://v3-cinemeta.strem.io/meta/${type}/${id}.json`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch metadata: ${response.status}`);
                }
                
                const data = await response.json();
                const meta = data.meta;
                
                if (!meta) {
                    throw new Error('No metadata found');
                }

                const realMeta: MetaItemPreview = {
                    id: meta.id,
                    name: meta.name,
                    type: meta.type,
                    poster: meta.poster,
                    background: meta.background,
                    description: meta.description,
                    releaseInfo: meta.year || meta.releaseInfo,
                    runtime: meta.runtime,
                    genres: meta.genres,
                    imdbRating: meta.imdbRating ? parseFloat(meta.imdbRating) : undefined,
                    watched: false,
                    inLibrary: false,
                };
                
                setMeta(realMeta);

                // If this is a series, load videos/episodes - Follow Stremio standard
                if (meta.type === 'series' && meta.videos && meta.videos.length > 0) {
                    const videoList: Video[] = meta.videos.map((video: any) => ({
                        id: video.id || `${meta.id}:${video.season}:${video.episode}`,
                        title: video.name || video.title || `Episode ${video.episode}`,
                        season: video.season || 1,
                        episode: video.episode || video.number || 1,
                        released: video.released || video.firstAired ? 
                            new Date(video.released || video.firstAired) : undefined,
                        thumbnail: video.thumbnail,
                        description: video.description || video.overview,
                        watched: video.watched || false,
                        progress: video.progress || 0,
                        upcoming: video.upcoming || false,
                        rating: video.rating ? parseFloat(video.rating) : undefined,
                        tvdbId: video.tvdb_id
                    }));
                    
                    setVideos(videoList);
                    
                    // Set initial season to the first available season
                    const seasons = [...new Set(videoList.map(v => v.season))].sort((a, b) => a - b);
                    if (seasons.length > 0) {
                        setSelectedSeason(seasons[0]);
                    }
                }
            } catch (error) {
                console.error('Failed to load meta details:', error);
                // Show error state rather than empty content
                setMeta(null);
            } finally {
                setLoading(false);
            }
        };

        loadMetaDetails();
    }, [id, type]);

    const loadStreamsForEpisode = async (episodeId: string, season: number, episode: number) => {
        if (!episodeId) return;
        
        try {
            setStreamLoading(true);
            
            // Fetch streams for specific episode from Torrentio addon
            const response = await fetch(`https://torrentio.strem.fun/stream/series/${episodeId}.json`);
            if (!response.ok) {
                throw new Error(`Failed to fetch episode streams: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.streams && data.streams.length > 0) {
                // Use Stremio standard stream format with minimal processing
                const episodeStreams: StreamSource[] = data.streams.slice(0, 10).map((stream: any) => {
                    const title = stream.title || '';
                    const firstLine = title.split('\n')[0];
                    
                    // Simple quality detection
                    let quality = '720p';
                    if (title.includes('2160p') || title.includes('4K')) quality = '4K';
                    else if (title.includes('1080p')) quality = '1080p';
                    else if (title.includes('720p')) quality = '720p';
                    else if (title.includes('480p')) quality = '480p';
                    
                    // Extract metadata from Stremio standard format
                    const sizeMatch = title.match(/💾\s*([\d.]+)\s*(GB|MB)/);
                    const seedsMatch = title.match(/👤\s*(\d+)/);
                    const providerMatch = title.match(/⚙️\s*([^\n]+)/);
                    
                    return {
                        url: stream.infoHash ? 
                            `magnet:?xt=urn:btih:${stream.infoHash}&dn=${encodeURIComponent(firstLine)}` : 
                            stream.url || `magnet:?demo=${episodeId}`,
                        title: firstLine,
                        quality,
                        provider: stream.name || providerMatch?.[1]?.trim() || 'Torrentio',
                        seeds: seedsMatch ? parseInt(seedsMatch[1]) : undefined,
                        size: sizeMatch ? `${sizeMatch[1]} ${sizeMatch[2]}` : undefined,
                        fileIdx: stream.fileIdx,
                        bingeGroup: stream.behaviorHints?.bingeGroup
                    };
                });
                
                setStreams(episodeStreams);
            } else {
                // Fallback to demo streams if no real streams available
                const demoStreams: StreamSource[] = [
                    {
                        url: `magnet:?demo=${episodeId}&quality=1080p`,
                        title: `S${season}E${episode.toString().padStart(2, '0')} - 1080p (Demo)`,
                        quality: '1080p',
                        provider: 'Demo Provider',
                        seeds: 89,
                        size: '2.1 GB'
                    }
                ];
                setStreams(demoStreams);
            }
        } catch (error) {
            console.error('Failed to load episode streams:', error);
            setStreams([]);
        } finally {
            setStreamLoading(false);
        }
    };

    const loadStreams = async () => {
        if (!id || !meta) return;
        
        try {
            setStreamLoading(true);
            
            // Fetch real streams from Torrentio addon
            const response = await fetch(`https://torrentio.strem.fun/stream/${type}/${id}.json`);
            if (!response.ok) {
                throw new Error(`Failed to fetch streams: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.streams && data.streams.length > 0) {
                // Use Stremio standard stream format - consistent with episodes
                const realStreams: StreamSource[] = data.streams.slice(0, 10).map((stream: any) => {
                    const title = stream.title || '';
                    const firstLine = title.split('\n')[0];
                    
                    // Simple quality detection
                    let quality = '720p';
                    if (title.includes('2160p') || title.includes('4K')) quality = '4K';
                    else if (title.includes('1080p')) quality = '1080p';
                    else if (title.includes('720p')) quality = '720p';
                    else if (title.includes('480p')) quality = '480p';
                    
                    // Extract metadata from Stremio standard format
                    const sizeMatch = title.match(/💾\s*([\d.]+)\s*(GB|MB)/);
                    const seedsMatch = title.match(/👤\s*(\d+)/);
                    const providerMatch = title.match(/⚙️\s*([^\n]+)/);
                    
                    return {
                        url: stream.infoHash ? 
                            `magnet:?xt=urn:btih:${stream.infoHash}&dn=${encodeURIComponent(firstLine)}` : 
                            stream.url || `magnet:?demo=${id}`,
                        title: firstLine,
                        quality,
                        provider: stream.name || providerMatch?.[1]?.trim() || 'Torrentio',
                        seeds: seedsMatch ? parseInt(seedsMatch[1]) : undefined,
                        size: sizeMatch ? `${sizeMatch[1]} ${sizeMatch[2]}` : undefined,
                        fileIdx: stream.fileIdx,
                        bingeGroup: stream.behaviorHints?.bingeGroup
                    };
                });
                
                setStreams(realStreams);
            } else {
                // Fallback to demo streams if no real streams available
                const demoStreams: StreamSource[] = [
                    {
                        url: `magnet:?demo=${id}&quality=4k`,
                        title: `${meta.name} - 4K UHD HDR (Demo)`,
                        quality: '4K',
                        provider: 'Demo Provider',
                        seeds: 150,
                        size: '12.5 GB'
                    },
                    {
                        url: `magnet:?demo=${id}&quality=1080p`,
                        title: `${meta.name} - 1080p BluRay (Demo)`,
                        quality: '1080p',
                        provider: 'Demo Provider',
                        seeds: 89,
                        size: '4.2 GB'
                    }
                ];
                setStreams(demoStreams);
            }
        } catch (error) {
            console.error('Failed to load streams:', error);
            // Show error state
            setStreams([]);
        } finally {
            setStreamLoading(false);
        }
    };

    const handlePlayStream = (stream: StreamSource) => {
        setSelectedStream(stream);
        // For series, include season and episode in the URL
        const queryParams = new URLSearchParams({
            stream: stream.url,
            ...(stream.quality && { quality: stream.quality }),
            ...(meta?.type === 'series' && { season: selectedSeason.toString(), episode: selectedEpisode.toString() })
        });
        navigate(`/watch/${id}?${queryParams.toString()}`);
    };

    const handleEpisodeSelect = (season: number, episode: number) => {
        setSelectedSeason(season);
        setSelectedEpisode(episode);
        
        // Load streams for this specific episode
        const episodeId = `${id}:${season}:${episode}`;
        loadStreamsForEpisode(episodeId, season, episode);
    };

    const handleVideoSelect = (video: Video) => {
        setSelectedSeason(video.season);
        setSelectedEpisode(video.episode);
        
        // Load streams for this episode with loading state
        const episodeId = `${id}:${video.season}:${video.episode}`;
        setEpisodeLoadingId(episodeId);
        loadStreamsForEpisode(episodeId, video.season, video.episode)
            .finally(() => setEpisodeLoadingId(null));
    };

    const handleSeasonSelect = (season: number) => {
        setSelectedSeason(season);
        // Reset to first episode of the season
        const firstEpisode = videos.filter(v => v.season === season).sort((a, b) => a.episode - b.episode)[0];
        if (firstEpisode) {
            setSelectedEpisode(firstEpisode.episode);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className={styles['meta-details-container']}>
                <MainNavBars>
                    <div className={styles['loading-container']}>
                        <div className={styles['loading-spinner']} />
                        <p>Loading details...</p>
                    </div>
                </MainNavBars>
            </div>
        );
    }

    if (!meta) {
        return (
            <div className={styles['meta-details-container']}>
                <MainNavBars>
                    <div className={styles['error-container']}>
                        <h2>Content Not Found</h2>
                        <p>The requested content could not be found.</p>
                        <button onClick={handleBack} className={styles['back-button']}>
                            <Icon icon="back" /> Go Back
                        </button>
                    </div>
                </MainNavBars>
            </div>
        );
    }

    return (
        <div className={styles['meta-details-container']}>
            <MainNavBars>
                <div className={styles['details-content']}>
                    {/* Hero Section */}
                    <div className={styles['hero-section']} style={{
                        backgroundImage: meta.background ? `url(${meta.background})` : undefined
                    }}>
                        <div className={styles['hero-overlay']}>
                            <button onClick={handleBack} className={styles['back-button']}>
                                <Icon icon="back" /> Back
                            </button>
                            
                            <div className={styles['hero-content']}>
                                <div className={styles['poster-section']}>
                                    <img 
                                        src={meta.poster} 
                                        alt={meta.name}
                                        className={styles['poster-image']}
                                    />
                                </div>
                                
                                <div className={styles['info-section']}>
                                    <h1 className={styles['title']}>{meta.name}</h1>
                                    
                                    <div className={styles['metadata']}>
                                        {meta.imdbRating && (
                                            <span className={styles['rating']}>
                                                ⭐ {meta.imdbRating.toFixed(1)}
                                            </span>
                                        )}
                                        {meta.releaseInfo && (
                                            <span className={styles['year']}>{meta.releaseInfo}</span>
                                        )}
                                        {meta.runtime && (
                                            <span className={styles['runtime']}>{meta.runtime}</span>
                                        )}
                                    </div>
                                    
                                    {meta.genres && meta.genres.length > 0 && (
                                        <div className={styles['genres']}>
                                            {meta.genres.map((genre, index) => (
                                                <span key={index} className={styles['genre-tag']}>
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <p className={styles['description']}>{meta.description}</p>
                                    
                                    <div className={styles['action-buttons']}>
                                        {streams.length > 0 ? (
                                            <button 
                                                onClick={() => handlePlayStream(streams[0])}
                                                className={classnames(styles['play-button'], styles['primary'])}
                                            >
                                                <Icon icon="play" /> Play Now
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={loadStreams}
                                                disabled={streamLoading}
                                                className={classnames(styles['play-button'], styles['primary'])}
                                            >
                                                <Icon icon="search" /> Find Streams
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TV Series Episodes */}
                    {meta?.type === 'series' && videos.length > 0 && (
                        <div className={styles['episodes-section']}>
                            <h2>Episodes</h2>
                            
                            {/* Episode Picker for quick navigation */}
                            <EpisodePicker
                                seasons={[...new Set(videos.map(v => v.season))]
                                    .sort((a, b) => a - b)
                                    .map(season => ({
                                        season,
                                        episodes: videos.filter(v => v.season === season).length
                                    }))}
                                selectedSeason={selectedSeason}
                                selectedEpisode={selectedEpisode}
                                onEpisodeSelect={handleEpisodeSelect}
                                onSeasonSelect={handleSeasonSelect}
                            />
                            
                            {/* Videos List */}
                            <VideosList
                                videos={videos}
                                selectedSeason={selectedSeason}
                                selectedEpisode={selectedEpisode}
                                onVideoSelect={handleVideoSelect}
                                onSeasonSelect={handleSeasonSelect}
                                episodeLoadingId={episodeLoadingId}
                            />
                        </div>
                    )}

                    {/* Stream Selection */}
                    {streams.length > 0 && (
                        <div className={styles['streams-section']}>
                            <h2>Available Streams</h2>
                            <div className={styles['streams-grid']}>
                                {streams.map((stream, index) => (
                                    <div 
                                        key={index} 
                                        className={styles['stream-card']}
                                        onClick={() => handlePlayStream(stream)}
                                    >
                                        <div className={styles['stream-header']}>
                                            <span className={styles['quality-badge']}>{stream.quality}</span>
                                            <span className={styles['provider']}>{stream.provider}</span>
                                        </div>
                                        <div className={styles['stream-info']}>
                                            <div className={styles['stream-title']}>{stream.title}</div>
                                            <div className={styles['stream-meta']}>
                                                {stream.seeds && <span>🌱 {stream.seeds} seeds</span>}
                                                {stream.size && <span>💾 {stream.size}</span>}
                                            </div>
                                        </div>
                                        <button className={styles['stream-play-btn']}>
                                            <Icon icon="play" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </MainNavBars>
        </div>
    );
});

MetaDetails.displayName = 'MetaDetails';

export default MetaDetails;