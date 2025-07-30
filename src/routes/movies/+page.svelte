<script lang="ts">
	import { onMount } from 'svelte';
	import MovieRow from '$lib/components/MovieRow.svelte';
	import { stremioService } from '$lib/services/stremio';
	import type { StremioMetaPreview } from '$lib/services/stremio';

	let movies: StremioMetaPreview[] = [];
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
			await loadMovies();
		} catch (error) {
			console.error('Failed to load movies:', error);
		} finally {
			loading = false;
		}
	});

	async function loadMovies() {
		try {
			const [topMovies, popularMovies, ratedMovies] = await Promise.allSettled([
				stremioService.getCatalog('movie', 'top'),
				stremioService.getCatalog('movie', 'year'),
				stremioService.getCatalog('movie', 'imdbRating')
			]);

			const allMovies = new Map();
			[topMovies, popularMovies, ratedMovies].forEach(result => {
				if (result.status === 'fulfilled') {
					result.value.forEach(movie => allMovies.set(movie.id, movie));
				}
			});

			movies = Array.from(allMovies.values());
			console.log(`Loaded ${movies.length} movies`);
		} catch (error) {
			console.error('Failed to load movies from Stremio addons:', error);
		}
	}

	$: filteredMovies = movies.filter(movie => {
		if (selectedGenre === 'all') return true;
		return movie.genre?.some(g => g.toLowerCase().includes(selectedGenre));
	});

	$: sortedMovies = [...filteredMovies].sort((a, b) => {
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
	<title>Movies - HighSeas</title>
</svelte:head>

<div class="min-h-screen bg-black pt-24">
	{#if loading}
		<div class="flex items-center justify-center min-h-screen">
			<div class="text-white text-xl">Loading movies...</div>
		</div>
	{:else}
		<div class="px-12">
			<h1 class="text-4xl font-black text-white mb-8">Movies</h1>
			
			<!-- Filters -->
			<div class="flex items-center space-x-8 mb-12">
				<!-- Genre Filter -->
				<div>
					<label for="genre-select" class="block text-sm font-medium text-gray-400 mb-2">Genre</label>
					<select id="genre-select" bind:value={selectedGenre} class="bg-gray-800 text-white border border-gray-700 rounded px-4 py-2">
						{#each genres as genre}
							<option value={genre}>{genre === 'all' ? 'All Genres' : genre.charAt(0).toUpperCase() + genre.slice(1)}</option>
						{/each}
					</select>
				</div>

				<!-- Sort Filter -->
				<div>
					<label for="sort-select" class="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
					<select id="sort-select" bind:value={selectedSort} class="bg-gray-800 text-white border border-gray-700 rounded px-4 py-2">
						{#each sortOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="text-gray-400 text-sm">
					{sortedMovies.length} movies found
				</div>
			</div>

			<!-- Content Rows -->
			{#if sortedMovies.length > 0}
				<div class="space-y-8">
					<MovieRow title="New Releases" items={sortedMovies.slice(0, 10)} />
					<MovieRow title="Trending" items={sortedMovies.slice(10, 20)} />
					<MovieRow title="Top Rated" items={sortedMovies.slice(20, 30)} />
					{#if sortedMovies.length > 30}
						<MovieRow title="More Movies" items={sortedMovies.slice(30, 40)} />
					{/if}
				</div>
			{:else}
				<div class="text-center py-12">
					<h2 class="text-2xl font-bold text-white mb-4">No Movies Found</h2>
					<p class="text-gray-400">Try adjusting your filters or check back later.</p>
				</div>
			{/if}
		</div>
	{/if}
</div>