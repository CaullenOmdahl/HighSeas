export interface ProxiedStream {
	originalUrl: string;
	proxyUrl: string;
	title?: string;
	description?: string;
}

export class StreamProxyService {
	private baseUrl: string;

	constructor() {
		// Get the current origin for API calls
		this.baseUrl = typeof window !== 'undefined' 
			? window.location.origin 
			: 'http://localhost:5173'; // Default for SSR
	}

	/**
	 * Create a proxied stream URL that routes through our server
	 */
	createProxyUrl(originalUrl: string): string {
		const proxyUrl = new URL('/api/proxy', this.baseUrl);
		proxyUrl.searchParams.set('url', originalUrl);
		
		console.log(`🔄 Creating proxy URL:`);
		console.log(`   Original: ${originalUrl}`);
		console.log(`   Proxied:  ${proxyUrl.toString()}`);
		
		return proxyUrl.toString();
	}

	/**
	 * Convert Stremio stream to proxied stream
	 */
	proxyStream(stream: any): ProxiedStream {
		return {
			originalUrl: stream.url,
			proxyUrl: this.createProxyUrl(stream.url),
			title: stream.title || stream.name,
			description: stream.description
		};
	}

	/**
	 * Convert array of Stremio streams to proxied streams
	 */
	proxyStreams(streams: any[]): ProxiedStream[] {
		return streams.map(stream => this.proxyStream(stream));
	}

	/**
	 * Test if a stream URL should be proxied
	 */
	shouldProxy(url: string): boolean {
		try {
			const urlObj = new URL(url);
			
			// Proxy RealDebrid and other premium services
			const proxyDomains = [
				'real-debrid.com',
				// Add other premium service domains that need IP masking
			];

			return proxyDomains.some(domain => 
				urlObj.hostname.includes(domain) || urlObj.hostname.endsWith(domain)
			);
		} catch {
			return false;
		}
	}

	/**
	 * Get stream with optional proxying
	 */
	processStreamUrl(originalUrl: string, forceProxy: boolean = true): string {
		if (forceProxy || this.shouldProxy(originalUrl)) {
			return this.createProxyUrl(originalUrl);
		}
		return originalUrl;
	}
}

// Global service instance
export const streamProxyService = new StreamProxyService();