<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { streamProxyService } from '$lib/services/streamProxy';

	interface Props {
		src: string;
		poster?: string;
		title?: string;
	}

	let { src, poster, title }: Props = $props();
	let videoElement: HTMLVideoElement;
	let player: any;
	let bufferProgress = $state(0);
	let loadProgress = $state(0);
	let isBuffering = $state(true);
	let bufferHealth = $state(0);

	// Process the stream URL through our proxy
	const proxiedSrc = $derived(streamProxyService.processStreamUrl(src, true));

	let bufferMonitorInterval: ReturnType<typeof setInterval>;

	onMount(async () => {
		if (videoElement) {
			console.log(`🎬 Initializing buffering player for: ${title}`);
			console.log(`🔄 Using proxied URL: ${proxiedSrc}`);

			// Initialize video element
			videoElement.src = proxiedSrc;
			videoElement.preload = 'auto';

			// Set up buffering monitoring
			setupBufferMonitoring();

			// Video event listeners
			videoElement.addEventListener('loadstart', handleLoadStart);
			videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
			videoElement.addEventListener('loadeddata', handleLoadedData);
			videoElement.addEventListener('canplay', handleCanPlay);
			videoElement.addEventListener('canplaythrough', handleCanPlayThrough);
			videoElement.addEventListener('progress', handleProgress);
			videoElement.addEventListener('waiting', handleWaiting);
			videoElement.addEventListener('playing', handlePlaying);
			videoElement.addEventListener('timeupdate', handleTimeUpdate);
			videoElement.addEventListener('error', handleError);

			// Start loading
			videoElement.load();
		}
	});

	onDestroy(() => {
		if (bufferMonitorInterval) {
			clearInterval(bufferMonitorInterval);
		}
		
		// Clean up event listeners
		if (videoElement) {
			videoElement.removeEventListener('loadstart', handleLoadStart);
			videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
			videoElement.removeEventListener('loadeddata', handleLoadedData);
			videoElement.removeEventListener('canplay', handleCanPlay);
			videoElement.removeEventListener('canplaythrough', handleCanPlayThrough);
			videoElement.removeEventListener('progress', handleProgress);
			videoElement.removeEventListener('waiting', handleWaiting);
			videoElement.removeEventListener('playing', handlePlaying);
			videoElement.removeEventListener('timeupdate', handleTimeUpdate);
			videoElement.removeEventListener('error', handleError);
		}
	});

	function setupBufferMonitoring() {
		bufferMonitorInterval = setInterval(() => {
			if (videoElement && videoElement.buffered.length > 0) {
				const currentTime = videoElement.currentTime;
				const duration = videoElement.duration;
				
				// Calculate buffer progress
				let bufferedEnd = 0;
				for (let i = 0; i < videoElement.buffered.length; i++) {
					if (currentTime >= videoElement.buffered.start(i) && currentTime <= videoElement.buffered.end(i)) {
						bufferedEnd = videoElement.buffered.end(i);
						break;
					}
				}
				
				bufferProgress = duration > 0 ? (bufferedEnd / duration) * 100 : 0;
				
				// Calculate buffer health (how much is buffered ahead)
				const bufferAhead = bufferedEnd - currentTime;
				bufferHealth = Math.min(bufferAhead / 30, 1) * 100; // 30 seconds = 100% health
				
				// Update buffering state
				isBuffering = videoElement.readyState < 3 || bufferHealth < 10;
			}
		}, 1000);
	}

	function handleLoadStart() {
		console.log('📺 Load started');
		loadProgress = 0;
		isBuffering = true;
	}

	function handleLoadedMetadata() {
		console.log('📺 Metadata loaded');
		loadProgress = 25;
	}

	function handleLoadedData() {
		console.log('📺 Data loaded');
		loadProgress = 50;
	}

	function handleCanPlay() {
		console.log('📺 Can play');
		loadProgress = 75;
		isBuffering = false;
	}

	function handleCanPlayThrough() {
		console.log('📺 Can play through');
		loadProgress = 100;
		isBuffering = false;
	}

	function handleProgress() {
		// This handles download progress, not playback progress
		if (videoElement.buffered.length > 0) {
			const buffered = videoElement.buffered.end(videoElement.buffered.length - 1);
			const duration = videoElement.duration;
			if (duration > 0) {
				loadProgress = Math.min((buffered / duration) * 100, 100);
			}
		}
	}

	function handleWaiting() {
		console.log('📺 Buffering...');
		isBuffering = true;
	}

	function handlePlaying() {
		console.log('📺 Playing');
		isBuffering = false;
	}

	function handleTimeUpdate() {
		// Buffer monitoring is handled by the interval
	}

	function handleError(event: Event) {
		console.error('📺 Video error:', event);
		const error = videoElement.error;
		if (error) {
			console.error(`Error code: ${error.code}, message: ${error.message}`);
		}
	}
</script>

<div class="relative w-full bg-black">
	{#if isBuffering && loadProgress < 100}
		<div class="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
			<div class="text-center">
				<div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
				<div class="text-white text-lg mb-2">
					{loadProgress < 25 ? 'Connecting...' : 
					 loadProgress < 50 ? 'Loading metadata...' : 
					 loadProgress < 75 ? 'Buffering...' : 
					 'Almost ready...'}
				</div>
				<div class="w-64 bg-gray-700 rounded-full h-2 mb-2">
					<div 
						class="bg-red-600 h-2 rounded-full transition-all duration-300" 
						style="width: {loadProgress}%"
					></div>
				</div>
				<div class="text-sm text-gray-400">{Math.round(loadProgress)}% loaded</div>
			</div>
		</div>
	{/if}

	<video
		bind:this={videoElement}
		class="w-full h-auto"
		controls
		{poster}
		preload="auto"
		crossorigin="anonymous"
	>
		<track kind="captions" />
		<p class="p-4 text-white">
			Your browser doesn't support HTML5 video. 
			<a href={proxiedSrc} class="text-red-500 hover:text-red-400">
				Download the video file
			</a>.
		</p>
	</video>

	<!-- Buffer indicator -->
	{#if !isBuffering && bufferHealth < 50}
		<div class="absolute bottom-16 left-4 right-4 z-10">
			<div class="bg-black/70 rounded px-3 py-2 text-sm text-white">
				<div class="flex items-center space-x-2">
					<div class="flex-shrink-0">
						<div class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
					</div>
					<span>Buffer: {Math.round(bufferHealth)}%</span>
					<div class="flex-1 bg-gray-600 rounded-full h-1">
						<div 
							class="bg-yellow-500 h-1 rounded-full transition-all duration-300" 
							style="width: {bufferHealth}%"
						></div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	video::-webkit-media-controls {
		background-color: rgba(0, 0, 0, 0.8);
	}
	
	video::-webkit-media-controls-panel {
		background-color: rgba(0, 0, 0, 0.8);
	}
</style>