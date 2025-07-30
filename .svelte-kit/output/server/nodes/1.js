export const index = 1;
let component_cache;
export const component = async () =>
	(component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default);
export const imports = [
	'_app/immutable/nodes/1.Ddp7L-fp.js',
	'_app/immutable/chunks/DsnmJJEf.js',
	'_app/immutable/chunks/BYgivT0n.js',
	'_app/immutable/chunks/DDdxbkju.js',
	'_app/immutable/chunks/LtaYDPJQ.js'
];
export const stylesheets = [];
export const fonts = [];
