import { beforeAll, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock SvelteKit environment
beforeAll(() => {
	// Mock environment variables
	vi.stubEnv('NODE_ENV', 'test');
	vi.stubEnv('PUBLIC_API_URL', 'http://localhost:3000');
	vi.stubEnv('STREMIO_API_URL', 'http://localhost:11470');
	vi.stubEnv('REAL_DEBRID_API_URL', 'https://api.real-debrid.com');
	vi.stubEnv('TMDB_API_URL', 'https://api.themoviedb.org/3');

	// Mock browser APIs
	Object.defineProperty(window, 'HTMLMediaElement', {
		writable: true,
		value: class MockHTMLMediaElement {
			play = vi.fn().mockResolvedValue(undefined);
			pause = vi.fn();
			load = vi.fn();
			canPlayType = vi.fn().mockReturnValue('probably');
			addEventListener = vi.fn();
			removeEventListener = vi.fn();
			currentTime = 0;
			duration = 100;
			paused = true;
			volume = 1;
			muted = false;
			readyState = 4;
			src = '';
		}
	});

	Object.defineProperty(window, 'IntersectionObserver', {
		writable: true,
		value: vi.fn().mockImplementation(() => ({
			observe: vi.fn(),
			unobserve: vi.fn(),
			disconnect: vi.fn()
		}))
	});

	Object.defineProperty(window, 'ResizeObserver', {
		writable: true,
		value: vi.fn().mockImplementation(() => ({
			observe: vi.fn(),
			unobserve: vi.fn(),
			disconnect: vi.fn()
		}))
	});

	// Mock fetch for API calls
	global.fetch = vi.fn();

	// Mock localStorage
	Object.defineProperty(window, 'localStorage', {
		value: {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn()
		},
		writable: true
	});

	// Mock sessionStorage
	Object.defineProperty(window, 'sessionStorage', {
		value: {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn()
		},
		writable: true
	});

	// Mock window.location
	Object.defineProperty(window, 'location', {
		value: {
			href: 'http://localhost:5173',
			hostname: 'localhost',
			port: '5173',
			protocol: 'http:',
			pathname: '/',
			search: '',
			hash: '',
			assign: vi.fn(),
			replace: vi.fn(),
			reload: vi.fn()
		},
		writable: true
	});

	// Mock console methods
	vi.spyOn(console, 'log').mockImplementation(() => {});
	vi.spyOn(console, 'warn').mockImplementation(() => {});
	vi.spyOn(console, 'error').mockImplementation(() => {});
});

// Mock SvelteKit modules
vi.mock('$app/environment', () => ({
	browser: false,
	dev: true,
	building: false,
	version: '1.0.0'
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidate: vi.fn(),
	invalidateAll: vi.fn(),
	preloadData: vi.fn(),
	preloadCode: vi.fn(),
	beforeNavigate: vi.fn(),
	afterNavigate: vi.fn(),
	pushState: vi.fn(),
	replaceState: vi.fn()
}));

vi.mock('$app/stores', () => ({
	page: {
		subscribe: vi.fn(),
		url: new URL('http://localhost:5173'),
		params: {},
		route: { id: '/' },
		status: 200,
		error: null,
		data: {},
		form: null
	},
	navigating: {
		subscribe: vi.fn()
	},
	updated: {
		subscribe: vi.fn(),
		check: vi.fn()
	}
}));

vi.mock('$lib/config', () => ({
	config: {
		stremio: {
			baseUrl: 'http://localhost:11470',
			timeout: 10000
		},
		realDebrid: {
			baseUrl: 'https://api.real-debrid.com',
			timeout: 15000
		},
		tmdb: {
			baseUrl: 'https://api.themoviedb.org/3',
			timeout: 10000
		},
		server: {
			port: 6969,
			host: '0.0.0.0'
		}
	}
}));

// Export test utilities
export const mockFetch = (response: unknown, ok = true) => {
	const mockFn = global.fetch as ReturnType<typeof vi.fn>;
	mockFn.mockResolvedValueOnce({
		ok,
		status: ok ? 200 : 500,
		json: () => Promise.resolve(response),
		text: () => Promise.resolve(JSON.stringify(response))
	} as Response);
};

export const mockFetchError = (error: Error) => {
	const mockFn = global.fetch as ReturnType<typeof vi.fn>;
	mockFn.mockRejectedValueOnce(error);
};

export const clearAllMocks = () => {
	vi.clearAllMocks();
	vi.clearAllTimers();
};
