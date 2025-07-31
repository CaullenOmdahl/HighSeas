// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import { memo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import classnames from 'classnames';
import MainNavBars from '../stremio/components/MainNavBars/MainNavBars';
import MetaItem from '../stremio/components/MetaItem/MetaItem';
import Icon from '../stremio/components/Icon/Icon';
import { MetaItemPreview } from '../lib/types';
import stremioService from '../lib/services/stremio';
import styles from './Board.module.less'; // Reuse Board styles

const Search = memo(() => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [results, setResults] = useState<MetaItemPreview[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'movie' | 'series'>('all');

    // Debounced search function
    const performSearch = useCallback(async (searchQuery: string, contentType: 'all' | 'movie' | 'series' = 'all') => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        try {
            setLoading(true);
            
            let searchResults: MetaItemPreview[] = [];
            
            if (contentType === 'all') {
                searchResults = await stremioService.searchContent(searchQuery);
            } else {
                searchResults = await stremioService.searchContent(searchQuery, contentType);
            }
            
            setResults(searchResults);
        } catch (error) {
            console.error('Search failed:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Update URL params when query changes
    useEffect(() => {
        if (query) {
            setSearchParams({ q: query });
        } else {
            setSearchParams({});
        }
    }, [query, setSearchParams]);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            performSearch(query, filter);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, filter, performSearch]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };

    const handleFilterChange = (newFilter: 'all' | 'movie' | 'series') => {
        setFilter(newFilter);
        if (query) {
            performSearch(query, newFilter);
        }
    };

    const handleItemClick = (item: MetaItemPreview) => {
        navigate(`/detail/${item.type}/${item.id}`);
    };

    const handleClearSearch = () => {
        setQuery('');
        setResults([]);
    };

    return (
        <div className={classnames(styles['board-container'])}>
            <MainNavBars>
                <div className={styles['board-content']}>
                    {/* Search Header */}
                    <div style={{ 
                        padding: '2rem 2rem 1rem 2rem', 
                        color: 'var(--primary-foreground-color)' 
                    }}>
                        <h1 style={{ 
                            fontSize: '2rem', 
                            fontWeight: '700', 
                            margin: 0,
                            marginBottom: '1rem'
                        }}>
                            Search
                        </h1>

                        {/* Search Input */}
                        <div style={{ 
                            position: 'relative', 
                            maxWidth: '600px',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    color: 'var(--color-placeholder-text)',
                                    pointerEvents: 'none',
                                    zIndex: 2
                                }}>
                                    <Icon icon="search" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search for movies and TV shows..."
                                    value={query}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '1rem 3rem 1rem 3rem',
                                        fontSize: '1rem',
                                        border: '2px solid var(--color-surface-lighter)',
                                        borderRadius: '8px',
                                        backgroundColor: 'var(--color-surface)',
                                        color: 'var(--primary-foreground-color)',
                                        outline: 'none',
                                        transition: 'border-color 0.2s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--color-surface-lighter)'}
                                />
                                {query && (
                                    <button
                                        onClick={handleClearSearch}
                                        style={{
                                            position: 'absolute',
                                            right: '1rem',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--color-placeholder-text)',
                                            cursor: 'pointer',
                                            padding: '0.25rem',
                                            borderRadius: '4px',
                                            zIndex: 2
                                        }}
                                    >
                                        <Icon icon="close" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '0.5rem',
                            marginBottom: '1rem'
                        }}>
                            {(['all', 'movie', 'series'] as const).map((filterOption) => (
                                <button
                                    key={filterOption}
                                    onClick={() => handleFilterChange(filterOption)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid var(--color-surface-lighter)',
                                        borderRadius: '6px',
                                        backgroundColor: filter === filterOption 
                                            ? 'var(--color-primary)' 
                                            : 'var(--color-surface)',
                                        color: filter === filterOption 
                                            ? 'white' 
                                            : 'var(--primary-foreground-color)',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        transition: 'all 0.2s ease',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {filterOption === 'all' ? 'All' : filterOption === 'movie' ? 'Movies' : 'TV Shows'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search Results */}
                    <div style={{ padding: '0 2rem 2rem' }}>
                        {loading ? (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '3rem',
                                color: 'var(--color-placeholder-text)'
                            }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <Icon icon="search" size="large" />
                                </div>
                                <p>Searching...</p>
                            </div>
                        ) : query && results.length === 0 ? (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '3rem',
                                color: 'var(--color-placeholder-text)'
                            }}>
                                <div style={{ marginBottom: '1rem', opacity: 0.5 }}>
                                    <Icon icon="search" size="large" />
                                </div>
                                <p>No results found for "{query}"</p>
                                <p style={{ fontSize: '0.875rem' }}>Try different keywords or check your spelling</p>
                            </div>
                        ) : query && results.length > 0 ? (
                            <div>
                                <h3 style={{ 
                                    color: 'var(--primary-foreground-color)',
                                    marginBottom: '1.5rem',
                                    fontSize: '1.25rem'
                                }}>
                                    Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                                </h3>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                    gap: '1rem'
                                }}>
                                    {results.map((item) => (
                                        <div 
                                            key={item.id} 
                                            onClick={() => handleItemClick(item)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <MetaItem {...item} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '3rem',
                                color: 'var(--color-placeholder-text)'
                            }}>
                                <div style={{ marginBottom: '1rem', opacity: 0.5 }}>
                                    <Icon icon="search" size="large" />
                                </div>
                                <p>Start typing to search for movies and TV shows</p>
                            </div>
                        )}
                    </div>
                </div>
            </MainNavBars>
        </div>
    );
});

Search.displayName = 'Search';

export default Search;