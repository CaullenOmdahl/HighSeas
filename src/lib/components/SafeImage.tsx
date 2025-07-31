// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import React, { memo, useState, useEffect } from 'react';
import classnames from 'classnames';

interface SafeImageProps {
    src?: string;
    alt: string;
    className?: string;
    fallback?: React.ReactNode;
    onLoad?: () => void;
    onError?: () => void;
}

const SafeImage = memo(({ 
    src, 
    alt, 
    className, 
    fallback,
    onLoad,
    onError
}: SafeImageProps) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        // Reset state when src changes
        setImageError(false);
        setImageLoaded(false);
    }, [src]);

    const handleLoad = () => {
        setImageLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setImageError(true);
        onError?.();
    };

    if (imageError || !src) {
        return fallback ? (
            <div className={classnames(className, 'safe-image-fallback')}>
                {fallback}
            </div>
        ) : null;
    }

    return (
        <img
            src={src}
            alt={alt}
            className={classnames(className, {
                'loaded': imageLoaded
            })}
            onLoad={handleLoad}
            onError={handleError}
        />
    );
});

SafeImage.displayName = 'SafeImage';

export default SafeImage;