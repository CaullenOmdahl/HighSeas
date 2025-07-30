<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import MovieCard from './MovieCard.svelte';

	interface Props {
		title: string;
		items: Array<{
			id: string;
			name: string;
			poster?: string;
			description?: string;
			type: string;
		}>;
	}

	let { title, items }: Props = $props();
	let scrollContainer: HTMLElement;

	function scrollLeft() {
		scrollContainer.scrollBy({ left: -400, behavior: 'smooth' });
	}

	function scrollRight() {
		scrollContainer.scrollBy({ left: 400, behavior: 'smooth' });
	}
</script>

<section class="mb-6 sm:mb-8" data-movie-row>
	<h2 class="mb-3 px-4 text-lg font-semibold text-white sm:mb-4 sm:px-6 sm:text-xl">{title}</h2>

	<div class="group relative">
		<!-- Left scroll button -->
		<button
			onclick={scrollLeft}
			class="absolute top-1/2 left-2 z-[60] -translate-y-1/2 rounded-full bg-black/70 p-2 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/90"
			aria-label="Scroll left in {title}"
			data-pagination
		>
			<ChevronLeft class="h-6 w-6 text-white" />
		</button>

		<!-- Right scroll button -->
		<button
			onclick={scrollRight}
			class="absolute top-1/2 right-2 z-[60] -translate-y-1/2 rounded-full bg-black/70 p-2 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/90"
			aria-label="Scroll right in {title}"
			data-pagination
		>
			<ChevronRight class="h-6 w-6 text-white" />
		</button>

		<!-- Scrollable container -->
		<div
			bind:this={scrollContainer}
			class="scrollbar-hide flex space-x-2 overflow-x-auto px-4 pb-6 sm:space-x-3 sm:px-6 sm:pb-8"
			style="scroll-snap-type: x mandatory;"
		>
			{#each items as item (item.id)}
				<div class="flex-shrink-0" style="scroll-snap-align: start;">
					<MovieCard {item} size="medium" />
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>
