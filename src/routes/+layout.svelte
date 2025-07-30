<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import KeyboardNavigation from '$lib/components/KeyboardNavigation.svelte';

	let { children } = $props();

	onMount(() => {
		// Initialize keyboard navigation
		import('$lib/stores/keyboard');
	});
</script>

<div class="min-h-screen bg-black text-white">
	<Header />
	<KeyboardNavigation />
	<main>
		{@render children()}
	</main>
</div>
