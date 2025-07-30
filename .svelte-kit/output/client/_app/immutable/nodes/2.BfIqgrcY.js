import '../chunks/DsnmJJEf.js';
import { i as P } from '../chunks/BYgivT0n.js';
import {
	i as C,
	j as A,
	a as f,
	d as j,
	f as y,
	c as v,
	r as l,
	s as b,
	g as n,
	t as I,
	k as T,
	p as B,
	o as L,
	b as q,
	e as k,
	m as w,
	G as M
} from '../chunks/DDdxbkju.js';
import { i as E } from '../chunks/pgvFQ5L2.js';
import { e as G } from '../chunks/6UcpBOQV.js';
import { b as H } from '../chunks/DPntG8eL.js';
import { M as J } from '../chunks/CXVpiO8V.js';
import { I as S, s as R } from '../chunks/DsjntQP_.js';
import { l as D, s as F } from '../chunks/DWbhy1gE.js';
import '../chunks/Dn2o612i.js';
function K(m, s) {
	const o = D(s, ['children', '$$slots', '$$events', '$$legacy']);
	/**
	 * @license lucide-svelte v0.534.0 - ISC
	 *
	 * ISC License
	 *
	 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
	 *
	 * Permission to use, copy, modify, and/or distribute this software for any
	 * purpose with or without fee is hereby granted, provided that the above
	 * copyright notice and this permission notice appear in all copies.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
	 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
	 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
	 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
	 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
	 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
	 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
	 *
	 */ const a = [['path', { d: 'm9 18 6-6-6-6' }]];
	S(
		m,
		F({ name: 'chevron-right' }, () => o, {
			get iconNode() {
				return a;
			},
			children: (c, p) => {
				var t = C(),
					u = A(t);
				(R(u, s, 'default', {}), f(c, t));
			},
			$$slots: { default: !0 }
		})
	);
}
function O(m, s) {
	const o = D(s, ['children', '$$slots', '$$events', '$$legacy']);
	/**
	 * @license lucide-svelte v0.534.0 - ISC
	 *
	 * ISC License
	 *
	 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
	 *
	 * Permission to use, copy, modify, and/or distribute this software for any
	 * purpose with or without fee is hereby granted, provided that the above
	 * copyright notice and this permission notice appear in all copies.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
	 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
	 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
	 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
	 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
	 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
	 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
	 *
	 */ const a = [['path', { d: 'm15 18-6-6 6-6' }]];
	S(
		m,
		F({ name: 'chevron-left' }, () => o, {
			get iconNode() {
				return a;
			},
			children: (c, p) => {
				var t = C(),
					u = A(t);
				(R(u, s, 'default', {}), f(c, t));
			},
			$$slots: { default: !0 }
		})
	);
}
var Q = y('<div class="flex-shrink-0" style="scroll-snap-align: start;"><!></div>'),
	U = y(
		'<section class="mb-8"><h2 class="text-xl font-semibold text-white mb-4 px-6"> </h2> <div class="relative group"><button class="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"><!></button> <button class="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"><!></button> <div class="flex space-x-4 overflow-x-auto scrollbar-hide px-6 pb-4 svelte-12vxkih" style="scroll-snap-type: x mandatory;"></div></div></section>'
	);
function z(m, s) {
	let o;
	function a() {
		o.scrollBy({ left: -400, behavior: 'smooth' });
	}
	function c() {
		o.scrollBy({ left: 400, behavior: 'smooth' });
	}
	var p = U(),
		t = v(p),
		u = v(t, !0);
	l(t);
	var x = b(t, 2),
		h = v(x);
	h.__click = a;
	var r = v(h);
	(O(r, { class: 'w-6 h-6 text-white' }), l(h));
	var e = b(h, 2);
	e.__click = c;
	var _ = v(e);
	(K(_, { class: 'w-6 h-6 text-white' }), l(e));
	var g = b(e, 2);
	(G(
		g,
		21,
		() => s.items,
		(d) => d.id,
		(d, $) => {
			var i = Q(),
				N = v(i);
			(J(N, {
				get item() {
					return n($);
				}
			}),
				l(i),
				f(d, i));
		}
	),
		l(g),
		H(
			g,
			(d) => (o = d),
			() => o
		),
		l(x),
		l(p),
		I(() => T(u, s.title)),
		f(m, p));
}
j(['click']);
var V = y(
		'<div class="flex items-center justify-center min-h-screen"><div class="text-white text-xl">Loading content...</div></div>'
	),
	W = y(
		`<section class="relative h-screen flex items-center bg-gradient-to-r from-black/80 to-transparent"><div class="absolute inset-0 bg-cover bg-center" style="background-image: url('https://picsum.photos/1920/1080?random=hero');"></div> <div class="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div> <div class="relative z-10 px-6 max-w-2xl"><h1 class="text-5xl md:text-7xl font-bold text-white mb-4">Featured Content</h1> <p class="text-xl text-gray-300 mb-8 leading-relaxed">Discover amazing movies and series from various Stremio addons. 
					Experience entertainment like never before.</p> <div class="flex space-x-4"><button class="bg-white text-black px-8 py-3 rounded font-semibold hover:bg-gray-200 transition-colors">▶ Play</button> <button class="bg-gray-600/50 text-white px-8 py-3 rounded font-semibold hover:bg-gray-600/70 transition-colors">More Info</button></div></div></section> <div class="relative z-10 -mt-32"><!> <!> <!></div>`,
		1
	),
	X = y('<div class="pt-16"><!></div>');
function le(m, s) {
	B(s, !1);
	let o = w([]),
		a = w([]),
		c = w(!0);
	L(async () => {
		try {
			await p();
		} catch (r) {
			console.error('Failed to load content:', r);
		} finally {
			k(c, !1);
		}
	});
	async function p() {
		(k(
			o,
			Array.from({ length: 20 }, (r, e) => ({
				id: `movie_${e}`,
				type: 'movie',
				name: `Movie ${e + 1}`,
				description: `This is a description for Movie ${e + 1}. A thrilling adventure awaits.`,
				poster: `https://picsum.photos/300/450?random=${e}`,
				year: 2020 + (e % 5),
				genre: ['Action', 'Drama', 'Comedy'][e % 3]
					? [['Action', 'Drama', 'Comedy'][e % 3]]
					: void 0
			}))
		),
			k(
				a,
				Array.from({ length: 20 }, (r, e) => ({
					id: `series_${e}`,
					type: 'series',
					name: `Series ${e + 1}`,
					description: `This is a description for Series ${e + 1}. An epic journey through multiple seasons.`,
					poster: `https://picsum.photos/300/450?random=${e + 100}`,
					year: 2018 + (e % 7),
					genre: ['Sci-Fi', 'Mystery', 'Romance'][e % 3]
						? [['Sci-Fi', 'Mystery', 'Romance'][e % 3]]
						: void 0
				}))
			));
	}
	P();
	var t = X(),
		u = v(t);
	{
		var x = (r) => {
				var e = V();
				f(r, e);
			},
			h = (r) => {
				var e = W(),
					_ = b(A(e), 2),
					g = v(_);
				{
					let i = M(() => n(o).slice(0, 10));
					z(g, {
						title: 'Popular Movies',
						get items() {
							return n(i);
						}
					});
				}
				var d = b(g, 2);
				{
					let i = M(() => n(a).slice(0, 10));
					z(d, {
						title: 'Trending Series',
						get items() {
							return n(i);
						}
					});
				}
				var $ = b(d, 2);
				{
					let i = M(() => [...n(o).slice(10), ...n(a).slice(10)]);
					z($, {
						title: 'Recently Added',
						get items() {
							return n(i);
						}
					});
				}
				(l(_), f(r, e));
			};
		E(u, (r) => {
			n(c) ? r(x) : r(h, !1);
		});
	}
	(l(t), f(m, t), q());
}
export { le as component };
