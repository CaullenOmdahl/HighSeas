// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import { memo, useEffect, useState } from 'react';
import classnames from 'classnames';
import MainNavBars from '../stremio/components/MainNavBars/MainNavBars';
import MetaRow from '../stremio/components/MetaRow/MetaRow';
import MetaItem from '../stremio/components/MetaItem/MetaItem';
import ContinueWatchingItem from '../stremio/components/ContinueWatchingItem/ContinueWatchingItem';
import { Catalog, MetaItemPreview } from '../lib/types';
// import stremioService from '../lib/services/stremio'; // Using direct API calls now
import { logInfo, LogCategory } from '../lib/utils/logger';
import styles from './Board.module.less';

interface BoardProps {
    className?: string;
}

const Board = memo(({ className }: BoardProps) => {
    const [catalogs, setCatalogs] = useState<Catalog[]>([]);
    const [continueWatching, setContinueWatching] = useState<MetaItemPreview[]>([]);
    const [loading, setLoading] = useState(true);

    // Load real catalog data from Stremio API directly
    useEffect(() => {
        const loadRealData = async () => {
            try {
                logInfo(LogCategory.UI, 'Board component initializing, loading catalog data');
                setLoading(true);
                
                // Fetch multiple catalogs from Stremio API
                const [moviesResponse, topMoviesResponse, seriesResponse] = await Promise.all([
                    fetch('https://v3-cinemeta.strem.io/catalog/movie/popular/skip=0.json'),
                    fetch('https://v3-cinemeta.strem.io/catalog/movie/top/skip=0.json'),
                    fetch('https://v3-cinemeta.strem.io/catalog/series/popular/skip=0.json')
                ]);

                if (!moviesResponse.ok || !topMoviesResponse.ok || !seriesResponse.ok) {
                    throw new Error('One or more API requests failed');
                }

                const [moviesData, topMoviesData, seriesData] = await Promise.all([
                    moviesResponse.json(),
                    topMoviesResponse.json(),
                    seriesResponse.json()
                ]);

                const convertMeta = (meta: any) => ({
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
                });

                const catalogsData = [
                    {
                        id: 'popular-movies',
                        name: 'Popular Movies',
                        type: 'movie' as const,
                        items: moviesData.metas.slice(0, 20).map(convertMeta)
                    },
                    {
                        id: 'top-movies',
                        name: 'Top Movies',
                        type: 'movie' as const,
                        items: topMoviesData.metas.slice(0, 20).map(convertMeta)
                    },
                    {
                        id: 'popular-series',
                        name: 'Popular TV Shows',
                        type: 'series' as const,
                        items: seriesData.metas.slice(0, 20).map(convertMeta)
                    }
                ];

                setCatalogs(catalogsData);
                setContinueWatching([]);
                logInfo(LogCategory.UI, 'Board catalog data loaded successfully', { 
                    catalogCount: catalogsData.length,
                    totalItems: catalogsData.reduce((acc, cat) => acc + cat.items.length, 0)
                });
                
            } catch (error) {
                logInfo(LogCategory.UI, 'Board catalog loading failed', { error: error instanceof Error ? error.message : 'Unknown error' });
                console.error('API Error:', error);
                // Show error state instead of empty
                setCatalogs([]);
                setContinueWatching([]);
            } finally {
                setLoading(false);
            }
        };

        loadRealData();
    }, []);

    return (
        <div className={classnames(className, styles['board-container'])}>
            <MainNavBars>
                <div className={styles['board-content']}>
                    {/* Continue Watching Section */}
                    {continueWatching.length > 0 && (
                        <MetaRow
                            title="Continue Watching"
                            catalog={{
                                id: 'continue-watching',
                                name: 'Continue Watching',
                                type: 'mixed',
                                items: continueWatching
                            }}
                            itemComponent={ContinueWatchingItem}
                        />
                    )}

                    {/* Catalog Rows */}
                    {loading ? (
                        // Loading placeholders
                        Array.from({ length: 4 }, (_, i) => (
                            <MetaRow.Placeholder key={`placeholder-${i}`} />
                        ))
                    ) : catalogs.length > 0 ? (
                        catalogs.map((catalog) => (
                            <MetaRow
                                key={catalog.id}
                                catalog={catalog}
                                itemComponent={MetaItem}
                            />
                        ))
                    ) : (
                        <div style={{ 
                            padding: '2rem', 
                            textAlign: 'center', 
                            color: 'var(--color-placeholder-text)' 
                        }}>
                            <p>Unable to load content. Please check your internet connection.</p>
                        </div>
                    )}
                </div>
            </MainNavBars>
        </div>
    );
});

Board.displayName = 'Board';

export default Board;