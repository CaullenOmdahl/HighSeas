<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		console.error('🚫 Invalid watch URL detected:', $page.url.pathname);
		console.error('🚫 Parameters:', $page.params);
		
		// Redirect to home after a moment
		setTimeout(() => {
			goto('/');
		}, 3000);
	});
</script>

<div class="min-h-screen bg-black text-white flex items-center justify-center">
	<div class="text-center max-w-md">
		<h1 class="text-3xl font-bold mb-4">Invalid Content ID</h1>
		<p class="text-gray-400 mb-6">
			The content you're trying to watch has an invalid ID. This might be due to a corrupted link or addon configuration issue.
		</p>
		<p class="text-sm text-gray-500">
			Redirecting to home page in 3 seconds...
		</p>
		<div class="mt-8 p-4 bg-gray-900 rounded-lg">
			<p class="text-xs font-mono text-gray-400">
				Attempted URL: {$page.url.pathname}
			</p>
		</div>
	</div>
</div>