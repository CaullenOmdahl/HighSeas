<script lang="ts">
	import { Play } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	interface Props {
		item: {
			id: string;
			name: string;
			poster?: string;
			type: string;
			year?: string;
			imdbRating?: string;
			genre?: string[];
		};
		size?: 'small' | 'medium' | 'large';
	}

	let { item, size = 'medium' }: Props = $props();

	const sizeClasses = {
		small: 'w-32 h-44 sm:w-36 sm:h-52 md:w-40 md:h-56',
		medium: 'w-36 h-52 sm:w-44 sm:h-64 md:w-48 md:h-72',
		large: 'w-44 h-64 sm:w-52 sm:h-76 md:w-56 md:h-80'
	};
</script>

<button class="movie-card group relative cursor-pointer w-full text-left" data-movie-card tabindex="0" aria-label="{item.name}" onclick={() => {
		console.log(`🎬 Navigating to content: ${item.name} (${item.id})`);
		const url = item.type === 'series' ? `/series/${item.id}` : `/watch/${item.id}`;
		console.log(`🔗 Target URL: ${url}`);
		goto(url);
	}}>
	<div class="relative">
		<div class="{sizeClasses[size]} card-image relative overflow-hidden rounded-md bg-gray-900 shadow-lg transition-all duration-300">
			{#if item.poster}
				<img src={item.poster} alt={item.name} class="h-full w-full object-cover" loading="lazy" />
			{:else}
				<div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400">
					<div class="text-center">
						<div class="mb-2 text-3xl">🎬</div>
						<div class="px-3 text-xs font-medium">{item.name}</div>
					</div>
				</div>
			{/if}

			<!-- Gradient overlay -->
			<div class="card-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300"></div>

			<!-- Hover controls -->
			<div class="card-controls absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 pointer-events-none">
				<div class="rounded-full bg-white p-2 shadow-lg transition-all sm:p-3">
					<Play class="h-4 w-4 text-black sm:h-5 sm:w-5 md:h-6 md:w-6" fill="currentColor" />
				</div>
			</div>

			<!-- Bottom info on hover -->
			<div class="card-info absolute bottom-0 left-0 right-0 p-2 text-white opacity-0 transition-opacity duration-300 sm:p-3">
				<h3 class="mb-1 text-xs font-bold leading-tight sm:text-sm">{item.name}</h3>
				<div class="flex items-center space-x-1 text-xs sm:space-x-2">
					{#if item.year}
						<span class="text-gray-300">{item.year}</span>
					{/if}
					{#if item.imdbRating}
						<div class="flex items-center space-x-1">
							<span class="text-yellow-400">★</span>
							<span>{item.imdbRating}</span>
						</div>
					{/if}
				</div>
				{#if item.genre && item.genre.length > 0}
					<div class="mt-1">
						<span class="rounded bg-red-600 px-1 py-0.5 text-xs font-medium sm:px-1.5">
							{item.genre[0]}
						</span>
					</div>
				{/if}
			</div>
		</div>

		<!-- Title for non-hover state - centered -->
		<div class="card-title mt-2 text-center transition-opacity duration-300 sm:mt-3">
			<h3 class="text-xs font-medium text-white line-clamp-2 sm:text-sm">{item.name}</h3>
			{#if item.year}
				<p class="text-xs text-gray-400 mt-1">{item.year}</p>
			{/if}
		</div>
	</div>
</button>

<style>
	.movie-card:hover .card-image,
	.movie-card:focus .card-image {
		transform: scale(1.1);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
		z-index: 50;
		transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
	}
	
	.card-image {
		transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
	}
	
	/* Enhanced keyboard focus styles */
	.movie-card:focus {
		outline: none;
	}
	
	.movie-card:focus .card-image {
		outline: 3px solid #dc2626;
		outline-offset: 4px;
	}
	
	.movie-card:hover .card-overlay,
	.movie-card:focus .card-overlay {
		opacity: 1;
	}
	
	.movie-card:hover .card-controls,
	.movie-card:focus .card-controls {
		opacity: 1;
		transform: scale(1);
	}
	
	.movie-card:hover .card-info,
	.movie-card:focus .card-info {
		opacity: 1;
		transform: translateY(0);
	}
	
	.movie-card:hover .card-title,
	.movie-card:focus .card-title {
		opacity: 0;
		transform: translateY(-10px);
	}
	
	.card-controls {
		transform: scale(0.8);
		transition: opacity 0.3s ease-out, transform 0.3s ease-out;
	}
	
	.card-info {
		transform: translateY(10px);
		transition: opacity 0.3s ease-out, transform 0.3s ease-out;
	}
	
	.card-title {
		transition: opacity 0.3s ease-out, transform 0.3s ease-out;
	}
</style>
