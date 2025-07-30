export const manifest = (() => {
	function __memo(fn) {
		let value;
		return () => (value ??= value = fn());
	}

	return {
		appDir: '_app',
		appPath: '_app',
		assets: new Set(['favicon.svg']),
		mimeTypes: { '.svg': 'image/svg+xml' },
		_: {
			client: {
				start: '_app/immutable/entry/start.B2wCMQtP.js',
				app: '_app/immutable/entry/app.Dp6g4bpD.js',
				imports: [
					'_app/immutable/entry/start.B2wCMQtP.js',
					'_app/immutable/chunks/LtaYDPJQ.js',
					'_app/immutable/chunks/DDdxbkju.js',
					'_app/immutable/entry/app.Dp6g4bpD.js',
					'_app/immutable/chunks/DDdxbkju.js',
					'_app/immutable/chunks/DsnmJJEf.js',
					'_app/immutable/chunks/pgvFQ5L2.js',
					'_app/immutable/chunks/DPntG8eL.js',
					'_app/immutable/chunks/DWbhy1gE.js',
					'_app/immutable/chunks/XlPvnuBP.js'
				],
				stylesheets: [],
				fonts: [],
				uses_env_dynamic_public: true
			},
			nodes: [
				__memo(() => import('./nodes/0.js')),
				__memo(() => import('./nodes/1.js')),
				__memo(() => import('./nodes/2.js')),
				__memo(() => import('./nodes/3.js')),
				__memo(() => import('./nodes/4.js')),
				__memo(() => import('./nodes/5.js'))
			],
			routes: [
				{
					id: '/',
					pattern: /^\/$/,
					params: [],
					page: { layouts: [0], errors: [1], leaf: 2 },
					endpoint: null
				},
				{
					id: '/search',
					pattern: /^\/search\/?$/,
					params: [],
					page: { layouts: [0], errors: [1], leaf: 3 },
					endpoint: null
				},
				{
					id: '/settings',
					pattern: /^\/settings\/?$/,
					params: [],
					page: { layouts: [0], errors: [1], leaf: 4 },
					endpoint: null
				},
				{
					id: '/watch/[id]',
					pattern: /^\/watch\/([^/]+?)\/?$/,
					params: [{ name: 'id', optional: false, rest: false, chained: false }],
					page: { layouts: [0], errors: [1], leaf: 5 },
					endpoint: null
				}
			],
			prerendered_routes: new Set([]),
			matchers: async () => {
				return {};
			},
			server_assets: {}
		}
	};
})();
