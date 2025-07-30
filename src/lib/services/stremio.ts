import { browser } from '$app/environment';
import { config, filterStreamsByQuality } from '$lib/config';

export interface StremioManifest {
	id: string;
	name: string;
	description: string;
	version: string;
	resources: (string | { name: string; types?: string[]; idPrefixes?: string[] })[];
	types: string[];
	catalogs?: Array<{
		type: string;
		id: string;
		name: string;
	}>;
	idPrefixes?: string[];
}

export interface StremioMetaPreview {
	id: string;
	type: string;
	name: string;
	poster?: string;
	background?: string;
	logo?: string;
	description?: string;
	genre?: string[];
	year?: string;
	imdbRating?: string;
	imdb_id?: string;
	moviedb_id?: number;
	runtime?: string;
	country?: string;
	released?: string;
	cast?: string[];
	director?: string[];
}

export interface StremioMeta extends StremioMetaPreview {
	videos?: Array<{
		id: string;
		title: string;
		released: string;
		season?: number;
		episode?: number;
	}>;
	director?: string[];
	cast?: string[];
	runtime?: string;
	country?: string;
	language?: string;
}

export interface StremioStream {
	url: string;
	title?: string;
	name?: string;
	description?: string;
	subtitles?: Array<{
		id: string;
		url: string;
		lang: string;
	}>;
}

export interface StremioAddon {
	manifest: StremioManifest;
	baseUrl: string;
}

export class StremioService {
	private addons: StremioAddon[] = [];
	private initialized = false;

	async addAddon(manifestUrl: string): Promise<void> {
		try {
			// Convert stremio:// URLs to https://
			let httpUrl = manifestUrl.replace('stremio://', 'https://');
			
			// Decode URL-encoded characters to prevent routing issues
			httpUrl = decodeURIComponent(httpUrl);

			console.log(`Fetching addon manifest from: ${httpUrl}`);
			const response = await fetch(httpUrl);
			if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

			const manifest: StremioManifest = await response.json();
			console.log(`📋 Manifest for ${httpUrl}:`, JSON.stringify(manifest, null, 2));
			const baseUrl = httpUrl.replace('/manifest.json', '');

			this.addons.push({ manifest, baseUrl });
			console.log(`✅ Added addon: ${manifest.name} (${manifest.id})`);
			console.log(`   - BaseURL: ${baseUrl}`);
			console.log(`   - Types: ${manifest.types.join(', ')}`);
			console.log(`   - Catalogs: ${manifest.catalogs?.length || 0} available`);
			
			// Debug: Check for URL encoding issues in baseUrl
			if (baseUrl.includes('%') || baseUrl.includes('|')) {
				console.warn(`⚠️ BaseURL contains special characters: ${baseUrl}`);
			}
		} catch (error) {
			console.error(`❌ Failed to add addon from ${manifestUrl}:`, error);
			throw error;
		}
	}

	async initialize(): Promise<void> {
		if (this.initialized) return;

		console.log('Initializing Stremio service...');
		console.log('Pre-installed addons:', config.preInstalledAddons);
		console.log('Additional addons:', config.defaultAddons);
		
		// Debug: Check for URL encoding issues in addon URLs
		config.preInstalledAddons.forEach((url, i) => {
			if (url.includes('%')) {
				console.log(`📡 Addon ${i} has encoded chars: ${url}`);
			}
		});

		// Load pre-installed addons first
		for (const addonUrl of config.preInstalledAddons) {
			try {
				await this.addAddon(addonUrl);
			} catch (error) {
				console.warn(`Failed to load pre-installed addon ${addonUrl}:`, error);
			}
		}

		// Load additional addons from configuration
		for (const addonUrl of config.defaultAddons) {
			try {
				await this.addAddon(addonUrl);
			} catch (error) {
				console.warn(`Failed to load configured addon ${addonUrl}:`, error);
			}
		}

		console.log(`Initialized with ${this.addons.length} addons`);
		this.initialized = true;
	}

	getAddons(): StremioAddon[] {
		return this.addons;
	}

	async getCatalog(
		type: string,
		id: string,
		extra?: Record<string, string>
	): Promise<StremioMetaPreview[]> {
		const results: StremioMetaPreview[] = [];

		for (const addon of this.addons) {
			// Check if addon provides catalogs (handle both string and object resources)
			const hasCatalogResource = addon.manifest.resources.some(r => 
				typeof r === 'string' ? r === 'catalog' : r.name === 'catalog'
			);
			if (!hasCatalogResource) continue;
			if (!addon.manifest.types.includes(type)) continue;

			const catalogExists = addon.manifest.catalogs?.some(
				(cat) => cat.type === type && cat.id === id
			);
			if (!catalogExists) {
				console.log(`   ⏭️ ${addon.manifest.name} doesn't have catalog ${type}/${id}`);
				continue;
			}

			try {
				let url = `${addon.baseUrl}/catalog/${type}/${id}.json`;

				if (extra && Object.keys(extra).length > 0) {
					const params = new URLSearchParams(extra);
					url += `?${params.toString()}`;
				}

				console.log(`📡 Fetching catalog from ${addon.manifest.name}: ${url}`);
				const response = await fetch(url);
				if (!response.ok) continue;

				const data = await response.json();
				console.log(`📦 ${addon.manifest.name} returned ${data.metas?.length || 0} items`);
				if (data.metas && Array.isArray(data.metas)) {
					// Transform the data to ensure consistent id field
					const transformedMetas = data.metas
						.map((meta: any) => ({
							...meta,
							id: meta.id || meta.imdb_id || meta.moviedb_id?.toString() || 'unknown'
						}))
						.filter((meta: any) => {
							// Filter out invalid IDs
							const id = meta.id;
							if (!id || id === 'unknown') return false;
							if (id.includes('%') || id.includes('|') || id.includes('/')) {
								console.warn(`🚫 ${addon.manifest.name} returned content with invalid ID: ${id} - ${meta.name}`);
								console.warn(`   Full meta object:`, meta);
								return false;
							}
							if (id.length > 50) {
								console.warn(`🚫 ${addon.manifest.name} returned content with suspiciously long ID: ${id} - ${meta.name}`);
								console.warn(`   Full meta object:`, meta);
								return false;
							}
							return true;
						});
					results.push(...transformedMetas);
				}
			} catch (error) {
				console.error(`Failed to fetch catalog from ${addon.manifest.name}:`, error);
			}
		}

		return results;
	}

	async getMeta(type: string, id: string): Promise<StremioMeta | null> {
		console.log(`🔍 Searching for metadata for ${type}/${id}`);
		
		for (const addon of this.addons) {
			if (!addon.manifest.resources.includes('meta')) continue;
			if (!addon.manifest.types.includes(type)) continue;

			// Check ID prefixes if specified
			if (addon.manifest.idPrefixes && addon.manifest.idPrefixes.length > 0) {
				const hasValidPrefix = addon.manifest.idPrefixes.some((prefix) => id.startsWith(prefix));
				if (!hasValidPrefix) continue;
			}

			try {
				const metaUrl = `${addon.baseUrl}/meta/${type}/${id}.json`;
				console.log(`🌐 Fetching meta from ${addon.manifest.name}: ${metaUrl}`);
				
				const response = await fetch(metaUrl);
				if (!response.ok) continue;

				const data = await response.json();
				if (data.meta) {
					console.log(`✅ Found metadata from ${addon.manifest.name}:`, data.meta);
					return data.meta;
				}
			} catch (error) {
				console.error(`Failed to fetch meta from ${addon.manifest.name}:`, error);
			}
		}

		console.log(`❌ No metadata found for ${type}/${id}`);
		return null;
	}

	async getStreams(type: string, id: string): Promise<StremioStream[]> {
		const results: StremioStream[] = [];

		console.log(`🔍 Searching for streams for ${type}/${id}`);
		console.log(`📦 Available addons: ${this.addons.length}`);
		
		// Debug: Show all addon details
		this.addons.forEach(addon => {
			console.log(`  📱 ${addon.manifest.name}:`);
			
			// Handle both string array and object array for resources
			const resources = addon.manifest.resources.map(r => 
				typeof r === 'string' ? r : r.name || 'unknown'
			);
			console.log(`     - Resources: ${resources.join(', ')}`);
			console.log(`     - Types: ${addon.manifest.types.join(', ')}`);
			console.log(`     - ID Prefixes: ${addon.manifest.idPrefixes?.join(', ') || 'none'}`);
			console.log(`     - BaseURL: ${addon.baseUrl}`);
		});

		for (const addon of this.addons) {
			console.log(`\n🔌 Checking addon: ${addon.manifest.name}`);
			
			// Handle both string array and object array for resources
			const resources = addon.manifest.resources.map(r => 
				typeof r === 'string' ? r : r.name || 'unknown'
			);
			console.log(`   - Resources: ${resources.join(', ')}`);
			console.log(`   - Types: ${addon.manifest.types.join(', ')}`);
			console.log(`   - ID Prefixes: ${addon.manifest.idPrefixes?.join(', ') || 'none'}`);

			// Check if addon provides streams (handle both string and object resources)
			const hasStreamResource = addon.manifest.resources.some(r => 
				typeof r === 'string' ? r === 'stream' : r.name === 'stream'
			);
			
			if (!hasStreamResource) {
				console.log(`   ❌ Addon doesn't provide streams`);
				continue;
			}
			
			if (!addon.manifest.types.includes(type)) {
				console.log(`   ❌ Addon doesn't support type: ${type}`);
				continue;
			}

			// Check ID prefixes - check both manifest level and resource level
			let idPrefixes = addon.manifest.idPrefixes || [];
			
			// Also check if the stream resource has its own idPrefixes
			const streamResource = addon.manifest.resources.find(r => 
				typeof r === 'object' && r.name === 'stream'
			);
			if (streamResource && typeof streamResource === 'object' && streamResource.idPrefixes) {
				idPrefixes = [...idPrefixes, ...streamResource.idPrefixes];
			}
			
			if (idPrefixes.length > 0) {
				const hasValidPrefix = idPrefixes.some((prefix) => id.startsWith(prefix));
				if (!hasValidPrefix) {
					console.log(`   ❌ ID ${id} doesn't match required prefixes: ${idPrefixes.join(', ')}`);
					continue;
				} else {
					console.log(`   ✅ ID ${id} matches prefix requirements`);
				}
			}

			try {
				const streamUrl = `${addon.baseUrl}/stream/${type}/${id}.json`;
				console.log(`   🌐 Fetching: ${streamUrl}`);
				
				const response = await fetch(streamUrl);
				console.log(`   📡 Response status: ${response.status} ${response.statusText}`);
				
				if (!response.ok) {
					console.log(`   ❌ Failed with status ${response.status}`);
					continue;
				}

				const data = await response.json();
				console.log(`   📄 Response data:`, data);
				
				if (data.streams && Array.isArray(data.streams)) {
					console.log(`   ✅ Found ${data.streams.length} streams`);
					// Filter streams by quality before adding to results
				const filteredStreams = filterStreamsByQuality(data.streams);
				console.log(`   🎯 After quality filtering: ${filteredStreams.length} streams`);
				
				results.push(...filteredStreams);
				} else {
					console.log(`   ❌ No streams in response`);
				}
			} catch (error) {
				console.error(`   💥 Error fetching streams from ${addon.manifest.name}:`, error);
			}
		}

		console.log(`\n🎯 Total streams found: ${results.length}`);
		return results;
	}

	async search(query: string, type?: string): Promise<StremioMetaPreview[]> {
		const results: StremioMetaPreview[] = [];
		const seen = new Set<string>(); // Deduplicate results

		console.log(`🔍 Searching for: "${query}"${type ? ` (type: ${type})` : ''}`);
		console.log(`📦 Available addons: ${this.addons.length}`);

		for (const addon of this.addons) {
			// Check if addon supports catalog resource (handle both string and object format)
			const hasCatalogResource = addon.manifest.resources.some(r => 
				typeof r === 'string' ? r === 'catalog' : r.name === 'catalog'
			);
			
			if (!hasCatalogResource) {
				console.log(`⏭️ ${addon.manifest.name} doesn't support catalog search`);
				continue;
			}

			const searchableCatalogs = addon.manifest.catalogs?.filter(
				(cat) => !type || cat.type === type
			);

			if (!searchableCatalogs?.length) {
				console.log(`⏭️ ${addon.manifest.name} has no searchable catalogs${type ? ` for type ${type}` : ''}`);
				continue;
			}

			console.log(`🔍 Searching ${addon.manifest.name} (${searchableCatalogs.length} catalogs)`);

			for (const catalog of searchableCatalogs) {
				try {
					const searchUrl = `${addon.baseUrl}/catalog/${catalog.type}/${catalog.id}.json?search=${encodeURIComponent(query)}`;
					console.log(`   📡 ${catalog.name}: ${searchUrl}`);
					
					const response = await fetch(searchUrl);
					
					if (!response.ok) {
						console.log(`   ❌ ${catalog.name}: HTTP ${response.status}`);
						continue;
					}

					const data = await response.json();
					
					if (data.metas && Array.isArray(data.metas)) {
						console.log(`   ✅ ${catalog.name}: Found ${data.metas.length} results`);
						
						// Filter and deduplicate results
						const newResults = data.metas
							.map((meta: any) => ({
								...meta,
								id: meta.id || meta.imdb_id || meta.moviedb_id?.toString() || 'unknown'
							}))
							.filter((meta: any) => {
								// Skip if already seen
								if (seen.has(meta.id)) return false;
								
								// Skip invalid IDs
								if (!meta.id || meta.id === 'unknown') return false;
								
								// Skip malformed IDs
								if (meta.id.includes('%') || meta.id.includes('|') || meta.id.length > 50) {
									return false;
								}
								
								seen.add(meta.id);
								return true;
							});
						
						results.push(...newResults);
						console.log(`   📝 Added ${newResults.length} unique results`);
					} else {
						console.log(`   ❌ ${catalog.name}: No metas in response`);
					}
				} catch (error) {
					console.error(`   💥 ${catalog.name}: Search failed`, error);
				}
			}
		}

		console.log(`🎯 Search complete: ${results.length} total results for "${query}"`);
		return results;
	}
}

// Global service instance
export const stremioService = new StremioService();
