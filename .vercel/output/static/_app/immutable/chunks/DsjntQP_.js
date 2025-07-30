import './DsnmJJEf.js';
import { i as B } from './BYgivT0n.js';
import {
	w as i,
	W as E,
	a8 as w,
	al as F,
	V as I,
	X as M,
	a3 as O,
	am as R,
	an as V,
	ao as q,
	ap as D,
	a2 as G,
	a1 as x,
	a0 as C,
	z as L,
	a7 as X,
	a6 as H,
	aq as J,
	p as K,
	ar as Q,
	a as S,
	b as U,
	u as W,
	aj as g,
	c as Y,
	s as Z,
	r as $,
	i as ee,
	j as te,
	g as y,
	as as ae,
	at as se
} from './DDdxbkju.js';
import { b as z, e as re, i as ne } from './6UcpBOQV.js';
import { l as A, p as _ } from './DWbhy1gE.js';
function ie(m, e, c, l, h) {
	i && E();
	var d = e.$$slots?.[c],
		r = !1;
	(d === !0 && ((d = e.children), (r = !0)), d === void 0 || d(m, r ? () => l : l));
}
function oe(m, e, c, l, h, d) {
	let r = i;
	i && E();
	var o,
		f,
		t = null;
	i && w.nodeType === F && ((t = w), E());
	var v = i ? w : m,
		a;
	(I(() => {
		const s = e() || null;
		var b = R;
		s !== o &&
			(a &&
				(s === null
					? X(a, () => {
							((a = null), (f = null));
						})
					: s === f
						? H(a)
						: J(a)),
			s &&
				s !== f &&
				(a = O(() => {
					if (((t = i ? t : document.createElementNS(b, s)), V(t, t), l)) {
						i && q(s) && t.append(document.createComment(''));
						var n = i ? D(t) : t.appendChild(G());
						(i && (n === null ? x(!1) : C(n)), l(t, n));
					}
					((L.nodes_end = t), v.before(t));
				})),
			(o = s),
			o && (f = o));
	}, M),
		r && (x(!0), C(v)));
}
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
 */ const le = {
	xmlns: 'http://www.w3.org/2000/svg',
	width: 24,
	height: 24,
	viewBox: '0 0 24 24',
	fill: 'none',
	stroke: 'currentColor',
	'stroke-width': 2,
	'stroke-linecap': 'round',
	'stroke-linejoin': 'round'
};
var de = Q('<svg><!><!></svg>');
function ge(m, e) {
	const c = A(e, ['children', '$$slots', '$$events', '$$legacy']),
		l = A(c, ['name', 'color', 'size', 'strokeWidth', 'absoluteStrokeWidth', 'iconNode']);
	K(e, !1);
	let h = _(e, 'name', 8, void 0),
		d = _(e, 'color', 8, 'currentColor'),
		r = _(e, 'size', 8, 24),
		o = _(e, 'strokeWidth', 8, 2),
		f = _(e, 'absoluteStrokeWidth', 8, !1),
		t = _(e, 'iconNode', 24, () => []);
	const v = (...n) => n.filter((u, k, p) => !!u && p.indexOf(u) === k).join(' ');
	B();
	var a = de();
	z(
		a,
		(n, u) => ({ ...le, ...l, width: r(), height: r(), stroke: d(), 'stroke-width': n, class: u }),
		[
			() => (g(f()), g(o()), g(r()), W(() => (f() ? (Number(o()) * 24) / Number(r()) : o()))),
			() => (g(h()), g(c), W(() => v('lucide-icon', 'lucide', h() ? `lucide-${h()}` : '', c.class)))
		]
	);
	var s = Y(a);
	re(s, 1, t, ne, (n, u) => {
		var k = ae(() => se(y(u), 2));
		let p = () => y(k)[0],
			T = () => y(k)[1];
		var N = ee(),
			j = te(N);
		(oe(j, p, !0, (P, fe) => {
			z(P, () => ({ ...T() }));
		}),
			S(n, N));
	});
	var b = Z(s);
	(ie(b, e, 'default', {}), $(a), S(m, a), U());
}
export { ge as I, ie as s };
