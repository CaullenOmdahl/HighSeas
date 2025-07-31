import { vi } from 'vitest';

export const page = {
	subscribe: vi.fn(),
	url: new URL('http://localhost:5173'),
	params: {},
	route: { id: '/' },
	status: 200,
	error: null,
	data: {},
	form: null
};

export const navigating = {
	subscribe: vi.fn()
};

export const updated = {
	subscribe: vi.fn(),
	check: vi.fn()
};
