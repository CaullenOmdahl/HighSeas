import './DsnmJJEf.js';
import {
	i as A,
	j as q,
	a as v,
	d as B,
	p as D,
	f,
	c as i,
	s as d,
	r as s,
	t as m,
	k as x,
	b as E
} from './DDdxbkju.js';
import { i as k } from './pgvFQ5L2.js';
import { s as F, a as z } from './6UcpBOQV.js';
import { l as G, s as H, p as J } from './DWbhy1gE.js';
import './BYgivT0n.js';
import { I as K, s as L } from './DsjntQP_.js';
function O(c, t) {
	const u = G(t, ['children', '$$slots', '$$events', '$$legacy']);
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
	 */ const _ = [
		[
			'path',
			{ d: 'M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z' }
		]
	];
	K(
		c,
		H({ name: 'play' }, () => u, {
			get iconNode() {
				return _;
			},
			children: (r, o) => {
				var l = A(),
					h = q(l);
				(L(h, t, 'default', {}), v(r, l));
			},
			$$slots: { default: !0 }
		})
	);
}
var Q = f('<img class="w-full h-full object-cover" loading="lazy"/>'),
	R = f(
		'<div class="w-full h-full flex items-center justify-center text-gray-400"><div class="text-center"><div class="text-2xl mb-2">🎬</div> <div class="text-xs px-2"> </div></div></div>'
	),
	S = (c, t) => (window.location.href = `/watch/${t.item.id}`),
	T = f('<p class="text-xs text-gray-400 mt-1 line-clamp-2"> </p>'),
	U = f(
		'<div class="group relative cursor-pointer transform transition-transform hover:scale-105"><div><!> <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><button class="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"><!></button></div></div> <div class="mt-2"><h3 class="text-sm font-medium text-white truncate"> </h3> <!></div></div>'
	);
function et(c, t) {
	D(t, !0);
	let u = J(t, 'size', 3, 'medium');
	const _ = { small: 'w-32 h-48', medium: 'w-40 h-60', large: 'w-48 h-72' };
	var r = U(),
		o = i(r),
		l = i(o);
	{
		var h = (a) => {
				var e = Q();
				(m(() => {
					(z(e, 'src', t.item.poster), z(e, 'alt', t.item.name));
				}),
					v(a, e));
			},
			j = (a) => {
				var e = R(),
					n = i(e),
					y = d(i(n), 2),
					P = i(y, !0);
				(s(y), s(n), s(e), m(() => x(P, t.item.name)), v(a, e));
			};
		k(l, (a) => {
			t.item.poster ? a(h) : a(j, !1);
		});
	}
	var b = d(l, 2),
		p = i(b);
	p.__click = [S, t];
	var M = i(p);
	(O(M, { class: 'w-6 h-6 text-white', fill: 'white' }), s(p), s(b), s(o));
	var w = d(o, 2),
		g = i(w),
		C = i(g, !0);
	s(g);
	var I = d(g, 2);
	{
		var N = (a) => {
			var e = T(),
				n = i(e, !0);
			(s(e), m(() => x(n, t.item.description)), v(a, e));
		};
		k(I, (a) => {
			t.item.description && a(N);
		});
	}
	(s(w),
		s(r),
		m(() => {
			(F(o, 1, `${_[u()] ?? ''} relative overflow-hidden rounded-lg bg-gray-800`),
				x(C, t.item.name));
		}),
		v(c, r),
		E());
}
B(['click']);
export { et as M };
