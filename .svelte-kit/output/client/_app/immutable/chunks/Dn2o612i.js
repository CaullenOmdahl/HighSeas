const t = globalThis.__sveltekit_1wmefjp.env,
	o = {
		defaultAddons: (t.PUBLIC_DEFAULT_ADDONS || '')
			.split(',')
			.filter(Boolean)
			.map((e) => e.trim())
	};
export { o as c };
