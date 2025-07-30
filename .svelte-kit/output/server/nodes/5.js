export const index = 5;
let component_cache;
export const component = async () =>
	(component_cache ??= (await import('../entries/pages/watch/_id_/_page.svelte.js')).default);
export const imports = [
	'_app/immutable/nodes/5.CjkY_SNE.js',
	'_app/immutable/chunks/DsnmJJEf.js',
	'_app/immutable/chunks/BYgivT0n.js',
	'_app/immutable/chunks/DDdxbkju.js',
	'_app/immutable/chunks/pgvFQ5L2.js',
	'_app/immutable/chunks/6UcpBOQV.js',
	'_app/immutable/chunks/XlPvnuBP.js',
	'_app/immutable/chunks/C4E9T5AS.js',
	'_app/immutable/chunks/LtaYDPJQ.js',
	'_app/immutable/chunks/DPntG8eL.js',
	'_app/immutable/chunks/Dn2o612i.js'
];
export const stylesheets = [];
export const fonts = [];
