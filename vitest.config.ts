import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['tests/**/*', 'node_modules/**/*', 'src/**/*.svelte'],
		environment: 'jsdom',
		setupFiles: ['src/test/setup.ts'],
		globals: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/**/*.{js,ts}'],
			exclude: [
				'src/test/**/*',
				'src/**/*.test.{js,ts}',
				'src/**/*.spec.{js,ts}',
				'src/app.html',
				'src/hooks.*',
				'src/service-worker.*'
			],
			thresholds: {
				branches: 70,
				functions: 70,
				lines: 70,
				statements: 70
			}
		},
		pool: 'forks',
		poolOptions: {
			forks: {
				singleFork: true
			}
		}
	},
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib'),
			'$app/environment': path.resolve('./src/test/mocks/app-environment.ts'),
			'$app/stores': path.resolve('./src/test/mocks/app-stores.ts'),
			'$app/navigation': path.resolve('./src/test/mocks/app-navigation.ts')
		}
	}
});
