const CACHE_NAME = 'stremio-netflix-v1';
const STATIC_CACHE_NAME = 'stremio-static-v1';
const DYNAMIC_CACHE_NAME = 'stremio-dynamic-v1';

// Cache strategies
const CACHE_STRATEGIES = {
	CACHE_FIRST: 'cache-first',
	NETWORK_FIRST: 'network-first',
	NETWORK_ONLY: 'network-only',
	CACHE_ONLY: 'cache-only',
	STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Static assets to cache immediately
const STATIC_ASSETS = ['/', '/favicon.svg', '/app.css'];

// Route patterns and their caching strategies
const ROUTE_STRATEGIES = [
	{ pattern: /\/_app\//, strategy: CACHE_STRATEGIES.CACHE_FIRST, maxAge: 86400000 }, // 1 day
	{ pattern: /\/api\/proxy\//, strategy: CACHE_STRATEGIES.NETWORK_FIRST, maxAge: 300000 }, // 5 minutes
	{
		pattern: /\.(js|css|woff2?|png|jpg|jpeg|webp|svg)$/,
		strategy: CACHE_STRATEGIES.CACHE_FIRST,
		maxAge: 2592000000
	}, // 30 days
	{
		pattern: /\/movies|\/search|\/tv-shows/,
		strategy: CACHE_STRATEGIES.NETWORK_FIRST,
		maxAge: 600000
	} // 10 minutes
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(STATIC_CACHE_NAME)
			.then((cache) => {
				console.log('Caching static assets');
				return cache.addAll(STATIC_ASSETS);
			})
			.then(() => {
				return self.skipWaiting();
			})
	);
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames
						.filter((cacheName) => {
							return (
								!cacheName.startsWith(CACHE_NAME) &&
								cacheName !== STATIC_CACHE_NAME &&
								cacheName !== DYNAMIC_CACHE_NAME
							);
						})
						.map((cacheName) => {
							console.log('Deleting old cache:', cacheName);
							return caches.delete(cacheName);
						})
				);
			})
			.then(() => {
				return self.clients.claim();
			})
	);
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
	const request = event.request;
	const url = new URL(request.url);

	// Skip non-GET requests
	if (request.method !== 'GET') {
		return;
	}

	// Skip chrome-extension and other non-http requests
	if (!url.protocol.startsWith('http')) {
		return;
	}

	// Find matching strategy
	const routeStrategy = ROUTE_STRATEGIES.find((route) =>
		route.pattern.test(url.pathname + url.search)
	);
	const strategy = routeStrategy?.strategy || CACHE_STRATEGIES.NETWORK_FIRST;
	const maxAge = routeStrategy?.maxAge || 300000; // 5 minutes default

	event.respondWith(handleRequest(request, strategy, maxAge));
});

async function handleRequest(request, strategy, maxAge) {
	const cache = await caches.open(DYNAMIC_CACHE_NAME);
	const cachedResponse = await cache.match(request);

	switch (strategy) {
		case CACHE_STRATEGIES.CACHE_FIRST:
			return cachedResponse || fetchAndCache(request, cache, maxAge);

		case CACHE_STRATEGIES.NETWORK_FIRST:
			try {
				return await fetchAndCache(request, cache, maxAge);
			} catch (error) {
				console.log('Network failed, falling back to cache:', error);
				return cachedResponse || new Response('Offline', { status: 503 });
			}

		case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
			// Return cached version immediately if available
			if (cachedResponse) {
				// Update cache in background
				fetchAndCache(request, cache, maxAge).catch(console.error);
				return cachedResponse;
			}
			return fetchAndCache(request, cache, maxAge);

		case CACHE_STRATEGIES.NETWORK_ONLY:
			return fetch(request);

		case CACHE_STRATEGIES.CACHE_ONLY:
			return cachedResponse || new Response('Not cached', { status: 404 });

		default:
			return fetchAndCache(request, cache, maxAge);
	}
}

async function fetchAndCache(request, cache, maxAge) {
	try {
		const response = await fetch(request);

		// Only cache successful responses
		if (response.status === 200) {
			const responseToCache = response.clone();

			// Add timestamp header for cache expiration
			const headers = new Headers(responseToCache.headers);
			headers.append('sw-cached-at', Date.now().toString());
			headers.append('sw-max-age', maxAge.toString());

			const cachedResponse = new Response(responseToCache.body, {
				status: responseToCache.status,
				statusText: responseToCache.statusText,
				headers: headers
			});

			await cache.put(request, cachedResponse);
		}

		return response;
	} catch (error) {
		console.error('Fetch failed:', error);
		throw error;
	}
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
	if (event.tag === 'background-sync') {
		event.waitUntil(doBackgroundSync());
	}
});

async function doBackgroundSync() {
	// Implement background sync logic if needed
	console.log('Background sync triggered');
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
	if (event.data) {
		const data = event.data.json();
		event.waitUntil(
			self.registration.showNotification(data.title, {
				body: data.body,
				icon: '/favicon.svg',
				badge: '/favicon.svg'
			})
		);
	}
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	event.waitUntil(clients.openWindow('/'));
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
	if (event.tag === 'content-sync') {
		event.waitUntil(doPeriodicSync());
	}
});

async function doPeriodicSync() {
	// Sync content updates in the background
	console.log('Periodic sync triggered');
}
