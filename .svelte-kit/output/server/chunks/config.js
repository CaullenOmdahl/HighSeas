import { p as public_env } from './shared-server.js';
({
	// Default Stremio addons to load (from public env vars)
	defaultAddons: (public_env.PUBLIC_DEFAULT_ADDONS || '')
		.split(',')
		.filter(Boolean)
		.map((url) => url.trim())
});
({
	// TMDB API key for fetching movie metadata (server only)
	tmdbApiKey: process.env.TMDB_API_KEY || 'your_tmdb_key_here',
	// Default addons from private env vars
	defaultAddons: (process.env.DEFAULT_ADDONS || '')
		.split(',')
		.filter(Boolean)
		.map((url) => url.trim())
});
