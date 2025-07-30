import { browser } from '$app/environment';

// Torrentio configuration with specified providers
const TORRENTIO_CONFIG = {
	baseUrl: 'torrentio.strem.fun',
	// Exclude low quality streams - only allow high quality
	qualityFilter: [
		'brremux',
		'threed', 
		'480p',
		'other',
		'scr',
		'cam',
		'unknown'
	],
	// Use exclusion filter instead
	excludeQuality: [
		'brremux',
		'threed', 
		'480p',
		'other',
		'scr',
		'cam',
		'unknown'
	],
	debridOptions: [
		'nodownloadlinks',
		'nocatalog'
	],
	// Updated providers list as requested
	providers: [
		'yts',
		'eztv',
		'rarbg',
		'horriblesubs',
		'nyaasi'
	],
	realDebridToken: 'HKJ5DJGYOK7EB5A33C75NKXIVBDVX24R7LJCUHA6XJMY6UH3E6VQ'
};

// Build the Torrentio URL dynamically with specified providers and quality exclusions
function buildTorrentioUrl(): string {
	// Use exclusion filter to block low quality streams
	const qualityFilter = `qualityfilter=${TORRENTIO_CONFIG.excludeQuality.join(',')}`;
	const debridOptions = `debridoptions=${TORRENTIO_CONFIG.debridOptions.join(',')}`;
	const providers = `providers=${TORRENTIO_CONFIG.providers.join(',')}`;
	const realDebrid = `realdebrid=${TORRENTIO_CONFIG.realDebridToken}`;
	
	// Join with pipe character directly (will be encoded automatically when needed)
	const params = [qualityFilter, providers, debridOptions, realDebrid].join('|');
	
	return `stremio://${TORRENTIO_CONFIG.baseUrl}/${params}/manifest.json`;
}

export const config = {
	// Pre-installed Stremio addons for basic functionality
	preInstalledAddons: [
		'https://v3-cinemeta.strem.io/manifest.json', // TMDB catalog (metadata only)
		'https://watchhub.strem.io/manifest.json', // WatchHub (streams)
		// Popular streaming addons that provide actual streams
		buildTorrentioUrl(), // Torrentio with Real-Debrid
		'https://torrentio.strem.fun/manifest.json', // Torrentio without debrid (fallback)
	],

	// No longer using env vars for addons
	defaultAddons: [] as string[],

	// Quality filtering configuration
	qualityFilter: {
		excluded: TORRENTIO_CONFIG.excludeQuality,
		allowed: ['1080p', '2160p', '4k', 'uhd', 'hdr', 'dolby', 'atmos'], // High quality indicators
	},

	// App settings
	app: {
		name: 'HighSeas',
		version: '1.0.0'
	}
};

// Stream quality filtering utility
export function filterStreamsByQuality(streams: any[]): any[] {
	if (!streams || streams.length === 0) return streams;

	return streams.filter(stream => {
		const title = (stream.title || stream.name || '').toLowerCase();
		const description = (stream.description || '').toLowerCase();
		const streamText = `${title} ${description}`;

		// Check if stream contains any excluded quality indicators
		const hasExcludedQuality = config.qualityFilter.excluded.some(quality => 
			streamText.includes(quality.toLowerCase())
		);

		// If it has excluded quality, filter it out
		if (hasExcludedQuality) {
			console.log(`🚫 Filtering out low quality stream: ${stream.title || stream.name}`);
			return false;
		}

		// Check for high quality indicators (optional - keep streams without explicit quality markers)
		const hasHighQuality = config.qualityFilter.allowed.some(quality => 
			streamText.includes(quality.toLowerCase())
		);

		// Allow streams with high quality indicators or streams without explicit quality markers
		// (some streams don't specify quality in title but are still good quality)
		if (hasHighQuality || !hasAnyQualityMarker(streamText)) {
			return true;
		}

		// If no high quality indicator and has some quality marker, might be medium quality - allow it
		return true;
	});
}

// Helper function to detect if stream has any quality markers
function hasAnyQualityMarker(text: string): boolean {
	const qualityMarkers = [
		...config.qualityFilter.excluded,
		...config.qualityFilter.allowed,
		'720p', 'hd', 'bluray', 'webrip', 'webdl', 'dvdrip'
	];
	
	return qualityMarkers.some(marker => text.includes(marker.toLowerCase()));
}

// Server-side config (for API routes)
export const serverConfig = {
	// TMDB API key for fetching movie metadata (server only)
	tmdbApiKey: 'your_tmdb_key_here',
	
	// No longer using env vars
	defaultAddons: [] as string[]
};
