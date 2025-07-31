import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.integration.{test,spec}.{js,ts}'],
		exclude: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*', 'node_modules/**/*'],
		environment: 'jsdom',
		setupFiles: ['src/test/setup.ts'],
		globals: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/**/*.{js,ts,svelte}'],
			exclude: [
				'src/test/**/*',
				'src/**/*.test.{js,ts}',
				'src/**/*.spec.{js,ts}',
				'src/**/*.integration.{test,spec}.{js,ts}',
				'src/app.html',
				'src/hooks.*',
				'src/service-worker.*'
			]
		},
		pool: 'threads',
		poolOptions: {
			threads: {
				singleThread: true
			}
		}
	}
});
