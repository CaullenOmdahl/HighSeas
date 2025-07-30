<script lang="ts">
	import { Search, Settings, User } from 'lucide-svelte';
	import { page } from '$app/stores';
</script>

<header class="fixed top-0 z-50 w-full bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm transition-all duration-300">
	<nav class="flex items-center justify-between px-4 py-4 sm:px-6 md:px-12 md:py-6">
		<div class="flex items-center space-x-4 sm:space-x-6 md:space-x-12">
			<a href="/" class="text-xl sm:text-2xl md:text-3xl font-black text-red-600 tracking-tight">HighSeas</a>
			<div class="hidden space-x-4 sm:space-x-6 md:space-x-8 md:flex">
				<a
					href="/"
					class="font-medium text-white transition-colors hover:text-gray-300"
					class:text-red-500={$page.url.pathname === '/'}
				>
					Home
				</a>
				<a
					href="/movies"
					class="font-medium text-white transition-colors hover:text-gray-300"
					class:text-red-500={$page.url.pathname.startsWith('/movies')}
				>
					Movies
				</a>
				<a
					href="/tv-shows"
					class="font-medium text-white transition-colors hover:text-gray-300"
					class:text-red-500={$page.url.pathname.startsWith('/tv-shows')}
				>
					TV Shows
				</a>
			</div>
		</div>

		<div class="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
			<a href="/search" class="text-white transition-colors hover:text-gray-300 p-2" aria-label="Search content">
				<Search class="h-5 w-5 sm:h-6 sm:w-6" />
			</a>
			<a href="/settings" class="hidden sm:block text-white transition-colors hover:text-gray-300 p-2" aria-label="Settings">
				<Settings class="h-5 w-5 sm:h-6 sm:w-6" />
			</a>
			<div class="h-7 w-7 sm:h-8 sm:w-8 rounded bg-red-600 flex items-center justify-center cursor-pointer transition-colors hover:bg-red-700" role="button" tabindex="0" aria-label="User profile">
				<User class="h-4 w-4 sm:h-5 sm:w-5 text-white" />
			</div>
		</div>
	</nav>
</header>
