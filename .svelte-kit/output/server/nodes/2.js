export const index = 2;
let component_cache;
export const component = async () =>
	(component_cache ??= (await import('../entries/pages/_page.svelte.js')).default);
export const imports = [
	'_app/immutable/nodes/2.BfIqgrcY.js',
	'_app/immutable/chunks/DsnmJJEf.js',
	'_app/immutable/chunks/BYgivT0n.js',
	'_app/immutable/chunks/DDdxbkju.js',
	'_app/immutable/chunks/pgvFQ5L2.js',
	'_app/immutable/chunks/6UcpBOQV.js',
	'_app/immutable/chunks/DPntG8eL.js',
	'_app/immutable/chunks/CXVpiO8V.js',
	'_app/immutable/chunks/DWbhy1gE.js',
	'_app/immutable/chunks/XlPvnuBP.js',
	'_app/immutable/chunks/DsjntQP_.js',
	'_app/immutable/chunks/Dn2o612i.js'
];
export const stylesheets = [];
export const fonts = [];
