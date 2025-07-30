<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import videojs from 'video.js';
	import type Player from 'video.js/dist/types/player';

	interface Props {
		src: string;
		poster?: string;
		title?: string;
	}

	let { src, poster, title }: Props = $props();
	let videoElement: HTMLVideoElement;
	let player: Player;

	onMount(async () => {
		if (videoElement) {
			player = videojs(videoElement, {
				controls: true,
				responsive: true,
				fluid: true,
				playbackRates: [0.5, 1, 1.25, 1.5, 2],
				poster: poster,
				sources: [
					{
						src: src,
						type: getVideoType(src)
					}
				]
			});

			player.ready(() => {
				console.log('Player is ready');
			});
		}
	});

	onDestroy(() => {
		if (player) {
			player.dispose();
		}
	});

	function getVideoType(url: string): string {
		if (url.includes('.m3u8')) return 'application/x-mpegURL';
		if (url.includes('.mpd')) return 'application/dash+xml';
		if (url.includes('.mp4')) return 'video/mp4';
		if (url.includes('.webm')) return 'video/webm';
		return 'video/mp4';
	}
</script>

<div class="relative w-full bg-black">
	<video
		bind:this={videoElement}
		class="video-js vjs-default-skin w-full"
		data-setup=""
		preload="auto"
		width="100%"
		height="auto"
	>
		<track kind="captions" />
		<p class="vjs-no-js p-4 text-white">
			To view this video please enable JavaScript, and consider upgrading to a web browser that
			<a href="https://videojs.com/html5-video-support/" target="_blank" class="text-blue-400">
				supports HTML5 video
			</a>.
		</p>
	</video>
</div>
