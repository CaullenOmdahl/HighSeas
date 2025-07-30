export const index = 4;
let component_cache;
export const component = async () =>
	(component_cache ??= (await import('../entries/pages/settings/_page.svelte.js')).default);
export const imports = [
	'_app/immutable/nodes/4.BRa508i4.js',
	'_app/immutable/chunks/DsnmJJEf.js',
	'_app/immutable/chunks/BYgivT0n.js',
	'_app/immutable/chunks/DDdxbkju.js',
	'_app/immutable/chunks/pgvFQ5L2.js',
	'_app/immutable/chunks/6UcpBOQV.js',
	'_app/immutable/chunks/EbTttirx.js',
	'_app/immutable/chunks/Dn2o612i.js',
	'_app/immutable/chunks/DsjntQP_.js',
	'_app/immutable/chunks/DWbhy1gE.js',
	'_app/immutable/chunks/XlPvnuBP.js'
];
export const stylesheets = [];
export const fonts = [];
