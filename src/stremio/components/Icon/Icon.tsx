// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import { memo } from 'react';
import classnames from 'classnames';
import { 
    homeOutline,
    searchOutline,
    filmOutline,
    tvOutline,
    libraryOutline,
    calendarOutline,
    settingsOutline,
    playOutline,
    pauseOutline,
    expandOutline,
    chevronBackOutline,
    chevronForwardOutline,
    closeOutline,
    ellipsisHorizontalOutline,
    checkmarkOutline,
    volumeHighOutline
} from 'ionicons/icons';
import { IonIcon } from '@ionic/react';

interface Props {
    className?: string;
    icon?: string;
    title?: string;
    size?: 'small' | 'medium' | 'large';
}

// Icon mapping for common Stremio icons to Ionicons
const ICON_MAP: Record<string, string> = {
    home: homeOutline,
    discover: searchOutline,
    movies: filmOutline,
    series: tvOutline,
    library: libraryOutline,
    calendar: calendarOutline,
    settings: settingsOutline,
    search: searchOutline,
    play: playOutline,
    pause: pauseOutline,
    fullscreen: expandOutline,
    back: chevronBackOutline,
    forward: chevronForwardOutline,
    close: closeOutline,
    '⋯': ellipsisHorizontalOutline,
    '✓': checkmarkOutline,
    volume: volumeHighOutline,
};

const Icon = memo(({ className, icon, title, size = 'medium' }: Props) => {
    if (!icon) {
        return null;
    }

    const ionIcon = ICON_MAP[icon] || icon;
    
    const sizeMap = {
        small: 'small',
        medium: 'default',
        large: 'large'
    } as const;

    return (
        <IonIcon
            icon={ionIcon}
            className={classnames('icon', className)}
            title={title}
            size={sizeMap[size]}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        />
    );
});

Icon.displayName = 'Icon';

export default Icon;