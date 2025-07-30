<script lang="ts">
	import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import type { StremioMetaPreview } from '$lib/services/stremio';

	interface Props {
		items: StremioMetaPreview[];
	}

	let { items }: Props = $props();
	let currentIndex = $state(0);
	let autoPlayInterval: ReturnType<typeof setInterval>;

	function nextSlide() {
		currentIndex = (currentIndex + 1) % items.length;
	}

	function prevSlide() {
		currentIndex = (currentIndex - 1 + items.length) % items.length;
	}

	function goToSlide(index: number) {
		currentIndex = index;
	}

	function startAutoPlay() {
		autoPlayInterval = setInterval(nextSlide, 6000);
	}

	function stopAutoPlay() {
		clearInterval(autoPlayInterval);
	}

	// Auto-play on mount
	$effect(() => {
		if (items.length > 1) {
			startAutoPlay();
		}
		return () => clearInterval(autoPlayInterval);
	});

	const currentItem = $derived(items[currentIndex]);
</script>

{#if items.length > 0}
	<section
		class="relative h-screen overflow-hidden"
		onmouseenter={stopAutoPlay}
		onmouseleave={startAutoPlay}
		role="banner"
		aria-label="Featured content carousel"
	>
		<!-- Background Images -->
		{#each items as item, index}
			<div
				class="absolute inset-0 transition-opacity duration-2000 {index === currentIndex
					? 'opacity-100'
					: 'opacity-0'}"
			>
				<div
					class="absolute inset-0 bg-cover bg-center bg-no-repeat"
					style="background-image: url('{item.background || item.poster}');"
				></div>
				<div class="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
			</div>
		{/each}

		<!-- Content -->
		<div class="relative z-10 flex h-full items-end px-4 pb-20 sm:px-6 md:px-12 md:pb-32">
			<div class="max-w-xl sm:max-w-2xl">
				<!-- Genre/Category Tag -->
				{#if currentItem.genre && currentItem.genre.length > 0}
					<div class="mb-4">
						<span class="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white">
							{currentItem.genre[0]}
						</span>
					</div>
				{/if}
				
				<h1 class="mb-4 text-2xl font-black text-white sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl sm:mb-6">
					{currentItem.name}
				</h1>
				
				<!-- Metadata -->
				<div class="mb-4 flex flex-wrap items-center gap-3 text-white sm:gap-4 md:gap-6 sm:mb-6">
					{#if currentItem.imdbRating}
						<div class="flex items-center space-x-1">
							<span class="text-yellow-400">★</span>
							<span class="font-medium">{currentItem.imdbRating}</span>
						</div>
					{/if}
					{#if currentItem.year}
						<span class="font-medium">{currentItem.year}</span>
					{/if}
					{#if currentItem.runtime}
						<span class="text-gray-300">{currentItem.runtime}</span>
					{/if}
					{#if currentItem.type}
						<span class="rounded-full bg-white/20 px-3 py-1 text-xs font-medium uppercase">
							{currentItem.type}
						</span>
					{/if}
				</div>
				
				{#if currentItem.description}
					<p class="mb-6 max-w-md text-sm leading-relaxed text-gray-200 sm:max-w-lg sm:text-base md:max-w-xl md:text-lg sm:mb-8">
						{currentItem.description.length > 150 
							? currentItem.description.slice(0, 150) + '...' 
							: currentItem.description}
					</p>
				{/if}
				
				<div class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
					<button
						class="flex items-center justify-center space-x-2 rounded bg-white px-6 py-3 text-base font-bold text-black transition-all hover:bg-gray-200 hover:scale-105 sm:px-8 sm:py-4 md:px-10 md:text-lg sm:space-x-3"
						onclick={() => {
							console.log(`🎬 Featured carousel navigating to: ${currentItem.name} (${currentItem.id})`);
							const url = currentItem.type === 'series' ? `/series/${currentItem.id}` : `/watch/${currentItem.id}`;
							console.log(`🔗 Target URL: ${url}`);
							goto(url);
						}}
					>
						<Play class="h-6 w-6" fill="currentColor" />
						<span>Play</span>
					</button>
					<button
						class="flex items-center justify-center space-x-2 rounded bg-gray-800/80 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-gray-700/80 hover:scale-105 sm:px-8 sm:py-4 md:text-lg sm:space-x-3"
					>
						<Info class="h-6 w-6" />
						<span>More Info</span>
					</button>
				</div>
			</div>
		</div>

		<!-- Navigation Arrows -->
		{#if items.length > 1}
			<button
				onclick={prevSlide}
				class="absolute top-1/2 left-4 z-20 -translate-y-1/2 rounded-full bg-black/50 p-3 opacity-0 transition-opacity hover:bg-black/70 hover:opacity-100"
				aria-label="Previous slide"
				data-pagination
			>
				<ChevronLeft class="h-8 w-8 text-white" />
			</button>

			<button
				onclick={nextSlide}
				class="absolute top-1/2 right-4 z-20 -translate-y-1/2 rounded-full bg-black/50 p-3 opacity-0 transition-opacity hover:bg-black/70 hover:opacity-100"
				aria-label="Next slide"
				data-pagination
			>
				<ChevronRight class="h-8 w-8 text-white" />
			</button>

			<!-- Dot Indicators -->
			<div class="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 space-x-2 sm:bottom-12 md:bottom-20">
				{#each items as _, index}
					<button
						onclick={() => goToSlide(index)}
						class="h-3 w-3 rounded-full transition-colors {index === currentIndex
							? 'bg-white'
							: 'bg-white/50'}"
						aria-label="Go to slide {index + 1}"
						data-pagination
					></button>
				{/each}
			</div>
		{/if}
	</section>
{/if}
