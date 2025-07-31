// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import React, { memo, useState } from 'react';
import classnames from 'classnames';
import { useNavigate } from 'react-router-dom';
import Icon from '../Icon/Icon';
import { MetaItemPreview } from '../../../lib/types';
import styles from './styles.module.less';

interface ContinueWatchingItemProps extends MetaItemPreview {
    className?: string;
}

const ContinueWatchingItem = memo(({ 
    className,
    id,
    name,
    type,
    poster,
    progress = 0,
    timeWatched = 0
}: ContinueWatchingItemProps) => {
    const navigate = useNavigate();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handlePlay = () => {
        navigate(`/watch/${id}?t=${timeWatched}`);
    };

    const handleDismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        // TODO: Implement dismiss functionality
        console.log('Dismiss item:', id);
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const renderPosterImage = () => {
        if (imageError || !poster) {
            return (
                <div className={styles['poster-fallback']}>
                    <Icon icon={type === 'movie' ? 'movies' : 'series'} />
                    <div className={styles['fallback-title']}>{name}</div>
                </div>
            );
        }

        return (
            <img
                src={poster}
                alt={name}
                className={classnames(styles['poster-image'], {
                    [styles['loaded']]: imageLoaded
                })}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
            />
        );
    };

    return (
        <button
            className={classnames(className, styles['continue-watching-item-container'])}
            onClick={handlePlay}
            title={`Continue watching ${name}`}
        >
            <div className={styles['poster-container']}>
                {/* Dismiss button */}
                <button
                    className={styles['dismiss-button']}
                    onClick={handleDismiss}
                    title="Remove from continue watching"
                >
                    <Icon icon="close" />
                </button>

                {/* Play button overlay */}
                <div className={styles['play-overlay']}>
                    <div className={styles['play-button']}>
                        <Icon icon="play" />
                    </div>
                </div>

                {/* Poster image */}
                <div className={styles['poster-image-layer']}>
                    {renderPosterImage()}
                </div>

                {/* Progress bar */}
                <div className={styles['progress-container']}>
                    <div 
                        className={styles['progress-bar']}
                        style={{ width: `${progress * 100}%` }}
                    />
                </div>

                {/* Progress time indicator */}
                {timeWatched > 0 && (
                    <div className={styles['time-indicator']}>
                        {formatTime(timeWatched)} watched
                    </div>
                )}
            </div>

            <div className={styles['title-container']}>
                <div className={styles['title-label']} title={name}>
                    {name}
                </div>
                <div className={styles['progress-text']}>
                    {Math.round(progress * 100)}% watched
                </div>
            </div>
        </button>
    );
});

ContinueWatchingItem.displayName = 'ContinueWatchingItem';

export default ContinueWatchingItem;