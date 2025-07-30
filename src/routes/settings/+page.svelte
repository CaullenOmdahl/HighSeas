<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Trash2, ExternalLink } from 'lucide-svelte';
	import { stremioService } from '$lib/services/stremio';
	import type { StremioAddon } from '$lib/services/stremio';

	let addons: StremioAddon[] = [];
	let newAddonUrl = '';
	let loading = false;
	let error = '';

	onMount(() => {
		loadAddons();
	});

	function loadAddons() {
		addons = stremioService.getAddons();
	}

	async function addAddon() {
		if (!newAddonUrl.trim()) return;

		loading = true;
		error = '';

		try {
			// Ensure URL ends with manifest.json
			let manifestUrl = newAddonUrl.trim();
			if (!manifestUrl.endsWith('/manifest.json')) {
				if (!manifestUrl.endsWith('/')) {
					manifestUrl += '/';
				}
				manifestUrl += 'manifest.json';
			}

			await stremioService.addAddon(manifestUrl);
			loadAddons();
			newAddonUrl = '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to add addon';
		} finally {
			loading = false;
		}
	}

	function removeAddon(index: number) {
		// In a real implementation, you'd have a removeAddon method in the service
		// For now, we'll just remove from the local array
		addons = addons.filter((_, i) => i !== index);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			addAddon();
		}
	}
</script>

<svelte:head>
	<title>Settings - Stremio</title>
</svelte:head>

<div class="px-6 pt-20">
	<div class="mx-auto max-w-4xl">
		<h1 class="mb-8 text-3xl font-bold text-white">Settings</h1>

		<!-- Add Addon Section -->
		<section class="mb-8 rounded-lg bg-gray-800 p-6">
			<h2 class="mb-4 text-xl font-semibold text-white">Add Stremio Addon</h2>

			<div class="space-y-4">
				<div>
					<label for="addon-url" class="mb-2 block text-sm font-medium text-gray-300">
						Addon URL
					</label>
					<div class="flex space-x-3">
						<input
							id="addon-url"
							type="url"
							bind:value={newAddonUrl}
							onkeydown={handleKeydown}
							placeholder="https://example.com/addon"
							class="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
						/>
						<button
							onclick={addAddon}
							disabled={loading || !newAddonUrl.trim()}
							class="flex items-center space-x-2 rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-600"
						>
							<Plus class="h-4 w-4" />
							<span>{loading ? 'Adding...' : 'Add'}</span>
						</button>
					</div>
					{#if error}
						<p class="mt-2 text-sm text-red-400">{error}</p>
					{/if}
				</div>

				<div class="text-sm text-gray-400">
					<p class="mb-2">Enter the base URL of a Stremio addon. Examples:</p>
					<ul class="ml-4 list-inside list-disc space-y-1">
						<li>https://addon-example.com</li>
						<li>https://my-addon.herokuapp.com</li>
					</ul>
				</div>
			</div>
		</section>

		<!-- Installed Addons -->
		<section class="rounded-lg bg-gray-800 p-6">
			<h2 class="mb-4 text-xl font-semibold text-white">
				Installed Addons ({addons.length})
			</h2>

			{#if addons.length === 0}
				<div class="py-8 text-center">
					<div class="mb-2 text-gray-400">No addons installed</div>
					<div class="text-sm text-gray-500">Add your first addon above to get started</div>
				</div>
			{:else}
				<div class="space-y-4">
					{#each addons as addon, index (addon.manifest.id)}
						<div class="rounded-lg border border-gray-700 p-4">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<div class="mb-2 flex items-center space-x-3">
										<h3 class="text-lg font-medium text-white">{addon.manifest.name}</h3>
										<span class="rounded bg-gray-700 px-2 py-1 text-xs text-gray-400">
											v{addon.manifest.version}
										</span>
									</div>

									<p class="mb-3 text-sm text-gray-300">{addon.manifest.description}</p>

									<div class="mb-3 flex flex-wrap gap-2">
										<div class="text-xs">
											<span class="text-gray-400">Types:</span>
											<span class="ml-1 text-white">{addon.manifest.types.join(', ')}</span>
										</div>
										<div class="text-xs">
											<span class="text-gray-400">Resources:</span>
											<span class="ml-1 text-white">{addon.manifest.resources.join(', ')}</span>
										</div>
									</div>

									{#if addon.manifest.catalogs && addon.manifest.catalogs.length > 0}
										<div class="mb-2 text-xs">
											<span class="text-gray-400">Catalogs:</span>
											<span class="ml-1 text-white">
												{addon.manifest.catalogs.map((c) => c.name).join(', ')}
											</span>
										</div>
									{/if}

									<div class="flex items-center space-x-4 text-xs text-gray-400">
										<a
											href={addon.baseUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="flex items-center space-x-1 transition-colors hover:text-white"
										>
											<ExternalLink class="h-3 w-3" />
											<span>View Addon</span>
										</a>
									</div>
								</div>

								<button
									onclick={() => removeAddon(index)}
									class="p-2 text-gray-400 transition-colors hover:text-red-400"
									title="Remove addon"
								>
									<Trash2 class="h-4 w-4" />
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Instructions -->
		<section class="mt-8 text-sm text-gray-400">
			<h3 class="mb-2 font-medium text-white">How to use Stremio Addons</h3>
			<ul class="ml-4 list-inside list-disc space-y-1">
				<li>Find Stremio addons from the official community or create your own</li>
				<li>Each addon provides different types of content (movies, series, etc.)</li>
				<li>Addons must implement the Stremio addon protocol</li>
				<li>Content availability depends on the addon's implementation</li>
			</ul>
		</section>
	</div>
</div>
