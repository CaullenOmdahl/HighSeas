<script lang="ts">
	import { onMount } from 'svelte';
	import MovieRow from '$lib/components/MovieRow.svelte';
	import { stremioService } from '$lib/services/stremio';
	import type { StremioMetaPreview } from '$lib/services/stremio';

	let series: StremioMetaPreview[] = [];
	let loading = true;
	let selectedGenre = 'all';
	let selectedSort = 'popular';

	const genres = ['all', 'action', 'comedy', 'drama', 'horror', 'sci-fi', 'thriller', 'romance'];
	const sortOptions = [
		{ value: 'popular', label: 'Most Popular' },
		{ value: 'rating', label: 'Highest Rated' },
		{ value: 'year', label: 'Newest' }
	];

	onMount(async () => {
		try {
			await stremioService.initialize();
			await loadSeries();
		} catch (error) {
			console.error('Failed to load TV shows:', error);
		} finally {
			loading = false;
		}
	});

	async function loadSeries() {
		try {
			const [topSeries, newSeries, ratedSeries] = await Promise.allSettled([
				stremioService.getCatalog('series', 'top'),
				stremioService.getCatalog('series', 'year'),
				stremioService.getCatalog('series', 'imdbRating')
			]);

			const allSeries = new Map();
			[topSeries, newSeries, ratedSeries].forEach(result => {
				if (result.status === 'fulfilled') {
					result.value.forEach(show => allSeries.set(show.id, show));
				}
			});

			series = Array.from(allSeries.values());
			console.log(`Loaded ${series.length} TV shows`);
		} catch (error) {
			console.error('Failed to load TV shows from Stremio addons:', error);
		}
	}

	$: filteredSeries = series.filter(show => {
		if (selectedGenre === 'all') return true;
		return show.genre?.some(g => g.toLowerCase().includes(selectedGenre));
	});

	$: sortedSeries = [...filteredSeries].sort((a, b) => {
		switch (selectedSort) {
			case 'rating':
				return parseFloat(b.imdbRating || '0') - parseFloat(a.imdbRating || '0');
			case 'year':
				return parseInt(b.year || '0') - parseInt(a.year || '0');
			default: // popular
				return 0;
		}
	});
</script>

<svelte:head>
	<title>TV Shows - HighSeas</title>
</svelte:head>

<div class="min-h-screen bg-black pt-24">
	{#if loading}
		<div class="flex items-center justify-center min-h-screen">
			<div class="text-white text-xl">Loading TV shows...</div>
		</div>
	{:else}
		<div class="px-12">
			<h1 class="text-4xl font-black text-white mb-8">TV Shows</h1>
			
			<!-- Filters -->
			<div class="flex items-center space-x-8 mb-12">
				<!-- Genre Filter -->
				<div>
					<label for="tv-genre-select" class="block text-sm font-medium text-gray-400 mb-2">Genre</label>
					<select id="tv-genre-select" bind:value={selectedGenre} class="bg-gray-800 text-white border border-gray-700 rounded px-4 py-2">
						{#each genres as genre}
							<option value={genre}>{genre === 'all' ? 'All Genres' : genre.charAt(0).toUpperCase() + genre.slice(1)}</option>
						{/each}
					</select>
				</div>

				<!-- Sort Filter -->
				<div>
					<label for="tv-sort-select" class="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
					<select id="tv-sort-select" bind:value={selectedSort} class="bg-gray-800 text-white border border-gray-700 rounded px-4 py-2">
						{#each sortOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="text-gray-400 text-sm">
					{sortedSeries.length} shows found
				</div>
			</div>

			<!-- Content Rows -->
			{#if sortedSeries.length > 0}
				<div class="space-y-8">
					<MovieRow title="New Episodes" items={sortedSeries.slice(0, 10)} />
					<MovieRow title="Trending Shows" items={sortedSeries.slice(10, 20)} />
					<MovieRow title="Top Rated Series" items={sortedSeries.slice(20, 30)} />
					{#if sortedSeries.length > 30}
						<MovieRow title="More TV Shows" items={sortedSeries.slice(30, 40)} />
					{/if}
				</div>
			{:else}
				<div class="text-center py-12">
					<h2 class="text-2xl font-bold text-white mb-4">No TV Shows Found</h2>
					<p class="text-gray-400">Try adjusting your filters or check back later.</p>
				</div>
			{/if}
		</div>
	{/if}
</div>