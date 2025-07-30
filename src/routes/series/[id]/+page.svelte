<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Play, Info, Star } from 'lucide-svelte';
	import { stremioService } from '$lib/services/stremio';
	import type { StremioMeta } from '$lib/services/stremio';

	let seriesData = $state<StremioMeta | null>(null);
	let loading = $state(true);
	let selectedSeason = $state(1);
	let seasons = $state<{
		[key: number]: Array<{
			id: string;
			title: string;
			episode: number;
			season: number;
			released?: string;
		}>;
	}>({});

	const seriesId = $derived($page.params.id);

	onMount(async () => {
		try {
			await stremioService.initialize();
			if (seriesId) {
				seriesData = await stremioService.getMeta('series', seriesId);
			}
			
			console.log('Series data:', seriesData);

			if (seriesData?.videos) {
				console.log('Available videos:', seriesData.videos);
				
				// Group episodes by season
				seriesData.videos.forEach((video) => {
					const season = video.season || 1;
					const episode = video.episode || 1;
					if (!seasons[season]) {
						seasons[season] = [];
					}
					
					// Debug episode data
					console.log(`Episode S${season}E${episode}:`, {
						id: video.id,
						title: video.title,
						name: video.name,
						overview: video.overview,
						description: video.description
					});
					
					seasons[season].push({
						...video,
						season,
						episode,
						// Ensure we have a title - try multiple fields
						title: video.title || video.name || video.overview || `Episode ${episode}`
					});
				});

				// Sort episodes within each season
				Object.keys(seasons).forEach((seasonKey) => {
					const season = parseInt(seasonKey);
					seasons[season].sort((a, b) => (a.episode || 0) - (b.episode || 0));
				});
				
				console.log('Organized seasons:', seasons);
			} else {
				console.log('No videos found in series data');
			}
		} catch (error) {
			console.error('Failed to load series data:', error);
		} finally {
			loading = false;
		}
	});

	const availableSeasons = $derived(Object.keys(seasons)
		.map(Number)
		.sort((a, b) => a - b));
	const currentSeasonEpisodes = $derived(seasons[selectedSeason] || []);

	function playEpisode(episodeId: string) {
		window.location.href = `/watch/${episodeId}`;
	}
</script>

<svelte:head>
	<title>{seriesData?.name || 'Series'} - HighSeas</title>
</svelte:head>

<div class="min-h-screen bg-black text-white">
	{#if loading}
		<div class="flex min-h-screen items-center justify-center bg-black">
			<div class="text-center">
				<div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
				<div class="text-xl text-white mb-2">Loading Series</div>
				<div class="text-sm text-gray-400">Fetching episodes and metadata...</div>
			</div>
		</div>
	{:else if seriesData}
		<!-- Hero Section -->
		<section class="relative h-96 md:h-screen">
			<div
				class="absolute inset-0 bg-cover bg-center"
				style="background-image: url('{seriesData.background || seriesData.poster}');"
			></div>
			<div class="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>

			<div class="relative z-10 flex h-full max-w-4xl items-center px-4 sm:px-6">
				<div>
					<h1 class="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl lg:text-6xl">{seriesData.name}</h1>
					<div class="mb-4 flex flex-wrap items-center gap-3 sm:gap-4 sm:mb-6">
						{#if seriesData.year}
							<span class="text-lg">{seriesData.year}</span>
						{/if}
						{#if seriesData.imdbRating}
							<span class="flex items-center space-x-1">
								<Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
								<span>{seriesData.imdbRating}</span>
							</span>
						{/if}
						{#if seriesData.genre && seriesData.genre.length > 0}
							<span class="text-gray-300">{seriesData.genre.slice(0, 3).join(' • ')}</span>
						{/if}
					</div>
					{#if seriesData.description}
						<p class="mb-6 max-w-xl text-sm leading-relaxed text-gray-300 sm:max-w-2xl sm:text-base md:text-lg sm:mb-8">
							{seriesData.description}
						</p>
					{/if}
					<div class="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
						{#if currentSeasonEpisodes.length > 0}
							<button
								class="flex items-center justify-center space-x-2 rounded bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-gray-200 sm:px-8"
								onclick={() => playEpisode(currentSeasonEpisodes[0].id)}
							>
								<Play class="h-5 w-5" fill="currentColor" />
								<span>Play S{selectedSeason}E1</span>
							</button>
						{/if}
						<button
							class="flex items-center justify-center space-x-2 rounded bg-gray-600/50 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-600/70 sm:px-8"
						>
							<Info class="h-5 w-5" />
							<span>More Info</span>
						</button>
					</div>
				</div>
			</div>
		</section>

		<!-- Episodes Section -->
		<div class="px-4 py-6 sm:px-6 sm:py-8">
			<!-- Season Selector -->
			{#if availableSeasons.length > 1}
				<div class="mb-6">
					<h2 class="mb-4 text-2xl font-bold">Episodes</h2>
					<div class="mb-4">
						<select 
							bind:value={selectedSeason} 
							class="bg-gray-800 text-white border border-gray-700 rounded-md px-4 py-2 text-lg font-medium focus:ring-2 focus:ring-red-600 focus:border-red-600"
						>
							{#each availableSeasons as season}
								<option value={season}>Season {season}</option>
							{/each}
						</select>
					</div>
				</div>
			{/if}

			<!-- Episodes Grid -->
			{#if currentSeasonEpisodes.length > 0}
				<div class="mb-6">
					<h3 class="mb-4 text-xl font-semibold">Season {selectedSeason} Episodes</h3>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
						{#each currentSeasonEpisodes as episode}
							<button
								class="w-full cursor-pointer overflow-hidden rounded-lg bg-gray-900 transition-colors hover:bg-gray-800 text-left"
								onclick={() => playEpisode(episode.id)}
								aria-label="Play {episode.title || `Episode ${episode.episode}`}"
							>
								<div class="p-4">
									<div class="mb-2 flex items-center justify-between">
										<h4 class="font-semibold">Episode {episode.episode || 'TBD'}</h4>
										<Play class="h-5 w-5 text-gray-400" />
									</div>
									<p class="mb-2 text-sm text-gray-300 font-medium">
										{episode.title || `Episode ${episode.episode || 'Unknown'}`}
									</p>
									{#if episode.released}
										<p class="text-xs text-gray-500">
											{new Date(episode.released).toLocaleDateString()}
										</p>
									{/if}
									<div class="mt-2 text-xs text-gray-600">
										ID: {episode.id}
									</div>
								</div>
							</button>
						{/each}
					</div>
				</div>
			{:else}
				<div class="py-12 text-center">
					<p class="text-gray-400">No episodes available for Season {selectedSeason}</p>
				</div>
			{/if}

			<!-- Cast and Crew -->
			{#if seriesData.cast || seriesData.director}
				<div class="mt-12">
					<h3 class="mb-4 text-xl font-semibold">Cast & Crew</h3>
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						{#if seriesData.cast && seriesData.cast.length > 0}
							<div>
								<h4 class="mb-2 font-medium">Cast</h4>
								<p class="text-gray-300">{seriesData.cast.slice(0, 5).join(', ')}</p>
							</div>
						{/if}
						{#if seriesData.director && seriesData.director.length > 0}
							<div>
								<h4 class="mb-2 font-medium">Director</h4>
								<p class="text-gray-300">{seriesData.director.join(', ')}</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<div class="flex min-h-screen items-center justify-center bg-black">
			<div class="text-center max-w-md px-4">
				<div class="mb-6 text-6xl opacity-50">📺</div>
				<h2 class="mb-4 text-xl font-bold text-white sm:text-2xl">Series Not Found</h2>
				<p class="mb-6 text-sm text-gray-400 leading-relaxed sm:text-base">Unable to load series information. The content may not be available or there might be a connection issue.</p>
				<button class="rounded bg-red-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-black" onclick={() => history.back()}>
					Go Back
				</button>
			</div>
		</div>
	{/if}
</div>
