<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { keyboardStore } from '$lib/stores/keyboard';

	let previousFocusedElement: HTMLElement | null = null;

	onMount(() => {
		const unsubscribe = keyboardStore.subscribe((state) => {
			// Remove focus class from previous element
			if (previousFocusedElement) {
				previousFocusedElement.classList.remove('keyboard-focus');
			}

			// Add focus class to current element
			if (state.focusedElement) {
				state.focusedElement.classList.add('keyboard-focus');
				previousFocusedElement = state.focusedElement;
			}
		});

		return unsubscribe;
	});

	onDestroy(() => {
		// Clean up focus class on component destroy
		if (previousFocusedElement) {
			previousFocusedElement.classList.remove('keyboard-focus');
		}
	});
</script>

<!-- This component doesn't render anything visible -->