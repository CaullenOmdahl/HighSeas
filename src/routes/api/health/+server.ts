import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const health = {
		status: 'healthy',
		timestamp: new Date().toISOString(),
		service: 'HighSeas Streaming',
		version: '1.0.0',
		uptime: process.uptime(),
		memory: {
			used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
			total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100
		}
	};

	return json(health, {
		status: 200,
		headers: {
			'Cache-Control': 'no-cache'
		}
	});
};