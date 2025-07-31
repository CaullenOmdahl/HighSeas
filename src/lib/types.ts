// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

export interface MetaItemPreview {
    id: string;
    name: string;
    type: 'movie' | 'series' | 'channel' | 'tv';
    poster?: string;
    background?: string;
    logo?: string;
    description?: string;
    releaseInfo?: string;
    runtime?: string;
    genres?: string[];
    imdbRating?: number;
    watched?: boolean;
    inLibrary?: boolean;
    progress?: number; // 0-1 for continue watching
    timeWatched?: number; // seconds watched for continue watching
    newVideos?: number; // count of new episodes/videos
    deepLinks?: {
        player?: string;
        details?: string;
        streams?: string;
    };
}

export interface Catalog {
    id: string;
    name: string;
    type: 'movie' | 'series' | 'channel' | 'tv' | 'mixed';
    items: MetaItemPreview[];
    hasMore?: boolean;
    loading?: boolean;
    error?: string;
}

export interface StreamSource {
    url: string;
    quality?: string;
    provider?: string;
    title?: string;
    seeds?: number;
    size?: string;
}

export interface VideoState {
    currentTime: number;
    duration: number;
    paused: boolean;
    buffering: boolean;
    volume: number;
    muted: boolean;
    fullscreen: boolean;
}

export interface SearchResult {
    query: string;
    items: MetaItemPreview[];
    loading: boolean;
    hasMore: boolean;
}

export interface AppSettings {
    theme: 'auto' | 'dark' | 'light';
    language: string;
    subtitles: {
        enabled: boolean;
        language: string;
        size: number;
    };
    streaming: {
        autoplay: boolean;
        quality: 'auto' | '4K' | '1080p' | '720p' | '480p';
    };
}