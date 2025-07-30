<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Search, X } from 'lucide-svelte';
	import MovieCard from '$lib/components/MovieCard.svelte';
	import { stremioService } from '$lib/services/stremio';
	import type { StremioMetaPreview } from '$lib/services/stremio';

	let searchQuery = $state('');
	let searchResults = $state<StremioMetaPreview[]>([]);
	let loading = $state(false);
	let searchInput: HTMLInputElement;
	
	// Get initial query from URL params
	const urlQuery = $derived($page.url.searchParams.get('q') || '');

	async function performSearch(query: string) {
		if (!query.trim()) {
			searchResults = [];
			return;
		}

		loading = true;
		try {
			const results = await stremioService.search(query.trim());
			searchResults = results.slice(0, 50); // Limit results
			console.log(`Found ${results.length} search results for "${query}"`);
		} catch (error) {
			console.error('Search failed:', error);
			searchResults = [];
		} finally {
			loading = false;
		}
	}

	function handleSearch() {
		if (searchQuery.trim()) {
			// Update URL with search query
			const url = new URL(window.location.href);
			url.searchParams.set('q', searchQuery.trim());
			goto(url.pathname + url.search, { replaceState: true });
			
			performSearch(searchQuery);
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}

	function clearSearch() {
		searchQuery = '';
		searchResults = [];
		const url = new URL(window.location.href);
		url.searchParams.delete('q');
		goto(url.pathname, { replaceState: true });
		searchInput?.focus();
	}

	onMount(() => {
		// Initialize Stremio service
		stremioService.initialize();
		
		// Set initial query and perform search if present
		if (urlQuery) {
			searchQuery = urlQuery;
			performSearch(urlQuery);
		}
		
		// Focus search input
		searchInput?.focus();
	});
</script>

<svelte:head>
	<title>Search{searchQuery ? ` - ${searchQuery}` : ''} - HighSeas</title>
</svelte:head>

<div class="min-h-screen bg-black pt-20">
	<!-- Search Header -->
	<div class="sticky top-16 z-40 bg-gradient-to-b from-black to-black/90 backdrop-blur-sm">
		<div class="mx-auto max-w-4xl px-4 py-6 sm:px-6">
			<div class="relative">
				<div class="relative flex items-center">
					<Search class="absolute left-4 h-5 w-5 text-gray-400" />
					<input
						bind:this={searchInput}
						bind:value={searchQuery}
						onkeypress={handleKeyPress}
						type="text"
						placeholder="Search movies and TV shows..."
						class="w-full rounded-full bg-gray-900 py-4 pl-12 pr-12 text-white placeholder-gray-400 focus:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600"
					/>
					{#if searchQuery}
						<button
							onclick={clearSearch}
							class="absolute right-4 rounded-full p-1 text-gray-400 transition-colors hover:text-white"
							aria-label="Clear search"
						>
							<X class="h-5 w-5" />
						</button>
					{/if}
				</div>
				
				{#if searchQuery.trim() && !loading}
					<button
						onclick={handleSearch}
						class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-red-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-900"
					>
						Search
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Search Results -->
	<div class="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
		{#if loading}
			<div class="flex items-center justify-center py-16">
				<div class="text-center">
					<div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
					<div class="text-white text-lg">Searching...</div>
					<div class="text-gray-400 text-sm mt-2">Looking through streaming catalogs</div>
				</div>
			</div>
		{:else if searchQuery.trim() && searchResults.length === 0}
			<div class="text-center py-16">
				<div class="text-6xl mb-6 opacity-50">🔍</div>
				<h2 class="text-xl font-bold text-white mb-4 sm:text-2xl">No Results Found</h2>
				<p class="text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
					We couldn't find any movies or TV shows matching "<strong class="text-white">{searchQuery}</strong>". 
					Try different keywords or check the spelling.
				</p>
				<button
					onclick={clearSearch}
					class="rounded bg-red-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-black"
				>
					Clear Search
				</button>
			</div>
		{:else if searchResults.length > 0}
			<div class="mb-6">
				<h2 class="text-xl font-semibold text-white sm:text-2xl">
					Search Results for "<span class="text-red-500">{searchQuery}</span>"
				</h2>
				<p class="text-gray-400 text-sm mt-2">{searchResults.length} results found</p>
			</div>
			
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" data-search-results>
				{#each searchResults as item (item.id)}
					<div class="flex justify-center">
						<MovieCard {item} size="medium" />
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-16">
				<div class="text-6xl mb-6 opacity-50">🎬</div>
				<h2 class="text-xl font-bold text-white mb-4 sm:text-2xl">Discover Content</h2>
				<p class="text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
					Search through thousands of movies and TV shows. Try searching for your favorite titles, actors, or genres.
				</p>
				<div class="flex flex-wrap justify-center gap-2 text-sm">
					<button onclick={() => { searchQuery = 'action'; handleSearch(); }} class="rounded-full bg-gray-800 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white">Action</button>
					<button onclick={() => { searchQuery = 'comedy'; handleSearch(); }} class="rounded-full bg-gray-800 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white">Comedy</button>
					<button onclick={() => { searchQuery = 'drama'; handleSearch(); }} class="rounded-full bg-gray-800 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white">Drama</button>
					<button onclick={() => { searchQuery = 'thriller'; handleSearch(); }} class="rounded-full bg-gray-800 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white">Thriller</button>
					<button onclick={() => { searchQuery = 'sci-fi'; handleSearch(); }} class="rounded-full bg-gray-800 px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white">Sci-Fi</button>
				</div>
			</div>
		{/if}
	</div>
</div>