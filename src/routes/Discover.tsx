// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import { memo, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import classnames from 'classnames';
import MainNavBars from '../stremio/components/MainNavBars/MainNavBars';
import MetaRow from '../stremio/components/MetaRow/MetaRow';
import MetaItem from '../stremio/components/MetaItem/MetaItem';
import { Catalog } from '../lib/types';
import stremioService from '../lib/services/stremio';
import styles from './Board.module.less'; // Reuse Board styles

const Discover = memo(() => {
    const { type, catalog } = useParams<{ type?: string; catalog?: string }>();
    const [catalogs, setCatalogs] = useState<Catalog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                
                if (type === 'movie') {
                    // Load movie catalogs
                    const [popularMovies, topMovies] = await Promise.all([
                        stremioService.getPopularMovies(20),
                        stremioService.getTopMovies(20)
                    ]);
                    
                    setCatalogs([
                        {
                            id: 'popular-movies',
                            name: 'Popular Movies',
                            type: 'movie',
                            items: popularMovies
                        },
                        {
                            id: 'top-movies',
                            name: 'Top Movies',
                            type: 'movie',
                            items: topMovies
                        }
                    ]);
                } else if (type === 'series') {
                    // Load TV show catalogs
                    const [popularSeries, topSeries] = await Promise.all([
                        stremioService.getPopularSeries(20),
                        stremioService.getTopSeries(20)
                    ]);
                    
                    setCatalogs([
                        {
                            id: 'popular-series',
                            name: 'Popular TV Shows',
                            type: 'series',
                            items: popularSeries
                        },
                        {
                            id: 'top-series',
                            name: 'Top TV Shows',
                            type: 'series',
                            items: topSeries
                        }
                    ]);
                } else {
                    // Load all catalogs for general discover
                    const allCatalogs = await stremioService.getAllCatalogs();
                    setCatalogs(allCatalogs);
                }
                
            } catch (error) {
                console.error('Failed to load discover data:', error);
                setCatalogs([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [type, catalog]);

    const getPageTitle = () => {
        if (type === 'movie') return 'Movies';
        if (type === 'series') return 'TV Shows';
        return 'Discover';
    };

    return (
        <div className={classnames(styles['board-container'])}>
            <MainNavBars>
                <div className={styles['board-content']}>
                    {/* Page Title */}
                    <div style={{ 
                        padding: '2rem 2rem 1rem 2rem', 
                        color: 'var(--primary-foreground-color)' 
                    }}>
                        <h1 style={{ 
                            fontSize: '2rem', 
                            fontWeight: '700', 
                            margin: 0,
                            marginBottom: '0.5rem'
                        }}>
                            {getPageTitle()}
                        </h1>
                        <p style={{ 
                            color: 'var(--color-placeholder-text)', 
                            margin: 0,
                            fontSize: '1rem'
                        }}>
                            {type === 'movie' && 'Browse popular and top-rated movies'}
                            {type === 'series' && 'Browse popular and top-rated TV shows'}
                            {!type && 'Browse movies and TV shows by category'}
                        </p>
                    </div>

                    {/* Catalog Rows */}
                    {loading ? (
                        // Loading placeholders
                        Array.from({ length: 2 }, (_, i) => (
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

Discover.displayName = 'Discover';

export default Discover;