<script lang="ts">
	import { onMount } from 'svelte';
	import { stremioService } from '$lib/services/stremio';

	let testResults = $state<string[]>([]);
	let loading = $state(false);

	const testMovies = [
		{ id: 'tt0111161', name: 'The Shawshank Redemption' },
		{ id: 'tt0068646', name: 'The Godfather' },
		{ id: 'tt0468569', name: 'The Dark Knight' },
		{ id: 'tt0109830', name: 'Forrest Gump' }
	];

	async function runStreamTests() {
		loading = true;
		testResults = [];
		
		try {
			await stremioService.initialize();
			testResults.push(`✅ Stremio service initialized with ${stremioService.getAddons().length} addons`);
			
			// List all addons
			stremioService.getAddons().forEach((addon, i) => {
				testResults.push(`📱 Addon ${i + 1}: ${addon.manifest.name}`);
				testResults.push(`   - Resources: ${addon.manifest.resources.join(', ')}`);
				testResults.push(`   - Base URL: ${addon.baseUrl}`);
			});
			
			for (const movie of testMovies) {
				testResults.push(`\n🎬 Testing: ${movie.name} (${movie.id})`);
				
				try {
					const streams = await stremioService.getStreams('movie', movie.id);
					testResults.push(`   ✅ Found ${streams.length} streams`);
					
					if (streams.length > 0) {
						testResults.push(`   📺 First stream: ${streams[0].title || streams[0].name}`);
						testResults.push(`   🔗 URL: ${streams[0].url.substring(0, 100)}...`);
					}
				} catch (error) {
					testResults.push(`   ❌ Error: ${error}`);
				}
			}
		} catch (error) {
			testResults.push(`❌ Failed to initialize: ${error}`);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Debug - Stream Testing</title>
</svelte:head>

<div class="min-h-screen bg-black text-white p-8">
	<div class="max-w-4xl mx-auto">
		<h1 class="text-3xl font-bold mb-8">Stream Testing Debug Page</h1>
		
		<div class="mb-8">
			<button
				onclick={runStreamTests}
				disabled={loading}
				class="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-6 py-3 rounded font-medium transition-colors"
			>
				{loading ? 'Testing...' : 'Run Stream Tests'}
			</button>
		</div>

		{#if testResults.length > 0}
			<div class="bg-gray-900 rounded-lg p-6">
				<h2 class="text-xl font-semibold mb-4">Test Results:</h2>
				<div class="font-mono text-sm space-y-1">
					{#each testResults as result}
						<div class="whitespace-pre-wrap">{result}</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>