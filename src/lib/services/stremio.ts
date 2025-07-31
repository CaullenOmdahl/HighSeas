// Copyright (C) 2017-2023 Smart code 203358507 - Modified for HighSeas

import { MetaItemPreview, Catalog } from '../types';

interface StremioAddon {
    transportUrl: string;
    manifest: {
        id: string;
        name: string;
        version: string;
        catalogs: Array<{
            type: 'movie' | 'series';
            id: string;
            name: string;
        }>;
    };
}

interface StremioMeta {
    id: string;
    name: string;
    type: 'movie' | 'series';
    poster?: string;
    background?: string;
    description?: string;
    releaseInfo?: string;
    year?: string;
    runtime?: string;
    genres?: string[];
    imdbRating?: string;
    country?: string;
    director?: string[];
    cast?: string[];
}

class StremioService {
    private addons: StremioAddon[] = [
        {
            transportUrl: 'https://v3-cinemeta.strem.io',
            manifest: {
                id: 'cinemeta',
                name: 'Cinemeta',
                version: '1.0.0',
                catalogs: [
                    { type: 'movie', id: 'popular', name: 'Popular Movies' },
                    { type: 'movie', id: 'top', name: 'Top Movies' },
                    { type: 'series', id: 'popular', name: 'Popular TV Shows' },
                    { type: 'series', id: 'top', name: 'Top TV Shows' },
                ]
            }
        }
    ];

    private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...options.headers,
                }
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    private convertMetaToPreview(meta: StremioMeta): MetaItemPreview {
        return {
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
    }

    async getCatalog(type: 'movie' | 'series', catalogId: string, skip = 0, limit = 100): Promise<MetaItemPreview[]> {
        try {
            const addon = this.addons[0]; // Use Cinemeta for now
            const url = `${addon.transportUrl}/catalog/${type}/${catalogId}/skip=${skip}.json`;
            
            console.log(`Fetching catalog: ${url}`);
            
            const response = await this.fetchWithTimeout(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.metas || !Array.isArray(data.metas)) {
                throw new Error('Invalid catalog response format');
            }

            const previews = data.metas
                .slice(0, limit)
                .map((meta: StremioMeta) => this.convertMetaToPreview(meta));
            
            return previews;
                
        } catch (error) {
            console.error(`Failed to fetch catalog ${type}/${catalogId}:`, error);
            return [];
        }
    }

    async getPopularMovies(limit = 20): Promise<MetaItemPreview[]> {
        return this.getCatalog('movie', 'popular', 0, limit);
    }

    async getTopMovies(limit = 20): Promise<MetaItemPreview[]> {
        return this.getCatalog('movie', 'top', 0, limit);
    }

    async getPopularSeries(limit = 20): Promise<MetaItemPreview[]> {
        return this.getCatalog('series', 'popular', 0, limit);
    }

    async getTopSeries(limit = 20): Promise<MetaItemPreview[]> {
        return this.getCatalog('series', 'top', 0, limit);
    }

    async getAllCatalogs(): Promise<Catalog[]> {
        try {
            const [popularMovies, topMovies, popularSeries, topSeries] = await Promise.allSettled([
                this.getPopularMovies(20),
                this.getTopMovies(20),
                this.getPopularSeries(20),
                this.getTopSeries(20)
            ]);

            const catalogs: Catalog[] = [];

            if (popularMovies.status === 'fulfilled' && popularMovies.value.length > 0) {
                catalogs.push({
                    id: 'popular-movies',
                    name: 'Popular Movies',
                    type: 'movie',
                    items: popularMovies.value
                });
            }

            if (topMovies.status === 'fulfilled' && topMovies.value.length > 0) {
                catalogs.push({
                    id: 'top-movies',
                    name: 'Top Movies',
                    type: 'movie',
                    items: topMovies.value
                });
            }

            if (popularSeries.status === 'fulfilled' && popularSeries.value.length > 0) {
                catalogs.push({
                    id: 'popular-series',
                    name: 'Popular TV Shows',
                    type: 'series',
                    items: popularSeries.value
                });
            }

            if (topSeries.status === 'fulfilled' && topSeries.value.length > 0) {
                catalogs.push({
                    id: 'top-series',
                    name: 'Top TV Shows',
                    type: 'series',
                    items: topSeries.value
                });
            }

            return catalogs;
            
        } catch (error) {
            console.error('Failed to load catalogs:', error);
            return [];
        }
    }

    // Placeholder for continue watching - would integrate with user's viewing history
    async getContinueWatching(): Promise<MetaItemPreview[]> {
        // For now, return empty array - this would integrate with user's viewing history
        return [];
    }

    async searchContent(query: string, type?: 'movie' | 'series'): Promise<MetaItemPreview[]> {
        if (!query.trim()) return [];
        
        try {
            // Use Stremio's Cinemeta search functionality
            const searchUrl = type 
                ? `https://v3-cinemeta.strem.io/catalog/${type}/cinemeta-top/search=${encodeURIComponent(query)}.json`
                : `https://v3-cinemeta.strem.io/catalog/movie/cinemeta-top/search=${encodeURIComponent(query)}.json`;
            
            const response = await fetch(searchUrl);
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }
            
            const data = await response.json();
            const results = data.metas || [];
            
            // Convert to our format
            const searchResults: MetaItemPreview[] = results.map((meta: any) => ({
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
            }));

            // If no type specified, also search TV series
            if (!type) {
                try {
                    const seriesUrl = `https://v3-cinemeta.strem.io/catalog/series/cinemeta-top/search=${encodeURIComponent(query)}.json`;
                    const seriesResponse = await fetch(seriesUrl);
                    
                    if (seriesResponse.ok) {
                        const seriesData = await seriesResponse.json();
                        const seriesResults = seriesData.metas || [];
                        
                        const seriesItems: MetaItemPreview[] = seriesResults.map((meta: any) => ({
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
                        }));
                        
                        searchResults.push(...seriesItems);
                    }
                } catch (error) {
                    console.warn('Series search failed:', error);
                }
            }
            
            return searchResults.slice(0, 50); // Limit results
            
        } catch (error) {
            console.error('Search failed:', error);
            return [];
        }
    }

    async searchMovies(query: string): Promise<MetaItemPreview[]> {
        return this.searchContent(query, 'movie');
    }

    async searchSeries(query: string): Promise<MetaItemPreview[]> {
        return this.searchContent(query, 'series');
    }
}

// Create and export a singleton instance
export const stremioService = new StremioService();
export default stremioService;