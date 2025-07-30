import '../chunks/DsnmJJEf.js';
import { i as U } from '../chunks/BYgivT0n.js';
import {
	d as V,
	p as W,
	o as X,
	f as h,
	h as Y,
	c as s,
	s as y,
	t as M,
	g as t,
	a as l,
	b as Z,
	e as f,
	m as b,
	$ as ee,
	r,
	i as E,
	j,
	n as te,
	k as F
} from '../chunks/DDdxbkju.js';
import { i as q } from '../chunks/pgvFQ5L2.js';
import { r as re, e as ae } from '../chunks/6UcpBOQV.js';
import { b as se } from '../chunks/EbTttirx.js';
import { M as ie } from '../chunks/CXVpiO8V.js';
import '../chunks/Dn2o612i.js';
import { S as oe } from '../chunks/BG9RvbYR.js';
function le(w, S) {
	w.key === 'Enter' && S();
}
var de = h(
		'<div class="flex items-center justify-center py-20"><div class="text-white text-xl">Searching...</div></div>'
	),
	ce = h(
		'<div class="text-center py-20"><div class="text-gray-400 text-lg mb-4">Start typing to search for movies and series</div> <div class="text-gray-500 text-sm">Search across all enabled Stremio addons</div></div>'
	),
	ne = h(
		'<div class="text-center py-20"><div class="text-gray-400 text-lg mb-4"> </div> <div class="text-gray-500 text-sm">Try searching with different keywords</div></div>'
	),
	ve = h(
		'<div class="mb-6"><h2 class="text-xl text-white"> </h2></div> <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"></div>',
		1
	),
	me = h(
		'<div class="pt-20 px-6"><div class="max-w-6xl mx-auto"><div class="mb-8"><h1 class="text-3xl font-bold text-white mb-6">Search</h1> <div class="relative max-w-2xl"><input type="search" placeholder="Search for movies, series..." class="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"/> <button class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"><!></button></div></div> <!></div></div>'
	);
function we(w, S) {
	W(S, !1);
	let i = b(''),
		d = b([]),
		u = b(!1),
		A = b(!1);
	async function C() {
		if (t(i).trim()) {
			(f(u, !0), f(A, !0));
			try {
				const e = Array.from({ length: 12 }, (o, a) => ({
					id: `search_result_${a}`,
					type: a % 2 === 0 ? 'movie' : 'series',
					name: `${t(i)} Result ${a + 1}`,
					description: `Search result for "${t(i)}". This is item number ${a + 1}.`,
					poster: `https://picsum.photos/300/450?random=${t(i).length + a}`,
					year: 2015 + (a % 10),
					genre: [['Action', 'Drama', 'Comedy', 'Sci-Fi', 'Thriller'][a % 5]]
				}));
				(await new Promise((o) => setTimeout(o, 500)), f(d, e));
			} catch (e) {
				(console.error('Search failed:', e), f(d, []));
			} finally {
				f(u, !1);
			}
		}
	}
	(X(() => {
		const e = document.querySelector('input[type="search"]');
		e && e.focus();
	}),
		U());
	var k = me();
	Y((e) => {
		ee.title = 'Search - Stremio';
	});
	var R = s(k),
		$ = s(R),
		z = y(s($), 2),
		p = s(z);
	(re(p), (p.__keydown = [le, C]));
	var g = y(p, 2);
	g.__click = C;
	var K = s(g);
	(oe(K, { class: 'w-5 h-5' }), r(g), r(z), r($));
	var N = y($, 2);
	{
		var P = (e) => {
				var o = de();
				l(e, o);
			},
			B = (e) => {
				var o = E(),
					a = j(o);
				{
					var G = (c) => {
							var _ = ce();
							l(c, _);
						},
						H = (c) => {
							var _ = E(),
								I = j(_);
							{
								var J = (n) => {
										var v = ne(),
											m = s(v),
											x = s(m);
										(r(m),
											te(2),
											r(v),
											M(() => F(x, `No results found for "${t(i) ?? ''}"`)),
											l(n, v));
									},
									L = (n) => {
										var v = ve(),
											m = j(v),
											x = s(m),
											O = s(x);
										(r(x), r(m));
										var D = y(m, 2);
										(ae(
											D,
											5,
											() => t(d),
											(T) => T.id,
											(T, Q) => {
												ie(T, {
													get item() {
														return t(Q);
													},
													size: 'medium'
												});
											}
										),
											r(D),
											M(() =>
												F(
													O,
													`${t(d).length ?? ''} result${t(d).length !== 1 ? 's' : ''} for "${t(i) ?? ''}"`
												)
											),
											l(n, v));
									};
								q(
									I,
									(n) => {
										t(d).length === 0 ? n(J) : n(L, !1);
									},
									!0
								);
							}
							l(c, _);
						};
					q(
						a,
						(c) => {
							t(A) ? c(H, !1) : c(G);
						},
						!0
					);
				}
				l(e, o);
			};
		q(N, (e) => {
			t(u) ? e(P) : e(B, !1);
		});
	}
	(r(R),
		r(k),
		M(() => (g.disabled = t(u))),
		se(
			p,
			() => t(i),
			(e) => f(i, e)
		),
		l(w, k),
		Z());
}
V(['keydown', 'click']);
export { we as component };
