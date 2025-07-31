// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import React, { useState, useMemo } from 'react';
import Icon from '../../stremio/components/Icon/Icon';
import styles from './VideosList.module.less';

interface Video {
    id: string;
    title: string;
    season: number;
    episode: number;
    released?: Date;
    thumbnail?: string;
    watched?: boolean;
    progress?: number;
    upcoming?: boolean;
}

interface VideosListProps {
    className?: string;
    videos: Video[];
    selectedSeason: number;
    onVideoSelect: (video: Video) => void;
    onSeasonSelect: (season: number) => void;
}

const VideosList: React.FC<VideosListProps> = ({
    className,
    videos,
    selectedSeason,
    onVideoSelect,
    onSeasonSelect
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    // Get available seasons
    const seasons = useMemo(() => {
        const seasonSet = new Set(videos.map(v => v.season).filter(s => s !== null && s !== undefined));
        return Array.from(seasonSet).sort((a, b) => a - b);
    }, [videos]);

    // Filter videos for selected season
    const videosForSeason = useMemo(() => {
        return videos
            .filter(video => video.season === selectedSeason)
            .sort((a, b) => a.episode - b.episode);
    }, [videos, selectedSeason]);

    // Filter videos by search query
    const filteredVideos = useMemo(() => {
        if (!searchQuery.trim()) return videosForSeason;
        
        const query = searchQuery.toLowerCase();
        return videosForSeason.filter(video => 
            video.title?.toLowerCase().includes(query) ||
            `s${video.season}e${video.episode}`.includes(query) ||
            `season ${video.season} episode ${video.episode}`.includes(query)
        );
    }, [videosForSeason, searchQuery]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const formatDate = (date?: Date) => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    return (
        <div className={`${styles['videos-list']} ${className || ''}`}>
            {/* Season Selector */}
            {seasons.length > 1 && (
                <div className={styles['season-bar']}>
                    <div className={styles['season-buttons']}>
                        {seasons.map(season => (
                            <button
                                key={season}
                                className={`${styles['season-button']} ${
                                    season === selectedSeason ? styles['active'] : ''
                                }`}
                                onClick={() => onSeasonSelect(season)}
                            >
                                {season === 0 ? 'Specials' : `Season ${season}`}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Search Bar */}
            <div className={styles['search-container']}>
                <div className={styles['search-input-container']}>
                    <Icon icon="search" className={styles['search-icon']} />
                    <input
                        type="text"
                        placeholder="Search episodes..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className={styles['search-input']}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className={styles['clear-button']}
                        >
                            <Icon icon="close" />
                        </button>
                    )}
                </div>
            </div>

            {/* Episodes List */}
            <div className={styles['episodes-container']}>
                {filteredVideos.length === 0 ? (
                    <div className={styles['empty-state']}>
                        <Icon icon="play" size="large" className={styles['empty-icon']} />
                        <p>No episodes found</p>
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className={styles['clear-search-button']}
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    filteredVideos.map((video) => (
                        <div
                            key={video.id}
                            className={`${styles['episode-item']} ${
                                video.watched ? styles['watched'] : ''
                            } ${video.upcoming ? styles['upcoming'] : ''}`}
                            onClick={() => onVideoSelect(video)}
                        >
                            <div className={styles['episode-thumbnail']}>
                                {video.thumbnail ? (
                                    <img 
                                        src={video.thumbnail} 
                                        alt={video.title}
                                        className={styles['thumbnail-image']}
                                    />
                                ) : (
                                    <div className={styles['thumbnail-placeholder']}>
                                        <Icon icon="play" size="medium" />
                                    </div>
                                )}
                                
                                {video.progress && video.progress > 0 && (
                                    <div className={styles['progress-bar']}>
                                        <div 
                                            className={styles['progress-fill']}
                                            style={{ width: `${video.progress * 100}%` }}
                                        />
                                    </div>
                                )}
                                
                                {video.watched && (
                                    <div className={styles['watched-indicator']}>
                                        <Icon icon="checkmark" />
                                    </div>
                                )}
                            </div>

                            <div className={styles['episode-info']}>
                                <div className={styles['episode-header']}>
                                    <span className={styles['episode-number']}>
                                        S{video.season}E{video.episode.toString().padStart(2, '0')}
                                    </span>
                                    {video.released && (
                                        <span className={styles['episode-date']}>
                                            {formatDate(video.released)}
                                        </span>
                                    )}
                                </div>
                                
                                <h4 className={styles['episode-title']}>
                                    {video.title || `Episode ${video.episode}`}
                                </h4>
                                
                                {video.upcoming && (
                                    <div className={styles['upcoming-label']}>
                                        Coming Soon
                                    </div>
                                )}
                            </div>

                            <div className={styles['play-button']}>
                                <Icon icon="play" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default VideosList;