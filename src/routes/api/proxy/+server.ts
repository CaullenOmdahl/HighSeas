import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const BUFFER_SIZE = 1024 * 1024; // 1MB chunks
const MAX_BUFFER_SIZE = 50 * 1024 * 1024; // 50MB max buffer

export const GET: RequestHandler = async ({ url, request, setHeaders }) => {
	const streamUrl = url.searchParams.get('url');
	const range = request.headers.get('range');

	if (!streamUrl) {
		throw error(400, 'Stream URL is required');
	}

	try {
		// Validate the stream URL is from RealDebrid or allowed sources
		const allowedDomains = [
			'real-debrid.com',
			'torrentio.strem.fun',
			// Add other trusted domains as needed
		];

		const streamDomain = new URL(decodeURIComponent(streamUrl)).hostname;
		const isAllowed = allowedDomains.some(domain => 
			streamDomain.includes(domain) || streamDomain.endsWith(domain)
		);

		if (!isAllowed) {
			throw error(403, 'Stream source not allowed');
		}

		// Prepare headers for the upstream request
		const upstreamHeaders: Record<string, string> = {
			'User-Agent': 'HighSeas/1.0',
			'Accept': '*/*',
			'Accept-Encoding': 'identity', // Disable compression for streaming
		};

		// Forward range header for partial content requests (seeking)
		if (range) {
			upstreamHeaders['Range'] = range;
		}

		console.log(`🎬 Proxying stream: ${streamUrl}`);
		console.log(`📊 Range request: ${range || 'full content'}`);

		// Fetch the stream from the upstream source
		const response = await fetch(decodeURIComponent(streamUrl), {
			headers: upstreamHeaders,
		});

		if (!response.ok) {
			console.error(`❌ Upstream error: ${response.status} ${response.statusText}`);
			throw error(response.status, `Stream source error: ${response.statusText}`);
		}

		// Get content information
		const contentLength = response.headers.get('content-length');
		const contentType = response.headers.get('content-type') || 'video/mp4';
		const acceptRanges = response.headers.get('accept-ranges') || 'bytes';

		// Set response headers for the client
		const responseHeaders: Record<string, string> = {
			'Content-Type': contentType,
			'Accept-Ranges': acceptRanges,
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			'Pragma': 'no-cache',
			'Expires': '0',
			// CORS headers for client access
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
			'Access-Control-Allow-Headers': 'Range, Content-Type',
			'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
		};

		// Handle partial content (range requests)
		if (response.status === 206 && range) {
			responseHeaders['Content-Range'] = response.headers.get('content-range') || '';
			responseHeaders['Content-Length'] = response.headers.get('content-length') || '';
		} else if (contentLength) {
			responseHeaders['Content-Length'] = contentLength;
		}

		// Set headers
		Object.entries(responseHeaders).forEach(([key, value]) => {
			setHeaders({ [key]: value });
		});

		// Return the stream with proper status
		return new Response(response.body, {
			status: response.status,
			headers: responseHeaders,
		});

	} catch (err) {
		console.error('❌ Proxy error:', err);
		
		if (err instanceof Response) {
			throw err;
		}
		
		throw error(500, 'Failed to proxy stream');
	}
};

// Handle preflight requests for CORS
export const OPTIONS: RequestHandler = async ({ setHeaders }) => {
	setHeaders({
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
		'Access-Control-Allow-Headers': 'Range, Content-Type',
		'Access-Control-Max-Age': '86400',
	});

	return new Response(null, { status: 204 });
};