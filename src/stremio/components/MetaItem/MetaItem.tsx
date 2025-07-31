// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import React, { memo, useState } from 'react';
import classnames from 'classnames';
import { useNavigate } from 'react-router-dom';
import Icon from '../Icon/Icon';
import SafeImage from '../../../lib/components/SafeImage';
import { MetaItemPreview } from '../../../lib/types';
import styles from './styles.module.less';

interface MetaItemProps extends MetaItemPreview {
    className?: string;
    shape?: 'poster' | 'landscape' | 'square';
}

const MetaItem = memo(({ 
    className,
    id,
    name,
    type,
    poster,
    releaseInfo,
    genres,
    imdbRating,
    watched,
    inLibrary,
    progress,
    newVideos,
    shape = 'poster'
}: MetaItemProps) => {
    const navigate = useNavigate();
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleClick = () => {
        navigate(`/detail/${type}/${id}`);
    };

    const handleDetailsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/detail/${type}/${id}`);
    };

    const renderPosterImage = () => {
        const fallback = (
            <div className={styles['poster-fallback']}>
                <Icon icon={type === 'movie' ? 'movies' : 'series'} />
                <div className={styles['fallback-title']}>{name}</div>
            </div>
        );

        return (
            <SafeImage
                src={poster}
                alt={name}
                className={classnames(styles['poster-image'], {
                    [styles['loaded']]: imageLoaded
                })}
                fallback={fallback}
                onLoad={() => setImageLoaded(true)}
                onError={() => {}}
            />
        );
    };

    return (
        <div
            className={classnames(
                className,
                styles['meta-item-container'],
                styles[`shape-${shape}`],
                {
                    [styles['watched']]: watched,
                    [styles['in-library']]: inLibrary
                }
            )}
            onClick={handleClick}
            title={name}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
        >
            <div className={styles['poster-container']}>
                {/* Watched indicator */}
                {watched && (
                    <div className={styles['watched-overlay']}>
                        <Icon icon="✓" />
                    </div>
                )}

                {/* New videos indicator */}
                {newVideos && newVideos > 0 && (
                    <div className={styles['new-videos-overlay']}>
                        <div className={styles['new-videos-count']}>{newVideos}</div>
                    </div>
                )}

                {/* Poster image */}
                <div className={styles['poster-image-layer']}>
                    {renderPosterImage()}
                </div>

                {/* Progress bar for continue watching */}
                {progress && progress > 0 && (
                    <div className={styles['progress-container']}>
                        <div 
                            className={styles['progress-bar']}
                            style={{ width: `${progress * 100}%` }}
                        />
                    </div>
                )}

                {/* Hover overlay */}
                <div className={styles['hover-overlay']}>
                    <div className={styles['play-button']}>
                        <Icon icon="play" />
                    </div>
                </div>
            </div>

            <div className={styles['title-bar-container']}>
                <div className={styles['title-label']} title={name}>
                    {name}
                </div>
                
                {/* Context menu button */}
                <button
                    className={styles['context-menu-button']}
                    onClick={handleDetailsClick}
                    title="More info"
                >
                    <Icon icon="⋯" />
                </button>
            </div>

            {/* Additional info on hover */}
            <div className={styles['info-overlay']}>
                {imdbRating && typeof imdbRating === 'number' && (
                    <div className={styles['rating']}>
                        ⭐ {imdbRating.toFixed(1)}
                    </div>
                )}
                {releaseInfo && (
                    <div className={styles['release-info']}>
                        {releaseInfo}
                    </div>
                )}
                {genres && genres.length > 0 && (
                    <div className={styles['genres']}>
                        {genres.slice(0, 2).join(', ')}
                    </div>
                )}
            </div>
        </div>
    );
});

MetaItem.displayName = 'MetaItem';

export default MetaItem;