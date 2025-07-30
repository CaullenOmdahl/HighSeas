<script lang="ts">
	import { onMount } from 'svelte';
	import MovieRow from '$lib/components/MovieRow.svelte';
	import FeaturedCarousel from '$lib/components/FeaturedCarousel.svelte';
	import { stremioService } from '$lib/services/stremio';
	import type { StremioMetaPreview } from '$lib/services/stremio';

	let movies = $state<StremioMetaPreview[]>([]);
	let series = $state<StremioMetaPreview[]>([]);
	let featuredContent = $state<StremioMetaPreview[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			// Initialize Stremio service with configured addons
			await stremioService.initialize();
			await loadContent();
		} catch (error) {
			console.error('Failed to load content:', error);
		} finally {
			loading = false;
		}
	});

	async function loadContent() {
		try {
			// Debug: Show loaded addons and their catalogs
			const addons = stremioService.getAddons();
			console.log(
				'Available addons:',
				addons.map((a) => ({
					name: a.manifest.name,
					catalogs: a.manifest.catalogs
				}))
			);

			// Load content from multiple catalogs using correct catalog IDs
			const [movieResults, seriesResults] = await Promise.allSettled([
				Promise.allSettled([
					stremioService.getCatalog('movie', 'top'), // Popular movies
					stremioService.getCatalog('movie', 'year'), // New movies
					stremioService.getCatalog('movie', 'imdbRating') // Featured movies
				]),
				Promise.allSettled([
					stremioService.getCatalog('series', 'top'), // Popular series
					stremioService.getCatalog('series', 'year'), // New series
					stremioService.getCatalog('series', 'imdbRating') // Featured series
				])
			]);

			// Combine and deduplicate movies
			const allMovies = new Map();
			if (movieResults.status === 'fulfilled') {
				movieResults.value.forEach((result) => {
					if (result.status === 'fulfilled') {
						result.value.forEach((movie) => allMovies.set(movie.id, movie));
					}
				});
			}
			movies = Array.from(allMovies.values()).slice(0, 20);

			// Combine and deduplicate series
			const allSeries = new Map();
			if (seriesResults.status === 'fulfilled') {
				seriesResults.value.forEach((result) => {
					if (result.status === 'fulfilled') {
						result.value.forEach((series) => allSeries.set(series.id, series));
					}
				});
			}
			series = Array.from(allSeries.values()).slice(0, 20);

			// Create featured content from top 5 movies and series combined
			const topMovies = movies.slice(0, 3);
			const topSeries = series.slice(0, 2);
			featuredContent = [...topMovies, ...topSeries].slice(0, 5);

			console.log(
				`Loaded ${movies.length} movies, ${series.length} series, ${featuredContent.length} featured`
			);
			
			// Debug: Check for malformed IDs
			console.log('🔍 Featured content IDs:');
			featuredContent.forEach((item, i) => {
				console.log(`  ${i}: ${item.id} - ${item.name}`);
				if (item.id.includes('%') || item.id.includes('|') || item.id.length > 50) {
					console.warn(`⚠️ Suspicious ID detected: ${item.id}`);
				}
			});

			// Log if no content was loaded for debugging
			if (movies.length === 0 && series.length === 0) {
				console.error(
					'No content loaded from any addon. Check addon configuration and network connectivity.'
				);
			}
		} catch (error) {
			console.error('Failed to load content from Stremio addons:', error);
		}
	}
</script>

<svelte:head>
	<title>HighSeas - Stream Movies & TV Shows</title>
</svelte:head>

<div class="pt-16">
	{#if loading}
		<div class="flex min-h-screen items-center justify-center bg-black">
			<div class="text-center max-w-md">
				<div class="relative mb-8">
					<div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-red-600/20 border-t-red-600"></div>
					<div class="absolute inset-0 flex items-center justify-center">
						<div class="h-8 w-8 rounded-full bg-red-600 animate-pulse"></div>
					</div>
				</div>
				<div class="text-2xl font-bold text-white mb-3">Discovering Content</div>
				<div class="text-sm text-gray-400 leading-relaxed">
					Connecting to streaming services and loading your personalized library...
				</div>
				<div class="mt-6 flex justify-center space-x-2">
					<div class="h-2 w-2 bg-red-600 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
					<div class="h-2 w-2 bg-red-600 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
					<div class="h-2 w-2 bg-red-600 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
				</div>
			</div>
		</div>
	{:else}
		<!-- Featured Carousel -->
		{#if featuredContent.length > 0}
			<FeaturedCarousel items={featuredContent} />
		{/if}

		<!-- Content Rows -->
		<div class="relative z-10 {featuredContent.length > 0 ? '-mt-16' : 'pt-8'} space-y-8 px-4 sm:px-6 lg:px-8">
			{#if movies.length > 0 || series.length > 0}
				{#if movies.length > 0}
					<MovieRow title="Trending Movies" items={movies.slice(5, 15)} />
				{/if}
				{#if series.length > 0}
					<MovieRow title="Popular TV Shows" items={series.slice(5, 15)} />
				{/if}
				{#if movies.length > 10}
					<MovieRow title="Top Rated Movies" items={movies.slice(10, 20)} />
				{/if}
				{#if series.length > 10}
					<MovieRow title="Recently Added Series" items={series.slice(10, 20)} />
				{/if}
				{#if movies.length > 15 || series.length > 15}
					<MovieRow title="New Releases" items={[...movies.slice(0, 5), ...series.slice(0, 5)]} />
				{/if}
			{:else}
				<div class="px-4 py-12 text-center sm:px-6">
					<div class="mx-auto max-w-md">
						<div class="mb-6 text-6xl opacity-50">🌊</div>
						<h2 class="mb-4 text-xl font-bold text-white sm:text-2xl">No Content Available</h2>
						<p class="mb-6 text-sm text-gray-400 leading-relaxed sm:text-base">
							Unable to load content from streaming services. This could be due to network connectivity issues or addon configuration problems.
						</p>
						<button class="rounded bg-red-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-black" onclick={() => window.location.reload()}>
							Try Again
						</button>
						<p class="mt-4 text-xs text-gray-500">Check browser console for detailed error information.</p>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
