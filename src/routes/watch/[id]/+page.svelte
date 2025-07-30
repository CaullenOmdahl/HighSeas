<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import BufferedPlayer from '$lib/components/BufferedPlayer.svelte';
	import { streamProxyService } from '$lib/services/streamProxy';
	import { stremioService } from '$lib/services/stremio';
	import type { StremioMeta, StremioStream } from '$lib/services/stremio';

	let meta = $state<StremioMeta | null>(null);
	let streams = $state<StremioStream[]>([]);
	let selectedStream = $state<StremioStream | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const id = $derived($page.params.id);

	onMount(async () => {
		console.log('🎬 Watch page loading with ID:', id);
		console.log('🔍 Raw page params:', $page.params);
		console.log('🌐 Full URL:', $page.url.href);
		
		if (!id) {
			console.log('❌ No ID provided');
			return;
		}

		try {
			await stremioService.initialize();
			
			// Determine content type based on ID format
			let type = 'movie';
			let actualId = id;

			// If ID contains episode info, it's likely a series episode
			if (id.includes(':')) {
				type = 'series';
				actualId = id.split(':')[0]; // Get series ID part
			} else if (id.startsWith('tt')) {
				// IMDB ID - determine type by fetching meta first
				const movieMeta = await stremioService.getMeta('movie', id);
				const seriesMeta = await stremioService.getMeta('series', id);

				if (seriesMeta) {
					type = 'series';
					meta = seriesMeta;
				} else if (movieMeta) {
					type = 'movie';
					meta = movieMeta;
				}
			}

			// Fetch metadata if not already loaded
			if (!meta) {
				meta = await stremioService.getMeta(type, actualId);
			}

			// Fetch streams
			if (meta) {
				streams = await stremioService.getStreams(type, id);
				
				console.log(`Found ${streams.length} streams for ${meta.name}`);
				streams.forEach((stream, i) => {
					console.log(`Stream ${i + 1}:`, stream.title || stream.name, stream.url);
				});

				if (streams.length > 0) {
					selectedStream = streams[0];
					console.log(`✅ Selected stream: ${selectedStream.title || selectedStream.name}`);
				} else {
					console.log('❌ No streams found from any addon');
					console.log('💡 This could be because:');
					console.log('   - Content is too new or unavailable');  
					console.log('   - Real-Debrid subscription issues');
					console.log('   - Content ID format not supported');
					console.log('   - Geographic restrictions');
					error = `No streams available for "${meta?.name || 'this content'}". This could be due to:
				
• Content is too new or not yet available
• Real-Debrid subscription issues  
• Geographic restrictions
• Content not supported by current addons

Try with older, popular content or check your Real-Debrid subscription.`;
				}
			} else {
				error = 'Content not found';
			}
		} catch (err) {
			error = 'Failed to load content';
			console.error('Error loading watch data:', err);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>{meta?.name || 'Watch'} - HighSeas</title>
</svelte:head>

<div class="min-h-screen bg-black">
	{#if loading}
		<div class="flex min-h-screen items-center justify-center bg-black">
			<div class="text-center">
				<div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
				<div class="text-xl text-white mb-2">Preparing Player</div>
				<div class="text-sm text-gray-400">Loading streams and initializing video...</div>
			</div>
		</div>
	{:else if error}
		<div class="flex min-h-screen items-center justify-center bg-black">
			<div class="text-center max-w-lg px-4">
				<div class="mb-6 text-6xl opacity-50">⚠️</div>
				<h2 class="mb-4 text-xl font-bold text-white sm:text-2xl">Playback Error</h2>
				<div class="mb-6 text-sm text-gray-400 leading-relaxed whitespace-pre-line sm:text-base">{error}</div>
				<div class="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-center">
					<button class="rounded bg-red-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-black" onclick={() => window.location.reload()}>
						Try Again
					</button>
					<button class="rounded bg-gray-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-black" onclick={() => history.back()}>
						Go Back
					</button>
				</div>
			</div>
		</div>
	{:else if selectedStream && meta}
		<!-- Video Player -->
		<div class="relative">
			<BufferedPlayer src={selectedStream.url} poster={meta.background || meta.poster} title={meta.name} />
		</div>

		<!-- Content Info -->
		<div class="mx-auto max-w-4xl p-4 sm:p-6">
			<div class="flex flex-col gap-4 sm:gap-6 md:flex-row">
				<!-- Poster -->
				<div class="flex justify-center flex-shrink-0 md:justify-start">
					{#if meta.poster}
						<img src={meta.poster} alt={meta.name} class="h-64 w-44 rounded-lg object-cover sm:h-72 sm:w-48" />
					{/if}
				</div>

				<!-- Details -->
				<div class="flex-1 text-white">
					<h1 class="mb-2 text-xl font-bold sm:text-2xl md:text-3xl">{meta.name}</h1>

					<div class="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-400 sm:gap-4 sm:text-base">
						{#if meta.year}<span>{meta.year}</span>{/if}
						{#if meta.runtime}<span>{meta.runtime}</span>{/if}
						{#if meta.imdbRating}<span>★ {meta.imdbRating}/10</span>{/if}
					</div>

					{#if meta.genre && meta.genre.length > 0}
						<div class="mb-4 flex flex-wrap gap-2">
							{#each meta.genre as genre}
								<span class="rounded-full bg-gray-700 px-2 py-1 text-xs sm:px-3 sm:text-sm">{genre}</span>
							{/each}
						</div>
					{/if}

					{#if meta.description}
						<p class="mb-4 text-sm leading-relaxed text-gray-300 sm:text-base">{meta.description}</p>
					{/if}

					{#if meta.cast && meta.cast.length > 0}
						<div class="mb-4">
							<h3 class="mb-2 text-sm font-semibold sm:text-base">Cast</h3>
							<p class="text-sm text-gray-400 sm:text-base">{meta.cast.join(', ')}</p>
						</div>
					{/if}

					{#if meta.director && meta.director.length > 0}
						<div class="mb-4">
							<h3 class="mb-2 text-sm font-semibold sm:text-base">Director</h3>
							<p class="text-sm text-gray-400 sm:text-base">{meta.director.join(', ')}</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Stream Selection -->
			<div class="mt-6 sm:mt-8">
				<h3 class="mb-3 text-base font-semibold text-white sm:mb-4 sm:text-lg">Stream Quality</h3>
				{#if streams.length > 1}
					<div class="mb-4">
						<select 
							bind:value={selectedStream} 
							class="w-full max-w-full bg-gray-800 text-white border border-gray-700 rounded-md px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-red-600 focus:border-red-600 truncate"
						>
							{#each streams as stream, index}
								<option value={stream} class="truncate">
									{#if stream.title || stream.name}
										{(stream.title || stream.name || '').length > 60 
											? (stream.title || stream.name || '').substring(0, 60) + '...' 
											: (stream.title || stream.name || '')}
									{:else}
										Stream {index + 1}
									{/if}
								</option>
							{/each}
						</select>
					</div>
				{:else if streams.length === 1}
					<div class="text-gray-400 text-sm mb-4 break-words">
						<span class="font-medium">Playing:</span> 
						{selectedStream?.title || selectedStream?.name || 'Default Stream'}
						{#if selectedStream?.description}
							<br><span class="text-xs text-gray-500">Quality: {selectedStream.description}</span>
						{/if}
					</div>
				{/if}
				
				<!-- Stream details -->
				{#if selectedStream}
					<div class="bg-gray-800/50 rounded-lg p-4 w-full">
						<h4 class="text-white font-medium mb-2">Stream Information</h4>
						<div class="text-sm text-gray-300 space-y-1 break-words">
							<div class="flex flex-col sm:flex-row sm:gap-2">
								<span class="text-gray-400 font-medium flex-shrink-0">Source:</span> 
								<span class="break-all">
									{(selectedStream.title || selectedStream.name || 'Unknown').length > 80 
										? (selectedStream.title || selectedStream.name || 'Unknown').substring(0, 80) + '...' 
										: (selectedStream.title || selectedStream.name || 'Unknown')}
								</span>
							</div>
							{#if selectedStream.description}
								<div class="flex flex-col sm:flex-row sm:gap-2">
									<span class="text-gray-400 font-medium flex-shrink-0">Quality:</span> 
									<span class="break-words">{selectedStream.description}</span>
								</div>
							{/if}
							<div class="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700">
								{streams.length} stream{streams.length === 1 ? '' : 's'} available
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="flex min-h-screen items-center justify-center bg-black">
			<div class="text-center max-w-lg px-4">
				<div class="mb-6 text-6xl opacity-50">🚫</div>
				<h2 class="text-xl font-bold text-white mb-4 sm:text-2xl">No Streams Available</h2>
				<p class="text-sm text-gray-400 mb-6 leading-relaxed sm:text-base">
					No streaming sources were found for this content. This could be because:
				</p>
				<ul class="text-sm text-gray-400 text-left space-y-2 mb-6 sm:text-base">
					<li>• The content is not available on configured addons</li>
					<li>• Additional streaming addons need to be configured</li>
					<li>• The content ID format is not supported</li>
				</ul>
				<div class="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-center">
					<button class="rounded bg-red-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-black" onclick={() => window.location.reload()}>
						Try Again
					</button>
					<button class="rounded bg-gray-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-black" onclick={() => history.back()}>
						Go Back
					</button>
				</div>
				<p class="text-xs text-gray-500 mt-4">
					Check the browser console for detailed addon information.
				</p>
			</div>
		</div>
	{/if}
</div>
